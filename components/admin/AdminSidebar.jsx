'use client'
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { WalletCards, Wallet, BadgeCheck, HomeIcon, ShieldCheckIcon, StoreIcon, TicketPercentIcon, MessageCircleIcon, TruckIcon,SettingsIcon, RotateCcw, FolderTree } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { assets } from "@/assets/assets"
import { useUser } from "@clerk/nextjs"

const AdminSidebar = () => {

    const {user} = useUser()

    const pathname = usePathname()

    const [messageCount, setMessageCount] = useState(0)
    const [deliveryCount, setDeliveryCount] = useState(0);

useEffect(() => {

  const fetchMessageCount = async () => {
    try {
      const res = await fetch("/api/admin/contact-count");
      const data = await res.json();
      setMessageCount(data.count);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchDeliveryCount = async () => {
    try {
      const res = await fetch("/api/admin/delivery-count");
      const data = await res.json();
      setDeliveryCount(data.count);
    } catch (error) {
      console.error(error);
    }
  };

  // Fetch immediately
  fetchMessageCount();
  fetchDeliveryCount();

  // Refresh every 15 seconds
  const interval = setInterval(() => {
    fetchMessageCount();
    fetchDeliveryCount();
  }, 15000);

  return () => clearInterval(interval);

}, []);

    const sidebarLinks = [
        { name: 'Dashboard', href: '/admin', icon: HomeIcon },
        { name: 'Stores', href: '/admin/stores', icon: StoreIcon },
        { name: 'Approve Store', href: '/admin/approve', icon: ShieldCheckIcon },
        { name: 'Coupons', href: '/admin/coupons', icon: TicketPercentIcon  },
        { name: 'Messages', href: '/admin/messages', icon: MessageCircleIcon, count: messageCount},
        { name: "Deliveries", href: "/admin/deliveries", icon: TruckIcon, count: deliveryCount,},
        { name: "Returns", href: "/admin/returns", icon: RotateCcw,},
        { name: "Categories", href: "/admin/categories", icon: FolderTree,},
        { name: "Seller Verification", href: "/admin/seller-verification", icon: BadgeCheck,},
        { name: "Seller Payouts", href: "/admin/seller-payouts", icon: Wallet,},
        { name: "Payout Settings", href: "/admin/payout-settings", icon: WalletCards,},
        { name: "Settings", href: "/admin/settings", icon: SettingsIcon },
    ]

    return user && (
        <div className="inline-flex h-full flex-col gap-5 border-r border-slate-200 sm:min-w-60">
            <div className="flex flex-col gap-3 justify-center items-center pt-8 max-sm:hidden">
                <Image className="w-14 h-14 rounded-full" src={user.imageUrl} alt="" width={80} height={80} />
                <p className="text-slate-700">{user.fullName}</p>
            </div>

            <div className="max-sm:mt-6">
                {
                    sidebarLinks.map((link, index) => (
                        <Link key={index} href={link.href} className={`relative flex items-center gap-3 text-slate-500 hover:bg-slate-50 p-2.5 transition ${pathname === link.href && 'bg-slate-100 sm:text-slate-600'}`}>
                             <div className="relative sm:ml-5">
                         <link.icon size={18} />

                          {link.count > 0 && (
                          <span className="absolute -top-2 -right-3 flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                          {link.count}
                            </span>
                             )}
                          </div>

                          <p className="max-sm:hidden">
                          {link.name}
                           </p>
                            {pathname === link.href && <span className="absolute bg-green-500 right-0 top-1.5 bottom-1.5 w-1 sm:w-1.5 rounded-l"></span>}
                        </Link>
                    ))
                }
            </div>
        </div>
    )
}

export default AdminSidebar