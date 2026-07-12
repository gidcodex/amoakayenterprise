"use client";

import { assets } from "@/assets/assets";
import { ArrowRight, ChevronDown, ChevronRight, Headphones, Menu, PackageCheck, ShieldCheck, Sparkles, X,} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import CategoriesMarquee from "./CategoriesMarquee";
import CategoryMegaMenu from "./CategoryMegaMenu";



const benefits = [
  {
    icon: PackageCheck,
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
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "₵";

  return (
    <section className="bg-white">
      {/* Top benefit strip */}
      <div className="border-y border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-2 px-4 py-2 text-xs font-medium sm:grid-cols-3 sm:text-sm">
          <div className="flex items-center justify-center gap-2">
            <PackageCheck size={16} className="text-green-400" />
            Free shipping on orders above {currency}900
          </div>

          <div className="hidden items-center justify-center gap-2 sm:flex">
            <ShieldCheck size={16} className="text-green-400" />
            Secure payments and buyer protection
          </div>

          <div className="hidden items-center justify-center gap-2 sm:flex">
            <Headphones size={16} className="text-green-400" />
            Customer support when you need it
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-3 py-5 sm:px-6 sm:py-8">


        <div className="grid items-stretch gap-4 xl:grid-cols-[235px_minmax(0,1fr)_270px]">
          {/* Desktop category sidebar */}
          
          <CategoryMegaMenu
              mode="sidebar"
              className="hidden xl:block"
          />
          {/* Main hero banner */}
          <div className="relative min-h-[390px] overflow-hidden border border-blue-100 bg-gradient-to-br from-white via-blue-50 to-cyan-100 sm:min-h-[430px]">
            <div
              className="absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage:
                  "linear-gradient(#2563eb 1px, transparent 1px), linear-gradient(90deg, #2563eb 1px, transparent 1px)",
                backgroundSize: "42px 42px",
              }}
            />

            {/* Background light effects */}
            <div className="absolute -left-24 top-0 h-80 w-80 rounded-full bg-blue-200/50 blur-3xl" />
            <div className="absolute -bottom-28 right-0 h-96 w-96 rounded-full bg-cyan-200/60 blur-3xl" />
            <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-blue-100/70 to-transparent" />

             <div className="relative z-10 flex min-h-[390px] flex-col px-5 py-6 sm:min-h-[430px] sm:px-8 sm:py-8 lg:px-10">
              {/* Text column width prevents overlap */}
              <div className="relative z-20 max-w-full md:max-w-[55%]">
                <span className="inline-flex items-center gap-2 border border-blue-200 bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-widest text-blue-700 backdrop-blur">
                  <Sparkles size={15} />
                  Premium electronics marketplace
                </span>

                <h1 className="mt-5 text-3xl font-black leading-[1.05] text-slate-950 sm:text-4xl lg:text-[48px]">
                  Better technology.
                  <span className="mt-2 block bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
                    Better everyday value.
                  </span>
                </h1>

                <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
                  Discover smartphones, laptops, tablets and home electronics
                  from trusted sellers, with competitive prices and dependable
                  delivery.
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href="/shop"
                    className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-green-600 to-emerald-500 px-7 py-3 font-bold text-white shadow-lg shadow-green-200 transition hover:-translate-y-0.5 hover:from-green-700 hover:to-emerald-600"
                  >
                    Shop now
                    <ArrowRight size={17} />
                  </Link>

                  <Link
                    href="/track-order"
                    className="inline-flex items-center gap-3 rounded-full border border-blue-200 bg-white/90 px-7 py-3 font-semibold text-slate-700 shadow-sm backdrop-blur transition hover:border-green-300 hover:bg-green-50 hover:text-green-700"
                  >
                    Track an order
                  </Link>
                </div>

                <div className="mt-6 flex flex-wrap gap-6 text-sm">
                  <div>
                    <p className="text-slate-500">Selected deals from</p>
                    <p className="mt-1 text-2xl font-black text-slate-950">
                      {currency}300
                    </p>
                  </div>

                  <div className="border-l border-slate-300 pl-6">
                    <p className="text-slate-500">Free shipping above</p>
                    <p className="mt-1 text-2xl font-black text-slate-950">
                      {currency}900
                    </p>
                  </div>
                </div>
              </div>

              {/* Hero image — positioned only on right half */}
              <Image
                  src={assets.hero_model_img}
                  alt="Customer shopping with a smartphone"
                  priority
                  className="pointer-events-none absolute bottom-0 right-2 hidden max-h-[88%] w-[44%] object-contain object-bottom md:block"
              />

              {/* Mobile image becomes part of normal layout */}
              <div className="relative mt-5 flex flex-1 items-end justify-center md:hidden">
                <Image
                  src={assets.hero_model_img}
                  alt="Customer shopping with a smartphone"
                  priority
                  className="max-h-56 w-auto object-contain object-bottom sm:max-h-64"
                />
              </div>
            </div>
          </div>

          {/* Promotional cards */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <Link
              href="/shop"
              className="group relative min-h-44 overflow-hidden border border-orange-200 bg-gradient-to-br from-white via-orange-50 to-orange-100 p-5"
            >
              <div className="relative z-10 max-w-[55%]">
                <p className="text-xs font-bold uppercase tracking-wider text-orange-600">
                  Popular now
                </p>

             <h2 className="mt-2 text-xl font-black leading-tight text-slate-900">
                  Best-selling products
                </h2>

                <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-slate-700">
                  Shop now
                  <ArrowRight
                    size={16}
                    className="transition group-hover:translate-x-1"
                  />
                </span>
              </div>

              <Image
                src={assets.hero_product_img1}
                alt="Best-selling products"
                className="absolute bottom-2 right-2 h-32 w-32 object-contain transition duration-300 group-hover:scale-105 sm:h-36 sm:w-36"
              />
            </Link>

            <Link
              href="/shop"
              className="group relative min-h-44 overflow-hidden border border-blue-200 bg-gradient-to-br from-white via-blue-50 to-cyan-100 p-5"
            >
              <div className="relative z-10 max-w-[55%]">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Limited offer
                </p>

                <h2 className="mt-2 text-xl font-black leading-tight text-slate-900">
                  Save up to 20%
                </h2>

                <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-slate-700">
                  Shop deals
                  <ArrowRight
                    size={16}
                    className="transition group-hover:translate-x-1"
                  />
                </span>
              </div>

              <Image
                src={assets.hero_product_img2}
                alt="Discounted products"
                className="absolute bottom-2 right-2 h-32 w-32 object-contain transition duration-300 group-hover:scale-105 sm:h-36 sm:w-36"
              />
            </Link>
          </div>
        </div>

        {/* Trust benefits */}
        <div className="mt-4 grid border border-slate-200 bg-white shadow-sm sm:grid-cols-3">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;

            return (
              <div
                key={benefit.title}
                className={`flex items-center gap-4 px-5 py-4 ${
                  index !== benefits.length - 1
                    ? "border-b border-slate-200 sm:border-b-0 sm:border-r"
                    : ""
                }`}
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600">
                  <Icon size={21} />
                </div>

                <div>
                  <p className="font-bold text-slate-900">{benefit.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{benefit.text}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6">
          <CategoriesMarquee />
        </div>
      </div>
    </section>
  );
}