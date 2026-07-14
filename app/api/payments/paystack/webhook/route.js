import crypto from "node:crypto";
import prisma from "@/lib/prisma";
import { verifyPaystackTransaction } from "@/lib/payments/paystack";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    /*
    |--------------------------------------------------------------------------
    | 1. READ THE RAW BODY
    |--------------------------------------------------------------------------
    |
    | Do not call request.json() before verifying the signature.
    |
    */
    const rawBody = await request.text();

    const paystackSignature = request.headers.get(
      "x-paystack-signature"
    );

    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      console.error(
        "PAYSTACK_SECRET_KEY is missing from environment variables."
      );

      return NextResponse.json(
        { error: "Payment configuration error." },
        { status: 500 }
      );
    }

    if (!paystackSignature) {
      return NextResponse.json(
        { error: "Missing Paystack signature." },
        { status: 401 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 2. VERIFY PAYSTACK SIGNATURE
    |--------------------------------------------------------------------------
    */
    const expectedSignature = crypto
      .createHmac("sha512", secretKey)
      .update(rawBody)
      .digest("hex");

    const signaturesMatch = safeCompare(
      expectedSignature,
      paystackSignature
    );

    if (!signaturesMatch) {
      console.error("Invalid Paystack webhook signature.");

      return NextResponse.json(
        { error: "Invalid webhook signature." },
        { status: 401 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 3. PARSE THE VERIFIED EVENT
    |--------------------------------------------------------------------------
    */
    let event;

    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: "Invalid webhook payload." },
        { status: 400 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 4. ACKNOWLEDGE EVENTS WE DO NOT CURRENTLY HANDLE
    |--------------------------------------------------------------------------
    */
    if (event?.event !== "charge.success") {
      return NextResponse.json({
        received: true,
        ignored: true,
        event: event?.event || "unknown",
      });
    }

    const eventTransaction = event?.data;
    const reference = eventTransaction?.reference;

    if (!reference) {
      return NextResponse.json(
        { error: "Webhook transaction reference is missing." },
        { status: 400 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 5. FIND THE LOCAL PAYMENT
    |--------------------------------------------------------------------------
    */
    const payment = await prisma.payment.findFirst({
      where: {
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
            userId: true,
            total: true,
            isPaid: true,
          },
        },
      },
    });

    /*
     * Returning 200 prevents repeated delivery for transactions that are not
     * associated with this application.
     */
    if (!payment) {
      console.error(
        `Paystack webhook payment not found: ${reference}`
      );

      return NextResponse.json({
        received: true,
        ignored: true,
        reason: "Payment record not found.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | 6. IDEMPOTENCY
    |--------------------------------------------------------------------------
    */
    if (payment.status === "SUCCESSFUL") {
      return NextResponse.json({
        received: true,
        alreadyProcessed: true,
        paymentId: payment.id,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | 7. VERIFY THE TRANSACTION DIRECTLY WITH PAYSTACK
    |--------------------------------------------------------------------------
    |
    | The signed webhook is important, but we additionally query Paystack
    | before marking the orders as paid.
    |
    */
    const paystackResponse =
      await verifyPaystackTransaction(reference);

    const verifiedTransaction = paystackResponse?.data;

    if (!verifiedTransaction) {
      throw new Error(
        "Paystack verification returned no transaction data."
      );
    }

    const verifiedReference =
      verifiedTransaction.reference;

    const verifiedStatus =
      verifiedTransaction.status;

    const verifiedCurrency =
      verifiedTransaction.currency;

    const verifiedAmount = Number(
      verifiedTransaction.amount
    );

    const expectedAmountInPesewas = Math.round(
      Number(payment.amount) * 100
    );

    /*
    |--------------------------------------------------------------------------
    | 8. VERIFY REFERENCE, STATUS, CURRENCY AND AMOUNT
    |--------------------------------------------------------------------------
    */
    if (
      verifiedReference !== payment.clientReference
    ) {
      await markPaymentFailed({
        paymentId: payment.id,
        failureReason:
          "Paystack webhook reference did not match the local payment reference.",
        providerResponse: paystackResponse,
        callbackPayload: event,
      });

      return NextResponse.json(
        {
          error:
            "Transaction reference verification failed.",
        },
        { status: 400 }
      );
    }

    if (verifiedStatus !== "success") {
      const mappedStatus = mapPaystackStatus(
        verifiedStatus
      );

      await prisma.payment.update({
        where: {
          id: payment.id,
        },

        data: {
          status: mappedStatus,
          providerResponse: paystackResponse,
          callbackPayload: event,

          failureReason:
            mappedStatus === "FAILED"
              ? verifiedTransaction.gateway_response ||
                verifiedTransaction.message ||
                `Paystack status: ${verifiedStatus}`
              : null,
        },
      });

      return NextResponse.json({
        received: true,
        processed: false,
        status: mappedStatus,
      });
    }

    if (verifiedCurrency !== "GHS") {
      await markPaymentFailed({
        paymentId: payment.id,
        failureReason: `Expected GHS but received ${
          verifiedCurrency || "unknown"
        }.`,
        providerResponse: paystackResponse,
        callbackPayload: event,
      });

      return NextResponse.json(
        {
          error: "Transaction currency verification failed.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(verifiedAmount) ||
      verifiedAmount !== expectedAmountInPesewas
    ) {
      await markPaymentFailed({
        paymentId: payment.id,

        failureReason:
          `Expected ${expectedAmountInPesewas} pesewas ` +
          `but received ${verifiedAmount}.`,

        providerResponse: paystackResponse,
        callbackPayload: event,
      });

      return NextResponse.json(
        {
          error: "Transaction amount verification failed.",
        },
        { status: 400 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 9. MARK PAYMENT AND ORDERS AS PAID
    |--------------------------------------------------------------------------
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
         * The callback page and webhook may process the same payment at nearly
         * the same time.
         */
        if (currentPayment?.status === "SUCCESSFUL") {
          return {
            alreadyProcessed: true,
          };
        }

        await transactionClient.payment.update({
          where: {
            id: payment.id,
          },

          data: {
            status: "SUCCESSFUL",

            providerReference:
              verifiedTransaction.reference,

            providerResponse: paystackResponse,
            callbackPayload: event,

            failureReason: null,
            confirmedAt: new Date(),
          },
        });

        const updatedOrders =
          await transactionClient.order.updateMany({
            where: {
              paymentId: payment.id,
              isPaid: false,
            },

            data: {
              isPaid: true,
            },
          });

          /*
          * Clear the buyer's cart when the webhook
          * confirms successful payment.
          */
            await transactionClient.user.update({
              where: {
                id: payment.userId,
              },
                data: {
                cart: {},
             },
           });

        return {
          alreadyProcessed: false,
          updatedOrders: updatedOrders.count,
        };
      }
    );

    return NextResponse.json({
      received: true,
      processed: true,
      alreadyProcessed:
        result.alreadyProcessed || false,
      updatedOrders: result.updatedOrders || 0,
      paymentId: payment.id,
    });
  } catch (error) {
    console.error("PAYSTACK WEBHOOK ERROR:", error);

    /*
     * Return 500 when a genuine processing error occurs so Paystack can retry
     * webhook delivery.
     */
    return NextResponse.json(
      {
        error:
          error?.message ||
          "Failed to process Paystack webhook.",
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

function safeCompare(expectedSignature, receivedSignature) {
  try {
    const expectedBuffer = Buffer.from(
      expectedSignature,
      "utf8"
    );

    const receivedBuffer = Buffer.from(
      receivedSignature,
      "utf8"
    );

    if (
      expectedBuffer.length !== receivedBuffer.length
    ) {
      return false;
    }

    return crypto.timingSafeEqual(
      expectedBuffer,
      receivedBuffer
    );
  } catch {
    return false;
  }
}

async function markPaymentFailed({
  paymentId,
  failureReason,
  providerResponse,
  callbackPayload,
}) {
  try {
    await prisma.payment.update({
      where: {
        id: paymentId,
      },

      data: {
        status: "FAILED",
        failureReason,
        providerResponse,
        callbackPayload,
      },
    });
  } catch (error) {
    console.error(
      "FAILED TO UPDATE PAYMENT RECORD:",
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