"use client";

import { useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import FlashDealCard from "./FlashDealCard";

export default function FlashDealsCarousel({
  flashDeals = [],
  onDealExpired,
}) {
  const { t } = useLanguage();
  const carouselRef = useRef(null);
  const dealCount = flashDeals.length;



  const scrollCarousel = (direction) => {
    const container = carouselRef.current;

    if (!container) return;

    const scrollAmount = Math.min(
      container.clientWidth * 0.85,
      1000
    );

    container.scrollBy({
      left:
        direction === "left"
          ? -scrollAmount
          : scrollAmount,
      behavior: "smooth",
    });
  };

  /*
   * One Flash Deal
   */
  if (dealCount === 1) {
    return (
      <div className="bg-slate-50/70 px-4 py-7 sm:px-6 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-[430px]">
          <FlashDealCard
            deal={flashDeals[0]}
            onDealExpired={onDealExpired}
          />
        </div>
      </div>
    );
  }

  /*
   * Two Flash Deals
   */
  if (dealCount === 2) {
    return (
      <div className="bg-slate-50/70 px-4 py-7 sm:px-6 lg:px-10 lg:py-10">
        <div className="mx-auto grid max-w-[920px] gap-5 sm:grid-cols-2">
          {flashDeals.map((deal) => (
            <FlashDealCard
              key={deal.id}
              deal={deal}
              onDealExpired={onDealExpired}
            />
          ))}
        </div>
      </div>
    );
  }

  /*
   * Three or Four Flash Deals
   */
  if (dealCount <= 4) {
    return (
      <div className="bg-slate-50/70 px-4 py-7 sm:px-6 lg:px-10 lg:py-10">
        <div
          className={`mx-auto grid gap-5 ${
            dealCount === 3
              ? "max-w-[1250px] sm:grid-cols-2 lg:grid-cols-3"
              : "max-w-[1500px] sm:grid-cols-2 lg:grid-cols-4"
          }`}
        >
          {flashDeals.map((deal) => (
            <FlashDealCard
              key={deal.id}
              deal={deal}
              onDealExpired={onDealExpired}
            />
          ))}
        </div>
      </div>
    );
  }

  /*
   * Five or More Flash Deals
   */
  return (
    <div className="relative bg-slate-50/70">
      <button
        type="button"
        onClick={() => scrollCarousel("left")}
        aria-label={t("home.flashDeals.previous")}
        className="absolute left-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center border border-slate-200 bg-white text-slate-700 shadow-lg transition hover:border-red-500 hover:bg-red-50 hover:text-red-600 md:flex"
      >
        <ChevronLeft size={22} />
      </button>

      <div
        ref={carouselRef}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 py-7 [scrollbar-width:none] sm:px-6 lg:px-16 lg:py-10 [&::-webkit-scrollbar]:hidden"
      >
        {flashDeals.map((deal) => (
          <div
            key={deal.id}
            className="w-[84%] shrink-0 snap-start sm:w-[47%] md:w-[32%] lg:w-[24%] xl:w-[20%]"
          >
            <FlashDealCard
              deal={deal}
              onDealExpired={onDealExpired}
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => scrollCarousel("right")}
        aria-label={t("home.flashDeals.next")}
        className="absolute right-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center border border-slate-200 bg-white text-slate-700 shadow-lg transition hover:border-red-500 hover:bg-red-50 hover:text-red-600 md:flex"
      >
        <ChevronRight size={22} />
      </button>
    </div>
  );
}