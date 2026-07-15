import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId || !(await authAdmin(userId))) {
      return NextResponse.json(
        { error: "Administrator access is required." },
        { status: 403 }
      );
    }

    const settings =
      (await prisma.adminSettings.findFirst()) ||
      (await prisma.adminSettings.create({
        data: {},
      }));

    return NextResponse.json({
      payoutSettings: {
        sellerInitialReleasePercent:
          settings.sellerInitialReleasePercent,
        sellerFinalReleasePercent:
          settings.sellerFinalReleasePercent,
        marketplaceCommissionPercent:
          settings.marketplaceCommissionPercent,
      },
    });
  } catch (error) {
    console.error("GET PAYOUT SETTINGS ERROR:", error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Failed to load payout settings.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId || !(await authAdmin(userId))) {
      return NextResponse.json(
        { error: "Administrator access is required." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const initial = Number(
      body.sellerInitialReleasePercent
    );

    const final = Number(
      body.sellerFinalReleasePercent
    );

    const commission = Number(
      body.marketplaceCommissionPercent
    );

    const percentages = [
      initial,
      final,
      commission,
    ];

    if (
      percentages.some(
        (value) =>
          !Number.isFinite(value) ||
          value < 0 ||
          value > 100
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Every percentage must be between 0 and 100.",
        },
        { status: 400 }
      );
    }

    const total = Number(
      (initial + final + commission).toFixed(2)
    );

    if (total !== 100) {
      return NextResponse.json(
        {
          error: `The payout percentages must total 100%. The current total is ${total}%.`,
        },
        { status: 400 }
      );
    }

    const existing =
      await prisma.adminSettings.findFirst();

    const settings = existing
      ? await prisma.adminSettings.update({
          where: {
            id: existing.id,
          },
          data: {
            sellerInitialReleasePercent:
              initial,
            sellerFinalReleasePercent:
              final,
            marketplaceCommissionPercent:
              commission,
          },
        })
      : await prisma.adminSettings.create({
          data: {
            sellerInitialReleasePercent:
              initial,
            sellerFinalReleasePercent:
              final,
            marketplaceCommissionPercent:
              commission,
          },
        });

    return NextResponse.json({
      message:
        "Marketplace payout percentages updated successfully.",
      payoutSettings: {
        sellerInitialReleasePercent:
          settings.sellerInitialReleasePercent,
        sellerFinalReleasePercent:
          settings.sellerFinalReleasePercent,
        marketplaceCommissionPercent:
          settings.marketplaceCommissionPercent,
      },
    });
  } catch (error) {
    console.error("UPDATE PAYOUT SETTINGS ERROR:", error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Failed to update payout settings.",
      },
      { status: 500 }
    );
  }
}