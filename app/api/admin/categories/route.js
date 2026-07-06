import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const makeSlug = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    const isAdmin = await authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const categories = await prisma.category.findMany({
      include: {
        
      subcategories: {
          include: {
            childCategories: {
             orderBy: { name: "asc" },
      },
    },
    orderBy: { name: "asc" },
  },

      },
      orderBy: { name: "asc" },
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

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const isAdmin = await authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const { name, slug, image } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Category name is required." },
        { status: 400 }
      );
    }

    const finalSlug = slug ? makeSlug(slug) : makeSlug(name);

    const existingCategory = await prisma.category.findFirst({
      where: {
        OR: [{ name }, { slug: finalSlug }],
      },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: "Category already exists." },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug: finalSlug,
        image: image || null,
      },
      include: {
        subcategories: true,
      },
    });

    return NextResponse.json({
      message: "Category created successfully.",
      category,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 }
    );
  }
}