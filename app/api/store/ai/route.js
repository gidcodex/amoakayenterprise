import authSeller from "@/middlewares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { gemini } from "@/configs/gemini";

async function main(base64Image, mimeType) {
  const result = await gemini.models.generateContent({
    model: process.env.GEMINI_MODEL,
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `
You are a product listing assistant for an e-commerce store.

Your job is to analyze the image and return ONLY valid JSON.

STRICT JSON FORMAT:
{
  "name": "string",
  "description": "string"
}

No markdown. No explanation. No extra text.
            `.trim(),
          },
          {
            inlineData: {
              mimeType,
              data: base64Image,
            },
          },
        ],
      },
    ],
  });

  const text = result.text;

  // clean possible markdown fences
  const cleaned = text.replace(/```json|```/g, "").trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (error) {
    throw new Error("AI did not return valid JSON: " + cleaned);
  }

  return parsed;
}

export async function POST(request) {
  try {
    const { userId } = getAuth(request);

    const isSeller = await authSeller(userId);
    if (!isSeller) {
      return NextResponse.json(
        { error: "not authorized" },
        { status: 401 }
      );
    }

    const { base64Image, mimeType } = await request.json();

    const result = await main(base64Image, mimeType);

    return NextResponse.json(result);

  } catch (error) {
    console.error("GEMINI ERROR:", error);

    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}