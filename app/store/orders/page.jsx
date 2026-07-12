'use client'

import { useEffect, useState } from "react";
import Loading from "@/components/Loading";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import toast from "react-hot-toast";
import {
  User,
  MapPin,
  CreditCard,
  Truck,
  X,
  Eye,
} from "lucide-react";

const statuses = ["ORDER_PLACED", "PROCESSING", "SHIPPED", "DELIVERED"];

const statusStyles = {
  ORDER_PLACED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-yellow-100 text-yellow-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
};

export default function StoreOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [courierName, setCourierName] = useState("");
  const [courierPhone, setCourierPhone] = useState("");
  const [courierEmail, setCourierEmail] = useState("");

  const { getToken } = useAuth();
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";

  const fetchOrders = async () => {
    try {
      const token = await getToken();

      const { data } = await axios.get("/api/store/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrders(data.orders);
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const token = await getToken();

      await axios.post(
        "/api/store/orders",
        { orderId, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status } : order
        )
      );

      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status }));
      }

      toast.success("Order status updated.");
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message);
    }
  };

  const assignCourier = async (orderId) => {
    try {
      if (!courierName || !courierPhone) {
        return toast.error("Courier name and phone are required.");
      }

      const token = await getToken();

      const { data } = await axios.post(
        "/api/store/orders/assign-courier",
        {
          orderId,
          courierName,
          courierPhone,
          courierEmail,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? {
                ...order,
                courierName,
                courierPhone,
                courierEmail,
                status: "PROCESSING",
              }
            : order
        )
      );

      setSelectedOrder((prev) => ({
        ...prev,
        courierName,
        courierPhone,
        courierEmail,
        status: "PROCESSING",
      }));

      toast.success(data.message || "Courier assigned successfully.");
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message);
    }
  };

  const openOrder = (order) => {
    setSelectedOrder(order);
    setCourierName(order.courierName || "");
    setCourierPhone(order.courierPhone || "");
    setCourierEmail(order.courierEmail || "");
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="text-slate-500 pb-16">
      <div className="mb-8">
        <h1 className="text-2xl">
          Store <span className="text-slate-800 font-medium">Orders</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage customer orders, delivery status, and payment details.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-lg p-10 text-center">
          <p className="text-slate-400">No orders found.</p>
        </div>
      ) : (
        <>
        <div className="hidden lg:block bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr className="text-left text-slate-500">
                  <th className="px-6 py-4 font-semibold">Tracking No.</th>
                  <th className="px-6 py-4 font-semibold">Customer</th>
                  <th className="px-6 py-4 font-semibold">Products</th>
                  <th className="px-6 py-4 font-semibold">Total</th>
                  <th className="px-6 py-4 font-semibold">Payment</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-5">
                      <p className="font-semibold text-slate-900 max-w-[180px] truncate">
                        {order.trackingNumber || order.id}
                      </p>
                    </td>

                    <td className="px-6 py-5">
                      <p className="font-medium text-slate-800">
                        {order.user?.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {order.user?.email}
                      </p>
                    </td>

                    <td className="px-6 py-5">
                      <p className="font-medium text-slate-700">
                        {order.orderItems?.length || 0} item(s)
                      </p>
                    </td>

                    <td className="px-6 py-5 font-bold text-green-600">
                      {currency}{order.total}
                    </td>

                    <td className="px-6 py-5">
                      <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                        {order.paymentMethod}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateOrderStatus(order.id, e.target.value)
                        }
                        className={`px-3 py-2 rounded-xl text-xs font-semibold outline-none border border-transparent ${
                          statusStyles[order.status] ||
                          "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {status.replace(/_/g, " ")}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-6 py-5 text-slate-500">
                      {new Date(order.createdAt).toDateString()}
                    </td>

                    <td className="px-6 py-5 text-right">
                      <button
                        onClick={() => openOrder(order)}
                        className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-semibold transition"
                      >
                        <Eye size={16} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
         
         <div className="lg:hidden space-y-4">
           {orders.map((order) => (
           <div
             key={order.id}
                className="bg-white border border-slate-100 rounded-2xl shadow-md p-4"
            >
          <div className="flex items-start justify-between gap-3">
           <div className="min-w-0">
               <p className="text-xs text-slate-400">Tracking No.</p>
               <p className="font-bold text-slate-900 break-all">
                    {order.trackingNumber || order.id}
              </p>
         </div>

        <button
          onClick={() => openOrder(order)}
          className="shrink-0 inline-flex items-center gap-1 bg-green-600 text-white px-3 py-2 rounded-xl text-xs font-semibold"
        >
          <Eye size={14} />
          View
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="bg-slate-50 rounded-xl p-3">
          <p className="text-xs text-slate-400">Customer</p>
          <p className="font-semibold text-slate-900 line-clamp-1">
            {order.user?.name}
          </p>
          <p className="text-xs text-slate-400 line-clamp-1">
            {order.user?.email}
          </p>
        </div>

        <div className="bg-slate-50 rounded-xl p-3">
          <p className="text-xs text-slate-400">Total</p>
          <p className="font-bold text-green-600">
            {currency}{order.total}
          </p>
        </div>

        <div className="bg-slate-50 rounded-xl p-3">
          <p className="text-xs text-slate-400">Products</p>
          <p className="font-semibold text-slate-900">
            {order.orderItems?.length || 0} item(s)
          </p>
        </div>

        <div className="bg-slate-50 rounded-xl p-3">
          <p className="text-xs text-slate-400">Payment</p>
          <span className="inline-flex mt-1 px-2.5 py-1 rounded-full bg-white text-slate-600 text-xs font-semibold">
            {order.paymentMethod}
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <div>
          <p className="text-xs text-slate-400 mb-1">Status</p>
          <select
            value={order.status}
            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
            className={`w-full px-3 py-2 rounded-xl text-xs font-semibold outline-none border border-transparent ${
              statusStyles[order.status] || "bg-slate-100 text-slate-600"
            }`}
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>

        <p className="text-xs text-slate-400">
          Date: {new Date(order.createdAt).toDateString()}
        </p>
      </div>
    </div>
  ))}
        </div>
      </>
      )}

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          currency={currency}
          onClose={() => setSelectedOrder(null)}
          updateOrderStatus={updateOrderStatus}
          assignCourier={assignCourier}
          courierName={courierName}
          setCourierName={setCourierName}
          courierPhone={courierPhone}
          setCourierPhone={setCourierPhone}
          courierEmail={courierEmail}
          setCourierEmail={setCourierEmail}
        />
      )}
    </div>
  );
}

function OrderDetailsModal({
  order,
  currency,
  onClose,
  updateOrderStatus,
  assignCourier,
  courierName,
  setCourierName,
  courierPhone,
  setCourierPhone,
  courierEmail,
  setCourierEmail,
}) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-[2rem] shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 bg-slate-100 hover:bg-slate-200 p-2 rounded-full"
        >
          <X size={18} />
        </button>

        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Order Details
        </h2>

        <p className="text-sm text-slate-500 mb-6">
          Tracking: {order.trackingNumber || order.id}
        </p>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          <InfoCard icon={<User />} title="Customer">
            <p className="font-semibold">{order.user?.name}</p>
            <p className="text-sm text-slate-500">{order.user?.email}</p>
            <p className="text-sm text-slate-500">{order.address?.phone}</p>
          </InfoCard>

          <InfoCard icon={<MapPin />} title="Delivery Address">
            <p className="text-sm text-slate-600 leading-7">
              {order.address?.street}, {order.address?.city},{" "}
              {order.address?.state}, {order.address?.zip},{" "}
              {order.address?.country}
            </p>
          </InfoCard>

          <InfoCard icon={<CreditCard />} title="Payment">
            <p className="font-semibold">{order.paymentMethod}</p>
            <p className="text-sm text-slate-500">
              Paid: {order.isPaid ? "Yes" : "No"}
            </p>
            <p className="text-lg font-bold text-green-600 mt-2">
              {currency}{order.total}
            </p>
          </InfoCard>

          <InfoCard icon={<Truck />} title="Update Status">
            <select
              value={order.status}
              onChange={(e) => updateOrderStatus(order.id, e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-green-100"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </InfoCard>

          <InfoCard icon={<Truck />} title="Assign Courier">
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Courier name"
                value={courierName}
                onChange={(e) => setCourierName(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-green-100"
              />

              <input
                type="text"
                placeholder="Courier phone"
                value={courierPhone}
                onChange={(e) => setCourierPhone(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-green-100"
              />

              <input
                type="email"
                placeholder="Courier email optional"
                value={courierEmail}
                onChange={(e) => setCourierEmail(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-green-100"
              />

              <button
                onClick={() => assignCourier(order.id)}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold"
              >
                Assign Courier
              </button>
            </div>
          </InfoCard>

          <InfoCard icon={<Truck />} title="Current Courier">
  {order.courierName ? (
    <div className="space-y-1">
      <p className="font-semibold text-slate-900">{order.courierName}</p>
      <p className="text-sm text-slate-500">{order.courierPhone}</p>
      <p className="text-sm text-slate-500">
        {order.courierEmail || "No email provided"}
      </p>
    </div>
  ) : (
    <p className="text-sm text-slate-500">No courier assigned yet.</p>
  )}
</InfoCard>
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-bold text-slate-900 mb-5">
            Ordered Products
          </h3>

          <div className="space-y-4">
            {order.orderItems?.map((item, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row gap-5 bg-slate-50 border border-slate-100 rounded-3xl p-5"
              >
              
                <img
                  src={
                    item.variantImage ||
                    item.variantImages?.[0] ||
                    item.product.images?.[0]
                   }
                  alt={item.product?.name}
                  className="w-full sm:w-24 h-44 sm:h-24 object-contain rounded-2xl bg-white p-2"
                 />

                <div>
                  <p className="font-bold text-slate-900">
                    {item.product?.name}
                  </p>
                   
                   {item.variantName && item.variantValue && (
                     <div className="flex items-center gap-2 mt-2">
                       <span className="px-2 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-semibold">
                          {item.variantName}
                       </span>

                   <span className="text-sm text-slate-600">
                       {item.variantValue}
                   </span>
                      </div>
                  )}

                  <p className="text-sm text-slate-500 mt-2">
                    Quantity: {item.quantity}
                  </p>
                  <p className="text-lg font-bold text-green-600 mt-2">
                    {currency}{item.price}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-black text-white px-6 py-3 rounded-xl font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon, title, children }) {
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center">
          {icon}
        </div>
        <h3 className="font-bold text-slate-900">{title}</h3>
      </div>

      {children}
    </div>
  );
}