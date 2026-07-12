'use client'

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
import Loading from "@/components/Loading";
import toast from "react-hot-toast";
import {
  ArrowDown,
  ArrowUp,
  AlertTriangle,
  PackageX,
  History,
  RotateCcw,
} from "lucide-react";

export default function InventoryHistoryPage() {
  const { getToken } = useAuth();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const token = await getToken();

      const { data } = await axios.get("/api/store/inventory", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setLogs(data.logs);
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="text-slate-500 pb-16">
      <div className="mb-8">
        <p className="text-sm font-semibold text-green-600">
          INVENTORY LEDGER
        </p>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
          Inventory History
        </h1>

        <p className="text-sm sm:text-base text-slate-500 mt-2">
          Track every stock movement, sale, restock, adjustment, and warning.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-xl shadow-slate-200/60 overflow-hidden max-w-7xl">
        <div className="px-4 sm:px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Stock Movement Ledger
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Latest inventory activities appear first.
            </p>
          </div>

          <div className="hidden sm:flex w-11 h-11 rounded-lg bg-green-100 text-green-600 items-center justify-center">
            <History size={21} />
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full min-w-[950px] text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr className="text-left text-slate-600">
                <th className="px-5 py-4 font-semibold">Product</th>
                <th className="px-5 py-4 font-semibold">Activity</th>
                <th className="px-5 py-4 font-semibold text-center">Old Stock</th>
                <th className="px-5 py-4 font-semibold text-center">New Stock</th>
                <th className="px-5 py-4 font-semibold text-center">Quantity</th>
                <th className="px-5 py-4 font-semibold">Note</th>
                <th className="px-5 py-4 font-semibold text-right">Date</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {logs.length > 0 ? (
                logs.map((log) => {
                  const style = getBadge(log.type);
                  const image =
                    log.variantImage ||
                    log.variantImages?.[0] ||
                    log.product?.images?.[0];

                  return (
                    <tr key={log.id} className="hover:bg-slate-50 transition">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                            {image ? (
                              <Image
                                src={image}
                                alt={log.product?.name || "Product"}
                                width={50}
                                height={50}
                                className="w-full h-full object-contain p-1"
                              />
                            ) : (
                              <RotateCcw size={18} className="text-slate-400" />
                            )}
                          </div>

                          <div>
                            <p className="font-bold text-slate-900 line-clamp-1">
                              {log.product?.name || "Deleted product"}
                            </p>

                            {log.variantName && log.variantValue && (
                              <p className="text-xs text-blue-600 font-semibold mt-1">
                                {log.variantName}: {log.variantValue}
                              </p>
                            )}

                            <p className="text-xs text-slate-400">
                              ID: {log.productId.slice(0, 10)}...
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-2 whitespace-nowrap px-3 py-1 rounded-full text-xs font-bold ${style.color}`}
                        >
                          {style.icon}
                          {log.type.replaceAll("_", " ")}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-center font-semibold text-slate-700">
                        {log.oldStock}
                      </td>

                      <td className="px-5 py-4 text-center font-bold text-slate-900">
                        {log.newStock}
                      </td>

                      <td className="px-5 py-4 text-center">
                        <span className="font-bold text-slate-700">
                          {log.quantity}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-500 max-w-xs">
                        <p className="line-clamp-2">
                          {log.note || "No note provided."}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-right text-slate-400 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-14 text-center text-slate-400">
                    No inventory history yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden p-4 space-y-4">
          {logs.length > 0 ? (
            logs.map((log) => {
              const style = getBadge(log.type);
              const image =
                log.variantImage ||
                log.variantImages?.[0] ||
                log.product?.images?.[0];

              return (
                <div
                  key={log.id}
                  className="bg-slate-50 border border-slate-100 rounded-2xl p-4"
                >
                  <div className="flex gap-3">
                    <div className="w-16 h-16 rounded-xl bg-white border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                      {image ? (
                        <Image
                          src={image}
                          alt={log.product?.name || "Product"}
                          width={64}
                          height={64}
                          className="w-full h-full object-contain p-2"
                        />
                      ) : (
                        <RotateCcw size={18} className="text-slate-400" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900 line-clamp-2">
                        {log.product?.name || "Deleted product"}
                      </p>

                      {log.variantName && log.variantValue && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-semibold">
                            {log.variantName}
                          </span>
                          <span className="text-xs text-slate-600">
                            {log.variantValue}
                          </span>
                        </div>
                      )}

                      <p className="text-xs text-slate-400 mt-1">
                        ID: {log.productId.slice(0, 10)}...
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <span
                      className={`inline-flex items-center gap-2 whitespace-nowrap px-3 py-1 rounded-full text-xs font-bold ${style.color}`}
                    >
                      {style.icon}
                      {log.type.replaceAll("_", " ")}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mt-4 text-center">
                    <div className="bg-white rounded-xl p-3">
                      <p className="text-xs text-slate-400">Old</p>
                      <p className="font-bold text-slate-800">{log.oldStock}</p>
                    </div>

                    <div className="bg-white rounded-xl p-3">
                      <p className="text-xs text-slate-400">New</p>
                      <p className="font-bold text-slate-900">{log.newStock}</p>
                    </div>

                    <div className="bg-white rounded-xl p-3">
                      <p className="text-xs text-slate-400">Qty</p>
                      <p className="font-bold text-slate-800">{log.quantity}</p>
                    </div>
                  </div>

                  <p className="text-sm text-slate-500 mt-4">
                    {log.note || "No note provided."}
                  </p>

                  <p className="text-xs text-slate-400 mt-3">
                    {new Date(log.createdAt).toLocaleString()}
                  </p>
                </div>
              );
            })
          ) : (
            <div className="px-5 py-14 text-center text-slate-400">
              No inventory history yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getBadge(type) {
  if (type === "RESTOCK") {
    return {
      color: "bg-green-100 text-green-700",
      icon: <ArrowUp size={15} />,
    };
  }

  if (type === "SALE") {
    return {
      color: "bg-blue-100 text-blue-700",
      icon: <ArrowDown size={15} />,
    };
  }

  if (type === "LOW_STOCK") {
    return {
      color: "bg-yellow-100 text-yellow-700",
      icon: <AlertTriangle size={15} />,
    };
  }

  if (type === "OUT_OF_STOCK") {
    return {
      color: "bg-red-100 text-red-700",
      icon: <PackageX size={15} />,
    };
  }

  return {
    color: "bg-slate-100 text-slate-700",
    icon: <RotateCcw size={15} />,
  };
}