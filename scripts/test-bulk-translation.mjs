import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function toCamelCase(value) {
  const words = normalizeText(value)
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/['’]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "";
  }

  return words
    .map((word, index) => {
      const normalizedWord =
        word.charAt(0).toUpperCase() +
        word.slice(1).toLowerCase();

      if (index === 0) {
        return (
          normalizedWord.charAt(0).toLowerCase() +
          normalizedWord.slice(1)
        );
      }

      return normalizedWord;
    })
    .join("");
}

function normalizeSection(section) {
  return normalizeText(section)
    .split(".")
    .map(toCamelCase)
    .filter(Boolean)
    .join(".");
}

function buildKey(section, label) {
  return `${normalizeSection(section)}.${toCamelCase(label)}`;
}

const moduleName = "frontend";

const section = "productDetails.purchase";

const description =
  "Purchase controls for Product Details.";

const labels = [
  "Add to Cart",
  "Buy Now",
  "Quantity",
  "In Stock",
  "Out of Stock",
  "Select Colour",
  "Select Storage",
];

async function main() {
  console.log("=================================");
  console.log("Bulk Translation Test");
  console.log("=================================\n");

  for (const label of labels) {
    const key = buildKey(section, label);

    const existing =
      await prisma.translationEntry.findUnique({
        where: {
          key,
        },
      });

    if (existing) {
      console.log(`⚠ Already exists: ${key}`);
      continue;
    }

    const entry =
      await prisma.translationEntry.create({
        data: {
          key,
          module: moduleName,
          section,
          sourceText: label,
          description,
          isActive: true,
        },
      });

    console.log(`✓ Created ${entry.key}`);
  }

  console.log("\nFinished.");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });