import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/*
|--------------------------------------------------------------------------
| GET SELLERS WAITING FOR VERIFICATION
|--------------------------------------------------------------------------
*/
export async function GET(request) {
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
        { error: "Administrator access is required." },
        { status: 403 }
      );
    }

    const stores = await prisma.store.findMany({
      where: {
        OR: [
          {
            registeredBusinessName: {
              not: null,
            },
          },
          {
            taxIdentificationNumber: {
              not: null,
            },
          },
          {
            payoutMethod: {
              not: null,
            },
          },
        ],
      },

      select: {
        id: true,
        name: true,
        username: true,
        logo: true,
        email: true,
        contact: true,
        status: true,
        isActive: true,

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

        createdAt: true,
        updatedAt: true,

        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },

        _count: {
          select: {
            Order: true,
            Product: true,
          },
        },
      },

      orderBy: [
        {
          businessVerified: "asc",
        },
        {
          updatedAt: "desc",
        },
      ],
    });

    const summary = {
      total: stores.length,

      verified: stores.filter(
        (store) => store.businessVerified
      ).length,

      pending: stores.filter(
        (store) =>
          !store.businessVerified &&
          Boolean(
            store.registeredBusinessName &&
              store.taxIdentificationNumber &&
              store.payoutMethod
          )
      ).length,

      incomplete: stores.filter(
        (store) =>
          !store.registeredBusinessName ||
          !store.taxIdentificationNumber ||
          !store.payoutMethod
      ).length,
    };

    return NextResponse.json({
      stores,
      summary,
    });
  } catch (error) {
    console.error(
      "GET SELLER VERIFICATION ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Failed to load seller verification requests.",
      },
      { status: 500 }
    );
  }
}

/*
|--------------------------------------------------------------------------
| APPROVE OR REJECT SELLER VERIFICATION
|--------------------------------------------------------------------------
*/
export async function PATCH(request) {
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
        { error: "Administrator access is required." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const storeId = String(
      body.storeId || ""
    ).trim();

    const action = String(
      body.action || ""
    )
      .trim()
      .toUpperCase();

    if (!storeId) {
      return NextResponse.json(
        { error: "Store ID is required." },
        { status: 400 }
      );
    }

    if (!["APPROVE", "REJECT"].includes(action)) {
      return NextResponse.json(
        {
          error:
            "Action must be either APPROVE or REJECT.",
        },
        { status: 400 }
      );
    }

    const store = await prisma.store.findUnique({
      where: {
        id: storeId,
      },

      select: {
        id: true,
        userId: true,
        name: true,

        registeredBusinessName: true,
        taxIdentificationNumber: true,

        payoutMethod: true,
        payoutAccountName: true,
        payoutPhone: true,
        payoutNetwork: true,
        payoutBankCode: true,
        payoutAccountNumber: true,
      },
    });

    if (!store) {
      return NextResponse.json(
        { error: "Seller store was not found." },
        { status: 404 }
      );
    }

    if (action === "APPROVE") {
      const validationError =
        validateSellerPayoutDetails(store);

      if (validationError) {
        return NextResponse.json(
          { error: validationError },
          { status: 400 }
        );
      }

      const updatedStore =
        await prisma.store.update({
          where: {
            id: store.id,
          },

          data: {
            businessVerified: true,
            businessVerifiedAt: new Date(),
            businessVerifiedBy: userId,
          },

          select: {
            id: true,
            name: true,
            registeredBusinessName: true,
            businessVerified: true,
            businessVerifiedAt: true,
            payoutMethod: true,
            payoutNetwork: true,
            payoutPhone: true,
          },
        });

      await prisma.notification.createMany({
        data: [
          {
            title: "Seller Verification Approved",
            message: `${store.registeredBusinessName || store.name} has been approved for marketplace payouts.`,
            type: "STORE",
            role: "ADMIN",
            storeId: store.id,
            link: `/admin/seller-verification`,
          },
          {
            title: "Business Verification Approved",
            message:
              "Your business and payout details have been approved. You are now eligible for seller payouts after fulfilled deliveries.",
            type: "STORE",
            role: "SELLER",
            storeId: store.id,
            link: "/store/payout-settings",
          },
        ],
      });

      return NextResponse.json({
        message:
          "Seller business verification approved.",
        store: updatedStore,
      });
    }

    const updatedStore = await prisma.store.update({
      where: {
        id: store.id,
      },

      data: {
        businessVerified: false,
        businessVerifiedAt: null,
        businessVerifiedBy: null,
        paystackRecipientCode: null,
      },

      select: {
        id: true,
        name: true,
        registeredBusinessName: true,
        businessVerified: true,
        businessVerifiedAt: true,
      },
    });

    await prisma.notification.createMany({
      data: [
        {
          title: "Seller Verification Rejected",
          message: `${store.registeredBusinessName || store.name} was not approved for marketplace payouts.`,
          type: "STORE",
          role: "ADMIN",
          storeId: store.id,
          link: "/admin/seller-verification",
        },
        {
          title: "Business Verification Requires Changes",
          message:
            "Your business or payout information could not be approved. Review your details and submit them again.",
          type: "STORE",
          role: "SELLER",
          storeId: store.id,
          link: "/store/payout-settings",
        },
      ],
    });

    return NextResponse.json({
      message:
        "Seller business verification rejected.",
      store: updatedStore,
    });
  } catch (error) {
    console.error(
      "UPDATE SELLER VERIFICATION ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Failed to update seller verification.",
      },
      { status: 500 }
    );
  }
}

function validateSellerPayoutDetails(store) {
  if (!store.registeredBusinessName) {
    return "The seller has not provided a registered business name.";
  }

  if (!store.taxIdentificationNumber) {
    return "The seller has not provided a Tax Identification Number.";
  }

  if (!store.payoutMethod) {
    return "The seller has not selected a payout method.";
  }

  if (!store.payoutAccountName) {
    return "The seller has not provided a payout account name.";
  }

  if (store.payoutMethod === "MOBILE_MONEY") {
    if (!store.payoutNetwork) {
      return "The seller has not selected a Mobile Money network.";
    }

    if (!store.payoutPhone) {
      return "The seller has not provided a Mobile Money phone number.";
    }
  }

  if (store.payoutMethod === "BANK_ACCOUNT") {
    if (!store.payoutBankCode) {
      return "The seller has not provided a bank code.";
    }

    if (!store.payoutAccountNumber) {
      return "The seller has not provided a bank account number.";
    }
  }

  return null;
}