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
        { error: "Not Authorized" },
        { status: 401 }
      );
    }

    const products = await prisma.product.findMany({
      where: {
        stock: {
          gt: 0,
        },
        store: {
          status: "approved",
          isActive: true,
        },
      },

      include: {
        store: {
          select: {
            id: true,
            name: true,
          },
        },

        categoryRef: {
          select: {
            name: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}