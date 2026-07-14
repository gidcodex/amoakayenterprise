"use client";

import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Menu,
  RefreshCw,
  ShieldCheck,
  X,
} from "lucide-react";

import Loading from "@/components/Loading";
import AccountSidebar from "@/components/account/AccountSidebar";
import WelcomeBanner from "@/components/account/WelcomeBanner";
import AccountSummary from "@/components/account/AccountSummary";
import RecentOrdersTable from "@/components/account/RecentOrdersTable";
import QuickActions from "@/components/account/QuickActions";
import RecentActivity from "@/components/account/RecentActivity";

const initialDashboardData = {
  totalOrders: 0,
  activeOrders: 0,
  deliveredOrders: 0,
  addresses: 0,
  reviews: 0,
  totalSpent: 0,
  recentOrders: [],
  recentActivity: [],
};

export default function AccountPage() {
  const { getToken } = useAuth();
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const currency =
    process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "₵";

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  const [dashboardData, setDashboardData] = useState(
    initialDashboardData
  );

  const fetchDashboard = async ({
    showLoader = false,
  } = {}) => {
    try {
      if (showLoader) {
        setRefreshing(true);
      }

      const token = await getToken();

      const { data } = await axios.get(
        "/api/account/dashboard",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setDashboardData({
        ...initialDashboardData,
        ...(data.dashboardData || {}),
      });
    } catch (error) {
      console.error("DASHBOARD FETCH ERROR:", error);

      toast.error(
        error?.response?.data?.error ||
          error?.message ||
          "Failed to load your dashboard."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      router.replace("/");
      return;
    }

    fetchDashboard();
  }, [isLoaded, user]);

  useEffect(() => {
    if (!mobileSidebarOpen) return;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [mobileSidebarOpen]);

  if (!isLoaded || loading) {
    return <Loading />;
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/70">
      {/* Mobile account toolbar */}
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() =>
              setMobileSidebarOpen(true)
            }
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
            aria-label="Open account navigation"
          >
            <Menu size={21} />
          </button>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-black text-slate-900">
              My Account
            </p>

            <p className="truncate text-xs text-slate-500">
              Welcome, {user?.firstName || "Customer"}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              fetchDashboard({
                showLoader: true,
              })
            }
            disabled={refreshing}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-green-300 hover:bg-green-50 hover:text-green-700 disabled:opacity-50"
            aria-label="Refresh account dashboard"
          >
            <RefreshCw
              size={19}
              className={
                refreshing ? "animate-spin" : ""
              }
            />
          </button>
        </div>
      </div>

      {/* Mobile sidebar drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button
            type="button"
            onClick={() =>
              setMobileSidebarOpen(false)
            }
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-[2px]"
            aria-label="Close account navigation"
          />

          <div className="absolute bottom-0 left-0 top-0 w-[86%] max-w-[320px] overflow-y-auto bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
              <div>
                <p className="font-black text-slate-900">
                  Customer Account
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Manage your shopping activity
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setMobileSidebarOpen(false)
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600"
                aria-label="Close navigation"
              >
                <X size={20} />
              </button>
            </div>

            <AccountSidebar
              user={user}
              mobile
              onNavigate={() =>
                setMobileSidebarOpen(false)
              }
            />
          </div>
        </div>
      )}

      <div className="mx-auto flex w-full max-w-[1500px] items-start gap-7 px-3 py-4 sm:px-5 sm:py-7 lg:px-7 xl:px-9">
        {/* Desktop sidebar */}
        <aside className="sticky top-6 hidden w-[270px] shrink-0 lg:block">
          <AccountSidebar user={user} />
        </aside>

        {/* Dashboard */}
        <section className="min-w-0 flex-1 space-y-5 sm:space-y-7">
          {/* Premium dashboard heading */}
          <div className="hidden items-center justify-between gap-5 rounded-3xl border border-slate-200 bg-white/80 px-6 py-5 shadow-sm backdrop-blur lg:flex">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200">
                <ShieldCheck size={23} />
              </div>

              <div>
                <p className="text-lg font-black text-slate-900">
                  Customer Dashboard
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Your orders, deliveries and account activity in one place.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                fetchDashboard({
                  showLoader: true,
                })
              }
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-green-300 hover:bg-green-50 hover:text-green-700 disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={
                  refreshing ? "animate-spin" : ""
                }
              />

              Refresh
            </button>
          </div>

          <WelcomeBanner user={user} />

          <AccountSummary
            dashboardData={dashboardData}
            currency={currency}
          />

          <RecentOrdersTable
            orders={dashboardData.recentOrders}
            currency={currency}
          />

          <div className="grid min-w-0 grid-cols-1 gap-5 sm:gap-6 xl:grid-cols-2">
            <QuickActions />

            <RecentActivity
              orders={dashboardData.recentOrders}
              activities={
                dashboardData.recentActivity
              }
            />
          </div>
        </section>
      </div>
    </main>
  );
}