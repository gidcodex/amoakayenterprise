import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const supportedLanguages = ["tw", "ha", "ee", "gaa"];
const supportedStatuses = [
  "DRAFT",
  "REVIEW_REQUIRED",
  "APPROVED",
  "REJECTED",
];

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    const isAdmin = await authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Not authorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);

    const search = normalizeText(searchParams.get("search"));
    const moduleName = normalizeText(searchParams.get("module"));
    const section = normalizeText(searchParams.get("section"));
    const language = normalizeText(searchParams.get("language"));
    const status = normalizeText(searchParams.get("status"));

    const page = Math.max(
      Number(searchParams.get("page") || 1),
      1
    );

    const limit = Math.min(
      Math.max(
        Number(searchParams.get("limit") || 30),
        1
      ),
      100
    );

    const where = {
      isActive: true,
    };

    if (moduleName) {
      where.module = moduleName;
    }

    if (section) {
      where.section = section;
    }

    if (search) {
      where.OR = [
        {
          key: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          sourceText: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    const validLanguage =
      supportedLanguages.includes(language);

    const validStatus =
      supportedStatuses.includes(status);

    if (validLanguage || validStatus) {
      where.values = {
        some: {
          ...(validLanguage ? { language } : {}),
          ...(validStatus ? { status } : {}),
        },
      };
    }

    const [
      entries,
      total,
      sections,
      modules,
    ] = await prisma.$transaction([
      prisma.translationEntry.findMany({
        where,
        include: {
          values: {
            orderBy: {
              language: "asc",
            },
          },
          queueItems: {
            where: {
              status: {
                in: [
                  "PENDING",
                  "PROCESSING",
                  "FAILED",
                  "WAITING_FOR_QUOTA",
                ],
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
        orderBy: [
          {
            module: "asc",
          },
          {
            section: "asc",
          },
          {
            key: "asc",
          },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),

      prisma.translationEntry.count({
        where,
      }),

      prisma.translationEntry.findMany({
        where: {
          isActive: true,
          ...(moduleName
            ? { module: moduleName }
            : {}),
        },
        select: {
          section: true,
        },
        distinct: ["section"],
        orderBy: {
          section: "asc",
        },
      }),

      prisma.translationEntry.findMany({
        where: {
          isActive: true,
        },
        select: {
          module: true,
        },
        distinct: ["module"],
        orderBy: {
          module: "asc",
        },
      }),
    ]);

    return NextResponse.json({
      entries,
      modules: modules.map((item) => item.module),
      sections: sections.map((item) => item.section),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(
          Math.ceil(total / limit),
          1
        ),
      },
    });
  } catch (error) {
    console.error(
      "Admin translations GET error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Unable to load translations.",
      },
      { status: 500 }
    );
  }
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

    const key = normalizeText(body.key);
    const moduleName =
      normalizeText(body.module) || "frontend";
    const section = normalizeText(body.section);
    const sourceText = normalizeText(
      body.sourceText
    );
    const description = normalizeText(
      body.description
    );

    if (!key || !section || !sourceText) {
      return NextResponse.json(
        {
          error:
            "Key, section, and English source text are required.",
        },
        { status: 400 }
      );
    }

    const existingEntry =
      await prisma.translationEntry.findUnique({
        where: {
          key,
        },
      });

    if (existingEntry) {
      return NextResponse.json(
        {
          error:
            "A translation entry with this key already exists.",
        },
        { status: 409 }
      );
    }

    const entry =
      await prisma.translationEntry.create({
        data: {
          key,
          module: moduleName,
          section,
          sourceText,
          description: description || null,
        },
        include: {
          values: true,
          queueItems: true,
        },
      });

    return NextResponse.json(
      {
        message:
          "Translation entry created successfully.",
        entry,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Admin translations POST error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Unable to create the translation entry.",
      },
      { status: 500 }
    );
  }
}