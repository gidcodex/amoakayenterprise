import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
      },
      include: {
        subcategories: {
          where: {
            isActive: true,
          },
          include: {
            childCategories: {
              where: {
                isActive: true,
              },
              orderBy: {
                name: "asc",
              },
            },
          },
          orderBy: {
            name: "asc",
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 }
    );
  }
}