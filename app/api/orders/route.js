import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { PaymentMethod } from "@prisma/client";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(request) {
  try {
    const { userId, has } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    const settings =
      (await prisma.adminSettings.findFirst()) ||
      (await prisma.adminSettings.create({ data: {} }));

    if (!settings.marketplaceOpen) {
      return NextResponse.json(
        { error: settings.maintenanceMessage },
        { status: 403 }
      );
    }

    let existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      const clerkUser = await fetch(
        `https://api.clerk.com/v1/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
          },
        }
      ).then((res) => res.json());

      existingUser = await prisma.user.create({
        data: {
          id: userId,
          name:
            `${clerkUser.first_name || ""} ${clerkUser.last_name || ""}`.trim() ||
            "New User",
          email: clerkUser.email_addresses?.[0]?.email_address || "",
          image: clerkUser.image_url || "",
          cart: {},
        },
      });
    }

    const { addressId, items, couponCode, paymentMethod } = await request.json();

    if (
      !addressId ||
      !paymentMethod ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        { error: "missing order details." },
        { status: 400 }
      );
    }

    if (paymentMethod === "COD" && !settings.allowCOD) {
      return NextResponse.json(
        { error: "Cash on delivery is currently disabled." },
        { status: 400 }
      );
    }

    if (paymentMethod === "STRIPE" && !settings.allowStripe) {
      return NextResponse.json(
        { error: "Online card payment is currently disabled." },
        { status: 400 }
      );
    }

    let coupon = null;

    if (couponCode) {
      coupon = await prisma.coupon.findUnique({
        where: { code: couponCode },
      });

      if (!coupon) {
        return NextResponse.json(
          { error: "Coupon not found" },
          { status: 400 }
        );
      }
    }

    if (couponCode && coupon.forNewUser) {
      const userorders = await prisma.order.findMany({
        where: { userId },
      });

      if (userorders.length > 0) {
        return NextResponse.json(
          { error: "Coupon valid for new users" },
          { status: 400 }
        );
      }
    }

    const isPlusMember = has({ plan: "plus" });

    if (couponCode && coupon.forMember && !isPlusMember) {
      return NextResponse.json(
        { error: "Coupon valid for members only" },
        { status: 400 }
      );
    }

    const ordersByStore = new Map();

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.id },
      });

      if (!product) {
        return NextResponse.json(
          { error: "One of the selected products was not found." },
          { status: 404 }
        );
      }

     let availableStock = product.stock;
     let selectedVariant = null;

  if (item.variantId) {
  selectedVariant = await prisma.productVariant.findFirst({
    where: {
      id: item.variantId,
      productId: product.id,
    },
  });

  if (!selectedVariant) {
    return NextResponse.json(
      { error: "Selected product variant was not found." },
      { status: 404 }
    );
  }

  availableStock = selectedVariant.stock;
}

if (!product.inStock || availableStock <= 0) {
  return NextResponse.json(
    { error: `${product.name} is out of stock.` },
    { status: 400 }
  );
}

if (item.quantity > availableStock) {
  return NextResponse.json(
    {
      error: `Only ${availableStock} unit(s) of ${product.name} available.`,
    },
    { status: 400 }
  );
}
item.variant = selectedVariant;

      const storeId = product.storeId;

      if (!ordersByStore.has(storeId)) {
        ordersByStore.set(storeId, []);
      }

     const itemPrice = item.variant?.price || product.price;

      ordersByStore.get(storeId).push({
      ...item,
      price: itemPrice,
      product,
     });

    }

    let orderIds = [];
    let fullAmount = 0;
    let isShippingFeeAdded = false;

    for (const [storeId, sellerItems] of ordersByStore.entries()) {
      let total = sellerItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );

      if (couponCode) {
        total -= (total * coupon.discount) / 100;
      }

      if (!isShippingFeeAdded) {
        if (!(isPlusMember && settings.plusFreeShipping)) {
          total += Number(settings.shippingFee || 0);
        }

        isShippingFeeAdded = true;
      }

      fullAmount += parseFloat(total.toFixed(2));

      const trackingNumber = `AMK-${Date.now()}-${Math.floor(
        Math.random() * 1000
      )}`;

      const order = await prisma.order.create({
        data: {
          trackingNumber,
          userId,
          storeId,
          addressId,
          total: parseFloat(total.toFixed(2)),
          paymentMethod,
          isCouponUsed: coupon ? true : false,
          coupon: coupon ? coupon : {},

          trackingEvents: {
            create: {
              status: "ORDER_PLACED",
              actor: "ADMIN",
              actorName: "System",
              note: "Order placed successfully",
            },
          },

          orderItems: {
               create: sellerItems.map((item) => {
               const variantImages =
               item.variant?.images?.length > 0
             ? item.variant.images
             : item.variant?.image
             ? [item.variant.image]
             : [];

    return {
      productId: item.id,
      quantity: item.quantity,
      price: item.price,

      variantId: item.variantId || null,
      variantName: item.variant?.name || null,
      variantValue: item.variant?.value || null,
      variantImage: variantImages[0] || null,
      variantImages,
    };
  }),
},

        },
      });

   for (const item of sellerItems) {
  const product = item.product;

  let oldStock = product.stock || 0;
  let newStock = Math.max(oldStock - item.quantity, 0);

  if (item.variantId) {
    const variant = await prisma.productVariant.findUnique({
      where: { id: item.variantId },
    });

    if (!variant) {
      return NextResponse.json(
        { error: "Selected product variant was not found." },
        { status: 404 }
      );
    }

    oldStock = variant.stock || 0;
    newStock = Math.max(oldStock - item.quantity, 0);

    await prisma.productVariant.update({
      where: { id: item.variantId },
      data: {
        stock: newStock,
      },
    });
  } else {
    await prisma.product.update({
      where: { id: item.id },
      data: {
        stock: newStock,
        inStock: newStock > 0,
      },
    });
  }

 const variantImages =
  item.variant?.images?.length > 0
    ? item.variant.images
    : item.variant?.image
    ? [item.variant.image]
    : [];

await prisma.inventoryLog.create({
  data: {
    productId: item.id,
    storeId,
    type: "SALE",
    quantity: item.quantity,
    oldStock,
    newStock,

    variantId: item.variantId || null,
    variantName: item.variant?.name || null,
    variantValue: item.variant?.value || null,
    variantImage: variantImages[0] || null,
    variantImages,

    note: `Stock reduced by ${item.quantity} after order ${trackingNumber}.`,
  },
});

  if (newStock === 0) {
   await prisma.inventoryLog.create({
  data: {
    productId: item.id,
    storeId,
    type: "OUT_OF_STOCK",
    quantity: 0,
    oldStock,
    newStock,

    variantId: item.variantId || null,
    variantName: item.variant?.name || null,
    variantValue: item.variant?.value || null,
    variantImage: variantImages[0] || null,
    variantImages,

    note: `${product.name} is now out of stock after order ${trackingNumber}.`,
  },
});

    await prisma.notification.create({
      data: {
        title: "Product Out of Stock",
        message: `${product.name} is now out of stock.`,
        type: "STORE",
        role: "SELLER",
        storeId,
        link: "/store/manage-products",
      },
    });
  } else if (newStock <= product.lowStockAt) {
    
    await prisma.inventoryLog.create({
   data: {
    productId: item.id,
    storeId,
    type: "LOW_STOCK",
    quantity: newStock,
    oldStock,
    newStock,

    variantId: item.variantId || null,
    variantName: item.variant?.name || null,
    variantValue: item.variant?.value || null,
    variantImage: variantImages[0] || null,
    variantImages,

    note: `${product.name} is low in stock after order ${trackingNumber}.`,
  },
});

    await prisma.notification.create({
      data: {
        title: "Low Stock Alert",
        message: `${product.name} has only ${newStock} unit(s) left.`,
        type: "STORE",
        role: "SELLER",
        storeId,
        link: "/store/manage-products",
      },
    });
  }
}

      await prisma.notification.createMany({
        data: [
          {
            title: "New Order Received",
            message: `A new ${paymentMethod} order has been placed. Tracking number: ${trackingNumber}`,
            type: "ORDER",
            role: "ADMIN",
            link: `/admin/deliveries/${order.id}`,
          },
          {
            title: "New Store Order",
            message: `You received a new ${paymentMethod} order. Tracking number: ${trackingNumber}`,
            type: "ORDER",
            role: "SELLER",
            storeId,
            link: `/store/orders`,
          },
          {
            title: "Order Placed Successfully",
            message: `Your order has been placed. Tracking number: ${trackingNumber}`,
            type: "ORDER",
            role: "CUSTOMER",
            userId,
            link: `/track-order?tracking=${trackingNumber}`,
          },
        ],
      });

      orderIds.push(order.id);
    }

    if (paymentMethod === "STRIPE") {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const origin = request.headers.get("origin");

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: "Order",
              },
              unit_amount: Math.round(fullAmount * 100),
            },
            quantity: 1,
          },
        ],
        expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
        mode: "payment",
        success_url: `${origin}/loading?nextUrl=orders`,
        cancel_url: `${origin}/cart`,
        metadata: {
          orderIds: orderIds.join(","),
          userId,
          appId: "gocart",
        },
      });

      return NextResponse.json({ session });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { cart: {} },
    });

    return NextResponse.json({
      message: "Orders placed Successfully",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 }
    );
  }
}

export async function GET(request) {
  try {
    const { userId } = getAuth(request);

    const orders = await prisma.order.findMany({
      where: {
        userId,
        OR: [
          { paymentMethod: PaymentMethod.COD },
          {
            AND: [{ paymentMethod: PaymentMethod.STRIPE }, { isPaid: true }],
          },
        ],
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        address: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}