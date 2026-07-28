"use client";

import { categories } from "@/assets/assets";
import {
  ChevronLeft,
  ChevronRight,
  Percent,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef } from "react";
import { useSelector } from "react-redux";

export default function CategoriesMarquee() {
  const scrollContainerRef = useRef(null);

  const products = useSelector(
    (state) => state.product.list || []
  );

  const categoryItems = useMemo(() => {
    const productCounts = products.reduce(
      (counts, product) => {
        const categoryName =
          product.categoryRef?.name ||
          product.category ||
          "";

        if (!categoryName) {
          return counts;
        }

        const normalizedName = categoryName
          .trim()
          .toLowerCase();

        counts[normalizedName] =
          (counts[normalizedName] || 0) + 1;

        return counts;
      },
      {}
    );

    return categories
      .map((category) => {
        const name =
          category.name ||
          category.title ||
          category.label ||
          "";

        const normalizedName = name
          .trim()
          .toLowerCase();

        return {
          ...category,
          name,
          productCount:
            productCounts[normalizedName] || 0,
        };
      })
      .filter(
        (category) =>
          category.name &&
          category.productCount > 0
      );
  }, [products]);

  const scrollCategories = (direction) => {
    const container = scrollContainerRef.current;

    if (!container) {
      return;
    }

    const scrollAmount = Math.min(
      container.clientWidth * 0.75,
      700
    );

    container.scrollBy({
      left:
        direction === "right"
          ? scrollAmount
          : -scrollAmount,
      behavior: "smooth",
    });
  };

  if (categoryItems.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-white py-12 sm:py-14">
      <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600">
              Browse our marketplace
            </p>

            <h2 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">
              Shop by Category
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Find products quickly by browsing your
              preferred category.
            </p>
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <button
              type="button"
              onClick={() =>
                scrollCategories("left")
              }
              aria-label="Scroll categories left"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              type="button"
              onClick={() =>
                scrollCategories("right")
              }
              aria-label="Scroll categories right"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Category rail */}
        <div className="relative">
          <div
            ref={scrollContainerRef}
            className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-3 sm:gap-4"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {/* Deals tile */}
            <Link
              href="/shop?deals=true"
              className="group w-[122px] shrink-0 snap-start sm:w-[142px]"
            >
              <div className="flex aspect-square items-center justify-center rounded-xl border border-slate-200 bg-white shadow-[0_4px_16px_rgba(15,23,42,0.10)] transition duration-300 group-hover:-translate-y-1 group-hover:border-red-200 group-hover:shadow-[0_10px_25px_rgba(15,23,42,0.14)]">
                <Percent
                  size={66}
                  strokeWidth={2.6}
                  className="text-red-600 sm:h-[78px] sm:w-[78px]"
                />
              </div>

              <p className="mt-3 text-center text-sm font-semibold text-slate-800 sm:text-base">
                Deals
              </p>
            </Link>

            {categoryItems.map((category) => {
              const image =
                category.image ||
                category.img ||
                category.icon ||
                "/placeholder-category.png";

              const categoryUrl = `/shop?category=${encodeURIComponent(
                category.name
              )}`;

              return (
                <Link
                  key={
                    category.id ||
                    category.slug ||
                    category.name
                  }
                  href={categoryUrl}
                  className="group w-[122px] shrink-0 snap-start sm:w-[142px]"
                >
                  <div className="relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_4px_16px_rgba(15,23,42,0.10)] transition duration-300 group-hover:-translate-y-1 group-hover:border-blue-200 group-hover:shadow-[0_10px_25px_rgba(15,23,42,0.14)]">
                    <Image
                      src={image}
                      alt={category.name}
                      fill
                      sizes="(max-width: 640px) 122px, 142px"
                      className="object-contain p-4 transition duration-300 group-hover:scale-105"
                    />

                    <span className="absolute right-2 top-2 rounded-full border border-slate-200 bg-white/95 px-2 py-1 text-[9px] font-black text-slate-600 shadow-sm backdrop-blur">
                      {category.productCount}
                    </span>
                  </div>

                  <p className="mt-3 line-clamp-2 min-h-[40px] text-center text-sm font-semibold leading-5 text-slate-800 transition group-hover:text-blue-700 sm:text-base">
                    {category.name}
                  </p>
                </Link>
              );
            })}
          </div>

          {/* Mobile next button */}
          <button
            type="button"
            onClick={() =>
              scrollCategories("right")
            }
            aria-label="View more categories"
            className="absolute right-2 top-[47px] flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-800 shadow-lg backdrop-blur transition hover:bg-white sm:hidden"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}