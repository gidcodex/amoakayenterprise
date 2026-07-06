import {
  Package,
  Truck,
  CheckCircle,
  MapPin,
  Star,
  Wallet,
} from "lucide-react";

export default function AccountSummary({ dashboardData, currency }) {
  const rows = [
    {
      label: "Total Orders",
      value: dashboardData.totalOrders,
      icon: Package,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Active Orders",
      value: dashboardData.activeOrders,
      icon: Truck,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      label: "Delivered Orders",
      value: dashboardData.deliveredOrders,
      icon: CheckCircle,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Saved Addresses",
      value: dashboardData.addresses,
      icon: MapPin,
      color: "bg-purple-100 text-purple-600",
    },
    {
      label: "Reviews Given",
      value: dashboardData.reviews,
      icon: Star,
      color: "bg-orange-100 text-orange-600",
    },
    {
      label: "Total Spent",
      value: `${currency}${dashboardData.totalSpent}`,
      icon: Wallet,
      color: "bg-emerald-100 text-emerald-600",
    },
  ];

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/60 overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-2xl font-bold text-slate-900">
          Account Summary
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          A quick view of your shopping activity.
        </p>
      </div>

      <div className="grid md:grid-cols-2">
        {rows.map((row, index) => {
          const Icon = row.icon;

          return (
            <div
              key={row.label}
              className={`flex items-center justify-between gap-5 p-5 border-slate-100 ${
                index % 2 === 0 ? "md:border-r" : ""
              } ${index < rows.length - 2 ? "border-b" : ""}`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center ${row.color}`}
                >
                  <Icon size={21} />
                </div>

                <p className="font-semibold text-slate-700">
                  {row.label}
                </p>
              </div>

              <p className="text-xl font-bold text-slate-900">
                {row.value}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}