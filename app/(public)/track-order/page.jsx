"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import {
  Search,
  Package,
  Truck,
  CheckCircle,
  Clock,
  Store,
  MapPin,
  CreditCard,
  HelpCircle,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const statusLabels = {
  ORDER_PLACED: "Order Placed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
};

const steps = ["ORDER_PLACED", "PROCESSING", "SHIPPED", "DELIVERED"];

export default function TrackOrderPage() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openSection, setOpenSection] = useState("summary");

  const previousStatus = useRef(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const tracking = searchParams.get("tracking");
    if (tracking) setTrackingNumber(tracking);
  }, [searchParams]);

  const handleTrack = async (e) => {
    e.preventDefault();

    if (!trackingNumber.trim()) {
      toast.error("Please enter your tracking number.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Searching for your shipment...");

    try {
      const res = await fetch("/api/track-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingNumber }),
      });

      const data = await res.json();

      if (res.ok) {
        setOrder(data.order);
        setOpenSection("summary");
        toast.success("Shipment found successfully.", { id: toastId });
      } else {
        setOrder(null);
        toast.error(data.error || "Order not found.", { id: toastId });
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!order?.trackingNumber) return;

    const checkStatus = async () => {
      try {
        const res = await fetch("/api/track-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ trackingNumber: order.trackingNumber }),
        });

        const data = await res.json();

        if (res.ok) {
          if (
            previousStatus.current &&
            previousStatus.current !== data.order.status
          ) {
            toast.success(
              `Your order status changed to ${statusLabels[data.order.status]}.`,
              { duration: 6000 }
            );
          }

          previousStatus.current = data.order.status;
          setOrder(data.order);
        }
      } catch (error) {
        console.error(error);
      }
    };

    previousStatus.current = order.status;
    const interval = setInterval(checkStatus, 10000);

    return () => clearInterval(interval);
  }, [order?.trackingNumber]);

  const currentStep = order ? steps.indexOf(order.status) : -1;
  const progressPercent =
    currentStep >= 0 ? Math.round(((currentStep + 1) / steps.length) * 100) : 0;

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <span className="inline-flex bg-blue-100 text-blue-700 px-5 py-2 rounded-full text-sm font-semibold">
            TRACK SHIPMENT
          </span>

          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mt-6">
            Track Your Package
          </h1>

          <p className="text-slate-500 mt-5 max-w-2xl mx-auto leading-7">
            Enter your tracking number to view shipment status, courier details,
            delivery progress, and tracking history.
          </p>
        </div>

        <form
          onSubmit={handleTrack}
          className="bg-white border border-slate-100 rrounded-xl shadow-xl shadow-slate-200/70 p-5 md:p-7 flex flex-col md:flex-row gap-4"
        >
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Enter tracking number e.g. AMK-1783053974006-355"
            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-5 py-4 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Search size={18} />
            )}
            {loading ? "Tracking..." : "Track"}
          </button>
        </form>

        {order && (
          <div className="mt-10">
            <div className="bg-white border border-slate-100 rounded-xl shadow-xl shadow-slate-200/70 overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 p-6 md:p-8">
                <p className="text-slate-800 text-sm font-bold">
                  SHIPMENT STATUS
                </p>

                <h2 className="text-3xl md:text-4xl font-black text-slate-950 mt-2">
                  {statusLabels[order.status]}
                </h2>

                <p className="text-slate-700 mt-3 break-all">
                  Tracking Number:{" "}
                  <span className="font-bold">{order.trackingNumber}</span>
                </p>
              </div>

              <div className="p-6 md:p-8">
                <div className="flex justify-between text-sm font-semibold text-slate-600 mb-3">
                  <span>Delivery Progress</span>
                  <span>{progressPercent}%</span>
                </div>

                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="grid grid-cols-4 gap-3 mt-6">
                  {steps.map((step, index) => (
                    <div key={step} className="text-center">
                      <div
                        className={`mx-auto w-10 h-10 rounded-full flex items-center justify-center ${
                          index <= currentStep
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {index <= currentStep ? (
                          <CheckCircle size={18} />
                        ) : (
                          <Clock size={18} />
                        )}
                      </div>
                      <p className="text-xs font-semibold text-slate-600 mt-2">
                        {statusLabels[step]}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Accordion
              title="Shipment Summary"
              icon={<Package />}
              open={openSection === "summary"}
              onClick={() =>
                setOpenSection(openSection === "summary" ? "" : "summary")
              }
            >
              <div className="grid md:grid-cols-3 gap-5">
                <SummaryBox label="Status" value={statusLabels[order.status]} />
                <SummaryBox
                  label="Estimated Delivery"
                  value={order.status === "DELIVERED" ? "Delivered" : "In progress"}
                />
                <SummaryBox label="Payment" value={order.paymentMethod} />
              </div>
            </Accordion>

            <Accordion
              title="Tracking History"
              icon={<Truck />}
              open={openSection === "history"}
              onClick={() =>
                setOpenSection(openSection === "history" ? "" : "history")
              }
            >
              <div className="space-y-5">
                {order.trackingEvents?.length > 0 ? (
                  order.trackingEvents.map((event, index) => (
                    <div key={event.id} className="relative flex gap-4">
                      {index !== order.trackingEvents.length - 1 && (
                        <span className="absolute left-5 top-11 bottom-[-20px] w-px bg-blue-200" />
                      )}

                      <div className="relative z-10 w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                        <CheckCircle size={18} />
                      </div>

                      <div>
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
                  ))
                ) : (
                  <p className="text-sm text-slate-500">
                    No tracking updates yet.
                  </p>
                )}
              </div>
            </Accordion>

            <Accordion
              title="Courier Details"
              icon={<Truck />}
              open={openSection === "courier"}
              onClick={() =>
                setOpenSection(openSection === "courier" ? "" : "courier")
              }
            >
              {order.courierName ? (
                <div className="grid md:grid-cols-3 gap-5">
                  <SummaryBox label="Courier" value={order.courierName} />
                  <SummaryBox label="Phone" value={order.courierPhone} />
                  <SummaryBox
                    label="Email"
                    value={order.courierEmail || "Not provided"}
                  />
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  Courier has not been assigned yet.
                </p>
              )}
            </Accordion>

            <Accordion
              title="Store, Address & Payment"
              icon={<Store />}
              open={openSection === "details"}
              onClick={() =>
                setOpenSection(openSection === "details" ? "" : "details")
              }
            >
              <div className="grid md:grid-cols-2 gap-5">
                <InfoPanel icon={<Store />} title="Store">
                  <p className="font-semibold">{order.store?.name}</p>
                  <p className="text-sm text-slate-500">{order.store?.contact}</p>
                </InfoPanel>

                <InfoPanel icon={<CreditCard />} title="Payment">
                  <p className="font-semibold">{order.paymentMethod}</p>
                  <p className="text-sm text-slate-500">
                    Paid: {order.isPaid ? "Yes" : "No"}
                  </p>
                </InfoPanel>

                <InfoPanel icon={<MapPin />} title="Delivery Address">
                  <p className="text-sm text-slate-600 leading-7">
                    {order.address?.street}, {order.address?.city},{" "}
                    {order.address?.state}, {order.address?.country}
                  </p>
                  <p className="text-sm text-slate-500 mt-2">
                    Phone: {order.address?.phone}
                  </p>
                </InfoPanel>

                <InfoPanel icon={<HelpCircle />} title="Need Help?">
                  <p className="text-sm text-slate-600 leading-7">
                    Contact the store or support team if there is an issue with
                    your package.
                  </p>

                  <div className="flex flex-wrap gap-3 mt-4">
                    <span className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
                      <Phone size={15} />
                      {order.store?.contact || "Support"}
                    </span>

                    <span className="inline-flex items-center gap-2 bg-slate-50 text-slate-700 px-4 py-2 rounded-full text-sm font-semibold">
                      <Mail size={15} />
                      {order.store?.email || "support@amoakaydeals.com"}
                    </span>
                  </div>
                </InfoPanel>
              </div>
            </Accordion>

            <Accordion
              title="Ordered Products"
              icon={<Package />}
              open={openSection === "products"}
              onClick={() =>
                setOpenSection(openSection === "products" ? "" : "products")
              }
            >
              <div className="space-y-4">
                {order.orderItems?.map((item) => (
                  <div
                    key={`${item.orderId}-${item.productId}`}
                    className="flex flex-col sm:flex-row gap-5 bg-slate-50 border border-slate-100 rounded-xl p-5"
                  >
                    <img
                      src={item.product.images?.[0]}
                      alt={item.product.name}
                      className="w-full sm:w-24 h-44 sm:h-24 object-cover rounded-md bg-slate-100"
                    />

                    <div>
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
            </Accordion>
          </div>
        )}
      </section>
    </main>
  );
}

function Accordion({ title, icon, open, onClick, children }) {
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-lg shadow-slate-200/50 overflow-hidden mb-5">
      <button
        type="button"
        onClick={onClick}
        className="w-full flex items-center justify-between gap-4 p-6 text-left"
      >
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
            {icon}
          </div>

          <h2 className="text-lg md:text-xl font-bold text-slate-900">
            {title}
          </h2>
        </div>

        {open ? (
          <ChevronUp className="text-slate-400" />
        ) : (
          <ChevronDown className="text-slate-400" />
        )}
      </button>

      {open && <div className="px-6 pb-6">{children}</div>}
    </div>
  );
}

function SummaryBox({ label, value }) {
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-lg p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="font-bold text-slate-900 mt-2">{value}</p>
    </div>
  );
}

function InfoPanel({ icon, title, children }) {
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
          {icon}
        </div>
        <h3 className="font-bold text-slate-900">{title}</h3>
      </div>

      {children}
    </div>
  );
}