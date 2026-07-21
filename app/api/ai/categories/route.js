import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
      },

      orderBy: {
        name: "asc",
      },

      select: {
        id: true,
        name: true,
        slug: true,

        subcategories: {
          where: {
            isActive: true,
          },

          orderBy: {
            name: "asc",
          },

          select: {
            id: true,
            name: true,
            slug: true,
            categoryId: true,

            childCategories: {
              where: {
                isActive: true,
              },

              orderBy: {
                name: "asc",
              },

              select: {
                id: true,
                name: true,
                slug: true,
                subcategoryId: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      categories,
    });
  } catch (error) {
    console.error("AI category fetch error:", error);

    return NextResponse.json(
      {
        error: "Unable to load marketplace categories.",
      },
      {
        status: 500,
      }
    );
  }
}