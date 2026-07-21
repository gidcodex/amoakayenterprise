import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

const MAX_RESULTS = 12;

function cleanString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}

export async function POST(request) {
  try {
    const body = await request.json();

    const brand = cleanString(body.brand);
    const query = cleanString(body.query);

    const categoryId = cleanString(body.categoryId);
    const subcategoryId = cleanString(body.subcategoryId);
    const childCategoryId = cleanString(body.childCategoryId);

    const minPrice = cleanNumber(body.minPrice);
    const maxPrice = cleanNumber(body.maxPrice);

    if (
      minPrice !== null &&
      maxPrice !== null &&
      minPrice > maxPrice
    ) {
      return NextResponse.json(
        {
          error: "Minimum price cannot be greater than maximum price.",
        },
        {
          status: 400,
        }
      );
    }

    const where = {
      inStock: true,
      stock: {
        gt: 0,
      },
      store: {
        isActive: true,
        status: "approved",
      },
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (subcategoryId) {
      where.subcategoryId = subcategoryId;
    }

    if (childCategoryId) {
      where.childCategoryId = childCategoryId;
    }

    if (minPrice !== null || maxPrice !== null) {
      where.price = {};

      if (minPrice !== null) {
        where.price.gte = minPrice;
      }

      if (maxPrice !== null) {
        where.price.lte = maxPrice;
      }
    }

    const textConditions = [];

    if (brand) {
      textConditions.push({
        OR: [
          {
            name: {
              contains: brand,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: brand,
              mode: "insensitive",
            },
          },
        ],
      });
    }

    if (query) {
      textConditions.push({
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
        ],
      });
    }

    if (textConditions.length > 0) {
      where.AND = textConditions;
    }

    const products = await prisma.product.findMany({
      where,

      take: MAX_RESULTS,

      orderBy: [
        {
          inStock: "desc",
        },
        {
          createdAt: "desc",
        },
      ],

      select: {
        id: true,
        name: true,
        description: true,
        mrp: true,
        price: true,
        images: true,
        stock: true,
        inStock: true,
        specifications: true,

        categoryRef: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },

        subcategoryRef: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },

        childCategory: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },

        store: {
          select: {
            id: true,
            name: true,
            username: true,
            logo: true,
          },
        },

        rating: {
          select: {
            rating: true,
          },
        },
      },
    });

    const formattedProducts = products.map((product) => {
      const ratings = product.rating || [];

      const averageRating =
        ratings.length > 0
          ? ratings.reduce(
              (total, item) => total + item.rating,
              0
            ) / ratings.length
          : 0;

      const discount =
        product.mrp > product.price
          ? Math.round(
              ((product.mrp - product.price) /
                product.mrp) *
                100
            )
          : 0;

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        mrp: product.mrp,
        price: product.price,
        discount,
        images: product.images,
        image: product.images?.[0] || null,
        stock: product.stock,
        inStock: product.inStock,
        specifications: product.specifications,

        averageRating: Number(
          averageRating.toFixed(1)
        ),
        ratingCount: ratings.length,

        category: product.categoryRef,
        subcategory: product.subcategoryRef,
        childCategory: product.childCategory,
        store: product.store,

        productUrl: `/product/${product.id}`,
      };
    });

    return NextResponse.json({
      success: true,
      count: formattedProducts.length,
      products: formattedProducts,
      appliedFilters: {
        brand: brand || null,
        query: query || null,
        categoryId: categoryId || null,
        subcategoryId: subcategoryId || null,
        childCategoryId: childCategoryId || null,
        minPrice,
        maxPrice,
      },
    });
  } catch (error) {
    console.error("AI product search error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to search products.",
      },
      {
        status: 500,
      }
    );
  }
}