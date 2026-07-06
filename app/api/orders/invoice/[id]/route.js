import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { userId } = getAuth(request);
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        store: true,
        address: true,
        orderItems: {
          include: {
            product: true,
          },
        },
        trackingEvents: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.userId !== userId && order.store?.userId !== userId) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}