"use client";

import ProductCard from "@/components/ProductCard";
import { useMemo } from "react";
import { useSelector } from "react-redux";

export default function RelatedProducts({ product }) {
  const products = useSelector((state) => state.product.list);

  const relatedProducts = useMemo(() => {
  if (!product) return [];

  const scored = products
    .filter((p) => p.id !== product.id)
    .map((p) => {
      let score = 0;

      // Highest priority
      if (
        product.childCategoryId &&
        p.childCategoryId === product.childCategoryId
      ) {
        score += 100;
      }

      // Second priority
      if (
        product.subcategoryId &&
        p.subcategoryId === product.subcategoryId
      ) {
        score += 60;
      }

      // Third priority
      if (p.categoryId === product.categoryId) {
        score += 30;
      }

      // Same brand (if available)
      if (
        product.brand &&
        p.brand &&
        product.brand.toLowerCase() === p.brand.toLowerCase()
      ) {
        score += 25;
      }

      // Higher-rated products get a small boost
      if (p.rating?.length > 0) {
        const avg =
          p.rating.reduce((a, b) => a + b.rating, 0) / p.rating.length;
        score += avg;
      }

      return {
        ...p,
        score,
      };
    })
    .filter((p) => p.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  return scored;
}, [products, product]);

  if (relatedProducts.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">
        You May Also Like
      </h2>

      <div className="grid grid-cols-2 sm:flex flex-wrap gap-6 xl:gap-12">
        {relatedProducts.map((item) => (
          <ProductCard key={item.id} product={item} />
        ))}
      </div>
    </section>
  );
}