import crypto from "node:crypto";
import prisma from "@/lib/prisma";
import { verifyPaystackTransaction } from "@/lib/payments/paystack";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    /*
    |--------------------------------------------------------------------------
    | 1. READ RAW WEBHOOK BODY
    |--------------------------------------------------------------------------
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
    | 2. VERIFY WEBHOOK SIGNATURE
    |--------------------------------------------------------------------------
    */
    const expectedSignature = crypto
      .createHmac("sha512", secretKey)
      .update(rawBody)
      .digest("hex");

    if (
      !safeCompare(
        expectedSignature,
        paystackSignature
      )
    ) {
      console.error(
        "Invalid Paystack webhook signature."
      );

      return NextResponse.json(
        { error: "Invalid webhook signature." },
        { status: 401 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 3. PARSE VERIFIED EVENT
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
    | 4. HANDLE ONLY SUCCESSFUL PAYMENT EVENTS
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
        {
          error:
            "Webhook transaction reference is missing.",
        },
        { status: 400 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 5. FIND LOCAL PAYMENT RECORD
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
            storeId: true,
            total: true,
            isPaid: true,
          },
        },
      },
    });

    /*
     * Return 200 so Paystack does not repeatedly retry
     * an unrelated or deleted payment.
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
    | 6. VERIFY TRANSACTION DIRECTLY WITH PAYSTACK
    |--------------------------------------------------------------------------
    */
    const paystackResponse =
      await verifyPaystackTransaction(reference);

    const verifiedTransaction =
      paystackResponse?.data;

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
    | 7. VERIFY REFERENCE
    |--------------------------------------------------------------------------
    */
    if (
      verifiedReference !==
      payment.clientReference
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

    /*
    |--------------------------------------------------------------------------
    | 8. VERIFY PAYMENT STATUS
    |--------------------------------------------------------------------------
    */
    if (verifiedStatus !== "success") {
      const mappedStatus =
        mapPaystackStatus(verifiedStatus);

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

    /*
    |--------------------------------------------------------------------------
    | 9. VERIFY CURRENCY
    |--------------------------------------------------------------------------
    */
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
          error:
            "Transaction currency verification failed.",
        },
        { status: 400 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 10. VERIFY AMOUNT
    |--------------------------------------------------------------------------
    */
    if (
      !Number.isInteger(verifiedAmount) ||
      verifiedAmount !==
        expectedAmountInPesewas
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
          error:
            "Transaction amount verification failed.",
        },
        { status: 400 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 11. MARK PAYMENT PAID AND CREATE SELLER PAYOUT RECORDS
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

        const alreadyProcessed =
          currentPayment?.status === "SUCCESSFUL";

        /*
         * Only repeat payment/order updates when they have
         * not already been successfully processed.
         */
        if (!alreadyProcessed) {
          await transactionClient.payment.update({
            where: {
              id: payment.id,
            },

            data: {
              status: "SUCCESSFUL",

              providerReference:
                verifiedTransaction.reference,

              providerResponse:
                paystackResponse,

              callbackPayload: event,

              failureReason: null,
              confirmedAt: new Date(),
            },
          });

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
           * Clear the customer's cart after successful
           * server-side payment confirmation.
           */
          await transactionClient.user.update({
            where: {
              id: payment.userId,
            },

            data: {
              cart: {},
            },
          });
        } else {
          /*
           * Store the latest valid webhook payload even when
           * the callback processed the payment first.
           */
          await transactionClient.payment.update({
            where: {
              id: payment.id,
            },

            data: {
              callbackPayload: event,
              providerResponse:
                paystackResponse,
            },
          });
        }

        /*
        |--------------------------------------------------------------------------
        | LOAD CURRENT MARKETPLACE PAYOUT SETTINGS
        |--------------------------------------------------------------------------
        */
        let payoutSettings =
          await transactionClient.adminSettings.findFirst({
            select: {
              sellerInitialReleasePercent: true,
              sellerFinalReleasePercent: true,
              marketplaceCommissionPercent: true,
            },
          });

        if (!payoutSettings) {
          payoutSettings =
            await transactionClient.adminSettings.create({
              data: {},

              select: {
                sellerInitialReleasePercent: true,
                sellerFinalReleasePercent: true,
                marketplaceCommissionPercent: true,
              },
            });
        }

        const initialReleasePercent = Number(
          payoutSettings.sellerInitialReleasePercent ||
            0
        );

        const finalReleasePercent = Number(
          payoutSettings.sellerFinalReleasePercent ||
            0
        );

        const commissionPercent = Number(
          payoutSettings.marketplaceCommissionPercent ||
            0
        );

        const allocationTotal = Number(
          (
            initialReleasePercent +
            finalReleasePercent +
            commissionPercent
          ).toFixed(2)
        );

        if (allocationTotal !== 100) {
          throw new Error(
            `Marketplace payout allocation must total 100%. Current total: ${allocationTotal}%.`
          );
        }

        /*
        |--------------------------------------------------------------------------
        | LOAD ALL SELLER ORDERS CONNECTED TO THIS PAYMENT
        |--------------------------------------------------------------------------
        */
        const paidOrders =
          await transactionClient.order.findMany({
            where: {
              paymentId: payment.id,
              userId: payment.userId,
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

        let payoutRecordsCreated = 0;

        /*
        |--------------------------------------------------------------------------
        | CREATE ONE PAYOUT RECORD PER SELLER ORDER
        |--------------------------------------------------------------------------
        */
        for (const order of paidOrders) {
          const grossAmount = Number(
            order.total || 0
          );

          if (
            !Number.isFinite(grossAmount) ||
            grossAmount <= 0
          ) {
            throw new Error(
              `Invalid payout amount for order ${order.id}.`
            );
          }

          const initialReleaseAmount = Number(
            (
              (grossAmount *
                initialReleasePercent) /
              100
            ).toFixed(2)
          );

          const finalReleaseAmount = Number(
            (
              (grossAmount *
                finalReleasePercent) /
              100
            ).toFixed(2)
          );

          /*
           * Calculate commission as the remainder so small
           * rounding differences do not cause the allocation
           * to exceed or fall below the order total.
           */
          const commissionAmount = Number(
            (
              grossAmount -
              initialReleaseAmount -
              finalReleaseAmount
            ).toFixed(2)
          );

          const existingPayout =
            await transactionClient.sellerPayout.findUnique({
              where: {
                orderId: order.id,
              },

              select: {
                id: true,
              },
            });

          await transactionClient.sellerPayout.upsert({
            where: {
              orderId: order.id,
            },

            create: {
              orderId: order.id,
              storeId: order.storeId,

              grossAmount:
                grossAmount.toFixed(2),

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

              status: "HELD",

              initialTransferStatus:
                "HELD",

              finalTransferStatus:
                "HELD",

              paystackRecipientCode:
                order.store
                  ?.paystackRecipientCode || null,
            },

            update: order.store
              ?.paystackRecipientCode
              ? {
                  paystackRecipientCode:
                    order.store
                      .paystackRecipientCode,
                }
              : {},
          });

          if (!existingPayout) {
            payoutRecordsCreated += 1;
          }
        }

        const updatedOrders =
          await transactionClient.order.findMany({
            where: {
              paymentId: payment.id,
              userId: payment.userId,
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

                  initialReleasePercent: true,
                  initialReleaseAmount: true,
                  initialTransferStatus: true,

                  finalReleasePercent: true,
                  finalReleaseAmount: true,
                  finalTransferStatus: true,

                  commissionPercent: true,
                  commissionAmount: true,
                },
              },
            },
          });

        return {
          alreadyProcessed,
          updatedOrders: updatedOrders.length,
          payoutRecordsCreated,
          orders: updatedOrders,
        };
      }
    );

    return NextResponse.json({
      received: true,
      processed: true,

      alreadyProcessed:
        result.alreadyProcessed,

      updatedOrders:
        result.updatedOrders,

      payoutRecordsCreated:
        result.payoutRecordsCreated,

      paymentId: payment.id,
    });
  } catch (error) {
    console.error(
      "PAYSTACK WEBHOOK ERROR:",
      error
    );

    /*
     * Returning 500 allows Paystack to retry a genuine
     * webhook-processing failure.
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

function safeCompare(
  expectedSignature,
  receivedSignature
) {
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
      expectedBuffer.length !==
      receivedBuffer.length
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