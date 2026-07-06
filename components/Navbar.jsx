'use client'

import {
  PackageIcon,
  Search,
  ShoppingCart,
  Menu,
  X,
  Truck,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useUser, useClerk, UserButton, Protect } from "@clerk/nextjs";
import NotificationBell from "@/components/NotificationBell";

const Navbar = () => {
  const { user } = useUser();
  const { openSignIn } = useClerk();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const cartCount = useSelector((state) => state.cart.total);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    router.push(`/shop?search=${search}`);
    setMobileMenuOpen(false);
  };

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="relative bg-white">
      <div className="mx-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto py-4 transition-all">
          <Link href="/" className="relative text-4xl font-semibold text-slate-700">
            <span className="text-green-600">Amoakay</span>deals
            <span className="text-green-600 text-5xl leading-0">.</span>

            <Protect plan="plus">
              <p className="absolute text-xs font-semibold -top-1 -right-8 px-3 p-0.5 rounded-full flex items-center gap-2 text-white bg-green-500">
                plus
              </p>
            </Protect>
          </Link>

          <div className="hidden sm:flex items-center gap-4 lg:gap-8 text-slate-600">
            <Link href="/">Home</Link>
            <Link href="/shop">Shop</Link>
            <Link href="/track-order" className="flex items-center gap-1">
              <Truck size={17} />
              Track Order
            </Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>

            <form
              onSubmit={handleSearch}
              className="hidden xl:flex items-center w-xs text-sm gap-2 bg-slate-100 px-4 py-3 rounded-full"
            >
              <Search size={18} className="text-slate-600" />
              <input
                className="w-full bg-transparent outline-none placeholder-slate-600"
                type="text"
                placeholder="Search products"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                required
              />
            </form>

            <Link href="/cart" className="relative flex items-center gap-2 text-slate-600">
              <ShoppingCart size={18} />
              Cart
              <button className="absolute -top-1 left-3 text-[8px] text-white bg-slate-600 size-3.5 rounded-full">
                {cartCount}
              </button>
            </Link>

            {!user ? (
              <button
                onClick={openSignIn}
                className="px-8 py-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full"
              >
                Login
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <NotificationBell />

                <UserButton>
                  <UserButton.MenuItems>
                    <UserButton.Action
                      labelIcon={<User size={16} />}
                      label="My Account"
                      onClick={() => router.push("/account")}
                    />

                    <UserButton.Action
                      labelIcon={<PackageIcon size={16} />}
                      label="My Orders"
                      onClick={() => router.push("/orders")}
                    />
                  </UserButton.MenuItems>
                </UserButton>
              </div>
            )}
          </div>

          <div className="sm:hidden">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="sm:hidden absolute top-full left-0 w-full bg-white shadow-md z-50">
          <div className="flex flex-col gap-4 p-4 text-slate-700">
            <Link href="/" onClick={handleNavClick}>Home</Link>
            <Link href="/shop" onClick={handleNavClick}>Shop</Link>
            <Link
              href="/track-order"
              onClick={handleNavClick}
              className="flex items-center gap-2"
            >
              <Truck size={17} />
              Track Order
            </Link>
            <Link href="/about" onClick={handleNavClick}>About</Link>
            <Link href="/contact" onClick={handleNavClick}>Contact</Link>
            <Link href="/cart" onClick={handleNavClick}>
              Cart ({cartCount})
            </Link>

            <form
              onSubmit={handleSearch}
              className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-full"
            >
              <Search size={16} />
              <input
                className="w-full bg-transparent outline-none text-sm"
                type="text"
                placeholder="Search products"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                required
              />
            </form>

            <div className="pt-2 border-t">
              {!user ? (
                <button
                  onClick={openSignIn}
                  className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full w-full"
                >
                  Login
                </button>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <NotificationBell />
                    <UserButton />
                  </div>

                  <button
                    onClick={() => {
                      router.push("/account");
                      setMobileMenuOpen(false);
                    }}
                    className="text-left text-sm text-slate-600"
                  >
                    My Account
                  </button>

                  <button
                    onClick={() => {
                      router.push("/orders");
                      setMobileMenuOpen(false);
                    }}
                    className="text-left text-sm text-slate-600"
                  >
                    My Orders
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <hr className="border-gray-300" />
    </nav>
  );
};

export default Navbar;