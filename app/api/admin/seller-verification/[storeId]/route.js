import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request, context) {
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
        { error: "Administrator access required." },
        { status: 403 }
      );
    }

    // Next.js 15
    const { storeId } = await context.params;

    const store = await prisma.store.findUnique({
      where: {
        id: storeId,
      },

      include: {
        user: true,

        payouts: {
          orderBy: {
            createdAt: "desc",
          },
        },

        Order: {
          take: 10,
          orderBy: {
            createdAt: "desc",
          },
        },

        Product: true,
      },
    });

    if (!store) {
      return NextResponse.json(
        { error: "Store not found." },
        { status: 404 }
      );
    }

    const totalRevenue = store.Order.reduce(
      (sum, order) => sum + Number(order.total),
      0
    );

    const deliveredOrders = store.Order.filter(
      (order) => order.status === "DELIVERED"
    ).length;

    const activeOrders = store.Order.filter(
      (order) => order.status !== "DELIVERED"
    ).length;

    return NextResponse.json({
      store,

      summary: {
        totalRevenue,

        totalProducts: store.Product.length,

        totalOrders: store.Order.length,

        deliveredOrders,

        activeOrders,

        payoutRecords: store.payouts.length,
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: error.message,
      },
      {
        status: 400,
      }
    );
  }
}