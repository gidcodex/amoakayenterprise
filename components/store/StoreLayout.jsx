'use client'

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

  const fetchIsSeller = async () => {
    try {
      const token = await getToken();

      const { data } = await axios.get("/api/store/is-seller", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setIsSeller(data.isSeller);
      setStoreInfo(data.storeInfo);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIsSeller();
  }, []);

  return loading ? (
    <Loading />
  ) : isSeller ? (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <SellerNavbar />

      <div className="flex flex-1 min-h-0">
        <div className="shrink-0">
          <SellerSidebar storeInfo={storeInfo} />
        </div>

        <main className="flex-1 min-w-0 p-4 sm:p-5 lg:pl-12 lg:pt-12 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  ) : (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-2xl sm:text-4xl font-semibold text-slate-400">
        You are not authorized to access this page
      </h1>

      <Link
        href="/"
        className="bg-slate-700 text-white flex items-center gap-2 mt-8 p-2 px-6 max-sm:text-sm rounded-full"
      >
        Go to home <ArrowRightIcon size={18} />
      </Link>
    </div>
  );
};

export default StoreLayout;