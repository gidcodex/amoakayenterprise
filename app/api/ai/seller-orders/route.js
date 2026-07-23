import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const VALID_STATUSES = [
  "ORDER_PLACED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
];

/*
 * Converts common conversational status words
 * into the values used by the OrderStatus enum.
 */
const normalizeOrderStatus = (value = "") => {
  const status = String(value)
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  const statusMap = {
    all: null,

    pending: "ORDER_PLACED",
    placed: "ORDER_PLACED",
    order_placed: "ORDER_PLACED",
    new: "ORDER_PLACED",
    awaiting_processing: "ORDER_PLACED",

    processing: "PROCESSING",
    processed: "PROCESSING",
    preparing: "PROCESSING",

    shipped: "SHIPPED",
    dispatched: "SHIPPED",
    in_transit: "SHIPPED",
    awaiting_delivery: "SHIPPED",

    delivered: "DELIVERED",
    completed: "DELIVERED",
  };

  return statusMap[status] ?? null;
};

/*
 * Creates a date filter for requests such as:
 * today, this week and this month.
 */
const getPeriodStartDate = (period = "") => {
  const normalizedPeriod = String(period)
    .trim()
    .toLowerCase();

  const now = new Date();

  if (normalizedPeriod === "today") {
    return new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
  }

  if (
    normalizedPeriod === "week" ||
    normalizedPeriod === "this-week"
  ) {
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();

    /*
     * Makes Monday the first day of the week.
     */
    const difference =
      startOfWeek.getDate() -
      day +
      (day === 0 ? -6 : 1);

    startOfWeek.setDate(difference);
    startOfWeek.setHours(0, 0, 0, 0);

    return startOfWeek;
  }

  if (
    normalizedPeriod === "month" ||
    normalizedPeriod === "this-month"
  ) {
    return new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );
  }

  return null;
};

const createOrderSummary = (orders = []) => {
  return orders.reduce(
    (summary, order) => {
      summary.total += 1;
      summary.totalRevenue += Number(
        order.total || 0
      );

      if (order.status === "ORDER_PLACED") {
        summary.placed += 1;
      }

      if (order.status === "PROCESSING") {
        summary.processing += 1;
      }

      if (order.status === "SHIPPED") {
        summary.shipped += 1;
      }

      if (order.status === "DELIVERED") {
        summary.delivered += 1;
      }

      if (order.isPaid) {
        summary.paid += 1;
      } else {
        summary.unpaid += 1;
      }

      return summary;
    },
    {
      total: 0,
      placed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      paid: 0,
      unpaid: 0,
      totalRevenue: 0,
    }
  );
};

export async function GET(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json(
        {
          error:
            "You must sign in to view seller orders.",
        },
        {
          status: 401,
        }
      );
    }

    /*
     * Find the store belonging to the current user.
     *
     * This assumes your Store model uses:
     * userId String
     */
const store = await prisma.store.findFirst({
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
        {
          error:
            "No seller store was found for this account.",
        },
        {
          status: 404,
        }
      );
    }

   if (
  store.status !== "approved" ||
  store.isActive !== true
    ) {
      return NextResponse.json(
        {
          error:
            "Seller order tools are available only to approved and active stores.",
        },
        {
          status: 403,
        }
      );
    }

    const { searchParams } = new URL(
      request.url
    );

    const searchQuery =
      searchParams.get("query")?.trim() || "";

    const requestedStatus =
      searchParams.get("status") || "all";

    const period =
      searchParams.get("period") || "all";

    const requestedLimit = Number(
      searchParams.get("limit") || 10
    );

    /*
     * Prevent extremely large AI responses.
     */
    const limit = Math.min(
      Math.max(requestedLimit, 1),
      30
    );

    const normalizedStatus =
      normalizeOrderStatus(requestedStatus);

    const periodStartDate =
      getPeriodStartDate(period);

    const where = {
      storeId: store.id,
    };

    if (
      normalizedStatus &&
      VALID_STATUSES.includes(normalizedStatus)
    ) {
      where.status = normalizedStatus;
    }

    if (periodStartDate) {
      where.createdAt = {
        gte: periodStartDate,
      };
    }

    /*
     * Search by:
     * tracking number,
     * order ID,
     * customer name,
     * customer email.
     */
    if (searchQuery) {
      where.OR = [
        {
          trackingNumber: {
            contains: searchQuery,
            mode: "insensitive",
          },
        },
        {
          id: {
            contains: searchQuery,
            mode: "insensitive",
          },
        },
        {
          user: {
            name: {
              contains: searchQuery,
              mode: "insensitive",
            },
          },
        },
        {
          user: {
            email: {
              contains: searchQuery,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    /*
     * Load every matching order for an accurate
     * summary before limiting the displayed cards.
     */
    const matchingOrders =
      await prisma.order.findMany({
        where,

        orderBy: {
          createdAt: "desc",
        },

        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },

          address: {
            select: {
              street: true,
              city: true,
              state: true,
              zip: true,
              country: true,
              phone: true,
            },
          },

          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                },
              },

              variant: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      });

    const summary =
      createOrderSummary(matchingOrders);

    const orders = matchingOrders
      .slice(0, limit)
      .map((order) => ({
        id: order.id,

        trackingNumber:
          order.trackingNumber || order.id,

        total: Number(order.total || 0),

        status: order.status,

        isPaid: Boolean(order.isPaid),

        paymentMethod: order.paymentMethod,

        createdAt: order.createdAt,

        updatedAt: order.updatedAt,

        customer: {
          id: order.user?.id || null,
          name:
            order.user?.name ||
            "Customer",

          email:
            order.user?.email || null,
        },

        address: order.address
          ? {
              street:
                order.address.street || null,

              city:
                order.address.city || null,

              state:
                order.address.state || null,

              zip:
                order.address.zip || null,

              country:
                order.address.country || null,

              phone:
                order.address.phone || null,
            }
          : null,

        courier: {
          name: order.courierName || null,

          phone:
            order.courierPhone || null,

          email:
            order.courierEmail || null,
        },

        itemCount: order.orderItems.reduce(
          (total, item) =>
            total + Number(item.quantity || 0),
          0
        ),

        orderItems: order.orderItems.map(
          (item) => ({
            id: item.id,

            productId: item.productId,

            productName:
              item.product?.name ||
              "Product",

            productImage:
              item.variantImage ||
              item.variantImages?.[0] ||
              item.product?.images?.[0] ||
              null,

            quantity: item.quantity,

            price: Number(item.price || 0),

            variantId:
              item.variantId || null,

            variantName:
              item.variantName || null,

            variantValue:
              item.variantValue || null,
          })
        ),
      }));

    return NextResponse.json({
      success: true,

      store: {
        id: store.id,
        name: store.name,
      },

      filters: {
        query: searchQuery,
        status:
          normalizedStatus || "all",
        period,
        limit,
      },

      summary: {
        ...summary,

        totalRevenue: Number(
          summary.totalRevenue.toFixed(2)
        ),
      },

      resultCount: orders.length,

      totalMatchingOrders:
        matchingOrders.length,

      orders,
    });
  } catch (error) {
    console.error(
      "Adetɔ Boafo seller-orders error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Unable to retrieve seller orders.",
      },
      {
        status: 500,
      }
    );
  }
}