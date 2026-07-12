"use client";

import {
  clearCompare,
  removeFromCompare,
} from "@/lib/features/compare/compareSlice";
import { getSpecFields } from "@/lib/productSpecifications";
import { GitCompare, Trash2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function ComparePage() {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.compare.items);
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";
  const [hideSame, setHideSame] = useState(false);

  const getSpec = (product, key) => {
    return product.specifications?.[key] || product[key] || "-";
  };

  const specRows = useMemo(() => {
    const fieldsMap = new Map();

    products.forEach((product) => {
      const fields = getSpecFields(
        product.categoryRef?.name || product.category,
        product.subcategoryRef?.name,
        product.childCategory?.name
      );

      fields.forEach(([key, label]) => {
        if (!fieldsMap.has(key)) fieldsMap.set(key, { key, label });
      });
    });

    return Array.from(fieldsMap.values());
  }, [products]);

  const sections = [
    {
      title: "Overview",
      rows: [
        {
          key: "price",
          label: "Price",
          render: (p) => `${currency}${p.price?.toLocaleString()}`,
        },
        {
          key: "stock",
          label: "Availability",
          render: (p) => (p.inStock ? `${p.stock} available` : "Out of stock"),
        },
      ],
    },
    {
      title: "Specifications",
      rows: specRows.map((row) => ({
        key: row.key,
        label: row.label,
        render: (p) => getSpec(p, row.key),
      })),
    },
    {
      title: "Options",
      rows: [
        {
          key: "variants",
          label: "Variants",
          render: (p) =>
            p.variants?.length > 0
              ? p.variants.map((v) => `${v.name}: ${v.value}`).join(", ")
              : "-",
        },
      ],
    },
  ];

  const filteredSections = sections
    .map((section) => ({
      ...section,
      rows: section.rows.filter((row) => {
        if (!hideSame || products.length < 2) return true;

        const values = products.map((product) =>
          String(row.render(product)).trim().toLowerCase()
        );

        return new Set(values).size > 1;
      }),
    }))
    .filter((section) => section.rows.length > 0);

  if (products.length === 0) {
    return (
      <div className="min-h-[70vh] mx-6 flex items-center justify-center">
        <div className="text-center text-slate-400">
          <GitCompare size={56} className="mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-700">
            No products selected for comparison
          </h1>
          <p className="mt-2">Add products to compare their specifications.</p>

          <Link
            href="/shop"
            className="inline-block mt-6 bg-black text-white px-8 py-3 rounded-full"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white text-slate-900 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center py-8 sm:py-12">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">
            Compare
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <button
              onClick={() => setHideSame(!hideSame)}
              className={`px-4 sm:px-5 py-2 rounded-full border text-xs sm:text-sm font-medium transition ${
                hideSame
                  ? "bg-black text-white border-black"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
              }`}
            >
              {hideSame ? "Showing differences" : "Hide same parameters"}
            </button>

            <button
              onClick={() => dispatch(clearCompare())}
              className="px-4 sm:px-5 py-2 rounded-full bg-red-50 text-red-600 text-xs sm:text-sm font-semibold hover:bg-red-100 inline-flex items-center gap-2"
            >
              <Trash2 size={15} />
              Clear All
            </button>
          </div>
        </div>

        <div className="overflow-x-auto pb-4">
          <div className="min-w-[720px] md:min-w-[1000px]">
            <div
              className="grid gap-5 md:gap-10 items-start"
              style={{
                gridTemplateColumns: `repeat(${products.length}, minmax(220px, 1fr))`,
              }}
            >
              {products.map((product) => (
                <div key={product.id} className="relative text-center">
                  <button
                    onClick={() => dispatch(removeFromCompare(product.id))}
                    className="absolute top-0 right-0 z-10 bg-white text-slate-400 hover:text-red-500 border border-slate-200 rounded-full p-2"
                    title="Remove"
                  >
                    <X size={16} />
                  </button>

                  <div className="border-b border-slate-200 pb-3 text-left">
                    <p className="text-base sm:text-xl font-medium line-clamp-1 pr-10">
                      {product.name}
                    </p>
                  </div>

                  <Link href={`/product/${product.id}`}>
                    <div className="h-[220px] sm:h-[300px] md:h-[330px] mt-5 sm:mt-8 flex items-center justify-center">
                      <Image
                        src={product.images?.[0]}
                        alt={product.name}
                        width={420}
                        height={420}
                        className="max-h-[200px] sm:max-h-[280px] md:max-h-[300px] w-auto object-contain"
                      />
                    </div>

                    <h2 className="mt-5 sm:mt-8 text-base sm:text-xl font-medium line-clamp-2 min-h-[48px] sm:min-h-[56px]">
                      {product.name}
                    </h2>

                    <p className="mt-2 sm:mt-3 text-green-600 font-bold text-base sm:text-xl">
                      {currency}
                      {product.price?.toLocaleString()}
                    </p>
                  </Link>

                  <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5">
                    <Link
                      href={`/product/${product.id}`}
                      className="bg-black text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full text-sm font-medium hover:bg-slate-800"
                    >
                      Buy
                    </Link>

                    <Link
                      href={`/product/${product.id}`}
                      className="text-slate-800 text-sm font-medium hover:text-blue-600"
                    >
                      Learn More ›
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div
              className="sticky top-0 z-40 mt-10 sm:mt-16 bg-white/95 backdrop-blur border-y border-slate-200"
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${products.length}, minmax(220px, 1fr))`,
              }}
            >
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 px-3 sm:px-5 py-3 border-r last:border-r-0 border-slate-100"
                >
                  <Image
                    src={product.images?.[0]}
                    alt={product.name}
                    width={52}
                    height={52}
                    className="w-10 h-10 sm:w-14 sm:h-14 object-contain"
                  />

                  <div className="min-w-0">
                    <p className="font-medium text-xs sm:text-sm line-clamp-1">
                      {product.name}
                    </p>

                    <Link
                      href={`/product/${product.id}`}
                      className="text-blue-600 text-xs sm:text-sm font-medium"
                    >
                      Buy ›
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              {filteredSections.map((section) => (
                <div key={section.title} className="py-7 sm:py-10">
                  <h2 className="text-3xl sm:text-5xl font-light tracking-tight mb-6 sm:mb-8">
                    {section.title}
                  </h2>

                  <div className="border-t border-slate-200">
                    {section.rows.map((row) => (
                      <div
                        key={row.key}
                        className="grid border-b border-slate-200"
                        style={{
                          gridTemplateColumns: `repeat(${products.length}, minmax(220px, 1fr))`,
                        }}
                      >
                        {products.map((product, productIndex) => (
                          <div
                            key={product.id}
                            className="px-3 sm:px-5 py-5 sm:py-8 border-r last:border-r-0 border-slate-100"
                          >
                            {productIndex === 0 && (
                              <p className="font-semibold text-slate-900 mb-3 sm:mb-5 text-sm sm:text-base">
                                {row.label}
                              </p>
                            )}

                            <p
                              className={`text-sm sm:text-base break-words ${
                                row.key === "price"
                                  ? "text-green-600 font-bold sm:text-xl"
                                  : "text-slate-600"
                              }`}
                            >
                              {row.render(product)}
                            </p>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-3 text-center text-xs text-slate-400 md:hidden">
          Swipe left or right to compare products.
        </p>
      </div>
    </div>
  );
}