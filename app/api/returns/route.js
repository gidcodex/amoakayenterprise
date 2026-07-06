import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    const { orderId, productId, reason, details } = await request.json();

    if (!orderId || !productId || !reason) {
      return NextResponse.json(
        { error: "Missing return request details." },
        { status: 400 }
      );
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
        status: "DELIVERED",
      },
      include: {
        orderItems: true,
        store: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Only delivered orders can be returned." },
        { status: 400 }
      );
    }

    const orderItem = order.orderItems.find(
      (item) => item.productId === productId
    );

    if (!orderItem) {
      return NextResponse.json(
        { error: "Product not found in this order." },
        { status: 404 }
      );
    }

    const existingReturn = await prisma.returnRequest.findUnique({
      where: {
        orderId_productId_userId: {
          orderId,
          productId,
          userId,
        },
      },
    });

    if (existingReturn) {
      return NextResponse.json(
        { error: "Return request already submitted for this product." },
        { status: 400 }
      );
    }

    const returnRequest = await prisma.returnRequest.create({
      data: {
        orderId,
        productId,
        userId,
        storeId: order.storeId,
        reason,
        details: details || "",
      },
      include: {
        product: true,
        order: true,
      },
    });

    await prisma.notification.createMany({
      data: [
        {
          title: "New Return Request",
          message: `A customer requested a return for ${returnRequest.product.name}.`,
          type: "ORDER",
          role: "SELLER",
          storeId: order.storeId,
          link: "/store/returns",
        },
        {
          title: "New Return Request",
          message: `A return request was submitted for ${returnRequest.product.name}.`,
          type: "ORDER",
          role: "ADMIN",
          link: "/admin/returns",
        },
        {
          title: "Return Request Submitted",
          message: `Your return request for ${returnRequest.product.name} has been submitted.`,
          type: "ORDER",
          role: "CUSTOMER",
          userId,
          link: "/orders",
        },
      ],
    });

    return NextResponse.json({
      message: "Return request submitted successfully.",
      returnRequest,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 }
    );
  }
}

export async function GET(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    const returns = await prisma.returnRequest.findMany({
      where: { userId },
      include: {
        product: true,
        order: true,
        store: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ returns });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 }
    );
  }
}