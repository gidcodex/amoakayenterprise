import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { PaymentMethod } from "@prisma/client";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(request) {
  try {
    const { userId, has } = getAuth(request);

    if (!userId) {
      return NextResponse.json(
        { error: "Not authorized." },
        { status: 401 }
      );
    }

    const settings =
      (await prisma.adminSettings.findFirst()) ||
      (await prisma.adminSettings.create({
        data: {},
      }));

    if (!settings.marketplaceOpen) {
      return NextResponse.json(
        { error: settings.maintenanceMessage },
        { status: 403 }
      );
    }

    let existingUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!existingUser) {
      const clerkResponse = await fetch(
        `https://api.clerk.com/v1/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
          },
          cache: "no-store",
        }
      );

      if (!clerkResponse.ok) {
        return NextResponse.json(
          { error: "Unable to retrieve your account details." },
          { status: 502 }
        );
      }

      const clerkUser = await clerkResponse.json();

      existingUser = await prisma.user.create({
        data: {
          id: userId,
          name:
            `${clerkUser.first_name || ""} ${
              clerkUser.last_name || ""
            }`.trim() || "New User",
          email:
            clerkUser.email_addresses?.[0]?.email_address || "",
          image: clerkUser.image_url || "",
          cart: {},
        },
      });
    }

    const {
      addressId,
      items,
      couponCode,
      paymentMethod,
    } = await request.json();

    if (
      !addressId ||
      !paymentMethod ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        { error: "Missing order details." },
        { status: 400 }
      );
    }

    const supportedPaymentMethods = [
      "COD",
      "STRIPE",
      "PAYSTACK",
    ];

    if (!supportedPaymentMethods.includes(paymentMethod)) {
      return NextResponse.json(
        { error: "Unsupported payment method." },
        { status: 400 }
      );
    }

    if (
      paymentMethod === "COD" &&
      !settings.allowCOD
    ) {
      return NextResponse.json(
        {
          error:
            "Cash on delivery is currently disabled.",
        },
        { status: 400 }
      );
    }

    if (
      paymentMethod === "STRIPE" &&
      !settings.allowStripe
    ) {
      return NextResponse.json(
        {
          error:
            "Online card payment is currently disabled.",
        },
        { status: 400 }
      );
    }

    const address = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId,
      },
    });

    if (!address) {
      return NextResponse.json(
        {
          error:
            "Delivery address was not found or does not belong to you.",
        },
        { status: 404 }
      );
    }

    let coupon = null;

    if (couponCode) {
      coupon = await prisma.coupon.findUnique({
        where: {
          code: String(couponCode)
            .trim()
            .toUpperCase(),
        },
      });

      if (!coupon) {
        return NextResponse.json(
          { error: "Coupon not found." },
          { status: 400 }
        );
      }

      if (new Date(coupon.expiresAt) <= new Date()) {
        return NextResponse.json(
          { error: "This coupon has expired." },
          { status: 400 }
        );
      }

      if (coupon.forNewUser) {
        const existingOrderCount =
          await prisma.order.count({
            where: {
              userId,
            },
          });

        if (existingOrderCount > 0) {
          return NextResponse.json(
            {
              error:
                "This coupon is valid for new customers only.",
            },
            { status: 400 }
          );
        }
      }
    }

    const isPlusMember = has({
      plan: "plus",
    });

    if (
      coupon?.forMember &&
      !isPlusMember
    ) {
      return NextResponse.json(
        {
          error:
            "This coupon is valid for members only.",
        },
        { status: 400 }
      );
    }

    const ordersByStore = new Map();

    /*
    |--------------------------------------------------------------------------
    | VALIDATE PRODUCTS AND VARIANTS
    |--------------------------------------------------------------------------
    */
    for (const requestedItem of items) {
      const quantity = Number(
        requestedItem.quantity
      );

      if (
        !requestedItem.id ||
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        return NextResponse.json(
          {
            error:
              "Every cart item must have a valid product and quantity.",
          },
          { status: 400 }
        );
      }

      const product =
        await prisma.product.findUnique({
          where: {
            id: requestedItem.id,
          },
          include: {
            variants: true,
          },
        });

      if (!product) {
        return NextResponse.json(
          {
            error:
              "One of the selected products was not found.",
          },
          { status: 404 }
        );
      }

      if (!product.inStock) {
        return NextResponse.json(
          {
            error: `${product.name} is out of stock.`,
          },
          { status: 400 }
        );
      }

      let selectedVariant = null;
      let availableStock =
        Number(product.stock) || 0;

      if (requestedItem.variantId) {
        selectedVariant = product.variants.find(
          (variant) =>
            variant.id ===
              requestedItem.variantId &&
            variant.isActive
        );

        if (!selectedVariant) {
          return NextResponse.json(
            {
              error: `The selected variant of ${product.name} was not found or is inactive.`,
            },
            { status: 404 }
          );
        }

        availableStock =
          Number(selectedVariant.stock) || 0;
      } else if (product.variants.length > 0) {
        return NextResponse.json(
          {
            error: `Please select a variant for ${product.name}.`,
          },
          { status: 400 }
        );
      }

      if (availableStock <= 0) {
        return NextResponse.json(
          {
            error: selectedVariant
              ? `${product.name} — ${selectedVariant.value} is out of stock.`
              : `${product.name} is out of stock.`,
          },
          { status: 400 }
        );
      }

      if (quantity > availableStock) {
        return NextResponse.json(
          {
            error: `Only ${availableStock} unit(s) of ${
              product.name
            }${
              selectedVariant
                ? ` — ${selectedVariant.value}`
                : ""
            } are available.`,
          },
          { status: 400 }
        );
      }

      const itemPrice =
        selectedVariant?.price ??
        product.price;

      const preparedItem = {
        id: product.id,
        quantity,
        price: Number(itemPrice),
        variantId:
          selectedVariant?.id || null,
        variant: selectedVariant,
        product,
      };

      if (!ordersByStore.has(product.storeId)) {
        ordersByStore.set(
          product.storeId,
          []
        );
      }

      ordersByStore
        .get(product.storeId)
        .push(preparedItem);
    }

    const orderIds = [];
    let fullAmount = 0;
    let isShippingFeeAdded = false;

    /*
    |--------------------------------------------------------------------------
    | CREATE ONE ORDER PER SELLER
    |--------------------------------------------------------------------------
    */
    for (const [
      storeId,
      sellerItems,
    ] of ordersByStore.entries()) {
      let total = sellerItems.reduce(
        (sum, item) =>
          sum +
          Number(item.price) *
            Number(item.quantity),
        0
      );

      if (coupon) {
        total -=
          (total * Number(coupon.discount)) /
          100;
      }

      if (!isShippingFeeAdded) {
        if (
          !(
            isPlusMember &&
            settings.plusFreeShipping
          )
        ) {
          total += Number(
            settings.shippingFee || 0
          );
        }

        isShippingFeeAdded = true;
      }

      total = Number(total.toFixed(2));
      fullAmount += total;

      const trackingNumber = `AMK-${Date.now()}-${Math.floor(
        1000 + Math.random() * 9000
      )}`;

      const order =
        await prisma.order.create({
          data: {
            trackingNumber,
            userId,
            storeId,
            addressId,
            total,
            paymentMethod,
            isPaid: false,
            isCouponUsed: Boolean(coupon),
            coupon: coupon || {},

            trackingEvents: {
              create: {
                status: "ORDER_PLACED",
                actor: "ADMIN",
                actorName: "System",
                note:
                  paymentMethod === "PAYSTACK"
                    ? "Order created. Awaiting Paystack payment confirmation."
                    : "Order placed successfully.",
              },
            },

            orderItems: {
              create: sellerItems.map(
                (item) => {
                  const variantImages =
                    item.variant?.images
                      ?.length > 0
                      ? item.variant.images
                      : item.variant?.image
                      ? [item.variant.image]
                      : [];

                  return {
                    productId: item.id,
                    quantity:
                      item.quantity,
                    price: item.price,

                    variantId:
                      item.variant?.id ||
                      null,
                    variantName:
                      item.variant?.name ||
                      null,
                    variantValue:
                      item.variant?.value ||
                      null,
                    variantImage:
                      variantImages[0] ||
                      null,
                    variantImages,
                  };
                }
              ),
            },
          },
        });

      /*
      |--------------------------------------------------------------------------
      | REDUCE STOCK
      |--------------------------------------------------------------------------
      |
      | This currently reserves stock immediately when the order is created.
      | Later, failed or expired online payments should restore the quantity.
      |
      */
      for (const item of sellerItems) {
        const product = item.product;
        const variantImages =
          item.variant?.images?.length > 0
            ? item.variant.images
            : item.variant?.image
            ? [item.variant.image]
            : [];

        let oldStock;
        let newStock;
        let lowStockAt;

        if (item.variantId) {
          const updatedVariant =
            await prisma.productVariant.update({
              where: {
                id: item.variantId,
              },
              data: {
                stock: {
                  decrement: item.quantity,
                },
              },
            });

          oldStock =
            Number(updatedVariant.stock) +
            item.quantity;

          newStock =
            Number(updatedVariant.stock);

          lowStockAt =
            Number(
              updatedVariant.lowStockAt
            ) || 0;

          /*
           * Synchronize the parent product stock with
           * the total active variant stock.
           */
          const variantStock =
            await prisma.productVariant.aggregate({
              where: {
                productId: product.id,
                isActive: true,
              },
              _sum: {
                stock: true,
              },
            });

          const totalVariantStock =
            Number(
              variantStock._sum.stock || 0
            );

          await prisma.product.update({
            where: {
              id: product.id,
            },
            data: {
              stock: totalVariantStock,
              inStock:
                totalVariantStock > 0,
            },
          });
        } else {
          const updatedProduct =
            await prisma.product.update({
              where: {
                id: product.id,
              },
              data: {
                stock: {
                  decrement: item.quantity,
                },
              },
            });

          oldStock =
            Number(updatedProduct.stock) +
            item.quantity;

          newStock =
            Number(updatedProduct.stock);

          lowStockAt =
            Number(
              updatedProduct.lowStockAt
            ) || 0;

          if (
            updatedProduct.stock <= 0
          ) {
            await prisma.product.update({
              where: {
                id: product.id,
              },
              data: {
                inStock: false,
              },
            });
          }
        }

        await prisma.inventoryLog.create({
          data: {
            productId: item.id,
            storeId,
            type: "SALE",
            quantity: item.quantity,
            oldStock,
            newStock,

            variantId:
              item.variant?.id || null,
            variantName:
              item.variant?.name || null,
            variantValue:
              item.variant?.value || null,
            variantImage:
              variantImages[0] || null,
            variantImages,

            note: `Stock reserved for order ${trackingNumber}.`,
          },
        });

        if (newStock <= 0) {
          await prisma.inventoryLog.create({
            data: {
              productId: item.id,
              storeId,
              type: "OUT_OF_STOCK",
              quantity: 0,
              oldStock,
              newStock,

              variantId:
                item.variant?.id || null,
              variantName:
                item.variant?.name || null,
              variantValue:
                item.variant?.value ||
                null,
              variantImage:
                variantImages[0] || null,
              variantImages,

              note: `${product.name}${
                item.variant
                  ? ` — ${item.variant.value}`
                  : ""
              } is now out of stock.`,
            },
          });

          await prisma.notification.create({
            data: {
              title:
                "Product Out of Stock",
              message: `${product.name}${
                item.variant
                  ? ` — ${item.variant.value}`
                  : ""
              } is now out of stock.`,
              type: "STORE",
              role: "SELLER",
              storeId,
              link:
                "/store/variant-inventory",
            },
          });
        } else if (
          newStock <= lowStockAt
        ) {
          await prisma.inventoryLog.create({
            data: {
              productId: item.id,
              storeId,
              type: "LOW_STOCK",
              quantity: newStock,
              oldStock,
              newStock,

              variantId:
                item.variant?.id || null,
              variantName:
                item.variant?.name || null,
              variantValue:
                item.variant?.value ||
                null,
              variantImage:
                variantImages[0] || null,
              variantImages,

              note: `${product.name}${
                item.variant
                  ? ` — ${item.variant.value}`
                  : ""
              } has low stock.`,
            },
          });

          await prisma.notification.create({
            data: {
              title: "Low Stock Alert",
              message: `${product.name}${
                item.variant
                  ? ` — ${item.variant.value}`
                  : ""
              } has only ${newStock} unit(s) left.`,
              type: "STORE",
              role: "SELLER",
              storeId,
              link:
                "/store/variant-inventory",
            },
          });
        }
      }

      await prisma.notification.createMany({
        data: [
          {
            title: "New Order Received",
            message:
              paymentMethod === "PAYSTACK"
                ? `A Paystack order has been created and is awaiting payment. Tracking number: ${trackingNumber}`
                : `A new ${paymentMethod} order has been placed. Tracking number: ${trackingNumber}`,
            type: "ORDER",
            role: "ADMIN",
            link: `/admin/deliveries/${order.id}`,
          },
          {
            title: "New Store Order",
            message:
              paymentMethod === "PAYSTACK"
                ? `A Paystack order is awaiting payment confirmation. Tracking number: ${trackingNumber}`
                : `You received a new ${paymentMethod} order. Tracking number: ${trackingNumber}`,
            type: "ORDER",
            role: "SELLER",
            storeId,
            link: "/store/orders",
          },
          {
            title: "Order Created",
            message:
              paymentMethod === "PAYSTACK"
                ? `Complete your Paystack payment for order ${trackingNumber}.`
                : `Your order has been placed. Tracking number: ${trackingNumber}`,
            type: "ORDER",
            role: "CUSTOMER",
            userId,
            link: `/track-order?tracking=${trackingNumber}`,
          },
        ],
      });

      orderIds.push(order.id);
    }

    fullAmount = Number(
      fullAmount.toFixed(2)
    );

    /*
    |--------------------------------------------------------------------------
    | STRIPE
    |--------------------------------------------------------------------------
    */
    if (paymentMethod === "STRIPE") {
      const stripe = new Stripe(
        process.env.STRIPE_SECRET_KEY
      );

      const origin =
        request.headers.get("origin") ||
        process.env.NEXT_PUBLIC_APP_URL;

      const session =
        await stripe.checkout.sessions.create({
          payment_method_types: ["card"],

          line_items: [
            {
              price_data: {
                currency: "eur",
                product_data: {
                  name: "Amoakay Deals Order",
                },
                unit_amount: Math.round(
                  fullAmount * 100
                ),
              },
              quantity: 1,
            },
          ],

          expires_at:
            Math.floor(Date.now() / 1000) +
            30 * 60,

          mode: "payment",

          success_url: `${origin}/loading?nextUrl=orders`,
          cancel_url: `${origin}/cart`,

          metadata: {
            orderIds:
              orderIds.join(","),
            userId,
            appId: "amoakay",
          },
        });

      return NextResponse.json({
        session,
        orderIds,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | PAYSTACK
    |--------------------------------------------------------------------------
    |
    | The frontend must now call:
    | POST /api/payments/paystack/initialize
    | with the orderIds returned here.
    |
    */
    if (paymentMethod === "PAYSTACK") {
      return NextResponse.json({
        message:
          "Orders created. Continue to Paystack to complete payment.",
        paymentRequired: true,
        paymentProvider: "PAYSTACK",
        orderIds,
        fullAmount,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | CASH ON DELIVERY
    |--------------------------------------------------------------------------
    */
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        cart: {},
      },
    });

    return NextResponse.json({
      message:
        "Orders placed successfully.",
      orderIds,
    });
  } catch (error) {
    console.error(
      "CREATE ORDER ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.code ||
          error?.message ||
          "Failed to place order.",
      },
      { status: 400 }
    );
  }
}

export async function GET(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json(
        { error: "Not authorized." },
        { status: 401 }
      );
    }

    const orders =
      await prisma.order.findMany({
        where: {
          userId,

          OR: [
            {
              paymentMethod:
                PaymentMethod.COD,
            },
            {
              AND: [
                {
                  paymentMethod:
                    PaymentMethod.STRIPE,
                },
                {
                  isPaid: true,
                },
              ],
            },
            {
              AND: [
                {
                  paymentMethod:
                    PaymentMethod.PAYSTACK,
                },
                {
                  isPaid: true,
                },
              ],
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
          payment: true,
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    return NextResponse.json({
      orders,
    });
  } catch (error) {
    console.error(
      "GET ORDERS ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Failed to load orders.",
      },
      { status: 400 }
    );
  }
}