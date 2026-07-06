import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const settings =
      (await prisma.adminSettings.findFirst()) ||
      (await prisma.adminSettings.create({ data: {} }));

    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}