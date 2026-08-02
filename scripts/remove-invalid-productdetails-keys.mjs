import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const invalidKeys = [
  "productdetails.purchase.addToCart",
  "productdetails.purchase.buyNow",
  "productdetails.purchase.quantity",
  "productdetails.purchase.inStock",
  "productdetails.purchase.outOfStock",
  "productdetails.purchase.selectColour",
  "productdetails.purchase.selectStorage",
];

async function main() {
  console.log("Removing incorrectly generated test keys...\n");

  const result =
    await prisma.translationEntry.deleteMany({
      where: {
        key: {
          in: invalidKeys,
        },
      },
    });

  console.log(
    `✓ Removed ${result.count} invalid translation entries.`
  );
}

main()
  .catch((error) => {
    console.error(
      "Invalid-key cleanup failed:",
      error
    );

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });