"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import toast from "react-hot-toast";
import Loading from "@/components/Loading";
import { Printer } from "lucide-react";

export default function InvoicePage() {
  const { id } = useParams();
  const { getToken } = useAuth();
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);

  const fetchInvoice = async () => {
    try {
      const token = await getToken();

      const { data } = await axios.get(`/api/orders/invoice/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrder(data.order);
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchInvoice();
  }, [id]);

  if (loading) return <Loading />;

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Invoice not found.
      </div>
    );
  }

  const subtotal = order.orderItems?.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <>
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 12mm;
          }

          body * {
            visibility: hidden;
          }

          #invoice-print-area,
          #invoice-print-area * {
            visibility: visible;
          }

          #invoice-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          .print-hide {
            display: none !important;
          }

          table,
          tr,
          td,
          th {
            page-break-inside: avoid;
          }
        }
      `}</style>

      <main className="min-h-screen bg-slate-100 px-6 py-8">
        <div className="print-hide max-w-4xl mx-auto mb-5 flex justify-end">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg font-semibold"
          >
            <Printer size={18} />
            Print Invoice
          </button>
        </div>

        <div
          id="invoice-print-area"
          className="max-w-4xl mx-auto bg-white border border-slate-200 shadow-xl p-8 text-[13px] text-slate-700"
        >
          <div className="flex justify-between items-start border-b border-slate-200 pb-5">
            <div className="flex items-start gap-4">
              {order.store?.logo ? (
                <img
                  src={order.store.logo}
                  alt={order.store?.name}
                  className="w-16 h-16 object-contain border border-slate-200 rounded-md p-1"
                />
              ) : (
                <div className="w-16 h-16 border border-slate-200 rounded-md flex items-center justify-center font-bold text-slate-800">
                  {order.store?.name?.charAt(0) || "S"}
                </div>
              )}

              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  {order.store?.name || "Store"}
                </h1>
                <p>{order.store?.address}</p>
                <p>{order.store?.contact}</p>
                <p>{order.store?.email}</p>
              </div>
            </div>

            <div className="text-right">
              <h2 className="text-3xl font-bold text-slate-900">INVOICE</h2>
              <p className="mt-2">
                <span className="font-semibold">Invoice No:</span>
                <br />
                {order.trackingNumber}
              </p>
              <p className="mt-2">
                <span className="font-semibold">Date:</span>{" "}
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mt-6">
            <div>
              <h3 className="font-bold text-slate-900 mb-2">Billed To</h3>
              <p className="font-semibold">{order.user?.name}</p>
              <p>{order.user?.email}</p>
              <p className="mt-2">
                {order.address?.street}, {order.address?.city},{" "}
                {order.address?.state}, {order.address?.zip},{" "}
                {order.address?.country}
              </p>
              <p>{order.address?.phone}</p>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 mb-2">Order Details</h3>
              <p>
                <span className="font-semibold">Payment:</span>{" "}
                {order.paymentMethod}
              </p>
              <p>
                <span className="font-semibold">Paid:</span>{" "}
                {order.isPaid ? "Yes" : "No"}
              </p>
              <p>
                <span className="font-semibold">Status:</span>{" "}
                {order.status?.replace(/_/g, " ").toLowerCase()}
              </p>
            </div>
          </div>

          <table className="w-full mt-8 border border-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-3 border-b text-left">Product</th>
                <th className="p-3 border-b text-center">Qty</th>
                <th className="p-3 border-b text-right">Price</th>
                <th className="p-3 border-b text-right">Subtotal</th>
              </tr>
            </thead>

            <tbody>
  {order.orderItems?.map((item) => {
    const productImage =
      item.variantImage ||
      item.variantImages?.[0] ||
      item.product?.images?.[0];

    return (
      <tr key={`${item.orderId}-${item.productId}`}>
        <td className="p-3 border-b">
          <div className="flex items-center gap-3">
            {productImage && (
              <img
                src={productImage}
                alt={item.product?.name}
                className="w-14 h-14 object-contain bg-slate-50 border border-slate-200 rounded-md p-1"
              />
            )}

            <div>
              <p className="font-semibold text-slate-800">
                {item.product?.name}
              </p>

              {item.variantName && item.variantValue && (
                <p className="text-xs text-blue-600 font-semibold mt-1">
                  {item.variantName}: {item.variantValue}
                </p>
              )}
            </div>
          </div>
        </td>

        <td className="p-3 border-b text-center">{item.quantity}</td>

        <td className="p-3 border-b text-right">
          {currency}
          {item.price}
        </td>

        <td className="p-3 border-b text-right font-semibold">
          {currency}
          {(item.price * item.quantity).toFixed(2)}
        </td>
      </tr>
    );
  })}
</tbody>
          </table>

          <div className="flex justify-end mt-6">
            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>
                  {currency}
                  {subtotal?.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-lg font-bold text-slate-900 border-t border-slate-200 pt-3">
                <span>Total</span>
                <span>
                  {currency}
                  {order.total}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-200 pt-4 flex justify-between text-xs text-slate-500">
            <p>Thank you for shopping with {order.store?.name || "us"}.</p>
            <p className="font-semibold">Powered by Amoakay Deals</p>
          </div>
        </div>
      </main>
    </>
  );
}