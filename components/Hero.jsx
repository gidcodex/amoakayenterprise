"use client";

import { assets } from "@/assets/assets";
import {
  ArrowRight,
  Headphones,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Tag,
  Truck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import CategoriesMarquee from "./CategoriesMarquee";
import CategoryMegaMenu from "./CategoryMegaMenu";

const benefits = [
  {
    icon: Truck,
    title: "Fast delivery",
    text: "Reliable delivery across Ghana",
  },
  {
    icon: ShieldCheck,
    title: "Secure shopping",
    text: "Protected payments and purchases",
  },
  {
    icon: Headphones,
    title: "Customer support",
    text: "Help whenever you need it",
  },
];

export default function Hero() {
  const currency =
    process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "₵";

  return (
    <section className="overflow-hidden bg-white">
      {/* Top marketplace strip */}
      <div className="border-y border-slate-800 bg-slate-950 text-white">
        <div className="mx-auto flex max-w-[1600px] items-center justify-center px-4 py-2.5 sm:px-6 lg:justify-between lg:px-8">
          <div className="flex items-center gap-2 text-xs font-semibold sm:text-sm">
            <PackageCheck
              size={16}
              className="shrink-0 text-green-400"
            />

            <span>
              Free shipping on orders above {currency}900
            </span>
          </div>

          <div className="hidden items-center gap-2 text-sm font-medium lg:flex">
            <ShieldCheck
              size={16}
              className="text-green-400"
            />
            Secure payments and buyer protection
          </div>

          <div className="hidden items-center gap-2 text-sm font-medium xl:flex">
            <Headphones
              size={16}
              className="text-green-400"
            />
            Customer support when you need it
          </div>

          <Link
            href="/shop"
            className="hidden items-center gap-2 text-sm font-semibold text-green-400 transition hover:text-green-300 2xl:flex"
          >
            Explore marketplace
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] px-3 py-5 sm:px-6 sm:py-7 lg:px-8">
        {/* Main hero layout */}
        <div className="grid items-stretch gap-4 xl:grid-cols-[250px_minmax(0,1fr)]">
          {/* Desktop categories */}
          <CategoryMegaMenu
            mode="sidebar"
            className="hidden xl:block"
          />

          {/* Editorial hero */}
          <div className="relative isolate overflow-hidden border border-blue-100 bg-gradient-to-br from-white via-blue-50 to-cyan-100">
            {/* Grid texture */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.045]"
              style={{
                backgroundImage:
                  "linear-gradient(#2563eb 1px, transparent 1px), linear-gradient(90deg, #2563eb 1px, transparent 1px)",
                backgroundSize: "42px 42px",
              }}
            />

            {/* Background lighting */}
            <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-blue-200/50 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-28 right-0 h-96 w-96 rounded-full bg-cyan-300/50 blur-3xl" />

            <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[48%] bg-gradient-to-l from-emerald-100/60 via-blue-100/30 to-transparent md:block" />

            {/* Curved decorative line */}
            <div className="pointer-events-none absolute -bottom-48 right-[9%] hidden h-[520px] w-[520px] rounded-full border border-green-400/30 md:block" />

            <div className="relative z-10 grid min-h-[470px] md:grid-cols-[minmax(0,1fr)_44%] lg:min-h-[500px]">
              {/* Text area */}
              <div className="relative z-20 flex flex-col justify-center px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
                <span className="inline-flex w-fit items-center gap-2 border border-blue-200 bg-white/80 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-blue-700 backdrop-blur sm:text-xs">
                  <Sparkles size={15} />
                  Premium electronics marketplace
                </span>

                <h1 className="mt-6 max-w-2xl text-4xl font-black leading-[1.02] tracking-[-0.045em] text-slate-950 sm:text-5xl lg:text-[58px]">
                  Better technology.
                  <span className="mt-2 block bg-gradient-to-r from-blue-600 via-cyan-500 to-green-500 bg-clip-text text-transparent">
                    Better everyday value.
                  </span>
                </h1>

                <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                  Shop trusted smartphones, laptops, tablets,
                  accessories and home technology from verified
                  sellers across Ghana.
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Link
                    href="/shop"
                    className="inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-green-600 to-emerald-500 px-7 py-3.5 font-bold text-white shadow-lg shadow-green-300/60 transition hover:-translate-y-0.5 hover:from-green-700 hover:to-emerald-600"
                  >
                    Shop now
                    <ArrowRight size={18} />
                  </Link>

                  <Link
                    href="/track-order"
                    className="inline-flex items-center justify-center gap-3 rounded-full border border-slate-300 bg-white/85 px-7 py-3.5 font-semibold text-slate-700 shadow-sm backdrop-blur transition hover:border-green-300 hover:bg-green-50 hover:text-green-700"
                  >
                    <Truck size={18} />
                    Track an order
                  </Link>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
                  <div>
                    <p className="text-sm text-slate-500">
                      Selected deals from
                    </p>

                    <p className="mt-1 text-3xl font-black tracking-tight text-slate-950">
                      {currency}300
                    </p>
                  </div>

                  <div className="h-14 w-px bg-slate-300" />

                  <div>
                    <p className="text-sm text-slate-500">
                      Free shipping above
                    </p>

                    <p className="mt-1 text-3xl font-black tracking-tight text-slate-950">
                      {currency}900
                    </p>
                  </div>
                </div>
              </div>

              {/* Desktop visual area */}
              <div className="relative hidden min-h-[470px] md:block lg:min-h-[500px]">
                {/* Deal card */}
                <Link
                  href="/shop"
                  className="group absolute right-5 top-6 z-30 w-[190px] border border-white/80 bg-white/85 p-4 shadow-xl shadow-blue-200/50 backdrop-blur-md transition hover:-translate-y-1 lg:right-8 lg:top-8 lg:w-[210px]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-orange-600">
                        Deal of the week
                      </p>

                      <h2 className="mt-1 text-xl font-black leading-tight text-slate-900">
                        Save up to 20%
                      </h2>
                    </div>

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                      <Tag size={17} />
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm font-bold text-green-700">
                      Shop deal
                    </span>

                    <ArrowRight
                      size={16}
                      className="transition group-hover:translate-x-1"
                    />
                  </div>
                </Link>

                {/* Supporting product image */}
                <div className="absolute bottom-5 right-5 z-20 h-32 w-32 rounded-full bg-white/80 p-4 shadow-lg backdrop-blur lg:bottom-8 lg:right-8 lg:h-36 lg:w-36">
                  <Image
                    src={assets.hero_product_img1}
                    alt="Featured electronics product"
                    fill
                    sizes="144px"
                    className="object-contain p-4"
                  />
                </div>

                {/* Main customer image */}
                <Image
                  src={assets.hero_model_img}
                  alt="Customer shopping with a smartphone"
                  priority
                  className="pointer-events-none absolute bottom-0 left-1/2 z-10 max-h-[88%] w-[78%] -translate-x-1/2 object-contain object-bottom"
                />
              </div>

              {/* Mobile customer image */}
              <div className="relative flex min-h-[285px] items-end justify-center overflow-hidden px-5 md:hidden">
                <div className="absolute bottom-6 left-5 z-20 border border-white/80 bg-white/90 p-4 shadow-xl backdrop-blur">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-orange-600">
                    Limited offer
                  </p>

                  <p className="mt-1 text-lg font-black text-slate-900">
                    Save up to 20%
                  </p>

                  <Link
                    href="/shop"
                    className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-green-700"
                  >
                    Shop deal
                    <ArrowRight size={13} />
                  </Link>
                </div>

                <Image
                  src={assets.hero_model_img}
                  alt="Customer shopping with a smartphone"
                  priority
                  className="relative z-10 max-h-[300px] w-auto object-contain object-bottom"
                />
              </div>
            </div>

            {/* Integrated benefit strip */}
            <div className="relative z-30 grid border-t border-slate-200 bg-white/90 backdrop-blur sm:grid-cols-3">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;

                return (
                  <div
                    key={benefit.title}
                    className={`flex items-center gap-3 px-5 py-4 ${
                      index !== benefits.length - 1
                        ? "border-b border-slate-200 sm:border-b-0 sm:border-r"
                        : ""
                    }`}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600">
                      <Icon size={19} />
                    </div>

                    <div className="min-w-0">
                      <p className="font-bold text-slate-900">
                        {benefit.title}
                      </p>

                      <p className="mt-0.5 text-xs leading-5 text-slate-500">
                        {benefit.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Category marquee */}
        <div className="mt-5">
          <CategoriesMarquee />
        </div>
      </div>
    </section>
  );
}