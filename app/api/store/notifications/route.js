import prisma from "@/lib/prisma";
import authSeller from "@/middlewares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    const storeId = await authSeller(userId);

    if (!storeId) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    const notifications = await prisma.notification.findMany({
      where: {
        storeId,
        role: "SELLER",
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 30,
    });

    const unreadCount = await prisma.notification.count({
      where: {
        storeId,
        role: "SELLER",
        isRead: false,
      },
    });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PATCH(request) {
  try {
    const { userId } = getAuth(request);
    const storeId = await authSeller(userId);

    if (!storeId) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    await prisma.notification.updateMany({
      where: {
        storeId,
        role: "SELLER",
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json({ message: "Notifications marked as read." });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}