import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const { userId } = getAuth(request);

    const isAdmin = await authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    const { courierName, courierPhone, courierEmail } = await request.json();

    if (!courierName || !courierPhone) {
      return NextResponse.json(
        { error: "Courier name and phone number are required." },
        { status: 400 }
      );
    }

    const order = await prisma.order.update({
      where: { id },
      data: {
        courierName,
        courierPhone,
        courierEmail: courierEmail || null,
        status: "PROCESSING",
        trackingEvents: {
          create: {
            status: "PROCESSING",
            actor: "ADMIN",
            actorName: "Main Admin",
            note: `Courier assigned: ${courierName}`,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Courier assigned successfully.",
      order,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}