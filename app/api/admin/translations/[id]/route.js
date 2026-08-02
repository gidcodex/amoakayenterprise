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

/*
 * Load one translation entry.
 */
export async function GET(request, context) {
  try {
    const { userId } = getAuth(request);
    const isAdmin = await authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Not authorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    const entry =
      await prisma.translationEntry.findUnique({
        where: {
          id,
        },
        include: {
          values: {
            orderBy: {
              language: "asc",
            },
          },
          queueItems: {
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });

    if (!entry) {
      return NextResponse.json(
        {
          error:
            "Translation entry was not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      entry,
    });
  } catch (error) {
    console.error(
      "Translation entry GET error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Unable to load the translation entry.",
      },
      { status: 500 }
    );
  }
}

/*
 * Update English source information and all
 * language translations in one request.
 */
export async function PUT(request, context) {
  try {
    const { userId } = getAuth(request);
    const isAdmin = await authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Not authorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();

    const existingEntry =
      await prisma.translationEntry.findUnique({
        where: {
          id,
        },
        include: {
          values: true,
        },
      });

    if (!existingEntry) {
      return NextResponse.json(
        {
          error:
            "Translation entry was not found.",
        },
        { status: 404 }
      );
    }

    const sourceText =
      normalizeText(body.sourceText) ||
      existingEntry.sourceText;

    const description =
      body.description === undefined
        ? existingEntry.description
        : normalizeText(body.description) ||
          null;

    const moduleName =
      normalizeText(body.module) ||
      existingEntry.module;

    const section =
      normalizeText(body.section) ||
      existingEntry.section;

    const receivedValues = Array.isArray(
      body.values
    )
      ? body.values
      : [];

    const preparedValues = receivedValues
      .map((item) => {
        const language = normalizeText(
          item?.language
        );

        const translation = normalizeText(
          item?.translation
        );

        const status =
          normalizeText(item?.status) ||
          "DRAFT";

        return {
          language,
          translation,
          status,
        };
      })
      .filter((item) =>
        SUPPORTED_LANGUAGES.includes(
          item.language
        )
      );

    const invalidStatus =
      preparedValues.find(
        (item) =>
          !SUPPORTED_STATUSES.includes(
            item.status
          )
      );

    if (invalidStatus) {
      return NextResponse.json(
        {
          error: `Invalid translation status: ${invalidStatus.status}`,
        },
        { status: 400 }
      );
    }

    await prisma.$transaction(
      async (transaction) => {
        await transaction.translationEntry.update({
          where: {
            id,
          },
          data: {
            module: moduleName,
            section,
            sourceText,
            description,
            isActive:
              typeof body.isActive === "boolean"
                ? body.isActive
                : existingEntry.isActive,
          },
        });

        for (const item of preparedValues) {
          /*
           * Empty text removes the language value so
           * the dashboard returns it to MISSING.
           */
          if (!item.translation) {
            await transaction.translationValue.deleteMany({
              where: {
                entryId: id,
                language: item.language,
              },
            });

            continue;
          }

          const reviewed =
            item.status === "APPROVED" ||
            item.status === "REJECTED";

          await transaction.translationValue.upsert({
            where: {
              entryId_language: {
                entryId: id,
                language: item.language,
              },
            },
            update: {
              translation: item.translation,
              sourceTextUsed: sourceText,
              status: item.status,
              origin: "MANUAL",
              reviewedBy: reviewed
                ? userId
                : null,
              reviewedAt: reviewed
                ? new Date()
                : null,
            },
            create: {
              entryId: id,
              language: item.language,
              translation: item.translation,
              sourceTextUsed: sourceText,
              status: item.status,
              origin: "MANUAL",
              reviewedBy: reviewed
                ? userId
                : null,
              reviewedAt: reviewed
                ? new Date()
                : null,
            },
          });
        }
      }
    );

    const updatedEntry =
      await prisma.translationEntry.findUnique({
        where: {
          id,
        },
        include: {
          values: {
            orderBy: {
              language: "asc",
            },
          },
          queueItems: {
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });

    return NextResponse.json({
      message:
        "Translations saved successfully.",
      entry: updatedEntry,
    });
  } catch (error) {
    console.error(
      "Translation entry PUT error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Unable to save translations.",
      },
      { status: 500 }
    );
  }
}