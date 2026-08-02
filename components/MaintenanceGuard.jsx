"use client";

import { useEffect, useState } from "react";
import { Clock3, Wrench } from "lucide-react";

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
        const res = await fetch("/api/settings", {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(
            `Failed to load settings: ${res.status}`
          );
        }

        const data = await res.json();

        setSettings(data?.settings ?? null);
      } catch (error) {
        console.error(
          "Unable to load marketplace settings:",
          error
        );

        setSettings(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  if (loading) {
    return null;
  }

  /*
    Fail open:
    If the settings request fails or settings are missing,
    keep the marketplace available instead of showing
    the maintenance screen by mistake.
  */
  const marketplaceOpen =
    settings?.marketplaceOpen ?? true;

  if (!marketplaceOpen) {
    const maintenanceMessage =
      settings?.maintenanceMessage?.trim() ||
      "We are currently performing scheduled maintenance. Please check back shortly.";

    const supportEmail =
      settings?.supportEmail?.trim() ||
      "support@amoakaydeals.com";

    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-green-50 px-6">
        <div className="w-full max-w-xl rounded-[2rem] border border-slate-100 bg-white p-8 text-center shadow-2xl sm:p-10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-green-100 text-green-600">
            <Wrench size={38} />
          </div>

          <h1 className="mt-8 text-3xl font-bold text-slate-900 sm:text-4xl">
            Marketplace Under Maintenance
          </h1>

          <p className="mt-5 leading-7 text-slate-500">
            {maintenanceMessage}
          </p>

          <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-green-50 px-5 py-3 font-medium text-green-700">
            <Clock3 size={18} />
            We&apos;ll be back shortly.
          </div>

          <div className="mt-10 text-sm leading-6 text-slate-400">
            <p>Need help?</p>
            <p>Contact us at</p>

            <a
              href={`mailto:${supportEmail}`}
              className="font-semibold text-slate-700 transition hover:text-green-600 hover:underline"
            >
              {supportEmail}
            </a>
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