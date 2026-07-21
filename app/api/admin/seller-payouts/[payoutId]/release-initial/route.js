import crypto from "node:crypto";
import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";
import { initiatePaystackTransfer } from "@/lib/payments/paystack-transfer";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request, context) {
  let payoutId = null;
  let attemptId = null;
  let transferReference = null;

  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json(
        { error: "Not authorized." },
        { status: 401 }
      );
    }

    const isAdmin = await authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Administrator access is required." },
        { status: 403 }
      );
    }

    const params = await context.params;
    payoutId = params?.payoutId;

    if (!payoutId) {
      return NextResponse.json(
        { error: "Payout ID is required." },
        { status: 400 }
      );
    }

    const payout = await prisma.sellerPayout.findUnique({
      where: {
        id: payoutId,
      },

      include: {
        order: {
          select: {
            id: true,
            trackingNumber: true,
            isPaid: true,
            paymentMethod: true,
            status: true,
          },
        },

        store: {
          select: {
            id: true,
            name: true,
            businessVerified: true,
            payoutMethod: true,
            payoutAccountName: true,
            payoutPhone: true,
            payoutNetwork: true,
            paystackRecipientCode: true,
          },
        },

        transferAttempts: {
          where: {
            stage: "INITIAL",
          },

          orderBy: {
            attemptNumber: "desc",
          },

          take: 1,

          select: {
            attemptNumber: true,
          },
        },
      },
    });

    if (!payout) {
      return NextResponse.json(
        { error: "Seller payout record was not found." },
        { status: 404 }
      );
    }

    if (!payout.order?.isPaid) {
      return NextResponse.json(
        {
          error:
            "The customer payment has not been confirmed.",
        },
        { status: 400 }
      );
    }

    if (!payout.store?.businessVerified) {
      return NextResponse.json(
        {
          error:
            "The seller must be verified before a payout can be released.",
        },
        { status: 400 }
      );
    }

    const recipientCode =
      payout.paystackRecipientCode ||
      payout.store.paystackRecipientCode;

    if (!recipientCode) {
      return NextResponse.json(
        {
          error:
            "The seller does not have a Paystack transfer recipient.",
        },
        { status: 400 }
      );
    }

    if (payout.initialTransferStatus === "PAID") {
      return NextResponse.json(
        {
          error:
            "The initial seller payout has already been completed.",
        },
        { status: 409 }
      );
    }

    if (
      payout.initialTransferStatus === "PROCESSING"
    ) {
      return NextResponse.json(
        {
          error:
            "The initial seller payout is already being processed.",
        },
        { status: 409 }
      );
    }

    if (
      payout.status === "PAID" ||
      payout.finalTransferStatus === "PAID"
    ) {
      return NextResponse.json(
        {
          error:
            "This seller payout has already been completed.",
        },
        { status: 409 }
      );
    }

    const amountInCedis = Number(
      payout.initialReleaseAmount
    );

    if (
      !Number.isFinite(amountInCedis) ||
      amountInCedis <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "The initial seller payout amount is invalid.",
        },
        { status: 400 }
      );
    }

    const amountInPesewas = Math.round(
      amountInCedis * 100
    );

    /*
     * If the payout failed before the transfer-attempt
     * table was created, start the next attempt at 2.
     */
    const latestAttemptNumber =
      payout.transferAttempts?.[0]
        ?.attemptNumber || 0;

    const attemptNumber =
      latestAttemptNumber > 0
        ? latestAttemptNumber + 1
        : payout.initialTransferReference
        ? 2
        : 1;

    /*
     * Every attempt receives a completely new reference.
     */
    transferReference = createTransferReference({
      stage: "INITIAL",
      payoutId: payout.id,
      attemptNumber,
    });

    /*
     * Lock the payout and create the audit row together.
     */
    const preparedAttempt = await prisma.$transaction(
      async (transactionClient) => {
        const locked =
          await transactionClient.sellerPayout.updateMany({
            where: {
              id: payout.id,

              initialTransferStatus: {
                in: [
                  "HELD",
                  "ELIGIBLE",
                  "APPROVED",
                  "FAILED",
                  "REVERSED",
                  "CANCELLED",
                ],
              },
            },

            data: {
              status: "PROCESSING",
              initialTransferStatus: "PROCESSING",
              initialTransferReference:
                transferReference,
              initialTransferCode: null,
              initialReleasedBy: userId,
              initialFailureReason: null,
              initialProviderResponse: null,
              paystackRecipientCode: recipientCode,
            },
          });

        if (locked.count !== 1) {
          throw new Error(
            "This payout is already being processed or is no longer eligible."
          );
        }

        return transactionClient.sellerPayoutTransferAttempt.create({
          data: {
            sellerPayoutId: payout.id,
            stage: "INITIAL",
            attemptNumber,

            amount: amountInCedis.toFixed(2),
            currency: "GHS",

            status: "PROCESSING",

            transferReference,
            transferCode: null,

            recipientCode,
            initiatedBy: userId,

            providerResponse: null,
            failureReason: null,
          },
        });
      }
    );

    attemptId = preparedAttempt.id;

    try {
      const paystackResponse =
        await initiatePaystackTransfer({
          amount: amountInPesewas,
          recipientCode,
          reference: transferReference,

          reason: `Initial seller payout for ${
            payout.order.trackingNumber ||
            payout.order.id
          }`,
        });

      const transfer = paystackResponse?.data;

      if (!transfer) {
        throw new Error(
          "Paystack did not return transfer information."
        );
      }

      const paystackStatus = String(
        transfer.status || "pending"
      ).toLowerCase();

      const transferCode =
        transfer.transfer_code || null;

      const returnedReference =
        transfer.reference || transferReference;

      /*
       * Paystack accepting the transfer does not yet mean
       * the seller has received the money.
       */
      await prisma.$transaction(
        async (transactionClient) => {
          await transactionClient.sellerPayoutTransferAttempt.update({
            where: {
              id: attemptId,
            },

            data: {
              status: "PROCESSING",
              transferReference:
                returnedReference,
              transferCode,
              providerResponse:
                paystackResponse,
              failureReason: null,
            },
          });

          await transactionClient.sellerPayout.update({
            where: {
              id: payout.id,
            },

            data: {
              status: "PROCESSING",
              initialTransferStatus:
                "PROCESSING",
              initialTransferReference:
                returnedReference,
              initialTransferCode:
                transferCode,
              initialProviderResponse:
                paystackResponse,
              initialFailureReason: null,
            },
          });
        }
      );

      await prisma.notification.createMany({
        data: [
          {
            title: "Initial Seller Payout Started",

            message: `${formatMoney(
              amountInCedis
            )} is being processed for ${
              payout.store.name
            }.`,

            type: "STORE",
            role: "ADMIN",
            storeId: payout.store.id,
            link: "/admin/seller-payouts",
          },

          {
            title: "Seller Payout Processing",

            message: `Your initial payout of ${formatMoney(
              amountInCedis
            )} for order ${
              payout.order.trackingNumber ||
              payout.order.id
            } is being processed.`,

            type: "STORE",
            role: "SELLER",
            storeId: payout.store.id,
            link: "/store/payout-settings",
          },
        ],
      });

      return NextResponse.json({
        message:
          paystackStatus === "otp"
            ? "Paystack requires transfer authorization. The payout remains in processing."
            : "Initial seller payout submitted to Paystack successfully.",

        attempt: {
          id: attemptId,
          attemptNumber,
          status: "PROCESSING",
          reference: returnedReference,
          transferCode,
          amount: amountInCedis,
        },

        transfer: {
          status: paystackStatus,
          reference: returnedReference,
          transferCode,
        },
      });
    } catch (paystackError) {
      const failureReason =
        paystackError?.message ||
        "Paystack transfer initiation failed.";

      await prisma.$transaction(
        async (transactionClient) => {
          if (attemptId) {
            await transactionClient.sellerPayoutTransferAttempt.update({
              where: {
                id: attemptId,
              },

              data: {
                status: "FAILED",
                failureReason,
                failedAt: new Date(),
              },
            });
          }

          await transactionClient.sellerPayout.update({
            where: {
              id: payout.id,
            },

            data: {
              status: "FAILED",
              initialTransferStatus: "FAILED",
              initialTransferReference:
                transferReference,
              initialTransferCode: null,
              initialFailureReason:
                failureReason,
            },
          });
        }
      );

      throw paystackError;
    }
  } catch (error) {
    console.error(
      "RELEASE INITIAL SELLER PAYOUT ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Failed to release the initial seller payout.",
      },
      {
        status:
          error?.message?.includes(
            "already being processed"
          ) ||
          error?.message?.includes(
            "no longer eligible"
          )
            ? 409
            : 500,
      }
    );
  }
}

function createTransferReference({
  stage,
  payoutId,
  attemptNumber,
}) {
  const randomPart = crypto
    .randomBytes(6)
    .toString("hex")
    .toUpperCase();

  return `AMK-${stage}-A${attemptNumber}-${Date.now()}-${payoutId.slice(
    -6
  )}-${randomPart}`;
}

function formatMoney(value) {
  return `GH₵${Number(value || 0).toFixed(2)}`;
}