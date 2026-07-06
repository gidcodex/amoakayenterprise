import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

async function getOrCreateSettings() {
  let settings = await prisma.adminSettings.findFirst();

  if (!settings) {
    settings = await prisma.adminSettings.create({
      data: {},
    });
  }

  return settings;
}

export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    const isAdmin = await authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    const settings = await getOrCreateSettings();

    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const { userId } = getAuth(request);
    const isAdmin = await authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    const body = await request.json();
    const existing = await getOrCreateSettings();

    const settings = await prisma.adminSettings.update({
      where: { id: existing.id },
      data: {
        marketplaceOpen: body.marketplaceOpen,
        allowSellerApplications: body.allowSellerApplications,
        autoApproveStores: body.autoApproveStores,
        allowCOD: body.allowCOD,
        allowStripe: body.allowStripe,
        shippingFee: Number(body.shippingFee),
        plusFreeShipping: body.plusFreeShipping,
        monthlyRevenueGoal: Number(body.monthlyRevenueGoal),
        supportEmail: body.supportEmail,
        maintenanceMessage: body.maintenanceMessage,
      },
    });

    return NextResponse.json({
      message: "Settings updated successfully.",
      settings,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}