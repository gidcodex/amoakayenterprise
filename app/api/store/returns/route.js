import prisma from "@/lib/prisma";
import authSeller from "@/middlewares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    const storeId = await authSeller(userId);

    if (!storeId) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    const returns = await prisma.returnRequest.findMany({
      where: { storeId },
      include: {
        user: true,
        product: true,
        order: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ returns });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 }
    );
  }
}

export async function PATCH(request) {
  try {
    const { userId } = getAuth(request);
    const storeId = await authSeller(userId);

    if (!storeId) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    const { returnId, status } = await request.json();

    if (!returnId || !["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid return action." },
        { status: 400 }
      );
    }

    const returnRequest = await prisma.returnRequest.findFirst({
      where: { id: returnId, storeId },
      include: {
        product: true,
        order: {
          include: {
            orderItems: true,
          },
        },
      },
    });

    if (!returnRequest) {
      return NextResponse.json(
        { error: "Return request not found." },
        { status: 404 }
      );
    }

    if (returnRequest.status !== "PENDING") {
      return NextResponse.json(
        { error: "This return request has already been processed." },
        { status: 400 }
      );
    }

    let restoredQuantity = 0;

    if (status === "APPROVED") {
      const orderItem = returnRequest.order.orderItems.find(
        (item) => item.productId === returnRequest.productId
      );

      restoredQuantity = orderItem?.quantity || 0;

      const oldStock = returnRequest.product.stock || 0;
      const newStock = oldStock + restoredQuantity;

      await prisma.product.update({
        where: { id: returnRequest.productId },
        data: {
          stock: newStock,
          inStock: newStock > 0,
        },
      });

      await prisma.inventoryLog.create({
        data: {
          productId: returnRequest.productId,
          storeId,
          type: "RESTOCK",
          quantity: restoredQuantity,
          oldStock,
          newStock,
          note: `Stock restored after approved return for order ${returnRequest.order.trackingNumber}.`,
        },
      });
    }

    const updatedReturn = await prisma.returnRequest.update({
      where: { id: returnId },
      data: { status },
      include: {
        user: true,
        product: true,
        order: true,
      },
    });

    await prisma.notification.createMany({
      data: [
        {
          title:
            status === "APPROVED"
              ? "Return Request Approved"
              : "Return Request Rejected",
          message:
            status === "APPROVED"
              ? `Your return request for ${returnRequest.product.name} has been approved.`
              : `Your return request for ${returnRequest.product.name} has been rejected.`,
          type: "ORDER",
          role: "CUSTOMER",
          userId: returnRequest.userId,
          link: "/orders",
        },
        {
          title: "Return Request Updated",
          message:
            status === "APPROVED"
              ? `${returnRequest.product.name} return was approved and ${restoredQuantity} unit(s) were restored to inventory.`
              : `${returnRequest.product.name} return request was rejected.`,
          type: "ORDER",
          role: "ADMIN",
          link: "/admin/returns",
        },
      ],
    });

    return NextResponse.json({
      message:
        status === "APPROVED"
          ? "Return approved and inventory restored successfully."
          : "Return request rejected successfully.",
      returnRequest: updatedReturn,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 }
    );
  }
}