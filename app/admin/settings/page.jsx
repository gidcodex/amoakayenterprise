"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Settings,
  Store,
  CreditCard,
  Truck,
  Mail,
  Save,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    marketplaceOpen: true,
    allowSellerApplications: true,
    autoApproveStores: false,
    allowCOD: true,
    allowStripe: true,
    shippingFee: 5,
    plusFreeShipping: true,
    monthlyRevenueGoal: 5000,
    supportEmail: "support@amoakaydeals.com",
    maintenanceMessage:
      "Marketplace is currently under maintenance. Please check back later.",
  });

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();

      if (res.ok) {
        setSettings(data.settings);
      } else {
        toast.error(data.error || "Failed to load settings.");
      }
    } catch (error) {
      toast.error("Something went wrong while loading settings.");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);

    const toastId = toast.loading("Saving settings...");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Settings saved successfully.", {
          id: toastId,
          duration: 5000,
        });

        setSettings(data.settings);
      } else {
        toast.error(data.error || "Failed to save settings.", {
          id: toastId,
          duration: 5000,
        });
      }
    } catch (error) {
      toast.error("Something went wrong while saving settings.", {
        id: toastId,
        duration: 5000,
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  if (loading) {
    return <div className="p-8 text-slate-500">Loading settings...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <p className="text-sm font-semibold text-green-600">
            ADMIN CONTROL CENTER
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2">
            Marketplace Settings
          </h1>
          <p className="text-slate-500 mt-2">
            Control marketplace operations, payments, shipping, seller access,
            and support information.
          </p>
        </div>

        <form onSubmit={saveSettings} className="space-y-6">
          <SettingsSection
            icon={<Settings />}
            title="Marketplace Operations"
            description="Control whether the marketplace is open and how sellers join."
          >
            <ToggleRow
              label="Marketplace Open"
              description="Turn this off when the marketplace is under maintenance."
              checked={settings.marketplaceOpen}
              onChange={(value) => updateField("marketplaceOpen", value)}
            />

            <ToggleRow
              label="Allow Seller Applications"
              description="Allow new sellers to submit store applications."
              checked={settings.allowSellerApplications}
              onChange={(value) =>
                updateField("allowSellerApplications", value)
              }
            />

            <ToggleRow
              label="Auto Approve Stores"
              description="Automatically approve new seller stores without admin review."
              checked={settings.autoApproveStores}
              onChange={(value) => updateField("autoApproveStores", value)}
            />
          </SettingsSection>

          <SettingsSection
            icon={<CreditCard />}
            title="Payments"
            description="Enable or disable supported payment methods."
          >
            <ToggleRow
              label="Allow Cash on Delivery"
              description="Customers can place orders and pay on delivery."
              checked={settings.allowCOD}
              onChange={(value) => updateField("allowCOD", value)}
            />

            <ToggleRow
              label="Allow Stripe Payments"
              description="Customers can pay online using card payments."
              checked={settings.allowStripe}
              onChange={(value) => updateField("allowStripe", value)}
            />
          </SettingsSection>

          <SettingsSection
            icon={<Truck />}
            title="Shipping & Revenue"
            description="Manage shipping cost and business revenue target."
          >
            <InputRow
              label="Shipping Fee"
              type="number"
              value={settings.shippingFee}
              onChange={(value) => updateField("shippingFee", value)}
            />

            <ToggleRow
              label="Plus Members Free Shipping"
              description="Plus members do not pay the standard shipping fee."
              checked={settings.plusFreeShipping}
              onChange={(value) => updateField("plusFreeShipping", value)}
            />

            <InputRow
              label="Monthly Revenue Goal"
              type="number"
              value={settings.monthlyRevenueGoal}
              onChange={(value) => updateField("monthlyRevenueGoal", value)}
            />
          </SettingsSection>

          <SettingsSection
            icon={<Mail />}
            title="Support Information"
            description="Manage the support contact and maintenance message."
          >
            <InputRow
              label="Support Email"
              type="email"
              value={settings.supportEmail}
              onChange={(value) => updateField("supportEmail", value)}
            />

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Maintenance Message
              </label>
              <textarea
                rows={4}
                value={settings.maintenanceMessage}
                onChange={(e) =>
                  updateField("maintenanceMessage", e.target.value)
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-100 transition resize-none"
              />
            </div>
          </SettingsSection>

          <button
            type="submit"
            disabled={saving}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-2xl font-semibold inline-flex items-center gap-2 disabled:opacity-60"
          >
            <Save size={18} />
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </form>
      </div>
    </div>
  );
}

function SettingsSection({ icon, title, description, children }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/60 p-6 md:p-8">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center">
          {icon}
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500 mt-1">{description}</p>
        </div>
      </div>

      <div className="space-y-5">{children}</div>
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-5 border border-slate-100 rounded-2xl p-5 bg-slate-50">
      <div>
        <h3 className="font-semibold text-slate-900">{label}</h3>
        <p className="text-sm text-slate-500 mt-1">{description}</p>
      </div>

      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`w-14 h-8 rounded-full p-1 transition ${
          checked ? "bg-green-600" : "bg-slate-300"
        }`}
      >
        <span
          className={`block w-6 h-6 rounded-full bg-white transition ${
            checked ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

function InputRow({ label, type, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-100 transition"
      />
    </div>
  );
}