import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";
import {
  createPaystackBankRecipient,
  createPaystackMobileMoneyRecipient,
} from "@/lib/payments/paystack-transfer";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json(
        { error: "Not authorized." },
        { status: 401 }
      );
    }

    const isAdmin = await authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json(
        {
          error:
            "Administrator access is required.",
        },
        { status: 403 }
      );
    }

    const { storeId } = await request.json();

    if (!storeId) {
      return NextResponse.json(
        { error: "Store ID is required." },
        { status: 400 }
      );
    }

    const store = await prisma.store.findUnique({
      where: {
        id: storeId,
      },
      select: {
        id: true,
        name: true,
        businessVerified: true,
        registeredBusinessName: true,
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

    if (!store.businessVerified) {
      return NextResponse.json(
        {
          error:
            "The seller must be verified before creating a payout recipient.",
        },
        { status: 400 }
      );
    }

    if (store.paystackRecipientCode) {
      return NextResponse.json({
        message:
          "This seller already has a Paystack recipient.",
        recipientCode:
          store.paystackRecipientCode,
      });
    }

    let paystackResponse;

    if (store.payoutMethod === "MOBILE_MONEY") {
      paystackResponse =
        await createPaystackMobileMoneyRecipient({
          accountName:
            store.payoutAccountName,
          phone: store.payoutPhone,
          network: store.payoutNetwork,
          description: `Seller payout recipient for ${
            store.registeredBusinessName ||
            store.name
          }`,
        });
    } else if (
      store.payoutMethod === "BANK_ACCOUNT"
    ) {
      paystackResponse =
        await createPaystackBankRecipient({
          accountName:
            store.payoutAccountName,
          accountNumber:
            store.payoutAccountNumber,
          bankCode: store.payoutBankCode,
          description: `Seller payout recipient for ${
            store.registeredBusinessName ||
            store.name
          }`,
        });
    } else {
      return NextResponse.json(
        {
          error:
            "The seller has not selected a valid payout method.",
        },
        { status: 400 }
      );
    }

    const recipientCode =
      paystackResponse?.data?.recipient_code;

    if (!recipientCode) {
      throw new Error(
        "Paystack did not return a recipient code."
      );
    }

    const updatedStore =
      await prisma.store.update({
        where: {
          id: store.id,
        },
        data: {
          paystackRecipientCode:
            recipientCode,
        },
        select: {
          id: true,
          name: true,
          paystackRecipientCode: true,
        },
      });

    await prisma.sellerPayout.updateMany({
      where: {
        storeId: store.id,
        paystackRecipientCode: null,
      },
      data: {
        paystackRecipientCode:
          recipientCode,
      },
    });

    return NextResponse.json({
      message:
        "Paystack payout recipient created successfully.",
      recipientCode,
      store: updatedStore,
    });
  } catch (error) {
    console.error(
      "CREATE PAYSTACK RECIPIENT ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Failed to create Paystack payout recipient.",
      },
      { status: 500 }
    );
  }
}