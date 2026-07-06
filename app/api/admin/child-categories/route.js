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

    const { name, slug, image, subcategoryId } = await request.json();

    if (!name || !subcategoryId) {
      return NextResponse.json(
        { error: "Child category name and subcategory are required." },
        { status: 400 }
      );
    }

    const finalSlug = slug ? makeSlug(slug) : makeSlug(name);

    const existingChildCategory = await prisma.childCategory.findFirst({
      where: {
        subcategoryId,
        OR: [{ name }, { slug: finalSlug }],
      },
    });

    if (existingChildCategory) {
      return NextResponse.json(
        { error: "Child category already exists under this subcategory." },
        { status: 400 }
      );
    }

    const childCategory = await prisma.childCategory.create({
      data: {
        name,
        slug: finalSlug,
        image: image || null,
        subcategoryId,
      },
    });

    return NextResponse.json({
      message: "Child category created successfully.",
      childCategory,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 }
    );
  }
}