import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json(
        { error: "Please login to track your order." },
        { status: 401 }
      );
    }

    const { trackingNumber } = await request.json();

    if (!trackingNumber) {
      return NextResponse.json(
        { error: "Tracking number is required." },
        { status: 400 }
      );
    }

    const order = await prisma.order.findFirst({
      where: {
        trackingNumber: trackingNumber.trim(),
        userId,
      },
      include: {
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
      return NextResponse.json(
        { error: "No order found with this tracking number." },
        { status: 404 }
      );
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}