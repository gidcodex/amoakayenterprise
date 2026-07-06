import prisma from "@/lib/prisma";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  User,
  Store,
  MapPin,
  CreditCard,
  CalendarDays,
  Hash,
} from "lucide-react";
import AssignCourierBox from "./assign-courier-box";
import UpdateStatusBox from "./update-status-box";

const statusLabels = {
  ORDER_PLACED: "Order Placed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
};

const statusStyles = {
  ORDER_PLACED: "bg-blue-50 border-blue-200 text-blue-700",
  PROCESSING: "bg-yellow-50 border-yellow-200 text-yellow-700",
  SHIPPED: "bg-purple-50 border-purple-200 text-purple-700",
  DELIVERED: "bg-green-50 border-green-200 text-green-700",
};

const steps = ["ORDER_PLACED", "PROCESSING", "SHIPPED", "DELIVERED"];

export default async function DeliveryDetailsPage({ params }) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
      store: true,
      address: true,
      orderItems: { include: { product: true } },
      trackingEvents: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!order) return <div className="p-8">Delivery not found</div>;

  const currentStep = steps.indexOf(order.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <Link
          href="/admin/deliveries"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6"
        >
          <ArrowLeft size={18} />
          Back to deliveries
        </Link>

        <div className="rounded-[32px] bg-gradient-to-r from-slate-950 via-slate-900 to-green-700 text-white p-6 md:p-8 shadow-2xl shadow-slate-300/60 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <p className="text-sm font-semibold text-green-200">
                DELIVERY DETAILS
              </p>

              <h1 className="text-2xl md:text-4xl font-bold mt-3 break-all">
                {order.trackingNumber}
              </h1>

              <div className="flex flex-wrap gap-3 mt-5 text-sm">
                <span className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                  <Hash size={16} />
                  Order ID: {order.id.slice(0, 10)}...
                </span>

                <span className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                  <CalendarDays size={16} />
                  {new Date(order.createdAt).toLocaleString()}
                </span>

                <span className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                  <CreditCard size={16} />
                  {order.paymentMethod}
                </span>
              </div>
            </div>

            <span
              className={`inline-flex items-center gap-2 border px-5 py-3 rounded-full font-semibold shadow-sm bg-white ${statusStyles[order.status]}`}
            >
              <CheckCircle size={18} />
              {statusLabels[order.status]}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-[28px] p-6 md:p-7 shadow-xl shadow-slate-200/60 border border-slate-100 mb-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6">
            Delivery Progress
          </h2>

          <div className="grid md:grid-cols-4 gap-5">
            {steps.map((step, index) => (
              <div
                key={step}
                className={`rounded-3xl p-5 border transition ${
                  index <= currentStep
                    ? "bg-green-50 border-green-200"
                    : "bg-slate-50 border-slate-100"
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-4 ${
                    index <= currentStep
                      ? "bg-green-500 text-white"
                      : "bg-white text-slate-400 border"
                  }`}
                >
                  {index <= currentStep ? (
                    <CheckCircle size={20} />
                  ) : (
                    <Clock size={20} />
                  )}
                </div>

                <p className="font-bold text-slate-900">
                  {statusLabels[step]}
                </p>

                <p className="text-sm text-slate-500 mt-1">
                  {index <= currentStep ? "Completed" : "Pending"}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card title="Ordered Products" icon={<Package size={22} />}>
              {order.orderItems.length === 0 ? (
                <p className="text-slate-500">
                  No products found for this old order.
                </p>
              ) : (
                <div className="space-y-4">
                  {order.orderItems.map((item) => (
                    <div
                      key={`${item.orderId}-${item.productId}`}
                      className="flex flex-col sm:flex-row gap-5 bg-slate-50 hover:bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition"
                    >
                      <img
                        src={item.product.images?.[0]}
                        alt={item.product.name}
                        className="w-full sm:w-24 h-44 sm:h-24 rounded-2xl object-cover bg-slate-100"
                      />

                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900">
                          {item.product.name}
                        </h3>

                        <p className="text-sm text-slate-500 mt-2">
                          Quantity: {item.quantity}
                        </p>

                        <p className="text-lg font-bold text-green-600 mt-2">
                          €{item.price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card title="Tracking Timeline" icon={<Truck size={22} />}>
              <div className="relative space-y-6">
                {order.trackingEvents.map((event, index) => (
                  <div key={event.id} className="relative flex gap-4">
                    {index !== order.trackingEvents.length - 1 && (
                      <span className="absolute left-5 top-11 bottom-[-24px] w-px bg-green-200" />
                    )}

                    <div className="relative z-10 w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                      <CheckCircle size={18} />
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex-1">
                      <p className="font-bold text-slate-900">
                        {statusLabels[event.status]}
                      </p>

                      <p className="text-sm text-slate-600 mt-1">
                        {event.note || "Status updated"}
                      </p>

                      <p className="text-xs text-slate-400 mt-2">
                        {new Date(event.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <InfoCard icon={<User size={22} />} title="Customer">
              <p className="font-semibold">{order.user?.name}</p>
              <p className="text-sm text-slate-500">{order.user?.email}</p>
            </InfoCard>

            <InfoCard icon={<Store size={22} />} title="Store">
              <p className="font-semibold">{order.store?.name}</p>
              <p className="text-sm text-slate-500">{order.store?.contact}</p>
            </InfoCard>

            <InfoCard icon={<MapPin size={22} />} title="Delivery Address">
              <p className="text-sm text-slate-600 leading-6">
                {order.address?.street}, {order.address?.city},{" "}
                {order.address?.state}, {order.address?.country}
              </p>
              <p className="text-sm text-slate-500 mt-2">
                Phone: {order.address?.phone}
              </p>
            </InfoCard>

            <InfoCard icon={<CreditCard size={22} />} title="Payment">
              <p className="font-semibold">{order.paymentMethod}</p>
              <p className="text-sm text-slate-500">
                Paid: {order.isPaid ? "Yes" : "No"}
              </p>
              <p className="text-lg font-bold text-green-600 mt-2">
                €{order.total}
              </p>
            </InfoCard>

            <InfoCard icon={<Truck size={22} />} title="Courier">
              {order.courierName ? (
                <>
                  <p className="font-semibold">{order.courierName}</p>
                  <p className="text-sm text-slate-500">{order.courierPhone}</p>
                  <p className="text-sm text-slate-500">{order.courierEmail}</p>
                </>
              ) : (
                <p className="text-sm text-slate-500">
                  Courier not assigned yet.
                </p>
              )}
            </InfoCard>
             
             <AssignCourierBox
                   orderId={order.id}
                    currentCourier={{
                    name: order.courierName,
                    phone: order.courierPhone,
                    email: order.courierEmail,
                    }}
              />
              <UpdateStatusBox
               orderId={order.id}
               currentStatus={order.status}
               />

          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ icon, title, children }) {
  return (
    <div className="bg-white rounded-[28px] p-7 shadow-xl shadow-slate-200/60 border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
      <h2 className="text-xl font-bold mb-5 flex items-center gap-3 text-slate-900">
        <span className="w-11 h-11 rounded-2xl bg-green-100 flex items-center justify-center text-green-600">
          {icon}
        </span>
        {title}
      </h2>
      {children}
    </div>
  );
}

function InfoCard({ icon, title, children }) {
  return (
    <div className="bg-white rounded-[28px] p-6 shadow-xl shadow-slate-200/60 border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-start gap-4 mb-5">
        <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center text-green-600 shrink-0">
          {icon}
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500">Delivery information</p>
        </div>
      </div>

      <div className="text-slate-700">{children}</div>
    </div>
  );
}