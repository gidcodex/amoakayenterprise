"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Power } from "lucide-react";

export default function MarketplaceStatusSwitch() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();

      if (res.ok) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMarketplace = async () => {
    if (!settings) return;

    setSaving(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...settings,
          marketplaceOpen: !settings.marketplaceOpen,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSettings(data.settings);
        toast.success(
          data.settings.marketplaceOpen
            ? "Marketplace is now live."
            : "Marketplace is now in maintenance mode."
        );
      } else {
        toast.error(data.error || "Failed to update marketplace status.");
      }
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  if (loading || !settings) return null;

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/50 p-6 mt-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
        <div className="flex items-center gap-4">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
              settings.marketplaceOpen
                ? "bg-green-100 text-green-600"
                : "bg-red-100 text-red-600"
            }`}
          >
            <Power size={26} />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Marketplace Status
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {settings.marketplaceOpen
                ? "Your marketplace is live and customers can shop."
                : "Maintenance mode is active. Customers cannot shop now."}
            </p>
          </div>
        </div>

        <button
          onClick={toggleMarketplace}
          disabled={saving}
          className={`px-6 py-3 rounded-2xl font-semibold text-white transition disabled:opacity-60 ${
            settings.marketplaceOpen
              ? "bg-red-600 hover:bg-red-700"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {saving
            ? "Updating..."
            : settings.marketplaceOpen
            ? "Turn Maintenance On"
            : "Go Live"}
        </button>
      </div>
    </div>
  );
}