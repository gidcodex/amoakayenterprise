import { PrismaClient } from "@prisma/client";
import { translations } from "../lib/translations.js";

const prisma = new PrismaClient();

const TARGET_LANGUAGES = ["tw", "ha", "ee", "gaa"];

function flattenObject(object, prefix = "") {
  const entries = [];

  for (const [key, value] of Object.entries(object ?? {})) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value)
    ) {
      entries.push(...flattenObject(value, fullKey));
      continue;
    }

    if (typeof value === "string") {
      entries.push({
        key: fullKey,
        value,
      });
    }
  }

  return entries;
}

function getNestedValue(object, keyPath) {
  return keyPath
    .split(".")
    .reduce(
      (current, key) => current?.[key],
      object
    );
}

function getSection(key) {
  const parts = key.split(".");

  if (parts[0] === "home" && parts[1]) {
    return `home.${parts[1]}`;
  }

  if (
    parts[0] === "productDetails" &&
    parts[1]
  ) {
    return `productDetails.${parts[1]}`;
  }

  if (
    parts[0] === "sellerDashboard" &&
    parts[1]
  ) {
    return `sellerDashboard.${parts[1]}`;
  }

  if (
    parts[0] === "customerDashboard" &&
    parts[1]
  ) {
    return `customerDashboard.${parts[1]}`;
  }

  if (parts[0] === "admin" && parts[1]) {
    return `admin.${parts[1]}`;
  }

  return parts[0] || "general";
}

function getModule(key) {
  if (key.startsWith("sellerDashboard.")) {
    return "seller";
  }

  if (key.startsWith("admin.")) {
    return "admin";
  }

  if (
    key.startsWith("customerDashboard.") ||
    key.startsWith("cart.") ||
    key.startsWith("checkout.") ||
    key.startsWith("orders.") ||
    key.startsWith("tracking.")
  ) {
    return "customer";
  }

  return "frontend";
}

async function importTranslations() {
  const englishEntries = flattenObject(
    translations.en
  );

  let createdEntries = 0;
  let updatedEntries = 0;
  let importedValues = 0;
  let skippedValues = 0;

  console.log(
    `Importing ${englishEntries.length} English translation entries...\n`
  );

  for (const englishEntry of englishEntries) {
    const key = englishEntry.key;
    const sourceText = englishEntry.value;
    const moduleName = getModule(key);
    const section = getSection(key);

    const existingEntry =
      await prisma.translationEntry.findUnique({
        where: { key },
        select: { id: true },
      });

    const entry =
      await prisma.translationEntry.upsert({
        where: { key },
        update: {
          module: moduleName,
          section,
          sourceText,
          isActive: true,
        },
        create: {
          key,
          module: moduleName,
          section,
          sourceText,
          isActive: true,
        },
      });

    if (existingEntry) {
      updatedEntries += 1;
    } else {
      createdEntries += 1;
    }

    for (const language of TARGET_LANGUAGES) {
      const translatedValue = getNestedValue(
        translations[language],
        key
      );

      if (
        typeof translatedValue !== "string" ||
        !translatedValue.trim()
      ) {
        skippedValues += 1;
        continue;
      }

      await prisma.translationValue.upsert({
        where: {
          entryId_language: {
            entryId: entry.id,
            language,
          },
        },
        update: {
          translation: translatedValue.trim(),
          sourceTextUsed: sourceText,
          status: "APPROVED",
          origin: "IMPORTED",
          reviewedAt: new Date(),
        },
        create: {
          entryId: entry.id,
          language,
          translation: translatedValue.trim(),
          sourceTextUsed: sourceText,
          status: "APPROVED",
          origin: "IMPORTED",
          reviewedAt: new Date(),
        },
      });

      importedValues += 1;
    }

    console.log(
      `✓ ${key} [${moduleName} → ${section}]`
    );
  }

  console.log("\n========================================");
  console.log("TRANSLATION DATABASE IMPORT");
  console.log("========================================");
  console.log(`English entries created : ${createdEntries}`);
  console.log(`English entries updated : ${updatedEntries}`);
  console.log(`Values imported         : ${importedValues}`);
  console.log(`Empty values skipped    : ${skippedValues}`);
  console.log("========================================");
}

importTranslations()
  .catch((error) => {
    console.error(
      "\nTranslation database import failed:"
    );

    console.error(error?.stack || error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });