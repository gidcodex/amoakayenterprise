import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const category = searchParams.get("category");
    const subcategory = searchParams.get("subcategory");
    const child = searchParams.get("child");

    const where = {
      inStock: true,
      store: {
        isActive: true,
      },
    };

    if (category) {
      where.categoryRef = {
        name: category,
      };
    }

    if (subcategory) {
      where.subcategoryRef = {
        name: subcategory,
      };
    }

    if (child) {
      where.childCategory = {
        name: child,
      };
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        rating: {
          select: {
            createdAt: true,
            rating: true,
            review: true,
            user: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        },
        store: true,
        categoryRef: true,
        subcategoryRef: true,
        childCategory: true,
        variants: true,
        questions: {
          include: {
          user: {
          select: {
          name: true,
          image: true,
      },
    },
  },
  orderBy: {
    createdAt: "desc",
  },
},
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.code || error.message || "An internal server error occurred." },
      { status: 500 }
    );
  }
}