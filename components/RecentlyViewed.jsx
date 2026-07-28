"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock3, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

export default function RecentlyViewed() {
  const products = useSelector(
    (state) => state.product.list || []
  );

  const [recentProducts, setRecentProducts] = useState([]);

  useEffect(() => {
    try {
      const storedIds = JSON.parse(
        localStorage.getItem("recentlyViewed") || "[]"
      );

      const ids = Array.isArray(storedIds)
        ? storedIds
        : [];

      const matchedProducts = ids
        .map((id) =>
          products.find((product) => product.id === id)
        )
        .filter(Boolean)
        .slice(0, 5);

      setRecentProducts(matchedProducts);
    } catch (error) {
      console.error(
        "Unable to load recently viewed products:",
        error
      );

      setRecentProducts([]);
    }
  }, [products]);

  const featuredProduct = recentProducts[0];

  const secondaryProducts = useMemo(
    () => recentProducts.slice(1, 5),
    [recentProducts]
  );

  if (!featuredProduct) {
    return null;
  }

  return (
    <section className="my-16 w-full sm:my-20">
      <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-600">
              <Clock3 size={17} />

              <p className="text-xs font-black uppercase tracking-[0.18em]">
                Continue shopping
              </p>
            </div>

            <h2 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">
              Recently Viewed
            </h2>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 transition hover:text-emerald-600"
          >
            View all products
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Promotional mosaic */}
        <div className="grid gap-4 lg:grid-cols-[1.65fr_1fr]">
          {/* Left column */}
          <div className="grid gap-4">
            <FeaturedTile product={featuredProduct} />

            {secondaryProducts.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                {secondaryProducts.slice(0, 2).map((product) => (
                  <MediumTile
                    key={product.id}
                    product={product}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="border border-slate-200 bg-slate-50 p-4 sm:p-5">
            <h3 className="text-lg font-black text-slate-900">
              Continue exploring
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Products you recently opened.
            </p>

            <div className="mt-5 grid gap-4">
              {secondaryProducts.slice(2, 3).map((product) => (
                <WideTile
                  key={product.id}
                  product={product}
                />
              ))}

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
                {secondaryProducts.slice(3, 5).map((product) => (
                  <SmallTile
                    key={product.id}
                    product={product}
                  />
                ))}
              </div>

              {secondaryProducts.length < 3 && (
                <EmptyPromotionTile />
              )}
            </div>
          </div>
        </div>

        {/* Continue-shopping strip */}
        <div className="mt-10 flex flex-col gap-4 border border-slate-200 bg-slate-50 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white">
              <Search size={19} />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                Your last viewed product
              </p>

              <p className="mt-1 truncate text-base font-black text-slate-900 sm:text-lg">
                {featuredProduct.name}
              </p>
            </div>
          </div>

          <Link
            href={`/product/${featuredProduct.id}`}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border-2 border-slate-900 px-6 py-3 text-sm font-black text-slate-900 transition hover:bg-slate-900 hover:text-white"
          >
            Continue viewing
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

function FeaturedTile({ product }) {
  const image = getProductImage(product);

  return (
    <Link
      href={`/product/${product.id}`}
      className="group relative block min-h-[320px] overflow-hidden bg-gradient-to-r from-sky-100 to-blue-50 sm:min-h-[390px]"
    >
      <div className="absolute inset-0 flex items-center justify-end">
        <div className="relative h-full w-[68%]">
          <Image
            src={image}
            alt={product.name || "Product"}
            fill
            sizes="(max-width: 1024px) 100vw, 65vw"
            className="object-contain p-6 transition duration-500 group-hover:scale-105 sm:p-10"
          />
        </div>
      </div>

      <div className="relative z-10 flex min-h-[320px] max-w-[48%] flex-col justify-center p-6 sm:min-h-[390px] sm:p-10">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">
          Recently explored
        </p>

        <h3 className="mt-3 text-2xl font-black leading-tight text-slate-950 sm:text-4xl">
          {product.name}
        </h3>

        <p className="mt-4 text-xl font-black text-slate-900">
          ₵{Number(product.price || 0).toLocaleString()}
        </p>

        <span className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-black text-white">
          View product
          <ArrowRight size={16} />
        </span>
      </div>
    </Link>
  );
}

function MediumTile({ product }) {
  const image = getProductImage(product);

  return (
    <Link
      href={`/product/${product.id}`}
      className="group relative block min-h-[240px] overflow-hidden bg-amber-100"
    >
      <div className="absolute inset-0">
        <Image
          src={image}
          alt={product.name || "Product"}
          fill
          sizes="(max-width: 640px) 100vw, 50vw"
          className="object-contain p-5 transition duration-500 group-hover:scale-105"
        />
      </div>

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-5 pb-5 pt-16 text-white">
        <h3 className="line-clamp-2 text-base font-black">
          {product.name}
        </h3>

        <p className="mt-1 text-sm font-bold">
          ₵{Number(product.price || 0).toLocaleString()}
        </p>
      </div>
    </Link>
  );
}

function WideTile({ product }) {
  const image = getProductImage(product);

  return (
    <Link
      href={`/product/${product.id}`}
      className="group relative block min-h-[220px] overflow-hidden bg-rose-100"
    >
      <div className="absolute right-0 top-0 h-full w-[62%]">
        <Image
          src={image}
          alt={product.name || "Product"}
          fill
          sizes="(max-width: 1024px) 100vw, 35vw"
          className="object-contain p-4 transition duration-500 group-hover:scale-105"
        />
      </div>

      <div className="relative z-10 flex min-h-[220px] max-w-[50%] flex-col justify-center p-5">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-rose-700">
          Continue viewing
        </p>

        <h3 className="mt-2 line-clamp-3 text-xl font-black leading-tight text-slate-950">
          {product.name}
        </h3>

        <span className="mt-4 inline-flex w-fit rounded-full bg-slate-900 px-5 py-2.5 text-xs font-black text-white">
          Open product
        </span>
      </div>
    </Link>
  );
}

function SmallTile({ product }) {
  const image = getProductImage(product);

  return (
    <Link
      href={`/product/${product.id}`}
      className="group relative block min-h-[230px] overflow-hidden bg-emerald-100"
    >
      <div className="absolute inset-0">
        <Image
          src={image}
          alt={product.name || "Product"}
          fill
          sizes="(max-width: 640px) 100vw, 25vw"
          className="object-contain p-5 transition duration-500 group-hover:scale-105"
        />
      </div>

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-4 pt-14 text-white">
        <h3 className="line-clamp-2 text-sm font-black">
          {product.name}
        </h3>
      </div>
    </Link>
  );
}

function EmptyPromotionTile() {
  return (
    <Link
      href="/shop"
      className="flex min-h-[220px] flex-col items-center justify-center border border-dashed border-slate-300 bg-white p-6 text-center"
    >
      <p className="text-lg font-black text-slate-900">
        Discover more products
      </p>

      <p className="mt-2 text-sm text-slate-500">
        Continue browsing the Amoakay Deals marketplace.
      </p>

      <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-black text-white">
        Browse shop
        <ArrowRight size={16} />
      </span>
    </Link>
  );
}

function getProductImage(product) {
  return (
    product?.images?.[0] ||
    product?.image ||
    product?.variants?.[0]?.images?.[0] ||
    product?.variants?.[0]?.image ||
    "/placeholder-product.png"
  );
}