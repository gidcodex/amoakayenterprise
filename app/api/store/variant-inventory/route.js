import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const allowedActions = ["RESTOCK", "ADJUSTMENT"];

/*
|--------------------------------------------------------------------------
| GET SELLER VARIANT INVENTORY
|--------------------------------------------------------------------------
*/
export async function GET(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json(
        { error: "You must be signed in." },
        { status: 401 }
      );
    }

    const store = await prisma.store.findUnique({
      where: {
        userId,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!store) {
      return NextResponse.json(
        { error: "Seller store not found." },
        { status: 404 }
      );
    }

    const products = await prisma.product.findMany({
      where: {
        storeId: store.id,
      },

      select: {
        id: true,
        name: true,
        images: true,
        stock: true,
        lowStockAt: true,
        inStock: true,
        updatedAt: true,

        categoryRef: {
          select: {
            name: true,
          },
        },

        subcategoryRef: {
          select: {
            name: true,
          },
        },

        childCategory: {
          select: {
            name: true,
          },
        },

        variants: {
          orderBy: [
            {
              name: "asc",
            },
            {
              value: "asc",
            },
          ],

          select: {
            id: true,
            name: true,
            value: true,
            sku: true,
            barcode: true,
            price: true,
            stock: true,
            lowStockAt: true,
            isActive: true,
            image: true,
            images: true,
            updatedAt: true,
          },
        },
      },

      orderBy: {
        updatedAt: "desc",
      },
    });

    const inventoryItems = products.flatMap((product) => {
      /*
       * Products with variants:
       * return one inventory row for every variant.
       */
      if (product.variants.length > 0) {
        return product.variants.map((variant) => ({
          id: variant.id,
          inventoryType: "VARIANT",

          productId: product.id,
          productName: product.name,

          productImage: product.images?.[0] || null,

          category:
            product.childCategory?.name ||
            product.subcategoryRef?.name ||
            product.categoryRef?.name ||
            "Uncategorized",

          variantId: variant.id,
          variantName: variant.name,
          variantValue: variant.value,

          sku: variant.sku,
          barcode: variant.barcode,

          price: variant.price,

          stock: variant.stock,
          lowStockAt: variant.lowStockAt,
          isActive: variant.isActive,

          image:
            variant.image ||
            variant.images?.[0] ||
            product.images?.[0] ||
            null,

          images:
            variant.images?.length > 0
              ? variant.images
              : product.images,

          status: getInventoryStatus(
            variant.stock,
            variant.lowStockAt,
            variant.isActive
          ),

          updatedAt: variant.updatedAt,
        }));
      }

      /*
       * Products without variants:
       * return the main product as an inventory row.
       */
      return [
        {
          id: product.id,
          inventoryType: "PRODUCT",

          productId: product.id,
          productName: product.name,

          productImage: product.images?.[0] || null,

          category:
            product.childCategory?.name ||
            product.subcategoryRef?.name ||
            product.categoryRef?.name ||
            "Uncategorized",

          variantId: null,
          variantName: null,
          variantValue: null,

          sku: null,
          barcode: null,

          price: null,

          stock: product.stock,
          lowStockAt: product.lowStockAt,
          isActive: true,

          image: product.images?.[0] || null,
          images: product.images,

          status: getInventoryStatus(
            product.stock,
            product.lowStockAt,
            true
          ),

          updatedAt: product.updatedAt,
        },
      ];
    });

    const summary = inventoryItems.reduce(
      (result, item) => {
        result.totalItems += 1;
        result.totalUnits += Number(item.stock || 0);

        if (item.status === "IN_STOCK") {
          result.inStock += 1;
        }

        if (item.status === "LOW_STOCK") {
          result.lowStock += 1;
        }

        if (item.status === "OUT_OF_STOCK") {
          result.outOfStock += 1;
        }

        if (item.status === "INACTIVE") {
          result.inactive += 1;
        }

        return result;
      },
      {
        totalItems: 0,
        totalUnits: 0,
        inStock: 0,
        lowStock: 0,
        outOfStock: 0,
        inactive: 0,
      }
    );

    return NextResponse.json({
      store,
      summary,
      inventoryItems,
    });
  } catch (error) {
    console.error("GET VARIANT INVENTORY ERROR:", error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Failed to load variant inventory.",
      },
      { status: 500 }
    );
  }
}

