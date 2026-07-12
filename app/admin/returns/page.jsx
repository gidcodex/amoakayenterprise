"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Loading from "@/components/Loading";
import Image from "next/image";
import { RotateCcw } from "lucide-react";

export default function AdminReturnsPage() {
  const [loading, setLoading] = useState(true);
  const [returns, setReturns] = useState([]);

  const fetchReturns = async () => {
    try {
      const { data } = await axios.get("/api/admin/returns");
      setReturns(data.returns);
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="text-slate-500 pb-12">
      <div className="mb-8">
        <p className="text-sm font-semibold text-green-600">ADMIN CENTER</p>

        <h1 className="text-3xl font-bold text-slate-900 mt-2">
          Returns & Refunds
        </h1>

        <p className="text-slate-500 mt-2">
          Monitor all customer return requests across the marketplace.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-xl shadow-slate-200/60 overflow-hidden max-w-7xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr className="text-left text-slate-600">
                <th className="px-5 py-4 font-semibold">Product</th>
                <th className="px-5 py-4 font-semibold">Customer</th>
                <th className="px-5 py-4 font-semibold">Store</th>
                <th className="px-5 py-4 font-semibold">Reason</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 font-semibold text-right">Date</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {returns.length > 0 ? (
                returns.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    
                    <td className="px-5 py-4">
  <div className="flex items-center gap-3">
    <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
      {item.orderItem?.variantImage ||
      item.orderItem?.variantImages?.[0] ||
      item.product?.images?.[0] ? (
        <Image
          src={
            item.orderItem?.variantImage ||
            item.orderItem?.variantImages?.[0] ||
            item.product.images[0]
          }
          alt={item.product?.name || "Product"}
          width={56}
          height={56}
          className="object-contain p-1"
        />
      ) : (
        <RotateCcw size={18} className="text-slate-400" />
      )}
    </div>

    <div>
      <p className="font-bold text-slate-900">
        {item.product?.name}
      </p>

      {item.orderItem?.variantName && item.orderItem?.variantValue && (
        <div className="flex items-center gap-2 mt-1">
          <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-semibold">
            {item.orderItem.variantName}
          </span>

          <span className="text-xs text-slate-600">
            {item.orderItem.variantValue}
          </span>
        </div>
      )}

      <p className="text-xs text-slate-400 mt-1">
        Order: {item.order?.trackingNumber}
      </p>
    </div>
  </div>
</td>

                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">
                        {item.user?.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {item.user?.email}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">
                        {item.store?.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {item.store?.email}
                      </p>
                    </td>

                    <td className="px-5 py-4 max-w-xs text-slate-500">
                      {item.reason}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={item.status} />
                    </td>

                    <td className="px-5 py-4 text-right text-slate-400 whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-slate-400"
                  >
                    No return requests yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    PENDING: "bg-yellow-100 text-yellow-700",
    APPROVED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
    REFUNDED: "bg-blue-100 text-blue-700",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold ${
        styles[status] || "bg-slate-100 text-slate-600"
      }`}
    >
      {status?.toLowerCase()}
    </span>
  );
}