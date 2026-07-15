import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const allowedPayoutMethods = [
  "MOBILE_MONEY",
  "BANK_ACCOUNT",
];

const allowedNetworks = [
  "MTN",
  "TELECEL",
  "AIRTELTIGO",
];

export async function GET(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json(
        { error: "Not authorized." },
        { status: 401 }
      );
    }

    const store = await prisma.store.findUnique({
      where: {
        userId,
      },
      select: {
        id: true,
        name: true,
        registeredBusinessName: true,
        taxIdentificationNumber: true,
        businessVerified: true,
        businessVerifiedAt: true,
        businessVerifiedBy: true,
        payoutMethod: true,
        payoutAccountName: true,
        payoutPhone: true,
        payoutNetwork: true,
        payoutBankCode: true,
        payoutAccountNumber: true,
        paystackRecipientCode: true,
      },
    });

    if (!store) {
      return NextResponse.json(
        { error: "Seller store was not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      payoutSettings: store,
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

export async function POST(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json(
        { error: "Not authorized." },
        { status: 401 }
      );
    }

    const store = await prisma.store.findUnique({
      where: {
        userId,
      },
      select: {
        id: true,
        businessVerified: true,
      },
    });

    if (!store) {
      return NextResponse.json(
        { error: "Seller store was not found." },
        { status: 404 }
      );
    }

    const body = await request.json();

    const registeredBusinessName = String(
      body.registeredBusinessName || ""
    ).trim();

    const taxIdentificationNumber = String(
      body.taxIdentificationNumber || ""
    ).trim();

    const payoutMethod = String(
      body.payoutMethod || ""
    ).trim();

    const payoutAccountName = String(
      body.payoutAccountName || ""
    ).trim();

    const payoutPhone = String(
      body.payoutPhone || ""
    ).trim();

    const payoutNetwork = body.payoutNetwork
      ? String(body.payoutNetwork).trim()
      : null;

    const payoutBankCode = String(
      body.payoutBankCode || ""
    ).trim();

    const payoutAccountNumber = String(
      body.payoutAccountNumber || ""
    ).trim();

    if (!registeredBusinessName) {
      return NextResponse.json(
        {
          error:
            "Registered business name is required.",
        },
        { status: 400 }
      );
    }

    if (!taxIdentificationNumber) {
      return NextResponse.json(
        {
          error:
            "Tax Identification Number is required.",
        },
        { status: 400 }
      );
    }

    if (
      !allowedPayoutMethods.includes(payoutMethod)
    ) {
      return NextResponse.json(
        {
          error:
            "Please select a valid payout method.",
        },
        { status: 400 }
      );
    }

    if (!payoutAccountName) {
      return NextResponse.json(
        {
          error:
            "Payout account name is required.",
        },
        { status: 400 }
      );
    }

    if (payoutMethod === "MOBILE_MONEY") {
      if (
        !payoutNetwork ||
        !allowedNetworks.includes(payoutNetwork)
      ) {
        return NextResponse.json(
          {
            error:
              "Please select a valid Mobile Money network.",
          },
          { status: 400 }
        );
      }

      if (!payoutPhone) {
        return NextResponse.json(
          {
            error:
              "Mobile Money phone number is required.",
          },
          { status: 400 }
        );
      }
    }

    if (payoutMethod === "BANK_ACCOUNT") {
      if (!payoutBankCode) {
        return NextResponse.json(
          {
            error: "Bank code is required.",
          },
          { status: 400 }
        );
      }

      if (!payoutAccountNumber) {
        return NextResponse.json(
          {
            error:
              "Bank account number is required.",
          },
          { status: 400 }
        );
      }
    }

    /*
     * If a seller changes verified business or payout
     * details, admin verification must be performed again.
     */
    const updatedStore = await prisma.store.update({
      where: {
        id: store.id,
      },
      data: {
        registeredBusinessName,
        taxIdentificationNumber,
        payoutMethod,
        payoutAccountName,

        payoutPhone:
          payoutMethod === "MOBILE_MONEY"
            ? payoutPhone
            : null,

        payoutNetwork:
          payoutMethod === "MOBILE_MONEY"
            ? payoutNetwork
            : null,

        payoutBankCode:
          payoutMethod === "BANK_ACCOUNT"
            ? payoutBankCode
            : null,

        payoutAccountNumber:
          payoutMethod === "BANK_ACCOUNT"
            ? payoutAccountNumber
            : null,

        businessVerified: false,
        businessVerifiedAt: null,
        businessVerifiedBy: null,

        /*
         * The Paystack recipient must be recreated after
         * payout information changes.
         */
        paystackRecipientCode: null,
      },
      select: {
        id: true,
        name: true,
        registeredBusinessName: true,
        taxIdentificationNumber: true,
        businessVerified: true,
        businessVerifiedAt: true,
        payoutMethod: true,
        payoutAccountName: true,
        payoutPhone: true,
        payoutNetwork: true,
        payoutBankCode: true,
        payoutAccountNumber: true,
      },
    });

    await prisma.notification.create({
      data: {
        title: "Seller Verification Required",
        message: `${registeredBusinessName} submitted payout and business details for verification.`,
        type: "STORE",
        role: "ADMIN",
        storeId: store.id,
        link: `/admin/seller-verification/${store.id}`,
      },
    });

    return NextResponse.json({
      message:
        "Payout settings saved. Your information is awaiting administrator verification.",
      payoutSettings: updatedStore,
    });
  } catch (error) {
    console.error("SAVE PAYOUT SETTINGS ERROR:", error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Failed to save payout settings.",
      },
      { status: 500 }
    );
  }
}