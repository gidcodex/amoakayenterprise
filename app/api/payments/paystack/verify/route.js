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
     * The callback and webhook may run almost at the same time.
     * Continue even if payment is already successful because payout
     * records may still need to be created.
     */
    if (currentPayment?.status !== "SUCCESSFUL") {
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

      /*
       * Clear the customer cart only after successful payment.
       */
      await transactionClient.user.update({
        where: {
          id: userId,
        },
        data: {
          cart: {},
        },
      });
    }

    /*
     * Load the current payout allocation.
     */
    const payoutSettings =
      (await transactionClient.adminSettings.findFirst({
        select: {
          sellerInitialReleasePercent: true,
          sellerFinalReleasePercent: true,
          marketplaceCommissionPercent: true,
        },
      })) ||
      (await transactionClient.adminSettings.create({
        data: {},
        select: {
          sellerInitialReleasePercent: true,
          sellerFinalReleasePercent: true,
          marketplaceCommissionPercent: true,
        },
      }));

    /*
     * Load all seller orders linked to this customer payment.
     */
    const paidOrders =
      await transactionClient.order.findMany({
        where: {
          paymentId: payment.id,
          userId,
        },
        select: {
          id: true,
          storeId: true,
          trackingNumber: true,
          total: true,
          status: true,
          isPaid: true,

          store: {
            select: {
              businessVerified: true,
              paystackRecipientCode: true,
            },
          },
        },
      });

    /*
     * Create one payout record for every seller order.
     * One order belongs to one store, so each order gets one payout.
     */
    for (const order of paidOrders) {
      const grossAmount = Number(order.total || 0);

      const initialReleasePercent = Number(
        payoutSettings.sellerInitialReleasePercent || 0
      );

      const finalReleasePercent = Number(
        payoutSettings.sellerFinalReleasePercent || 0
      );

      const commissionPercent = Number(
        payoutSettings.marketplaceCommissionPercent || 0
      );

      const initialReleaseAmount = Number(
        (
          (grossAmount * initialReleasePercent) /
          100
        ).toFixed(2)
      );

      const finalReleaseAmount = Number(
        (
          (grossAmount * finalReleasePercent) /
          100
        ).toFixed(2)
      );

      /*
       * Calculate commission from the remainder to avoid
       * rounding differences.
       */
      const commissionAmount = Number(
        (
          grossAmount -
          initialReleaseAmount -
          finalReleaseAmount
        ).toFixed(2)
      );

      await transactionClient.sellerPayout.upsert({
        where: {
          orderId: order.id,
        },

        create: {
          orderId: order.id,
          storeId: order.storeId,

          grossAmount: grossAmount.toFixed(2),

          initialReleasePercent,
          finalReleasePercent,
          commissionPercent,

          initialReleaseAmount:
            initialReleaseAmount.toFixed(2),

          finalReleaseAmount:
            finalReleaseAmount.toFixed(2),

          commissionAmount:
            commissionAmount.toFixed(2),

          currency: "GHS",

          /*
           * Funds begin in HELD status.
           * Admin release rules will change the stage status later.
           */
          status: "HELD",
          initialTransferStatus: "HELD",
          finalTransferStatus: "HELD",

          paystackRecipientCode:
            order.store.paystackRecipientCode ||
            null,
        },

        update: {
          /*
           * Do not overwrite historical percentages or amounts.
           * Only refresh the recipient code if it is now available.
           */
          paystackRecipientCode:
            order.store.paystackRecipientCode ||
            undefined,
        },
      });
    }

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

          sellerPayout: {
            select: {
              id: true,
              status: true,
              initialReleaseAmount: true,
              finalReleaseAmount: true,
              commissionAmount: true,
            },
          },
        },
      });

    return {
      alreadyProcessed:
        currentPayment?.status === "SUCCESSFUL",
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