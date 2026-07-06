import prisma from "@/lib/prisma";
import authSeller from "@/middlewares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    const storeId = await authSeller(userId);

    if (!storeId) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { storeId },
      include: {
        user: true,
        address: true,
        orderItems: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const products = await prisma.product.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
    });

    const ratings = await prisma.rating.findMany({
      where: {
        productId: {
          in: products.map((product) => product.id),
        },
      },
      include: {
        user: true,
        product: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const totalEarnings = orders.reduce((acc, order) => acc + order.total, 0);

    const pendingOrders = orders.filter(
      (order) => order.status !== "DELIVERED"
    ).length;

    const deliveredOrders = orders.filter(
      (order) => order.status === "DELIVERED"
    ).length;

    const healthyProducts = products.filter(
      (product) => product.inStock && product.stock > product.lowStockAt
    ).length;

    const lowStockProducts = products.filter(
      (product) =>
        product.inStock &&
        product.stock > 0 &&
        product.stock <= product.lowStockAt
    ).length;

    const outOfStockProducts = products.filter(
      (product) => !product.inStock || product.stock <= 0
    ).length;

    const totalInventory = products.reduce(
      (acc, product) => acc + (product.stock || 0),
      0
    );

    const stockValue = products.reduce(
      (acc, product) => acc + (product.stock || 0) * product.price,
      0
    );

    const productMap = {};

    orders.forEach((order) => {
      order.orderItems.forEach((item) => {
        if (!item.product) return;

        if (!productMap[item.productId]) {
          productMap[item.productId] = {
            id: item.productId,
            name: item.product.name,
            image: item.product.images?.[0],
            quantity: 0,
            revenue: 0,
          };
        }

        productMap[item.productId].quantity += item.quantity;
        productMap[item.productId].revenue += item.price * item.quantity;
      });
    });

    const topProducts = Object.values(productMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    const fastMovingProducts = topProducts.slice(0, 3);

    const slowMovingProducts = products
      .filter((product) => {
        const sold = productMap[product.id]?.quantity || 0;
        return sold === 0;
      })
      .slice(0, 5);

    const sellerActivities = [
      ...orders.slice(0, 5).map((order) => ({
        id: `order-${order.id}`,
        title: "New Order",
        message: `${order.user?.name || "Customer"} placed an order.`,
        date: order.createdAt,
        link: "/store/orders",
        type: "ORDER",
      })),

      ...ratings.slice(0, 5).map((rating) => ({
        id: `rating-${rating.id}`,
        title: "New Review",
        message: `${rating.user?.name || "Customer"} reviewed ${
          rating.product?.name || "a product"
        }.`,
        date: rating.createdAt,
        link: "/store",
        type: "REVIEW",
      })),

      ...products
        .filter(
          (product) =>
            product.inStock &&
            product.stock > 0 &&
            product.stock <= product.lowStockAt
        )
        .slice(0, 5)
        .map((product) => ({
          id: `low-${product.id}`,
          title: "Low Stock",
          message: `${product.name} has only ${product.stock} unit(s) left.`,
          date: product.updatedAt,
          link: "/store/manage-product",
          type: "LOW_STOCK",
        })),

      ...products
        .filter((product) => !product.inStock || product.stock <= 0)
        .slice(0, 5)
        .map((product) => ({
          id: `out-${product.id}`,
          title: "Out of Stock",
          message: `${product.name} is out of stock.`,
          date: product.updatedAt,
          link: "/store/manage-product",
          type: "OUT_OF_STOCK",
        })),
    ]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    const dashboardData = {
      ratings,
      totalOrders: orders.length,
      totalEarnings: totalEarnings.toFixed(2),
      totalProducts: products.length,
      pendingOrders,
      deliveredOrders,

      healthyProducts,
      lowStockProducts,
      outOfStockProducts,
      totalInventory,
      stockValue: stockValue.toFixed(2),
      fastMovingProducts,
      slowMovingProducts,

      sellerActivities,
      recentOrders: orders.slice(0, 6),
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