"use client";

import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  BadgeCheck,
  Banknote,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Eye,
  FileSearch,
  Filter,
  Package,
  RefreshCcw,
  Search,
  ShieldCheck,
  Store,
  UserRound,
  WalletCards,
  X,
  XCircle,
} from "lucide-react";

import Loading from "@/components/Loading";

const filterTabs = [
  { label: "All", value: "ALL" },
  { label: "Seller review", value: "REQUESTED" },
  { label: "Admin review", value: "UNDER_ADMIN_REVIEW" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Refunded", value: "REFUNDED" },
];

const paymentOptions = [
  { label: "All payments", value: "ALL" },
  { label: "Paystack", value: "PAYSTACK" },
  { label: "Stripe", value: "STRIPE" },
  { label: "Cash on delivery", value: "COD" },
];

const statusConfig = {
  REQUESTED: {
    label: "Seller review",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  SELLER_REVIEWED: {
    label: "Seller reviewed",
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
  UNDER_ADMIN_REVIEW: {
    label: "Admin review",
    className: "border-indigo-200 bg-indigo-50 text-indigo-700",
  },
  APPROVED: {
    label: "Approved",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  REJECTED: {
    label: "Rejected",
    className: "border-red-200 bg-red-50 text-red-700",
  },
  PROCESSING: {
    label: "Processing",
    className: "border-violet-200 bg-violet-50 text-violet-700",
  },
  REFUNDED: {
    label: "Refunded",
    className: "border-cyan-200 bg-cyan-50 text-cyan-700",
  },
  FAILED: {
    label: "Failed",
    className: "border-red-200 bg-red-50 text-red-700",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "border-slate-200 bg-slate-100 text-slate-600",
  },
};

const decisionConfig = {
  APPROVE: {
    label: "Seller recommends approval",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  REJECT: {
    label: "Seller recommends rejection",
    className: "border-red-200 bg-red-50 text-red-700",
  },
};

const paymentConfig = {
  PAYSTACK: {
    label: "Paystack",
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
  STRIPE: {
    label: "Stripe",
    className: "border-violet-200 bg-violet-50 text-violet-700",
  },
  COD: {
    label: "Cash on delivery",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
};

export default function AdminRefundsPage() {
  const { getToken } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [refunds, setRefunds] = useState([]);
  const [summary, setSummary] = useState(null);

  const [activeFilter, setActiveFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedRefund, setSelectedRefund] = useState(null);
  const [decisionModal, setDecisionModal] = useState(null);
  const [adminNote, setAdminNote] = useState("");

  const currency =
    process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "GH₵";

  const fetchRefunds = useCallback(
    async ({ showRefreshToast = false } = {}) => {
      try {
        if (showRefreshToast) {
          setRefreshing(true);
        }

        const token = await getToken();

        const { data } = await axios.get("/api/admin/refunds", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setRefunds(data.refunds || []);
        setSummary(data.summary || null);

        if (showRefreshToast) {
          toast.success("Refund requests refreshed.");
        }
      } catch (error) {
        console.error("LOAD ADMIN REFUNDS ERROR:", error);

        toast.error(
          error?.response?.data?.error ||
            error.message ||
            "Failed to load refund requests."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [getToken]
  );

  useEffect(() => {
    fetchRefunds();
  }, [fetchRefunds]);

  const calculatedSummary = useMemo(() => {
    if (summary) return summary;

    return {
      total: refunds.length,
      pendingSellerReview: refunds.filter(
        (refund) => refund.status === "REQUESTED"
      ).length,
      pendingAdminReview: refunds.filter(
        (refund) =>
          refund.status === "UNDER_ADMIN_REVIEW" ||
          refund.status === "SELLER_REVIEWED"
      ).length,
      approved: refunds.filter(
        (refund) => refund.status === "APPROVED"
      ).length,
      rejected: refunds.filter(
        (refund) => refund.status === "REJECTED"
      ).length,
      processing: refunds.filter(
        (refund) => refund.status === "PROCESSING"
      ).length,
      refunded: refunds.filter(
        (refund) => refund.status === "REFUNDED"
      ).length,
      totalRequestedAmount: refunds.reduce(
        (total, refund) => total + Number(refund.amount || 0),
        0
      ),
      totalRefundedAmount: refunds
        .filter((refund) => refund.status === "REFUNDED")
        .reduce(
          (total, refund) => total + Number(refund.amount || 0),
          0
        ),
    };
  }, [refunds, summary]);

  const getFilterCount = (value) => {
    if (value === "ALL") {
      return refunds.length;
    }

    if (value === "UNDER_ADMIN_REVIEW") {
      return refunds.filter(
        (refund) =>
          refund.status === "UNDER_ADMIN_REVIEW" ||
          refund.status === "SELLER_REVIEWED"
      ).length;
    }

    return refunds.filter((refund) => refund.status === value)
      .length;
  };

  const filteredRefunds = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return refunds.filter((refund) => {
      const matchesStatus =
        activeFilter === "ALL" ||
        refund.status === activeFilter ||
        (activeFilter === "UNDER_ADMIN_REVIEW" &&
          refund.status === "SELLER_REVIEWED");

      const refundPaymentMethod =
        refund.paymentMethod ||
        refund.payment?.paymentMethod ||
        refund.order?.paymentMethod;

      const matchesPayment =
        paymentFilter === "ALL" ||
        refundPaymentMethod === paymentFilter;

      if (!matchesStatus || !matchesPayment) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const searchableValues = [
        refund.id,
        refund.product?.name,
        refund.user?.name,
        refund.user?.email,
        refund.store?.name,
        refund.store?.user?.name,
        refund.store?.user?.email,
        refund.order?.trackingNumber,
        refund.order?.id,
        refund.payment?.providerReference,
        refund.reason,
        refund.details,
        refund.sellerNote,
        refund.adminNote,
        refund.status,
        refund.sellerDecision,
        refundPaymentMethod,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableValues.includes(normalizedQuery);
    });
  }, [refunds, activeFilter, paymentFilter, searchQuery]);

  const handleSearch = (event) => {
    event.preventDefault();
    setSearchQuery(searchInput);
  };

  const resetFilters = () => {
    setActiveFilter("ALL");
    setPaymentFilter("ALL");
    setSearchInput("");
    setSearchQuery("");
  };

  const openDecisionModal = (refund, decision) => {
    setDecisionModal({
      refund,
      decision,
    });

    setAdminNote(refund.adminNote || "");
  };

  const closeDecisionModal = () => {
    if (submitting) return;

    setDecisionModal(null);
    setAdminNote("");
  };

const submitDecision = async () => {
  if (!decisionModal?.refund?.id) return;

  if (
    decisionModal.decision === "REJECT" &&
    !adminNote.trim()
  ) {
    toast.error(
      "Please provide a reason for rejecting the refund."
    );
    return;
  }

  try {
    setSubmitting(true);

    const token = await getToken();

    const { data } = await axios.patch(
      "/api/admin/refunds",
      {
        refundId: decisionModal.refund.id,
        decision: decisionModal.decision,
        adminNote: adminNote.trim(),
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setRefunds((currentRefunds) =>
      currentRefunds.map((refund) =>
        refund.id === data.refund.id
          ? data.refund
          : refund
      )
    );

    if (selectedRefund?.id === data.refund.id) {
      setSelectedRefund(data.refund);
    }

    toast.success(
      data.message ||
        "Refund decision saved successfully."
    );

    setDecisionModal(null);
    setAdminNote("");

    await fetchRefunds();
  } catch (error) {
    console.error(
      "ADMIN REFUND DECISION ERROR:",
      error
    );

    toast.error(
      error?.response?.data?.error ||
        error.message ||
        "Failed to process the refund decision."
    );
  } finally {
    setSubmitting(false);
  }
};

const processPaystackRefund = async (refund) => {
  if (!refund?.id) return;

  try {
    setSubmitting(true);

    const token = await getToken();

    const { data } = await axios.post(
      "/api/admin/refunds/process",
      {
        refundId: refund.id,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    toast.success(
      data.message ||
        "Refund submitted to Paystack successfully."
    );

    if (data.refund) {
      setRefunds((currentRefunds) =>
        currentRefunds.map((currentRefund) =>
          currentRefund.id === data.refund.id
            ? data.refund
            : currentRefund
        )
      );

      if (selectedRefund?.id === data.refund.id) {
        setSelectedRefund(data.refund);
      }
    }

    await fetchRefunds();
  } catch (error) {
    console.error(
      "PROCESS PAYSTACK REFUND ERROR:",
      error
    );

    toast.error(
      error?.response?.data?.error ||
        error.message ||
        "Failed to submit the refund to Paystack."
    );
  } finally {
    setSubmitting(false);
  }
};

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <main className="pb-12 text-slate-600">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-5 py-8 sm:px-8 sm:py-10">
            <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-blue-500/15 blur-3xl" />
            <div className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-blue-300">
                  <ShieldCheck size={14} />
                  Marketplace Administration
                </div>

                <h1 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
                  Admin Refund Center
                </h1>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
                  Review customer refund requests, inspect seller
                  recommendations and make the final marketplace
                  decision.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  fetchRefunds({ showRefreshToast: true })
                }
                disabled={refreshing}
                className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60 lg:self-center"
              >
                <RefreshCcw
                  size={17}
                  className={refreshing ? "animate-spin" : ""}
                />

                {refreshing
                  ? "Refreshing..."
                  : "Refresh requests"}
              </button>
            </div>
          </div>

          <div className="grid gap-4 border-b border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 sm:p-6 xl:grid-cols-4">
            <SummaryCard
              title="Total requests"
              value={calculatedSummary.total}
              description="All refund cases"
              icon={FileSearch}
              iconClassName="bg-slate-900 text-white"
            />

            <SummaryCard
              title="Seller review"
              value={calculatedSummary.pendingSellerReview}
              description="Waiting for seller action"
              icon={Clock3}
              iconClassName="bg-amber-100 text-amber-700"
            />

            <SummaryCard
              title="Admin review"
              value={calculatedSummary.pendingAdminReview}
              description="Needs final decision"
              icon={ShieldCheck}
              iconClassName="bg-indigo-100 text-indigo-700"
            />

            <SummaryCard
              title="Refunded"
              value={calculatedSummary.refunded}
              description="Successfully completed"
              icon={BadgeCheck}
              iconClassName="bg-emerald-100 text-emerald-700"
            />

            <SummaryCard
              title="Approved"
              value={calculatedSummary.approved}
              description="Ready for provider processing"
              icon={CheckCircle2}
              iconClassName="bg-blue-100 text-blue-700"
            />

            <SummaryCard
              title="Rejected"
              value={calculatedSummary.rejected}
              description="Final rejected requests"
              icon={XCircle}
              iconClassName="bg-red-100 text-red-700"
            />

            <SummaryCard
              title="Requested value"
              value={formatMoney(
                calculatedSummary.totalRequestedAmount,
                currency
              )}
              description="Total refund amount requested"
              icon={WalletCards}
              iconClassName="bg-violet-100 text-violet-700"
              compact
            />

            <SummaryCard
              title="Refunded value"
              value={formatMoney(
                calculatedSummary.totalRefundedAmount,
                currency
              )}
              description="Money successfully returned"
              icon={CircleDollarSign}
              iconClassName="bg-cyan-100 text-cyan-700"
              compact
            />
          </div>

          <div className="border-b border-slate-200 px-4 py-5 sm:px-6">
            <div className="flex flex-col gap-5">
              <div className="-mx-1 overflow-x-auto pb-1">
                <div className="flex min-w-max items-center gap-6 px-1">
                  {filterTabs.map((tab) => {
                    const active = activeFilter === tab.value;

                    return (
                      <button
                        key={tab.value}
                        type="button"
                        onClick={() =>
                          setActiveFilter(tab.value)
                        }
                        className={`relative whitespace-nowrap pb-3 text-sm font-semibold transition ${
                          active
                            ? "text-slate-950"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        {tab.label}

                        <span
                          className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                            active
                              ? "bg-blue-100 text-blue-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {getFilterCount(tab.value)}
                        </span>

                        {active && (
                          <span className="absolute bottom-0 left-0 h-0.5 w-full bg-blue-600" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-3 lg:flex-row">
                <form
                  onSubmit={handleSearch}
                  className="flex min-w-0 flex-1 overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100"
                >
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(event) =>
                      setSearchInput(event.target.value)
                    }
                    placeholder="Search customer, seller, order, product or payment reference"
                    className="min-w-0 flex-1 px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                  />

                  <button
                    type="submit"
                    className="flex w-14 shrink-0 items-center justify-center bg-slate-950 text-white transition hover:bg-blue-600"
                    aria-label="Search refunds"
                  >
                    <Search size={20} />
                  </button>
                </form>

                <div className="relative lg:w-60">
                  <Filter
                    size={17}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <select
                    value={paymentFilter}
                    onChange={(event) =>
                      setPaymentFilter(event.target.value)
                    }
                    className="w-full appearance-none rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-10 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  >
                    {paymentOptions.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <ChevronRight
                    size={16}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-slate-400"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-3 sm:p-6">
            {filteredRefunds.length > 0 ? (
              <>
                <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white xl:block">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1280px] text-sm">
                      <thead className="border-b border-slate-200 bg-slate-50">
                        <tr className="text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                          <th className="px-5 py-4">Product</th>
                          <th className="px-5 py-4">Customer</th>
                          <th className="px-5 py-4">Seller</th>
                          <th className="px-5 py-4">Payment</th>
                          <th className="px-5 py-4">Amount</th>
                          <th className="px-5 py-4">
                            Seller decision
                          </th>
                          <th className="px-5 py-4">Status</th>
                          <th className="px-5 py-4 text-right">
                            Actions
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-200">
                        {filteredRefunds.map((refund) => (
                          <RefundTableRow
                            key={refund.id}
                            refund={refund}
                            currency={currency}
                            onView={setSelectedRefund}
                            onDecision={openDecisionModal}
                            onProcessRefund={processPaystackRefund}
                            submitting={submitting}
                         />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-4 xl:hidden">
                {filteredRefunds.map((refund) => (
                 <RefundMobileCard
                  key={refund.id}
                  refund={refund}
                  currency={currency}
                  onView={setSelectedRefund}
                  onDecision={openDecisionModal}
                  onProcessRefund={processPaystackRefund}
                  submitting={submitting}
                />
                 ))}
               </div>
              </>
            ) : (
              <EmptyState
                hasFilters={
                  activeFilter !== "ALL" ||
                  paymentFilter !== "ALL" ||
                  Boolean(searchQuery.trim())
                }
                onReset={resetFilters}
              />
            )}
          </div>
        </section>
      </main>

  {selectedRefund && (
    <RefundDetailsDrawer
    refund={selectedRefund}
    currency={currency}
    onClose={() => setSelectedRefund(null)}
    onDecision={openDecisionModal}
    onProcessRefund={processPaystackRefund}
    submitting={submitting}
    />
   )}

      {decisionModal && (
        <DecisionModal
          modal={decisionModal}
          adminNote={adminNote}
          setAdminNote={setAdminNote}
          submitting={submitting}
          currency={currency}
          onClose={closeDecisionModal}
          onSubmit={submitDecision}
        />
      )}
    </>
  );
}

function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
  iconClassName,
  compact = false,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-500">
            {title}
          </p>

          <p
            className={`mt-2 break-words font-bold text-slate-950 ${
              compact ? "text-2xl" : "text-3xl"
            }`}
          >
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {description}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}
        >
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function RefundTableRow({
  refund,
  currency,
  onView,
  onDecision,
  onProcessRefund,
  submitting,
}) {
  const image = getRefundImage(refund);
  const paymentMethod = getPaymentMethod(refund);
  const canDecide = canAdminDecide(refund);

  return (
    <tr className="transition hover:bg-slate-50">
      <td className="px-5 py-5">
        <div className="flex items-center gap-3">
          <ProductImage
            image={image}
            name={refund.product?.name}
          />

          <div className="max-w-[230px] min-w-0">
            <p className="line-clamp-2 font-bold text-slate-900">
              {refund.product?.name || "Product"}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Order:{" "}
              {refund.order?.trackingNumber ||
                refund.orderId}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Qty: {refund.quantity || 1}
            </p>
          </div>
        </div>
      </td>

      <td className="px-5 py-5">
        <p className="font-semibold text-slate-900">
          {refund.user?.name || "Customer"}
        </p>

        <p className="mt-1 max-w-[190px] truncate text-xs text-slate-400">
          {refund.user?.email || "Email unavailable"}
        </p>
      </td>

      <td className="px-5 py-5">
        <p className="font-semibold text-slate-900">
          {refund.store?.name || "Store"}
        </p>

        <p className="mt-1 max-w-[190px] truncate text-xs text-slate-400">
          {refund.store?.user?.email ||
            refund.store?.user?.name ||
            "Seller unavailable"}
        </p>
      </td>

      <td className="px-5 py-5">
        <PaymentBadge method={paymentMethod} />

        <p className="mt-2 max-w-[180px] truncate text-xs text-slate-400">
          {refund.payment?.providerReference ||
            "No provider reference"}
        </p>
      </td>

      <td className="px-5 py-5">
        <p className="font-bold text-slate-900">
          {formatMoney(refund.amount, currency)}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          {refund.order?.isPaid ? "Paid order" : "Not paid"}
        </p>
      </td>

      <td className="px-5 py-5">
        {refund.sellerDecision ? (
          <DecisionBadge
            decision={refund.sellerDecision}
          />
        ) : (
          <span className="text-xs font-semibold text-slate-400">
            No recommendation
          </span>
        )}

        {refund.sellerNote && (
          <p className="mt-2 max-w-[210px] line-clamp-2 text-xs leading-5 text-slate-500">
            {refund.sellerNote}
          </p>
        )}
      </td>

      <td className="px-5 py-5">
        <StatusBadge status={refund.status} />
      </td>

      <td className="px-5 py-5">
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => onView(refund)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Eye size={15} />
            View
          </button>

          {canDecide && (
            <>
              <button
                type="button"
                onClick={() =>
                  onDecision(refund, "APPROVE")
                }
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
              >
                <CheckCircle2 size={15} />
                Approve
              </button>

              <button
                type="button"
                onClick={() =>
                  onDecision(refund, "REJECT")
                }
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
              >
                <XCircle size={15} />
                Reject
              </button>
            </>
          )}
           {refund.status === "APPROVED" &&
             paymentMethod === "PAYSTACK" && (
           <button
             type="button"
             onClick={() => onProcessRefund(refund)}
             disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
           >
      {submitting ? (
        <RefreshCcw size={15} className="animate-spin" />
      ) : (
        <Banknote size={15} />
      )}

      {submitting ? "Processing..." : "Process Paystack"}
    </button>
  )}

        </div>
      </td>
    </tr>
  );
}

function RefundMobileCard({
  refund,
  currency,
  onView,
  onDecision,
  onProcessRefund,
  submitting,
}) {
  const image = getRefundImage(refund);
  const paymentMethod = getPaymentMethod(refund);
  const canDecide = canAdminDecide(refund);

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start gap-3 border-b border-slate-200 p-4">
        <ProductImage
          image={image}
          name={refund.product?.name}
        />

        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 font-bold text-slate-900">
            {refund.product?.name || "Product"}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Order:{" "}
            {refund.order?.trackingNumber ||
              refund.orderId}
          </p>

          <div className="mt-2 flex flex-wrap gap-2">
            <StatusBadge status={refund.status} />
            <PaymentBadge method={paymentMethod} />
          </div>
        </div>
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-2">
        <MobileInformation
          label="Customer"
          value={refund.user?.name || "Customer"}
          subValue={refund.user?.email}
          icon={UserRound}
        />

        <MobileInformation
          label="Seller"
          value={refund.store?.name || "Store"}
          subValue={
            refund.store?.user?.email ||
            refund.store?.user?.name
          }
          icon={Store}
        />

        <MobileInformation
          label="Refund amount"
          value={formatMoney(refund.amount, currency)}
          subValue={`Quantity: ${refund.quantity || 1}`}
          icon={CircleDollarSign}
        />

        <MobileInformation
          label="Payment"
          value={paymentMethod || "Unknown"}
          subValue={
            refund.payment?.providerReference ||
            "No provider reference"
          }
          icon={CreditCard}
        />

        <div className="rounded-xl bg-slate-50 p-3 sm:col-span-2">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Customer reason
          </p>

          <p className="mt-2 font-semibold text-slate-800">
            {refund.reason || "No reason provided"}
          </p>

          {refund.details && (
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
              {refund.details}
            </p>
          )}
        </div>

        <div className="rounded-xl bg-slate-50 p-3 sm:col-span-2">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Seller recommendation
          </p>

          <div className="mt-2">
            {refund.sellerDecision ? (
              <DecisionBadge
                decision={refund.sellerDecision}
              />
            ) : (
              <p className="text-sm font-semibold text-slate-500">
                Seller has not reviewed this request.
              </p>
            )}
          </div>

          {refund.sellerNote && (
            <p className="mt-3 text-sm leading-6 text-slate-500">
              {refund.sellerNote}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-slate-200 bg-slate-50 p-4 sm:flex-row">
        <button
          type="button"
          onClick={() => onView(refund)}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          <Eye size={16} />
          View details
        </button>

        {canDecide && (
          <>
            <button
              type="button"
              onClick={() =>
                onDecision(refund, "APPROVE")
              }
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              <CheckCircle2 size={16} />
              Approve
            </button>

            <button
              type="button"
              onClick={() =>
                onDecision(refund, "REJECT")
              }
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              <XCircle size={16} />
              Reject
            </button>
          </>
        )}

         {refund.status === "APPROVED" &&
  paymentMethod === "PAYSTACK" && (
    <button
      type="button"
      onClick={() => onProcessRefund(refund)}
      disabled={submitting}
      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {submitting ? (
        <RefreshCcw size={16} className="animate-spin" />
      ) : (
        <Banknote size={16} />
      )}

      {submitting
        ? "Processing..."
        : "Process Paystack"}
    </button>
  )}

      </div>
    </article>
  );
}

function RefundDetailsDrawer({
  refund,
  currency,
  onClose,
  onDecision,
  onProcessRefund,
  submitting,
}) {
  const image = getRefundImage(refund);
  const paymentMethod = getPaymentMethod(refund);
  const canDecide = canAdminDecide(refund);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default"
        aria-label="Close refund details"
      />

      <aside className="absolute right-0 top-0 z-10 h-full w-full max-w-3xl overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur sm:px-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              Refund investigation
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-950">
              Complete request details
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6 p-5 sm:p-7">
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center">
            <ProductImage
              image={image}
              name={refund.product?.name}
              large
            />

            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-bold text-slate-950">
                {refund.product?.name || "Product"}
              </h3>

              {refund.orderItem?.variantName &&
                refund.orderItem?.variantValue && (
                  <p className="mt-2 text-sm text-slate-500">
                    {refund.orderItem.variantName}:{" "}
                    <span className="font-semibold text-slate-800">
                      {refund.orderItem.variantValue}
                    </span>
                  </p>
                )}

              <div className="mt-3 flex flex-wrap gap-2">
                <StatusBadge status={refund.status} />
                <PaymentBadge method={paymentMethod} />

                {refund.sellerDecision && (
                  <DecisionBadge
                    decision={refund.sellerDecision}
                  />
                )}
              </div>
            </div>

            <div className="sm:text-right">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Requested refund
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-950">
                {formatMoney(refund.amount, currency)}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Quantity: {refund.quantity || 1}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <DetailSection
              title="Customer information"
              icon={UserRound}
            >
              <DetailRow
                label="Name"
                value={refund.user?.name}
              />
              <DetailRow
                label="Email"
                value={refund.user?.email}
              />
              <DetailRow
                label="Recipient"
                value={refund.order?.address?.name}
              />
              <DetailRow
                label="Phone"
                value={refund.order?.address?.phone}
              />
            </DetailSection>

            <DetailSection title="Seller information" icon={Store}>
              <DetailRow
                label="Store"
                value={refund.store?.name}
              />
              <DetailRow
                label="Seller"
                value={refund.store?.user?.name}
              />
              <DetailRow
                label="Email"
                value={refund.store?.user?.email}
              />
              <DetailRow
                label="Store status"
                value={refund.store?.status}
              />
            </DetailSection>

            <DetailSection
              title="Order information"
              icon={Package}
            >
              <DetailRow
                label="Tracking number"
                value={
                  refund.order?.trackingNumber ||
                  refund.orderId
                }
              />
              <DetailRow
                label="Order status"
                value={formatEnum(refund.order?.status)}
              />
              <DetailRow
                label="Order total"
                value={formatMoney(
                  refund.order?.total,
                  currency
                )}
              />
              <DetailRow
                label="Order date"
                value={formatDate(refund.order?.createdAt)}
              />
            </DetailSection>

            <DetailSection
              title="Payment information"
              icon={CreditCard}
            >
              <DetailRow
                label="Payment method"
                value={paymentMethod}
              />
              <DetailRow
                label="Payment status"
                value={
                  refund.order?.isPaid ? "Paid" : "Not paid"
                }
              />
              <DetailRow
                label="Provider"
                value={refund.payment?.provider}
              />
              <DetailRow
                label="Provider reference"
                value={refund.payment?.providerReference}
              />
              <DetailRow
                label="Transaction amount"
                value={formatMoney(
                  refund.payment?.amount,
                  currency
                )}
              />
            </DetailSection>
          </div>

          <DetailSection
            title="Customer refund reason"
            icon={FileSearch}
          >
            <p className="font-semibold text-slate-900">
              {refund.reason || "No reason provided"}
            </p>

            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-500">
              {refund.details ||
                "The customer did not provide additional details."}
            </p>
          </DetailSection>

          <DetailSection
            title="Seller assessment"
            icon={Store}
          >
            {refund.sellerDecision ? (
              <DecisionBadge
                decision={refund.sellerDecision}
              />
            ) : (
              <p className="text-sm font-semibold text-amber-700">
                The seller has not reviewed this request.
              </p>
            )}

            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-500">
              {refund.sellerNote ||
                "No seller note was provided."}
            </p>

            {refund.sellerReviewedAt && (
              <p className="mt-3 text-xs text-slate-400">
                Seller reviewed:{" "}
                {formatDate(refund.sellerReviewedAt)}
              </p>
            )}
          </DetailSection>

          {refund.adminNote && (
            <DetailSection
              title="Administrator note"
              icon={ShieldCheck}
            >
              <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
                {refund.adminNote}
              </p>

              {refund.adminReviewedAt && (
                <p className="mt-3 text-xs text-slate-400">
                  Admin reviewed:{" "}
                  {formatDate(refund.adminReviewedAt)}
                </p>
              )}
            </DetailSection>
          )}

          <DetailSection
            title="Delivery address"
            icon={Package}
          >
            <p className="text-sm leading-6 text-slate-600">
              {[
                refund.order?.address?.street,
                refund.order?.address?.city,
                refund.order?.address?.state,
                refund.order?.address?.country,
              ]
                .filter(Boolean)
                .join(", ") || "Address unavailable"}
            </p>
          </DetailSection>

          <RefundTimeline refund={refund} />

          {(canDecide ||
  (refund.status === "APPROVED" &&
    paymentMethod === "PAYSTACK")) && (
  <div className="sticky bottom-0 flex flex-col gap-3 border-t border-slate-200 bg-white py-5 sm:flex-row sm:justify-end">
    {canDecide && (
      <>
        <button
          type="button"
          onClick={() =>
            onDecision(refund, "REJECT")
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
        >
          <XCircle size={17} />
          Reject refund
        </button>

        <button
          type="button"
          onClick={() =>
            onDecision(refund, "APPROVE")
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          <CheckCircle2 size={17} />
          Approve refund
        </button>
      </>
    )}

    {refund.status === "APPROVED" &&
      paymentMethod === "PAYSTACK" && (
        <button
          type="button"
          onClick={() => onProcessRefund(refund)}
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? (
            <RefreshCcw
              size={17}
              className="animate-spin"
            />
          ) : (
            <Banknote size={17} />
          )}

          {submitting
            ? "Submitting to Paystack..."
            : "Process Paystack Refund"}
        </button>
      )}
  </div>
)}
        </div>
      </aside>
    </div>
  );
}

function RefundTimeline({ refund }) {
  const events = [
    {
      title: "Refund requested",
      description: "Customer submitted the refund request.",
      date: refund.requestedAt || refund.createdAt,
      complete: true,
    },
    {
      title: "Seller review",
      description: refund.sellerDecision
        ? `Seller recommended ${refund.sellerDecision.toLowerCase()}.`
        : "Waiting for the seller's recommendation.",
      date: refund.sellerReviewedAt,
      complete: Boolean(refund.sellerReviewedAt),
    },
    {
      title: "Administrator decision",
      description: refund.adminReviewedAt
        ? `Administrator marked the request as ${formatEnum(
            refund.status
          )}.`
        : "Waiting for the administrator's final decision.",
      date: refund.adminReviewedAt,
      complete: Boolean(refund.adminReviewedAt),
    },
    {
      title: "Refund completion",
      description:
        refund.status === "REFUNDED"
          ? "The refund was successfully completed."
          : "Payment-provider processing has not been completed.",
      date: refund.refundedAt,
      complete: refund.status === "REFUNDED",
    },
  ];

  return (
    <DetailSection
      title="Refund timeline"
      icon={Clock3}
    >
      <div className="space-y-0">
        {events.map((event, index) => (
          <div
            key={event.title}
            className="relative flex gap-4 pb-6 last:pb-0"
          >
            {index < events.length - 1 && (
              <span className="absolute left-[9px] top-5 h-full w-px bg-slate-200" />
            )}

            <span
              className={`relative z-10 mt-1 h-5 w-5 shrink-0 rounded-full border-4 border-white ${
                event.complete
                  ? "bg-emerald-500"
                  : "bg-slate-300"
              }`}
            />

            <div>
              <p className="font-semibold text-slate-900">
                {event.title}
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                {event.description}
              </p>

              {event.date && (
                <p className="mt-1 text-xs text-slate-400">
                  {formatDate(event.date)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </DetailSection>
  );
}

function DecisionModal({
  modal,
  adminNote,
  setAdminNote,
  submitting,
  currency,
  onClose,
  onSubmit,
}) {
  const { refund, decision } = modal;
  const isApproval = decision === "APPROVE";

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl sm:p-7">
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 disabled:cursor-not-allowed"
          aria-label="Close decision modal"
        >
          <X size={18} />
        </button>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
            isApproval
              ? "bg-emerald-100 text-emerald-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {isApproval ? (
            <CheckCircle2 size={24} />
          ) : (
            <XCircle size={24} />
          )}
        </div>

        <h2 className="mt-4 pr-10 text-xl font-bold text-slate-950">
          {isApproval
            ? "Approve refund request"
            : "Reject refund request"}
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          {isApproval
            ? "This approves the marketplace refund request. The actual payment-provider refund will be connected in the next stage."
            : "This will reject the customer's refund request and notify both the customer and seller."}
        </p>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="font-bold text-slate-950">
            {refund.product?.name || "Product"}
          </p>

          <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
            <DecisionInformation
              label="Order"
              value={
                refund.order?.trackingNumber ||
                refund.orderId
              }
            />

            <DecisionInformation
              label="Amount"
              value={formatMoney(refund.amount, currency)}
            />

            <DecisionInformation
              label="Customer"
              value={refund.user?.name || "Customer"}
            />

            <DecisionInformation
              label="Seller"
              value={refund.store?.name || "Store"}
            />
          </div>

          {refund.sellerDecision && (
            <div className="mt-4 border-t border-slate-200 pt-4">
              <DecisionBadge
                decision={refund.sellerDecision}
              />

              {refund.sellerNote && (
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {refund.sellerNote}
                </p>
              )}
            </div>
          )}
        </div>

        <label className="mt-5 block">
          <span className="text-sm font-semibold text-slate-700">
            Administrator note
          </span>

          <span className="ml-2 text-xs text-slate-400">
            {isApproval ? "Optional" : "Required"}
          </span>

          <textarea
            value={adminNote}
            onChange={(event) =>
              setAdminNote(event.target.value)
            }
            disabled={submitting}
            rows={5}
            maxLength={1500}
            placeholder={
              isApproval
                ? "Add an internal note about the approval..."
                : "Explain why this refund request is being rejected..."
            }
            className="mt-2 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
          />

          <p className="mt-1 text-right text-xs text-slate-400">
            {adminNote.length}/1500
          </p>
        </label>

        {!isApproval && !adminNote.trim() && (
          <div className="mt-3 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
            <AlertTriangle
              size={17}
              className="mt-0.5 shrink-0"
            />

            <p>
              A rejection reason is required before the decision
              can be submitted.
            </p>
          </div>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={
              submitting ||
              (!isApproval && !adminNote.trim())
            }
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
              isApproval
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {submitting ? (
              <>
                <RefreshCcw
                  size={17}
                  className="animate-spin"
                />
                Processing...
              </>
            ) : isApproval ? (
              <>
                <CheckCircle2 size={17} />
                Confirm approval
              </>
            ) : (
              <>
                <XCircle size={17} />
                Confirm rejection
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailSection({
  title,
  icon: Icon,
  children,
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
          <Icon size={16} />
        </div>

        <h3 className="font-bold text-slate-900">
          {title}
        </h3>
      </div>

      <div className="mt-4 space-y-3">
        {children}
      </div>
    </section>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex flex-col gap-1 text-sm sm:flex-row sm:justify-between sm:gap-4">
      <span className="text-slate-400">{label}</span>

      <span className="break-words font-semibold capitalize text-slate-800 sm:max-w-[65%] sm:text-right">
        {value || "Not available"}
      </span>
    </div>
  );
}

function MobileInformation({
  label,
  value,
  subValue,
  icon: Icon,
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
        <Icon size={14} />
        {label}
      </div>

      <p className="mt-2 font-bold text-slate-900">
        {value || "Not available"}
      </p>

      {subValue && (
        <p className="mt-1 break-all text-xs text-slate-400">
          {subValue}
        </p>
      )}
    </div>
  );
}

function DecisionInformation({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words font-bold text-slate-800">
        {value || "Not available"}
      </p>
    </div>
  );
}

function StatusBadge({ status }) {
  const config =
    statusConfig[status] || {
      label: formatEnum(status) || "Unknown",
      className:
        "border-slate-200 bg-slate-100 text-slate-600",
    };

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full border px-3 py-1 text-xs font-bold ${config.className}`}
    >
      {config.label}
    </span>
  );
}

function DecisionBadge({ decision }) {
  const config =
    decisionConfig[decision] || {
      label: formatEnum(decision),
      className:
        "border-slate-200 bg-slate-100 text-slate-600",
    };

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full border px-3 py-1 text-xs font-bold ${config.className}`}
    >
      {config.label}
    </span>
  );
}

function PaymentBadge({ method }) {
  const config =
    paymentConfig[method] || {
      label: method || "Unknown payment",
      className:
        "border-slate-200 bg-slate-100 text-slate-600",
    };

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full border px-3 py-1 text-xs font-bold ${config.className}`}
    >
      {config.label}
    </span>
  );
}

function ProductImage({
  image,
  name,
  large = false,
}) {
  const sizeClass = large
    ? "h-24 w-24"
    : "h-14 w-14";

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white ${sizeClass}`}
    >
      {image ? (
        <Image
          src={image}
          alt={name || "Product"}
          width={large ? 96 : 56}
          height={large ? 96 : 56}
          className="h-full w-full object-contain p-1"
        />
      ) : (
        <Package
          size={large ? 30 : 20}
          className="text-slate-300"
        />
      )}
    </div>
  );
}

function EmptyState({ hasFilters, onReset }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <FileSearch size={25} />
      </div>

      <h2 className="mt-4 text-xl font-bold text-slate-900">
        No refund requests found
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {hasFilters
          ? "No requests match the selected status, payment method or search."
          : "Customer refund requests will appear here."}
      </p>

      {hasFilters && (
        <button
          type="button"
          onClick={onReset}
          className="mt-5 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}

function getRefundImage(refund) {
  return (
    refund.orderItem?.variantImage ||
    refund.orderItem?.variantImages?.[0] ||
    refund.product?.images?.[0] ||
    null
  );
}

function getPaymentMethod(refund) {
  return (
    refund.paymentMethod ||
    refund.payment?.paymentMethod ||
    refund.order?.paymentMethod ||
    null
  );
}

function canAdminDecide(refund) {
  return [
    "REQUESTED",
    "SELLER_REVIEWED",
    "UNDER_ADMIN_REVIEW",
  ].includes(refund.status);
}

function formatMoney(value, currency) {
  return `${currency}${Number(value || 0).toLocaleString(
    "en-US",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;
}

function formatDate(value) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatEnum(value) {
  if (!value) return "";

  return String(value)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}