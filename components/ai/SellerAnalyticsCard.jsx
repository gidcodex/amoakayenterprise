"use client";

import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Package,
  Clock,
  Truck,
  CheckCircle,
  Star,
} from "lucide-react";

export default function SellerAnalyticsCard({ summary }) {
  if (!summary) return null;

  const formatMoney = (value) =>
    new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
      minimumFractionDigits: 2,
    }).format(value || 0);

  const stats = [
    {
      title: "Total Revenue",
      value: formatMoney(summary.totalRevenue),
      icon: DollarSign,
    },
    {
      title: "Today's Revenue",
      value: formatMoney(summary.todayRevenue),
      icon: TrendingUp,
    },
    {
      title: "Monthly Revenue",
      value: formatMoney(summary.monthRevenue),
      icon: TrendingUp,
    },
    {
      title: "Orders",
      value: summary.totalOrders,
      icon: ShoppingBag,
    },
    {
      title: "Products",
      value: summary.totalProducts,
      icon: Package,
    },
    {
      title: "Pending",
      value: summary.pendingOrders,
      icon: Clock,
    },
    {
      title: "Processing",
      value: summary.processingOrders,
      icon: Package,
    },
    {
      title: "Shipped",
      value: summary.shippedOrders,
      icon: Truck,
    },
    {
      title: "Delivered",
      value: summary.deliveredOrders,
      icon: CheckCircle,
    },
  ];

  return (
    <div className="mt-4 rounded-3xl border border-blue-100 bg-white shadow-xl overflow-hidden">

      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-5 text-white">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-8 w-8" />
          <div>
            <h2 className="text-xl font-bold">
              Seller Analytics
            </h2>
            <p className="text-sm text-blue-100">
              Your business performance overview
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">

        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-2xl border bg-gray-50 p-4 transition hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  {item.title}
                </p>

                <Icon className="h-5 w-5 text-blue-600" />
              </div>

              <h3 className="mt-2 text-2xl font-bold text-gray-900">
                {item.value}
              </h3>
            </div>
          );
        })}

      </div>

      <div className="border-t bg-blue-50 p-5">

        <div className="flex items-center gap-2 mb-3">
          <Star className="h-5 w-5 text-yellow-500" />
          <h3 className="font-semibold">
            Best Selling Product
          </h3>
        </div>

        {summary.bestSellingProduct ? (
          <div className="rounded-xl bg-white p-4 shadow-sm border">
            <h4 className="font-semibold text-gray-900">
              {summary.bestSellingProduct.name}
            </h4>

            <p className="mt-1 text-sm text-gray-600">
              Quantity Sold:{" "}
              <span className="font-semibold">
                {summary.bestSellingProduct.quantity}
              </span>
            </p>

            <p className="text-sm text-gray-600">
              Revenue:{" "}
              <span className="font-semibold">
                {formatMoney(summary.bestSellingProduct.revenue)}
              </span>
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed p-4 text-sm text-gray-500">
            No sales data available yet.
          </div>
        )}

      </div>
    </div>
  );
}