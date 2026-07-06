import prisma from "@/lib/prisma";
import authSeller from "@/middlewares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const { productId, stock, lowStockAt } = await request.json();

    if (!productId || stock === undefined || lowStockAt === undefined) {
      return NextResponse.json(
        { error: "Missing stock details." },
        { status: 400 }
      );
    }

    const storeId = await authSeller(userId);

    if (!storeId) {
      return NextResponse.json({ error: "Not authorized." }, { status: 401 });
    }

    const product = await prisma.product.findFirst({
      where: { id: productId, storeId },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    const oldStock = product.stock || 0;
    const newStock = Number(stock);
    const newLowStockAt = Number(lowStockAt);

    if (newStock < 0 || newLowStockAt < 1) {
      return NextResponse.json(
        { error: "Invalid stock values." },
        { status: 400 }
      );
    }

    const logType =
      newStock === 0
        ? "OUT_OF_STOCK"
        : newStock > oldStock
        ? "RESTOCK"
        : "ADJUSTMENT";

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        stock: newStock,
        lowStockAt: newLowStockAt,
        inStock: newStock > 0,
      },
    });

    await prisma.inventoryLog.create({
      data: {
        productId,
        storeId,
        type: logType,
        quantity: Math.abs(newStock - oldStock),
        oldStock,
        newStock,
        note: `Stock changed from ${oldStock} to ${newStock}.`,
      },
    });

    if (newStock <= newLowStockAt && newStock > 0) {
      await prisma.notification.create({
        data: {
          title: "Low Stock Alert",
          message: `${product.name} has only ${newStock} unit(s) left.`,
          type: "STORE",
          role: "SELLER",
          storeId,
          link: "/store/manage-products",
        },
      });
    }

    if (newStock === 0) {
      await prisma.notification.create({
        data: {
          title: "Product Out of Stock",
          message: `${product.name} is now out of stock.`,
          type: "STORE",
          role: "SELLER",
          storeId,
          link: "/store/manage-products",
        },
      });
    }

    return NextResponse.json({
      message: "Stock updated successfully.",
      product: updatedProduct,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 }
    );
  }
}