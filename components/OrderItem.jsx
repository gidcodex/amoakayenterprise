'use client'

import Image from "next/image";
import Link from "next/link";
import { DotIcon, Truck, FileText, RotateCcw, X } from "lucide-react";
import { useSelector } from "react-redux";
import Rating from "./Rating";
import { useState } from "react";
import RatingModal from "./RatingModal";
import toast from "react-hot-toast";

const OrderItem = ({ order }) => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";

  const [ratingModal, setRatingModal] = useState(null);
  const [returnModal, setReturnModal] = useState(null);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [loadingReturn, setLoadingReturn] = useState(false);

  const { ratings } = useSelector((state) => state.rating);

  const submitReturnRequest = async () => {
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

      if (res.ok) {
        toast.success(data.message);
        setReturnModal(null);
        setReason("");
        setDetails("");
      } else {
        toast.error(data.error || "Failed to submit return request.");
      }
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setLoadingReturn(false);
    }
  };

  return (
    <>
      <tr className="text-sm">
        <td className="text-left">
          <div className="flex flex-col gap-6">
            {order.orderItems.map((item, index) => {
              const existingRating = ratings.find(
                (rating) =>
                  order.id === rating.orderId &&
                  item.product.id === rating.productId
              );

              return (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-20 aspect-square bg-slate-100 flex items-center justify-center rounded-md">
                    <Image
                      className="h-14 w-auto"
                      src={item.product.images[0]}
                      alt="product_img"
                      width={50}
                      height={50}
                    />
                  </div>

                  <div className="flex flex-col justify-center text-sm">
                    <p className="font-medium text-slate-600 text-base">
                      {item.product.name}
                    </p>

                    <p>
                      {currency}
                      {item.price} Qty : {item.quantity}
                    </p>

                    <p className="mb-1">
                      {new Date(order.createdAt).toDateString()}
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      Tracking No:
                      <span className="font-semibold text-slate-700 ml-1">
                        {order.trackingNumber}
                      </span>
                    </p>

                    <div className="mt-2">
                      {existingRating ? (
                        <Rating value={existingRating.rating} />
                      ) : (
                        <button
                          onClick={() =>
                            setRatingModal({
                              orderId: order.id,
                              productId: item.product.id,
                            })
                          }
                          className={`text-green-500 hover:bg-green-50 transition ${
                            order.status !== "DELIVERED" ? "hidden" : ""
                          }`}
                        >
                          Rate Product
                        </button>
                      )}

                      <div className="flex flex-wrap gap-3 mt-4">
                        <Link
                          href={`/track-order?tracking=${order.trackingNumber}`}
                          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition"
                        >
                          <Truck size={16} />
                          Track Shipment
                        </Link>

                        <Link
                          href={`/invoice/${order.id}`}
                          className="inline-flex items-center gap-2 bg-slate-800 hover:bg-black text-white px-4 py-2 rounded-xl text-sm font-semibold transition"
                        >
                          <FileText size={16} />
                          Invoice
                        </Link>

                        {order.status === "DELIVERED" && (
                          <button
                            onClick={() =>
                              setReturnModal({
                                orderId: order.id,
                                productId: item.product.id,
                                productName: item.product.name,
                              })
                            }
                            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition"
                          >
                            <RotateCcw size={16} />
                            Request Return
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {ratingModal && (
            <RatingModal
              ratingModal={ratingModal}
              setRatingModal={setRatingModal}
            />
          )}
        </td>

        <td className="text-center max-md:hidden">
          {currency}
          {order.total}
        </td>

        <td className="text-left max-md:hidden">
          <p>
            {order.address.name}, {order.address.street},
          </p>
          <p>
            {order.address.city}, {order.address.state}, {order.address.zip},{" "}
            {order.address.country},
          </p>
          <p>{order.address.phone}</p>
        </td>

        <td className="text-left space-y-2 text-sm max-md:hidden">
          <div className="flex items-center justify-center gap-1 rounded-full p-1 text-slate-500 bg-slate-100">
            <DotIcon size={10} className="scale-250" />
            {order.status.split("_").join(" ").toLowerCase()}
          </div>
        </td>
      </tr>

      <tr className="md:hidden">
        <td colSpan={5}>
          <p>
            {order.address.name}, {order.address.street}
          </p>
          <p>
            {order.address.city}, {order.address.state}, {order.address.zip},{" "}
            {order.address.country}
          </p>
          <p>{order.address.phone}</p>

          <br />

          <div className="flex items-center">
            <span className="text-center mx-auto px-6 py-1.5 rounded bg-green-100 text-green-700">
              {order.status.replace(/_/g, " ").toLowerCase()}
            </span>
          </div>
        </td>
      </tr>

      <tr>
        <td colSpan={4}>
          <div className="border-b border-slate-300 w-6/7 mx-auto" />
        </td>
      </tr>

      {returnModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setReturnModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold text-slate-900">
              Request Return
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              {returnModal.productName}
            </p>

            <label className="flex flex-col gap-2 mt-6 text-sm text-slate-600">
              Reason
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="border border-slate-200 rounded-lg px-4 py-3 outline-none"
              >
                <option value="">Select reason</option>
                <option value="Wrong item received">Wrong item received</option>
                <option value="Damaged product">Damaged product</option>
                <option value="Product not as described">
                  Product not as described
                </option>
                <option value="Changed my mind">Changed my mind</option>
                <option value="Other">Other</option>
              </select>
            </label>

            <label className="flex flex-col gap-2 mt-4 text-sm text-slate-600">
              Details
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={4}
                placeholder="Explain the issue..."
                className="border border-slate-200 rounded-lg px-4 py-3 outline-none resize-none"
              />
            </label>

            <button
              onClick={submitReturnRequest}
              disabled={loadingReturn}
              className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold disabled:opacity-60"
            >
              {loadingReturn ? "Submitting..." : "Submit Return Request"}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderItem;