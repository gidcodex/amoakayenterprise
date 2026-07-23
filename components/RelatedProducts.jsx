"use client";

import ProductCard from "@/components/ProductCard";
import { useMemo } from "react";
import { useSelector } from "react-redux";

export default function RelatedProducts({ product }) {
  const products = useSelector(
    (state) => state.product.list || []
  );

  const relatedProducts = useMemo(() => {
    if (!product || products.length === 0) {
      return [];
    }

    const scoredProducts = products
      .filter((item) => item.id !== product.id)
      .map((item) => {
        let score = 0;

        if (
          product.childCategoryId &&
          item.childCategoryId === product.childCategoryId
        ) {
          score += 100;
        }

        if (
          product.subcategoryId &&
          item.subcategoryId === product.subcategoryId
        ) {
          score += 60;
        }

        if (
          product.categoryId &&
          item.categoryId === product.categoryId
        ) {
          score += 30;
        }

        const productBrand =
          product.brand ||
          product.specifications?.brand;

        const itemBrand =
          item.brand ||
          item.specifications?.brand;

        if (
          productBrand &&
          itemBrand &&
          productBrand.toLowerCase() ===
            itemBrand.toLowerCase()
        ) {
          score += 25;
        }

        if (
          Array.isArray(item.rating) &&
          item.rating.length > 0
        ) {
          const validRatings = item.rating
            .map((ratingItem) =>
              Number(ratingItem?.rating)
            )
            .filter(Number.isFinite);

          if (validRatings.length > 0) {
            const averageRating =
              validRatings.reduce(
                (total, value) => total + value,
                0
              ) / validRatings.length;

            score += averageRating;
          }
        }

        return {
          ...item,
          relatedScore: score,
        };
      })
      .filter((item) => item.relatedScore > 0)
      .sort(
        (firstItem, secondItem) =>
          secondItem.relatedScore -
          firstItem.relatedScore
      )
      .slice(0, 8);

    return scoredProducts;
  }, [products, product]);

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <section className="mt-14 w-full sm:mt-16">
      <div className="mb-6">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-green-600">
          Recommended for you
        </p>

        <h2 className="mt-2 text-xl font-black text-slate-950 sm:text-2xl">
          You May Also Like
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Similar products selected from Amoakay Deals.
        </p>
      </div>

      <div className="grid w-full grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {relatedProducts.map((item) => (
          <div
            key={item.id}
            className="min-w-0"
          >
            <ProductCard product={item} />
          </div>
        ))}
      </div>
    </section>
  );
}