"use client";

import { useState } from "react";
import {
  Eye,
  FileText,
  GitCompare,
  HeartIcon,
  StarIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth, useUser } from "@clerk/nextjs";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import ProductInformationSheet from "@/components/product-information-sheet/ProductInformationSheet";
import { toggleWishlist } from "@/lib/features/wishlist/wishlistSlice";
import { addToCompare } from "@/lib/features/compare/compareSlice";

const ProductCard = ({ product }) => {
  const currency =
    process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";

  const { getToken } = useAuth();
  const { user } = useUser();
  const dispatch = useDispatch();

  const [informationSheetOpen, setInformationSheetOpen] =
    useState(false);

  const wishlistIds = useSelector(
    (state) => state.wishlist.ids || []
  );

  const compareItems = useSelector(
    (state) => state.compare.items || []
  );

  const isWished = wishlistIds.includes(product.id);

  const isCompared = compareItems.some(
    (item) => item.id === product.id
  );

  const ratingValues = Array.isArray(product.rating)
    ? product.rating
        .map((item) => Number(item?.rating))
        .filter(Number.isFinite)
    : [];

  const averageRating =
    ratingValues.length > 0
      ? ratingValues.reduce(
          (total, value) => total + value,
          0
        ) / ratingValues.length
      : Number(
          product.averageRating ||
            product.ratingsAverage ||
            0
        );

  const roundedRating = Math.round(averageRating);

  const categoryName =
    product.categoryRef?.name ||
    product.category ||
    "Product";

  const brandName =
    product.brand ||
    product.specifications?.brand ||
    categoryName;

  const productImage =
    product.images?.[0] || product.image || null;

  const stockQuantity = Number(
    product.stock ?? product.quantity ?? 0
  );

  const isAvailable =
    product.inStock !== false && stockQuantity > 0;

  const handleWishlist = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!user) {
      toast.error(
        "Please log in to add products to your wishlist."
      );
      return;
    }

    dispatch(
      toggleWishlist({
        productId: product.id,
        getToken,
      })
    );
  };

  const handleCompare = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (isCompared) {
      toast(
        "This product is already in your comparison list."
      );
      return;
    }

    if (compareItems.length >= 4) {
      toast.error(
        "You can compare up to four products."
      );
      return;
    }

    dispatch(addToCompare(product));
    toast.success("Product added to compare.");
  };

  const handleOpenInformationSheet = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setInformationSheetOpen(true);
  };

  return (
    <>
      <article
        className="
          group relative flex h-full min-w-0 flex-col
          overflow-hidden rounded-[22px]
          border border-slate-200/80 bg-white
          shadow-[0_8px_28px_rgba(15,23,42,0.06)]
          transition-all duration-300
          hover:-translate-y-1
          hover:border-green-200
          hover:shadow-[0_22px_45px_rgba(15,23,42,0.12)]
        "
      >
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-white via-slate-50 to-blue-50">
          <Link
            href={`/product/${product.id}`}
            aria-label={`View ${product.name}`}
            className="absolute inset-0 z-0"
          />

          <div className="absolute left-2.5 top-2.5 z-10 flex max-w-[65%] flex-wrap gap-1.5">
            <span className="truncate rounded-full border border-white/70 bg-white/90 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-slate-700 shadow-sm backdrop-blur">
              {categoryName}
            </span>

            {!isAvailable && (
              <span className="rounded-full bg-red-600 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-white">
                Out of stock
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleWishlist}
            className="
              absolute right-2.5 top-2.5 z-20
              flex h-9 w-9 items-center justify-center
              rounded-full border border-white/70
              bg-white/90 shadow-sm backdrop-blur
              transition hover:scale-110 hover:bg-white
            "
            aria-label={
              isWished
                ? "Remove from wishlist"
                : "Add to wishlist"
            }
          >
            <HeartIcon
              size={17}
              className={
                isWished
                  ? "text-red-500"
                  : "text-slate-500"
              }
              fill={isWished ? "currentColor" : "none"}
            />
          </button>

          {productImage ? (
            <Image
              width={500}
              height={500}
              src={productImage}
              alt={product.name}
              className="
                h-full w-full object-contain p-4
                transition-transform duration-500
                group-hover:scale-105 sm:p-5
              "
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <FileText
                size={42}
                className="text-slate-300"
              />
            </div>
          )}

          <div
            className="
              absolute inset-x-2.5 bottom-2.5 z-20
              flex translate-y-3 items-center gap-2
              opacity-0 transition-all duration-300
              group-hover:translate-y-0
              group-hover:opacity-100
            "
          >
            <button
              type="button"
              onClick={handleOpenInformationSheet}
              className="
                flex min-w-0 flex-1
                items-center justify-center gap-1.5
                rounded-full bg-slate-950/90
                px-3 py-2.5
                text-[10px] font-black text-white
                shadow-lg backdrop-blur transition
                hover:bg-green-600 sm:text-xs
              "
            >
              <FileText size={14} />
              Product Information
            </button>

            <Link
              href={`/product/${product.id}`}
              aria-label={`View ${product.name}`}
              className="
                flex h-9 w-9 shrink-0
                items-center justify-center
                rounded-full bg-white
                text-slate-700 shadow-lg
                transition hover:bg-green-50
                hover:text-green-700
              "
            >
              <Eye size={16} />
            </Link>
          </div>
        </div>

        <Link
          href={`/product/${product.id}`}
          className="flex flex-1 flex-col p-3 sm:p-4"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-green-600">
            {brandName}
          </p>

          <h3 className="mt-1.5 line-clamp-2 min-h-[40px] text-sm font-black leading-5 text-slate-900 transition-colors group-hover:text-green-700 sm:text-[15px]">
            {product.name}
          </h3>

          <div className="mt-2 flex items-center gap-1">
            {Array.from({ length: 5 }).map(
              (_, index) => (
                <StarIcon
                  key={index}
                  size={13}
                  className={
                    roundedRating >= index + 1
                      ? "text-amber-400"
                      : "text-slate-300"
                  }
                  fill={
                    roundedRating >= index + 1
                      ? "currentColor"
                      : "none"
                  }
                />
              )
            )}

            {ratingValues.length > 0 && (
              <span className="ml-1 text-[10px] font-semibold text-slate-400">
                {averageRating.toFixed(1)}
              </span>
            )}
          </div>

          <div className="mt-auto flex items-end justify-between gap-2 pt-4">
            <div>
              <p className="text-[10px] font-semibold text-slate-400">
                Price
              </p>

              <p className="text-base font-black text-slate-950 sm:text-lg">
                {currency}
                {Number(product.price || 0).toLocaleString()}
              </p>
            </div>

            <span
              className={`
                rounded-full px-2 py-1
                text-[9px] font-black
                ${
                  isAvailable
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }
              `}
            >
              {isAvailable ? "In stock" : "Sold out"}
            </span>
          </div>
        </Link>

        <div className="border-t border-slate-100 p-3">
          <button
            type="button"
            onClick={handleCompare}
            className={`
              flex w-full items-center justify-center
              gap-2 rounded-xl py-2.5
              text-[11px] font-black transition
              ${
                isCompared
                  ? "bg-blue-50 text-blue-700"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }
            `}
          >
            <GitCompare size={14} />

            {isCompared
              ? "Added to Compare"
              : "Compare"}
          </button>
        </div>
      </article>

      <ProductInformationSheet
        product={product}
        isOpen={informationSheetOpen}
        onClose={() => setInformationSheetOpen(false)}
      />
    </>
  );
};

export default ProductCard;