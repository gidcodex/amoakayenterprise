import Link from "next/link";
import { ShoppingBag, Truck, ArrowRight } from "lucide-react";

export default function WelcomeBanner({ user }) {
  return (
    <section className="relative overflow-hidden border border-slate-200 bg-white">

      {/* Left Accent */}
      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-600 via-cyan-500 to-green-500" />

      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/70 via-white to-cyan-50/50" />

      {/* Decorative Blobs */}
      <div className="absolute -top-20 right-0 h-72 w-72 rounded-full bg-blue-100 blur-3xl opacity-50" />
      <div className="absolute -bottom-20 left-1/2 h-56 w-56 rounded-full bg-cyan-100 blur-3xl opacity-40" />

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#1e40af 1px, transparent 1px), linear-gradient(to right, #1e40af 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />

      <div className="relative px-8 py-10 md:px-12 md:py-14">

        <span className="inline-flex items-center rounded-full bg-blue-100 px-4 py-1 text-xs font-bold uppercase tracking-wider text-blue-700">
          Customer Dashboard
        </span>

        <h1 className="mt-5 text-4xl md:text-5xl lg:text-6xl font-black leading-tight text-slate-900">
          Welcome back,
          <br />
          {user?.firstName || "Customer"} 👋
        </h1>

        <p className="mt-6 max-w-3xl text-slate-600 text-lg leading-8">
          Manage your orders, monitor deliveries, request returns,
          download invoices and continue shopping from one beautiful
          dashboard.
        </p>

        {/* Buttons */}
        <div className="mt-10 flex flex-wrap gap-4">

          <Link
            href="/shop"
            className="group inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-green-600 to-emerald-500 px-8 py-3 font-semibold text-white shadow-lg shadow-green-300 transition-all duration-300 hover:from-green-700 hover:to-emerald-600 hover:-translate-y-0.5"
          >
            <ShoppingBag size={18} />

            Continue Shopping

            <ArrowRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>

          <Link
            href="/track-order"
            className="inline-flex items-center gap-3 rounded-full border border-green-300 bg-white px-8 py-3 font-semibold text-green-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-green-400 hover:bg-green-50"
          >
            <Truck size={18} />

            Track Orders
          </Link>

        </div>

      </div>
    </section>
  );
}