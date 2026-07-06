import Link from "next/link";
import {
  Package,
  Truck,
  ShoppingCart,
  Headphones,
  MapPin,
  Star,
} from "lucide-react";

export default function QuickActions() {
  const actions = [
    {
      title: "My Orders",
      text: "View your purchases",
      href: "/orders",
      icon: Package,
    },
    {
      title: "Track Shipment",
      text: "Follow your delivery",
      href: "/track-order",
      icon: Truck,
    },
    {
      title: "Continue Shopping",
      text: "Browse products",
      href: "/shop",
      icon: ShoppingCart,
    },
    {
      title: "Addresses",
      text: "Manage delivery info",
      href: "/cart",
      icon: MapPin,
    },
    {
      title: "Reviews",
      text: "Rate delivered items",
      href: "/orders",
      icon: Star,
    },
    {
      title: "Support",
      text: "Get help quickly",
      href: "/contact",
      icon: Headphones,
    },
  ];

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/60 p-6">
      <h2 className="text-2xl font-bold text-slate-900">Quick Actions</h2>
      <p className="text-sm text-slate-500 mt-1 mb-5">
        Shortcuts to important account actions.
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.title}
              href={action.href}
              className="flex items-center gap-4 bg-slate-50 hover:bg-white border border-slate-100 rounded-2xl p-4 transition"
            >
              <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <Icon size={20} />
              </div>

              <div>
                <p className="font-bold text-slate-900">{action.title}</p>
                <p className="text-sm text-slate-500">{action.text}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}