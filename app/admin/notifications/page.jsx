"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Bell,
  CheckCircle,
  Package,
  Store,
  Mail,
  Truck,
  TicketPercent,
} from "lucide-react";
import Loading from "@/components/Loading";

export default function AdminNotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/admin/notifications");
      const data = await res.json();

      if (res.ok) {
        setNotifications(data.notifications);
      } else {
        toast.error(data.error || "Failed to load notifications.");
      }
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      await fetch("/api/admin/notifications", {
        method: "PATCH",
      });

      setNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          isRead: true,
        }))
      );
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    markAsRead();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="text-slate-500 pb-12">
      <div className="mb-8">
        <p className="text-sm font-semibold text-green-600">
          ADMIN CENTER
        </p>

        <h1 className="text-3xl font-bold text-slate-900 mt-2">
          Notifications
        </h1>

        <p className="text-slate-500 mt-2">
          View marketplace alerts, orders, store applications, messages, and delivery updates.
        </p>
      </div>

      <div className="bg-white border border-slate-100 shadow-xl shadow-slate-200/60 rounded-xl overflow-hidden max-w-5xl">
        {notifications.length > 0 ? (
          notifications.map((note) => (
            <Link
              key={note.id}
              href={note.link || "#"}
              className="flex gap-4 p-5 border-b border-slate-100 hover:bg-slate-50 transition"
            >
              <div
                className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${
                  note.isRead
                    ? "bg-slate-100 text-slate-500"
                    : "bg-green-100 text-green-600"
                }`}
              >
                <NotificationIcon type={note.type} isRead={note.isRead} />
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-bold text-slate-900">{note.title}</p>

                  {!note.isRead && (
                    <span className="w-2.5 h-2.5 rounded-full bg-green-600" />
                  )}
                </div>

                <p className="text-sm text-slate-500 mt-1">{note.message}</p>

                <p className="text-xs text-slate-400 mt-2">
                  {new Date(note.createdAt).toLocaleString()}
                </p>
              </div>
            </Link>
          ))
        ) : (
          <div className="p-10 text-center text-slate-400">
            No admin notifications yet.
          </div>
        )}
      </div>
    </div>
  );
}

function NotificationIcon({ type, isRead }) {
  if (type === "ORDER") return <Package size={20} />;
  if (type === "STORE") return <Store size={20} />;
  if (type === "MESSAGE") return <Mail size={20} />;
  if (type === "DELIVERY") return <Truck size={20} />;
  if (type === "COUPON") return <TicketPercent size={20} />;

  return isRead ? <CheckCircle size={20} /> : <Bell size={20} />;
}