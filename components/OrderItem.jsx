"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight,
  CircleDollarSign,
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
  REFUNDED: "bg-cyan-50 text-cyan-700 border-cyan-200",
};

const statusLabels = {
  ORDER_PLACED: "Order placed",
  PROCESSING: "In progress",
  SHIPPED: "Shipped",
  DELIVERED: "Completed",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

const refundReasons = [
  "Ordered by mistake",
  "Changed my mind",
  "Found a better price",
  "Incorrect delivery information",
  "Payment issue",
  "Order is taking too long",
  "Other",
];

const returnReasons = [
  "Wrong item received",
  "Damaged product",
  "Product not as described",
  "Changed my mind",
  "Other",
];

const OrderItem = ({ order }) => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";

  const [ratingModal, setRatingModal] = useState(null);

  const [returnModal, setReturnModal] = useState(null);
  const [returnReason, setReturnReason] = useState("");
  const [returnDetails, setReturnDetails] = useState("");
  const [loadingReturn, setLoadingReturn] = useState(false);

  const [refundModal, setRefundModal] = useState(null);
  const [refundReason, setRefundReason] = useState("");
  const [refundDetails, setRefundDetails] = useState("");
  const [loadingRefund, setLoadingRefund] = useState(false);

  const { ratings = [] } = useSelector((state) => state.rating);

  const canRequestRefund = ["ORDER_PLACED", "PROCESSING"].includes(
    order.status
  );

  const isCOD = order.paymentMethod === "COD";

  const closeReturnModal = () => {
    setReturnModal(null);
    setReturnReason("");
    setReturnDetails("");
  };

  const closeRefundModal = () => {
    setRefundModal(null);
    setRefundReason("");
    setRefundDetails("");
  };

  const submitReturnRequest = async () => {
    if (!returnModal) return;

    if (!returnReason.trim()) {
      toast.error("Please select a return reason.");
      return;
    }

    try {
      setLoadingReturn(true);

      const response = await fetch("/api/returns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: returnModal.orderId,
          productId: returnModal.productId,
          reason: returnReason,
          details: returnDetails,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to submit return request.");
        return;
      }

      toast.success(data.message || "Return request submitted.");
      closeReturnModal();
    } catch (error) {
      console.error("Submit return request error:", error);
      toast.error("Something went wrong while submitting the return request.");
    } finally {
      setLoadingReturn(false);
    }
  };

  const submitRefundRequest = async () => {
    if (!refundModal) return;

    if (!refundReason.trim()) {
      toast.error(
        isCOD
          ? "Please select a cancellation reason."
          : "Please select a refund reason."
      );
      return;
    }

    try {
      setLoadingRefund(true);

      const response = await fetch("/api/refunds", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: refundModal.orderId,
          orderItemId: refundModal.orderItemId,
          reason: refundReason,
          details: refundDetails,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(
          data.error ||
            (isCOD
              ? "Failed to submit cancellation request."
              : "Failed to submit refund request.")
        );
        return;
      }

      toast.success(
        data.message ||
          (isCOD
            ? "Cancellation request submitted."
            : "Refund request submitted.")
      );

      closeRefundModal();
    } catch (error) {
      console.error("Submit refund request error:", error);

      toast.error(
        isCOD
          ? "Something went wrong while submitting the cancellation request."
          : "Something went wrong while submitting the refund request."
      );
    } finally {
      setLoadingRefund(false);
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

            <p className="truncate font-bold text-slate-900">{storeName}</p>
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

            <p>
              Payment:
              <span className="ml-2 font-semibold text-slate-900">
                {order.paymentMethod}
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

            const productName = item.product?.name || "Product";

            return (
              <div
                key={item.id || `${item.productId}-${item.variantId || index}`}
                className="grid gap-4 px-4 py-5 sm:grid-cols-[96px_minmax(0,1fr)_auto] sm:items-center sm:px-6"
              >
                <Link
                  href={`/product/${item.product?.id || item.productId}`}
                  className="flex h-24 w-24 items-center justify-center border border-slate-200 bg-slate-50"
                >
                  {image ? (
                    <Image
                      src={image}
                      alt={productName}
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
                    {productName}
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

                  {canRequestRefund && (
                    <button
                      type="button"
                      onClick={() =>
                        setRefundModal({
                          orderId: order.id,
                          orderItemId: item.id,
                          productId: item.productId,
                          productName,
                          quantity: item.quantity,
                          amount: Number(item.price || 0) * item.quantity,
                        })
                      }
                      className="mt-4 inline-flex items-center justify-center gap-2 border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-100"
                    >
                      <CircleDollarSign size={16} />

                      {isCOD
                        ? "Request cancellation"
                        : "Request refund"}
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-5 sm:justify-end">
                  <p className="text-lg font-bold text-slate-900">
                    {currency}
                    {Number(
                      Number(item.price || 0) * Number(item.quantity || 0)
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
                    key={`actions-${item.id || item.productId}`}
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
                          productName: item.product?.name || "Product",
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

      {/* Refund or cancellation modal */}
      {refundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto bg-white p-5 shadow-2xl sm:p-7">
            <button
              type="button"
              onClick={closeRefundModal}
              disabled={loadingRefund}
              className="absolute right-4 top-4 text-slate-400 transition hover:text-slate-700 disabled:cursor-not-allowed"
              aria-label="Close refund request"
            >
              <X size={20} />
            </button>

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <CircleDollarSign size={24} />
            </div>

            <h2 className="mt-4 pr-8 text-xl font-bold text-slate-900">
              {isCOD
                ? "Request Order Cancellation"
                : "Request Cancellation & Refund"}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {isCOD
                ? "The seller will review your cancellation request before the order is shipped."
                : "The seller will review your request first. The marketplace administrator will make the final refund decision."}
            </p>

            <div className="mt-5 border border-slate-200 bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">
                {refundModal.productName}
              </p>

              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-500">
                <span>Quantity: {refundModal.quantity}</span>

                <span>
                  Amount:{" "}
                  <strong className="text-slate-800">
                    {currency}
                    {Number(refundModal.amount || 0).toLocaleString()}
                  </strong>
                </span>
              </div>

              <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Payment method: {order.paymentMethod}
              </p>
            </div>

            <label className="mt-6 flex flex-col gap-2 text-sm font-medium text-slate-700">
              {isCOD ? "Cancellation reason" : "Refund reason"}

              <select
                value={refundReason}
                onChange={(event) => setRefundReason(event.target.value)}
                disabled={loadingRefund}
                className="border border-slate-200 bg-white px-4 py-3 outline-none focus:border-green-400 focus:ring-4 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                <option value="">Select a reason</option>

                {refundReasons.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="mt-4 flex flex-col gap-2 text-sm font-medium text-slate-700">
              Additional details

              <textarea
                value={refundDetails}
                onChange={(event) => setRefundDetails(event.target.value)}
                disabled={loadingRefund}
                rows={4}
                placeholder="Provide any additional information about your request..."
                className="resize-none border border-slate-200 px-4 py-3 outline-none focus:border-green-400 focus:ring-4 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </label>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeRefundModal}
                disabled={loadingRefund}
                className="border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Keep order
              </button>

              <button
                type="button"
                onClick={submitRefundRequest}
                disabled={loadingRefund}
                className="bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingRefund
                  ? "Submitting..."
                  : isCOD
                    ? "Submit Cancellation Request"
                    : "Submit Refund Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Existing delivered-product return modal */}
      {returnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-md bg-white p-5 shadow-2xl sm:p-6">
            <button
              type="button"
              onClick={closeReturnModal}
              disabled={loadingReturn}
              className="absolute right-4 top-4 text-slate-400 transition hover:text-slate-700 disabled:cursor-not-allowed"
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
                value={returnReason}
                onChange={(event) => setReturnReason(event.target.value)}
                disabled={loadingReturn}
                className="border border-slate-200 px-4 py-3 outline-none focus:border-green-400 focus:ring-4 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                <option value="">Select reason</option>

                {returnReasons.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="mt-4 flex flex-col gap-2 text-sm text-slate-600">
              Details

              <textarea
                value={returnDetails}
                onChange={(event) => setReturnDetails(event.target.value)}
                disabled={loadingReturn}
                rows={4}
                placeholder="Explain the issue..."
                className="resize-none border border-slate-200 px-4 py-3 outline-none focus:border-green-400 focus:ring-4 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-slate-100"
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