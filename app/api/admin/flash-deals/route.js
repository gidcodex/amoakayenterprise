import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

async function notifyWishlistedCustomers({
  productId,
  productName,
  originalPrice,
  dealPrice,
}) {
  const wishlistEntries = await prisma.wishlist.findMany({
    where: {
      productId,
    },
    select: {
      userId: true,
      productId: true,
    },
  });

  console.log("FLASH DEAL PRODUCT ID:", productId);
  console.log("MATCHING WISHLIST ENTRIES:", wishlistEntries);

  const uniqueUserIds = [
    ...new Set(
      wishlistEntries
        .map((entry) => entry.userId)
        .filter(Boolean)
    ),
  ];

  if (uniqueUserIds.length === 0) {
    console.log(
      "NO WISHLIST CUSTOMER FOUND FOR PRODUCT:",
      productId
    );

    return {
      count: 0,
      reason: "NO_WISHLIST_MATCH",
    };
  }

  const parsedOriginalPrice = Number(originalPrice);
  const parsedDealPrice = Number(dealPrice);

  const savings = Math.max(
    parsedOriginalPrice - parsedDealPrice,
    0
  );

  const currency =
    process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "GH₵";

  const result = await prisma.notification.createMany({
    data: uniqueUserIds.map((customerId) => ({
      title: "Flash Deal on your saved product",
      message:
        `${productName} from your wishlist is now available for ` +
        `${currency}${parsedDealPrice.toLocaleString("en-US")}. ` +
        `You save ${currency}${savings.toLocaleString("en-US")}.`,
      type: "FLASH_DEAL",
      role: "CUSTOMER",
      userId: customerId,
      storeId: null,
      link: `/product/${productId}`,
      isRead: false,
    })),
  });

  console.log(
    "FLASH DEAL NOTIFICATIONS CREATED:",
    result.count
  );

  return {
    count: result.count,
    reason: "SUCCESS",
  };
}

