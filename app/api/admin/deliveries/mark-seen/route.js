import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PATCH(request) {
  try {
    const { userId } = getAuth(request);

    const isAdmin = await authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    await prisma.order.updateMany({
      where: {
        isAdminSeen: false,
      },
      data: {
        isAdminSeen: true,
        adminSeenAt: new Date(),
      },
    });

    return NextResponse.json({
      message: "Delivery notifications marked as seen.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}