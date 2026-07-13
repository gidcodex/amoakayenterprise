"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import AdminNotificationBell from "./AdminNotificationBell";

const AdminNavbar = () => {
  const { user } = useUser();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="flex min-h-[72px] items-center justify-between gap-3 px-3 py-3 sm:px-5 lg:px-8 xl:px-12">
        {/* Logo */}
        <Link
          href="/"
          className="relative inline-flex shrink-0 items-end pr-12"
          aria-label="GoCart homepage"
        >
          <span className="whitespace-nowrap text-3xl font-semibold tracking-tight text-slate-700 sm:text-4xl">
            <span className="text-green-600">go</span>
            cart
            <span className="ml-0.5 text-4xl leading-none text-green-600 sm:text-5xl">
              .
            </span>
          </span>

          <span className="absolute right-0 top-[-3px] rounded-full bg-green-500 px-2.5 py-0.5 text-[10px] font-bold text-white sm:px-3 sm:text-xs">
            Admin
          </span>
        </Link>

        {/* Right-side controls */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-3 lg:gap-5">
          {/* Notification bell */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 sm:h-11 sm:w-11">
            <AdminNotificationBell />
          </div>

          {/* Greeting hidden on small screens */}
          <div className="hidden min-w-0 items-center gap-2 md:flex">
            <p className="max-w-[160px] truncate font-medium text-slate-700">
              Hi,{" "}
              <span className="font-semibold">
                {user?.firstName || "Admin"}
              </span>
            </p>
          </div>

          {/* Profile */}
          <div className="shrink-0">
            <UserButton />
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;