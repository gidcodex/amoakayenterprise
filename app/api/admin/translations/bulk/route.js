import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const allowedModules = [
  "frontend",
  "customer",
  "seller",
  "admin",
];

function normalizeText(value) {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function toCamelCase(value) {
  const words = normalizeText(value)
    /*
     * Preserve existing camelCase names.
     * productDetails becomes product Details before
     * being converted back to productDetails.
     */
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

function normalizeSectionPath(value) {
  return normalizeText(value)
    .split(".")
    .map(toCamelCase)
    .filter(Boolean)
    .join(".");
}

function buildTranslationKey({
  section,
  label,
}) {
  const normalizedSection =
    normalizeSectionPath(section);

  const labelKey = toCamelCase(label);

  if (!normalizedSection || !labelKey) {
    return "";
  }

  return `${normalizedSection}.${labelKey}`;
}

function removeDuplicateLabels(labels) {
  const seen = new Set();

  return labels.filter((label) => {
    const normalized = label.toLowerCase();

    if (seen.has(normalized)) {
      return false;
    }

    seen.add(normalized);
    return true;
  });
}

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const isAdmin = await authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Not authorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const moduleName =
      normalizeText(body.module) || "frontend";

    const section = normalizeSectionPath(
      body.section
    );

    const description = normalizeText(
      body.description
    );

    const overwriteExisting =
      body.overwriteExisting === true;

    if (!allowedModules.includes(moduleName)) {
      return NextResponse.json(
        {
          error:
            "Module must be frontend, customer, seller, or admin.",
        },
        { status: 400 }
      );
    }

    if (!section) {
      return NextResponse.json(
        {
          error:
            "A valid page or section is required.",
        },
        { status: 400 }
      );
    }

    const receivedLabels = Array.isArray(
      body.labels
    )
      ? body.labels
      : [];

    const labels = removeDuplicateLabels(
      receivedLabels
        .map(normalizeText)
        .filter(Boolean)
    );

    if (labels.length === 0) {
      return NextResponse.json(
        {
          error:
            "Add at least one English label.",
        },
        { status: 400 }
      );
    }

    if (labels.length > 100) {
      return NextResponse.json(
        {
          error:
            "A maximum of 100 labels can be created at once.",
        },
        { status: 400 }
      );
    }

    const preparedEntries = labels
      .map((sourceText) => ({
        key: buildTranslationKey({
          section,
          label: sourceText,
        }),
        sourceText,
      }))
      .filter((item) => item.key);

    const duplicateGeneratedKeys = new Set();
    const generatedKeyTracker = new Set();

    for (const item of preparedEntries) {
      if (generatedKeyTracker.has(item.key)) {
        duplicateGeneratedKeys.add(item.key);
      }

      generatedKeyTracker.add(item.key);
    }

    if (duplicateGeneratedKeys.size > 0) {
      return NextResponse.json(
        {
          error:
            "Some English labels generated identical keys.",
          duplicateKeys: Array.from(
            duplicateGeneratedKeys
          ),
        },
        { status: 400 }
      );
    }

    const existingEntries =
      await prisma.translationEntry.findMany({
        where: {
          key: {
            in: preparedEntries.map(
              (item) => item.key
            ),
          },
        },
        select: {
          id: true,
          key: true,
          sourceText: true,
        },
      });

    const existingByKey = new Map(
      existingEntries.map((entry) => [
        entry.key,
        entry,
      ])
    );

    const created = [];
    const updated = [];
    const skipped = [];

    await prisma.$transaction(
      async (transaction) => {
        for (const item of preparedEntries) {
          const existing =
            existingByKey.get(item.key);

          if (existing) {
            if (!overwriteExisting) {
              skipped.push({
                key: item.key,
                sourceText:
                  existing.sourceText,
                reason:
                  "Translation key already exists.",
              });

              continue;
            }

            const updatedEntry =
              await transaction.translationEntry.update({
                where: {
                  id: existing.id,
                },
                data: {
                  module: moduleName,
                  section,
                  sourceText:
                    item.sourceText,
                  description:
                    description || null,
                  isActive: true,
                },
              });

            updated.push(updatedEntry);
            continue;
          }

          const createdEntry =
            await transaction.translationEntry.create({
              data: {
                key: item.key,
                module: moduleName,
                section,
                sourceText:
                  item.sourceText,
                description:
                  description || null,
                isActive: true,
              },
            });

          created.push(createdEntry);
        }
      }
    );

    return NextResponse.json(
      {
        message:
          "Translation segment processed successfully.",
        segment: {
          module: moduleName,
          section,
        },
        summary: {
          requested: labels.length,
          created: created.length,
          updated: updated.length,
          skipped: skipped.length,
        },
        created,
        updated,
        skipped,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Bulk translation creation error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Unable to create the translation segment.",
      },
      { status: 500 }
    );
  }
}