"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Truck } from "lucide-react";

export default function AssignCourierBox({ orderId, currentCourier }) {
  const router = useRouter();

  const [courierName, setCourierName] = useState(currentCourier?.name || "");
  const [courierPhone, setCourierPhone] = useState(currentCourier?.phone || "");
  const [courierEmail, setCourierEmail] = useState(currentCourier?.email || "");
  const [loading, setLoading] = useState(false);

  const handleAssignCourier = async (e) => {
    e.preventDefault();

    if (!courierName || !courierPhone) {
      toast.error("Courier name and phone number are required.");
      return;
    }

    setLoading(true);

    const toastId = toast.loading("Assigning courier...");

    try {
      const res = await fetch(`/api/admin/deliveries/${orderId}/assign-courier`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courierName,
          courierPhone,
          courierEmail,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Courier assigned successfully.", {
          id: toastId,
          duration: 5000,
        });

        router.refresh();
      } else {
        toast.error(data.error || "Failed to assign courier.", {
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
        <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center text-green-600 shrink-0">
          <Truck size={22} />
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Assign Courier
          </h2>
          <p className="text-sm text-slate-500">
            Add courier details for this delivery.
          </p>
        </div>
      </div>

      <form onSubmit={handleAssignCourier} className="space-y-4">
        <input
          type="text"
          placeholder="Courier Name"
          value={courierName}
          onChange={(e) => setCourierName(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-100 transition"
        />

        <input
          type="text"
          placeholder="Courier Phone"
          value={courierPhone}
          onChange={(e) => setCourierPhone(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-100 transition"
        />

        <input
          type="email"
          placeholder="Courier Email (optional)"
          value={courierEmail}
          onChange={(e) => setCourierEmail(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-100 transition"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white rounded-2xl py-3 font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Assigning..." : "Assign Courier"}
        </button>
      </form>
    </div>
  );
}