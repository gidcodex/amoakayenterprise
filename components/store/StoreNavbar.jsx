"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import SellerNotificationBell from "./SellerNotificationBell";

const StoreNavbar = ({
  mobileSidebarOpen = false,
  onToggleMobileSidebar,
}) => {
  const { user } = useUser();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="flex min-h-[72px] items-center justify-between gap-3 px-3 py-3 sm:px-5 lg:px-8 xl:px-12">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          {/* Mobile sidebar toggle */}
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-green-300 hover:bg-green-50 hover:text-green-700 md:hidden"
            aria-label={
              mobileSidebarOpen
                ? "Close seller navigation"
                : "Open seller navigation"
            }
            aria-expanded={mobileSidebarOpen}
          >
            {mobileSidebarOpen ? (
              <X size={21} />
            ) : (
              <Menu size={21} />
            )}
          </button>

          {/* Logo */}
          <Link
            href="/"
            className="relative inline-flex shrink-0 items-end pr-10 sm:pr-12"
            aria-label="GoCart homepage"
          >
            <span className="whitespace-nowrap text-2xl font-semibold tracking-tight text-slate-700 sm:text-3xl lg:text-4xl">
              <span className="text-green-600">go</span>
              cart
              <span className="ml-0.5 text-3xl leading-none text-green-600 sm:text-4xl lg:text-5xl">
                .
              </span>
            </span>

            <span className="absolute right-0 top-[-4px] rounded-full bg-green-500 px-2 py-0.5 text-[9px] font-bold text-white sm:px-3 sm:text-[11px]">
              Store
            </span>
          </Link>
        </div>

        {/* Right-side controls */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-3 lg:gap-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100">
            <SellerNotificationBell />
          </div>

          <p className="hidden max-w-[170px] truncate text-slate-600 md:block">
            Hi,{" "}
            <span className="font-semibold text-slate-800">
              {user?.firstName || "Seller"}
            </span>
          </p>

          <div className="shrink-0">
            <UserButton />
          </div>
        </div>
      </div>
    </header>
  );
};

export default StoreNavbar;