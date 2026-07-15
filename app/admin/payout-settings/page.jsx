"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import toast from "react-hot-toast";

import {
  BadgeDollarSign,
  CheckCircle2,
  CircleDollarSign,
  HandCoins,
  LoaderCircle,
  LockKeyhole,
  RefreshCw,
  Save,
  ShieldCheck,
  Store,
  WalletCards,
} from "lucide-react";

const initialForm = {
  sellerInitialReleasePercent: 20,
  sellerFinalReleasePercent: 76,
  marketplaceCommissionPercent: 4,
};

export default function AdminPayoutSettingsPage() {
  const { getToken } = useAuth();

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const totalPercentage = useMemo(() => {
    return Number(
      (
        Number(form.sellerInitialReleasePercent || 0) +
        Number(form.sellerFinalReleasePercent || 0) +
        Number(form.marketplaceCommissionPercent || 0)
      ).toFixed(2)
    );
  }, [form]);

  const percentagesValid = totalPercentage === 100;

  const exampleOrderAmount = 1000;

  const initialAmount =
    (exampleOrderAmount *
      Number(form.sellerInitialReleasePercent || 0)) /
    100;

  const finalAmount =
    (exampleOrderAmount *
      Number(form.sellerFinalReleasePercent || 0)) /
    100;

  const commissionAmount =
    (exampleOrderAmount *
      Number(form.marketplaceCommissionPercent || 0)) /
    100;

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const loadSettings = useCallback(
    async ({ refresh = false } = {}) => {
      try {
        if (refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const token = await getToken();

        const { data } = await axios.get(
          "/api/admin/payout-settings",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setForm({
          sellerInitialReleasePercent:
            Number(
              data.payoutSettings
                ?.sellerInitialReleasePercent
            ) || 0,

          sellerFinalReleasePercent:
            Number(
              data.payoutSettings
                ?.sellerFinalReleasePercent
            ) || 0,

          marketplaceCommissionPercent:
            Number(
              data.payoutSettings
                ?.marketplaceCommissionPercent
            ) || 0,
        });
      } catch (error) {
        console.error(
          "LOAD ADMIN PAYOUT SETTINGS ERROR:",
          error
        );

        toast.error(
          error?.response?.data?.error ||
            error?.message ||
            "Failed to load payout settings."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [getToken]
  );

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (saving) return;

    if (!percentagesValid) {
      toast.error(
        `The payout percentages must total 100%. Current total: ${totalPercentage}%.`
      );
      return;
    }

    try {
      setSaving(true);

      const token = await getToken();

      const { data } = await axios.patch(
        "/api/admin/payout-settings",
        {
          sellerInitialReleasePercent: Number(
            form.sellerInitialReleasePercent
          ),

          sellerFinalReleasePercent: Number(
            form.sellerFinalReleasePercent
          ),

          marketplaceCommissionPercent: Number(
            form.marketplaceCommissionPercent
          ),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(data.message);

      setForm({
        sellerInitialReleasePercent: Number(
          data.payoutSettings
            ?.sellerInitialReleasePercent
        ),

        sellerFinalReleasePercent: Number(
          data.payoutSettings
            ?.sellerFinalReleasePercent
        ),

        marketplaceCommissionPercent: Number(
          data.payoutSettings
            ?.marketplaceCommissionPercent
        ),
      });
    } catch (error) {
      console.error(
        "SAVE ADMIN PAYOUT SETTINGS ERROR:",
        error
      );

      toast.error(
        error?.response?.data?.error ||
          error?.message ||
          "Failed to update payout settings."
      );
    } finally {
      setSaving(false);
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
            Loading marketplace payout settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl pb-16">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-emerald-950 px-5 py-7 text-white shadow-xl sm:px-8 sm:py-9">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-200">
              <WalletCards size={15} />
              Marketplace finance
            </span>

            <h1 className="mt-5 text-3xl font-black sm:text-4xl">
              Seller Payout Allocation
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Configure how every eligible seller order is divided
              between the initial seller release, the final release after
              fulfilment, and Amoakay Deals’ commission.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              loadSettings({
                refresh: true,
              })
            }
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 self-start rounded-2xl border border-white/15 bg-white/10 px-5 py-3 font-bold text-white backdrop-blur transition hover:bg-white/15 disabled:opacity-60 lg:self-auto"
          >
            <RefreshCw
              size={18}
              className={refreshing ? "animate-spin" : ""}
            />

            Refresh
          </button>
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        className="mt-7 space-y-7"
      >
        {/* Allocation cards */}
        <section className="grid gap-5 lg:grid-cols-3">
          <PercentageCard
            icon={HandCoins}
            title="Initial Seller Release"
            description="Released after successful payment and once the order meets the first approved fulfilment condition."
            value={form.sellerInitialReleasePercent}
            onChange={(value) =>
              updateField(
                "sellerInitialReleasePercent",
                value
              )
            }
            iconClass="bg-blue-50 text-blue-600"
          />

          <PercentageCard
            icon={CheckCircle2}
            title="Final Seller Release"
            description="Released after the order is successfully fulfilled according to the marketplace policy."
            value={form.sellerFinalReleasePercent}
            onChange={(value) =>
              updateField(
                "sellerFinalReleasePercent",
                value
              )
            }
            iconClass="bg-green-50 text-green-600"
          />

          <PercentageCard
            icon={BadgeDollarSign}
            title="Marketplace Commission"
            description="The permanent Amoakay Deals commission retained from the seller order amount."
            value={form.marketplaceCommissionPercent}
            onChange={(value) =>
              updateField(
                "marketplaceCommissionPercent",
                value
              )
            }
            iconClass="bg-amber-50 text-amber-600"
          />
        </section>

        {/* Total validation */}
        <section
          className={`rounded-3xl border p-5 sm:p-6 ${
            percentagesValid
              ? "border-green-200 bg-green-50"
              : "border-red-200 bg-red-50"
          }`}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                  percentagesValid
                    ? "bg-green-600 text-white"
                    : "bg-red-600 text-white"
                }`}
              >
                {percentagesValid ? (
                  <CheckCircle2 size={22} />
                ) : (
                  <CircleDollarSign size={22} />
                )}
              </div>

              <div>
                <h2
                  className={`text-xl font-black ${
                    percentagesValid
                      ? "text-green-900"
                      : "text-red-900"
                  }`}
                >
                  Allocation Total: {totalPercentage}%
                </h2>

                <p
                  className={`mt-1 text-sm leading-6 ${
                    percentagesValid
                      ? "text-green-700"
                      : "text-red-700"
                  }`}
                >
                  {percentagesValid
                    ? "The percentages are valid and account for the complete seller order amount."
                    : "The initial release, final release and marketplace commission must total exactly 100%."}
                </p>
              </div>
            </div>

            <span
              className={`inline-flex self-start rounded-full px-4 py-2 text-xs font-black uppercase tracking-wider sm:self-auto ${
                percentagesValid
                  ? "bg-green-600 text-white"
                  : "bg-red-600 text-white"
              }`}
            >
              {percentagesValid
                ? "Ready to save"
                : "Correction required"}
            </span>
          </div>
        </section>

        {/* Example calculation */}
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <SectionHeading
            icon={CircleDollarSign}
            title="Example payout calculation"
            description="This preview shows how a GH₵1,000 eligible seller order would be allocated using the percentages above."
          />

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <PreviewCard
              label="Seller order amount"
              value={exampleOrderAmount}
              tone="slate"
            />

            <PreviewCard
              label="Initial release"
              value={initialAmount}
              tone="blue"
            />

            <PreviewCard
              label="Final release"
              value={finalAmount}
              tone="green"
            />

            <PreviewCard
              label="Amoakay commission"
              value={commissionAmount}
              tone="amber"
            />
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm leading-7 text-slate-600">
              A GH₵1,000 seller order would allocate{" "}
              <strong className="text-blue-700">
                GH₵{initialAmount.toFixed(2)}
              </strong>{" "}
              as the initial release,{" "}
              <strong className="text-green-700">
                GH₵{finalAmount.toFixed(2)}
              </strong>{" "}
              as the final release, and{" "}
              <strong className="text-amber-700">
                GH₵{commissionAmount.toFixed(2)}
              </strong>{" "}
              as Amoakay Deals’ commission.
            </p>
          </div>
        </section>

        {/* Policy notes */}
        <section className="rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-5 sm:p-7">
          <SectionHeading
            icon={ShieldCheck}
            title="Important payout rules"
            description="These controls will be enforced when seller payout records are created."
          />

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {[
              "The seller must be approved for marketplace payouts.",
              "The customer payment must be successfully confirmed.",
              "The initial release cannot exceed the configured percentage.",
              "The final release is available only after the required fulfilment condition.",
              "The marketplace commission is never transferred to the seller.",
              "Existing orders retain the percentages captured when their payout record was created.",
            ].map((rule) => (
              <div
                key={rule}
                className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-white/80 p-4"
              >
                <CheckCircle2
                  size={18}
                  className="mt-0.5 shrink-0 text-green-600"
                />

                <p className="text-sm leading-6 text-slate-700">
                  {rule}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Save area */}
        <section className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-start gap-3">
            <LockKeyhole
              size={20}
              className="mt-0.5 shrink-0 text-green-600"
            />

            <div>
              <p className="font-black text-slate-900">
                Controlled marketplace allocation
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                New seller payout records will use these values once
                they are saved.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving || !percentagesValid}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-7 py-3.5 font-black text-white shadow-lg shadow-green-200 transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <LoaderCircle
                size={19}
                className="animate-spin"
              />
            ) : (
              <Save size={19} />
            )}

            {saving
              ? "Saving..."
              : "Save Payout Allocation"}
          </button>
        </section>
      </form>
    </main>
  );
}

function PercentageCard({
  icon: Icon,
  title,
  description,
  value,
  onChange,
  iconClass,
}) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${iconClass}`}
        >
          <Icon size={22} />
        </div>

        <div className="min-w-0">
          <h2 className="text-lg font-black text-slate-900">
            {title}
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {description}
          </p>
        </div>
      </div>

      <label className="mt-6 block">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Percentage
        </span>

        <div className="relative mt-2">
          <input
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={value}
            onChange={(event) =>
              onChange(event.target.value)
            }
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 pr-12 text-xl font-black text-slate-900 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
          />

          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg font-black text-slate-400">
            %
          </span>
        </div>
      </label>
    </article>
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

function PreviewCard({
  label,
  value,
  tone,
}) {
  const styles = {
    slate: "border-slate-200 bg-slate-50 text-slate-900",
    blue: "border-blue-200 bg-blue-50 text-blue-800",
    green:
      "border-green-200 bg-green-50 text-green-800",
    amber:
      "border-amber-200 bg-amber-50 text-amber-800",
  };

  return (
    <div
      className={`rounded-2xl border p-4 ${styles[tone]}`}
    >
      <p className="text-xs font-bold uppercase tracking-wider opacity-70">
        {label}
      </p>

      <p className="mt-2 text-2xl font-black">
        GH₵{Number(value || 0).toFixed(2)}
      </p>
    </div>
  );
}