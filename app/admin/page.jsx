'use client'

import Link from "next/link";
import Loading from "@/components/Loading";
import OrdersAreaChart from "@/components/OrdersAreaChart";
import DashboardSummary from "@/components/admin/DashboardSummary";
import DeliveryAnalytics from "@/components/admin/DeliveryAnalytics";
import TopPerformance from "@/components/admin/TopPerformance";
import RevenueGoalCard from "@/components/admin/RevenueGoalCard";
import MarketplaceStatusSwitch from "@/components/admin/MarketplaceStatusSwitch";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import {
  CircleDollarSign,
  ShoppingBasket,
  Store,
  PackageCheck,
  Truck,
  Mail,
  CreditCard,
  Tags,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const { getToken } = useAuth();
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";

  const [loading, setLoading] = useState(true);

  const [dashboardData, setDashboardData] = useState({
    products: 0,
    revenue: 0,
    orders: 0,
    stores: 0,
    activeDeliveries: 0,
    deliveredOrders: 0,
    unreadMessages: 0,
    codOrders: 0,
    stripeOrders: 0,
    recentOrders: [],
    latestNotifications: [],
    topStores: [],
    topProducts: [],
    allOrders: [],
  });

  const dashboardCardsData = [
    {
      title: "Revenue",
      value: currency + dashboardData.revenue,
      icon: CircleDollarSign,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Orders",
      value: dashboardData.orders,
      icon: Tags,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Products",
      value: dashboardData.products,
      icon: ShoppingBasket,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Stores",
      value: dashboardData.stores,
      icon: Store,
      color: "bg-orange-100 text-orange-600",
    },
    {
      title: "Active Deliveries",
      value: dashboardData.activeDeliveries,
      icon: Truck,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      title: "Delivered",
      value: dashboardData.deliveredOrders,
      icon: PackageCheck,
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      title: "Unread Messages",
      value: dashboardData.unreadMessages,
      icon: Mail,
      color: "bg-red-100 text-red-600",
    },
    {
      title: "Stripe Orders",
      value: dashboardData.stripeOrders,
      icon: CreditCard,
      color: "bg-indigo-100 text-indigo-600",
    },
  ];

  const fetchDashboardData = async () => {
    try {
      const token = await getToken();

      const { data } = await axios.get("/api/admin/dashboard", {
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
    fetchDashboardData();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="text-slate-500 pb-12">
      <h1 className="text-2xl">
        Admin <span className="text-slate-800 font-medium">Dashboard</span>
      </h1>
       
       <MarketplaceStatusSwitch />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mt-8">
        {dashboardCardsData.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">{card.title}</p>
                <h2 className="text-3xl font-bold text-slate-900 mt-2">
                  {card.value}
                </h2>
              </div>

              <div
                className={`w-16 h-16 rounded-3xl flex items-center justify-center ${card.color}`}
              >
                <card.icon size={30} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <DashboardSummary dashboardData={dashboardData} />

      <div className="bg-white rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/50 p-6 mt-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">
          Orders Overview
        </h2>

        <OrdersAreaChart allOrders={dashboardData.allOrders} />
      </div>

      <div className="grid xl:grid-cols-2 gap-6 mt-8">
        <RecentOrders orders={dashboardData.recentOrders} currency={currency} />

        <RevenueGoalCard
         revenue={dashboardData.revenue}
         currency={currency}
         monthlyGoal={dashboardData.monthlyRevenueGoal}
         />
         
      </div>

      <div className="grid xl:grid-cols-2 gap-6 mt-8">
        <DeliveryAnalytics recentOrders={dashboardData.recentOrders} />

        <ActivityFeed
          notifications={dashboardData.latestNotifications}
          orders={dashboardData.recentOrders}
        />
      </div>

      <TopPerformance dashboardData={dashboardData} currency={currency} />

      <div className="mt-8">
        <LatestNotifications
          notifications={dashboardData.latestNotifications}
        />
      </div>
    </div>
  );
}

function RecentOrders({ orders = [], currency }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/50 p-6">
      <h2 className="text-xl font-bold text-slate-900 mb-5">
        Recent Orders
      </h2>

      <div className="space-y-4">
        {orders.length > 0 ? (
          orders.map((order) => (
            <Link
              key={order.id}
              href={`/admin/deliveries/${order.id}`}
              className="block bg-slate-50 hover:bg-white border border-slate-100 rounded-2xl p-4 transition"
            >
              <div className="flex justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-900">
                    {order.trackingNumber || order.id}
                  </p>

                  <p className="text-sm text-slate-500">
                    {order.user?.name} • {order.store?.name}
                  </p>
                </div>

                <span className="font-bold text-green-600">
                  {currency}
                  {order.total}
                </span>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-sm text-slate-400">No recent orders.</p>
        )}
      </div>
    </div>
  );
}

function LatestNotifications({ notifications = [] }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/50 p-6">
      <h2 className="text-xl font-bold text-slate-900 mb-5">
        Latest Notifications
      </h2>

      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((note) => (
            <Link
              key={note.id}
              href={note.link || "#"}
              className="block bg-slate-50 hover:bg-white border border-slate-100 rounded-2xl p-4 transition"
            >
              <p className="font-semibold text-slate-900">{note.title}</p>

              <p className="text-sm text-slate-500 mt-1">
                {note.message}
              </p>

              <p className="text-xs text-slate-400 mt-2">
                {new Date(note.createdAt).toLocaleString()}
              </p>
            </Link>
          ))
        ) : (
          <p className="text-sm text-slate-400">No notifications yet.</p>
        )}
      </div>
    </div>
  );
}

function ActivityFeed({ notifications = [], orders = [] }) {
  const activities = [
    ...notifications.map((item) => ({
      id: item.id,
      title: item.title,
      text: item.message,
      date: item.createdAt,
      link: item.link || "#",
    })),
    ...orders.map((order) => ({
      id: order.id,
      title: "Recent Order",
      text: `${order.user?.name || "Customer"} placed an order from ${
        order.store?.name || "a store"
      }.`,
      date: order.createdAt,
      link: `/admin/deliveries/${order.id}`,
    })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/50 p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-slate-900">
          Recent Activity
        </h2>

        <Link
          href="/admin/notifications"
          className="text-sm font-semibold text-green-600 hover:text-green-700"
        >
          View all
        </Link>
      </div>

      <div className="space-y-4">
        {activities.length > 0 ? (
          activities.map((activity) => (
            <Link
              key={`${activity.title}-${activity.id}`}
              href={activity.link}
              className="block bg-slate-50 hover:bg-white border border-slate-100 rounded-2xl p-4 transition"
            >
              <p className="font-semibold text-slate-900">
                {activity.title}
              </p>

              <p className="text-sm text-slate-500 mt-1">
                {activity.text}
              </p>

              <p className="text-xs text-slate-400 mt-2">
                {new Date(activity.date).toLocaleString()}
              </p>
            </Link>
          ))
        ) : (
          <p className="text-sm text-slate-400">No activity yet.</p>
        )}
      </div>
    </div>
  );
}