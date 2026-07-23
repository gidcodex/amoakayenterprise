import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { userId } = getAuth(request);

    // Guest
    if (!userId) {
      return NextResponse.json({
        authenticated: false,
        role: "guest",
      });
    }

    // Admin
    const isAdmin = await authAdmin(userId);

    if (isAdmin) {
      return NextResponse.json({
        authenticated: true,
        role: "admin",
      });
    }

    // Seller
    const store = await prisma.store.findUnique({
      where: {
        userId,
      },
      select: {
        id: true,
        name: true,
        username: true,
        status: true,
        isActive: true,
        businessVerified: true,
      },
    });

    if (store) {
      return NextResponse.json({
        authenticated: true,
        role: "seller",

        sellerStatus: store.status,
        active: store.isActive,

        businessVerified:
          store.businessVerified,

        storeId: store.id,
        storeName: store.name,
        username: store.username,
      });
    }

    // Customer
    return NextResponse.json({
      authenticated: true,
      role: "customer",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}