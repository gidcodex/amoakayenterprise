import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const allowedStatuses = [
  "ORDER_PLACED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
];

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const { userId } = getAuth(request);

    const isAdmin = await authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    const { status, note } = await request.json();

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid delivery status." },
        { status: 400 }
      );
    }

    const order = await prisma.order.update({
      where: { id },
      data: {
        status,
        trackingEvents: {
          create: {
            status,
            actor: "ADMIN",
            actorName: "Main Admin",
            note: note || `Order status updated to ${status}`,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Delivery status updated successfully.",
      order,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}