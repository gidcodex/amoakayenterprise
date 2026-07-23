"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import {
  ArrowRight,
  Grid3X3,
  PackageSearch,
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

        if (
          !existingCategory.image &&
          categoryImage
        ) {
          existingCategory.image = categoryImage;
        }

        if (
          !existingCategory.slug &&
          categorySlug
        ) {
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

  return (
    <section className="relative overflow-hidden bg-white py-12 sm:py-14 lg:py-16">
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute -left-32 top-16
          h-80 w-80
          rounded-full
          bg-green-100/40
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
          bg-blue-100/40
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

          <Link
            href="/shop"
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
              transition-all duration-300
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

        {categories.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-5">
            {categories.map((category) => (
              <Link
                key={normalizeValue(category.name)}
                href={`/shop?category=${encodeURIComponent(
                  category.name
                )}`}
                aria-label={`Browse ${category.displayName} products`}
                className="
                  group
                  relative
                  min-h-[250px]
                  overflow-hidden
                  rounded-[24px]
                  border
                  border-slate-200/80
                  bg-slate-950
                  shadow-[0_8px_30px_rgba(15,23,42,0.10)]
                  transition-all
                  duration-500
                  hover:-translate-y-1.5
                  hover:border-green-300
                  hover:shadow-[0_24px_50px_rgba(15,23,42,0.20)]
                  sm:min-h-[290px]
                "
              >
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.displayName}
                    loading="lazy"
                    className="
                      absolute
                      inset-0
                      h-full
                      w-full
                      object-cover
                      transition-transform
                      duration-700
                      group-hover:scale-110
                    "
                  />
                ) : (
                  <div
                    className="
                      absolute
                      inset-0
                      flex
                      items-center
                      justify-center
                      bg-gradient-to-br
                      from-green-100
                      via-emerald-50
                      to-blue-100
                    "
                  >
                    <div
                      className="
                        flex
                        h-20
                        w-20
                        items-center
                        justify-center
                        rounded-3xl
                        border
                        border-white/70
                        bg-white/70
                        text-green-700
                        shadow-lg
                        backdrop-blur-md
                      "
                    >
                      <Grid3X3 size={34} />
                    </div>
                  </div>
                )}

                <div
                  aria-hidden="true"
                  className="
                    absolute
                    inset-0
                    bg-gradient-to-t
                    from-slate-950
                    via-slate-950/45
                    to-transparent
                  "
                />

                <div
                  aria-hidden="true"
                  className="
                    absolute
                    inset-0
                    bg-green-900/0
                    transition-colors
                    duration-500
                    group-hover:bg-green-900/10
                  "
                />

                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                  <div
                    className="
                      inline-flex
                      rounded-full
                      border
                      border-white/20
                      bg-white/15
                      px-2.5
                      py-1
                      text-[10px]
                      font-black
                      uppercase
                      tracking-[0.12em]
                      text-white
                      backdrop-blur-md
                      sm:text-[11px]
                    "
                  >
                    {category.productCount}{" "}
                    {category.productCount === 1
                      ? "product"
                      : "products"}
                  </div>

                  <h3 className="mt-3 text-lg font-black tracking-tight text-white sm:text-xl">
                    {category.displayName}
                  </h3>

                  <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-black text-green-300 sm:text-sm">
                    Browse category

                    <ArrowRight
                      size={15}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </div>
                </div>

                <div
                  aria-hidden="true"
                  className="
                    pointer-events-none
                    absolute
                    inset-x-5
                    bottom-0
                    h-[3px]
                    origin-left
                    scale-x-0
                    rounded-full
                    bg-gradient-to-r
                    from-green-400
                    to-emerald-300
                    transition-transform
                    duration-500
                    group-hover:scale-x-100
                  "
                />
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
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
      </div>
    </section>
  );
}