"use client";

import { useEffect, useState } from "react";
import Loading from "../Loading";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import SellerNavbar from "./StoreNavbar";
import SellerSidebar from "./StoreSidebar";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";

const StoreLayout = ({ children }) => {
  const { getToken } = useAuth();

  const [isSeller, setIsSeller] = useState(false);
  const [loading, setLoading] = useState(true);
  const [storeInfo, setStoreInfo] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const fetchIsSeller = async () => {
    try {
      const token = await getToken();

      const { data } = await axios.get("/api/store/is-seller", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setIsSeller(data.isSeller);
      setStoreInfo(data.storeInfo);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIsSeller();
  }, []);

  useEffect(() => {
    if (!mobileSidebarOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileSidebarOpen]);

  if (loading) {
    return <Loading />;
  }

  if (!isSeller) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <h1 className="text-2xl font-semibold text-slate-400 sm:text-4xl">
          You are not authorized to access this page
        </h1>

        <Link
          href="/"
          className="mt-8 flex items-center gap-2 rounded-full bg-slate-700 px-6 py-3 text-white transition hover:bg-slate-800"
        >
          Go to Home
          <ArrowRightIcon size={18} />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <SellerNavbar
        mobileSidebarOpen={mobileSidebarOpen}
        onToggleMobileSidebar={() =>
          setMobileSidebarOpen((current) => !current)
        }
      />

      <div className="flex min-h-[calc(100vh-72px)]">
        {/* Desktop and tablet sidebar */}
        <div className="hidden md:block">
          <SellerSidebar storeInfo={storeInfo} />
        </div>

        {/* Mobile sidebar drawer */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <button
              type="button"
              aria-label="Close seller navigation"
              onClick={() => setMobileSidebarOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
            />

            <div className="absolute left-0 top-0 h-full w-[82%] max-w-[290px] bg-white shadow-2xl">
              <SellerSidebar
                storeInfo={storeInfo}
                mobile
                onNavigate={() => setMobileSidebarOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Page content */}
        <main className="min-w-0 flex-1 overflow-x-hidden p-3 sm:p-5 lg:p-8">
          <div className="mx-auto w-full max-w-[1700px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StoreLayout;