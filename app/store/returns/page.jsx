"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import toast from "react-hot-toast";
import Loading from "@/components/Loading";
import Image from "next/image";
import { CheckCircle, XCircle, RotateCcw } from "lucide-react";

export default function StoreReturnsPage() {
  const { getToken } = useAuth();

  const [loading, setLoading] = useState(true);
  const [returns, setReturns] = useState([]);

  const fetchReturns = async () => {
    try {
      const token = await getToken();

      const { data } = await axios.get("/api/store/returns", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setReturns(data.returns);
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateReturnStatus = async (returnId, status) => {
    try {
      const token = await getToken();

      const { data } = await axios.patch(
        "/api/store/returns",
        { returnId, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setReturns((prev) =>
        prev.map((item) =>
          item.id === returnId ? data.returnRequest : item
        )
      );

      toast.success(data.message);
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="text-slate-500 pb-12">
      <div className="mb-8">
        <p className="text-sm font-semibold text-green-600">
          SELLER CENTER
        </p>

        <h1 className="text-3xl font-bold text-slate-900 mt-2">
          Returns & Refunds
        </h1>

        <p className="text-slate-500 mt-2">
          Review customer return requests and approve or reject them.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-xl shadow-slate-200/60 overflow-hidden max-w-7xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr className="text-left text-slate-600">
                <th className="px-5 py-4 font-semibold">Product</th>
                <th className="px-5 py-4 font-semibold">Customer</th>
                <th className="px-5 py-4 font-semibold">Reason</th>
                <th className="px-5 py-4 font-semibold">Details</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 font-semibold text-right">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {returns.length > 0 ? (
                returns.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                          {item.product?.images?.[0] ? (
                            <Image
                              src={item.product.images[0]}
                              alt={item.product?.name || "Product"}
                              width={48}
                              height={48}
                              className="object-contain"
                            />
                          ) : (
                            <RotateCcw size={18} className="text-slate-400" />
                          )}
                        </div>

                        <div>
                          <p className="font-bold text-slate-900 line-clamp-1">
                            {item.product?.name}
                          </p>
                          <p className="text-xs text-slate-400">
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

                    <td className="px-5 py-4">{item.reason}</td>

                    <td className="px-5 py-4 max-w-xs text-slate-500">
                      {item.details || "No extra details"}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={item.status} />
                    </td>

                    <td className="px-5 py-4 text-right">
                      {item.status === "PENDING" ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() =>
                              toast.promise(
                                updateReturnStatus(item.id, "APPROVED"),
                                { loading: "Approving return..." }
                              )
                            }
                            className="inline-flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-xs font-semibold"
                          >
                            <CheckCircle size={14} />
                            Approve
                          </button>

                          <button
                            onClick={() =>
                              toast.promise(
                                updateReturnStatus(item.id, "REJECTED"),
                                { loading: "Rejecting return..." }
                              )
                            }
                            className="inline-flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-xs font-semibold"
                          >
                            <XCircle size={14} />
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">
                          No action needed
                        </span>
                      )}
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