export async function GET(request) {
  try {
    const { userId } = getAuth(request);

    const isAdmin = await authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Not Authorized" },
        { status: 401 }
      );
    }

    const flashDeals = await prisma.flashDeal.findMany({
      include: {
        product: {
          include: {
            store: {
              select: {
                id: true,
                name: true,
              },
            },
            categoryRef: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      flashDeals,
    });
  } catch (error) {
    console.error("GET Flash Deals error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error.message ||
          "Unable to retrieve Flash Deals.",
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
        { error: "Not Authorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      productId,
      dealPrice,
      originalPrice,
      discountPercent,
      startsAt,
      endsAt,
      isFeatured,
    } = body;

    if (
      !productId ||
      dealPrice === undefined ||
      originalPrice === undefined ||
      !startsAt ||
      !endsAt
    ) {
      return NextResponse.json(
        {
          error:
            "Please complete all required fields.",
        },
        { status: 400 }
      );
    }

    const parsedDealPrice = Number(dealPrice);
    const parsedOriginalPrice =
      Number(originalPrice);

    if (
      Number.isNaN(parsedDealPrice) ||
      Number.isNaN(parsedOriginalPrice) ||
      parsedDealPrice <= 0 ||
      parsedOriginalPrice <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Deal price and original price must be valid positive numbers.",
        },
        { status: 400 }
      );
    }

    if (
      parsedDealPrice >= parsedOriginalPrice
    ) {
      return NextResponse.json(
        {
          error:
            "Deal price must be lower than the original price.",
        },
        { status: 400 }
      );
    }

    const parsedStartsAt = new Date(startsAt);
    const parsedEndsAt = new Date(endsAt);

    if (
      Number.isNaN(parsedStartsAt.getTime()) ||
      Number.isNaN(parsedEndsAt.getTime())
    ) {
      return NextResponse.json(
        {
          error:
            "Please provide valid Flash Deal dates.",
        },
        { status: 400 }
      );
    }

    if (parsedEndsAt <= parsedStartsAt) {
      return NextResponse.json(
        {
          error:
            "The Flash Deal end date must be later than the start date.",
        },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found." },
        { status: 404 }
      );
    }

    const existingFlashDeal =
      await prisma.flashDeal.findFirst({
        where: {
          productId,
          isActive: true,
        },
        select: {
          id: true,
        },
      });

    if (existingFlashDeal) {
      return NextResponse.json(
        {
          error:
            "This product already has an active Flash Deal.",
        },
        { status: 409 }
      );
    }

    const calculatedDiscountPercent =
      discountPercent !== undefined &&
      discountPercent !== null &&
      discountPercent !== ""
        ? Number(discountPercent)
        : Math.round(
            ((parsedOriginalPrice -
              parsedDealPrice) /
              parsedOriginalPrice) *
              100
          );

    if (
      Number.isNaN(calculatedDiscountPercent) ||
      calculatedDiscountPercent < 0 ||
      calculatedDiscountPercent > 100
    ) {
      return NextResponse.json(
        {
          error:
            "Discount percentage must be between 0 and 100.",
        },
        { status: 400 }
      );
    }

    const flashDeal =
      await prisma.flashDeal.create({
        data: {
          productId,
          originalPrice: parsedOriginalPrice,
          dealPrice: parsedDealPrice,
          discountPercent:
            calculatedDiscountPercent,
          startsAt: parsedStartsAt,
          endsAt: parsedEndsAt,
          isFeatured: Boolean(isFeatured),
          isActive: true,
          createdBy: userId,
        },
      });

const notificationResult =
  await notifyWishlistedCustomers({
    productId: product.id,
    productName: product.name,
    originalPrice: parsedOriginalPrice,
    dealPrice: parsedDealPrice,
  });

const notifiedCustomers =
  notificationResult.count;

   return NextResponse.json({
  success: true,
  message:
    notifiedCustomers > 0
      ? `Flash Deal created and ${notifiedCustomers} customer notification${
          notifiedCustomers === 1 ? "" : "s"
        } sent.`
      : "Flash Deal created, but no matching wishlist customer was found.",
  notifiedCustomers,
  notificationReason:
    notificationResult.reason,
  productId: product.id,
  flashDeal,
});

  } catch (error) {
    console.error(
      "Create Flash Deal error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error.message ||
          "Unable to create Flash Deal.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const { userId } = getAuth(request);

    const isAdmin = await authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Not authorized." },
        { status: 401 }
      );
    }

    const { flashDealId, isActive } =
      await request.json();

    if (
      !flashDealId ||
      typeof isActive !== "boolean"
    ) {
      return NextResponse.json(
        {
          error:
            "Flash Deal ID and status are required.",
        },
        { status: 400 }
      );
    }

    const existingDeal =
      await prisma.flashDeal.findUnique({
        where: {
          id: flashDealId,
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

    if (!existingDeal) {
      return NextResponse.json(
        { error: "Flash Deal not found." },
        { status: 404 }
      );
    }

    const updatedFlashDeal =
      await prisma.flashDeal.update({
        where: {
          id: flashDealId,
        },
        data: {
          isActive,
        },
      });

    let notifiedCustomers = 0;

    const dealWasResumed =
      isActive === true &&
      existingDeal.isActive === false;

    if (dealWasResumed) {
      try {
        notifiedCustomers =
          await notifyWishlistedCustomers({
            productId:
              existingDeal.product.id,
            productName:
              existingDeal.product.name,
            originalPrice:
              existingDeal.originalPrice,
            dealPrice:
              existingDeal.dealPrice,
          });
      } catch (notificationError) {
        console.error(
          "Resumed Flash Deal notification error:",
          notificationError
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: isActive
        ? notifiedCustomers > 0
          ? `Flash Deal resumed and ${notifiedCustomers} customer notification${
              notifiedCustomers === 1 ? "" : "s"
            } sent.`
          : "Flash Deal resumed successfully."
        : "Flash Deal paused successfully.",
      notifiedCustomers,
      flashDeal: updatedFlashDeal,
    });
  } catch (error) {
    console.error(
      "Update Flash Deal status error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error.message ||
          "Unable to update Flash Deal.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { userId } = getAuth(request);

    const isAdmin = await authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Not authorized." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(
      request.url
    );

    const flashDealId =
      searchParams.get("id");

    if (!flashDealId) {
      return NextResponse.json(
        {
          error:
            "Flash Deal ID is required.",
        },
        { status: 400 }
      );
    }

    const existingDeal =
      await prisma.flashDeal.findUnique({
        where: {
          id: flashDealId,
        },
        select: {
          id: true,
        },
      });

    if (!existingDeal) {
      return NextResponse.json(
        { error: "Flash Deal not found." },
        { status: 404 }
      );
    }

    await prisma.flashDeal.delete({
      where: {
        id: flashDealId,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "Flash Deal deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete Flash Deal error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error.message ||
          "Unable to delete Flash Deal.",
      },
      { status: 500 }
    );
  }
}