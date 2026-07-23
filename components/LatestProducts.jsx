"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import {
  ArrowRight,
  PackageSearch,
  Sparkles,
} from "lucide-react";

import ProductCard from "./ProductCard";

const DISPLAY_QUANTITY = 8;

const LatestProducts = () => {
  const products = useSelector(
    (state) => state.product.list || []
  );

  const latestProducts = useMemo(() => {
    return [...products]
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      )
      .slice(0, DISPLAY_QUANTITY);
  }, [products]);

  return (
    <section className="relative overflow-hidden bg-slate-50 py-12 sm:py-14 lg:py-16">
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute -left-32 top-20
          h-80 w-80
          rounded-full
          bg-green-100/50
          blur-[120px]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute -right-32 bottom-0
          h-80 w-80
          rounded-full
          bg-blue-100/50
          blur-[120px]
        "
      />

      <div className="relative mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-green-100 bg-green-50 px-3 py-1.5">
              <Sparkles
                size={14}
                className="text-green-600"
              />

              <span className="text-[11px] font-black uppercase tracking-[0.18em] text-green-700">
                Fresh arrivals
              </span>
            </div>

            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Latest Products
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
              Discover the newest electronics and accessories
              recently added by sellers on Amoakay Deals.
            </p>

            {products.length > 0 && (
              <p className="mt-2 text-xs font-semibold text-slate-400">
                Showing {latestProducts.length} of{" "}
                {products.length}{" "}
                {products.length === 1
                  ? "product"
                  : "products"}
              </p>
            )}
          </div>

          <Link
            href="/shop?sort=newest"
            className="
              group
              inline-flex
              w-fit
              items-center
              gap-2
              rounded-full
              border border-slate-200
              bg-white
              px-4 py-2.5
              text-sm
              font-black
              text-slate-700
              shadow-sm
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:border-green-300
              hover:text-green-700
              hover:shadow-md
            "
          >
            View all products

            <ArrowRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>

        {latestProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {latestProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 shadow-sm">
              <PackageSearch
                size={30}
                className="text-slate-400"
              />
            </div>

            <h3 className="mt-5 text-lg font-black text-slate-900">
              No products available yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              The newest seller products will automatically
              appear here once they are added.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default LatestProducts;