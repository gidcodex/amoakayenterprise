"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();

  const links = [
    {
      label: "Dashboard",
      href: "/account",
      icon: LayoutDashboard,
    },
    {
      label: "My Orders",
      href: "/orders",
      icon: Package,
    },
    {
      label: "Track Shipment",
      href: "/track-order",
      icon: Truck,
    },
    {
      label: "Addresses",
      href: "/cart",
      icon: MapPin,
    },
    {
      label: "Reviews",
      href: "/orders",
      icon: Star,
    },
    {
      label: "Wishlist",
      href: "/wishlist",
      icon: Heart,
    },
    {
      label: "Coupons",
      href: "#",
      icon: Gift,
    },
    {
      label: "Support",
      href: "/contact",
      icon: Headphones,
    },
    {
      label: "Settings",
      href: "#",
      icon: Settings,
    },
  ];

  return (
    <aside className="w-16 sm:w-20 lg:w-full self-start shrink-0 bg-white border border-slate-200 rounded-xl sm:rounded-2xl shadow-lg shadow-slate-200/40 p-2 sm:p-3 lg:p-5">
      {/* Desktop profile */}
      <div className="hidden lg:flex items-center gap-4 pb-5 border-b border-slate-100">
        <img
          src={user?.imageUrl}
          alt={user?.fullName || "Customer profile"}
          className="w-14 h-14 rounded-xl object-cover shrink-0"
        />

        <div className="min-w-0">
          <p className="font-bold text-slate-900 truncate">
            {user?.fullName || user?.firstName || "Customer"}
          </p>

          <p className="text-xs text-slate-500 truncate">
            {user?.primaryEmailAddress?.emailAddress}
          </p>
        </div>
      </div>

      <nav className="mt-1 lg:mt-5 space-y-1.5">
        {links.map((link) => {
          const Icon = link.icon;

          const active =
            pathname === link.href ||
            (link.href !== "#" &&
              link.href !== "/" &&
              pathname.startsWith(`${link.href}/`));

          return (
            <Link
              key={link.label}
              href={link.href}
              title={link.label}
              className={`relative flex items-center justify-center lg:justify-start gap-3 px-2 lg:px-4 py-3 rounded-lg lg:rounded-xl transition-all duration-200 ${
                active
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200/60"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon size={21} className="shrink-0" />

              <span className="hidden lg:inline font-semibold">
                {link.label}
              </span>

              {active && (
                <span className="lg:hidden absolute right-0 top-2 bottom-2 w-1 rounded-l bg-blue-600" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="flex justify-center lg:justify-start pt-4 lg:pt-5 mt-4 lg:mt-5 border-t border-slate-100">
        <UserButton />
      </div>
    </aside>
  );
}