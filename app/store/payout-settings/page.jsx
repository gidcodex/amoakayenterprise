"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import toast from "react-hot-toast";

import {
  BadgeCheck,
  Banknote,
  Building2,
  CheckCircle2,
  Clock3,
  Landmark,
  LoaderCircle,
  LockKeyhole,
  Save,
  ShieldCheck,
  Smartphone,
  XCircle,
} from "lucide-react";

const initialForm = {
  registeredBusinessName: "",
  taxIdentificationNumber: "",
  payoutMethod: "MOBILE_MONEY",
  payoutAccountName: "",
  payoutPhone: "",
  payoutNetwork: "MTN",
  payoutBankCode: "",
  payoutAccountNumber: "",
};

export default function PayoutSettingsPage() {
  const { getToken } = useAuth();

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [verification, setVerification] = useState({
    businessVerified: false,
    businessVerifiedAt: null,
    paystackRecipientCode: null,
    hasSubmittedDetails: false,
  });

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const loadPayoutSettings = async () => {
    try {
      setLoading(true);

      const token = await getToken();

      const { data } = await axios.get(
        "/api/store/payout-settings",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const settings = data.payoutSettings || {};

      setForm({
        registeredBusinessName:
          settings.registeredBusinessName || "",

        taxIdentificationNumber:
          settings.taxIdentificationNumber || "",

        payoutMethod:
          settings.payoutMethod || "MOBILE_MONEY",

        payoutAccountName:
          settings.payoutAccountName || "",

        payoutPhone:
          settings.payoutPhone || "",

        payoutNetwork:
          settings.payoutNetwork || "MTN",

        payoutBankCode:
          settings.payoutBankCode || "",

        payoutAccountNumber:
          settings.payoutAccountNumber || "",
      });

      setVerification({
        businessVerified:
          Boolean(settings.businessVerified),

        businessVerifiedAt:
          settings.businessVerifiedAt || null,

        paystackRecipientCode:
          settings.paystackRecipientCode || null,

        hasSubmittedDetails: Boolean(
          settings.registeredBusinessName &&
            settings.taxIdentificationNumber
        ),
      });
    } catch (error) {
      console.error(error);

      toast.error(
        error?.response?.data?.error ||
          "Failed to load payout settings."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayoutSettings();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (saving) return;

    try {
      setSaving(true);

      const token = await getToken();

      const { data } = await axios.post(
        "/api/store/payout-settings",
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(data.message);

      await loadPayoutSettings();
    } catch (error) {
      console.error(error);

      toast.error(
        error?.response?.data?.error ||
          error?.message ||
          "Failed to save payout settings."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <LoaderCircle
            size={42}
            className="mx-auto animate-spin text-green-600"
          />

          <p className="mt-4 font-semibold text-slate-500">
            Loading payout settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl pb-16">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-emerald-950 px-5 py-7 text-white shadow-xl sm:px-8 sm:py-9">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" />

        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-emerald-200">
              <Banknote size={15} />
              Seller payments
            </span>

            <h1 className="mt-5 text-3xl font-black sm:text-4xl">
              Payout Settings
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Register your business and preferred payout
              account to receive seller earnings after
              successful delivery.
            </p>
          </div>

          <VerificationBadge verification={verification} />
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        className="mt-7 space-y-7"
      >
        {/* Business details */}
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <SectionHeading
            icon={Building2}
            title="Business verification"
            description="Enter the official business information that the administrator will review."
          />

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <Field
              label="Registered business name"
              required
              value={form.registeredBusinessName}
              onChange={(value) =>
                updateField(
                  "registeredBusinessName",
                  value
                )
              }
              placeholder="Example: Amoakay Enterprise Ghana"
            />

            <Field
              label="Tax Identification Number (TIN)"
              required
              value={form.taxIdentificationNumber}
              onChange={(value) =>
                updateField(
                  "taxIdentificationNumber",
                  value
                )
              }
              placeholder="Enter the registered TIN"
            />
          </div>

          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
            Business and payout information must match the
            seller’s official registration documents. Changing
            verified details will require another administrator
            review.
          </div>
        </section>

        {/* Payout method */}
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <SectionHeading
            icon={Banknote}
            title="Preferred payout method"
            description="Choose where Amoakay Deals should send your approved earnings."
          />

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <PayoutMethodOption
              id="MOBILE_MONEY"
              title="Mobile Money"
              description="Receive payments through MTN, Telecel or AirtelTigo."
              icon={Smartphone}
              checked={
                form.payoutMethod === "MOBILE_MONEY"
              }
              onChange={() =>
                updateField(
                  "payoutMethod",
                  "MOBILE_MONEY"
                )
              }
            />

            <PayoutMethodOption
              id="BANK_ACCOUNT"
              title="Bank Account"
              description="Receive approved earnings in a Ghanaian bank account."
              icon={Landmark}
              checked={
                form.payoutMethod === "BANK_ACCOUNT"
              }
              onChange={() =>
                updateField(
                  "payoutMethod",
                  "BANK_ACCOUNT"
                )
              }
            />
          </div>

          <div className="mt-7">
            {form.payoutMethod === "MOBILE_MONEY" ? (
              <div className="grid gap-5 md:grid-cols-2">
                <SelectField
                  label="Mobile Money network"
                  required
                  value={form.payoutNetwork}
                  onChange={(value) =>
                    updateField(
                      "payoutNetwork",
                      value
                    )
                  }
                  options={[
                    {
                      value: "MTN",
                      label: "MTN Mobile Money",
                    },
                    {
                      value: "TELECEL",
                      label: "Telecel Cash",
                    },
                    {
                      value: "AIRTELTIGO",
                      label: "AirtelTigo Money",
                    },
                  ]}
                />

                <Field
                  label="Mobile Money account name"
                  required
                  value={form.payoutAccountName}
                  onChange={(value) =>
                    updateField(
                      "payoutAccountName",
                      value
                    )
                  }
                  placeholder="Name registered on the wallet"
                />

                <Field
                  label="Mobile Money number"
                  required
                  type="tel"
                  value={form.payoutPhone}
                  onChange={(value) =>
                    updateField(
                      "payoutPhone",
                      value
                    )
                  }
                  placeholder="Example: 0241234567"
                />
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                <Field
                  label="Bank account name"
                  required
                  value={form.payoutAccountName}
                  onChange={(value) =>
                    updateField(
                      "payoutAccountName",
                      value
                    )
                  }
                  placeholder="Name registered on the account"
                />

                <Field
                  label="Bank code"
                  required
                  value={form.payoutBankCode}
                  onChange={(value) =>
                    updateField(
                      "payoutBankCode",
                      value
                    )
                  }
                  placeholder="Paystack bank code"
                />

                <Field
                  label="Bank account number"
                  required
                  value={form.payoutAccountNumber}
                  onChange={(value) =>
                    updateField(
                      "payoutAccountNumber",
                      value
                    )
                  }
                  placeholder="Enter account number"
                />
              </div>
            )}
          </div>
        </section>

        {/* Policy */}
        <section className="rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-5 sm:p-7">
          <SectionHeading
            icon={ShieldCheck}
            title="Amoakay seller payment policy"
            description="How customer payments and seller earnings are handled."
          />

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              "Customer payments are first received by Amoakay Deals.",
              "Seller earnings remain held while the order is being fulfilled.",
              "Payment is released only after delivery requirements are satisfied.",
              "Only administrator-verified businesses qualify for online payouts.",
              "Unverified sellers continue using Cash on Delivery.",
              "Every payout will have a transaction reference and audit record.",
            ].map((policy) => (
              <div
                key={policy}
                className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-white/80 p-4"
              >
                <CheckCircle2
                  size={18}
                  className="mt-0.5 shrink-0 text-green-600"
                />

                <p className="text-sm leading-6 text-slate-700">
                  {policy}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-start gap-3">
            <LockKeyhole
              size={20}
              className="mt-0.5 shrink-0 text-green-600"
            />

            <div>
              <p className="font-bold text-slate-900">
                Secure seller information
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                These details are used only for business
                verification and approved marketplace payouts.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-7 py-3.5 font-bold text-white shadow-lg shadow-green-200 transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
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
              : "Save Payout Settings"}
          </button>
        </div>
      </form>
    </main>
  );
}

function VerificationBadge({ verification }) {
  if (verification.businessVerified) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-green-300/20 bg-green-400/10 px-4 py-3 backdrop-blur">
        <BadgeCheck
          size={23}
          className="text-green-300"
        />

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-green-200">
            Verification status
          </p>

          <p className="mt-1 font-black text-white">
            Verified
          </p>
        </div>
      </div>
    );
  }

  if (verification.hasSubmittedDetails) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-amber-300/20 bg-amber-400/10 px-4 py-3 backdrop-blur">
        <Clock3
          size={23}
          className="text-amber-300"
        />

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-200">
            Verification status
          </p>

          <p className="mt-1 font-black text-white">
            Pending review
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-300/20 bg-white/10 px-4 py-3 backdrop-blur">
      <XCircle
        size={23}
        className="text-slate-300"
      />

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-300">
          Verification status
        </p>

        <p className="mt-1 font-black text-white">
          Not submitted
        </p>
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

function Field({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  type = "text",
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-700">
        {label}
        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </span>

      <input
        type={type}
        value={value}
        required={required}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  required = false,
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-700">
        {label}
        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </span>

      <select
        value={value}
        required={required}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function PayoutMethodOption({
  id,
  title,
  description,
  icon: Icon,
  checked,
  onChange,
}) {
  return (
    <label
      htmlFor={id}
      className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition ${
        checked
          ? "border-green-500 bg-green-50 ring-4 ring-green-100"
          : "border-slate-200 bg-white hover:border-green-300"
      }`}
    >
      <input
        id={id}
        name="payoutMethod"
        type="radio"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 accent-green-600"
      />

      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
          checked
            ? "bg-green-600 text-white"
            : "bg-slate-100 text-slate-600"
        }`}
      >
        <Icon size={20} />
      </div>

      <div>
        <p className="font-black text-slate-900">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {description}
        </p>
      </div>
    </label>
  );
}