import { NextResponse } from "next/server";
import { translateLanguages } from "@/lib/translationService";

export async function GET() {
  const result = await translateLanguages("Today's Deals");

  return NextResponse.json(result);
}