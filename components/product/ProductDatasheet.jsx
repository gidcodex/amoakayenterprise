"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Package,
  ShieldCheck,
  Star,
  Store,
  Truck,
  X,
} from "lucide-react";

const formatSpecificationLabel = (key) =>
  String(key || "")
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .trim();

const formatSpecificationValue = (value) => {
  if (Array.isArray(value)) {
    return value.join(", ");
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value ?? "");
};

export default function ProductDatasheet({
  product,
  isOpen,
  onClose,
}) {
  const currency =
    process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";

  const [activeImageIndex, setActiveImageIndex] =
    useState(0);

  const images = useMemo(() => {
    if (!product) {
      return [];
    }

    if (
      Array.isArray(product.images) &&
      product.images.length > 0
    ) {
      return product.images.filter(Boolean);
    }

    if (product.image) {
      return [product.image];
    }

    return [];
  }, [product]);

  const ratingValues = useMemo(() => {
    if (!product) {
      return [];
    }

    if (!Array.isArray(product.rating)) {
      return [];
    }

    return product.rating
      .map((item) => Number(item?.rating))
      .filter(Number.isFinite);
  }, [product]);

  const averageRating =
    ratingValues.length > 0
      ? ratingValues.reduce(
          (total, value) => total + value,
          0
        ) / ratingValues.length
      : Number(
          product?.averageRating ||
            product?.ratingsAverage ||
            0
        );

  const reviewCount =
    ratingValues.length ||
    Number(
      product?.reviewCount ||
        product?.ratingsCount ||
        0
    );

  const specifications = useMemo(() => {
    if (!product?.specifications) {
      return [];
    }

    return Object.entries(product.specifications).filter(
      ([, value]) =>
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ""
    );
  }, [product]);

  const categoryName =
    product?.categoryRef?.name ||
    product?.category ||
    "General";

  const storeName =
    product?.store?.name ||
    product?.storeName ||
    product?.seller?.storeName ||
    "Amoakay Seller";

  const stockQuantity = Number(
    product?.stock ?? product?.quantity ?? 0
  );

  const isAvailable =
    product?.inStock !== false && stockQuantity !== 0;

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [product?.id]);

  if (!product) {
    return null;
  }

  const activeImage =
    images[activeImageIndex] || images[0];

  const handlePreviousImage = () => {
    if (images.length <= 1) {
      return;
    }

    setActiveImageIndex((currentIndex) =>
      currentIndex === 0
        ? images.length - 1
        : currentIndex - 1
    );
  };

  const handleNextImage = () => {
    if (images.length <= 1) {
      return;
    }

    setActiveImageIndex((currentIndex) =>
      currentIndex === images.length - 1
        ? 0
        : currentIndex + 1
    );
  };

  return (
    <div
      className={`
        fixed inset-0 z-[100]
        transition-all duration-300
        ${
          isOpen
            ? "pointer-events-auto visible"
            : "pointer-events-none invisible"
        }
      `}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close product datasheet"
        className={`
          absolute inset-0
          h-full w-full
          bg-slate-950/55
          backdrop-blur-[2px]
          transition-opacity duration-300
          ${
            isOpen
              ? "opacity-100"
              : "opacity-0"
          }
        `}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`${product.name} product datasheet`}
        className={`
          absolute right-0 top-0
          h-full
          w-full
          overflow-y-auto
          bg-white
          shadow-[-24px_0_70px_rgba(15,23,42,0.25)]
          transition-transform
          duration-500
          ease-out
          sm:max-w-[620px]
          ${
            isOpen
              ? "translate-x-0"
              : "translate-x-full"
          }
        `}
      >
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur-xl sm:px-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-green-600">
              Product datasheet
            </p>

            <h2 className="mt-1 max-w-[250px] truncate text-base font-black text-slate-950 sm:max-w-[420px]">
              {product.name}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex h-10 w-10
              items-center justify-center
              rounded-full
              border border-slate-200
              bg-white
              text-slate-600
              shadow-sm
              transition
              hover:border-red-200
              hover:bg-red-50
              hover:text-red-600
            "
            aria-label="Close datasheet"
          >
            <X size={19} />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-blue-50">
            <div className="relative aspect-square w-full">
              {activeImage ? (
                <Image
                  src={activeImage}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 620px"
                  className="object-contain p-8 sm:p-10"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Package
                    size={60}
                    className="text-slate-300"
                  />
                </div>
              )}

              <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-green-700 shadow-sm backdrop-blur">
                  {categoryName}
                </span>

                {product.isFeatured && (
                  <span className="rounded-full bg-slate-950 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-white">
                    Featured
                  </span>
                )}
              </div>

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePreviousImage}
                    className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/90 text-slate-700 shadow-md transition hover:bg-white"
                    aria-label="Previous product image"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <button
                    type="button"
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/90 text-slate-700 shadow-md transition hover:bg-white"
                    aria-label="Next product image"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>
          </div>

          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() =>
                    setActiveImageIndex(index)
                  }
                  className={`
                    relative h-16 w-16
                    shrink-0
                    overflow-hidden
                    rounded-xl
                    border
                    bg-slate-50
                    transition
                    ${
                      activeImageIndex === index
                        ? "border-green-500 ring-2 ring-green-100"
                        : "border-slate-200 hover:border-slate-400"
                    }
                  `}
                >
                  <Image
                    src={image}
                    alt={`${product.name} view ${
                      index + 1
                    }`}
                    fill
                    sizes="64px"
                    className="object-contain p-1.5"
                  />
                </button>
              ))}
            </div>
          )}

          <div className="mt-6">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-green-600">
              {categoryName}
            </p>

            <h1 className="mt-2 text-2xl font-black leading-tight tracking-tight text-slate-950 sm:text-3xl">
              {product.name}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map(
                  (_, index) => (
                    <Star
                      key={index}
                      size={16}
                      className={
                        averageRating >= index + 1
                          ? "text-amber-400"
                          : "text-slate-300"
                      }
                      fill={
                        averageRating >= index + 1
                          ? "currentColor"
                          : "none"
                      }
                    />
                  )
                )}
              </div>

              <span className="text-sm font-bold text-slate-700">
                {averageRating > 0
                  ? averageRating.toFixed(1)
                  : "No rating"}
              </span>

              <span className="text-sm text-slate-400">
                ({reviewCount}{" "}
                {reviewCount === 1
                  ? "review"
                  : "reviews"})
              </span>
            </div>

            <div className="mt-5 flex flex-wrap items-end justify-between gap-4 border-y border-slate-200 py-5">
              <div>
                <p className="text-xs font-semibold text-slate-400">
                  Current price
                </p>

                <p className="mt-1 text-3xl font-black text-slate-950">
                  {currency}
                  {Number(product.price || 0).toLocaleString()}
                </p>
              </div>

              <div
                className={`
                  inline-flex items-center gap-2
                  rounded-full px-3 py-2
                  text-xs font-black
                  ${
                    isAvailable
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }
                `}
              >
                <span
                  className={`
                    h-2 w-2 rounded-full
                    ${
                      isAvailable
                        ? "bg-green-500"
                        : "bg-red-500"
                    }
                  `}
                />

                {isAvailable
                  ? "In stock"
                  : "Out of stock"}
              </div>
            </div>

            {product.description && (
              <div className="mt-6">
                <h3 className="text-base font-black text-slate-950">
                  Product overview
                </h3>

                <p className="mt-2 line-clamp-5 text-sm leading-7 text-slate-600">
                  {product.description}
                </p>
              </div>
            )}

            <div className="mt-6 grid grid-cols-3 gap-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center">
                <Truck
                  size={20}
                  className="mx-auto text-green-600"
                />
                <p className="mt-2 text-[11px] font-bold text-slate-700">
                  Delivery
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center">
                <ShieldCheck
                  size={20}
                  className="mx-auto text-blue-600"
                />
                <p className="mt-2 text-[11px] font-bold text-slate-700">
                  Secure order
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center">
                <Store
                  size={20}
                  className="mx-auto text-violet-600"
                />
                <p className="mt-2 truncate text-[11px] font-bold text-slate-700">
                  {storeName}
                </p>
              </div>
            </div>

            {specifications.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-lg font-black text-slate-950">
                    Technical specifications
                  </h3>

                  <span className="rounded-full bg-green-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-green-700">
                    Datasheet
                  </span>
                </div>

                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                  {specifications
                    .slice(0, 10)
                    .map(([key, value], index) => (
                      <div
                        key={key}
                        className={`
                          grid grid-cols-[42%_58%]
                          gap-3 px-4 py-3
                          text-sm
                          ${
                            index !==
                            Math.min(
                              specifications.length,
                              10
                            ) -
                              1
                              ? "border-b border-slate-200"
                              : ""
                          }
                          ${
                            index % 2 === 0
                              ? "bg-slate-50"
                              : "bg-white"
                          }
                        `}
                      >
                        <span className="font-bold text-slate-500">
                          {formatSpecificationLabel(
                            key
                          )}
                        </span>

                        <span className="break-words font-semibold text-slate-900">
                          {formatSpecificationValue(
                            value
                          )}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div className="mt-8 rounded-2xl border border-green-100 bg-green-50/70 p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-600 text-white">
                  <Check size={17} />
                </div>

                <div>
                  <p className="text-sm font-black text-green-900">
                    Available from {storeName}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-green-700">
                    Review the complete product page before
                    placing your order.
                  </p>
                </div>
              </div>
            </div>

            <Link
              href={`/product/${product.id}`}
              onClick={onClose}
              className="
                group mt-6
                flex w-full
                items-center justify-center
                gap-2
                rounded-full
                bg-gradient-to-r
                from-green-600
                to-emerald-500
                px-6 py-4
                text-sm font-black
                text-white
                shadow-lg
                shadow-green-600/20
                transition
                hover:-translate-y-0.5
                hover:from-green-700
                hover:to-emerald-600
              "
            >
              View full product

              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}