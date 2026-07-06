"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { RefreshCcw } from "lucide-react";

const statuses = [
  { value: "ORDER_PLACED", label: "Order Placed" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
];

export default function UpdateStatusBox({ orderId, currentStatus }) {
  const router = useRouter();

  const [status, setStatus] = useState(currentStatus);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();

    setLoading(true);

    const toastId = toast.loading("Updating delivery status...");

    try {
      const res = await fetch(`/api/admin/deliveries/${orderId}/update-status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          note,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Delivery status updated successfully.", {
          id: toastId,
          duration: 5000,
        });

        setNote("");
        router.refresh();
      } else {
        toast.error(data.error || "Failed to update delivery status.", {
          id: toastId,
          duration: 5000,
        });
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.", {
        id: toastId,
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[28px] p-6 shadow-xl shadow-slate-200/60 border border-slate-100">
      <div className="flex items-start gap-4 mb-5">
        <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
          <RefreshCcw size={22} />
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Update Delivery Status
          </h2>
          <p className="text-sm text-slate-500">
            Change the delivery progress and add a note.
          </p>
        </div>
      </div>

      <form onSubmit={handleUpdateStatus} className="space-y-4">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
        >
          {statuses.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>

        <textarea
          rows={4}
          placeholder="Optional note, e.g. Package picked up by courier"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition resize-none"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-3 font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Updating..." : "Update Status"}
        </button>
      </form>
    </div>
  );
}