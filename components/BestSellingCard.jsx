"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Star } from "lucide-react";

export default function BestSellingCard({ product }) {
  const image =
    product.images?.[0] ||
    product.image ||
    "/placeholder-product.png";

  const ratings = Array.isArray(product.rating)
    ? product.rating
    : [];

  const averageRating =
    ratings.length > 0
      ? ratings.reduce(
          (total, item) =>
            total + Number(item?.rating || 0),
          0
        ) / ratings.length
      : 0;

  const category =
    product.categoryRef?.name ||
    product.category ||
    "Product";

  const brand =
    product.brand ||
    product.specifications?.brand ||
    "";

  const price = Number(product.price || 0);

  return (
    <article className="group min-w-0 bg-white">
      <div className="relative overflow-hidden bg-slate-50">
        <Link
          href={`/product/${product.id}`}
          className="relative block aspect-[1/0.92] w-full"
        >
          <Image
            src={image}
            alt={product.name || "Product"}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
            className="object-contain p-3 transition duration-300 group-hover:scale-[1.03]"
          />
        </Link>

        <button
          type="button"
          aria-label="Add to wishlist"
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:text-red-500"
        >
          <Heart size={15} />
        </button>
      </div>

      <div className="pt-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
          {brand || category}
        </p>

        <Link
          href={`/product/${product.id}`}
          className="mt-1 block"
        >
          <h3 className="line-clamp-2 min-h-[38px] text-sm font-semibold leading-[19px] text-slate-900 transition hover:text-blue-700">
            {product.name}
          </h3>
        </Link>

        <div className="mt-2 flex items-center gap-1">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={13}
                className={
                  star <= Math.round(averageRating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-slate-300"
                }
              />
            ))}
          </div>

          <span className="text-[11px] text-slate-500">
            {averageRating > 0
              ? averageRating.toFixed(1)
              : "0.0"}
          </span>

          <span className="text-[11px] text-slate-400">
            ({ratings.length})
          </span>
        </div>

        <div className="mt-2">
          <p className="text-lg font-black text-slate-950">
            ₵{price.toLocaleString()}
          </p>

          <p className="mt-1 text-xs font-semibold text-emerald-600">
            Free shipping
          </p>
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {product.stock > 0 && (
            <span className="bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-700">
              In stock
            </span>
          )}

          {product.isFeatured && (
            <span className="bg-orange-100 px-2 py-1 text-[10px] font-bold text-orange-700">
              Bestseller
            </span>
          )}
        </div>

        {product.store?.name && (
          <p className="mt-2 truncate bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600">
            Seller: {product.store.name}
          </p>
        )}
      </div>
    </article>
  );
}