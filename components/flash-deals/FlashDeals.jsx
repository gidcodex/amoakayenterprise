"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Flame,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";

import FlashDealsCarousel from "./FlashDealsCarousel";
import FlashCountdown from "./FlashCountdown";

export default function FlashDeals() {
  const [flashDeals, setFlashDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchFlashDeals = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/flash-deals", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to load Flash Deals."
        );
      }

      setFlashDeals(data.flashDeals || []);
    } catch (error) {
      console.error("Flash Deals loading error:", error);

      setError(
        error.message || "Unable to load Flash Deals."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlashDeals();
  }, [fetchFlashDeals]);

  useEffect(() => {
    if (flashDeals.length === 0) {
      return;
    }

    const nearestExpiry = Math.min(
      ...flashDeals.map((deal) =>
        new Date(deal.endsAt).getTime()
      )
    );

    const remainingTime = nearestExpiry - Date.now();

    if (remainingTime <= 0) {
      fetchFlashDeals();
      return;
    }

    const timeout = setTimeout(() => {
      fetchFlashDeals();
    }, remainingTime + 1000);

    return () => clearTimeout(timeout);
  }, [flashDeals, fetchFlashDeals]);

  const nearestEndingDeal =
    flashDeals.length > 0
      ? flashDeals.reduce((earliest, current) =>
          new Date(current.endsAt).getTime() <
          new Date(earliest.endsAt).getTime()
            ? current
            : earliest
        )
      : null;

  if (loading) {
    return (
      <section className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="overflow-hidden border border-slate-200 bg-white">
          <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-5 sm:px-7">
            <div className="flex h-11 w-11 items-center justify-center bg-red-50">
              <LoaderCircle
                size={22}
                className="animate-spin text-red-500"
              />
            </div>

            <div>
              <div className="h-4 w-32 animate-pulse bg-slate-200" />
              <div className="mt-2 h-3 w-48 animate-pulse bg-slate-100" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 6 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="animate-pulse border border-slate-100 bg-white p-3"
                >
                  <div className="aspect-square bg-slate-100" />
                  <div className="mt-4 h-3 w-full bg-slate-100" />
                  <div className="mt-2 h-3 w-2/3 bg-slate-100" />
                  <div className="mt-4 h-5 w-1/2 bg-slate-200" />
                </div>
              )
            )}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="border border-red-200 bg-red-50 px-6 py-10 text-center">
          <Flame
            size={42}
            className="mx-auto text-red-400"
          />

          <h2 className="mt-4 text-xl font-bold text-slate-900">
            Flash Deals could not be loaded
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
            {error}
          </p>

          <button
            type="button"
            onClick={fetchFlashDeals}
            className="mt-6 inline-flex items-center gap-2 bg-red-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-600"
          >
            <RefreshCw size={17} />
            Try Again
          </button>
        </div>
      </section>
    );
  }

  if (flashDeals.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="overflow-hidden border border-slate-200 bg-white shadow-sm">
        <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-red-500 to-orange-500 px-5 py-6 text-white sm:px-7 lg:px-8">
          <div className="absolute -right-10 -top-16 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute bottom-0 right-32 h-24 w-24 rounded-full bg-yellow-300/20 blur-xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-white/15 backdrop-blur-sm">
                <Flame size={27} />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
                    Flash Deals
                  </h2>

                  <span className="bg-yellow-300 px-3 py-1 text-xs font-black uppercase tracking-wider text-slate-900">
                    Limited Time
                  </span>
                </div>

                <p className="mt-2 max-w-2xl text-sm text-red-50 sm:text-base">
                  Save more on selected products before these
                  offers expire.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 lg:items-end">
              {nearestEndingDeal && (
                <div className="rounded-md bg-white/10 p-3 backdrop-blur-sm">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-red-50">
                    Nearest deal ends in
                  </p>

                  <FlashCountdown
                    endsAt={nearestEndingDeal.endsAt}
                    compact
                    onExpired={fetchFlashDeals}
                  />
                </div>
              )}

              <div className="flex items-center gap-2 text-sm font-semibold">
                <span className="h-2 w-2 animate-pulse rounded-full bg-yellow-300" />

                {flashDeals.length} active deal
                {flashDeals.length === 1 ? "" : "s"}
              </div>
            </div>
          </div>
        </div>

        <FlashDealsCarousel
          flashDeals={flashDeals}
          onDealExpired={fetchFlashDeals}
        />
      </div>
    </section>
  );
}