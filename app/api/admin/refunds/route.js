import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/*
|--------------------------------------------------------------------------
| GET ALL MARKETPLACE REFUND REQUESTS
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

    const isAdmin = await authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Administrator access is required." },
        { status: 403 }
      );
    }

    const refunds = await prisma.refundRequest.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },

        store: {
          select: {
            id: true,
            name: true,
            logo: true,
            status: true,
            isActive: true,

            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },

        product: {
          select: {
            id: true,
            name: true,
            images: true,
            price: true,
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

            trackingEvents: {
              orderBy: {
                createdAt: "asc",
              },

              select: {
                id: true,
                status: true,
                actor: true,
                actorName: true,
                note: true,
                createdAt: true,
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
            createdAt: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    const summary = {
      total: refunds.length,

      pendingSellerReview: refunds.filter(
        (refund) => refund.status === "REQUESTED"
      ).length,

      pendingAdminReview: refunds.filter(
        (refund) =>
          refund.status === "UNDER_ADMIN_REVIEW" ||
          refund.status === "SELLER_REVIEWED"
      ).length,

      approved: refunds.filter(
        (refund) => refund.status === "APPROVED"
      ).length,

      rejected: refunds.filter(
        (refund) => refund.status === "REJECTED"
      ).length,

      processing: refunds.filter(
        (refund) => refund.status === "PROCESSING"
      ).length,

      refunded: refunds.filter(
        (refund) => refund.status === "REFUNDED"
      ).length,

      failed: refunds.filter(
        (refund) => refund.status === "FAILED"
      ).length,

      totalRequestedAmount: refunds.reduce(
        (total, refund) => total + Number(refund.amount || 0),
        0
      ),

      totalRefundedAmount: refunds
        .filter((refund) => refund.status === "REFUNDED")
        .reduce(
          (total, refund) =>
            total + Number(refund.amount || 0),
          0
        ),
    };

    return NextResponse.json({
      refunds,
      summary,
    });
  } catch (error) {
    console.error("GET ADMIN REFUNDS ERROR:", error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Failed to load marketplace refund requests.",
      },
      { status: 500 }
    );
  }
}

/*
|--------------------------------------------------------------------------
| ADMIN FINAL REFUND DECISION
|--------------------------------------------------------------------------
|
| APPROVE:
| The request becomes APPROVED.
| Payment-provider processing will be implemented afterward.
|
| REJECT:
| The request becomes REJECTED.
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

    const isAdmin = await authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Administrator access is required." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const refundId = String(body.refundId || "").trim();

    const decision = String(body.decision || "")
      .trim()
      .toUpperCase();

    const adminNote = String(body.adminNote || "").trim();

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
            "Admin decision must be APPROVE or REJECT.",
        },
        { status: 400 }
      );
    }

    if (decision === "REJECT" && !adminNote) {
      return NextResponse.json(
        {
          error:
            "Please provide a reason for rejecting the refund request.",
        },
        { status: 400 }
      );
    }

    const existingRefund =
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
            },
          },

          payment: {
            select: {
              id: true,
              provider: true,
              providerReference: true,
              status: true,
            },
          },
        },
      });

    if (!existingRefund) {
      return NextResponse.json(
        { error: "Refund request was not found." },
        { status: 404 }
      );
    }

    const finalStatuses = [
      "REJECTED",
      "REFUNDED",
      "CANCELLED",
    ];

    if (finalStatuses.includes(existingRefund.status)) {
      return NextResponse.json(
        {
          error:
            "This refund request has already received a final decision.",
        },
        { status: 400 }
      );
    }

    if (
      existingRefund.status === "PROCESSING" &&
      decision === "REJECT"
    ) {
      return NextResponse.json(
        {
          error:
            "A refund that is already processing cannot be rejected.",
        },
        { status: 400 }
      );
    }

    const updatedRefund = await prisma.$transaction(
      async (tx) => {
        const nextStatus =
          decision === "APPROVE"
            ? "APPROVED"
            : "REJECTED";

        const refund = await tx.refundRequest.update({
          where: {
            id: existingRefund.id,
          },

          data: {
            status: nextStatus,
            adminNote: adminNote || null,
            adminReviewedAt: new Date(),
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

            store: {
              select: {
                id: true,
                name: true,
                logo: true,

                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },

            product: {
              select: {
                id: true,
                name: true,
                images: true,
                price: true,
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

        const orderReference =
          existingRefund.order?.trackingNumber ||
          existingRefund.orderId;

        if (decision === "APPROVE") {
          await tx.notification.createMany({
            data: [
              {
                title: "Refund Approved",
                message: `Your refund request for ${existingRefund.product.name} has been approved. Order: ${orderReference}.`,
                type: "REFUND",
                role: "CUSTOMER",
                userId: existingRefund.userId,
                link: "/orders",
              },

              {
                title: "Customer Refund Approved",
                message: `The administrator approved the refund request for ${existingRefund.product.name}. Order: ${orderReference}.`,
                type: "REFUND",
                role: "SELLER",
                storeId: existingRefund.storeId,
                link: "/store/refunds",
              },
            ],
          });
        } else {
          await tx.notification.createMany({
            data: [
              {
                title: "Refund Request Rejected",
                message: `Your refund request for ${existingRefund.product.name} was rejected. Order: ${orderReference}.`,
                type: "REFUND",
                role: "CUSTOMER",
                userId: existingRefund.userId,
                link: "/orders",
              },

              {
                title: "Customer Refund Rejected",
                message: `The administrator rejected the refund request for ${existingRefund.product.name}. Order: ${orderReference}.`,
                type: "REFUND",
                role: "SELLER",
                storeId: existingRefund.storeId,
                link: "/store/refunds",
              },
            ],
          });
        }

        return refund;
      }
    );

    return NextResponse.json({
      success: true,

      message:
        decision === "APPROVE"
          ? "Refund request approved. It is now ready for payment-provider processing."
          : "Refund request rejected successfully.",

      refund: updatedRefund,
    });
  } catch (error) {
    console.error("PATCH ADMIN REFUND ERROR:", error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Failed to process the administrator's decision.",
      },
      { status: 500 }
    );
  }
}