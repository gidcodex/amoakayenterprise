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

export async function PATCH(request, { params }) {
  try {
    const { userId } = getAuth(request);
    const isAdmin = await authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const { id } = await params;
    const { name, image, isActive } = await request.json();

    const data = {};

    if (name) {
      data.name = name;
      data.slug = makeSlug(name);
    }

    if (image !== undefined) {
      data.image = image || null;
    }

    if (isActive !== undefined) {
      data.isActive = isActive;
    }

    const childCategory = await prisma.childCategory.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      message: "Child category updated successfully.",
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

export async function DELETE(request, { params }) {
  try {
    const { userId } = getAuth(request);
    const isAdmin = await authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const { id } = await params;

    await prisma.childCategory.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Child category deleted successfully.",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 }
    );
  }
}