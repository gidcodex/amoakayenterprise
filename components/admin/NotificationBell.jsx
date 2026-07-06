"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Bell, Package, Mail, Store, Truck, TicketPercent } from "lucide-react";

const typeIcons = {
  ORDER: Package,
  MESSAGE: Mail,
  STORE: Store,
  COURIER: Truck,
  DELIVERY: Truck,
  COUPON: TicketPercent,
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [previousUnread, setPreviousUnread] = useState(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/admin/notifications");
      const data = await res.json();

      if (res.ok) {
        if (
          previousUnread !== null &&
          data.unreadCount > previousUnread
        ) {
          toast.success("New admin notification received.", {
            icon: "🔔",
            duration: 5000,
          });
        }

        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
        setPreviousUnread(data.unreadCount || 0);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 15000);

    return () => clearInterval(interval);
  }, [previousUnread]);

  return (
    <div className="relative">
      <button
  onClick={async () => {
    setOpen(!open);

    if (!open && unreadCount > 0) {
      await fetch("/api/admin/notifications/mark-read", {
        method: "PATCH",
      });

      setUnreadCount(0);

      setNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          isRead: true,
        }))
      );
    }
  }}
        className="relative w-11 h-11 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:bg-slate-50 transition"
      >
        <Bell
          size={20}
          className={unreadCount > 0 ? "text-green-600 animate-pulse" : "text-slate-600"}
        />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-[330px] sm:w-[380px] bg-white border border-slate-100 rounded-3xl shadow-2xl shadow-slate-300/60 overflow-hidden z-50">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900">Notifications</h3>
              <p className="text-sm text-slate-500">
                {unreadCount} unread notification(s)
              </p>
            </div>
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                No notifications yet.
              </div>
            ) : (
              notifications.map((item) => {
                const Icon = typeIcons[item.type] || Bell;

                return (
                  <Link
                    key={item.id}
                    href={item.link || "#"}
                    onClick={() => setOpen(false)}
                    className={`flex gap-4 p-4 hover:bg-slate-50 transition border-b border-slate-100 ${
                      !item.isRead ? "bg-green-50/60" : "bg-white"
                    }`}
                  >
                    <div className="w-11 h-11 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                      <Icon size={20} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="font-semibold text-slate-900">
                          {item.title}
                        </h4>

                        {!item.isRead && (
                          <span className="w-2 h-2 rounded-full bg-green-500 mt-2 shrink-0" />
                        )}
                      </div>

                      <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                        {item.message}
                      </p>

                      <p className="text-xs text-slate-400 mt-2">
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}