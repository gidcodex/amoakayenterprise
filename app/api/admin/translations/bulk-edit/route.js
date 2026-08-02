import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const SUPPORTED_LANGUAGES = [
  "gaa",
  "tw",
  "ee",
  "ha",
];

const SUPPORTED_STATUSES = [
  "DRAFT",
  "REVIEW_REQUIRED",
  "APPROVED",
  "REJECTED",
];

function normalizeText(value) {
  return typeof value === "string"
    ? value.trim()
    : "";
}

export async function PUT(request) {
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

    const receivedEntries = Array.isArray(
      body.entries
    )
      ? body.entries
      : [];

    if (receivedEntries.length === 0) {
      return NextResponse.json(
        {
          error:
            "At least one translation entry is required.",
        },
        { status: 400 }
      );
    }

    if (receivedEntries.length > 100) {
      return NextResponse.json(
        {
          error:
            "A maximum of 100 entries can be updated at once.",
        },
        { status: 400 }
      );
    }

    const preparedEntries = receivedEntries
      .map((entry) => {
        const entryId = normalizeText(
          entry?.entryId
        );

        const values = Array.isArray(
          entry?.values
        )
          ? entry.values
              .map((value) => ({
                language: normalizeText(
                  value?.language
                ),
                translation: normalizeText(
                  value?.translation
                ),
                status:
                  normalizeText(
                    value?.status
                  ) || "DRAFT",
              }))
              .filter((value) =>
                SUPPORTED_LANGUAGES.includes(
                  value.language
                )
              )
          : [];

        return {
          entryId,
          values,
        };
      })
      .filter((entry) => entry.entryId);

    if (preparedEntries.length === 0) {
      return NextResponse.json(
        {
          error:
            "No valid translation entries were supplied.",
        },
        { status: 400 }
      );
    }

    for (const entry of preparedEntries) {
      for (const value of entry.values) {
        if (
          !SUPPORTED_STATUSES.includes(
            value.status
          )
        ) {
          return NextResponse.json(
            {
              error: `Invalid status: ${value.status}`,
            },
            { status: 400 }
          );
        }
      }
    }

    const entryIds = preparedEntries.map(
      (entry) => entry.entryId
    );

    const existingEntries =
      await prisma.translationEntry.findMany({
        where: {
          id: {
            in: entryIds,
          },
          isActive: true,
        },
        select: {
          id: true,
          sourceText: true,
        },
      });

    const existingById = new Map(
      existingEntries.map((entry) => [
        entry.id,
        entry,
      ])
    );

    const missingEntryIds = entryIds.filter(
      (entryId) =>
        !existingById.has(entryId)
    );

    if (missingEntryIds.length > 0) {
      return NextResponse.json(
        {
          error:
            "One or more translation entries were not found.",
          missingEntryIds,
        },
        { status: 404 }
      );
    }

    let savedValues = 0;
    let removedValues = 0;

    await prisma.$transaction(
      async (transaction) => {
        for (const entry of preparedEntries) {
          const existingEntry =
            existingById.get(entry.entryId);

          for (const value of entry.values) {
            if (!value.translation) {
              const result =
                await transaction.translationValue.deleteMany(
                  {
                    where: {
                      entryId: entry.entryId,
                      language:
                        value.language,
                    },
                  }
                );

              removedValues += result.count;
              continue;
            }

            const reviewed =
              value.status === "APPROVED" ||
              value.status === "REJECTED";

            await transaction.translationValue.upsert({
              where: {
                entryId_language: {
                  entryId: entry.entryId,
                  language: value.language,
                },
              },
              update: {
                translation:
                  value.translation,
                sourceTextUsed:
                  existingEntry.sourceText,
                status: value.status,
                origin: "MANUAL",
                reviewedBy: reviewed
                  ? userId
                  : null,
                reviewedAt: reviewed
                  ? new Date()
                  : null,
              },
              create: {
                entryId: entry.entryId,
                language:
                  value.language,
                translation:
                  value.translation,
                sourceTextUsed:
                  existingEntry.sourceText,
                status: value.status,
                origin: "MANUAL",
                reviewedBy: reviewed
                  ? userId
                  : null,
                reviewedAt: reviewed
                  ? new Date()
                  : null,
              },
            });

            savedValues += 1;
          }
        }
      }
    );

    const updatedEntries =
      await prisma.translationEntry.findMany({
        where: {
          id: {
            in: entryIds,
          },
        },
        include: {
          values: {
            orderBy: {
              language: "asc",
            },
          },
        },
        orderBy: {
          key: "asc",
        },
      });

    return NextResponse.json({
      message:
        "Section translations saved successfully.",
      summary: {
        entriesProcessed:
          preparedEntries.length,
        valuesSaved: savedValues,
        valuesRemoved: removedValues,
      },
      entries: updatedEntries,
    });
  } catch (error) {
    console.error(
      "Bulk translation edit error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Unable to save section translations.",
      },
      { status: 500 }
    );
  }
}