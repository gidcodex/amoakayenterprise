import Link from "next/link";
import { ShoppingBag, Truck } from "lucide-react";

export default function WelcomeBanner({ user }) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-blue-100 bg-gradient-to-br from-white via-blue-50 to-blue-100 p-8 md:p-10 shadow-xl shadow-blue-100">

      {/* Decorative Background */}
      <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-blue-300/20 blur-3xl"></div>
      <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl"></div>

      <div className="relative z-10">
        <p className="text-blue-600 text-sm font-bold tracking-wider uppercase">
          Customer Center
        </p>

        <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mt-3 leading-tight">
          Welcome back,
          <br />
          {user?.firstName || "Customer"} 👋
        </h1>

        <p className="text-slate-600 mt-5 max-w-2xl leading-8 text-base">
          Manage your orders, monitor deliveries, review your purchases,
          request returns, and continue shopping from your personalized
          dashboard.
        </p>

        <div className="flex flex-wrap gap-4 mt-8">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-blue-300"
          >
            <ShoppingBag size={18} />
            Continue Shopping
          </Link>

          <Link
            href="/track-order"
            className="inline-flex items-center gap-2 rounded-2xl border border-blue-200 bg-white px-6 py-3 font-semibold text-blue-700 transition-all duration-300 hover:bg-blue-50"
          >
            <Truck size={18} />
            Track Orders
          </Link>
        </div>
      </div>
    </div>
  );
}