import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Not authorized.",
        },
        { status: 401 }
      );
    }

    const [notifications, unreadCount] =
      await prisma.$transaction([
        prisma.notification.findMany({
          where: {
            userId,
            role: "CUSTOMER",
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 50,
        }),

        prisma.notification.count({
          where: {
            userId,
            role: "CUSTOMER",
            isRead: false,
          },
        }),
      ]);

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error(
      "GET customer notifications error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error.message ||
          "Unable to retrieve notifications.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Not authorized.",
        },
        { status: 401 }
      );
    }

    const result =
      await prisma.notification.updateMany({
        where: {
          userId,
          role: "CUSTOMER",
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });

    return NextResponse.json({
      success: true,
      message: "Notifications marked as read.",
      updatedCount: result.count,
    });
  } catch (error) {
    console.error(
      "PATCH customer notifications error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error.message ||
          "Unable to update notifications.",
      },
      { status: 500 }
    );
  }
}