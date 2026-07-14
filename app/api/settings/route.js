import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    let settings = await prisma.adminSettings.findFirst();

    if (!settings) {
      settings = await prisma.adminSettings.create({
        data: {},
      });
    }

    return NextResponse.json({
      settings,
    });
  } catch (error) {
    console.error("GET SETTINGS ERROR:", error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Failed to load marketplace settings.",
      },
      { status: 500 }
    );
  }
}