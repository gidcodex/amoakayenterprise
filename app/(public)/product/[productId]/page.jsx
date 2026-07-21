"use client";

import ProductDescription from "@/components/ProductDescription";
import ProductDetails from "@/components/ProductDetails";
import RelatedProducts from "@/components/RelatedProducts";
import RecentlyViewed from "@/components/RecentlyViewed";
import ProductStickyBar from "@/components/ProductStickyBar";

import {
  ChevronRight,
  Home,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function ProductPage() {
  const { productId } = useParams();

  const products = useSelector(
    (state) => state.product.list || []
  );

  const [product, setProduct] = useState(null);

  useEffect(() => {
    const selectedProduct = products.find(
      (item) => item.id === productId
    );

    setProduct(selectedProduct || null);

    if (selectedProduct) {
      const existing = JSON.parse(
        localStorage.getItem(
          "recentlyViewed"
        ) || "[]"
      );

      const updated = [
        selectedProduct.id,
        ...existing.filter(
          (id) => id !== selectedProduct.id
        ),
      ].slice(0, 10);

      localStorage.setItem(
        "recentlyViewed",
        JSON.stringify(updated)
      );
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [productId, products]);

  if (!product) {
    return (
      <main className="min-h-[70vh] bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-7xl rounded-3xl border border-slate-200 bg-white p-10 text-center">
          <p className="font-semibold text-slate-500">
            Loading product information...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-24 lg:pb-28">
        <ProductStickyBar product={product} />
     <div className="mx-auto w-full max-w-[1900px] px-3 py-5 sm:px-5 sm:py-7 lg:px-8 2xl:px-10">
        {/* Breadcrumb */}
        <nav className="mb-5 flex items-center gap-2 overflow-x-auto whitespace-nowrap text-sm text-slate-500">
          <Link
            href="/"
            className="inline-flex items-center gap-1 transition hover:text-green-700"
          >
            <Home size={15} />
            Home
          </Link>

          <ChevronRight size={15} />

          <Link
            href="/shop"
            className="transition hover:text-green-700"
          >
            Products
          </Link>

          <ChevronRight size={15} />

          <span className="font-semibold text-slate-700">
            {product.category || "Product"}
          </span>

          <ChevronRight size={15} />

          <span className="max-w-[240px] truncate font-semibold text-slate-900">
            {product.name}
          </span>
        </nav>

       <ProductDetails product={product}>
       <ProductDescription product={product} />
       </ProductDetails>

        <div className="mt-12">
          <RelatedProducts product={product} />
        </div>

        <div className="mt-12">
          <RecentlyViewed />
        </div>
      </div>
    </main>
  );
}