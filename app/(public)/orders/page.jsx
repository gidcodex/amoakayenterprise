"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

import Loading from "@/components/Loading";
import OrderItem from "@/components/OrderItem";

const tabs = [
  { label: "All", value: "ALL" },
  { label: "Unpaid", value: "UNPAID" },
  { label: "In progress", value: "IN_PROGRESS" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export default function Orders() {
  const { getToken } = useAuth();
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = await getToken();

        const { data } = await axios.get("/api/orders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setOrders(data.orders || []);
      } catch (error) {
        toast.error(error?.response?.data?.error || error.message);
      } finally {
        setLoading(false);
      }
    };

    if (!isLoaded) return;

    if (!user) {
      router.push("/");
      return;
    }

    fetchOrders();
  }, [isLoaded, user, getToken, router]);

  const getTabCount = (tab) => {
    if (tab === "ALL") return orders.length;

    if (tab === "UNPAID") {
      return orders.filter(
        (order) =>
          order.paymentMethod === "STRIPE" &&
          !order.isPaid &&
          order.status !== "CANCELLED"
      ).length;
    }

    if (tab === "IN_PROGRESS") {
      return orders.filter((order) =>
        ["ORDER_PLACED", "PROCESSING", "SHIPPED"].includes(order.status)
      ).length;
    }

    if (tab === "COMPLETED") {
      return orders.filter((order) => order.status === "DELIVERED").length;
    }

    if (tab === "CANCELLED") {
      return orders.filter((order) => order.status === "CANCELLED").length;
    }

    return 0;
  };

  const filteredOrders = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return orders.filter((order) => {
      let matchesTab = true;

      if (activeTab === "UNPAID") {
        matchesTab =
          order.paymentMethod === "STRIPE" &&
          !order.isPaid &&
          order.status !== "CANCELLED";
      }

      if (activeTab === "IN_PROGRESS") {
        matchesTab = ["ORDER_PLACED", "PROCESSING", "SHIPPED"].includes(
          order.status
        );
      }

      if (activeTab === "COMPLETED") {
        matchesTab = order.status === "DELIVERED";
      }

      if (activeTab === "CANCELLED") {
        matchesTab = order.status === "CANCELLED";
      }

      if (!matchesTab) return false;
      if (!normalizedQuery) return true;

      const orderNumber = String(
        order.trackingNumber || order.id || ""
      ).toLowerCase();

      const storeName = String(order.store?.name || "").toLowerCase();

      const productMatch = order.orderItems?.some((item) =>
        String(item.product?.name || "")
          .toLowerCase()
          .includes(normalizedQuery)
      );

      return (
        orderNumber.includes(normalizedQuery) ||
        storeName.includes(normalizedQuery) ||
        productMatch
      );
    });
  }, [orders, activeTab, searchQuery]);

  const handleSearch = (event) => {
    event.preventDefault();
    setSearchQuery(searchInput);
  };

  if (!isLoaded || loading) return <Loading />;

  return (
    <main className="min-h-screen bg-slate-50 px-3 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-7xl">
        <section className="border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-4 py-6 sm:px-7 sm:py-8">
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              My Orders
            </h1>

            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              View your purchases, monitor delivery progress, download invoices,
              request returns and buy products again.
            </p>
          </div>

          <div className="border-b border-slate-200 px-4 py-4 sm:px-7">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="-mx-1 overflow-x-auto pb-1">
                <div className="flex min-w-max items-center gap-6 px-1 sm:gap-8">
                  {tabs.map((tab) => {
                    const active = activeTab === tab.value;
                    const count = getTabCount(tab.value);

                    return (
                      <button
                        key={tab.value}
                        type="button"
                        onClick={() => setActiveTab(tab.value)}
                        className={`relative whitespace-nowrap pb-3 text-sm font-semibold transition sm:text-base ${
                          active
                            ? "text-slate-900"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        <span>{tab.label}</span>

                        <span
                          className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                            active
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {count}
                        </span>

                        {active && (
                          <span className="absolute bottom-0 left-0 h-0.5 w-full bg-green-600" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <form
                onSubmit={handleSearch}
                className="flex w-full overflow-hidden border border-slate-300 bg-white xl:max-w-xl"
              >
                <input
                  type="text"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Product name, store or order ID"
                  className="min-w-0 flex-1 px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />

                <button
                  type="submit"
                  className="flex w-14 shrink-0 items-center justify-center bg-slate-900 text-white transition hover:bg-green-600"
                  aria-label="Search orders"
                >
                  <Search size={21} />
                </button>
              </form>
            </div>
          </div>

          <div className="space-y-5 bg-slate-50 p-3 sm:space-y-6 sm:p-6">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <OrderItem order={order} key={order.id} />
              ))
            ) : (
              <div className="border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
                <h2 className="text-xl font-bold text-slate-800">
                  No matching orders
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  No orders were found under this category or search. Try a
                  different status or search term.
                </p>

                {(activeTab !== "ALL" || searchQuery) && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("ALL");
                      setSearchInput("");
                      setSearchQuery("");
                    }}
                    className="mt-6 bg-gradient-to-r from-green-600 to-emerald-500 px-6 py-3 text-sm font-semibold text-white transition hover:from-green-700 hover:to-emerald-600"
                  >
                    Show all orders
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}