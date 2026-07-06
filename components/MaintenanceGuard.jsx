"use client";

import { useEffect, useState } from "react";
import { Wrench, Clock3 } from "lucide-react";

export default function MaintenanceGuard({
  children,
  banner,
  navbar,
  footer,
}) {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        setSettings(data.settings);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  if (loading) {
    return null;
  }

  if (!settings?.marketplaceOpen) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50 flex items-center justify-center px-6">
        <div className="max-w-xl w-full bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-10 text-center">

          <div className="mx-auto w-20 h-20 rounded-3xl bg-green-100 text-green-600 flex items-center justify-center">
            <Wrench size={38} />
          </div>

          <h1 className="text-4xl font-bold text-slate-900 mt-8">
            Marketplace Under Maintenance
          </h1>

          <p className="text-slate-500 leading-7 mt-5">
            {settings.maintenanceMessage}
          </p>

          <div className="mt-8 inline-flex items-center gap-2 bg-green-50 text-green-700 px-5 py-3 rounded-full font-medium">
            <Clock3 size={18} />
            We'll be back shortly.
          </div>

          <div className="mt-10 text-sm text-slate-400">
            Need help?
            <br />
            Contact us at
            <br />
            <span className="font-semibold text-slate-700">
              {settings.supportEmail}
            </span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      {banner}
      {navbar}
      {children}
      {footer}
    </>
  );
}