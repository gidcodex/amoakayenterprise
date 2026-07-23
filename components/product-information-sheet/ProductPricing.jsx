"use client";

import {
  AlertTriangle,
  BadgePercent,
  CheckCircle2,
  Package,
  TrendingDown,
} from "lucide-react";

export default function ProductPricing({ product }) {
  const currency =
    process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "GH₵";

  const mrp = Number(product?.mrp || 0);
  const price = Number(product?.price || 0);
  const stock = Number(product?.stock || 0);
  const lowStockAt = Number(product?.lowStockAt || 5);

  const hasDiscount = mrp > price && price > 0;

  const discountPercentage = hasDiscount
    ? Math.round(((mrp - price) / mrp) * 100)
    : 0;

  const amountSaved = hasDiscount ? mrp - price : 0;

  const isOutOfStock =
    product?.inStock === false || stock <= 0;

  const isLowStock =
    !isOutOfStock &&
    stock > 0 &&
    stock <= lowStockAt;

  const stockPercentage = Math.min(
    Math.max(
      lowStockAt > 0
        ? (stock / Math.max(lowStockAt * 4, 1)) * 100
        : 100,
      5
    ),
    100
  );

  const formatPrice = (value) => {
    return `${currency}${Number(value || 0).toLocaleString(
      "en-GH",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  let stockStatus;

  if (isOutOfStock) {
    stockStatus = {
      label: "Out of stock",
      description:
        "This product is currently unavailable.",
      icon: AlertTriangle,
      containerClass: "border-red-200 bg-red-50",
      iconClass: "bg-red-100 text-red-600",
      titleClass: "text-red-900",
      textClass: "text-red-700",
      barClass: "bg-red-500",
    };
  } else if (isLowStock) {
    stockStatus = {
      label: "Low stock",
      description: `Only ${stock} unit${
        stock === 1 ? "" : "s"
      } remaining.`,
      icon: AlertTriangle,
      containerClass: "border-amber-200 bg-amber-50",
      iconClass: "bg-amber-100 text-amber-600",
      titleClass: "text-amber-900",
      textClass: "text-amber-700",
      barClass: "bg-amber-500",
    };
  } else {
    stockStatus = {
      label: "Available",
      description: `${stock} unit${
        stock === 1 ? "" : "s"
      } currently in stock.`,
      icon: CheckCircle2,
      containerClass:
        "border-emerald-200 bg-emerald-50",
      iconClass:
        "bg-emerald-100 text-emerald-600",
      titleClass: "text-emerald-900",
      textClass: "text-emerald-700",
      barClass: "bg-emerald-500",
    };
  }

  const StockIcon = stockStatus.icon;

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-blue-50 px-5 py-5 sm:px-7">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
            <Package size={21} />
          </div>

          <div>
            <h3 className="text-lg font-black text-slate-950">
              Pricing and Stock
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Current marketplace pricing and product
              availability.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-5 sm:p-7">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <PriceCard
            label="Offer price"
            value={formatPrice(price)}
            featured
          />

          <PriceCard
            label="Regular price"
            value={
              mrp > 0
                ? formatPrice(mrp)
                : "Not provided"
            }
            crossedOut={hasDiscount}
          />

          <PriceCard
            label="You save"
            value={
              hasDiscount
                ? formatPrice(amountSaved)
                : "No discount"
            }
            icon={TrendingDown}
          />

          <PriceCard
            label="Discount"
            value={
              hasDiscount
                ? `${discountPercentage}% OFF`
                : "Standard price"
            }
            icon={BadgePercent}
          />
        </div>

        {hasDiscount && (
          <div className="flex flex-col gap-4 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-sky-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                <BadgePercent size={19} />
              </div>

              <div>
                <p className="font-bold text-slate-950">
                  Special marketplace offer
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  This product is currently listed below
                  its regular price.
                </p>
              </div>
            </div>

            <span className="w-fit rounded-full bg-blue-600 px-4 py-2 text-sm font-black text-white">
              Save {discountPercentage}%
            </span>
          </div>
        )}

        <div
          className={`rounded-2xl border p-4 sm:p-5 ${stockStatus.containerClass}`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${stockStatus.iconClass}`}
            >
              <StockIcon size={21} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p
                    className={`font-black ${stockStatus.titleClass}`}
                  >
                    {stockStatus.label}
                  </p>

                  <p
                    className={`mt-1 text-sm ${stockStatus.textClass}`}
                  >
                    {stockStatus.description}
                  </p>
                </div>

                {!isOutOfStock && (
                  <span
                    className={`rounded-full bg-white/80 px-3 py-1 text-xs font-black ${stockStatus.textClass}`}
                  >
                    {stock} available
                  </span>
                )}
              </div>

              {!isOutOfStock && (
                <div className="mt-4">
                  <div className="h-2 overflow-hidden rounded-full bg-white/80">
                    <div
                      className={`h-full rounded-full transition-all ${stockStatus.barClass}`}
                      style={{
                        width: `${stockPercentage}%`,
                      }}
                    />
                  </div>

                  <div
                    className={`mt-2 flex justify-between text-[11px] font-semibold ${stockStatus.textClass}`}
                  >
                    <span>Stock level</span>

                    <span>
                      Low-stock alert at {lowStockAt}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PriceCard({
  label,
  value,
  icon: Icon,
  featured = false,
  crossedOut = false,
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-4 ${
        featured
          ? "border-blue-200 bg-blue-600 text-white shadow-lg shadow-blue-200/50"
          : "border-slate-200 bg-slate-50 text-slate-950"
      }`}
    >
      {featured && (
        <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/10" />
      )}

      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <p
            className={`text-xs font-bold uppercase tracking-[0.12em] ${
              featured
                ? "text-blue-100"
                : "text-slate-400"
            }`}
          >
            {label}
          </p>

          {Icon && (
            <Icon
              size={18}
              className={
                featured
                  ? "text-blue-100"
                  : "text-blue-500"
              }
            />
          )}
        </div>

        <p
          className={`mt-3 break-words text-lg font-black sm:text-xl ${
            crossedOut
              ? "text-slate-400 line-through decoration-2"
              : ""
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}