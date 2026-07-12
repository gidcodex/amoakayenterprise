import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    const isAdmin = await authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    const returns = await prisma.returnRequest.findMany({
      include: {
        user: true,
        product: true,
        store: true,
        order: {
          include: {
            orderItems: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedReturns = returns.map((item) => {
      const orderItem = item.order?.orderItems?.find(
        (orderItem) => orderItem.productId === item.productId
      );

      return {
        ...item,
        orderItem: orderItem || null,
      };
    });

    return NextResponse.json({ returns: formattedReturns });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 }
    );
  }
}