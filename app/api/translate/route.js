import { NextResponse } from "next/server";
import { translateText } from "@/lib/khaya";

export async function POST(request) {
  try {
    const { text, from, to } = await request.json();

    const translated = await translateText(
      text,
      from || "eng",
      to || "twi"
    );

    return NextResponse.json({
      success: true,
      translation: translated,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}