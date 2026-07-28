import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const PAYSTACK_REFUND_URL = "https://api.paystack.co/refund";

export async function POST(request) {
  let refundId = null;

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

    const body = await request.json();

    refundId = String(body.refundId || "").trim();

    if (!refundId) {
      return NextResponse.json(
        { error: "Refund request ID is required." },
        { status: 400 }
      );
    }

    const paystackSecretKey =
      process.env.PAYSTACK_SECRET_KEY;

    if (!paystackSecretKey) {
      return NextResponse.json(
        {
          error:
            "PAYSTACK_SECRET_KEY is not configured on the server.",
        },
        { status: 500 }
      );
    }

    const refundRequest =
      await prisma.refundRequest.findUnique({
        where: {
          id: refundId,
        },

        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },

          store: {
            select: {
              id: true,
              name: true,
            },
          },

          product: {
            select: {
              id: true,
              name: true,
            },
          },

          order: {
            select: {
              id: true,
              trackingNumber: true,
              status: true,
              paymentMethod: true,
              isPaid: true,
              total: true,
            },
          },

          payment: {
            select: {
              id: true,
              provider: true,
              providerReference: true,
              paymentMethod: true,
              amount: true,
              currency: true,
              status: true,
            },
          },
        },
      });

    if (!refundRequest) {
      return NextResponse.json(
        { error: "Refund request was not found." },
        { status: 404 }
      );
    }

    if (refundRequest.status === "REFUNDED") {
      return NextResponse.json(
        {
          error:
            "This refund request has already been completed.",
        },
        { status: 400 }
      );
    }

    if (refundRequest.status === "PROCESSING") {
      return NextResponse.json(
        {
          error:
            "This refund is already being processed. Wait for the Paystack webhook confirmation.",
        },
        { status: 409 }
      );
    }

    if (refundRequest.status !== "APPROVED") {
      return NextResponse.json(
        {
          error:
            "Only an approved refund request can be submitted to Paystack.",
        },
        { status: 400 }
      );
    }

    const paymentMethod =
      refundRequest.paymentMethod ||
      refundRequest.payment?.paymentMethod ||
      refundRequest.order?.paymentMethod;

    if (paymentMethod !== "PAYSTACK") {
      return NextResponse.json(
        {
          error:
            "This endpoint can only process Paystack refunds.",
        },
        { status: 400 }
      );
    }

    if (!refundRequest.order?.isPaid) {
      return NextResponse.json(
        {
          error:
            "This order is not recorded as paid and cannot be refunded automatically.",
        },
        { status: 400 }
      );
    }

    const transactionReference =
      refundRequest.payment?.providerReference ||
      refundRequest.providerReference;

    if (!transactionReference) {
      return NextResponse.json(
        {
          error:
            "The original Paystack transaction reference is missing.",
        },
        { status: 400 }
      );
    }

    if (refundRequest.providerRefundId) {
      return NextResponse.json(
        {
          error:
            "A Paystack refund has already been created for this request. Wait for its final status instead of creating another refund.",
        },
        { status: 409 }
      );
    }

    const refundAmount = Number(refundRequest.amount);

    if (
      !Number.isFinite(refundAmount) ||
      refundAmount <= 0
    ) {
      return NextResponse.json(
        {
          error: "The refund amount is invalid.",
        },
        { status: 400 }
      );
    }

    const originalPaymentAmount = Number(
      refundRequest.payment?.amount || 0
    );

    if (
      originalPaymentAmount > 0 &&
      refundAmount > originalPaymentAmount
    ) {
      return NextResponse.json(
        {
          error:
            "The refund amount cannot be greater than the original payment amount.",
        },
        { status: 400 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Convert GHS to pesewas
    |--------------------------------------------------------------------------
    |
    | GH₵150.50 becomes 15050.
    |
    */

    const amountInSubunit = Math.round(
      refundAmount * 100
    );

    const currency = String(
      refundRequest.currency ||
        refundRequest.payment?.currency ||
        "GHS"
    ).toUpperCase();

    const customerNote =
      refundRequest.reason ||
      `Refund for ${refundRequest.product.name}`;

    const merchantNote = [
      `Amoakay Deals refund request ${refundRequest.id}.`,
      `Order ${
        refundRequest.order?.trackingNumber ||
        refundRequest.orderId
      }.`,
      refundRequest.adminNote
        ? `Admin note: ${refundRequest.adminNote}`
        : null,
    ]
      .filter(Boolean)
      .join(" ");

    /*
    |--------------------------------------------------------------------------
    | Lock the refund before contacting Paystack
    |--------------------------------------------------------------------------
    |
    | updateMany ensures that only a request still in APPROVED status can
    | move to PROCESSING. This reduces duplicate submissions caused by
    | repeated clicks.
    |
    */

    const lockResult =
      await prisma.refundRequest.updateMany({
        where: {
          id: refundRequest.id,
          status: "APPROVED",
          providerRefundId: null,
        },

        data: {
          status: "PROCESSING",
          provider: "PAYSTACK",
          providerReference: transactionReference,
          providerStatus: "initiating",
          failureReason: null,
          processedAt: new Date(),
          lastRefundAttemptAt: new Date(),
          refundAttemptCount: {
            increment: 1,
          },
        },
      });

    if (lockResult.count !== 1) {
      return NextResponse.json(
        {
          error:
            "This refund request is already being processed or has changed status.",
        },
        { status: 409 }
      );
    }

    let paystackResponse;
    let paystackData;

    try {
      paystackResponse = await fetch(
        PAYSTACK_REFUND_URL,
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${paystackSecretKey}`,
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },

          body: JSON.stringify({
            transaction: transactionReference,
            amount: amountInSubunit,
            currency,
            customer_note: customerNote.slice(0, 500),
            merchant_note: merchantNote.slice(0, 500),
          }),

          cache: "no-store",
        }
      );

      paystackData = await paystackResponse.json();
    } catch (providerError) {
      await prisma.refundRequest.update({
        where: {
          id: refundRequest.id,
        },

        data: {
          status: "FAILED",
          providerStatus: "request_failed",
          failureReason:
            providerError?.message ||
            "Could not connect to Paystack.",
          providerResponse: {
            error:
              providerError?.message ||
              "Could not connect to Paystack.",
          },
        },
      });

      return NextResponse.json(
        {
          error:
            "The refund request could not be sent to Paystack.",
        },
        { status: 502 }
      );
    }

    if (
      !paystackResponse.ok ||
      !paystackData?.status ||
      !paystackData?.data
    ) {
      const providerMessage =
        paystackData?.message ||
        "Paystack rejected the refund request.";

      const failedRefund =
        await prisma.refundRequest.update({
          where: {
            id: refundRequest.id,
          },

          data: {
            status: "FAILED",
            providerStatus:
              paystackData?.data?.status ||
              "failed",
            providerResponse: paystackData,
            failureReason: providerMessage,
          },
        });

      return NextResponse.json(
        {
          error: providerMessage,
          refund: failedRefund,
        },
        {
          status:
            paystackResponse.status >= 400
              ? paystackResponse.status
              : 400,
        }
      );
    }

    const providerRefund =
      paystackData.data;

    const providerRefundId = String(
      providerRefund.id
    );

    const providerStatus = String(
      providerRefund.status || "pending"
    ).toLowerCase();

    /*
    |--------------------------------------------------------------------------
    | Do not mark REFUNDED here
    |--------------------------------------------------------------------------
    |
    | Paystack normally queues the refund. The final REFUNDED status will be
    | set only after refund.processed is received through the webhook.
    |
    */

    const updatedRefund =
      await prisma.$transaction(async (tx) => {
        const refund =
          await tx.refundRequest.update({
            where: {
              id: refundRequest.id,
            },

            data: {
              status: "PROCESSING",
              provider: "PAYSTACK",
              providerReference:
                providerRefund.transaction
                  ?.reference ||
                transactionReference,
              providerRefundId,
              providerStatus,
              providerResponse: paystackData,
              failureReason: null,
              processedAt:
                refundRequest.processedAt ||
                new Date(),
            },

            include: {
              user: true,
              store: true,
              product: true,
              order: true,
              payment: true,
              orderItem: true,
            },
          });

        const orderReference =
          refundRequest.order?.trackingNumber ||
          refundRequest.orderId;

        await tx.notification.createMany({
          data: [
            {
              title: "Refund Processing",
              message: `Your refund for ${refundRequest.product.name} has been submitted to Paystack. Order: ${orderReference}.`,
              type: "REFUND",
              role: "CUSTOMER",
              userId: refundRequest.userId,
              link: "/orders",
            },

            {
              title: "Refund Submitted to Paystack",
              message: `The approved refund for ${refundRequest.product.name} is now being processed. Order: ${orderReference}.`,
              type: "REFUND",
              role: "SELLER",
              storeId: refundRequest.storeId,
              link: "/store/refunds",
            },
          ],
        });

        return refund;
      });

    return NextResponse.json({
      success: true,
      message:
        "The refund was submitted to Paystack and is awaiting final confirmation.",
      refund: updatedRefund,
      providerStatus,
    });
  } catch (error) {
    console.error(
      "PROCESS PAYSTACK REFUND ERROR:",
      error
    );

    /*
    |--------------------------------------------------------------------------
    | Do not blindly overwrite completed refunds
    |--------------------------------------------------------------------------
    */

    if (refundId) {
      try {
        await prisma.refundRequest.updateMany({
          where: {
            id: refundId,
            status: "PROCESSING",
            providerRefundId: null,
          },

          data: {
            status: "FAILED",
            providerStatus: "internal_error",
            failureReason:
              error?.message ||
              "An internal refund-processing error occurred.",
          },
        });
      } catch (databaseError) {
        console.error(
          "FAILED TO SAVE REFUND ERROR:",
          databaseError
        );
      }
    }

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Failed to process the Paystack refund.",
      },
      { status: 500 }
    );
  }
}