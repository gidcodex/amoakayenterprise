import { CreditCard, Banknote, Truck, CheckCircle } from "lucide-react";

export default function DashboardSummary({ dashboardData }) {
  const items = [
    {
      title: "COD Orders",
      value: dashboardData.codOrders || 0,
      icon: Banknote,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Stripe Orders",
      value: dashboardData.stripeOrders || 0,
      icon: CreditCard,
      color: "bg-indigo-100 text-indigo-600",
    },
    {
      title: "Active Deliveries",
      value: dashboardData.activeDeliveries || 0,
      icon: Truck,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      title: "Delivered Orders",
      value: dashboardData.deliveredOrders || 0,
      icon: CheckCircle,
      color: "bg-emerald-100 text-emerald-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mt-8">
      {items.map((item, index) => (
        <div
          key={index}
          className="bg-white rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/50 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm">{item.title}</p>
              <h2 className="text-3xl font-bold text-slate-900 mt-2">
                {item.value}
              </h2>
            </div>

            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center ${item.color}`}
            >
              <item.icon size={26} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}