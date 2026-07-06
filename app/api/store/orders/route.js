import prisma from "@/lib/prisma";
import authSeller from "@/middlewares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Update seller order status
export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const storeId = await authSeller(userId);

    if (!storeId) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    const { orderId, status } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "Missing order details." },
        { status: 400 }
      );
    }

    const dataToUpdate = {
      status,
      trackingEvents: {
        create: {
          status,
          actor: "STORE_OWNER",
          actorName: "Store Owner",
          note: `Order status updated to ${status
            .replace(/_/g, " ")
            .toLowerCase()}`,
        },
      },
    };

    if (status === "DELIVERED") {
      dataToUpdate.isPaid = true;
    }

    const order = await prisma.order.update({
      where: {
        id: orderId,
        storeId,
      },
      data: dataToUpdate,
    });

    await prisma.notification.create({
      data: {
        title:
          status === "DELIVERED"
            ? "Order Delivered"
            : "Order Status Updated",
        message:
          status === "DELIVERED"
            ? "Your order has been delivered successfully."
            : `Your order is now ${status.replace(/_/g, " ").toLowerCase()}.`,
        type: "DELIVERY",
        role: "CUSTOMER",
        userId: order.userId,
        link: `/track-order?tracking=${order.trackingNumber}`,
      },
    });

    return NextResponse.json({
      message:
        status === "DELIVERED"
          ? "Order delivered and payment marked as paid."
          : "Order status updated.",
      order,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 }
    );
  }
}

// Get all orders for a seller
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
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 }
    );
  }
}