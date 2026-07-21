"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import toast from "react-hot-toast";
import Loading from "@/components/Loading";

export default function SellerPayoutsPage() {
  const { getToken } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [payouts, setPayouts] = useState([]);
  const [summary, setSummary] = useState({});
  const [processingPayoutId, setProcessingPayoutId] = useState(null);

  const fetchPayouts = useCallback(
    async ({ refresh = false } = {}) => {
      try {
        if (refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

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
        setRefreshing(false);
      }
    },
    [getToken]
  );

  const releaseInitialPayout = async (payout) => {
  if (
    processingPayoutId ||
    !payout?.id
  ) {
    return;
  }

  const amount = formatMoney(
    payout.initialReleaseAmount
  );

  const seller =
    payout.store?.name || "this seller";

  const confirmed = window.confirm(
    `Release the initial ${payout.initialReleasePercent}% payment of ${amount} to ${seller}?`
  );

  if (!confirmed) return;

  try {
    setProcessingPayoutId(payout.id);

    const token = await getToken();

    const { data } = await axios.post(
      `/api/admin/seller-payouts/${payout.id}/release-initial`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    toast.success(data.message);

    await fetchPayouts({
      refresh: true,
    });
  } catch (error) {
    console.error(
      "RELEASE INITIAL PAYOUT ERROR:",
      error
    );

    toast.error(
      error?.response?.data?.error ||
        error?.message ||
        "Failed to release the initial payout."
    );

    await fetchPayouts({
      refresh: true,
    });
  } finally {
    setProcessingPayoutId(null);
  }
};

  useEffect(() => {
    fetchPayouts();
  }, [fetchPayouts]);

  if (loading) {
    return <Loading />;
  }

  return (
    <main className="space-y-6 pb-12">
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Seller Payouts
          </h1>

          <p className="mt-1 text-slate-500">
            Review and release seller earnings.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            fetchPayouts({ refresh: true })
          }
          disabled={refreshing}
          className="inline-flex self-start items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Held Funds"
          value={formatMoney(
            summary.heldAmount
          )}
          color="border-orange-200 bg-orange-50"
        />

        <SummaryCard
          title="Released"
          value={formatMoney(
            summary.releasedAmount
          )}
          color="border-green-200 bg-green-50"
        />

        <SummaryCard
          title="Commission"
          value={formatMoney(
            summary.commission
          )}
          color="border-blue-200 bg-blue-50"
        />

        <SummaryCard
          title="Pending Payouts"
          value={summary.pending || 0}
          color="border-purple-200 bg-purple-50"
        />
      </div>

      {/* Desktop payout table */}
      <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
        <table className="w-full min-w-[1450px]">
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
                Initial Transfer
              </th>

              <th className="px-5 py-4 font-semibold">
                Final Transfer
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
                  colSpan={10}
                  className="px-5 py-14 text-center text-slate-500"
                >
                  No seller payout records found.
                </td>
              </tr>
            ) : (
              payouts.map((payout) => (
                
              <PayoutTableRow
                key={payout.id}
                payout={payout}
                processing={
                processingPayoutId === payout.id
              }
                onReleaseInitial={() =>
                releaseInitialPayout(payout)
              }
              />

              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile payout cards */}
      <div className="space-y-4 md:hidden">
        {payouts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center text-slate-500">
            No seller payout records found.
          </div>
        ) : (
          payouts.map((payout) => (
           <PayoutMobileCard
               key={payout.id}
               payout={payout}
               processing={
               processingPayoutId === payout.id
               }
               onReleaseInitial={() =>
               releaseInitialPayout(payout)
               }
            />
          ))
        )}
      </div>
    </main>
  );
}

function PayoutTableRow({ payout, processing, onReleaseInitial,}) {
  return (
    <tr className="border-t border-slate-200 transition hover:bg-slate-50">
      <td className="px-5 py-5 align-top font-medium text-slate-800">
        {payout.order?.trackingNumber || "-"}
      </td>

      <td className="px-5 py-5 align-top">
        <SellerInformation payout={payout} />
      </td>

      <td className="px-5 py-5 align-top font-semibold text-slate-800">
        {formatMoney(payout.grossAmount)}
      </td>

      <td className="px-5 py-5 align-top">
        <AmountBreakdown
          amount={payout.initialReleaseAmount}
          percent={payout.initialReleasePercent}
        />
      </td>

      <td className="px-5 py-5 align-top">
        <AmountBreakdown
          amount={payout.finalReleaseAmount}
          percent={payout.finalReleasePercent}
        />
      </td>

      <td className="px-5 py-5 align-top">
        <AmountBreakdown
          amount={payout.commissionAmount}
          percent={payout.commissionPercent}
          amountClassName="text-blue-700"
        />
      </td>

      <td className="px-5 py-5 align-top"> <TransferInformation status={payout.initialTransferStatus}
          reference={
            payout.initialTransferReference
          }
        />
      </td>

      <td className="px-5 py-5 align-top">
        <TransferInformation
          status={payout.finalTransferStatus}
          reference={
            payout.finalTransferReference
          }
        />
      </td>

      <td className="px-5 py-5 align-top">
        <StatusBadge status={payout.status} />
      </td>

      <td className="px-5 py-5 align-top">
        <PayoutAction payout={payout} processing={processing} onReleaseInitial={onReleaseInitial}/>
      </td>
    </tr>
  );
}


function PayoutMobileCard({
  payout,
  processing,
  onReleaseInitial,
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Tracking number
            </p>

            <p className="mt-1 break-all font-bold text-slate-900">
              {payout.order?.trackingNumber || "-"}
            </p>
          </div>

          <StatusBadge status={payout.status} />
        </div>
      </div>
      <div className="space-y-5 p-4"> <SellerInformation payout={payout} />
        <div className="grid grid-cols-2 gap-3"> <MobileDetail label="Gross" value={formatMoney( payout.grossAmount )} />
          <MobileDetail label="Commission" value={formatMoney(  payout.commissionAmount )} />
          <MobileDetail label={`Initial ${  payout.initialReleasePercent || 0 }%`} value={formatMoney(payout.initialReleaseAmount )}
          />
          <MobileDetail
            label={`Final ${
              payout.finalReleasePercent || 0
            }%`}
            value={formatMoney(
              payout.finalReleaseAmount
            )}
          />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400"> Initial transfer </p>
            <div className="mt-2">
              <TransferInformation status={ payout.initialTransferStatus } reference={ payout.initialTransferReference } />
            </div>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Final transfer
            </p>

            <div className="mt-2">
              <TransferInformation
                status={
                  payout.finalTransferStatus
                }
                reference={
                  payout.finalTransferReference
                }
              />
            </div>
          </div>
        </div>

        <PayoutAction payout={payout} processing={processing} onReleaseInitial={onReleaseInitial} fullWidth />
      </div>
    </article>
  );
}

function SellerInformation({ payout }) {
  const verified =
    Boolean(payout.store?.businessVerified);

  return (
    <div className="min-w-[210px]">
      <p className="font-semibold text-slate-900">
        {payout.store?.name || "Unknown seller"}
      </p>

      <div className="mt-1 flex items-center gap-2">
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
            verified
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {verified
            ? "Verified seller"
            : "Not verified"}
        </span>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all ${
            getProgressBarStyle(payout)
          }`}
        />
      </div>
    </div>
  );
}

function AmountBreakdown({
  amount,
  percent,
  amountClassName = "text-slate-800",
}) {
  return (
    <div>
      <p
        className={`font-semibold ${amountClassName}`}
      >
        {formatMoney(amount)}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {Number(percent || 0)}%
      </p>
    </div>
  );
}

function TransferInformation({
  status,
  reference,
}) {
  return (
    <div className="min-w-[145px]">
      <TransferStatusBadge status={status} />

      <p
        className="mt-2 max-w-[180px] truncate text-xs text-slate-500"
        title={reference || ""}
      >
        {reference || "No reference"}
      </p>
    </div>
  );
}

function PayoutAction({ payout, processing = false, onReleaseInitial, fullWidth = false,
}) {
  const sellerVerified =
    Boolean(payout.store?.businessVerified);

  const hasRecipient =
    Boolean(
      payout.paystackRecipientCode ||
        payout.store?.paystackRecipientCode
    );

  const initialPaid =
    payout.initialTransferStatus === "PAID";

  const finalPaid =
    payout.finalTransferStatus === "PAID";

  const initialFailed =
    payout.initialTransferStatus === "FAILED";

  const finalFailed =
    payout.finalTransferStatus === "FAILED";

  const actionWidth = fullWidth
    ? "w-full"
    : "min-w-[150px]";

  if (!sellerVerified) {
    return (
      <button
        type="button"
        disabled
        className={`${actionWidth} rounded-xl bg-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-500`}
      >
        Seller Not Verified
      </button>
    );
  }

  if (!hasRecipient) {
    return (
      <button
        type="button"
        disabled
        className={`${actionWidth} rounded-xl bg-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-500`}
      >
        Recipient Required
      </button>
    );
  }

 if (
  payout.initialTransferStatus === "PROCESSING"
) {
  return (
    <button
      type="button"
      disabled
      className={`${actionWidth} rounded-xl bg-purple-100 px-4 py-2.5 text-sm font-semibold text-purple-700`}
    >
      Processing Transfer
    </button>
  );
}

if (initialFailed && !initialPaid) {
  return (
    <button
      type="button"
      onClick={onReleaseInitial}
      disabled={processing}
      className={`${actionWidth} rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300`}
    >
      {processing ? "Retrying..." : "Retry Initial"}
    </button>
  );
}

if (!initialPaid) {
  return (
    <button
      type="button"
      onClick={onReleaseInitial}
      disabled={processing}
      className={`${actionWidth} rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-slate-300`}
    >
      {processing
        ? "Submitting..."
        : `Release Initial ${Number(
            payout.initialReleasePercent || 0
          )}%`}
    </button>
  );
}

  if (finalFailed && !finalPaid) {
    return (
      <button
        type="button"
        onClick={() =>
          toast(
            "The Paystack final-transfer endpoint will be connected after the initial transfer."
          )
        }
        className={`${actionWidth} rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700`}
      >
        Retry Final
      </button>
    );
  }

  if (!finalPaid) {
    const delivered =
      payout.order?.status === "DELIVERED";

    return (
      <button
        type="button"
        disabled={!delivered}
        onClick={() =>
          toast(
            "The Paystack final-transfer endpoint will be connected after the initial transfer."
          )
        }
        className={`${actionWidth} rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300`}
      >
        {delivered
          ? `Release Final ${Number(
              payout.finalReleasePercent || 0
            )}%`
          : "Awaiting Delivery"}
      </button>
    );
  }

  return (
    <span
      className={`${actionWidth} inline-flex items-center justify-center rounded-xl bg-green-100 px-4 py-2.5 text-sm font-semibold text-green-700`}
    >
      Paid Out
    </span>
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
    CANCELLED:
      "bg-slate-200 text-slate-700",
  };

  const normalizedStatus =
    String(status || "HELD");

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
        statusStyles[normalizedStatus] ||
        "bg-slate-100 text-slate-600"
      }`}
    >
      {normalizedStatus.replaceAll("_", " ")}
    </span>
  );
}

