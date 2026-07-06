"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import Link from "next/link";

export default function SellerNotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/store/notifications");
      const data = await res.json();

      if (res.ok) {
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Link
      href="/store/notifications"
      className="relative w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition"
    >
      <Bell size={19} />

      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
          {unreadCount}
        </span>
      )}
    </Link>
  );
}