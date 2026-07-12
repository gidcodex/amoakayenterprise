"use client";

import ProductCard from "@/components/ProductCard";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function RecentlyViewed() {
  const products = useSelector((state) => state.product.list);
  const [recentProducts, setRecentProducts] = useState([]);

  useEffect(() => {
    const ids = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");

    const matchedProducts = ids
      .map((id) => products.find((product) => product.id === id))
      .filter(Boolean);

    setRecentProducts(matchedProducts);
  }, [products]);

  if (recentProducts.length === 0) return null;

  return (
    <section className="mx-6 my-16">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          Recently Viewed
        </h2>

        <div className="grid grid-cols-2 sm:flex flex-wrap gap-6 xl:gap-12">
          {recentProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}