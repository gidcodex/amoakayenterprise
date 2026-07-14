import prisma from "@/lib/prisma";
import { initializePaystackTransaction } from "@/lib/payments/paystack";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

export async function POST(request) {
  let paymentId = null;

  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json(
        { error: "You must be signed in to make a payment." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { orderIds } = body;

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json(
        { error: "At least one order ID is required." },
        { status: 400 }
      );
    }

    const uniqueOrderIds = [
      ...new Set(
        orderIds
          .map((orderId) => String(orderId).trim())
          .filter(Boolean)
      ),
    ];

    if (uniqueOrderIds.length === 0) {
      return NextResponse.json(
        { error: "No valid order IDs were provided." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User account was not found." },
        { status: 404 }
      );
    }

    const orders = await prisma.order.findMany({
      where: {
        id: {
          in: uniqueOrderIds,
        },
        userId,
      },
      select: {
        id: true,
        total: true,
        isPaid: true,
        paymentMethod: true,
        paymentId: true,
        trackingNumber: true,
        storeId: true,
        address: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (orders.length !== uniqueOrderIds.length) {
      return NextResponse.json(
        {
          error:
            "One or more orders were not found or do not belong to you.",
        },
        { status: 404 }
      );
    }

    const alreadyPaidOrder = orders.find(
      (order) => order.isPaid
    );

    if (alreadyPaidOrder) {
      return NextResponse.json(
        {
          error:
            "One or more selected orders have already been paid.",
        },
        { status: 400 }
      );
    }

    const wrongPaymentMethod = orders.find(
      (order) => order.paymentMethod !== "PAYSTACK"
    );

    if (wrongPaymentMethod) {
      return NextResponse.json(
        {
          error:
            "All selected orders must use Paystack as their payment method.",
        },
        { status: 400 }
      );
    }

    const orderWithExistingPayment = orders.find(
      (order) => order.paymentId
    );

    if (orderWithExistingPayment) {
      const existingPayment =
        await prisma.payment.findUnique({
          where: {
            id: orderWithExistingPayment.paymentId,
          },
          select: {
            id: true,
            status: true,
            checkoutUrl: true,
            clientReference: true,
          },
        });

      if (
        existingPayment &&
        ["PENDING", "PROCESSING"].includes(
          existingPayment.status
        ) &&
        existingPayment.checkoutUrl
      ) {
        return NextResponse.json({
          message:
            "A pending payment session already exists.",
          paymentId: existingPayment.id,
          reference:
            existingPayment.clientReference,
          authorizationUrl:
            existingPayment.checkoutUrl,
        });
      }

      return NextResponse.json(
        {
          error:
            "One or more orders are already connected to another payment.",
        },
        { status: 409 }
      );
    }

    const totalAmount = orders.reduce(
      (sum, order) => sum + Number(order.total || 0),
      0
    );

    if (
      !Number.isFinite(totalAmount) ||
      totalAmount <= 0
    ) {
      return NextResponse.json(
        { error: "The payment amount is invalid." },
        { status: 400 }
      );
    }

    /*
     * Paystack expects GHS amounts in pesewas.
     *
     * GH₵100.00 becomes 10000.
     */
    const amountInPesewas = Math.round(
      totalAmount * 100
    );

    if (
      !Number.isInteger(amountInPesewas) ||
      amountInPesewas <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "The payment amount could not be converted to pesewas.",
        },
        { status: 400 }
      );
    }

    const reference = `AMK-${Date.now()}-${randomUUID()
      .replaceAll("-", "")
      .slice(0, 10)
      .toUpperCase()}`;

    const customerAddress = orders[0]?.address;

    const customerEmail =
      customerAddress?.email || user.email;

    const customerName =
      customerAddress?.name || user.name;

    const customerPhone =
      customerAddress?.phone || null;

    if (!customerEmail) {
      return NextResponse.json(
        {
          error:
            "A valid customer email is required for Paystack.",
        },
        { status: 400 }
      );
    }

    const publicAppUrl =
      process.env.PAYSTACK_PUBLIC_APP_URL ||
      process.env.NEXT_PUBLIC_APP_URL;

    if (!publicAppUrl) {
      return NextResponse.json(
        {
          error:
            "PAYSTACK_PUBLIC_APP_URL is missing from the environment variables.",
        },
        { status: 500 }
      );
    }

    const normalizedAppUrl =
      publicAppUrl.replace(/\/+$/, "");

    const callbackUrl = `${normalizedAppUrl}/payment/paystack/callback`;

    /*
     * First create the pending payment record.
     */
    const payment = await prisma.payment.create({
      data: {
        userId,

        provider: "PAYSTACK",
        paymentMethod: "PAYSTACK",

        clientReference: reference,

        amount: totalAmount.toFixed(2),
        currency: "GHS",

        customerName,
        customerEmail,
        customerPhone,

        status: "PENDING",

        providerResponse: {
          orderIds: uniqueOrderIds,
        },
      },
    });

    paymentId = payment.id;

    /*
     * Initialize the transaction with Paystack.
     */
    const paystackResponse =
      await initializePaystackTransaction({
        email: customerEmail,
        amount: amountInPesewas,
        reference,
        callbackUrl,

        metadata: {
          paymentId: payment.id,
          userId,
          orderIds: uniqueOrderIds,
          customerName,
          customerPhone,
          custom_fields: [
            {
              display_name: "Amoakay Payment ID",
              variable_name: "amoakay_payment_id",
              value: payment.id,
            },
            {
              display_name: "Number of Orders",
              variable_name: "order_count",
              value: String(uniqueOrderIds.length),
            },
          ],
        },
      });

    const authorizationUrl =
      paystackResponse?.data?.authorization_url;

    const providerReference =
      paystackResponse?.data?.reference ||
      reference;

    if (!authorizationUrl) {
      throw new Error(
        "Paystack did not return an authorization URL."
      );
    }

    /*
     * Save the checkout session and attach the orders.
     */
    await prisma.$transaction([
      prisma.payment.update({
        where: {
          id: payment.id,
        },
        data: {
          providerReference,
          checkoutUrl: authorizationUrl,
          providerResponse: paystackResponse,
          status: "PROCESSING",
        },
      }),

      prisma.order.updateMany({
        where: {
          id: {
            in: uniqueOrderIds,
          },
          userId,
          isPaid: false,
          paymentId: null,
        },
        data: {
          paymentId: payment.id,
        },
      }),
    ]);

    return NextResponse.json({
      message:
        "Paystack payment session created successfully.",

      paymentId: payment.id,
      reference: providerReference,
      authorizationUrl,

      amount: totalAmount,
      currency: "GHS",
    });
  } catch (error) {
    console.error(
      "PAYSTACK INITIALIZATION ERROR:",
      error
    );

    /*
     * Preserve a record of failed initialization attempts.
     */
    if (paymentId) {
      try {
        await prisma.payment.update({
          where: {
            id: paymentId,
          },
          data: {
            status: "FAILED",
            failureReason:
              error?.message ||
              "Paystack initialization failed.",
          },
        });
      } catch (updateError) {
        console.error(
          "FAILED TO UPDATE PAYMENT STATUS:",
          updateError
        );
      }
    }

    if (error?.code === "P2002") {
      return NextResponse.json(
        {
          error:
            "A payment with this reference already exists.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Failed to initialize Paystack payment.",
      },
      { status: 500 }
    );
  }
}