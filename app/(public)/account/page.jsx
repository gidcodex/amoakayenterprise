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
        headers: { Authorization: `Bearer ${token}` },
      });

      setDashboardData(data.dashboardData);
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded) {
      if (user) {
        fetchDashboard();
      } else {
        router.push("/");
      }
    }
  }, [isLoaded, user]);

  if (!isLoaded || loading) return <Loading />;

  return (
    <main className="min-h-screen bg-slate-50 px-4 md:px-6 py-10">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-[280px_1fr] gap-8">
        <AccountSidebar user={user} />

        <section className="space-y-8">
          <WelcomeBanner user={user} />

          <AccountSummary
            dashboardData={dashboardData}
            currency={currency}
          />

          <RecentOrdersTable
            orders={dashboardData.recentOrders}
            currency={currency}
          />

          <div className="grid xl:grid-cols-2 gap-6">
            <QuickActions />

            <RecentActivity orders={dashboardData.recentOrders} />
          </div>
        </section>
      </div>
    </main>
  );
}