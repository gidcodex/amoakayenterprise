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
  ChevronRight,
} from "lucide-react";

export default function AccountSidebar({
  user,
  mobile = false,
  onNavigate,
}) {
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

  const handleNavigation = () => {
    if (mobile && onNavigate) {
      onNavigate();
    }
  };

  return (
    <aside
      className={
        mobile
          ? "flex min-h-full w-full flex-col bg-white px-4 py-5"
          : "w-full self-start rounded-2xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/40"
      }
    >
      {/* Profile */}
      <div
        className={
          mobile
            ? "flex items-center gap-3 rounded-2xl bg-slate-50 p-4"
            : "flex items-center gap-4 border-b border-slate-100 pb-5"
        }
      >
        <img
          src={user?.imageUrl || "/placeholder.png"}
          alt={user?.fullName || "Customer profile"}
          className={
            mobile
              ? "h-12 w-12 shrink-0 rounded-2xl object-cover"
              : "h-14 w-14 shrink-0 rounded-xl object-cover"
          }
        />

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-black text-slate-900">
            {user?.fullName ||
              user?.firstName ||
              "Customer"}
          </p>

          <p className="mt-1 truncate text-xs text-slate-500">
            {user?.primaryEmailAddress?.emailAddress}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav
        className={
          mobile
            ? "mt-5 flex-1 space-y-2"
            : "mt-5 space-y-1.5"
        }
      >
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
              onClick={handleNavigation}
              className={`group flex w-full items-center gap-3 rounded-xl px-4 py-3.5 transition-all duration-200 ${
                active
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200/60"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  active
                    ? "bg-white/15 text-white"
                    : "bg-slate-100 text-slate-600 group-hover:bg-white"
                }`}
              >
                <Icon size={19} />
              </span>

              <span className="min-w-0 flex-1 truncate text-sm font-bold">
                {link.label}
              </span>

              {mobile && (
                <ChevronRight
                  size={17}
                  className={
                    active
                      ? "text-white/80"
                      : "text-slate-300"
                  }
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Account button */}
      <div
        className={
          mobile
            ? "mt-6 border-t border-slate-100 pt-5"
            : "mt-5 border-t border-slate-100 pt-5"
        }
      >
        <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
          <UserButton />

          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-800">
              Account settings
            </p>

            <p className="text-xs text-slate-500">
              Manage profile and sign out
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}