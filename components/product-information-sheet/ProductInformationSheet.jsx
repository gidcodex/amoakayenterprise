"use client";

import { useEffect } from "react";
import {
  X,
  FileText,
  ShieldCheck,
  ShoppingBag,
  ExternalLink,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ProductSpecs from "./ProductSpecs";
import ProductPricing from "./ProductPricing";
import ProductHeader from "./ProductHeader";
export default function ProductInformationSheet({
  product,
  isOpen,
  onClose,
}) {
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const productImage =
    product.images?.[0] || "/placeholder-product.png";

  const categoryName =
    product.categoryRef?.name ||
    product.category ||
    "General Product";

  const storeName =
    product.store?.name ||
    product.store?.businessName ||
    "Amoakay Seller";

  const productUrl = `/product/${product.id}`;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Dark overlay */}
      <button
        type="button"
        aria-label="Close product information sheet"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-[2px]"
      />

      {/* Right drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`${product.name} product information sheet`}
        className={`
        absolute right-0 top-0 h-full w-full
         overflow-y-auto bg-slate-50 shadow-2xl
         sm:max-w-xl lg:max-w-3xl xl:max-w-4xl
        animate-[sheetSlideIn_0.3s_ease-out]
        `}
      >
        {/* Sticky header */}
        <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-7">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <FileText size={22} />
              </div>

              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600">
                  Amoakay Deals
                </p>

                <h2 className="truncate text-lg font-bold text-slate-950 sm:text-xl">
                  Product Information Sheet
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className=" flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-950"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="space-y-6 p-4 pb-32 sm:p-7">
          {/* Document introduction */}
          <ProductHeader product={product} />
          {/* Temporary section placeholders */}
          <ProductPricing product={product} />

          <ProductSpecs product={product} />

          <PlaceholderSection
            title="Variants and Options"
            description="Available colours, capacities, sizes, prices and variant stock will appear here."
          />

          <PlaceholderSection
            title="Seller, Warranty and Delivery"
            description="Seller verification, warranty terms and delivery information will appear here."
          />

          <PlaceholderSection
            title="Product Description"
            description={product.description || "No description provided."}
          />
        </div>

        {/* Sticky bottom actions */}
        <div className="fixed bottom-0 right-0 z-40 w-full border-t border-slate-200 bg-white/95 p-4 shadow-[0_-12px_35px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:max-w-xl lg:max-w-3xl xl:max-w-4xl">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <button
              type="button"
             className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-black text-slate-800 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShoppingBag size={18} />
              Add to Cart
            </button>

            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-black text-white transition hover:bg-green-600"
            >
              Buy Now
            </button>

            <Link
              href={productUrl}
              onClick={onClose}
              className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              View Product
              <ExternalLink size={17} /> 
            </Link>
          </div>
        </div>
      </aside>

      <style jsx global>{`
        @keyframes sheetSlideIn {
          from {
            transform: translateX(100%);
            opacity: 0.75;
          }

          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

function InformationRow({ label, value }) {
  return (
    <div className="grid grid-cols-[125px_1fr] gap-4 border-b border-slate-100 pb-3 last:border-0">
      <span className="text-sm font-medium text-slate-400">
        {label}
      </span>

      <span className="break-words text-sm font-bold text-slate-800">
        {value || "Not provided"}
      </span>
    </div>
  );
}

function PlaceholderSection({ title, description }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <h3 className="text-lg font-black text-slate-950">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-7 text-slate-500">
        {description}
      </p>
    </section>
  );
}