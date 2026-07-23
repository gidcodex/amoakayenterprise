"use client";

import ProductCard from "@/components/ProductCard";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function RecentlyViewed() {
  const products = useSelector(
    (state) => state.product.list || []
  );

  const [recentProducts, setRecentProducts] =
    useState([]);

  useEffect(() => {
    try {
      const storedIds = JSON.parse(
        localStorage.getItem("recentlyViewed") || "[]"
      );

      const ids = Array.isArray(storedIds)
        ? storedIds
        : [];

      const matchedProducts = ids
        .map((id) =>
          products.find(
            (product) => product.id === id
          )
        )
        .filter(Boolean)
        .slice(0, 5);

      setRecentProducts(matchedProducts);
    } catch (error) {
      console.error(
        "Unable to load recently viewed products:",
        error
      );

      setRecentProducts([]);
    }
  }, [products]);

  if (recentProducts.length === 0) {
    return null;
  }

  return (
    <section className="my-14 w-full sm:my-16">
      <div className="mx-auto w-full">
        <div className="mb-6">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-green-600">
            Continue shopping
          </p>

          <h2 className="mt-2 text-xl font-black text-slate-950 sm:text-2xl">
            Recently Viewed
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Products you recently explored on Amoakay
            Deals.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {recentProducts.map((product) => (
            <div
              key={product.id}
              className="min-w-0"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}