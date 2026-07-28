import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/*
|--------------------------------------------------------------------------
| GET SELLER REFUND REQUESTS
|--------------------------------------------------------------------------
*/

export async function GET(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json(
        { error: "Not authorized." },
        { status: 401 }
      );
    }

    const store = await prisma.store.findUnique({
      where: {
        userId,
      },
      select: {
        id: true,
        name: true,
        status: true,
        isActive: true,
      },
    });

    if (!store) {
      return NextResponse.json(
        { error: "Seller store not found." },
        { status: 404 }
      );
    }

    const refunds = await prisma.refundRequest.findMany({
      where: {
        storeId: store.id,
      },

      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },

        product: {
          select: {
            id: true,
            name: true,
            images: true,
          },
        },

        orderItem: {
          select: {
            id: true,
            quantity: true,
            price: true,
            variantId: true,
            variantName: true,
            variantValue: true,
            variantImage: true,
            variantImages: true,
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
            createdAt: true,

            address: {
              select: {
                name: true,
                email: true,
                phone: true,
                street: true,
                city: true,
                state: true,
                country: true,
              },
            },
          },
        },

        payment: {
          select: {
            id: true,
            provider: true,
            paymentMethod: true,
            providerReference: true,
            amount: true,
            currency: true,
            status: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      store,
      refunds,
    });
  } catch (error) {
    console.error("GET SELLER REFUNDS ERROR:", error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Failed to load seller refund requests.",
      },
      { status: 500 }
    );
  }
}

/*
|--------------------------------------------------------------------------
| SELLER REVIEWS REFUND REQUEST
|--------------------------------------------------------------------------
|
| The seller recommends approval or rejection.
| The administrator still makes the final decision.
|
*/

export async function PATCH(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json(
        { error: "Not authorized." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const refundId = String(body.refundId || "").trim();
    const decision = String(body.decision || "")
      .trim()
      .toUpperCase();
    const sellerNote = String(body.sellerNote || "").trim();

    if (!refundId) {
      return NextResponse.json(
        { error: "Refund request ID is required." },
        { status: 400 }
      );
    }

    if (!["APPROVE", "REJECT"].includes(decision)) {
      return NextResponse.json(
        {
          error:
            "Seller decision must be APPROVE or REJECT.",
        },
        { status: 400 }
      );
    }

    const store = await prisma.store.findUnique({
      where: {
        userId,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!store) {
      return NextResponse.json(
        { error: "Seller store not found." },
        { status: 404 }
      );
    }

    const existingRefund =
      await prisma.refundRequest.findFirst({
        where: {
          id: refundId,
          storeId: store.id,
        },

        include: {
          product: {
            select: {
              name: true,
            },
          },

          order: {
            select: {
              trackingNumber: true,
              status: true,
            },
          },
        },
      });

    if (!existingRefund) {
      return NextResponse.json(
        {
          error:
            "Refund request was not found for your store.",
        },
        { status: 404 }
      );
    }

    if (existingRefund.status !== "REQUESTED") {
      return NextResponse.json(
        {
          error:
            "This refund request has already been reviewed.",
        },
        { status: 400 }
      );
    }

    if (
      ["SHIPPED", "DELIVERED", "REFUNDED"].includes(
        existingRefund.order.status
      )
    ) {
      return NextResponse.json(
        {
          error:
            "This order can no longer be reviewed as a pre-shipment refund.",
        },
        { status: 400 }
      );
    }

    const reviewedRefund = await prisma.$transaction(
      async (tx) => {
        const updatedRefund =
          await tx.refundRequest.update({
            where: {
              id: existingRefund.id,
            },

            data: {
              sellerDecision: decision,
              sellerNote: sellerNote || null,
              sellerReviewedAt: new Date(),

              // Seller review is complete and now forwarded to admin.
              status: "UNDER_ADMIN_REVIEW",
            },

            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },

              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                },
              },

              orderItem: {
                select: {
                  id: true,
                  quantity: true,
                  price: true,
                  variantId: true,
                  variantName: true,
                  variantValue: true,
                  variantImage: true,
                  variantImages: true,
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
                  createdAt: true,
                },
              },

              payment: {
                select: {
                  id: true,
                  provider: true,
                  paymentMethod: true,
                  providerReference: true,
                  amount: true,
                  currency: true,
                  status: true,
                },
              },
            },
          });

        const readableDecision =
          decision === "APPROVE"
            ? "approval"
            : "rejection";

        await tx.notification.createMany({
          data: [
            {
              title: "Seller Reviewed Refund",
              message: `${store.name} recommended ${readableDecision} for ${existingRefund.product.name}. Order: ${
                existingRefund.order.trackingNumber ||
                existingRefund.orderId
              }.`,
              type: "REFUND",
              role: "ADMIN",
              link: "/admin/refunds",
            },

            {
              title: "Refund Request Reviewed",
              message:
                decision === "APPROVE"
                  ? `The seller recommended approval of your refund request for ${existingRefund.product.name}. It is now awaiting the administrator's final decision.`
                  : `The seller recommended rejection of your refund request for ${existingRefund.product.name}. It is now awaiting the administrator's final decision.`,
              type: "REFUND",
              role: "CUSTOMER",
              userId: existingRefund.userId,
              link: "/orders",
            },
          ],
        });

        return updatedRefund;
      }
    );

    return NextResponse.json({
      success: true,
      message:
        decision === "APPROVE"
          ? "Approval recommendation submitted to the administrator."
          : "Rejection recommendation submitted to the administrator.",
      refund: reviewedRefund,
    });
  } catch (error) {
    console.error("PATCH SELLER REFUND ERROR:", error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Failed to review the refund request.",
      },
      { status: 500 }
    );
  }
}