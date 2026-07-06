'use client'

import { useUser, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import SellerNotificationBell from "./SellerNotificationBell";

const StoreNavbar = () => {
  const { user } = useUser();

  return (
    <div className="flex items-center justify-between px-12 py-3 border-b border-slate-200 bg-white">
      <Link href="/" className="relative text-4xl font-semibold text-slate-700">
        <span className="text-green-600">go</span>cart
        <span className="text-green-600 text-5xl leading-0">.</span>

        <p className="absolute text-xs font-semibold -top-1 -right-11 px-3 py-0.5 rounded-full flex items-center gap-2 text-white bg-green-500">
          Store
        </p>
      </Link>

      <div className="flex items-center gap-5">
        <SellerNotificationBell />

        <div className="flex items-center gap-3">
          <p className="text-slate-600">
            Hi, <span className="font-semibold">{user?.firstName}</span>
          </p>

          <UserButton />
        </div>
      </div>
    </div>
  );
};

export default StoreNavbar;