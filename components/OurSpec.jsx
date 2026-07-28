"use client";

import { ourSpecsData } from "@/assets/assets";
import {
  BadgeCheck,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const fallbackIcons = [
  ShieldCheck,
  BadgeCheck,
  LockKeyhole,
];

const OurSpecs = () => {
  return (
    <section className="relative overflow-hidden bg-[#F7F9FC] py-16 sm:py-20 lg:py-24">
  {/* Aurora Background */}

  <div
    aria-hidden="true"
    className="
      pointer-events-none
      absolute
      -top-44
      -left-44
      h-[520px]
      w-[520px]
      rounded-full
      bg-[#D8F8E8]
      opacity-70
      blur-[170px]
    "
  />

  <div
    aria-hidden="true"
    className="
      pointer-events-none
      absolute
      top-0
      left-1/2
      h-[420px]
      w-[420px]
      -translate-x-1/2
      rounded-full
      bg-[#E3EEFF]
      opacity-60
      blur-[170px]
    "
  />

  <div
    aria-hidden="true"
    className="
      pointer-events-none
      absolute
      -bottom-40
      -right-40
      h-[520px]
      w-[520px]
      rounded-full
      bg-[#FFF3D9]
      opacity-70
      blur-[170px]
    "
  />

  {/* Subtle decorative circles */}
  <div
    aria-hidden="true"
    className="
      absolute
      left-[8%]
      top-[20%]
      h-3
      w-3
      rounded-full
      bg-emerald-400/40
    "
  />

  <div
    aria-hidden="true"
    className="
      absolute
      right-[12%]
      top-[18%]
      h-4
      w-4
      rounded-full
      bg-sky-400/40
    "
  />

  <div
    aria-hidden="true"
    className="
      absolute
      bottom-[16%]
      left-[22%]
      h-2.5
      w-2.5
      rounded-full
      bg-amber-400/50
    "
  />

  <div
    aria-hidden="true"
    className="
      absolute
      bottom-[12%]
      right-[18%]
      h-3
      w-3
      rounded-full
      bg-violet-400/40
    "
  />

  {/* Keep the rest of your existing code below */}

      <div className="relative mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 border border-emerald-200/80 bg-white/80 px-4 py-2 shadow-sm backdrop-blur-xl">
            <Sparkles
              size={15}
              className="text-emerald-600"
            />

            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-700">
              Why shop with us
            </span>
          </div>

          <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Shopping made simple and secure
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            Reliable delivery, convenient returns, secure
            transactions and customer support designed to
            make every Amoakay Deals purchase easier.
          </p>
        </div>

        {/* Benefits */}
        <div className="mt-12 grid border-l border-t border-slate-200/80 bg-white/55 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:grid-cols-2 lg:grid-cols-3">
          {ourSpecsData.map((spec, index) => {
            const Icon =
              spec.icon ||
              fallbackIcons[
                index % fallbackIcons.length
              ];

            return (
              <article
                key={`${spec.title}-${index}`}
                className="group relative border-b border-r border-slate-200/80 px-6 py-9 transition duration-300 hover:bg-white/85 sm:px-8 lg:py-11"
              >
                <div className="flex items-start gap-5">
                  <div
                    className="flex h-13 w-13 shrink-0 items-center justify-center border border-white bg-white shadow-[0_8px_24px_rgba(15,23,42,0.10)] ring-1 ring-slate-200/80"
                    style={{
                      color: spec.accent,
                    }}
                  >
                    <Icon size={23} />
                  </div>

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                      Benefit {String(index + 1).padStart(2, "0")}
                    </p>

                    <h3 className="mt-2 text-lg font-black text-slate-950">
                      {spec.title}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {spec.description}
                    </p>
                  </div>
                </div>

                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
                  style={{
                    backgroundColor: spec.accent,
                  }}
                />
              </article>
            );
          })}
        </div>

        {/* Trust strip */}
        <div className="mt-8 flex flex-col gap-5 border border-white/80 bg-white/75 px-5 py-5 shadow-[0_15px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-emerald-100 text-emerald-700">
              <ShieldCheck size={22} />
            </div>

            <div>
              <p className="font-black text-slate-950">
                Marketplace protection
              </p>

              <p className="mt-1 max-w-xl text-sm leading-6 text-slate-600">
                Shop from registered sellers and access
                structured support throughout your purchase.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-3 text-xs font-bold uppercase tracking-[0.12em] text-slate-600">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 bg-emerald-500" />
              Secure checkout
            </span>

            <span className="flex items-center gap-2">
              <span className="h-2 w-2 bg-blue-500" />
              Seller verification
            </span>

            <span className="flex items-center gap-2">
              <span className="h-2 w-2 bg-violet-500" />
              Customer support
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurSpecs;