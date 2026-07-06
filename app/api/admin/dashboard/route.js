import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    const isAdmin = await authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }
    
     const settings =
      (await prisma.adminSettings.findFirst()) ||
      (await prisma.adminSettings.create({ data: {} }));

    const orders = await prisma.order.findMany({
      include: {
        user: true,
        store: true,
        orderItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const stores = await prisma.store.count();
    const products = await prisma.product.count();
    const unreadMessages = await prisma.contactMessage.count({
      where: { isRead: false },
    });

    const latestNotifications = await prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
    });

    const totalRevenue = orders.reduce((acc, order) => acc + order.total, 0);

    const activeDeliveries = orders.filter(
      (order) => order.status !== "DELIVERED"
    ).length;

    const deliveredOrders = orders.filter(
      (order) => order.status === "DELIVERED"
    ).length;

    const codOrders = orders.filter(
      (order) => order.paymentMethod === "COD"
    ).length;

    const stripeOrders = orders.filter(
      (order) => order.paymentMethod === "STRIPE"
    ).length;

    const storePerformanceMap = {};
    const productPerformanceMap = {};

    orders.forEach((order) => {
      if (order.store) {
        if (!storePerformanceMap[order.storeId]) {
          storePerformanceMap[order.storeId] = {
            id: order.storeId,
            name: order.store.name,
            revenue: 0,
            orders: 0,
          };
        }

        storePerformanceMap[order.storeId].revenue += order.total;
        storePerformanceMap[order.storeId].orders += 1;
      }

      order.orderItems.forEach((item) => {
        if (!item.product) return;

        if (!productPerformanceMap[item.productId]) {
          productPerformanceMap[item.productId] = {
            id: item.productId,
            name: item.product.name,
            image: item.product.images?.[0],
            quantity: 0,
            revenue: 0,
          };
        }

        productPerformanceMap[item.productId].quantity += item.quantity;
        productPerformanceMap[item.productId].revenue +=
          item.price * item.quantity;
      });
    });

    const topStores = Object.values(storePerformanceMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const topProducts = Object.values(productPerformanceMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    const dashboardData = {
     orders: orders.length,
     stores,
     products,
     revenue: totalRevenue.toFixed(2),
     activeDeliveries,
     deliveredOrders,
     unreadMessages,
     codOrders,
     stripeOrders,
     monthlyRevenueGoal: settings.monthlyRevenueGoal,
     recentOrders: orders.slice(0, 6),
     latestNotifications,
     topStores,
     topProducts,
     allOrders: orders.map((order) => ({
     createdAt: order.createdAt,
     total: order.total,
   })),
};

    return NextResponse.json({ dashboardData });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 }
    );
  }
}