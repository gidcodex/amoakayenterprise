"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  CheckCircle2,
  Clock3,
  Eye,
  FileSearch,
  Package,
  RefreshCcw,
  Search,
  ShieldCheck,
  UserRound,
  WalletCards,
  X,
  XCircle,
} from "lucide-react";

import Loading from "@/components/Loading";

const tabs = [
  { label: "All", value: "ALL" },
  { label: "New requests", value: "REQUESTED" },
  { label: "Admin review", value: "UNDER_ADMIN_REVIEW" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Refunded", value: "REFUNDED" },
];

const statusStyles = {
  REQUESTED: "border-amber-200 bg-amber-50 text-amber-700",
  SELLER_REVIEWED: "border-blue-200 bg-blue-50 text-blue-700",
  UNDER_ADMIN_REVIEW: "border-indigo-200 bg-indigo-50 text-indigo-700",
  APPROVED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  REJECTED: "border-red-200 bg-red-50 text-red-700",
  PROCESSING: "border-violet-200 bg-violet-50 text-violet-700",
  REFUNDED: "border-cyan-200 bg-cyan-50 text-cyan-700",
  FAILED: "border-red-200 bg-red-50 text-red-700",
  CANCELLED: "border-slate-200 bg-slate-100 text-slate-600",
};

const statusLabels = {
  REQUESTED: "New request",
  SELLER_REVIEWED: "Seller reviewed",
  UNDER_ADMIN_REVIEW: "Admin review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  PROCESSING: "Processing",
  REFUNDED: "Refunded",
  FAILED: "Failed",
  CANCELLED: "Cancelled",
};

const decisionStyles = {
  APPROVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECT: "bg-red-50 text-red-700 border-red-200",
};

export default function StoreRefundsPage() {
  const { getToken } = useAuth();

  const [refunds, setRefunds] = useState([]);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [activeTab, setActiveTab] = useState("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedRefund, setSelectedRefund] = useState(null);
  const [reviewModal, setReviewModal] = useState(null);
  const [sellerNote, setSellerNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const currency =
    process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "₵";

  const fetchRefunds = async ({ showRefresh = false } = {}) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      }

      const token = await getToken();

      const { data } = await axios.get("/api/store/refunds", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setRefunds(data.refunds || []);
      setStore(data.store || null);
    } catch (error) {
      toast.error(
        error?.response?.data?.error ||
          error.message ||
          "Failed to load refund requests."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, []);

  const stats = useMemo(() => {
    return {
      total: refunds.length,
      requested: refunds.filter(
        (refund) => refund.status === "REQUESTED"
      ).length,
      adminReview: refunds.filter(
        (refund) =>
          refund.status === "UNDER_ADMIN_REVIEW"
      ).length,
      refunded: refunds.filter(
        (refund) => refund.status === "REFUNDED"
      ).length,
    };
  }, [refunds]);

  const getTabCount = (value) => {
    if (value === "ALL") return refunds.length;

    return refunds.filter(
      (refund) => refund.status === value
    ).length;
  };

  const filteredRefunds = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return refunds.filter((refund) => {
      const matchesTab =
        activeTab === "ALL" ||
        refund.status === activeTab;

      if (!matchesTab) return false;
      if (!query) return true;

      const trackingNumber = String(
        refund.order?.trackingNumber ||
          refund.orderId ||
          ""
      ).toLowerCase();

      const productName = String(
        refund.product?.name || ""
      ).toLowerCase();

      const customerName = String(
        refund.user?.name || ""
      ).toLowerCase();

      const customerEmail = String(
        refund.user?.email || ""
      ).toLowerCase();

      const reason = String(
        refund.reason || ""
      ).toLowerCase();

      return (
        trackingNumber.includes(query) ||
        productName.includes(query) ||
        customerName.includes(query) ||
        customerEmail.includes(query) ||
        reason.includes(query)
      );
    });
  }, [refunds, activeTab, searchQuery]);

  const handleSearch = (event) => {
    event.preventDefault();
    setSearchQuery(searchInput);
  };

  const openReviewModal = (refund, decision) => {
    setReviewModal({
      refund,
      decision,
    });

    setSellerNote(refund.sellerNote || "");
  };

  const closeReviewModal = () => {
    if (submitting) return;

    setReviewModal(null);
    setSellerNote("");
  };

  const submitReview = async () => {
    if (!reviewModal) return;

    try {
      setSubmitting(true);

      const token = await getToken();

      const { data } = await axios.patch(
        "/api/store/refunds",
        {
          refundId: reviewModal.refund.id,
          decision: reviewModal.decision,
          sellerNote,
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

      if (
        selectedRefund?.id === data.refund.id
      ) {
        setSelectedRefund(data.refund);
      }

      toast.success(
        data.message ||
          "Refund recommendation submitted."
      );

      closeReviewModal();
    } catch (error) {
      toast.error(
        error?.response?.data?.error ||
          error.message ||
          "Failed to review refund request."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <>
      <main className="pb-12 text-slate-600">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 px-5 py-7 sm:px-8 sm:py-9">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />
            <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl" />

            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
                  <ShieldCheck size={14} />
                  Seller Refund Center
                </div>

                <h1 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
                  Returns, cancellations and refunds
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                  Review customer refund requests and send
                  your recommendation to the marketplace
                  administrator.
                </p>

                {store?.name && (
                  <p className="mt-3 text-sm font-semibold text-emerald-300">
                    Store: {store.name}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() =>
                  fetchRefunds({ showRefresh: true })
                }
                disabled={refreshing}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCcw
                  size={17}
                  className={
                    refreshing ? "animate-spin" : ""
                  }
                />
                {refreshing
                  ? "Refreshing..."
                  : "Refresh requests"}
              </button>
            </div>
          </div>

          <div className="grid gap-4 border-b border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 sm:p-6 xl:grid-cols-4">
            <StatCard
              title="Total requests"
              value={stats.total}
              description="All refund cases"
              icon={FileSearch}
              iconClass="bg-slate-900 text-white"
            />

            <StatCard
              title="Awaiting review"
              value={stats.requested}
              description="Needs seller action"
              icon={Clock3}
              iconClass="bg-amber-100 text-amber-700"
            />

            <StatCard
              title="Admin review"
              value={stats.adminReview}
              description="Sent for final decision"
              icon={ShieldCheck}
              iconClass="bg-indigo-100 text-indigo-700"
            />

            <StatCard
              title="Completed refunds"
              value={stats.refunded}
              description="Refund successfully issued"
              icon={CheckCircle2}
              iconClass="bg-emerald-100 text-emerald-700"
            />
          </div>

          <div className="border-b border-slate-200 px-4 py-5 sm:px-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="-mx-1 overflow-x-auto pb-1">
                <div className="flex min-w-max items-center gap-6 px-1">
                  {tabs.map((tab) => {
                    const active =
                      activeTab === tab.value;

                    return (
                      <button
                        key={tab.value}
                        type="button"
                        onClick={() =>
                          setActiveTab(tab.value)
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
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {getTabCount(tab.value)}
                        </span>

                        {active && (
                          <span className="absolute bottom-0 left-0 h-0.5 w-full bg-emerald-600" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <form
                onSubmit={handleSearch}
                className="flex w-full overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-100 xl:max-w-lg"
              >
                <input
                  type="text"
                  value={searchInput}
                  onChange={(event) =>
                    setSearchInput(event.target.value)
                  }
                  placeholder="Customer, product or order ID"
                  className="min-w-0 flex-1 px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />

                <button
                  type="submit"
                  className="flex w-14 shrink-0 items-center justify-center bg-slate-950 text-white transition hover:bg-emerald-600"
                  aria-label="Search refund requests"
                >
                  <Search size={20} />
                </button>
              </form>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {filteredRefunds.length > 0 ? (
              <>
                <div className="hidden overflow-hidden rounded-2xl border border-slate-200 xl:block">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1180px] text-sm">
                      <thead className="border-b border-slate-200 bg-slate-50">
                        <tr className="text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                          <th className="px-5 py-4">
                            Product
                          </th>
                          <th className="px-5 py-4">
                            Customer
                          </th>
                          <th className="px-5 py-4">
                            Payment
                          </th>
                          <th className="px-5 py-4">
                            Amount
                          </th>
                          <th className="px-5 py-4">
                            Reason
                          </th>
                          <th className="px-5 py-4">
                            Status
                          </th>
                          <th className="px-5 py-4 text-right">
                            Action
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-200">
                        {filteredRefunds.map(
                          (refund) => (
                            <RefundTableRow
                              key={refund.id}
                              refund={refund}
                              currency={currency}
                              onView={setSelectedRefund}
                              onReview={openReviewModal}
                            />
                          )
                        )}
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
                      onReview={openReviewModal}
                    />
                  ))}
                </div>
              </>
            ) : (
              <EmptyState
                hasFilters={
                  activeTab !== "ALL" ||
                  Boolean(searchQuery)
                }
                onReset={() => {
                  setActiveTab("ALL");
                  setSearchInput("");
                  setSearchQuery("");
                }}
              />
            )}
          </div>
        </section>
      </main>

      {selectedRefund && (
        <RefundDetailsModal
          refund={selectedRefund}
          currency={currency}
          onClose={() => setSelectedRefund(null)}
          onReview={openReviewModal}
        />
      )}

      {reviewModal && (
        <ReviewModal
          reviewModal={reviewModal}
          sellerNote={sellerNote}
          setSellerNote={setSellerNote}
          submitting={submitting}
          onClose={closeReviewModal}
          onSubmit={submitReview}
        />
      )}
    </>
  );
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconClass,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {description}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
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
  onReview,
}) {
  const image = getRefundImage(refund);

  return (
    <tr className="transition hover:bg-slate-50">
      <td className="px-5 py-5">
        <div className="flex items-center gap-3">
          <ProductImage
            image={image}
            name={refund.product?.name}
          />

          <div className="min-w-0 max-w-[240px]">
            <p className="line-clamp-2 font-bold text-slate-900">
              {refund.product?.name || "Product"}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Order:{" "}
              {refund.order?.trackingNumber ||
                refund.orderId}
            </p>

            {refund.orderItem?.variantName &&
              refund.orderItem?.variantValue && (
                <p className="mt-1 text-xs text-slate-500">
                  {refund.orderItem.variantName}:{" "}
                  <span className="font-semibold text-slate-700">
                    {refund.orderItem.variantValue}
                  </span>
                </p>
              )}
          </div>
        </div>
      </td>

      <td className="px-5 py-5">
        <p className="font-semibold text-slate-900">
          {refund.user?.name || "Customer"}
        </p>

        <p className="mt-1 max-w-[190px] truncate text-xs text-slate-400">
          {refund.user?.email}
        </p>
      </td>

      <td className="px-5 py-5">
        <PaymentBadge
          method={
            refund.paymentMethod ||
            refund.order?.paymentMethod
          }
        />

        <p className="mt-2 text-xs text-slate-400">
          {refund.order?.isPaid
            ? "Payment confirmed"
            : "Not paid"}
        </p>
      </td>

      <td className="px-5 py-5">
        <p className="font-bold text-slate-900">
          {formatMoney(refund.amount, currency)}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          Qty: {refund.quantity}
        </p>
      </td>

      <td className="px-5 py-5">
        <p className="max-w-[220px] line-clamp-2 font-medium text-slate-700">
          {refund.reason}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          {formatDate(refund.createdAt)}
        </p>
      </td>

      <td className="px-5 py-5">
        <StatusBadge status={refund.status} />

        {refund.sellerDecision && (
          <div className="mt-2">
            <DecisionBadge
              decision={refund.sellerDecision}
            />
          </div>
        )}
      </td>

      <td className="px-5 py-5">
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => onView(refund)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <Eye size={15} />
            View
          </button>

          {refund.status === "REQUESTED" && (
            <>
              <button
                type="button"
                onClick={() =>
                  onReview(refund, "APPROVE")
                }
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
              >
                <CheckCircle2 size={15} />
                Approve
              </button>

              <button
                type="button"
                onClick={() =>
                  onReview(refund, "REJECT")
                }
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
              >
                <XCircle size={15} />
                Reject
              </button>
            </>
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
  onReview,
}) {
  const image = getRefundImage(refund);

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

          <div className="mt-2">
            <StatusBadge status={refund.status} />
          </div>
        </div>
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-2">
        <InfoBox
          label="Customer"
          value={refund.user?.name || "Customer"}
          subValue={refund.user?.email}
          icon={UserRound}
        />

        <InfoBox
          label="Refund amount"
          value={formatMoney(
            refund.amount,
            currency
          )}
          subValue={`Quantity: ${refund.quantity}`}
          icon={WalletCards}
        />

        <div className="rounded-xl bg-slate-50 p-3 sm:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Reason
          </p>

          <p className="mt-1 font-semibold text-slate-800">
            {refund.reason}
          </p>

          {refund.details && (
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {refund.details}
            </p>
          )}
        </div>

        <div className="rounded-xl bg-slate-50 p-3 sm:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Payment
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <PaymentBadge
              method={
                refund.paymentMethod ||
                refund.order?.paymentMethod
              }
            />

            <span className="text-xs text-slate-500">
              {refund.order?.isPaid
                ? "Payment confirmed"
                : "Not paid"}
            </span>
          </div>
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

        {refund.status === "REQUESTED" && (
          <>
            <button
              type="button"
              onClick={() =>
                onReview(refund, "APPROVE")
              }
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              <CheckCircle2 size={16} />
              Approve
            </button>

            <button
              type="button"
              onClick={() =>
                onReview(refund, "REJECT")
              }
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              <XCircle size={16} />
              Reject
            </button>
          </>
        )}
      </div>
    </article>
  );
}

function RefundDetailsModal({
  refund,
  currency,
  onClose,
  onReview,
}) {
  const image = getRefundImage(refund);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">
              Refund request
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-950">
              Request details
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
            aria-label="Close refund details"
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

                {refund.sellerDecision && (
                  <DecisionBadge
                    decision={refund.sellerDecision}
                  />
                )}
              </div>
            </div>

            <div className="sm:text-right">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Refund amount
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-950">
                {formatMoney(
                  refund.amount,
                  currency
                )}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Quantity: {refund.quantity}
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
                label="Phone"
                value={refund.order?.address?.phone}
              />
            </DetailSection>

            <DetailSection
              title="Order information"
              icon={Package}
            >
              <DetailRow
                label="Order number"
                value={
                  refund.order?.trackingNumber ||
                  refund.orderId
                }
              />
              <DetailRow
                label="Order status"
                value={refund.order?.status
                  ?.replaceAll("_", " ")
                  .toLowerCase()}
              />
              <DetailRow
                label="Order date"
                value={formatDate(
                  refund.order?.createdAt
                )}
              />
            </DetailSection>

            <DetailSection
              title="Payment information"
              icon={WalletCards}
            >
              <DetailRow
                label="Payment method"
                value={
                  refund.paymentMethod ||
                  refund.order?.paymentMethod
                }
              />
              <DetailRow
                label="Payment status"
                value={
                  refund.order?.isPaid
                    ? "Paid"
                    : "Not paid"
                }
              />
              <DetailRow
                label="Provider reference"
                value={
                  refund.payment?.providerReference ||
                  "Not available"
                }
              />
            </DetailSection>

            <DetailSection
              title="Delivery information"
              icon={Package}
            >
              <DetailRow
                label="Recipient"
                value={refund.order?.address?.name}
              />
              <DetailRow
                label="Address"
                value={[
                  refund.order?.address?.street,
                  refund.order?.address?.city,
                  refund.order?.address?.state,
                  refund.order?.address?.country,
                ]
                  .filter(Boolean)
                  .join(", ")}
              />
            </DetailSection>
          </div>

          <DetailSection
            title="Customer's reason"
            icon={FileSearch}
          >
            <p className="font-semibold text-slate-900">
              {refund.reason}
            </p>

            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-500">
              {refund.details ||
                "No additional details were provided."}
            </p>
          </DetailSection>

          {refund.sellerNote && (
            <DetailSection
              title="Seller note"
              icon={ShieldCheck}
            >
              <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
                {refund.sellerNote}
              </p>
            </DetailSection>
          )}

          {refund.status === "REQUESTED" && (
            <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  onReview(refund, "REJECT")
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
              >
                <XCircle size={17} />
                Recommend rejection
              </button>

              <button
                type="button"
                onClick={() =>
                  onReview(refund, "APPROVE")
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                <CheckCircle2 size={17} />
                Recommend approval
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewModal({
  reviewModal,
  sellerNote,
  setSellerNote,
  submitting,
  onClose,
  onSubmit,
}) {
  const isApproval =
    reviewModal.decision === "APPROVE";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-5 shadow-2xl sm:p-7">
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 disabled:cursor-not-allowed"
          aria-label="Close seller review"
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
            ? "Recommend approval"
            : "Recommend rejection"}
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          {isApproval
            ? "Your recommendation will be forwarded to the marketplace administrator for the final refund decision."
            : "Explain why you recommend rejecting this request. The administrator will still make the final decision."}
        </p>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="font-semibold text-slate-900">
            {reviewModal.refund.product?.name ||
              "Product"}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Order:{" "}
            {reviewModal.refund.order
              ?.trackingNumber ||
              reviewModal.refund.orderId}
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Customer reason:{" "}
            <span className="font-semibold text-slate-800">
              {reviewModal.refund.reason}
            </span>
          </p>
        </div>

        <label className="mt-5 block text-sm font-semibold text-slate-700">
          Seller note
        </label>

        <textarea
          value={sellerNote}
          onChange={(event) =>
            setSellerNote(event.target.value)
          }
          disabled={submitting}
          rows={5}
          placeholder={
            isApproval
              ? "Add information that may help the administrator approve this request..."
              : "Explain why you recommend rejecting this request..."
          }
          className="mt-2 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100"
        />

        {!isApproval && !sellerNote.trim() && (
          <p className="mt-2 text-xs text-amber-600">
            A clear note is strongly recommended when
            rejecting a request.
          </p>
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
            disabled={submitting}
            className={`rounded-xl px-5 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
              isApproval
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {submitting
              ? "Submitting..."
              : isApproval
                ? "Submit approval recommendation"
                : "Submit rejection recommendation"}
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ hasFilters, onReset }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
        <FileSearch size={25} />
      </div>

      <h2 className="mt-4 text-xl font-bold text-slate-900">
        No refund requests found
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {hasFilters
          ? "No refund requests match the selected filter or search."
          : "Customer cancellation and refund requests will appear here."}
      </p>

      {hasFilters && (
        <button
          type="button"
          onClick={onReset}
          className="mt-5 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
        >
          Show all requests
        </button>
      )}
    </div>
  );
}

function InfoBox({
  label,
  value,
  subValue,
  icon: Icon,
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
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

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full border px-3 py-1 text-xs font-bold ${
        statusStyles[status] ||
        "border-slate-200 bg-slate-100 text-slate-600"
      }`}
    >
      {statusLabels[status] ||
        status?.replaceAll("_", " ").toLowerCase() ||
        "Unknown"}
    </span>
  );
}

function DecisionBadge({ decision }) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full border px-3 py-1 text-xs font-bold ${
        decisionStyles[decision] ||
        "border-slate-200 bg-slate-100 text-slate-600"
      }`}
    >
      Seller:{" "}
      {decision === "APPROVE"
        ? "Approve"
        : "Reject"}
    </span>
  );
}

function PaymentBadge({ method }) {
  const styles = {
    PAYSTACK:
      "border-blue-200 bg-blue-50 text-blue-700",
    STRIPE:
      "border-violet-200 bg-violet-50 text-violet-700",
    COD:
      "border-amber-200 bg-amber-50 text-amber-700",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${
        styles[method] ||
        "border-slate-200 bg-slate-100 text-slate-600"
      }`}
    >
      {method === "COD"
        ? "Cash on delivery"
        : method || "Unknown"}
    </span>
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

function formatMoney(value, currency) {
  return `${currency}${Number(
    value || 0
  ).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value) {
  if (!value) return "Not available";

  return new Date(value).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}