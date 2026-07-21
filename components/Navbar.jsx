"use client";

import { GitCompare, Heart, Menu, PackageIcon, Search, ShoppingCart, Truck, User, X,} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSelector } from "react-redux";
import { UserButton, useClerk, useUser,} from "@clerk/nextjs";

import AnimatedAmoakayLogo from "@/components/AnimatedAmoakayLogo";
import NotificationBell from "@/components/NotificationBell";

const Navbar = ({ categories = [] }) => {
  const { user } = useUser();
  const { openSignIn } = useClerk();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartCount = useSelector(
    (state) => state.cart.total
  );

  const wishlistCount = useSelector(
    (state) => state.wishlist.ids.length
  );

  const compareCount = useSelector(
    (state) => state.compare.items.length
  );

  const handleSearch = (event) => {
    event.preventDefault();

    const trimmedSearch = search.trim();

    if (!trimmedSearch) return;

    router.push(
      `/shop?search=${encodeURIComponent(trimmedSearch)}`
    );

    setMobileMenuOpen(false);
  };

  const handleWishlistClick = (event) => {
    if (!user) {
      event.preventDefault();
      openSignIn();
    }
  };

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="relative z-50 border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 py-4 lg:gap-5">

            {/* Premium animated Amoakay Deals logo */}
          <AnimatedAmoakayLogo />

          {/* Desktop navigation */}
             <div className="hidden min-w-0 flex-1 items-center justify-end gap-2 text-slate-600 sm:flex xl:gap-3 2xl:gap-5">
             <div className="hidden shrink-0 items-center gap-3 xl:flex 2xl:gap-5">
              <Link
                href="/"
                className="font-medium transition hover:text-green-600"
              >
                Home
              </Link>

              <Link
                href="/shop"
                className="font-medium transition hover:text-green-600"
              >
                Shop
              </Link>

              <Link
                data-tour="tracking"
                href="/track-order"
                className="flex items-center gap-1 font-medium transition hover:text-green-600"
              >
                <Truck size={17} />
                Track
              </Link>
             <Link
  href="/about"
  className="hidden font-medium transition hover:text-green-600 2xl:block"
>
  About
</Link>

<Link
  href="/contact"
  className="hidden font-medium transition hover:text-green-600 2xl:block"
>
  Contact
</Link>
              

              
            </div>

            {/* Desktop search */}
            <form data-tour="search" onSubmit={handleSearch} className="hidden xl:flex min-w-[210px] flex-1 xl:max-w-[320px] 2xl:max-w-[500px] items-center gap-3 rounded-full border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm transition-all duration-300 focus-within:border-green-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-green-100"
            >
             <Search
             size={18}
             className="shrink-0 text-slate-500"
             />

           <input
           type="text"
           placeholder="Search products..."
           value={search}
           onChange={(e) => setSearch(e.target.value)}
           required
           className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-slate-400"
           />
           </form>

            {/* Wishlist */}
            <Link
              data-tour="wishlist"
              href="/wishlist"
              onClick={handleWishlistClick}
              className="relative rounded-full p-2.5 transition hover:bg-slate-100 hover:text-green-600"
              title="Wishlist"
            >
              <Heart size={21} />

              {wishlistCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Compare */}
            <Link
              data-tour="compare"
              href="/compare"
              className="relative rounded-full p-2.5 transition hover:bg-slate-100 hover:text-green-600"
              title="Compare Products"
            >
              <GitCompare size={21} />

              {compareCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] text-white">
                  {compareCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              data-tour="cart"
              href="/cart"
              className="relative rounded-full p-2.5 transition hover:bg-slate-100 hover:text-green-600"
              title="Cart"
            >
              <ShoppingCart size={21} />

              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-slate-700 px-1 text-[10px] text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Account */}
            {!user ? (
              <button
                type="button"
                onClick={() => openSignIn()}
                className="rounded-full bg-gradient-to-r from-green-600 to-emerald-500 px-6 py-2.5 font-semibold text-white shadow-md shadow-green-200 transition hover:from-green-700 hover:to-emerald-600"
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
                      onClick={() =>
                        router.push("/account")
                      }
                    />

                    <UserButton.Action
                      labelIcon={
                        <PackageIcon size={16} />
                      }
                      label="My Orders"
                      onClick={() =>
                        router.push("/orders")
                      }
                    />
                  </UserButton.MenuItems>
                </UserButton>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="sm:hidden">
            <button
              type="button"
              onClick={() =>
                setMobileMenuOpen((current) => !current)
              }
              className="rounded-lg p-2 text-slate-700 transition hover:bg-slate-100"
              aria-label={
                mobileMenuOpen
                  ? "Close navigation menu"
                  : "Open navigation menu"
              }
            >
              {mobileMenuOpen ? (
                <X size={25} />
              ) : (
                <Menu size={25} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      {mobileMenuOpen && (
         <div className="absolute left-0 top-full z-[100] w-full border-t border-slate-200 bg-white shadow-xl sm:hidden">
          <div className="flex max-h-[calc(100vh-80px)] flex-col gap-1 overflow-y-auto p-4 text-slate-700">
           

            <Link
              href="/"
              onClick={handleNavClick}
              className="rounded-lg px-3 py-3 font-medium hover:bg-green-50 hover:text-green-700"
            >
              Home
            </Link>

            <Link
              href="/shop"
              onClick={handleNavClick}
              className="rounded-lg px-3 py-3 font-medium hover:bg-green-50 hover:text-green-700"
            >
              Shop
            </Link>

            <Link
              href="/track-order"
              onClick={handleNavClick}
              className="flex items-center gap-2 rounded-lg px-3 py-3 font-medium hover:bg-green-50 hover:text-green-700"
            >
              <Truck size={17} />
              Track Order
            </Link>

            <Link
              href="/about"
              onClick={handleNavClick}
              className="rounded-lg px-3 py-3 font-medium hover:bg-green-50 hover:text-green-700"
            >
              About
            </Link>

            <Link
              href="/contact"
              onClick={handleNavClick}
              className="rounded-lg px-3 py-3 font-medium hover:bg-green-50 hover:text-green-700"
            >
              Contact
            </Link>

            <Link
              href="/wishlist"
              onClick={(event) => {
                handleWishlistClick(event);

                if (user) {
                  handleNavClick();
                }
              }}
              className="rounded-lg px-3 py-3 font-medium hover:bg-green-50 hover:text-green-700"
            >
              Wishlist ({wishlistCount})
            </Link>

            <Link
              href="/compare"
              onClick={handleNavClick}
              className="rounded-lg px-3 py-3 font-medium hover:bg-green-50 hover:text-green-700"
            >
              Compare ({compareCount})
            </Link>

            <Link
              href="/cart"
              onClick={handleNavClick}
              className="rounded-lg px-3 py-3 font-medium hover:bg-green-50 hover:text-green-700"
            >
              Cart ({cartCount})
            </Link>

            <form
              onSubmit={handleSearch}
              className="mt-3 flex items-center gap-2 rounded-full bg-slate-100 px-4 py-3"
            >
              <Search size={17} />

              <input
                type="text"
                placeholder="Search products"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                className="w-full bg-transparent text-sm outline-none"
              />
            </form>

            {!user ? (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openSignIn();
                }}
                className="mt-3 w-full rounded-full bg-gradient-to-r from-green-600 to-emerald-500 px-6 py-3 font-semibold text-white"
              >
                Login
              </button>
            ) : (
              
               <div className="relative z-[200] mt-3 flex items-center justify-between border-t border-slate-100 pt-4">
                  <NotificationBell />

                 <UserButton
                   appearance={{
                      elements: {
                       userButtonPopoverCard: "z-[9999]",
                       userButtonPopoverRootBox: "z-[9999]",
                       },
                       }}
                  >
                  <UserButton.MenuItems>
                   <UserButton.Action
                       labelIcon={<User size={16} />}
                       label="My Account"
                        onClick={() => {
                        setMobileMenuOpen(false);
                        router.push("/account");
                       }}
                   />

                   <UserButton.Action
                    labelIcon={<PackageIcon size={16} />}
                    label="My Orders"
                    onClick={() => {
                    setMobileMenuOpen(false);
                    router.push("/orders");
                     }}
                   />
                 </UserButton.MenuItems>
                </UserButton>
           </div>

            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;