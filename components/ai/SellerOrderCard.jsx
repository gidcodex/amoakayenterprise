"use client";

import {
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  CreditCard,
  Package,
  ShoppingBag,
  User,
} from "lucide-react";

const statusStyles = {
  ORDER_PLACED: {
    label: "Order placed",
    className:
      "border-blue-200 bg-blue-50 text-blue-700",
  },

  PROCESSING: {
    label: "Processing",
    className:
      "border-amber-200 bg-amber-50 text-amber-700",
  },

  SHIPPED: {
    label: "Shipped",
    className:
      "border-purple-200 bg-purple-50 text-purple-700",
  },

  DELIVERED: {
    label: "Delivered",
    className:
      "border-green-200 bg-green-50 text-green-700",
  },
};

const formatCurrency = (amount) => {
  const currency =
    process.env.NEXT_PUBLIC_CURRENCY_SYMBOL ||
    "GH₵";

  return `${currency}${Number(
    amount || 0
  ).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (dateValue) => {
  if (!dateValue) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-GH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateValue));
};

const formatPaymentMethod = (method = "") => {
  return String(method)
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
};

export default function SellerOrderCard({
  order,
  onViewOrder,
}) {
  if (!order) {
    return null;
  }

  const status =
    statusStyles[order.status] ||
    statusStyles.ORDER_PLACED;

  const items = Array.isArray(order.orderItems)
    ? order.orderItems
    : [];

  const firstItem = items[0];

  const additionalItems =
    items.length > 1
      ? items.length - 1
      : 0;

  const handleViewOrder = () => {
    if (typeof onViewOrder === "function") {
      onViewOrder(order);
    }
  };

  return (
    <article
      className="
        group
        w-[340px]
        min-w-[340px]
        shrink-0
        snap-start
        overflow-hidden
        rounded-3xl
        border
        border-slate-200
        bg-white
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-0.5
        hover:border-green-200
        hover:shadow-xl
        hover:shadow-slate-200/60
      "
    >
      <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-green-50/60 px-4 py-4 sm:px-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-2 text-xs font-medium text-slate-400">
              <Package size={14} />
              <span>Tracking number</span>
            </div>

            <p
              className="truncate text-sm font-bold text-slate-900 sm:text-base"
              title={
                order.trackingNumber ||
                order.id
              }
            >
              {order.trackingNumber ||
                order.id}
            </p>
          </div>

          <span
            className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-bold ${status.className}`}
          >
            {status.label}
          </span>
        </div>
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
            <User size={18} />
          </div>

          <div className="min-w-0">
            <p className="text-xs text-slate-400">
              Customer
            </p>

            <p className="truncate text-sm font-semibold text-slate-900">
              {order.customer?.name ||
                "Customer"}
            </p>

            {order.customer?.email && (
              <p className="truncate text-xs text-slate-400">
                {order.customer.email}
              </p>
            )}
          </div>
        </div>

        {firstItem && (
          <div className="flex gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white">
              {firstItem.productImage ? (
                <img
                  src={firstItem.productImage}
                  alt={
                    firstItem.productName ||
                    "Ordered product"
                  }
                  className="h-full w-full object-contain p-1"
                />
              ) : (
                <ShoppingBag
                  size={24}
                  className="text-slate-300"
                />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-semibold text-slate-900">
                {firstItem.productName ||
                  "Product"}
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                <span>
                  Qty:{" "}
                  {firstItem.quantity || 1}
                </span>

                {firstItem.variantValue && (
                  <span>
                    {firstItem.variantName
                      ? `${firstItem.variantName}: `
                      : ""}
                    {firstItem.variantValue}
                  </span>
                )}
              </div>

              {additionalItems > 0 && (
                <p className="mt-2 text-xs font-medium text-green-700">
                  +{additionalItems} more product
                  {additionalItems === 1
                    ? ""
                    : "s"}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-slate-50 p-3">
            <div className="mb-1 flex items-center gap-1.5 text-xs text-slate-400">
              <CircleDollarSign size={14} />
              <span>Total</span>
            </div>

            <p className="font-bold text-green-700">
              {formatCurrency(order.total)}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-3">
            <div className="mb-1 flex items-center gap-1.5 text-xs text-slate-400">
              <ShoppingBag size={14} />
              <span>Items</span>
            </div>

            <p className="font-bold text-slate-900">
              {order.itemCount || 0}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-3">
            <div className="mb-1 flex items-center gap-1.5 text-xs text-slate-400">
              <CreditCard size={14} />
              <span>Payment</span>
            </div>

            <p className="truncate text-sm font-semibold text-slate-800">
              {formatPaymentMethod(
                order.paymentMethod
              )}
            </p>

            <p
              className={`mt-1 text-[11px] font-semibold ${
                order.isPaid
                  ? "text-green-600"
                  : "text-amber-600"
              }`}
            >
              {order.isPaid
                ? "Paid"
                : "Unpaid"}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-3">
            <div className="mb-1 flex items-center gap-1.5 text-xs text-slate-400">
              <CalendarDays size={14} />
              <span>Date</span>
            </div>

            <p className="text-sm font-semibold text-slate-800">
              {formatDate(order.createdAt)}
            </p>
          </div>
        </div>

        {!order.courier?.name &&
          order.status !== "DELIVERED" && (
            <div className="rounded-2xl border border-amber-100 bg-amber-50 px-3 py-2.5">
              <p className="text-xs font-medium text-amber-700">
                No courier has been assigned
                yet.
              </p>
            </div>
          )}

        {order.courier?.name && (
          <div className="rounded-2xl border border-green-100 bg-green-50 px-3 py-2.5">
            <p className="text-xs text-green-600">
              Courier
            </p>

            <p className="text-sm font-semibold text-green-800">
              {order.courier.name}
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={handleViewOrder}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
        >
          View order
          <ChevronRight size={17} />
        </button>
      </div>
    </article>
  );
}