"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Clock3,
  Landmark,
  LoaderCircle,
  Mail,
  Package,
  Phone,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Store,
  UserRound,
  WalletCards,
  XCircle,
} from "lucide-react";

export default function SellerVerificationDetailsPage() {
  const { getToken } = useAuth();
  const params = useParams();
  const router = useRouter();

  const storeId = params?.storeId;

  const [store, setStore] = useState(null);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [creatingRecipient, setCreatingRecipient] =
    useState(false);

  const loadSeller = useCallback(
    async ({ refresh = false } = {}) => {
      if (!storeId) return;

      try {
        if (refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const token = await getToken();

        const { data } = await axios.get(
          `/api/admin/seller-verification/${storeId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setStore(data.store || null);
        setSummary(data.summary || {});
      } catch (error) {
        console.error(
          "LOAD SELLER VERIFICATION DETAILS ERROR:",
          error
        );

        toast.error(
          error?.response?.data?.error ||
            error?.message ||
            "Failed to load seller details."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [getToken, storeId]
  );

  useEffect(() => {
    loadSeller();
  }, [loadSeller]);

  const handleVerification = async (action) => {
    if (!store || processing) return;

    const actionName =
      action === "APPROVE" ? "approve" : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionName} this seller's business and payout information?`
    );

    if (!confirmed) return;

    try {
      setProcessing(true);

      const token = await getToken();

      const { data } = await axios.patch(
        "/api/admin/seller-verification",
        {
          storeId: store.id,
          action,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(data.message);

      await loadSeller({
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
      setProcessing(false);
    }
  };

  const handleCreateRecipient = async () => {
    if (!store || creatingRecipient) return;

    if (!store.businessVerified) {
      toast.error(
        "Approve the seller before creating a Paystack recipient."
      );
      return;
    }

    try {
      setCreatingRecipient(true);

      const token = await getToken();

      const { data } = await axios.post(
        "/api/admin/seller-verification/create-recipient",
        {
          storeId: store.id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(data.message);

      await loadSeller({
        refresh: true,
      });
    } catch (error) {
      console.error(
        "CREATE PAYSTACK RECIPIENT ERROR:",
        error
      );

      toast.error(
        error?.response?.data?.error ||
          error?.message ||
          "Failed to create Paystack recipient."
      );
    } finally {
      setCreatingRecipient(false);
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
            Loading seller verification details...
          </p>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center px-4">
        <div className="max-w-md text-center">
          <XCircle
            size={48}
            className="mx-auto text-red-400"
          />

          <h1 className="mt-5 text-2xl font-black text-slate-900">
            Seller not found
          </h1>

          <p className="mt-2 text-slate-500">
            This seller may have been removed or the notification
            contains an invalid store ID.
          </p>

          <button
            type="button"
            onClick={() =>
              router.push("/admin/seller-verification")
            }
            className="mt-6 rounded-2xl bg-slate-900 px-6 py-3 font-bold text-white"
          >
            Return to Seller Verification
          </button>
        </div>
      </div>
    );
  }

  const orders = Array.isArray(store.Order)
    ? store.Order
    : Array.isArray(store.orders)
    ? store.orders
    : [];

  const payouts = Array.isArray(store.payouts)
    ? store.payouts
    : [];

  return (
    <main className="mx-auto w-full max-w-[1500px] space-y-7 pb-16">
      {/* Navigation */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() =>
            router.push("/admin/seller-verification")
          }
          className="inline-flex self-start items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <ArrowLeft size={18} />
          Back to Sellers
        </button>

        <button
          type="button"
          onClick={() =>
            loadSeller({
              refresh: true,
            })
          }
          disabled={refreshing}
          className="inline-flex self-start items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 font-bold text-slate-700 shadow-sm transition hover:border-green-300 hover:bg-green-50 hover:text-green-700 disabled:opacity-50"
        >
          <RefreshCw
            size={18}
            className={refreshing ? "animate-spin" : ""}
          />

          Refresh
        </button>
      </div>

      {/* Premium heading */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-emerald-950 px-5 py-7 text-white shadow-xl sm:px-8 sm:py-9">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            {store.logo ? (
              <img
                src={store.logo}
                alt={store.name}
                className="h-16 w-16 shrink-0 rounded-2xl border border-white/15 bg-white object-cover shadow-lg sm:h-20 sm:w-20"
              />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white sm:h-20 sm:w-20">
                <Store size={30} />
              </div>
            )}

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                  <ShieldCheck size={13} />
                  Seller verification
                </span>

                <VerificationBadge
                  verified={store.businessVerified}
                />
              </div>

              <h1 className="mt-4 break-words text-3xl font-black sm:text-4xl">
                {store.name}
              </h1>

              <p className="mt-2 text-sm text-slate-300">
                @{store.username}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.08] px-5 py-4 backdrop-blur">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Recipient status
            </p>

            <p className="mt-2 break-all font-black text-white">
              {store.paystackRecipientCode
                ? store.paystackRecipientCode
                : "Not created"}
            </p>
          </div>
        </div>
      </section>

      {/* Summary */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <SummaryCard
          title="Products"
          value={
            summary.totalProducts ??
            summary.products ??
            0
          }
          icon={Package}
        />

        <SummaryCard
          title="Recent Orders"
          value={
            summary.totalOrders ??
            summary.recentOrders ??
            orders.length
          }
          icon={Store}
        />

        <SummaryCard
          title="Delivered"
          value={summary.deliveredOrders || 0}
          icon={CheckCircle2}
        />

        <SummaryCard
          title="Payout Records"
          value={
            summary.payoutRecords ??
            payouts.length
          }
          icon={WalletCards}
        />

        <SummaryCard
          title="Revenue"
          value={`₵${Number(
            summary.totalRevenue || 0
          ).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          icon={Landmark}
          wide
        />
      </section>

      <div className="grid gap-7 xl:grid-cols-2">
        {/* Business information */}
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <SectionHeading
            icon={Building2}
            title="Business Information"
            description="Official seller and business registration details."
          />

          <div className="mt-6 space-y-3">
            <InfoRow
              icon={Building2}
              label="Registered business name"
              value={
                store.registeredBusinessName ||
                "Not provided"
              }
            />

            <InfoRow
              icon={BadgeCheck}
              label="Tax Identification Number"
              value={
                store.taxIdentificationNumber ||
                "Not provided"
              }
            />

            <InfoRow
              icon={Store}
              label="Store name"
              value={store.name}
            />

            <InfoRow
              icon={UserRound}
              label="Owner"
              value={
                store.user?.name || "Not provided"
              }
            />

            <InfoRow
              icon={Mail}
              label="Owner email"
              value={
                store.user?.email ||
                store.email ||
                "Not provided"
              }
            />

            <InfoRow
              icon={Phone}
              label="Store contact"
              value={store.contact || "Not provided"}
            />
          </div>
        </section>

        {/* Payout information */}
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <SectionHeading
            icon={WalletCards}
            title="Payout Information"
            description="Destination used for approved seller transfers."
          />

          <div className="mt-6 space-y-3">
            <InfoRow
              icon={
                store.payoutMethod === "BANK_ACCOUNT"
                  ? Landmark
                  : Smartphone
              }
              label="Payout method"
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

            {store.payoutMethod ===
            "BANK_ACCOUNT" ? (
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
            ) : (
              <>
                <InfoRow
                  icon={Smartphone}
                  label="Mobile Money network"
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
            )}

            <InfoRow
              icon={BadgeCheck}
              label="Paystack recipient"
              value={
                store.paystackRecipientCode ||
                "Not created"
              }
            />
          </div>

          <button
            type="button"
            onClick={handleCreateRecipient}
            disabled={
              creatingRecipient ||
              !store.businessVerified ||
              Boolean(store.paystackRecipientCode)
            }
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3.5 font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {creatingRecipient ? (
              <LoaderCircle
                size={19}
                className="animate-spin"
              />
            ) : (
              <WalletCards size={19} />
            )}

            {store.paystackRecipientCode
              ? "Recipient Already Created"
              : "Create Paystack Recipient"}
          </button>
        </section>
      </div>

      {/* Verification actions */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <SectionHeading
          icon={ShieldCheck}
          title="Verification Actions"
          description="Approve or reject the seller’s business and payout application."
        />

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() =>
              handleVerification("APPROVE")
            }
            disabled={
              processing || store.businessVerified
            }
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-green-600 px-6 py-3.5 font-black text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {processing ? (
              <LoaderCircle
                size={19}
                className="animate-spin"
              />
            ) : (
              <CheckCircle2 size={19} />
            )}

            {store.businessVerified
              ? "Seller Verified"
              : "Approve Seller"}
          </button>

          <button
            type="button"
            onClick={() =>
              handleVerification("REJECT")
            }
            disabled={processing}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-6 py-3.5 font-black text-red-700 transition hover:bg-red-100 disabled:opacity-50"
          >
            <XCircle size={19} />
            Reject Seller
          </button>
        </div>
      </section>

      {/* Recent orders */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <SectionHeading
          icon={Package}
          title="Recent Orders"
          description="Latest orders belonging to this seller."
        />

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-[760px] w-full">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="px-3 py-3">
                  Tracking
                </th>
                <th className="px-3 py-3">
                  Amount
                </th>
                <th className="px-3 py-3">
                  Payment
                </th>
                <th className="px-3 py-3">
                  Order Status
                </th>
                <th className="px-3 py-3">
                  Paid
                </th>
              </tr>
            </thead>

            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-10 text-center text-slate-500"
                  >
                    No recent orders found.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-slate-100"
                  >
                    <td className="px-3 py-4 font-bold text-slate-800">
                      {order.trackingNumber || "-"}
                    </td>

                    <td className="px-3 py-4 font-semibold">
                      ₵
                      {Number(
                        order.total || 0
                      ).toFixed(2)}
                    </td>

                    <td className="px-3 py-4">
                      {order.paymentMethod}
                    </td>

                    <td className="px-3 py-4">
                      <OrderStatusBadge
                        status={order.status}
                      />
                    </td>

                    <td className="px-3 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          order.isPaid
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {order.isPaid ? "Yes" : "No"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function VerificationBadge({ verified }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${
        verified
          ? "bg-green-400/15 text-green-200"
          : "bg-amber-400/15 text-amber-200"
      }`}
    >
      {verified ? (
        <BadgeCheck size={13} />
      ) : (
        <Clock3 size={13} />
      )}

      {verified ? "Verified" : "Pending review"}
    </span>
  );
}

function SummaryCard({
  title,
  value,
  icon: Icon,
  wide = false,
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ${
        wide ? "col-span-2 lg:col-span-1" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {title}
          </p>

          <p className="mt-2 break-words text-2xl font-black text-slate-900">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
}

function SectionHeading({
  icon: Icon,
  title,
  description,
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-green-600">
        <Icon size={22} />
      </div>

      <div>
        <h2 className="text-xl font-black text-slate-900">
          {title}
        </h2>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
        <Icon size={17} />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>

        <p className="mt-1 break-words font-bold text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
}

function OrderStatusBadge({ status }) {
  const styles = {
    ORDER_PLACED: "bg-blue-100 text-blue-700",
    PROCESSING: "bg-amber-100 text-amber-700",
    SHIPPED: "bg-purple-100 text-purple-700",
    DELIVERED: "bg-green-100 text-green-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold ${
        styles[status] ||
        "bg-slate-100 text-slate-600"
      }`}
    >
      {String(status || "UNKNOWN").replaceAll(
        "_",
        " "
      )}
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