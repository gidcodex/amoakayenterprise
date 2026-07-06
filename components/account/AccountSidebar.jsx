"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Package,
  Truck,
  MapPin,
  Star,
  Heart,
  Gift,
  Headphones,
  Settings,
} from "lucide-react";

export default function AccountSidebar({ user }) {
  const links = [
    { label: "Dashboard", href: "/account", icon: LayoutDashboard, active: true },
    { label: "My Orders", href: "/orders", icon: Package },
    { label: "Track Shipment", href: "/track-order", icon: Truck },
    { label: "Addresses", href: "/cart", icon: MapPin },
    { label: "Reviews", href: "/orders", icon: Star },
    { label: "Wishlist", href: "#", icon: Heart },
    { label: "Coupons", href: "#", icon: Gift },
    { label: "Support", href: "/contact", icon: Headphones },
    { label: "Settings", href: "#", icon: Settings },
  ];

  return (
    <aside className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/60 p-6 h-fit lg:sticky lg:top-24">
      <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
        <img
          src={user?.imageUrl}
          alt="Profile"
          className="w-14 h-14 rounded-2xl object-cover"
        />

        <div className="min-w-0">
          <p className="font-bold text-slate-900 truncate">
            {user?.fullName || user?.firstName}
          </p>
          <p className="text-xs text-slate-500 truncate">
            {user?.primaryEmailAddress?.emailAddress}
          </p>
        </div>
      </div>

      <nav className="mt-6 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;

          return (
            <Link
              key={link.label}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
                link.active
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200/70"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Icon size={18} />
              <span className="font-semibold">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="pt-6 mt-6 border-t border-slate-100">
        <UserButton />
      </div>
    </aside>
  );
}