import prisma from "@/lib/prisma";
import authSeller from "@/middlewares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Toggle product visibility
export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: "Missing product ID." },
        { status: 400 }
      );
    }

    const storeId = await authSeller(userId);

    if (!storeId) {
      return NextResponse.json(
        { error: "Not authorized." },
        { status: 401 }
      );
    }

    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        storeId,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found." },
        { status: 404 }
      );
    }

    // Prevent enabling products that have no inventory
    if (product.stock <= 0 && !product.inStock) {
      return NextResponse.json(
        {
          error:
            "This product has no inventory. Increase the stock quantity before making it available.",
        },
        { status: 400 }
      );
    }

    await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        inStock: !product.inStock,
      },
    });

    return NextResponse.json({
      message: `Product ${
        product.inStock ? "hidden" : "made available"
      } successfully.`,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 }
    );
  }
}