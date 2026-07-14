import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Box,
  Crown,
  Headphones,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
} from "lucide-react";

const benefits = [
  {
    icon: PackageCheck,
    label: "Order protection",
  },
  {
    icon: ShieldCheck,
    label: "Secure payments",
  },
  {
    icon: Headphones,
    label: "Customer support",
  },
];

export default function WelcomeBanner({ user }) {
  const firstName = user?.firstName || "Customer";

  return (
    <section className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-slate-950 text-white shadow-xl shadow-slate-200/60">
      {/* Premium background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-emerald-950" />

      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.35) 1px, transparent 1px)",
          backgroundSize: "42px 42px",
        }}
      />

      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-blue-500/30 blur-3xl" />
      <div className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-emerald-400/25 blur-3xl" />
      <div className="absolute right-[22%] top-6 h-40 w-40 rounded-full bg-cyan-300/10 blur-3xl" />

      <div className="relative grid min-h-[430px] gap-8 px-5 py-7 sm:px-7 sm:py-9 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)] lg:px-10 lg:py-11">
        {/* Left content */}
        <div className="flex min-w-0 flex-col justify-center">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-blue-400/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-200 backdrop-blur">
              <Sparkles size={14} />
              Premium customer dashboard
            </span>

            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.15em] text-emerald-200">
              <BadgeCheck size={14} />
              Verified account
            </span>
          </div>

          <h1 className="mt-7 max-w-3xl text-4xl font-black leading-[1.02] tracking-[-0.04em] text-white sm:text-5xl lg:text-[62px]">
            Welcome back,
            <span className="mt-2 block bg-gradient-to-r from-white via-blue-200 to-emerald-300 bg-clip-text text-transparent">
              {firstName}.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base sm:leading-8">
            Manage your orders, track deliveries, review purchases and access
            your account benefits from one secure marketplace dashboard.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/shop"
              className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-400 px-6 py-3.5 font-black text-slate-950 shadow-lg shadow-green-950/30 transition hover:-translate-y-0.5 hover:from-green-400 hover:to-emerald-300"
            >
              <ShoppingBag size={18} />
              Continue Shopping
              <ArrowRight
                size={17}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>

            <Link
              href="/track-order"
              className="inline-flex items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-6 py-3.5 font-bold text-white backdrop-blur transition hover:-translate-y-0.5 hover:border-emerald-300/40 hover:bg-white/15"
            >
              <Truck size={18} />
              Track Orders
            </Link>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;

              return (
                <div
                  key={benefit.label}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 backdrop-blur"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-emerald-300">
                    <Icon size={17} />
                  </div>

                  <p className="text-xs font-semibold text-slate-200">
                    {benefit.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right premium account panel */}
        <div className="relative flex items-center">
          <div className="w-full rounded-[26px] border border-white/10 bg-white/[0.08] p-5 backdrop-blur-xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">
                  Amoakay account
                </p>

                <h2 className="mt-2 text-2xl font-black text-white">
                  Shopping benefits
                </h2>
              </div>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-yellow-500 text-slate-950 shadow-lg shadow-yellow-950/20">
                <Crown size={23} />
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <FeatureRow
                icon={Box}
                title="Everything in one place"
                text="Orders, tracking and account activity"
              />

              <FeatureRow
                icon={ShieldCheck}
                title="Protected checkout"
                text="Secure Paystack and marketplace payments"
              />

              <FeatureRow
                icon={Truck}
                title="Delivery visibility"
                text="Track each order from seller to doorstep"
              />
            </div>

            <div className="mt-6 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300">
                  <BadgeCheck size={19} />
                </div>

                <div>
                  <p className="text-sm font-black text-white">
                    Account ready
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-300">
                    Your dashboard is connected to your latest paid orders and
                    delivery activity.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute -right-8 -top-8 hidden h-24 w-24 rounded-full border border-white/10 bg-white/[0.04] xl:block" />
          <div className="pointer-events-none absolute -bottom-7 -left-7 hidden h-20 w-20 rounded-3xl border border-emerald-300/10 bg-emerald-400/[0.06] xl:block" />
        </div>
      </div>
    </section>
  );
}

function FeatureRow({ icon: Icon, title, text }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-slate-950/25 p-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-blue-200">
        <Icon size={19} />
      </div>

      <div className="min-w-0">
        <p className="font-bold text-white">{title}</p>

        <p className="mt-1 text-xs leading-5 text-slate-300">
          {text}
        </p>
      </div>
    </div>
  );
}