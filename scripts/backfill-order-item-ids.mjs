import { randomUUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function backfillOrderItemIds() {
  try {
    const orderItems = await prisma.orderItem.findMany({
      where: {
        id: null,
      },
      select: {
        orderId: true,
        productId: true,
      },
    });

    console.log(
      `Found ${orderItems.length} order item(s) without an ID.`
    );

    for (const item of orderItems) {
      await prisma.orderItem.update({
        where: {
          orderId_productId: {
            orderId: item.orderId,
            productId: item.productId,
          },
        },
        data: {
          id: randomUUID(),
        },
      });
    }

    const remainingWithoutId = await prisma.orderItem.count({
      where: {
        id: null,
      },
    });

    if (remainingWithoutId > 0) {
      throw new Error(
        `${remainingWithoutId} order item(s) still have no ID.`
      );
    }

    console.log(
      `Successfully assigned IDs to ${orderItems.length} existing order item(s).`
    );
  } catch (error) {
    console.error("OrderItem backfill failed:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

backfillOrderItemIds();