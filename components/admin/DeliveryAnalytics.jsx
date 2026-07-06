import { Package, Loader, Truck, CheckCircle } from "lucide-react";

const statusLabels = {
  ORDER_PLACED: "Order Placed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
};

export default function DeliveryAnalytics({ recentOrders = [] }) {
  const total = recentOrders.length || 1;

  const items = [
    {
      status: "ORDER_PLACED",
      icon: Package,
      count: recentOrders.filter((o) => o.status === "ORDER_PLACED").length,
      color: "bg-blue-500",
      iconColor: "bg-blue-100 text-blue-600",
    },
    {
      status: "PROCESSING",
      icon: Loader,
      count: recentOrders.filter((o) => o.status === "PROCESSING").length,
      color: "bg-yellow-500",
      iconColor: "bg-yellow-100 text-yellow-600",
    },
    {
      status: "SHIPPED",
      icon: Truck,
      count: recentOrders.filter((o) => o.status === "SHIPPED").length,
      color: "bg-purple-500",
      iconColor: "bg-purple-100 text-purple-600",
    },
    {
      status: "DELIVERED",
      icon: CheckCircle,
      count: recentOrders.filter((o) => o.status === "DELIVERED").length,
      color: "bg-green-500",
      iconColor: "bg-green-100 text-green-600",
    },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/50 p-6">
      <h2 className="text-xl font-bold text-slate-900 mb-2">
        Delivery Analytics
      </h2>

      <p className="text-sm text-slate-500 mb-6">
        Delivery status distribution from recent orders.
      </p>

      <div className="space-y-5">
        {items.map((item) => {
          const Icon = item.icon;
          const percent = Math.round((item.count / total) * 100);

          return (
            <div key={item.status}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center ${item.iconColor}`}
                  >
                    <Icon size={20} />
                  </div>

                  <div>
                    <p className="font-semibold text-slate-800">
                      {statusLabels[item.status]}
                    </p>
                    <p className="text-xs text-slate-400">
                      {item.count} order(s)
                    </p>
                  </div>
                </div>

                <span className="font-bold text-slate-700">
                  {percent}%
                </span>
              </div>

              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${item.color}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}