function TransferStatusBadge({ status }) {
  const statusStyles = {
    HELD: "bg-amber-100 text-amber-700",
    ELIGIBLE: "bg-blue-100 text-blue-700",
    APPROVED:
      "bg-indigo-100 text-indigo-700",
    PROCESSING:
      "bg-purple-100 text-purple-700",
    PAID: "bg-green-100 text-green-700",
    FAILED: "bg-red-100 text-red-700",
    REVERSED:
      "bg-orange-100 text-orange-700",
    CANCELLED:
      "bg-slate-200 text-slate-700",
  };

  const normalizedStatus =
    String(status || "HELD");

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
        statusStyles[normalizedStatus] ||
        "bg-slate-100 text-slate-600"
      }`}
    >
      {normalizedStatus.replaceAll("_", " ")}
    </span>
  );
}

function MobileDetail({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function getProgressBarStyle(payout) {
  if (
    payout.initialTransferStatus === "FAILED" ||
    payout.finalTransferStatus === "FAILED" ||
    payout.status === "FAILED"
  ) {
    return "w-full bg-red-500";
  }

  if (
    payout.finalTransferStatus === "PAID" ||
    payout.status === "PAID"
  ) {
    return "w-full bg-green-500";
  }
  if (
    payout.initialTransferStatus === "PAID" ||
    payout.status === "PARTIALLY_PAID"
  ) {
    return "w-1/4 bg-blue-500";
  }
  return "w-0 bg-amber-500";
}
function formatMoney(value) {
  return `₵${Number(value || 0).toLocaleString(
    undefined,
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;
}