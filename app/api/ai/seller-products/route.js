import prisma from "@/lib/prisma";
import authSeller from "@/middlewares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const ALLOWED_STATUSES = new Set([
  "all",
  "in-stock",
  "low-stock",
  "out-of-stock",
]);

function getSafeLimit(value) {
  const parsedLimit = Number(value);

  if (!Number.isInteger(parsedLimit)) {
    return 12;
  }

  return Math.min(Math.max(parsedLimit, 1), 30);
}

function calculateInventoryStatus(product) {
  const productStock = Number(product.stock || 0);
  const productLowStockAt = Number(product.lowStockAt || 5);

  const activeVariants =
    product.variants?.filter(
      (variant) => variant.isActive
    ) || [];

  const hasVariants = activeVariants.length > 0;

  const variantStock = activeVariants.reduce(
    (total, variant) =>
      total + Number(variant.stock || 0),
    0
  );

  const effectiveStock = hasVariants
    ? variantStock
    : productStock;

  const lowStockThreshold = hasVariants
    ? activeVariants.reduce(
        (total, variant) =>
          total +
          Number(variant.lowStockAt || 5),
        0
      )
    : productLowStockAt;

  if (effectiveStock <= 0) {
    return {
      status: "out-of-stock",
      effectiveStock: 0,
      lowStockThreshold,
      hasVariants,
    };
  }

  if (effectiveStock <= lowStockThreshold) {
    return {
      status: "low-stock",
      effectiveStock,
      lowStockThreshold,
      hasVariants,
    };
  }

  return {
    status: "in-stock",
    effectiveStock,
    lowStockThreshold,
    hasVariants,
  };
}

export async function GET(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json(
        {
          error: "You must be signed in.",
        },
        {
          status: 401,
        }
      );
    }

    const storeId = await authSeller(userId);

    if (!storeId) {
      return NextResponse.json(
        {
          error:
            "Only approved sellers can search store products.",
        },
        {
          status: 403,
        }
      );
    }

    const { searchParams } = new URL(request.url);

    const query = (
      searchParams.get("query") || ""
    )
      .trim()
      .slice(0, 100);

    const requestedStatus = (
      searchParams.get("status") || "all"
    )
      .trim()
      .toLowerCase();

    const status = ALLOWED_STATUSES.has(
      requestedStatus
    )
      ? requestedStatus
      : "all";

    const limit = getSafeLimit(
      searchParams.get("limit")
    );

    /*
     * We retrieve the seller's matching products first.
     * Inventory status is then calculated using either:
     *
     * 1. Product stock, when no active variants exist.
     * 2. Total active variant stock, when variants exist.
     */
    const products =
      await prisma.product.findMany({
        where: {
          storeId,

          ...(query
            ? {
                OR: [
                  {
                    name: {
                      contains: query,
                      mode: "insensitive",
                    },
                  },
                  {
                    description: {
                      contains: query,
                      mode: "insensitive",
                    },
                  },
                  {
                    category: {
                      contains: query,
                      mode: "insensitive",
                    },
                  },
                  {
                    categoryRef: {
                      name: {
                        contains: query,
                        mode: "insensitive",
                      },
                    },
                  },
                  {
                    subcategoryRef: {
                      name: {
                        contains: query,
                        mode: "insensitive",
                      },
                    },
                  },
                  {
                    childCategory: {
                      name: {
                        contains: query,
                        mode: "insensitive",
                      },
                    },
                  },
                  {
                    variants: {
                      some: {
                        OR: [
                          {
                            name: {
                              contains: query,
                              mode: "insensitive",
                            },
                          },
                          {
                            value: {
                              contains: query,
                              mode: "insensitive",
                            },
                          },
                          {
                            sku: {
                              contains: query,
                              mode: "insensitive",
                            },
                          },
                          {
                            barcode: {
                              contains: query,
                              mode: "insensitive",
                            },
                          },
                        ],
                      },
                    },
                  },
                ],
              }
            : {}),
        },

        select: {
          id: true,
          name: true,
          description: true,
          mrp: true,
          price: true,
          images: true,
          category: true,
          stock: true,
          lowStockAt: true,
          inStock: true,
          createdAt: true,
          updatedAt: true,

          categoryRef: {
            select: {
              id: true,
              name: true,
            },
          },

          subcategoryRef: {
            select: {
              id: true,
              name: true,
            },
          },

          childCategory: {
            select: {
              id: true,
              name: true,
            },
          },

          variants: {
            where: {
              isActive: true,
            },

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
            },

            orderBy: {
              createdAt: "asc",
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    const preparedProducts = products.map(
      (product) => {
        const inventory =
          calculateInventoryStatus(product);

        return {
          id: product.id,
          name: product.name,
          description: product.description,
          mrp: product.mrp,
          price: product.price,

          image:
            product.images?.[0] || null,

          images: product.images || [],

          category:
            product.categoryRef?.name ||
            product.category ||
            null,

          subcategory:
            product.subcategoryRef?.name ||
            null,

          childCategory:
            product.childCategory?.name ||
            null,

          productStock: product.stock,
          effectiveStock:
            inventory.effectiveStock,

          lowStockAt:
            inventory.lowStockThreshold,

          inventoryStatus:
            inventory.status,

          hasVariants:
            inventory.hasVariants,

          variantCount:
            product.variants.length,

          variants: product.variants.map(
            (variant) => ({
              id: variant.id,
              name: variant.name,
              value: variant.value,
              sku: variant.sku,
              barcode: variant.barcode,
              price:
                variant.price ??
                product.price,
              stock: variant.stock,
              lowStockAt:
                variant.lowStockAt,
              isActive:
                variant.isActive,
              image:
                variant.image ||
                variant.images?.[0] ||
                product.images?.[0] ||
                null,
              images:
                variant.images || [],
              inventoryStatus:
                variant.stock <= 0
                  ? "out-of-stock"
                  : variant.stock <=
                      variant.lowStockAt
                    ? "low-stock"
                    : "in-stock",
            })
          ),

          createdAt:
            product.createdAt,

          updatedAt:
            product.updatedAt,
        };
      }
    );

    const filteredProducts =
      status === "all"
        ? preparedProducts
        : preparedProducts.filter(
            (product) =>
              product.inventoryStatus ===
              status
          );

    const summary = {
      totalProducts:
        preparedProducts.length,

      inStock: preparedProducts.filter(
        (product) =>
          product.inventoryStatus ===
          "in-stock"
      ).length,

      lowStock: preparedProducts.filter(
        (product) =>
          product.inventoryStatus ===
          "low-stock"
      ).length,

      outOfStock: preparedProducts.filter(
        (product) =>
          product.inventoryStatus ===
          "out-of-stock"
      ).length,

      totalUnits:
        preparedProducts.reduce(
          (total, product) =>
            total +
            product.effectiveStock,
          0
        ),
    };

    return NextResponse.json({
      success: true,

      search: {
        query,
        status,
      },

      summary,

      count: filteredProducts.length,

      products:
        filteredProducts.slice(0, limit),
    });
  } catch (error) {
    console.error(
      "AI seller product search error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error.message ||
          "Unable to search seller products.",
      },
      {
        status: 500,
      }
    );
  }
}