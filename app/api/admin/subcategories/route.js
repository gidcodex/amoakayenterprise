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

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const isAdmin = await authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const { name, slug, image, categoryId } = await request.json();

    if (!name || !categoryId) {
      return NextResponse.json(
        { error: "Subcategory name and category are required." },
        { status: 400 }
      );
    }

    const finalSlug = slug ? makeSlug(slug) : makeSlug(name);

    const existingSubcategory = await prisma.subcategory.findFirst({
      where: {
        categoryId,
        OR: [{ name }, { slug: finalSlug }],
      },
    });

    if (existingSubcategory) {
      return NextResponse.json(
        { error: "Subcategory already exists in this category." },
        { status: 400 }
      );
    }

    const subcategory = await prisma.subcategory.create({
      data: {
        name,
        slug: finalSlug,
        image: image || null,
        categoryId,
      },
    });

    return NextResponse.json({
      message: "Subcategory created successfully.",
      subcategory,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 }
    );
  }
}