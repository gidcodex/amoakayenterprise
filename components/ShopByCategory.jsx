"use client";

import Link from "next/link";
import { useMemo, useRef } from "react";
import { useSelector } from "react-redux";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  PackageSearch,
  Percent,
  Sparkles,
} from "lucide-react";

const normalizeValue = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const formatCategoryName = (value) =>
  String(value ?? "")
    .trim()
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function ShopByCategory() {
  const scrollContainerRef = useRef(null);

  const products = useSelector(
    (state) => state.product.list || []
  );

  const categories = useMemo(() => {
    const categoryMap = new Map();

    products.forEach((product) => {
      const categoryName =
        product.categoryRef?.name ||
        product.category;

      if (!categoryName || !String(categoryName).trim()) {
        return;
      }

      const cleanName = String(categoryName).trim();
      const normalizedName = normalizeValue(cleanName);

      const categoryImage =
        product.categoryRef?.image || null;

      const categorySlug =
        product.categoryRef?.slug || null;

      const existingCategory =
        categoryMap.get(normalizedName);

      if (existingCategory) {
        existingCategory.productCount += 1;

        if (!existingCategory.image && categoryImage) {
          existingCategory.image = categoryImage;
        }

        if (!existingCategory.slug && categorySlug) {
          existingCategory.slug = categorySlug;
        }

        return;
      }

      categoryMap.set(normalizedName, {
        name: cleanName,
        displayName: formatCategoryName(cleanName),
        slug: categorySlug,
        image: categoryImage,
        productCount: 1,
      });
    });

    return Array.from(categoryMap.values()).sort(
      (a, b) => {
        if (b.productCount !== a.productCount) {
          return b.productCount - a.productCount;
        }

        return a.displayName.localeCompare(
          b.displayName
        );
      }
    );
  }, [products]);

  const scrollCategories = (direction) => {
    const container = scrollContainerRef.current;

    if (!container) return;

    const amount = Math.min(
      container.clientWidth * 0.8,
      760
    );

    container.scrollBy({
      left: direction === "right" ? amount : -amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="bg-white py-12 sm:py-14 lg:py-16">
      <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-8">
        <div className="mb-7 flex items-end justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-green-100 bg-green-50 px-3 py-1.5">
              <Sparkles
                size={14}
                className="text-green-600"
              />

              <span className="text-[11px] font-black uppercase tracking-[0.18em] text-green-700">
                Shop your way
              </span>
            </div>

            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Shop by Category
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
              Explore product categories available from
              sellers on Amoakay Deals.
            </p>
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <button
              type="button"
              onClick={() => scrollCategories("left")}
              aria-label="Scroll categories left"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              type="button"
              onClick={() => scrollCategories("right")}
              aria-label="Scroll categories right"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
            >
              <ChevronRight size={20} />
            </button>

            <Link
              href="/shop"
              className="ml-2 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 shadow-sm transition hover:border-green-300 hover:text-green-700"
            >
              View all products
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {categories.length > 0 ? (
          <div className="relative">
            <div
              ref={scrollContainerRef}
              className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-4 sm:gap-4"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              <Link
                href="/shop?deals=true"
                className="group w-[118px] shrink-0 snap-start sm:w-[142px]"
              >
                <div className="flex aspect-square items-center justify-center rounded-xl border border-slate-200 bg-white shadow-[0_4px_15px_rgba(15,23,42,0.10)] transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_10px_24px_rgba(15,23,42,0.14)]">
                  <Percent
                    size={68}
                    strokeWidth={2.5}
                    className="text-red-600"
                  />
                </div>

                <p className="mt-3 text-center text-sm font-semibold text-slate-800 sm:text-base">
                  Deals
                </p>
              </Link>

              {categories.map((category) => (
                <Link
                  key={normalizeValue(category.name)}
                  href={`/shop?category=${encodeURIComponent(
                    category.name
                  )}`}
                  aria-label={`Browse ${category.displayName} products`}
                  className="group w-[118px] shrink-0 snap-start sm:w-[142px]"
                >
                  <div className="relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_4px_15px_rgba(15,23,42,0.10)] transition duration-300 group-hover:-translate-y-1 group-hover:border-green-200 group-hover:shadow-[0_10px_24px_rgba(15,23,42,0.14)]">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.displayName}
                        loading="lazy"
                        className="h-full w-full object-contain p-4 transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-slate-50">
                        <Grid3X3
                          size={40}
                          className="text-green-700"
                        />
                      </div>
                    )}

                    <span className="absolute right-2 top-2 rounded-full border border-slate-200 bg-white/95 px-2 py-1 text-[9px] font-black text-slate-600 shadow-sm">
                      {category.productCount}
                    </span>
                  </div>

                  <p className="mt-3 line-clamp-2 min-h-[40px] text-center text-sm font-semibold leading-5 text-slate-800 transition group-hover:text-green-700 sm:text-base">
                    {category.displayName}
                  </p>
                </Link>
              ))}
            </div>

            <button
              type="button"
              onClick={() => scrollCategories("right")}
              aria-label="View more categories"
              className="absolute right-2 top-[42px] flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-800 shadow-lg backdrop-blur sm:hidden"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        ) : (
          <div className="border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center bg-white shadow-sm">
              <PackageSearch
                size={30}
                className="text-slate-400"
              />
            </div>

            <h3 className="mt-5 text-lg font-black text-slate-900">
              Categories are being prepared
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Product categories will appear when seller
              products become available.
            </p>
          </div>
        )}

        <Link
          href="/shop"
          className="mt-5 inline-flex items-center gap-2 text-sm font-black text-green-700 sm:hidden"
        >
          View all products
          <ArrowRight size={16} />
        </Link>
      </div>

      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}