import prisma from "@/lib/prisma";
import authSeller from "@/middlewares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const storeId = await authSeller(userId);

    if (!storeId) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    const { orderId, courierName, courierPhone, courierEmail } =
      await request.json();

    if (!orderId || !courierName || !courierPhone) {
      return NextResponse.json(
        { error: "Courier name and phone are required." },
        { status: 400 }
      );
    }

    const order = await prisma.order.update({
      where: {
        id: orderId,
        storeId,
      },
      data: {
        courierName,
        courierPhone,
        courierEmail: courierEmail || null,
        status: "PROCESSING",
        trackingEvents: {
          create: {
            status: "PROCESSING",
            actor: "STORE_OWNER",
            actorName: "Store Owner",
            note: `Courier assigned: ${courierName}`,
          },
        },
      },
    });
    
     await prisma.notification.create({
     data: {
    title: "Courier Assigned",
    message: `${courierName} has been assigned to your order.`,
    type: "DELIVERY",
    role: "CUSTOMER",
    userId: order.userId,
    link: `/track-order?tracking=${order.trackingNumber}`,
  },
});

    return NextResponse.json({
      message: "Courier assigned successfully.",
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