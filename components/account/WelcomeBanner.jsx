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
    <section className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50" />

      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(37,99,235,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.045) 1px, transparent 1px)",
          backgroundSize: "42px 42px",
        }}
      />

      <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-blue-200/30 blur-3xl" />
      <div className="absolute -bottom-20 right-0 h-56 w-56 rounded-full bg-indigo-200/25 blur-3xl" />

      <div className="relative grid min-h-[350px] gap-7 px-5 py-7 sm:px-7 sm:py-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)] lg:px-10 lg:py-9">
        {/* Left content */}
        <div className="flex min-w-0 flex-col justify-center">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-blue-700">
              <Sparkles size={14} />
              Premium customer dashboard
            </span>

            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-emerald-700">
              <BadgeCheck size={14} />
              Verified account
            </span>
          </div>

          <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.02] tracking-[-0.04em] text-slate-900 sm:text-5xl lg:text-[56px]">
            Welcome back,
            <span className="mt-2 block bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-500 bg-clip-text text-transparent">
              {firstName}.
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
            Manage your orders, track deliveries, review purchases and access
            your account benefits from one secure marketplace dashboard.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/shop"
              className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 font-black text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:from-blue-500 hover:to-indigo-500"
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
              className="inline-flex items-center justify-center gap-3 rounded-2xl border border-blue-200 bg-white px-6 py-3.5 font-bold text-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50"
            >
              <Truck size={18} />
              Track Orders
            </Link>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;

              return (
                <div
                  key={benefit.label}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Icon size={17} />
                  </div>

                  <p className="text-xs font-bold text-slate-700">
                    {benefit.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right account panel */}
        <div className="relative flex items-center">
          <div className="w-full rounded-[26px] border border-slate-200 bg-white/95 p-5 shadow-xl shadow-slate-200/50 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
                  Amoakay account
                </p>

                <h2 className="mt-2 text-2xl font-black text-slate-900">
                  Shopping benefits
                </h2>
              </div>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-yellow-500 text-slate-900 shadow-lg shadow-yellow-200/70">
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

            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <BadgeCheck size={19} />
                </div>

                <div>
                  <p className="text-sm font-black text-slate-900">
                    Account ready
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    Your dashboard is connected to your latest paid orders and
                    delivery activity.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute -right-8 -top-8 hidden h-24 w-24 rounded-full border border-blue-100 bg-blue-50/80 xl:block" />
          <div className="pointer-events-none absolute -bottom-7 -left-7 hidden h-20 w-20 rounded-3xl border border-indigo-100 bg-indigo-50/80 xl:block" />
        </div>
      </div>
    </section>
  );
}

function FeatureRow({ icon: Icon, title, text }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-blue-50/50">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
        <Icon size={19} />
      </div>

      <div className="min-w-0">
        <p className="font-bold text-slate-900">{title}</p>

        <p className="mt-1 text-xs leading-5 text-slate-600">
          {text}
        </p>
      </div>
    </div>
  );
}