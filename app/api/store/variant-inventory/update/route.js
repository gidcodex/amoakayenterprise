import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const store = await prisma.store.findUnique({
      where: {
        userId,
      },
    });

    if (!store) {
      return NextResponse.json(
        { error: "Store not found" },
        { status: 404 }
      );
    }

    const {
      variantId,
      stock,
      sku,
      barcode,
      lowStockAt,
    } = await request.json();

    const variant = await prisma.productVariant.findUnique({
      where: {
        id: variantId,
      },
      include: {
        product: true,
      },
    });

    if (!variant) {
      return NextResponse.json(
        { error: "Variant not found" },
        { status: 404 }
      );
    }

    if (variant.product.storeId !== store.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const oldStock = variant.stock;

    const updatedVariant = await prisma.productVariant.update({
      where: {
        id: variantId,
      },
      data: {
        stock: Number(stock),
        sku,
        barcode,
        lowStockAt: Number(lowStockAt),
      },
    });

    await prisma.inventoryLog.create({
      data: {
        storeId: store.id,
        productId: variant.productId,

        variantId: variant.id,
        variantName: variant.name,
        variantValue: variant.value,
        variantImage: variant.image,
        variantImages: variant.images,

        oldStock,
        newStock: Number(stock),
        quantity: Number(stock) - oldStock,

        type: "ADJUSTMENT",

        note: "Inventory updated by seller",
      },
    });

    return NextResponse.json({
      success: true,
      variant: updatedVariant,
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}