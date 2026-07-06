const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const orders = await prisma.order.findMany({
    where: {
      trackingNumber: null,
    },
  });

  console.log(`Found ${orders.length} orders without tracking numbers.`);

  for (const order of orders) {
    const trackingNumber = `AMK-${Date.now()}-${Math.floor(
      Math.random() * 100000
    )}`;

    await prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        trackingNumber,
        trackingEvents: {
          create: {
            status: order.status || "ORDER_PLACED",
            actor: "ADMIN",
            actorName: "System",
            note: `Tracking number generated for existing order. Current status: ${order.status}`,
          },
        },
      },
    });

    console.log(`Updated order ${order.id} → ${trackingNumber}`);
  }

  console.log("Old orders updated successfully.");
}

main()
  .catch((error) => {
    console.error(error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });