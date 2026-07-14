"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  CircleAlert,
  Clock3,
  LoaderCircle,
  Package,
  RefreshCw,
  ShoppingBag,
  XCircle,
} from "lucide-react";

function PaystackCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const reference =
    searchParams.get("reference") ||
    searchParams.get("trxref");

  const [verificationStatus, setVerificationStatus] =
    useState("VERIFYING");

  const [message, setMessage] = useState(
    "Please wait while we confirm your payment."
  );

  const [paymentData, setPaymentData] = useState(null);
  const [retrying, setRetrying] = useState(false);

  const verifyPayment = async () => {
    if (!reference) {
      setVerificationStatus("FAILED");
      setMessage(
        "The payment reference is missing. We could not verify this transaction."
      );
      return;
    }

    try {
      setRetrying(true);
      setVerificationStatus("VERIFYING");
      setMessage(
        "Please wait while we confirm your payment with Paystack."
      );

      const response = await fetch(
        `/api/payments/paystack/verify?reference=${encodeURIComponent(
          reference
        )}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (response.ok && data.status === "SUCCESSFUL") {
        setVerificationStatus("SUCCESSFUL");
        setMessage(
          data.message ||
            "Your payment has been confirmed successfully."
        );
        setPaymentData(data);
        return;
      }

      if (
        response.status === 202 ||
        data.status === "PROCESSING"
      ) {
        setVerificationStatus("PROCESSING");
        setMessage(
          data.message ||
            "Your payment is still being processed. Please check again shortly."
        );
        setPaymentData(data);
        return;
      }

      if (data.status === "CANCELLED") {
        setVerificationStatus("CANCELLED");
        setMessage(
          data.message ||
            "The payment was not completed."
        );
        setPaymentData(data);
        return;
      }

      setVerificationStatus("FAILED");
      setMessage(
        data.error ||
          data.message ||
          "We could not confirm your payment."
      );
      setPaymentData(data);
    } catch (error) {
      console.error("PAYMENT CALLBACK ERROR:", error);

      setVerificationStatus("FAILED");
      setMessage(
        "Something went wrong while confirming your payment. Please try again."
      );
    } finally {
      setRetrying(false);
    }
  };

  useEffect(() => {
    verifyPayment();
  }, [reference]);

  const orders = Array.isArray(paymentData?.orders)
    ? paymentData.orders
    : [];

  return (
    <main className="min-h-[80vh] bg-slate-50 px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
        <div
          className={`h-2 w-full ${
            verificationStatus === "SUCCESSFUL"
              ? "bg-green-500"
              : verificationStatus === "PROCESSING" ||
                verificationStatus === "VERIFYING"
              ? "bg-amber-400"
              : "bg-red-500"
          }`}
        />

        <div className="p-6 text-center sm:p-10">
          <StatusIcon status={verificationStatus} />

          <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            Paystack Payment
          </p>

          <h1 className="mt-3 text-2xl font-black text-slate-900 sm:text-4xl">
            {getStatusTitle(verificationStatus)}
          </h1>

          <p className="mx-auto mt-4 max-w-lg leading-7 text-slate-600">
            {message}
          </p>

          {reference && (
            <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Transaction reference
              </p>

              <p className="mt-2 break-all font-mono text-sm font-semibold text-slate-700">
                {reference}
              </p>
            </div>
          )}

          {verificationStatus === "SUCCESSFUL" &&
            orders.length > 0 && (
              <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5 text-left">
                <div className="flex items-center gap-3">
                  <Package
                    size={20}
                    className="text-green-700"
                  />

                  <div>
                    <p className="font-bold text-green-900">
                      {orders.length}{" "}
                      {orders.length === 1
                        ? "order"
                        : "orders"}{" "}
                      confirmed
                    </p>

                    <p className="mt-1 text-sm text-green-700">
                      Your order payment status has been
                      updated.
                    </p>
                  </div>
                </div>
              </div>
            )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            {verificationStatus === "SUCCESSFUL" && (
              <>
                <Link
                  href="/orders"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-green-600 px-7 py-3 font-semibold text-white transition hover:bg-green-700"
                >
                  <Package size={18} />
                  View My Orders
                </Link>

                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-7 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <ShoppingBag size={18} />
                  Continue Shopping
                </Link>
              </>
            )}

            {(verificationStatus === "FAILED" ||
              verificationStatus === "PROCESSING" ||
              verificationStatus === "CANCELLED") && (
              <>
                <button
                  type="button"
                  onClick={verifyPayment}
                  disabled={retrying}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-green-600 px-7 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCw
                    size={18}
                    className={
                      retrying ? "animate-spin" : ""
                    }
                  />

                  {retrying
                    ? "Checking..."
                    : "Check Payment Again"}
                </button>

                <Link
                  href="/orders"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-7 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <Package size={18} />
                  View My Orders
                </Link>
              </>
            )}
          </div>

          <p className="mt-8 text-xs leading-5 text-slate-400">
            Do not make another payment for the same order
            while a Mobile Money transaction is still being
            processed.
          </p>
        </div>
      </div>
    </main>
  );
}

function StatusIcon({ status }) {
  const commonClass =
    "mx-auto flex h-24 w-24 items-center justify-center rounded-full";

  if (status === "SUCCESSFUL") {
    return (
      <div className={`${commonClass} bg-green-100`}>
        <CheckCircle2
          size={48}
          className="text-green-600"
        />
      </div>
    );
  }

  if (status === "PROCESSING") {
    return (
      <div className={`${commonClass} bg-amber-100`}>
        <Clock3
          size={48}
          className="text-amber-600"
        />
      </div>
    );
  }

  if (status === "VERIFYING") {
    return (
      <div className={`${commonClass} bg-blue-100`}>
        <LoaderCircle
          size={48}
          className="animate-spin text-blue-600"
        />
      </div>
    );
  }

  if (status === "CANCELLED") {
    return (
      <div className={`${commonClass} bg-slate-100`}>
        <CircleAlert
          size={48}
          className="text-slate-600"
        />
      </div>
    );
  }

  return (
    <div className={`${commonClass} bg-red-100`}>
      <XCircle size={48} className="text-red-600" />
    </div>
  );
}

function getStatusTitle(status) {
  switch (status) {
    case "SUCCESSFUL":
      return "Payment Confirmed";

    case "PROCESSING":
      return "Payment Processing";

    case "CANCELLED":
      return "Payment Cancelled";

    case "FAILED":
      return "Payment Not Confirmed";

    case "VERIFYING":
    default:
      return "Verifying Payment";
  }
}

function CallbackLoading() {
  return (
    <main className="flex min-h-[80vh] items-center justify-center bg-slate-50 px-4">
      <div className="text-center">
        <LoaderCircle
          size={42}
          className="mx-auto animate-spin text-green-600"
        />

        <p className="mt-4 font-semibold text-slate-600">
          Loading payment confirmation...
        </p>
      </div>
    </main>
  );
}

export default function PaystackCallbackPage() {
  return (
    <Suspense fallback={<CallbackLoading />}>
      <PaystackCallbackContent />
    </Suspense>
  );
}