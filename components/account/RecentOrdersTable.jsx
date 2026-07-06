import Link from "next/link";

const statusStyles = {
  ORDER_PLACED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-yellow-100 text-yellow-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
};

export default function RecentOrdersTable({ orders = [], currency = "$" }) {
  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/60 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Recent Orders</h2>
          <p className="text-sm text-slate-500 mt-1">
            Track your latest purchases and delivery status.
          </p>
        </div>

        <Link
          href="/orders"
          className="hidden sm:inline-flex bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold transition"
        >
          View All
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px] text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr className="text-left text-slate-500">
              <th className="px-6 py-4 font-semibold">Tracking No.</th>
              <th className="px-6 py-4 font-semibold">Store</th>
              <th className="px-6 py-4 font-semibold">Items</th>
              <th className="px-6 py-4 font-semibold">Total</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-5 font-semibold text-slate-900">
                    {order.trackingNumber}
                  </td>

                  <td className="px-6 py-5 text-slate-600">
                    {order.store?.name}
                  </td>

                  <td className="px-6 py-5 text-slate-600">
                    {order.orderItems?.length || 0} item(s)
                  </td>

                  <td className="px-6 py-5 font-bold text-green-600">
                    {currency}
                    {order.total}
                  </td>

                  <td className="px-6 py-5">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        statusStyles[order.status] ||
                        "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {order.status?.replace(/_/g, " ").toLowerCase()}
                    </span>
                  </td>

                  <td className="px-6 py-5 text-right">
                    <Link
                      href={`/track-order?tracking=${order.trackingNumber}`}
                      className="inline-flex bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold transition"
                    >
                      Track
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                  No recent orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}