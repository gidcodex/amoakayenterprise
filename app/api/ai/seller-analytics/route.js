import prisma from "@/lib/prisma";
import authSeller from "@/middlewares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    const storeId = await authSeller(userId);

    if (!storeId) {
      return NextResponse.json(
        { error: "Not authorized" },
        { status: 401 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const monthStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );

    const [
      orders,
      products,
      todayOrders,
      monthOrders,
    ] = await Promise.all([
      prisma.order.findMany({
        where: { storeId },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      }),

      prisma.product.count({
        where: { storeId },
      }),

      prisma.order.findMany({
        where: {
          storeId,
          createdAt: {
            gte: today,
          },
        },
      }),

      prisma.order.findMany({
        where: {
          storeId,
          createdAt: {
            gte: monthStart,
          },
        },
      }),
    ]);

    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.total,
      0
    );

    const todayRevenue = todayOrders.reduce(
      (sum, order) => sum + order.total,
      0
    );

    const monthRevenue = monthOrders.reduce(
      (sum, order) => sum + order.total,
      0
    );

    const pendingOrders = orders.filter(
      (o) => o.status === "ORDER_PLACED"
    ).length;

    const processingOrders = orders.filter(
      (o) => o.status === "PROCESSING"
    ).length;

    const shippedOrders = orders.filter(
      (o) => o.status === "SHIPPED"
    ).length;

    const deliveredOrders = orders.filter(
      (o) => o.status === "DELIVERED"
    ).length;

    const salesMap = {};

    orders.forEach((order) => {
      order.orderItems.forEach((item) => {
        const id = item.product.id;

        if (!salesMap[id]) {
          salesMap[id] = {
            id,
            name: item.product.name,
            quantity: 0,
            revenue: 0,
          };
        }

        salesMap[id].quantity += item.quantity;
        salesMap[id].revenue +=
          item.quantity * item.price;
      });
    });

    const bestSellingProduct =
      Object.values(salesMap).sort(
        (a, b) => b.quantity - a.quantity
      )[0] || null;

    return NextResponse.json({
      success: true,

      summary: {
        totalRevenue,
        todayRevenue,
        monthRevenue,

        totalOrders: orders.length,

        pendingOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,

        totalProducts: products,

        bestSellingProduct,
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}