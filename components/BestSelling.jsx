"use client";

import BestSellingCard from "./BestSellingCard";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import Link from "next/link";

const BestSelling = () => {
  const displayQuantity = 8;

  const products = useSelector(
    (state) => state.product.list || []
  );

  const bestSellingProducts = useMemo(() => {
    return products
      .slice()
      .sort(
        (a, b) =>
          (b.rating?.length || 0) -
          (a.rating?.length || 0)
      )
      .slice(0, displayQuantity);
  }, [products]);

  if (bestSellingProducts.length === 0) {
    return null;
  }

  return (
    <section className="border-y border-slate-200 bg-white py-12 sm:py-16">
      <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-8">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">
              Popular choices
            </p>

            <h2 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">
              Best Selling
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Showing {bestSellingProducts.length} of{" "}
              {products.length} products
            </p>
          </div>

          <Link
            href="/shop"
            className="shrink-0 text-sm font-bold text-emerald-600 transition hover:text-emerald-700"
          >
            View more →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-5 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {bestSellingProducts.map((product) => (
            <BestSellingCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BestSelling;