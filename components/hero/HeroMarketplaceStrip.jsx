"use client";

import {
  ArrowRight,
  Headphones,
  PackageCheck,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

import { useLanguage } from "@/context/LanguageContext";

export default function HeroMarketplaceStrip({ currency = "₵" }) {
  const { t } = useLanguage();

  return (
    <div className="border-y border-slate-800 bg-slate-950 text-white">
      <div className="mx-auto flex max-w-[1600px] items-center justify-center px-4 py-2.5 sm:px-6 lg:justify-between lg:px-8">
        <div className="flex items-center gap-2 text-xs font-semibold sm:text-sm">
          <PackageCheck
            size={16}
            className="shrink-0 text-green-400"
          />

          <span>
            {t("home.heroStrip.freeShippingBefore")}{" "}
            {currency}900
          </span>
        </div>

        <div className="hidden items-center gap-2 text-sm font-medium lg:flex">
          <ShieldCheck
            size={16}
            className="text-green-400"
          />

          {t("home.heroStrip.securePayments")}
        </div>

        <div className="hidden items-center gap-2 text-sm font-medium xl:flex">
          <Headphones
            size={16}
            className="text-green-400"
          />

          {t("home.heroStrip.customerSupport")}
        </div>

        <Link
          href="/shop"
          className="hidden items-center gap-2 text-sm font-semibold text-green-400 transition hover:text-green-300 2xl:flex"
        >
          {t("home.heroStrip.exploreMarketplace")}

          <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}