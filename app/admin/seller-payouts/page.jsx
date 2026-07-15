"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import toast from "react-hot-toast";
import Loading from "@/components/Loading";

export default function SellerPayoutsPage() {
  const { getToken } = useAuth();

  const [loading, setLoading] = useState(true);
  const [payouts, setPayouts] = useState([]);
  const [summary, setSummary] = useState({});

  useEffect(() => {
    fetchPayouts();
  }, []);

  const fetchPayouts = async () => {
    try {
      setLoading(true);

      const token = await getToken();

      const { data } = await axios.get(
        "/api/admin/seller-payouts",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPayouts(
        Array.isArray(data.payouts)
          ? data.payouts
          : []
      );

      setSummary(data.summary || {});
    } catch (error) {
      console.error(
        "FETCH SELLER PAYOUTS ERROR:",
        error
      );

      toast.error(
        error?.response?.data?.error ||
          error?.message ||
          "Failed to load seller payouts."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <main className="space-y-6 pb-12">
      {/* Page heading */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Seller Payouts
        </h1>

        <p className="mt-1 text-slate-500">
          Review and release seller earnings.
        </p>
      </div>

      {/* Premium summary cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Held Funds"
          value={`₵${Number(
            summary.heldAmount || 0
          ).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          color="border-orange-200 bg-orange-50"
        />

        <SummaryCard
          title="Released"
          value={`₵${Number(
            summary.releasedAmount || 0
          ).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          color="border-green-200 bg-green-50"
        />

        <SummaryCard
          title="Commission"
          value={`₵${Number(
            summary.commission || 0
          ).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          color="border-blue-200 bg-blue-50"
        />

        <SummaryCard
          title="Pending Sellers"
          value={summary.pending || 0}
          color="border-purple-200 bg-purple-50"
        />
      </div>

      {/* Payout table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-[1000px] w-full">
          <thead className="bg-slate-100">
            <tr className="text-left text-sm text-slate-600">
              <th className="px-5 py-4 font-semibold">
                Tracking
              </th>

              <th className="px-5 py-4 font-semibold">
                Seller
              </th>

              <th className="px-5 py-4 font-semibold">
                Gross
              </th>

              <th className="px-5 py-4 font-semibold">
                Initial Release
              </th>

              <th className="px-5 py-4 font-semibold">
                Final Release
              </th>

              <th className="px-5 py-4 font-semibold">
                Commission
              </th>

              <th className="px-5 py-4 font-semibold">
                Status
              </th>

              <th className="px-5 py-4 font-semibold">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {payouts.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-5 py-12 text-center text-slate-500"
                >
                  No seller payout records found.
                </td>
              </tr>
            ) : (
              payouts.map((payout) => (
                <tr
                  key={payout.id}
                  className="border-t border-slate-200 transition hover:bg-slate-50"
                >
                  <td className="px-5 py-4 font-medium text-slate-800">
                    {payout.order?.trackingNumber ||
                      "-"}
                  </td>

                  <td className="px-5 py-4">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {payout.store?.name ||
                          "Unknown seller"}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {payout.store
                          ?.businessVerified
                          ? "Verified seller"
                          : "Not verified"}
                      </p>
                    </div>
                  </td>

                  <td className="px-5 py-4 font-semibold text-slate-800">
                    ₵
                    {Number(
                      payout.grossAmount || 0
                    ).toFixed(2)}
                  </td>

                  <td className="px-5 py-4">
                    <div>
                      <p className="font-semibold text-slate-800">
                        ₵
                        {Number(
                          payout.initialReleaseAmount ||
                            0
                        ).toFixed(2)}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {Number(
                          payout.initialReleasePercent ||
                            0
                        )}
                        %
                      </p>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <div>
                      <p className="font-semibold text-slate-800">
                        ₵
                        {Number(
                          payout.finalReleaseAmount ||
                            0
                        ).toFixed(2)}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {Number(
                          payout.finalReleasePercent ||
                            0
                        )}
                        %
                      </p>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <div>
                      <p className="font-semibold text-blue-700">
                        ₵
                        {Number(
                          payout.commissionAmount ||
                            0
                        ).toFixed(2)}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {Number(
                          payout.commissionPercent ||
                            0
                        )}
                        %
                      </p>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <StatusBadge
                      status={payout.status}
                    />
                  </td>

                  <td className="px-5 py-4">
                    <button
                      type="button"
                      disabled={
                        payout.initialTransferStatus ===
                          "PAID" ||
                        !payout.store
                          ?.businessVerified ||
                        !payout.store
                          ?.paystackRecipientCode
                      }
                      className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {payout.initialTransferStatus ===
                      "PAID"
                        ? "Initial Paid"
                        : "Release Initial"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function SummaryCard({
  title,
  value,
  color,
}) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm ${color}`}
    >
      <p className="text-sm font-medium text-slate-500">
        {title}
      </p>

      <h2 className="mt-2 break-words text-2xl font-bold text-slate-900 sm:text-3xl">
        {value}
      </h2>
    </div>
  );
}

function StatusBadge({ status }) {
  const statusStyles = {
    HELD: "bg-amber-100 text-amber-700",
    ELIGIBLE: "bg-blue-100 text-blue-700",
    APPROVED: "bg-indigo-100 text-indigo-700",
    PROCESSING:
      "bg-purple-100 text-purple-700",
    PARTIALLY_PAID:
      "bg-cyan-100 text-cyan-700",
    PAID: "bg-green-100 text-green-700",
    FAILED: "bg-red-100 text-red-700",
    REVERSED: "bg-orange-100 text-orange-700",
    CANCELLED: "bg-slate-200 text-slate-700",
  };

  const label = String(status || "HELD").replaceAll(
    "_",
    " "
  );

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        statusStyles[status] ||
        "bg-slate-100 text-slate-600"
      }`}
    >
      {label}
    </span>
  );
}