'use client'

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
  Bell,
  Star,
  RotateCcw,
  MessageSquareMore,
} from "lucide-react";

const StoreSidebar = ({ storeInfo }) => {
  const pathname = usePathname();
  const { getToken } = useAuth();

  const [questionsCount, setQuestionsCount] = useState(0);

  useEffect(() => {
    const fetchQuestionsCount = async () => {
      try {
        const token = await getToken();

        const { data } = await axios.get("/api/store/questions-count", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setQuestionsCount(data.count || 0);
      } catch (error) {
        console.error(error);
      }
    };

    fetchQuestionsCount();
  }, [getToken]);

  const sidebarLinks = [
    { name: "Dashboard", href: "/store", icon: HomeIcon },
    { name: "Add Product", href: "/store/add-product", icon: SquarePlusIcon },
    { name: "Manage Products", href: "/store/manage-product", icon: SquarePenIcon },
    { name: "Orders", href: "/store/orders", icon: LayoutListIcon },
    { name: "Returns", href: "/store/returns", icon: RotateCcw },
    { name: "Inventory", href: "/store/inventory", icon: PackageSearch },
    { name: "Reviews", href: "/store/reviews", icon: Star },
    { name: "Questions", href: "/store/questions", icon: MessageSquareMore },
    { name: "Notifications", href: "/store/notifications", icon: Bell },
  ];

  return (
    <aside className="h-full shrink-0 border-r border-slate-200 bg-white w-16 sm:w-64 overflow-y-auto">
      <div className="hidden sm:flex flex-col items-center pt-8 pb-6 border-b border-slate-100">
        <Image
          src={storeInfo?.logo || "/placeholder.png"}
          alt={storeInfo?.name || "Store"}
          width={80}
          height={80}
          className="w-16 h-16 rounded-full shadow-md object-cover"
        />

        <h2 className="mt-3 font-semibold text-slate-800 text-center px-3 line-clamp-1">
          {storeInfo?.name}
        </h2>

        <p className="text-xs text-slate-400 mt-1">Seller Dashboard</p>
      </div>

      <div className="mt-4 space-y-1">
        {sidebarLinks.map((link) => {
          const active = pathname === link.href;
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              title={link.name}
              className={`relative flex items-center justify-center sm:justify-start gap-3 py-3 px-4 sm:px-5 transition-all ${
                active
                  ? "bg-green-50 text-green-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <div className="relative">
                <Icon size={20} />

                {link.name === "Questions" && questionsCount > 0 && (
                  <span className="absolute -top-2 -right-2 sm:hidden bg-red-500 text-white text-[9px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
                    {questionsCount}
                  </span>
                )}
              </div>

              <span className="hidden sm:flex items-center justify-between flex-1">
                <span>{link.name}</span>

                {link.name === "Questions" && questionsCount > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                    {questionsCount}
                  </span>
                )}
              </span>

              {active && (
                <span className="absolute right-0 top-2 bottom-2 w-1 rounded-l bg-green-600" />
              )}
            </Link>
          );
        })}
      </div>
    </aside>
  );
};

export default StoreSidebar;