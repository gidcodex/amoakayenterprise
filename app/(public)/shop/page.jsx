'use client'

import { Suspense } from "react";
import ProductCard from "@/components/ProductCard";
import { MoveLeftIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const search = searchParams.get("search");
  const category = searchParams.get("category");
  const subcategory = searchParams.get("subcategory");
  const child = searchParams.get("child");

  const products = useSelector((state) => state.product.list);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = search
      ? product.name.toLowerCase().includes(search.toLowerCase())
      : true;

    const matchesCategory = category
      ? product.categoryRef?.name === category || product.category === category
      : true;

    const matchesSubcategory = subcategory
      ? product.subcategoryRef?.name === subcategory
      : true;

    const matchesChild = child
      ? product.childCategory?.name === child
      : true;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesSubcategory &&
      matchesChild
    );
  });

  const pageTitle = child || subcategory || category || "All Products";

  return (
    <div className="min-h-[70vh] mx-6">
      <div className="max-w-7xl mx-auto">
        <h1
          onClick={() => router.push("/shop")}
          className="text-2xl text-slate-500 my-6 flex items-center gap-2 cursor-pointer"
        >
          {(search || category || subcategory || child) && (
            <MoveLeftIcon size={20} />
          )}
          {pageTitle}
        </h1>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:flex flex-wrap gap-6 xl:gap-12 mx-auto mb-32">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-slate-400">
            No products found.
          </div>
        )}
      </div>
    </div>
  );
}

export default function Shop() {
  return (
    <Suspense fallback={<div>Loading shop...</div>}>
      <ShopContent />
    </Suspense>
  );
}