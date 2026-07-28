import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json(
        { error: "Not authorized" },
        { status: 401 }
      );
    }

    const {
      orderId,
      orderItemId,
      reason,
      details,
    } = await request.json();

    if (!orderId || !orderItemId || !reason) {
      return NextResponse.json(
        { error: "Missing required information." },
        { status: 400 }
      );
    }

    // Get customer's order
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: {
        payment: true,
        orderItems: {
          include: {
            product: true,
          },
        },
        store: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found." },
        { status: 404 }
      );
    }

    // Refunds only before shipment
    if (!["ORDER_PLACED", "PROCESSING"].includes(order.status)) {
      return NextResponse.json(
        {
          error:
            "Refund requests are only allowed before shipment.",
        },
        { status: 400 }
      );
    }

    const orderItem = order.orderItems.find(
      (item) => item.id === orderItemId
    );

    if (!orderItem) {
      return NextResponse.json(
        { error: "Order item not found." },
        { status: 404 }
      );
    }

    // Prevent duplicate requests
    const existing = await prisma.refundRequest.findFirst({
      where: {
        orderItemId,
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          error:
            "A refund request already exists for this item.",
        },
        { status: 400 }
      );
    }

    const amount = orderItem.price * orderItem.quantity;

    const refund = await prisma.refundRequest.create({
      data: {
        orderId,
        orderItemId,

        productId: orderItem.productId,

        userId,

        storeId: order.storeId,

        paymentId: order.paymentId,

        quantity: orderItem.quantity,

        amount,

        paymentMethod: order.paymentMethod,

        provider:
          order.paymentMethod === "PAYSTACK"
            ? "PAYSTACK"
            : order.paymentMethod === "STRIPE"
            ? "STRIPE"
            : null,

        reason,
        details,
      },
    });

    // Notifications
    await prisma.notification.createMany({
      data: [
        {
          title: "Refund Request",
          message: `${orderItem.product.name} refund request submitted.`,
          role: "SELLER",
          type: "REFUND",
          storeId: order.storeId,
          link: "/store/refunds",
        },

        {
          title: "Refund Request",
          message: `${orderItem.product.name} requires review.`,
          role: "ADMIN",
          type: "REFUND",
          link: "/admin/refunds",
        },

        {
          title: "Refund Request Submitted",
          message:
            "Your refund request has been submitted successfully.",
          role: "CUSTOMER",
          userId,
          type: "REFUND",
          link: "/orders",
        },
      ],
    });

    return NextResponse.json({
      success: true,
      message:
        order.paymentMethod === "COD"
          ? "Cancellation request submitted successfully."
          : "Refund request submitted successfully.",
      refund,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 }
    );
  }
}