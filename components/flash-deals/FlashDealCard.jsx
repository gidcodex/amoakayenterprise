"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  ShoppingCart,
  Store,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";

import DealBadge from "./DealBadge";
import FlashCountdown from "./FlashCountdown";
import FlashStockBar from "./FlashStockBar";
import { addToCart } from "@/lib/features/cart/cartSlice";
import { useLanguage } from "@/context/LanguageContext";

function getProductImage(product) {
  return (
    product?.variants?.[0]?.images?.[0] ||
    product?.variants?.[0]?.image ||
    product?.images?.[0] ||
    "/placeholder.png"
  );
}

export default function FlashDealCard({
  deal,
  onDealExpired,
}) {
  const { t } = useLanguage();
  const dispatch = useDispatch();
  const router = useRouter();

  const cart = useSelector(
    (state) => state.cart.cartItems || {}
  );

  const product = deal?.product;

  const originalPrice = Number(
    deal?.originalPrice || 0
  );

  const dealPrice = Number(deal?.dealPrice || 0);

  const savings = Math.max(
    originalPrice - dealPrice,
    0
  );

  const productUrl = `/product/${product?.id}`;
  const cartKey = product?.id;

  const handleAddToCart = () => {
    if (!product) return;

    if (cart[cartKey]) {
      router.push("/cart");
      return;
    }

    dispatch(
      addToCart({
        productId: product.id,
        variantId: null,
        variant: null,
      })
    );
  };

  return (
    <article className="group relative flex h-full flex-col overflow-hidden border border-slate-200 bg-white transition duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:border-red-200 hover:shadow-xl">
      <DealBadge
        discountPercent={deal.discountPercent}
      />

      <div className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 bg-white/95 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-red-600 shadow-sm backdrop-blur">
        <Clock3 size={12} />
        {t("product.limited")}
      </div>

      <Link
        href={productUrl}
        className="relative block aspect-square overflow-hidden bg-slate-50"
      >
        <Image
          src={getProductImage(product)}
          alt={
            product?.name ||
            t("product.flashDealProduct")
          }
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px"
          className="object-contain p-5 transition duration-500 group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-1 text-xs font-semibold text-slate-400">
          <Store size={13} />

          <span className="truncate">
            {product?.store?.name ||
              t("product.amoakaySeller")}
          </span>
        </div>

        <Link href={productUrl}>
          <h3 className="mt-2 line-clamp-2 min-h-[44px] text-sm font-bold leading-5 text-slate-900 transition hover:text-red-600">
            {product?.name ||
              t("product.flashDealProduct")}
          </h3>
        </Link>

        <p className="mt-2 text-xs text-slate-400">
          {product?.categoryRef?.name ||
            product?.category ||
            t("product.specialPromotion")}
        </p>

        <div className="mt-4 flex flex-wrap items-end gap-x-2 gap-y-1">
          <p className="text-xl font-black text-red-600">
            GH₵{dealPrice.toFixed(2)}
          </p>

          <p className="pb-0.5 text-sm font-semibold text-slate-400 line-through">
            GH₵{originalPrice.toFixed(2)}
          </p>
        </div>

        <p className="mt-1 text-xs font-bold text-emerald-600">
          {t("product.save")} GH₵{savings.toFixed(2)}
        </p>

        <div className="mt-4 border-y border-slate-100 py-4">
          <FlashCountdown
            endsAt={deal.endsAt}
            onExpired={onDealExpired}
            compact
          />
        </div>

        <div className="mt-4">
          <FlashStockBar stock={product?.stock} />
        </div>

        <div className="mt-auto grid grid-cols-[1fr_auto] gap-2 pt-5">
          <Link
            href={productUrl}
            className="inline-flex items-center justify-center gap-2 bg-slate-900 px-3 py-3 text-xs font-bold text-white transition hover:bg-red-600"
          >
            {t("product.viewDeal")}
            <ArrowRight size={15} />
          </Link>

          <button
            type="button"
            onClick={handleAddToCart}
            aria-label={t("product.addToCart")}
            className="inline-flex min-w-[110px] items-center justify-center gap-2 border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 transition hover:border-red-500 hover:bg-red-50 hover:text-red-600"
          >
            <ShoppingCart size={18} />

            {cart[cartKey]
              ? t("product.viewCart")
              : t("product.add")}
          </button>
        </div>
      </div>
    </article>
  );
}