'use client'

import { useUser, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import AdminNotificationBell from "./AdminNotificationBell";

const AdminNavbar = () => {
    const { user } = useUser();

    return (
        <div className="flex items-center justify-between px-12 py-3 border-b border-slate-200 bg-white sticky top-0 z-40">

            <Link href="/" className="relative text-4xl font-semibold text-slate-700">
                <span className="text-green-600">go</span>cart
                <span className="text-green-600 text-5xl leading-0">.</span>

                <p className="absolute text-xs font-semibold -top-1 -right-13 px-3 py-0.5 rounded-full text-white bg-green-500">
                    Admin
                </p>
            </Link>

            <div className="flex items-center gap-5">

                {/* Admin Notifications */}
                <AdminNotificationBell />

                <div className="flex items-center gap-3">
                    <p className="font-medium text-slate-700">
                        Hi, <span className="font-semibold">{user?.firstName}</span>
                    </p>

                    <UserButton />
                </div>

            </div>

        </div>
    );
};

export default AdminNavbar;