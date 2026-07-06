import Link from "next/link";
import { CheckCircle, Package, Truck, Star } from "lucide-react";

export default function RecentActivity({ orders = [] }) {
  const activities = orders
    .flatMap((order) => [
      {
        id: `${order.id}-order`,
        title: "Order placed",
        text: `Your order from ${order.store?.name || "a store"} was received.`,
        date: order.createdAt,
        icon: Package,
        link: `/track-order?tracking=${order.trackingNumber}`,
      },
      {
        id: `${order.id}-status`,
        title:
          order.status === "DELIVERED"
            ? "Order delivered"
            : order.status === "SHIPPED"
            ? "Order shipped"
            : "Order in progress",
        text: `Status: ${order.status?.replace(/_/g, " ").toLowerCase()}`,
        date: order.updatedAt || order.createdAt,
        icon:
          order.status === "DELIVERED"
            ? CheckCircle
            : order.status === "SHIPPED"
            ? Truck
            : Package,
        link: `/track-order?tracking=${order.trackingNumber}`,
      },
    ])
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/60 p-6">
      <h2 className="text-2xl font-bold text-slate-900">Recent Activity</h2>
      <p className="text-sm text-slate-500 mt-1 mb-5">
        Latest updates from your orders.
      </p>

      <div className="space-y-4">
        {activities.length > 0 ? (
          activities.map((activity) => {
            const Icon = activity.icon;

            return (
              <Link
                key={activity.id}
                href={activity.link}
                className="flex gap-4 bg-slate-50 hover:bg-white border border-slate-100 rounded-2xl p-4 transition"
              >
                <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Icon size={20} />
                </div>

                <div>
                  <p className="font-bold text-slate-900">{activity.title}</p>
                  <p className="text-sm text-slate-500 mt-1">
                    {activity.text}
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    {new Date(activity.date).toLocaleString()}
                  </p>
                </div>
              </Link>
            );
          })
        ) : (
          <p className="text-sm text-slate-400">No recent activity yet.</p>
        )}
      </div>
    </div>
  );
}