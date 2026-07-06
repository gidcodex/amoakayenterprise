import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { PaymentMethod } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: {
        userId,
        OR: [
          { paymentMethod: PaymentMethod.COD },
          {
            AND: [
              { paymentMethod: PaymentMethod.STRIPE },
              { isPaid: true },
            ],
          },
        ],
      },
      include: {
        store: true,
        orderItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const addresses = await prisma.address.count({
      where: { userId },
    });

    const reviews = await prisma.rating.count({
      where: { userId },
    });

    const totalSpent = orders.reduce((acc, order) => acc + order.total, 0);

    const activeOrders = orders.filter(
      (order) => order.status !== "DELIVERED"
    ).length;

    const deliveredOrders = orders.filter(
      (order) => order.status === "DELIVERED"
    ).length;

    return NextResponse.json({
      dashboardData: {
        totalOrders: orders.length,
        activeOrders,
        deliveredOrders,
        addresses,
        reviews,
        totalSpent: totalSpent.toFixed(2),
        recentOrders: orders.slice(0, 5),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}