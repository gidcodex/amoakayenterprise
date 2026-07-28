"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";

import {
  HomeIcon,
  LayoutListIcon,
  SquarePenIcon,
  SquarePlusIcon,
  PackageSearch,
  Package,
  Bell,
  Star,
  RotateCcw,
  MessageSquareMore,
  WalletCards,
  ChevronRight,
  Store,
} from "lucide-react";

const StoreSidebar = ({
  storeInfo,
  mobile = false,
  onNavigate,
}) => {
  const pathname = usePathname();
  const { getToken } = useAuth();

  const [questionsCount, setQuestionsCount] =
    useState(0);

  useEffect(() => {
    const fetchQuestionsCount = async () => {
      try {
        const token = await getToken();

        const { data } = await axios.get(
          "/api/store/questions-count",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setQuestionsCount(data.count || 0);
      } catch (error) {
        console.error(
          "QUESTIONS COUNT ERROR:",
          error
        );
      }
    };

    fetchQuestionsCount();
  }, [getToken]);

  const sidebarLinks = [
    {
      name: "Dashboard",
      href: "/store",
      icon: HomeIcon,
    },
    {
      name: "Add Product",
      href: "/store/add-product",
      icon: SquarePlusIcon,
    },
    {
      name: "Manage Products",
      href: "/store/manage-product",
      icon: SquarePenIcon,
    },
    {
      name: "Orders",
      href: "/store/orders",
      icon: LayoutListIcon,
    },
    {
      name: "Returns",
      href: "/store/returns",
      icon: RotateCcw,
    },
    {
      name: "Inventory",
      href: "/store/inventory",
      icon: PackageSearch,
    },
    {
      name: "Variant Inventory",
      href: "/store/variant-inventory",
      icon: Package,
    },
    {
      name: "Reviews",
      href: "/store/reviews",
      icon: Star,
    },
    {
      name: "Questions",
      href: "/store/questions",
      icon: MessageSquareMore,
    },
    {
      name: "Notifications",
      href: "/store/notifications",
      icon: Bell,
    },
    {
      name: "Payout Settings",
      href: "/store/payout-settings",
      icon: WalletCards,
    },
  ];

  const isLinkActive = (href) => {
    if (href === "/store") {
      return pathname === "/store";
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  };

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
          : "h-full w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/40"
      }
    >
      {/* Store profile */}
      <div
        className={
          mobile
            ? "flex items-center gap-3 rounded-2xl bg-slate-50 p-4"
            : "flex items-center gap-4 border-b border-slate-100 pb-5"
        }
      >
        <Image
          src={
            storeInfo?.logo ||
            "/placeholder.png"
          }
          alt={storeInfo?.name || "Store"}
          width={64}
          height={64}
          className={
            mobile
              ? "h-12 w-12 shrink-0 rounded-2xl border border-slate-200 object-cover"
              : "h-14 w-14 shrink-0 rounded-2xl border border-slate-200 object-cover shadow-sm"
          }
        />

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-black text-slate-900">
            {storeInfo?.name || "My Store"}
          </h2>

          <p className="mt-1 text-xs font-medium text-slate-500">
            Seller Dashboard
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
        {sidebarLinks.map((link) => {
          const active =
            isLinkActive(link.href);

          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={handleNavigation}
              className={`group flex w-full items-center gap-3 rounded-xl px-4 py-3.5 transition-all duration-200 ${
                active
                  ? "bg-green-600 text-white shadow-md shadow-green-200/70"
                  : "text-slate-600 hover:bg-green-50 hover:text-green-700"
              }`}
            >
              <span
                className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  active
                    ? "bg-white/15 text-white"
                    : "bg-slate-100 text-slate-600 group-hover:bg-white group-hover:text-green-700"
                }`}
              >
                <Icon
                  size={19}
                  strokeWidth={
                    active ? 2.4 : 2
                  }
                />

                {link.name === "Questions" &&
                  questionsCount > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-black text-white">
                      {questionsCount > 99
                        ? "99+"
                        : questionsCount}
                    </span>
                  )}
              </span>

              <span className="min-w-0 flex-1 truncate text-sm font-bold">
                {link.name}
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

      {/* Bottom store section */}
      <div className="mt-6 border-t border-slate-100 pt-5">
        <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700">
            <Store size={19} />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-black text-slate-800">
              Store management
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Products, orders and payouts
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default StoreSidebar;