"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";

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
} from "lucide-react";

const StoreSidebar = ({
  storeInfo,
  mobile = false,
  onNavigate,
}) => {
  const pathname = usePathname();
  const { getToken } = useAuth();

  const [questionsCount, setQuestionsCount] = useState(0);

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
        console.error(error);
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
  ];

  const isLinkActive = (href) => {
    if (href === "/store") {
      return pathname === "/store";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside
      className={`h-full shrink-0 overflow-y-auto border-r border-slate-200 bg-white ${
        mobile ? "w-full" : "w-[68px] sm:w-64"
      }`}
    >
      <div className="border-b border-slate-100 px-2 py-4 sm:px-5 sm:py-7">
        <div className="flex items-center justify-center sm:justify-start sm:gap-3">
          <Image
            src={storeInfo?.logo || "/placeholder.png"}
            alt={storeInfo?.name || "Store"}
            width={64}
            height={64}
            className="h-10 w-10 rounded-xl border border-slate-200 object-cover shadow-sm sm:h-14 sm:w-14 sm:rounded-2xl"
          />

          <div className="hidden min-w-0 sm:block">
            <h2 className="truncate font-bold text-slate-900">
              {storeInfo?.name || "My Store"}
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Seller Dashboard
            </p>
          </div>
        </div>
      </div>

      <nav className="space-y-1 px-2 py-4 sm:px-3">
        {sidebarLinks.map((link) => {
          const active = isLinkActive(link.href);
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              title={link.name}
              aria-label={link.name}
              className={`group relative flex min-h-12 items-center justify-center rounded-xl px-2 py-3 transition sm:justify-start sm:gap-3 sm:px-4 ${
                active
                  ? "bg-green-50 text-green-700 shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-green-700"
              }`}
            >
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center">
                <Icon
                  size={20}
                  strokeWidth={active ? 2.4 : 2}
                />

                {link.name === "Questions" &&
                  questionsCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white sm:hidden">
                      {questionsCount > 99
                        ? "99+"
                        : questionsCount}
                    </span>
                  )}
              </div>

              <span className="hidden min-w-0 flex-1 items-center justify-between sm:flex">
                <span className="truncate text-sm font-semibold">
                  {link.name}
                </span>

                {link.name === "Questions" &&
                  questionsCount > 0 && (
                    <span className="ml-2 flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                      {questionsCount > 99
                        ? "99+"
                        : questionsCount}
                    </span>
                  )}
              </span>

              {active && (
                <span className="absolute bottom-2 right-0 top-2 w-1 rounded-l-full bg-green-600" />
              )}

              {!mobile && (
                <span className="pointer-events-none absolute left-full z-50 ml-3 hidden whitespace-nowrap rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white shadow-xl group-hover:block sm:hidden">
                  {link.name}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default StoreSidebar;