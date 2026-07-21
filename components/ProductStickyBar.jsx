"use client";

import {
  Box,
  FileText,
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
}) {
  const currency =
    process.env.NEXT_PUBLIC_CURRENCY_SYMBOL ||
    "₵";

  const [visible, setVisible] =
    useState(false);

  const [selectedTab, setSelectedTab] =
    useState("overview");

  const [purchaseState, setPurchaseState] =
    useState({
      productName: product?.name || "",
      price: Number(product?.price || 0),
      originalPrice: Number(
        product?.mrp || product?.price || 0
      ),
      isAvailable: true,
      selectedVariant: null,
      inCart: false,
    });

  useEffect(() => {
    const handleScroll = () => {
      const target =
        document.getElementById(
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
        rect.bottom >
        navbarOffset + 100;

      setVisible(
        reachedTop &&
          sectionStillVisible
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
    const handlePurchaseState = (
      event
    ) => {
      if (!event?.detail) return;

      setPurchaseState((current) => ({
        ...current,
        ...event.detail,
      }));
    };

    const handleTabChange = (event) => {
      const tabId =
        event?.detail?.tabId;

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

    const target =
      document.getElementById(
        "product-information-start"
      );

    if (target) {
      const top =
        target.getBoundingClientRect()
          .top +
        window.scrollY -
        84;

      window.scrollTo({
        top,
        behavior: "smooth",
      });
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[70] hidden border-t border-slate-200 bg-white/95 shadow-[0_-10px_35px_rgba(15,23,42,0.16)] backdrop-blur-xl lg:block">
      <div className="mx-auto flex max-w-[1500px] items-center gap-5 px-5 py-3.5 lg:px-8">
        {/* Product identity */}
        <div className="hidden min-w-0 xl:block xl:w-[210px]">
          <p className="truncate text-xs font-medium text-slate-400">
            Product
          </p>

          <p className="truncate text-sm font-black text-slate-900">
            {purchaseState.productName}
          </p>

          {purchaseState.selectedVariant && (
            <p className="mt-0.5 truncate text-[11px] text-green-700">
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

        {/* Tabs */}
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

        {/* Price */}
        <div className="shrink-0 text-right">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Current price
          </p>

          <div className="flex items-center justify-end gap-2">
            <p className="text-xl font-black text-slate-950">
              {currency}
              {Number(
                purchaseState.price || 0
              ).toLocaleString()}
            </p>

            {purchaseState.originalPrice >
              purchaseState.price && (
              <p className="text-xs font-semibold text-slate-400 line-through">
                {currency}
                {Number(
                  purchaseState.originalPrice
                ).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
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
            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-green-600 bg-white px-4 py-2.5 text-sm font-black text-green-700 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400"
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
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-black text-white shadow-md shadow-green-200 transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
          >
            <Zap size={17} />
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}