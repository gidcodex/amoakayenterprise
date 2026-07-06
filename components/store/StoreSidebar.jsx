'use client'

import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { HomeIcon, LayoutListIcon, SquarePenIcon, SquarePlusIcon, PackageSearch, Bell, Star, RotateCcw } from "lucide-react";


const StoreSidebar = ({ storeInfo }) => {

    const pathname = usePathname();

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
            name: "Reviews",
            href: "/store/reviews",
            icon: Star,
        },
        {
            name: "Notifications",
            href: "/store/notifications",
            icon: Bell,
        },
    ];

    return (
        <div className="inline-flex h-full flex-col border-r border-slate-200 bg-white sm:min-w-64">

            <div className="flex flex-col items-center pt-8 pb-6 border-b border-slate-100 max-sm:hidden">
                <Image
                    src={storeInfo?.logo}
                    alt={storeInfo?.name}
                    width={80}
                    height={80}
                    className="w-16 h-16 rounded-full shadow-md object-cover"
                />

                <h2 className="mt-3 font-semibold text-slate-800 text-center px-3">
                    {storeInfo?.name}
                </h2>

                <p className="text-xs text-slate-400 mt-1">
                    Seller Dashboard
                </p>
            </div>

            <div className="mt-4">

                {sidebarLinks.map((link) => {

                    const active = pathname === link.href;

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`relative flex items-center gap-3 py-3 px-5 transition-all

                            ${
                                active
                                    ? "bg-green-50 text-green-700 font-semibold"
                                    : "text-slate-600 hover:bg-slate-50"
                            }`}
                        >

                            <link.icon size={19} />

                            <span className="max-sm:hidden">
                                {link.name}
                            </span>

                            {active && (
                                <span className="absolute right-0 top-2 bottom-2 w-1 rounded-l bg-green-600"></span>
                            )}

                        </Link>
                    );

                })}

            </div>

        </div>
    );
};

export default StoreSidebar;