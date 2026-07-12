import prisma from "@/lib/prisma";
import authSeller from "@/middlewares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { userId } = getAuth(request);
    const storeId = await authSeller(userId);

    if (!storeId) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    const { productId } = await params;

    const product = await prisma.product.findFirst({
      where: { id: productId, storeId },
      include: {
        categoryRef: true,
        subcategoryRef: true,
        childCategory: true,
        variants: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const { userId } = getAuth(request);
    const storeId = await authSeller(userId);

    if (!storeId) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    const { productId } = await params;
    const body = await request.json();

    const product = await prisma.product.findFirst({
      where: { id: productId, storeId },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

  const {
  name,
  description,
  mrp,
  price,
  category,
  categoryId,
  subcategoryId,
  childCategoryId,
  stock,
  lowStockAt,
  inStock,
  images,
  specifications,
  variants,
} = body;

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        description,
        mrp: Number(mrp),
        price: Number(price),
        category,
        categoryId: categoryId || null,
        subcategoryId: subcategoryId || null,
        childCategoryId: childCategoryId || null,
        images: images || product.images,
        specifications: specifications || product.specifications || {},
        stock: Number(stock),
        lowStockAt: Number(lowStockAt),
        inStock: inStock ?? Number(stock) > 0,

        variants: {
          deleteMany: {},
          create: (variants || [])
            .filter((variant) => variant.name && variant.value)
            .map((variant) => ({
              name: variant.name,
              value: variant.value,
              price: variant.price ? Number(variant.price) : null,
              stock: variant.stock ? Number(variant.stock) : 0,
              image: variant.image || null,
              images: variant.images || [],
          })),
      },
      
      },
      include: {
        categoryRef: true,
        subcategoryRef: true,
        childCategory: true,
        variants: true,
      },
    });

    return NextResponse.json({
      message: "Product updated successfully",
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

export async function DELETE(request, { params }) {
  try {
    const { userId } = getAuth(request);
    const storeId = await authSeller(userId);

    if (!storeId) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    const { productId } = await params;

    const product = await prisma.product.findFirst({
      where: { id: productId, storeId },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await prisma.product.delete({
      where: { id: productId },
    });

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 }
    );
  }
}