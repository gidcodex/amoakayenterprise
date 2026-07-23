import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

const EXCLUDED_FIRST_WORDS = new Set([
  "new",
  "original",
  "latest",
  "official",
  "quality",
  "premium",
  "portable",
  "wireless",
  "smart",
]);

function cleanText(value) {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function getLikelyBrand(productName) {
  const cleanedName = cleanText(productName);

  if (!cleanedName) {
    return null;
  }

  const words = cleanedName
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return null;
  }

  const firstWord = words[0];

  if (
    EXCLUDED_FIRST_WORDS.has(
      firstWord.toLowerCase()
    )
  ) {
    return words[1] || null;
  }

  return firstWord;
}

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: {
        inStock: true,
        stock: {
          gt: 0,
        },
        store: {
          isActive: true,
          status: "approved",
        },
      },

      select: {
        name: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    const productNames = [];
    const brands = new Set();

    products.forEach((product) => {
      const productName = cleanText(product.name);

      if (!productName) {
        return;
      }

      productNames.push(productName);

      const likelyBrand =
        getLikelyBrand(productName);

      if (likelyBrand) {
        brands.add(likelyBrand);
      }
    });

    return NextResponse.json({
      success: true,
      brands: [...brands].sort((a, b) =>
        a.localeCompare(b)
      ),
      productNames: [
        ...new Set(productNames),
      ].sort((a, b) => a.localeCompare(b)),
    });
  } catch (error) {
    console.error(
      "Adetɔ Boafo catalogue terms error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        brands: [],
        productNames: [],
        error:
          "Unable to load searchable catalogue terms.",
      },
      {
        status: 500,
      }
    );
  }
}