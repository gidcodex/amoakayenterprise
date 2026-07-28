"use client";

import Loading from "@/components/Loading";
import {
  Bell,
  CheckCircle,
  Flame,
  Gift,
  Mail,
  Package,
  Store,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function NotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Failed to load notifications."
        );
      }

      setNotifications(data.notifications || []);
    } catch (error) {
      console.error("Fetch notifications error:", error);

      toast.error(
        error.message || "Failed to load notifications."
      );
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Unable to update notifications."
        );
      }

      setNotifications((previousNotifications) =>
        previousNotifications.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );
    } catch (error) {
      console.error("Mark notifications read error:", error);
    }
  };

  useEffect(() => {
    const loadNotifications = async () => {
      await fetchNotifications();
      await markAllAsRead();
    };

    loadNotifications();
  }, []);

  const getNotificationAppearance = (notification) => {
    const unread = !notification.isRead;

    switch (notification.type) {
      case "FLASH_DEAL":
        return {
          Icon: Flame,
          iconClass: unread
            ? "bg-red-100 text-red-600"
            : "bg-red-50 text-red-500",
          dotClass: "bg-red-500",
          cardClass: unread
            ? "bg-red-50/50"
            : "bg-white",
          buttonText: "View Deal",
          buttonClass:
            "bg-red-600 text-white hover:bg-red-700",
        };

      case "DELIVERY":
      case "COURIER":
        return {
          Icon: Truck,
          iconClass: unread
            ? "bg-emerald-100 text-emerald-600"
            : "bg-slate-100 text-slate-500",
          dotClass: "bg-emerald-500",
          cardClass: unread
            ? "bg-emerald-50/40"
            : "bg-white",
          buttonText: "View Update",
          buttonClass:
            "bg-emerald-600 text-white hover:bg-emerald-700",
        };

      case "ORDER":
        return {
          Icon: Package,
          iconClass: unread
            ? "bg-blue-100 text-blue-600"
            : "bg-slate-100 text-slate-500",
          dotClass: "bg-blue-600",
          cardClass: unread
            ? "bg-blue-50/40"
            : "bg-white",
          buttonText: "View Order",
          buttonClass:
            "bg-blue-600 text-white hover:bg-blue-700",
        };

      case "COUPON":
        return {
          Icon: Gift,
          iconClass: unread
            ? "bg-violet-100 text-violet-600"
            : "bg-slate-100 text-slate-500",
          dotClass: "bg-violet-500",
          cardClass: unread
            ? "bg-violet-50/40"
            : "bg-white",
          buttonText: "View Offer",
          buttonClass:
            "bg-violet-600 text-white hover:bg-violet-700",
        };

      case "STORE":
        return {
          Icon: Store,
          iconClass: unread
            ? "bg-amber-100 text-amber-600"
            : "bg-slate-100 text-slate-500",
          dotClass: "bg-amber-500",
          cardClass: unread
            ? "bg-amber-50/40"
            : "bg-white",
          buttonText: "View Details",
          buttonClass:
            "bg-amber-600 text-white hover:bg-amber-700",
        };

      case "MESSAGE":
        return {
          Icon: Mail,
          iconClass: unread
            ? "bg-cyan-100 text-cyan-600"
            : "bg-slate-100 text-slate-500",
          dotClass: "bg-cyan-500",
          cardClass: unread
            ? "bg-cyan-50/40"
            : "bg-white",
          buttonText: "View Message",
          buttonClass:
            "bg-cyan-600 text-white hover:bg-cyan-700",
        };

      default:
        return {
          Icon: notification.isRead
            ? CheckCircle
            : Bell,
          iconClass: unread
            ? "bg-blue-100 text-blue-600"
            : "bg-slate-100 text-slate-500",
          dotClass: "bg-blue-600",
          cardClass: unread
            ? "bg-blue-50/40"
            : "bg-white",
          buttonText: "View Details",
          buttonClass:
            "bg-slate-900 text-white hover:bg-slate-800",
        };
    }
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(date));
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
                Customer Center
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Notifications
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                View order updates, delivery alerts, messages,
                coupons and Flash Deals for your saved products.
              </p>
            </div>

            <div className="w-fit border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm">
              {notifications.length} notification
              {notifications.length === 1 ? "" : "s"}
            </div>
          </div>
        </header>

        <section className="overflow-hidden border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
          {notifications.length > 0 ? (
            notifications.map((notification) => {
              const {
                Icon,
                iconClass,
                dotClass,
                cardClass,
                buttonText,
                buttonClass,
              } = getNotificationAppearance(notification);

              const content = (
                <article
                  className={`border-b border-slate-100 p-5 transition last:border-b-0 sm:p-6 ${cardClass} ${
                    notification.link
                      ? "hover:bg-slate-50"
                      : ""
                  }`}
                >
                  <div className="flex gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
                    >
                      <Icon size={21} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="font-black text-slate-900">
                              {notification.title}
                            </h2>

                            {notification.type ===
                              "FLASH_DEAL" && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-red-600">
                                <Flame size={12} />
                                Flash Deal
                              </span>
                            )}
                          </div>

                          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                            {notification.message}
                          </p>
                        </div>

                        {!notification.isRead && (
                          <span
                            className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${dotClass}`}
                          />
                        )}
                      </div>

                      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <time className="text-xs font-medium text-slate-400">
                          {formatDate(notification.createdAt)}
                        </time>

                        {notification.link && (
                          <span
                            className={`inline-flex w-fit items-center justify-center rounded-lg px-4 py-2 text-xs font-black transition ${buttonClass}`}
                          >
                            {buttonText}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );

              if (!notification.link) {
                return (
                  <div key={notification.id}>
                    {content}
                  </div>
                );
              }

              return (
                <Link
                  key={notification.id}
                  href={notification.link}
                  className="block"
                >
                  {content}
                </Link>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Bell size={28} />
              </div>

              <h2 className="mt-5 text-xl font-black text-slate-900">
                No notifications yet
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                Order updates, delivery alerts and Flash Deals for
                your saved products will appear here.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}