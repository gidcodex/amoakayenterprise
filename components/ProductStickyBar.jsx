"use client";

import FlashCountdown from "@/components/flash-deals/FlashCountdown";
import {
  Box,
  FileText,
  Flame,
  MessageCircleQuestion,
  ShieldCheck,
  ShoppingCart,
  Star,
  Store,
  Truck,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

const tabs = [
  {
    id: "overview",
    label: "Overview",
    icon: FileText,
  },
  {
    id: "specifications",
    label: "Specifications",
    icon: Box,
  },
  {
    id: "reviews",
    label: "Reviews",
    icon: Star,
  },
  {
    id: "questions",
    label: "Questions",
    icon: MessageCircleQuestion,
  },
  {
    id: "shipping",
    label: "Shipping",
    icon: Truck,
  },
  {
    id: "warranty",
    label: "Warranty",
    icon: ShieldCheck,
  },
  {
    id: "seller",
    label: "Seller",
    icon: Store,
  },
];

export default function ProductStickyBar({
  product,
  flashDeal,
}) {
  const currency =
    process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "₵";

  const initialNormalPrice = Number(
    product?.price || 0
  );

  const initialOriginalPrice = Number(
    product?.mrp || product?.price || 0
  );

  const initialHasFlashDeal = Boolean(flashDeal);

  const initialDisplayPrice = initialHasFlashDeal
    ? Number(flashDeal.dealPrice || 0)
    : initialNormalPrice;

  const initialDisplayOriginalPrice =
    initialHasFlashDeal
      ? Number(flashDeal.originalPrice || 0)
      : initialOriginalPrice;

  const [visible, setVisible] = useState(false);

  const [selectedTab, setSelectedTab] =
    useState("overview");

  const [purchaseState, setPurchaseState] =
    useState({
      productId: product?.id || "",
      productName: product?.name || "",

      price: initialDisplayPrice,
      originalPrice: initialDisplayOriginalPrice,

      isAvailable: true,
      selectedVariant: null,
      inCart: false,

      hasFlashDeal: initialHasFlashDeal,
      flashDealEndsAt:
        flashDeal?.endsAt || null,
      flashDealDiscountPercent: Number(
        flashDeal?.discountPercent || 0
      ),
    });

  useEffect(() => {
    setPurchaseState((current) => ({
      ...current,

      productId: product?.id || "",
      productName: product?.name || "",

      price: flashDeal
        ? Number(flashDeal.dealPrice || 0)
        : Number(product?.price || 0),

      originalPrice: flashDeal
        ? Number(flashDeal.originalPrice || 0)
        : Number(
            product?.mrp ||
              product?.price ||
              0
          ),

      hasFlashDeal: Boolean(flashDeal),

      flashDealEndsAt:
        flashDeal?.endsAt || null,

      flashDealDiscountPercent: Number(
        flashDeal?.discountPercent || 0
      ),
    }));
  }, [product, flashDeal]);

  useEffect(() => {
    const handleScroll = () => {
      const target = document.getElementById(
        "product-information-start"
      );

      if (!target) {
        setVisible(false);
        return;
      }

      const rect =
        target.getBoundingClientRect();

      const navbarOffset = 88;

      const reachedTop =
        rect.top <= navbarOffset;

      const sectionStillVisible =
        rect.bottom > navbarOffset + 100;

      setVisible(
        reachedTop && sectionStillVisible
      );
    };

    handleScroll();

    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      }
    );

    window.addEventListener(
      "resize",
      handleScroll
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );

      window.removeEventListener(
        "resize",
        handleScroll
      );
    };
  }, []);

  useEffect(() => {
    const handlePurchaseState = (event) => {
      if (!event?.detail) return;

      setPurchaseState((current) => ({
        ...current,
        ...event.detail,
      }));
    };

    const handleTabChange = (event) => {
      const tabId = event?.detail?.tabId;

      if (tabId) {
        setSelectedTab(tabId);
      }
    };

    window.addEventListener(
      "amoakay:product-purchase-state",
      handlePurchaseState
    );

    window.addEventListener(
      "amoakay:product-tab-changed",
      handleTabChange
    );

    return () => {
      window.removeEventListener(
        "amoakay:product-purchase-state",
        handlePurchaseState
      );

      window.removeEventListener(
        "amoakay:product-tab-changed",
        handleTabChange
      );
    };
  }, []);

  const handleTabClick = (tabId) => {
    setSelectedTab(tabId);

    window.dispatchEvent(
      new CustomEvent(
        "amoakay:select-product-tab",
        {
          detail: {
            tabId,
          },
        }
      )
    );

    const target = document.getElementById(
      "product-information-start"
    );

    if (target) {
      const top =
        target.getBoundingClientRect().top +
        window.scrollY -
        84;

      window.scrollTo({
        top,
        behavior: "smooth",
      });
    }
  };

  const handleFlashDealExpired = () => {
    setPurchaseState((current) => ({
      ...current,
      hasFlashDeal: false,
      flashDealEndsAt: null,
      flashDealDiscountPercent: 0,
      price: Number(product?.price || 0),
      originalPrice: Number(
        product?.mrp ||
          product?.price ||
          0
      ),
    }));
  };

  const price = Number(
    purchaseState.price || 0
  );

  const originalPrice = Number(
    purchaseState.originalPrice || 0
  );

  const savings = Math.max(
    originalPrice - price,
    0
  );

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[70] hidden border-t border-slate-200 bg-white/95 shadow-[0_-10px_35px_rgba(15,23,42,0.16)] backdrop-blur-xl lg:block">
      {/* Flash Deal top accent */}
      {purchaseState.hasFlashDeal && (
        <div className="h-1 bg-gradient-to-r from-red-600 via-orange-500 to-amber-400" />
      )}

      <div className="mx-auto flex max-w-[1900px] items-center gap-4 px-5 py-3 lg:px-8 2xl:px-10">
        {/* Product identity */}
        <div className="hidden min-w-0 xl:block xl:w-[190px]">
          <p className="truncate text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Product
          </p>

          <p className="truncate text-sm font-black text-slate-900">
            {purchaseState.productName}
          </p>

          {purchaseState.selectedVariant && (
            <p className="mt-0.5 truncate text-[11px] font-semibold text-green-700">
              {
                purchaseState
                  .selectedVariant.name
              }
              :{" "}
              {
                purchaseState
                  .selectedVariant.value
              }
            </p>
          )}
        </div>

        {/* Product tabs */}
        <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;

            const active =
              selectedTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() =>
                  handleTabClick(tab.id)
                }
                className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold transition ${
                  active
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon size={15} />

                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Flash Deal countdown */}
        {purchaseState.hasFlashDeal &&
          purchaseState.flashDealEndsAt && (
            <div className="hidden shrink-0 items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 2xl:flex">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-red-600">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-red-600" />

                  Live deal
                </div>

                <p className="mt-0.5 text-[10px] font-semibold text-slate-500">
                  Ends soon
                </p>
              </div>

              <FlashCountdown
                endsAt={
                  purchaseState.flashDealEndsAt
                }
                compact
                onExpired={
                  handleFlashDealExpired
                }
              />
            </div>
          )}

        {/* Price */}
        <div className="shrink-0 text-right">
          <div className="flex items-center justify-end gap-2">
            {purchaseState.hasFlashDeal ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-[9px] font-black uppercase tracking-wide text-red-700">
                <Flame size={11} />

                Flash Deal
              </span>
            ) : (
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Current price
              </p>
            )}

            {!purchaseState.isAvailable && (
              <span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-black uppercase text-slate-500">
                Out of stock
              </span>
            )}
          </div>

          <div className="mt-1 flex items-center justify-end gap-2">
            <p
              className={`text-xl font-black ${
                purchaseState.hasFlashDeal
                  ? "text-red-600"
                  : "text-slate-950"
              }`}
            >
              {currency}
              {price.toLocaleString()}
            </p>

            {originalPrice > price && (
              <p className="text-xs font-semibold text-slate-400 line-through">
                {currency}
                {originalPrice.toLocaleString()}
              </p>
            )}
          </div>

          {purchaseState.hasFlashDeal &&
            savings > 0 && (
              <p className="mt-0.5 text-[10px] font-black text-emerald-600">
                Save {currency}
                {savings.toLocaleString()}
                {purchaseState.flashDealDiscountPercent >
                  0 &&
                  ` (${purchaseState.flashDealDiscountPercent}%)`}
              </p>
            )}
        </div>

        {/* Purchase actions */}
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            disabled={
              !purchaseState.isAvailable
            }
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent(
                  "amoakay:add-to-cart"
                )
              )
            }
            className={`inline-flex items-center justify-center gap-2 rounded-xl border-2 bg-white px-4 py-2.5 text-sm font-black transition disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400 ${
              purchaseState.hasFlashDeal
                ? "border-red-500 text-red-600 hover:bg-red-50"
                : "border-green-600 text-green-700 hover:bg-green-50"
            }`}
          >
            <ShoppingCart size={17} />

            {purchaseState.inCart
              ? "View Cart"
              : "Add to Cart"}
          </button>

          <button
            type="button"
            disabled={
              !purchaseState.isAvailable
            }
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent(
                  "amoakay:buy-now"
                )
              )
            }
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-black text-white shadow-md transition disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none ${
              purchaseState.hasFlashDeal
                ? "bg-gradient-to-r from-red-600 to-orange-500 shadow-red-200 hover:from-red-700 hover:to-orange-600"
                : "bg-green-600 shadow-green-200 hover:bg-green-700"
            }`}
          >
            <Zap size={17} />

            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}