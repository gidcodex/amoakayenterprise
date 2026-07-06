import prisma from "@/lib/prisma";
import Link from "next/link";
import { Package, Truck, CheckCircle, Clock, Store, User, CreditCard, Eye,} from "lucide-react";
import MarkDeliveriesSeen from "./mark-deliveries-seen";

const statusStyles = {
  ORDER_PLACED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-yellow-100 text-yellow-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
};

const statusLabels = {
  ORDER_PLACED: "Order Placed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
};

export default async function AdminDeliveriesPage() {
  const orders = await prisma.order.findMany({
    include: {
      user: true,
      store: true,
      address: true,
      orderItems: {
        include: {
          product: true,
        },
      },
      trackingEvents: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const totalOrders = orders.length;
  const placed = orders.filter((o) => o.status === "ORDER_PLACED").length;
  const processing = orders.filter((o) => o.status === "PROCESSING").length;
  const shipped = orders.filter((o) => o.status === "SHIPPED").length;
  const delivered = orders.filter((o) => o.status === "DELIVERED").length;

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
       
       <MarkDeliveriesSeen />

      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <p className="text-sm font-semibold text-green-600">
            ADMIN DELIVERY CENTER
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2">
            Delivery Tracking
          </h1>
          <p className="text-slate-500 mt-2">
            Monitor all orders, couriers, delivery statuses, and tracking
            numbers across stores.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <SummaryCard title="Total Orders" value={totalOrders} icon={<Package />} />
          <SummaryCard title="Placed" value={placed} icon={<Clock />} />
          <SummaryCard title="Processing" value={processing} icon={<Package />} />
          <SummaryCard title="Shipped" value={shipped} icon={<Truck />} />
          <SummaryCard title="Delivered" value={delivered} icon={<CheckCircle />} />
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                All Deliveries
              </h2>
              <p className="text-sm text-slate-500">
                Latest delivery orders and tracking information.
              </p>
            </div>
          </div>

          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-5 py-4">Tracking No.</th>
                  <th className="text-left px-5 py-4">Customer</th>
                  <th className="text-left px-5 py-4">Store</th>
                  <th className="text-left px-5 py-4">Courier</th>
                  <th className="text-left px-5 py-4">Payment</th>
                  <th className="text-left px-5 py-4">Status</th>
                  <th className="text-left px-5 py-4">Date</th>
                  <th className="text-right px-5 py-4">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-4 font-semibold text-slate-900">
                      {order.trackingNumber || "No tracking"}
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-900">
                        {order.user?.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {order.user?.email}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-900">
                        {order.store?.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {order.store?.contact}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      {order.courierName ? (
                        <div>
                          <div className="font-medium text-slate-900">
                            {order.courierName}
                          </div>
                          <div className="text-xs text-slate-500">
                            {order.courierPhone}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400">Not assigned</span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-medium">
                        {order.paymentMethod}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          statusStyles[order.status]
                        }`}
                      >
                        {statusLabels[order.status]}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/deliveries/${order.id}`}
                        className="inline-flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-xl transition"
                      >
                        <Eye size={16} />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="lg:hidden divide-y divide-slate-100">
            {orders.map((order) => (
              <div key={order.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-slate-500">Tracking Number</p>
                    <h3 className="font-bold text-slate-900">
                      {order.trackingNumber || "No tracking"}
                    </h3>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      statusStyles[order.status]
                    }`}
                  >
                    {statusLabels[order.status]}
                  </span>
                </div>

                <div className="mt-4 space-y-3 text-sm">
                  <p className="flex items-center gap-2 text-slate-600">
                    <User size={16} />
                    {order.user?.name}
                  </p>

                  <p className="flex items-center gap-2 text-slate-600">
                    <Store size={16} />
                    {order.store?.name}
                  </p>

                  <p className="flex items-center gap-2 text-slate-600">
                    <CreditCard size={16} />
                    {order.paymentMethod}
                  </p>

                  <p className="flex items-center gap-2 text-slate-600">
                    <Truck size={16} />
                    {order.courierName || "Courier not assigned"}
                  </p>
                </div>

                <Link
                  href={`/admin/deliveries/${order.id}`}
                  className="mt-5 inline-flex items-center justify-center gap-2 w-full bg-slate-900 hover:bg-black text-white px-4 py-3 rounded-xl transition"
                >
                  <Eye size={16} />
                  View Delivery Details
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, icon }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="w-11 h-11 rounded-xl bg-green-50 text-green-600 flex items-center justify-center mb-4">
        {icon}
      </div>
      <p className="text-sm text-slate-500">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
    </div>
  );
}