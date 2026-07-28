"use client";

import Image from "next/image";
import {
  Check,
  Package,
  Store,
  Tag,
  Boxes,
} from "lucide-react";

const ProductSelectionTable = ({
  products = [],
  selectedProductId,
  onSelect,
}) => {
  if (!products.length) {
    return (
      <div className="mt-6 border border-slate-200 bg-white px-6 py-14 text-center">
        <Package
          size={38}
          className="mx-auto text-slate-300"
        />

        <h4 className="mt-4 font-bold text-slate-800">
          No eligible products found
        </h4>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          Only active, approved and in-stock products can be
          selected for Flash Deals.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 border border-slate-200 bg-white">
      {/* List heading */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3 sm:px-5">
        <div>
          <p className="text-sm font-bold text-slate-800">
            Eligible products
          </p>

          <p className="mt-0.5 text-xs text-slate-500">
            {products.length} product
            {products.length === 1 ? "" : "s"} available
          </p>
        </div>

        <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
          Select one
        </span>
      </div>

      <div className="divide-y divide-slate-200">
        {products.map((product) => {
          const isSelected =
            selectedProductId === product.id;

          const numericPrice = Number(product.price);

          return (
            <article
              key={product.id}
              className={`p-4 transition sm:p-5 ${
                isSelected
                  ? "bg-emerald-50/70"
                  : "hover:bg-slate-50"
              }`}
            >
              <div className="flex flex-col gap-5">
                {/* Product details */}
                <div className="flex min-w-0 items-start gap-4">
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden border border-slate-200 bg-slate-50">
                    <Image
                      src={
                        product.image ||
                        "/placeholder.png"
                      }
                      alt={product.name}
                      fill
                      sizes="96px"
                      className="object-contain p-2"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="line-clamp-2 text-base font-black leading-6 text-slate-900">
                      {product.name}
                    </h4>

                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                      <Store
                        size={15}
                        className="shrink-0"
                      />

                      <span className="truncate">
                        {product.store ||
                          "Unknown store"}
                      </span>
                    </div>

                    <p className="mt-2 truncate text-xs text-slate-400">
                      Product ID: {product.id}
                    </p>
                  </div>
                </div>

                {/* Product metadata */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="border border-slate-200 bg-white px-3 py-3">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      <Tag size={13} />
                      Category
                    </div>

                    <p className="mt-1.5 line-clamp-2 text-sm font-semibold text-slate-700">
                      {product.category ||
                        "Uncategorized"}
                    </p>
                  </div>

                  <div className="border border-slate-200 bg-white px-3 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      Current price
                    </p>

                    <p className="mt-1.5 text-base font-black text-slate-900">
                      {Number.isFinite(numericPrice)
                        ? `€${numericPrice.toFixed(2)}`
                        : "Not set"}
                    </p>
                  </div>

                  <div className="border border-slate-200 bg-white px-3 py-3">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      <Boxes size={13} />
                      Stock
                    </div>

                    <p className="mt-1.5 text-base font-black text-slate-900">
                      {product.stock ?? 0}
                    </p>
                  </div>
                </div>

                {/* Action */}
                <button
                  type="button"
                  onClick={() => onSelect(product)}
                  className={`inline-flex min-h-12 w-full items-center justify-center gap-2 border px-5 text-sm font-bold transition ${
                    isSelected
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : "border-slate-300 bg-white text-slate-800 hover:border-red-500 hover:bg-red-50 hover:text-red-600"
                  }`}
                >
                  {isSelected && <Check size={17} />}

                  {isSelected
                    ? "Product selected"
                    : "Select product"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default ProductSelectionTable;