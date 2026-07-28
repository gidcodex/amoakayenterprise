import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const now = new Date();

    const flashDeals = await prisma.flashDeal.findMany({
      where: {
        isActive: true,
        isFeatured: true,
        startsAt: {
          lte: now,
        },
        endsAt: {
          gt: now,
        },
      },

      include: {
        product: {
          include: {
            store: true,
            categoryRef: true,
            variants: true,
          },
        },
      },

      orderBy: {
        discountPercent: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      flashDeals,
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