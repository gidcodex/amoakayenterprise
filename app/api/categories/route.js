import { NextResponse } from "next/server";
import { getCategories } from "@/lib/categories";

export async function GET() {
  try {
    const categories = await getCategories();

    return NextResponse.json({ categories });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: error.code || error.message,
      },
      {
        status: 400,
      }
    );
  }
}