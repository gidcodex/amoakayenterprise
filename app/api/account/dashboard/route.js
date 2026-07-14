import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { PaymentMethod } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json(
        { error: "Not authorized." },
        { status: 401 }
      );
    }

    const [orders, addresses, reviews] = await Promise.all([
      prisma.order.findMany({
        where: {
          userId,

          OR: [
            {
              paymentMethod: PaymentMethod.COD,
            },
            {
              paymentMethod: PaymentMethod.STRIPE,
              isPaid: true,
            },
            {
              paymentMethod: PaymentMethod.PAYSTACK,
              isPaid: true,
            },
          ],
        },

        include: {
          store: {
            select: {
              id: true,
              name: true,
              username: true,
              logo: true,
              contact: true,
            },
          },

          address: true,

          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                },
              },
            },
          },

          trackingEvents: {
            orderBy: {
              createdAt: "desc",
            },
          },

          payment: {
            select: {
              id: true,
              status: true,
              provider: true,
              clientReference: true,
              confirmedAt: true,
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.address.count({
        where: {
          userId,
        },
      }),

      prisma.rating.count({
        where: {
          userId,
        },
      }),
    ]);

    const totalOrders = orders.length;

    const activeOrders = orders.filter(
      (order) => order.status !== "DELIVERED"
    ).length;

    const deliveredOrders = orders.filter(
      (order) => order.status === "DELIVERED"
    ).length;

    const totalSpent = orders.reduce(
      (total, order) => total + Number(order.total || 0),
      0
    );

    const recentOrders = orders.slice(0, 5);

    const recentActivity = orders
      .flatMap((order) => {
        if (
          Array.isArray(order.trackingEvents) &&
          order.trackingEvents.length > 0
        ) {
          return order.trackingEvents.map((event) => ({
            id: event.id,
            orderId: order.id,
            trackingNumber: order.trackingNumber,
            status: event.status,
            note:
              event.note ||
              getDefaultActivityMessage(event.status),
            actor: event.actor,
            actorName: event.actorName,
            createdAt: event.createdAt,
          }));
        }

        return [
          {
            id: `order-created-${order.id}`,
            orderId: order.id,
            trackingNumber: order.trackingNumber,
            status: order.status,
            note: "Order placed successfully.",
            actor: "CUSTOMER",
            actorName: null,
            createdAt: order.createdAt,
          },
        ];
      })
      .sort(
        (first, second) =>
          new Date(second.createdAt).getTime() -
          new Date(first.createdAt).getTime()
      )
      .slice(0, 8);

    return NextResponse.json({
      dashboardData: {
        totalOrders,
        activeOrders,
        deliveredOrders,
        addresses,
        reviews,
        totalSpent: Number(totalSpent.toFixed(2)),
        recentOrders,
        recentActivity,
      },
    });
  } catch (error) {
    console.error("ACCOUNT DASHBOARD ERROR:", error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Failed to load the customer dashboard.",
      },
      { status: 500 }
    );
  }
}

function getDefaultActivityMessage(status) {
  switch (status) {
    case "ORDER_PLACED":
      return "Your order was placed successfully.";

    case "PROCESSING":
      return "The seller is preparing your order.";

    case "SHIPPED":
      return "Your order has been shipped.";

    case "DELIVERED":
      return "Your order was delivered.";

    default:
      return "Your order status was updated.";
  }
}