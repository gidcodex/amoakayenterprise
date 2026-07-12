"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight,
  FileText,
  Package,
  RotateCcw,
  ShoppingCart,
  Truck,
  X,
} from "lucide-react";
import { useSelector } from "react-redux";
import { useState } from "react";
import Rating from "./Rating";
import RatingModal from "./RatingModal";
import toast from "react-hot-toast";

const statusStyles = {
  ORDER_PLACED: "bg-blue-50 text-blue-700 border-blue-200",
  PROCESSING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  SHIPPED: "bg-purple-50 text-purple-700 border-purple-200",
  DELIVERED: "bg-green-50 text-green-700 border-green-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
};

const statusLabels = {
  ORDER_PLACED: "Order placed",
  PROCESSING: "In progress",
  SHIPPED: "Shipped",
  DELIVERED: "Completed",
  CANCELLED: "Cancelled",
};

const OrderItem = ({ order }) => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";

  const [ratingModal, setRatingModal] = useState(null);
  const [returnModal, setReturnModal] = useState(null);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [loadingReturn, setLoadingReturn] = useState(false);

  const { ratings = [] } = useSelector((state) => state.rating);

  const submitReturnRequest = async () => {
    if (!returnModal) return;

    if (!reason.trim()) {
      return toast.error("Please select a return reason.");
    }

    try {
      setLoadingReturn(true);

      const res = await fetch("/api/returns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: returnModal.orderId,
          productId: returnModal.productId,
          reason,
          details,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        return toast.error(
          data.error || "Failed to submit return request."
        );
      }

      toast.success(data.message || "Return request submitted.");
      setReturnModal(null);
      setReason("");
      setDetails("");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    } finally {
      setLoadingReturn(false);
    }
  };

  const storeName =
    order.store?.name ||
    order.orderItems?.[0]?.product?.store?.name ||
    "Amoakay Deals";

  return (
    <>
      <article className="overflow-hidden border border-slate-200 bg-white shadow-sm">
        {/* Order card header */}
        <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Package size={19} className="shrink-0 text-green-600" />

            <p className="truncate font-bold text-slate-900">
              {storeName}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex whitespace-nowrap border px-3 py-1 text-xs font-bold ${
                statusStyles[order.status] ||
                "border-slate-200 bg-slate-100 text-slate-600"
              }`}
            >
              {statusLabels[order.status] ||
                order.status?.replaceAll("_", " ").toLowerCase()}
            </span>

            <Link
              href={`/track-order?tracking=${order.trackingNumber}`}
              className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700 transition hover:text-green-600"
            >
              Order details
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>

        {/* Order information */}
        <div className="grid gap-3 border-b border-slate-200 px-4 py-4 text-sm sm:grid-cols-[1fr_auto] sm:items-center sm:px-6">
          <div className="flex flex-col gap-2 text-slate-500 sm:flex-row sm:flex-wrap sm:gap-x-8">
            <p>
              Order ID:
              <span className="ml-2 font-semibold text-slate-900">
                {order.trackingNumber || order.id}
              </span>
            </p>

            <p>
              Order time:
              <span className="ml-2 font-semibold text-slate-900">
                {new Date(order.createdAt).toLocaleString()}
              </span>
            </p>
          </div>

          <div className="sm:text-right">
            <p className="text-slate-500">
              {order.orderItems?.length || 0} item(s):
              <span className="ml-2 text-lg font-bold text-slate-900">
                {currency}
                {Number(order.total || 0).toLocaleString()}
              </span>
            </p>
          </div>
        </div>

        {/* Ordered products */}
        <div className="divide-y divide-slate-200">
          {order.orderItems?.map((item, index) => {
            const existingRating = ratings.find(
              (rating) =>
                rating.orderId === order.id &&
                rating.productId === item.productId
            );

            const image =
              item.variantImage ||
              item.variantImages?.[0] ||
              item.product?.images?.[0];

            return (
              <div
                key={`${item.productId}-${item.variantId || index}`}
                className="grid gap-4 px-4 py-5 sm:grid-cols-[96px_minmax(0,1fr)_auto] sm:items-center sm:px-6"
              >
                <Link
                  href={`/product/${item.product?.id || item.productId}`}
                  className="flex h-24 w-24 items-center justify-center border border-slate-200 bg-slate-50"
                >
                  {image ? (
                    <Image
                      src={image}
                      alt={item.product?.name || "Product"}
                      width={88}
                      height={88}
                      className="h-20 w-20 object-contain p-1"
                    />
                  ) : (
                    <Package size={28} className="text-slate-300" />
                  )}
                </Link>

                <div className="min-w-0">
                  <Link
                    href={`/product/${item.product?.id || item.productId}`}
                    className="font-semibold leading-6 text-slate-900 transition hover:text-green-600"
                  >
                    {item.product?.name || "Product"}
                  </Link>

                  {item.variantName && item.variantValue && (
                    <p className="mt-2 text-sm text-slate-500">
                      {item.variantName}:
                      <span className="ml-1 font-semibold text-slate-700">
                        {item.variantValue}
                      </span>
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
                    <p>
                      Unit price:
                      <span className="ml-1 font-semibold text-slate-900">
                        {currency}
                        {Number(item.price || 0).toLocaleString()}
                      </span>
                    </p>

                    <p>
                      Quantity:
                      <span className="ml-1 font-semibold text-slate-900">
                        {item.quantity}
                      </span>
                    </p>
                  </div>

                  {existingRating && (
                    <div className="mt-3">
                      <Rating value={existingRating.rating} />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-5 sm:justify-end">
                  <p className="text-lg font-bold text-slate-900">
                    {currency}
                    {Number(
                      item.price * item.quantity
                    ).toLocaleString()}
                  </p>

                  <span className="font-semibold text-slate-500">
                    ×{item.quantity}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer and actions */}
        <div className="flex flex-col gap-4 border-t border-slate-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="text-sm text-slate-500">
            <p>
              Delivery to:
              <span className="ml-1 font-semibold text-slate-800">
                {order.address?.name || "Customer"}
              </span>
            </p>

            <p className="mt-1 line-clamp-1">
              {[
                order.address?.street,
                order.address?.city,
                order.address?.state,
                order.address?.country,
              ]
                .filter(Boolean)
                .join(", ")}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            <Link
              href={`/track-order?tracking=${order.trackingNumber}`}
              className="inline-flex items-center justify-center gap-2 border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-green-400 hover:bg-green-50 hover:text-green-700"
            >
              <Truck size={16} />
              Track
            </Link>

            <Link
              href={`/invoice/${order.id}`}
              className="inline-flex items-center justify-center gap-2 border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500 hover:bg-slate-50"
            >
              <FileText size={16} />
              Invoice
            </Link>

            {order.status === "DELIVERED" &&
              order.orderItems?.map((item) => {
                const existingRating = ratings.find(
                  (rating) =>
                    rating.orderId === order.id &&
                    rating.productId === item.productId
                );

                return (
                  <div
                    key={`actions-${item.productId}-${item.variantId || ""}`}
                    className="contents"
                  >
                    {!existingRating && (
                      <button
                        type="button"
                        onClick={() =>
                          setRatingModal({
                            orderId: order.id,
                            productId: item.productId,
                          })
                        }
                        className="inline-flex items-center justify-center border border-green-300 bg-white px-4 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-50"
                      >
                        Rate product
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        setReturnModal({
                          orderId: order.id,
                          productId: item.productId,
                          productName: item.product?.name,
                        })
                      }
                      className="inline-flex items-center justify-center gap-2 border border-orange-300 bg-white px-4 py-2 text-sm font-semibold text-orange-600 transition hover:bg-orange-50"
                    >
                      <RotateCcw size={16} />
                      Return
                    </button>
                  </div>
                );
              })}

            {order.orderItems?.[0]?.product?.id && (
              <Link
                href={`/product/${order.orderItems[0].product.id}`}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-500 px-5 py-2 text-sm font-bold text-white transition hover:from-green-700 hover:to-emerald-600"
              >
                <ShoppingCart size={16} />
                Buy again
              </Link>
            )}
          </div>
        </div>
      </article>

      {ratingModal && (
        <RatingModal
          ratingModal={ratingModal}
          setRatingModal={setRatingModal}
        />
      )}

      {returnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-md bg-white p-5 shadow-2xl sm:p-6">
            <button
              type="button"
              onClick={() => {
                setReturnModal(null);
                setReason("");
                setDetails("");
              }}
              className="absolute right-4 top-4 text-slate-400 transition hover:text-slate-700"
              aria-label="Close return request"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold text-slate-900">
              Request Return
            </h2>

            <p className="mt-1 pr-8 text-sm text-slate-500">
              {returnModal.productName}
            </p>

            <label className="mt-6 flex flex-col gap-2 text-sm text-slate-600">
              Reason
              <select
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                className="border border-slate-200 px-4 py-3 outline-none focus:border-green-400 focus:ring-4 focus:ring-green-100"
              >
                <option value="">Select reason</option>
                <option value="Wrong item received">
                  Wrong item received
                </option>
                <option value="Damaged product">Damaged product</option>
                <option value="Product not as described">
                  Product not as described
                </option>
                <option value="Changed my mind">Changed my mind</option>
                <option value="Other">Other</option>
              </select>
            </label>

            <label className="mt-4 flex flex-col gap-2 text-sm text-slate-600">
              Details
              <textarea
                value={details}
                onChange={(event) => setDetails(event.target.value)}
                rows={4}
                placeholder="Explain the issue..."
                className="resize-none border border-slate-200 px-4 py-3 outline-none focus:border-green-400 focus:ring-4 focus:ring-green-100"
              />
            </label>

            <button
              type="button"
              onClick={submitReturnRequest}
              disabled={loadingReturn}
              className="mt-6 w-full bg-gradient-to-r from-orange-500 to-red-500 py-3 font-semibold text-white transition hover:from-orange-600 hover:to-red-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingReturn
                ? "Submitting..."
                : "Submit Return Request"}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderItem;