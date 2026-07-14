import prisma from "@/lib/prisma";
import { verifyPaystackTransaction } from "@/lib/payments/paystack";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/*
|--------------------------------------------------------------------------
| VERIFY PAYSTACK PAYMENT
|--------------------------------------------------------------------------
|
| Called by the Paystack callback page after the customer returns.
| This route independently confirms the transaction with Paystack before
| marking any order as paid.
|
*/
export async function GET(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json(
        { error: "You must be signed in to verify this payment." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("reference")?.trim();

    if (!reference) {
      return NextResponse.json(
        { error: "Payment reference is required." },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.findFirst({
      where: {
        userId,
        OR: [
          {
            clientReference: reference,
          },
          {
            providerReference: reference,
          },
        ],
      },
      include: {
        orders: {
          select: {
            id: true,
            total: true,
            isPaid: true,
            trackingNumber: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        {
          error:
            "Payment record was not found or does not belong to your account.",
        },
        { status: 404 }
      );
    }

    /*
     * Idempotency:
     * If this payment was already verified, do not process it again.
     */
    if (payment.status === "SUCCESSFUL") {
      return NextResponse.json({
        message: "Payment has already been verified.",
        status: "SUCCESSFUL",
        paymentId: payment.id,
        reference: payment.clientReference,
        orders: payment.orders,
      });
    }

    const paystackResponse =
      await verifyPaystackTransaction(reference);

    const transaction = paystackResponse?.data;

    if (!transaction) {
      return NextResponse.json(
        {
          error:
            "Paystack did not return transaction information.",
        },
        { status: 502 }
      );
    }

    const paystackStatus = transaction.status;
    const paystackReference = transaction.reference;
    const paystackCurrency = transaction.currency;
    const paystackAmount = Number(transaction.amount);

    /*
     * Payment.amount is stored in Ghana cedis.
     * Paystack returns the amount in pesewas.
     */
    const expectedAmountInPesewas = Math.round(
      Number(payment.amount) * 100
    );

    if (paystackReference !== payment.clientReference) {
      await markPaymentFailed(
        payment.id,
        "The Paystack transaction reference does not match the payment record.",
        paystackResponse
      );

      return NextResponse.json(
        {
          error: "Payment reference verification failed.",
          status: "FAILED",
        },
        { status: 400 }
      );
    }

    if (paystackCurrency !== "GHS") {
      await markPaymentFailed(
        payment.id,
        `Unexpected payment currency: ${paystackCurrency || "unknown"}.`,
        paystackResponse
      );

      return NextResponse.json(
        {
          error: "Payment currency verification failed.",
          status: "FAILED",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(paystackAmount) ||
      paystackAmount !== expectedAmountInPesewas
    ) {
      await markPaymentFailed(
        payment.id,
        `Payment amount mismatch. Expected ${expectedAmountInPesewas} pesewas but received ${paystackAmount}.`,
        paystackResponse
      );

      return NextResponse.json(
        {
          error: "Payment amount verification failed.",
          status: "FAILED",
        },
        { status: 400 }
      );
    }

    /*
     * A callback does not prove success.
     * The Paystack verification response must explicitly say "success".
     */
    if (paystackStatus !== "success") {
      const mappedStatus = mapPaystackStatus(paystackStatus);

      await prisma.payment.update({
        where: {
          id: payment.id,
        },
        data: {
          status: mappedStatus,
          providerResponse: paystackResponse,
          failureReason:
            mappedStatus === "FAILED"
              ? transaction.gateway_response ||
                transaction.message ||
                `Paystack payment status: ${paystackStatus}`
              : null,
        },
      });

      return NextResponse.json(
        {
          message: getStatusMessage(paystackStatus),
          status: mappedStatus,
          paymentId: payment.id,
          reference,
        },
        {
          status:
            mappedStatus === "PROCESSING" ? 202 : 400,
        }
      );
    }

    /*
     * Safely mark the payment and its connected orders as paid.
     */
    const result = await prisma.$transaction(
      async (transactionClient) => {
        const currentPayment =
          await transactionClient.payment.findUnique({
            where: {
              id: payment.id,
            },
            select: {
              status: true,
            },
          });

        /*
         * A webhook and callback could arrive at nearly the same time.
         * Prevent duplicate processing.
         */
        if (currentPayment?.status === "SUCCESSFUL") {
          return {
            alreadyProcessed: true,
          };
        }

        const updatedPayment =
          await transactionClient.payment.update({
            where: {
              id: payment.id,
            },
            data: {
              status: "SUCCESSFUL",
              providerReference:
                transaction.reference ||
                payment.clientReference,
              providerResponse: paystackResponse,
              failureReason: null,
              confirmedAt: new Date(),
            },
          });

        await transactionClient.order.updateMany({
          where: {
            paymentId: payment.id,
            userId,
            isPaid: false,
          },
          data: {
            isPaid: true,
          },
        });

          /* Clear the customer's cart only after
           * Paystack confirms the payment.
        */
         await transactionClient.user.update({
         where: {
             id: userId,
            },
             data: {
             cart: {},
            },
            });

        const updatedOrders =
          await transactionClient.order.findMany({
            where: {
              paymentId: payment.id,
              userId,
            },
            select: {
              id: true,
              trackingNumber: true,
              total: true,
              status: true,
              isPaid: true,
            },
          });

        return {
          alreadyProcessed: false,
          payment: updatedPayment,
          orders: updatedOrders,
        };
      }
    );

    return NextResponse.json({
      message: result.alreadyProcessed
        ? "Payment was already processed successfully."
        : "Payment verified successfully.",

      status: "SUCCESSFUL",
      paymentId: payment.id,
      reference: payment.clientReference,
      orders: result.orders || payment.orders,
    });
  } catch (error) {
    console.error("PAYSTACK VERIFICATION ERROR:", error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Failed to verify Paystack payment.",
      },
      { status: 500 }
    );
  }
}

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

async function markPaymentFailed(
  paymentId,
  failureReason,
  providerResponse
) {
  try {
    await prisma.payment.update({
      where: {
        id: paymentId,
      },
      data: {
        status: "FAILED",
        failureReason,
        providerResponse,
      },
    });
  } catch (error) {
    console.error(
      "FAILED TO MARK PAYMENT AS FAILED:",
      error
    );
  }
}

function mapPaystackStatus(status) {
  switch (status) {
    case "ongoing":
    case "pending":
    case "processing":
    case "queued":
      return "PROCESSING";

    case "success":
      return "SUCCESSFUL";

    case "abandoned":
      return "CANCELLED";

    case "failed":
    case "reversed":
    default:
      return "FAILED";
  }
}

function getStatusMessage(status) {
  switch (status) {
    case "ongoing":
    case "pending":
    case "processing":
    case "queued":
      return "Your payment is still being processed.";

    case "abandoned":
      return "The payment was not completed.";

    case "failed":
      return "The payment failed.";

    case "reversed":
      return "The payment was reversed.";

    default:
      return `Payment status: ${status || "unknown"}.`;
  }
}