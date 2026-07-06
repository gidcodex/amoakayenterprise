import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { userId } = getAuth(request);

    const isAdmin = await authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Not authorized" },
        { status: 401 }
      );
    }

    const notifications = await prisma.notification.findMany({
      where: {
        role: "ADMIN",
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: {
        role: "ADMIN",
        isRead: false,
      },
    });

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}

export async function PATCH(request) {
  try {
    const { userId } = getAuth(request);

    const isAdmin = await authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Not authorized" },
        { status: 401 }
      );
    }

    await prisma.notification.updateMany({
      where: {
        role: "ADMIN",
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json({
      message: "Notifications marked as read.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}