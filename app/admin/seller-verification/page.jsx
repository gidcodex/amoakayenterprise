"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import toast from "react-hot-toast";
import { BadgeCheck, Building2, CheckCircle2, Clock3, Landmark, LoaderCircle, Mail, Phone, RefreshCw, Search, ShieldCheck, Smartphone, Store, UserRound, WalletCards, XCircle, } from "lucide-react";

const initialSummary = {
  total: 0,
  verified: 0,
  pending: 0,
  incomplete: 0,
};

export default function SellerVerificationPage() {
  const { getToken } = useAuth();

  const [stores, setStores] = useState([]);
  const [summary, setSummary] = useState(initialSummary);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [processingStoreId, setProcessingStoreId] = useState(null);

  const loadVerificationRequests = useCallback(
    async ({ refresh = false } = {}) => {
      try {
        if (refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const token = await getToken();

        const { data } = await axios.get(
          "/api/admin/seller-verification",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setStores(
          Array.isArray(data.stores) ? data.stores : []
        );

        setSummary({
          ...initialSummary,
          ...(data.summary || {}),
        });
      } catch (error) {
        console.error(
          "LOAD SELLER VERIFICATION ERROR:",
          error
        );

        toast.error(
          error?.response?.data?.error ||
            error?.message ||
            "Failed to load seller verification requests."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [getToken]
  );

  useEffect(() => {
    loadVerificationRequests();
  }, [loadVerificationRequests]);

  const getVerificationStatus = (store) => {
    if (store.businessVerified) {
      return "VERIFIED";
    }

    const complete =
      Boolean(store.registeredBusinessName) &&
      Boolean(store.taxIdentificationNumber) &&
      Boolean(store.payoutMethod) &&
      Boolean(store.payoutAccountName) &&
      (store.payoutMethod !== "MOBILE_MONEY" ||
        (Boolean(store.payoutNetwork) &&
          Boolean(store.payoutPhone))) &&
      (store.payoutMethod !== "BANK_ACCOUNT" ||
        (Boolean(store.payoutBankCode) &&
          Boolean(store.payoutAccountNumber)));

    return complete ? "PENDING" : "INCOMPLETE";
  };

  const filteredStores = useMemo(() => {
    const query = search.trim().toLowerCase();

    return stores.filter((store) => {
      const verificationStatus =
        getVerificationStatus(store);

      const matchesStatus =
        statusFilter === "ALL" ||
        verificationStatus === statusFilter;

      const searchableText = [
        store.name,
        store.username,
        store.email,
        store.contact,
        store.registeredBusinessName,
        store.taxIdentificationNumber,
        store.payoutAccountName,
        store.payoutPhone,
        store.user?.name,
        store.user?.email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = query
        ? searchableText.includes(query)
        : true;

      return matchesStatus && matchesSearch;
    });
  }, [stores, search, statusFilter]);

  const handleVerification = async (storeId, action) => {
    if (processingStoreId) return;

    const actionLabel =
      action === "APPROVE" ? "approve" : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionLabel} this seller's business and payout details?`
    );

    if (!confirmed) return;

    try {
      setProcessingStoreId(storeId);

      const token = await getToken();

      const { data } = await axios.patch(
        "/api/admin/seller-verification",
        {
          storeId,
          action,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(data.message);

      await loadVerificationRequests({
        refresh: true,
      });
    } catch (error) {
      console.error(
        "SELLER VERIFICATION ACTION ERROR:",
        error
      );

      toast.error(
        error?.response?.data?.error ||
          error?.message ||
          "Failed to update seller verification."
      );
    } finally {
      setProcessingStoreId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center">
        <div className="text-center">
          <LoaderCircle
            size={44}
            className="mx-auto animate-spin text-green-600"
          />

          <p className="mt-4 font-semibold text-slate-500">
            Loading seller verification requests...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1500px] pb-16">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-emerald-950 px-5 py-7 text-white shadow-xl sm:px-8 sm:py-9">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-200">
              <ShieldCheck size={15} />
              Marketplace compliance
            </span>

            <h1 className="mt-5 text-3xl font-black sm:text-4xl">
              Seller Verification
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Review seller business registration and payout
              information before enabling marketplace payouts.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              loadVerificationRequests({
                refresh: true,
              })
            }
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 self-start rounded-2xl border border-white/15 bg-white/10 px-5 py-3 font-bold text-white backdrop-blur transition hover:bg-white/15 disabled:opacity-60 lg:self-auto"
          >
            <RefreshCw
              size={18}
              className={
                refreshing ? "animate-spin" : ""
              }
            />

            Refresh
          </button>
        </div>
      </section>

      <section className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard
          title="Submitted"
          value={summary.total}
          icon={Building2}
          iconClass="bg-blue-50 text-blue-600"
        />

        <SummaryCard
          title="Pending"
          value={summary.pending}
          icon={Clock3}
          iconClass="bg-amber-50 text-amber-600"
        />

        <SummaryCard
          title="Verified"
          value={summary.verified}
          icon={BadgeCheck}
          iconClass="bg-green-50 text-green-600"
        />

        <SummaryCard
          title="Incomplete"
          value={summary.incomplete}
          icon={XCircle}
          iconClass="bg-red-50 text-red-600"
        />
      </section>

      <section className="mt-7 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search seller, business name, email, TIN or phone..."
              className="w-full rounded-2xl border border-slate-300 py-3 pl-11 pr-4 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            className="rounded-2xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100"
          >
            <option value="ALL">All statuses</option>
            <option value="PENDING">Pending review</option>
            <option value="VERIFIED">Verified</option>
            <option value="INCOMPLETE">Incomplete</option>
          </select>
        </div>
      </section>

      <section className="mt-6">
        {filteredStores.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
            <Building2
              size={42}
              className="mx-auto text-slate-300"
            />

            <h2 className="mt-5 text-xl font-black text-slate-900">
              No seller verification requests
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              No seller currently matches the selected search
              and verification filters.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 xl:grid-cols-2">
            {filteredStores.map((store) => (
              <SellerVerificationCard
                key={store.id}
                store={store}
                status={getVerificationStatus(store)}
                processing={
                  processingStoreId === store.id
                }
                onApprove={() =>
                  handleVerification(
                    store.id,
                    "APPROVE"
                  )
                }
                onReject={() =>
                  handleVerification(
                    store.id,
                    "REJECT"
                  )
                }
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function SummaryCard({
  title,
  value,
  icon: Icon,
  iconClass,
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 sm:text-sm">
            {title}
          </p>

          <p className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">
            {value ?? 0}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${iconClass}`}
        >
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

function SellerVerificationCard({
  store,
  status,
  processing,
  onApprove,
  onReject,
}) {
  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50/60 p-5 sm:p-6">
        <div className="flex items-start gap-4">
          {store.logo ? (
            <img
              src={store.logo}
              alt={store.name || "Seller store"}
              className="h-14 w-14 shrink-0 rounded-2xl border border-slate-200 bg-white object-cover shadow-sm"
            />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white">
              <Store size={24} />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-xl font-black text-slate-900">
                {store.name}
              </h2>

              <StatusBadge status={status} />
            </div>

            <p className="mt-1 truncate text-sm text-slate-500">
              @{store.username}
            </p>

            <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
              <span>
                {store._count?.Product || 0} products
              </span>

              <span>•</span>

              <span>
                {store._count?.Order || 0} orders
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-5 sm:p-6">
        <InfoSection
          title="Seller identity"
          icon={UserRound}
        >
          <InfoRow
            icon={UserRound}
            label="Owner"
            value={store.user?.name || "Not provided"}
          />

          <InfoRow
            icon={Mail}
            label="Email"
            value={
              store.user?.email ||
              store.email ||
              "Not provided"
            }
          />

          <InfoRow
            icon={Phone}
            label="Contact"
            value={store.contact || "Not provided"}
          />
        </InfoSection>

        <InfoSection
          title="Business information"
          icon={Building2}
        >
          <InfoRow
            icon={Building2}
            label="Registered business"
            value={
              store.registeredBusinessName ||
              "Not provided"
            }
          />

          <InfoRow
            icon={BadgeCheck}
            label="TIN"
            value={
              store.taxIdentificationNumber ||
              "Not provided"
            }
          />
        </InfoSection>

        <InfoSection
          title="Payout destination"
          icon={WalletCards}
        >
          <InfoRow
            icon={
              store.payoutMethod === "BANK_ACCOUNT"
                ? Landmark
                : Smartphone
            }
            label="Method"
            value={formatPayoutMethod(
              store.payoutMethod
            )}
          />

          <InfoRow
            icon={UserRound}
            label="Account name"
            value={
              store.payoutAccountName ||
              "Not provided"
            }
          />

          {store.payoutMethod === "MOBILE_MONEY" ? (
            <>
              <InfoRow
                icon={Smartphone}
                label="Network"
                value={formatNetwork(
                  store.payoutNetwork
                )}
              />

              <InfoRow
                icon={Phone}
                label="Wallet number"
                value={
                  store.payoutPhone ||
                  "Not provided"
                }
              />
            </>
          ) : (
            <>
              <InfoRow
                icon={Landmark}
                label="Bank code"
                value={
                  store.payoutBankCode ||
                  "Not provided"
                }
              />

              <InfoRow
                icon={Landmark}
                label="Account number"
                value={
                  store.payoutAccountNumber ||
                  "Not provided"
                }
              />
            </>
          )}
        </InfoSection>

        {status === "INCOMPLETE" && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
            The seller has not submitted all required
            business or payout details.
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row">
          <button
            type="button"
            onClick={onApprove}
            disabled={
              processing ||
              status === "INCOMPLETE" ||
              status === "VERIFIED"
            }
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-green-600 px-5 py-3 font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {processing ? (
              <LoaderCircle
                size={18}
                className="animate-spin"
              />
            ) : (
              <CheckCircle2 size={18} />
            )}

            {status === "VERIFIED"
              ? "Already Verified"
              : "Approve Seller"}
          </button>

          <button
            type="button"
            onClick={onReject}
            disabled={processing}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-5 py-3 font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <XCircle size={18} />
            Reject
          </button>
        </div>
      </div>
    </article>
  );
}

function InfoSection({
  title,
  icon: Icon,
  children,
}) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <Icon size={17} className="text-green-600" />

        <h3 className="font-black text-slate-900">
          {title}
        </h3>
      </div>

      <div className="mt-3 space-y-2">{children}</div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
        <Icon size={16} />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-bold text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    VERIFIED: "bg-green-100 text-green-700",
    PENDING: "bg-amber-100 text-amber-700",
    INCOMPLETE: "bg-red-100 text-red-700",
  };

  const labels = {
    VERIFIED: "Verified",
    PENDING: "Pending review",
    INCOMPLETE: "Incomplete",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
        styles[status] ||
        "bg-slate-100 text-slate-600"
      }`}
    >
      {labels[status] || status}
    </span>
  );
}

function formatPayoutMethod(method) {
  if (method === "MOBILE_MONEY") {
    return "Mobile Money";
  }

  if (method === "BANK_ACCOUNT") {
    return "Bank Account";
  }

  return "Not selected";
}

function formatNetwork(network) {
  const networks = {
    MTN: "MTN Mobile Money",
    TELECEL: "Telecel Cash",
    AIRTELTIGO: "AirtelTigo Money",
  };

  return networks[network] || "Not selected";
}