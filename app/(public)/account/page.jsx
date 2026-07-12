"use client";

import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

import Loading from "@/components/Loading";
import AccountSidebar from "@/components/account/AccountSidebar";
import WelcomeBanner from "@/components/account/WelcomeBanner";
import AccountSummary from "@/components/account/AccountSummary";
import RecentOrdersTable from "@/components/account/RecentOrdersTable";
import QuickActions from "@/components/account/QuickActions";
import RecentActivity from "@/components/account/RecentActivity";

export default function AccountPage() {
  const { getToken } = useAuth();
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";

  const [loading, setLoading] = useState(true);

  const [dashboardData, setDashboardData] = useState({
    totalOrders: 0,
    activeOrders: 0,
    deliveredOrders: 0,
    addresses: 0,
    reviews: 0,
    totalSpent: 0,
    recentOrders: [],
  });

  const fetchDashboard = async () => {
    try {
      const token = await getToken();

      const { data } = await axios.get("/api/account/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDashboardData(data.dashboardData);
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      router.push("/");
      return;
    }

    fetchDashboard();
  }, [isLoaded, user, router]);

  if (!isLoaded || loading) {
    return <Loading />;
  }

  return (
  <main className="min-h-screen bg-slate-50 px-0 sm:px-4 md:px-6 py-4 sm:py-8 overflow-x-hidden">
    <div className="max-w-7xl mx-auto grid grid-cols-[64px_minmax(0,1fr)] sm:grid-cols-[80px_minmax(0,1fr)] lg:grid-cols-[280px_minmax(0,1fr)] items-start gap-3 sm:gap-5 lg:gap-8">
      <AccountSidebar user={user} />

      <section className="min-w-0 pr-3 sm:pr-0 space-y-5 sm:space-y-8">
        <WelcomeBanner user={user} />

        <AccountSummary
          dashboardData={dashboardData}
          currency={currency}
        />

        <RecentOrdersTable
          orders={dashboardData.recentOrders}
          currency={currency}
        />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 sm:gap-6">
          <QuickActions />

          <RecentActivity orders={dashboardData.recentOrders} />
        </div>
      </section>
    </div>
  </main>
);
}