/*
|--------------------------------------------------------------------------
| UPDATE VARIANT OR PRODUCT STOCK
|--------------------------------------------------------------------------
*/
export async function PATCH(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json(
        { error: "You must be signed in." },
        { status: 401 }
      );
    }

    const store = await prisma.store.findUnique({
      where: {
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!store) {
      return NextResponse.json(
        { error: "Seller store not found." },
        { status: 404 }
      );
    }

    const body = await request.json();

    const {
      productId,
      variantId,
      action,
      quantity,
      newStock,
      lowStockAt,
      note,
      sku,
      barcode,
      isActive,
    } = body;

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required." },
        { status: 400 }
      );
    }

    if (!allowedActions.includes(action)) {
      return NextResponse.json(
        {
          error:
            "Action must be RESTOCK or ADJUSTMENT.",
        },
        { status: 400 }
      );
    }

    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        storeId: store.id,
      },

      include: {
        variants: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        {
          error:
            "Product not found or does not belong to your store.",
        },
        { status: 404 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | VARIANT STOCK UPDATE
    |--------------------------------------------------------------------------
    */
    if (variantId) {
      const variant = product.variants.find(
        (item) => item.id === variantId
      );

      if (!variant) {
        return NextResponse.json(
          {
            error:
              "Variant not found or does not belong to this product.",
          },
          { status: 404 }
        );
      }

      const result = await prisma.$transaction(
        async (transaction) => {
          const currentStock = Number(variant.stock || 0);

          let updatedStock = currentStock;
          let movementQuantity = 0;

          if (action === "RESTOCK") {
            const restockQuantity = Number(quantity);

            if (
              !Number.isInteger(restockQuantity) ||
              restockQuantity <= 0
            ) {
              throw new Error(
                "Restock quantity must be greater than zero."
              );
            }

            updatedStock =
              currentStock + restockQuantity;

            movementQuantity = restockQuantity;
          }

          if (action === "ADJUSTMENT") {
            const adjustedStock = Number(newStock);

            if (
              !Number.isInteger(adjustedStock) ||
              adjustedStock < 0
            ) {
              throw new Error(
                "New stock must be zero or greater."
              );
            }

            updatedStock = adjustedStock;

            movementQuantity =
              adjustedStock - currentStock;
          }

          const updatedVariant =
            await transaction.productVariant.update({
              where: {
                id: variant.id,
              },

              data: {
                stock: updatedStock,

                ...(lowStockAt !== undefined && {
                  lowStockAt: Math.max(
                    Number(lowStockAt) || 0,
                    0
                  ),
                }),

                ...(sku !== undefined && {
                  sku: cleanOptionalText(sku),
                }),

                ...(barcode !== undefined && {
                  barcode: cleanOptionalText(barcode),
                }),

                ...(typeof isActive === "boolean" && {
                  isActive,
                }),
              },
            });

          await transaction.inventoryLog.create({
            data: {
              productId: product.id,
              storeId: store.id,

              variantId: updatedVariant.id,
              variantName: updatedVariant.name,
              variantValue: updatedVariant.value,

              variantImage:
                updatedVariant.image ||
                updatedVariant.images?.[0] ||
                product.images?.[0] ||
                null,

              variantImages:
                updatedVariant.images?.length > 0
                  ? updatedVariant.images
                  : product.images,

              type: action,

              quantity: movementQuantity,
              oldStock: currentStock,
              newStock: updatedStock,

              note:
                cleanOptionalText(note) ||
                createDefaultNote(
                  action,
                  variant.name,
                  variant.value
                ),
            },
          });

          await synchronizeProductStock(
            transaction,
            product.id
          );

          return updatedVariant;
        }
      );

      return NextResponse.json({
        message:
          action === "RESTOCK"
            ? "Variant restocked successfully."
            : "Variant inventory adjusted successfully.",

        inventoryItem: {
          ...result,

          status: getInventoryStatus(
            result.stock,
            result.lowStockAt,
            result.isActive
          ),
        },
      });
    }

    /*
    |--------------------------------------------------------------------------
    | MAIN PRODUCT STOCK UPDATE
    |--------------------------------------------------------------------------
    */

    if (product.variants.length > 0) {
      return NextResponse.json(
        {
          error:
            "This product has variants. Update the stock of an individual variant.",
        },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(
      async (transaction) => {
        const currentStock = Number(product.stock || 0);

        let updatedStock = currentStock;
        let movementQuantity = 0;

        if (action === "RESTOCK") {
          const restockQuantity = Number(quantity);

          if (
            !Number.isInteger(restockQuantity) ||
            restockQuantity <= 0
          ) {
            throw new Error(
              "Restock quantity must be greater than zero."
            );
          }

          updatedStock =
            currentStock + restockQuantity;

          movementQuantity = restockQuantity;
        }

        if (action === "ADJUSTMENT") {
          const adjustedStock = Number(newStock);

          if (
            !Number.isInteger(adjustedStock) ||
            adjustedStock < 0
          ) {
            throw new Error(
              "New stock must be zero or greater."
            );
          }

          updatedStock = adjustedStock;

          movementQuantity =
            adjustedStock - currentStock;
        }

        const updatedProduct =
          await transaction.product.update({
            where: {
              id: product.id,
            },

            data: {
              stock: updatedStock,

              inStock: updatedStock > 0,

              ...(lowStockAt !== undefined && {
                lowStockAt: Math.max(
                  Number(lowStockAt) || 0,
                  0
                ),
              }),
            },
          });

        await transaction.inventoryLog.create({
          data: {
            productId: product.id,
            storeId: store.id,

            type: action,

            quantity: movementQuantity,
            oldStock: currentStock,
            newStock: updatedStock,

            note:
              cleanOptionalText(note) ||
              createDefaultNote(
                action,
                null,
                null
              ),
          },
        });

        return updatedProduct;
      }
    );

    return NextResponse.json({
      message:
        action === "RESTOCK"
          ? "Product restocked successfully."
          : "Product inventory adjusted successfully.",

      inventoryItem: {
        ...result,

        status: getInventoryStatus(
          result.stock,
          result.lowStockAt,
          true
        ),
      },
    });
  } catch (error) {
    console.error("PATCH VARIANT INVENTORY ERROR:", error);

    if (error?.code === "P2002") {
      const field =
        error?.meta?.target?.[0] ||
        "SKU or barcode";

      return NextResponse.json(
        {
          error: `${field} is already being used by another variant.`,
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Failed to update inventory.",
      },
      { status: 500 }
    );
  }
}

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function getInventoryStatus(
  stock,
  lowStockAt,
  isActive
) {
  if (!isActive) {
    return "INACTIVE";
  }

  const currentStock = Number(stock || 0);
  const threshold = Number(lowStockAt || 0);

  if (currentStock <= 0) {
    return "OUT_OF_STOCK";
  }

  if (currentStock <= threshold) {
    return "LOW_STOCK";
  }

  return "IN_STOCK";
}

function cleanOptionalText(value) {
  if (value === undefined || value === null) {
    return null;
  }

  const cleanedValue = String(value).trim();

  return cleanedValue || null;
}

function createDefaultNote(
  action,
  variantName,
  variantValue
) {
  const variantText =
    variantName && variantValue
      ? ` for ${variantName}: ${variantValue}`
      : "";

  if (action === "RESTOCK") {
    return `Seller restocked inventory${variantText}.`;
  }

  return `Seller manually adjusted inventory${variantText}.`;
}

async function synchronizeProductStock(
  transaction,
  productId
) {
  const variants =
    await transaction.productVariant.findMany({
      where: {
        productId,
        isActive: true,
      },

      select: {
        stock: true,
      },
    });

  const totalStock = variants.reduce(
    (sum, variant) =>
      sum + Number(variant.stock || 0),
    0
  );

  await transaction.product.update({
    where: {
      id: productId,
    },

    data: {
      stock: totalStock,
      inStock: totalStock > 0,
    },
  });

  return totalStock;
}