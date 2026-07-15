import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

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

  const payouts = await prisma.sellerPayout.findMany({
  include: {
    order: true,

    store: {
      select: {
        id: true,
        name: true,
        businessVerified: true,
        payoutNetwork: true,
        payoutPhone: true,
        paystackRecipientCode: true,
      },
    },
  },

  orderBy: {
    createdAt: "desc",
  },
});

const summary = {
  heldAmount: 0,
  releasedAmount: 0,
  commission: 0,
  pending: 0,
};

for (const payout of payouts) {
  const gross = Number(payout.grossAmount);

  summary.commission += Number(
    payout.commissionAmount
  );

  if (
    payout.status === "HELD" ||
    payout.status === "PARTIALLY_PAID"
  ) {
    summary.heldAmount += gross;
    summary.pending++;
  }

  if (payout.status === "PAID") {
    summary.releasedAmount += gross;
  }
}

return NextResponse.json({
  payouts,
  summary,
});

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: error.code || error.message,
      },
      {
        status: 400,
      }
    );
  }
}