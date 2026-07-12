'use client'

import { useUser, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import SellerNotificationBell from "./SellerNotificationBell";

const StoreNavbar = () => {
  const { user } = useUser();

  return (
    <div className="flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-12 py-3 border-b border-slate-200 bg-white">
      <Link
        href="/"
        className="relative text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-700 shrink-0"
      >
        <span className="text-green-600">go</span>cart
        <span className="text-green-600 text-3xl sm:text-4xl lg:text-5xl leading-0">.</span>

        <p className="absolute text-[9px] sm:text-xs font-semibold -top-1 -right-9 sm:-right-11 px-2 sm:px-3 py-0.5 rounded-full text-white bg-green-500">
          Store
        </p>
      </Link>

      <div className="flex items-center gap-3 sm:gap-5 min-w-0">
        <SellerNotificationBell />

        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <p className="hidden sm:block text-slate-600 truncate">
            Hi, <span className="font-semibold">{user?.firstName}</span>
          </p>

          <UserButton />
        </div>
      </div>
    </div>
  );
};

export default StoreNavbar;