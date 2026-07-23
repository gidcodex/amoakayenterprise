"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import {
  Eye,
  ShoppingCart,
  Star,
  Store,
  PackageCheck,
  PackageX,
} from "lucide-react";
import toast from "react-hot-toast";

import { addToCart } from "@/lib/features/cart/cartSlice";

const AssistantProductCard = ({ product, onCloseAssistant, }) => {
  const router = useRouter();
  const dispatch = useDispatch();

  const currency =
    process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "GH₵";

  const productImage =
    product?.image ||
    product?.images?.[0];

  const averageRating = Number(
    product?.averageRating || 0
  );

  const ratingCount = Number(
    product?.ratingCount || 0
  );

  const price = Number(product?.price || 0);
  const mrp = Number(product?.mrp || 0);

  const hasDiscount =
    mrp > price && Number(product?.discount) > 0;

  const handleAddToCart = () => {
    if (!product?.id) {
      toast.error("This product could not be added.");
      return;
    }

    if (!product?.inStock || product?.stock <= 0) {
      toast.error("This product is currently out of stock.");
      return;
    }

    dispatch(
      addToCart({
        productId: product.id,
        variantId: null,
        variant: null,
      })
    );

    toast.success(`${product.name} added to cart.`);
  };

 const handleViewProduct = () => {
  if (!product?.id) return;

  const productUrl =
    product.productUrl || `/product/${product.id}`;

  if (typeof onCloseAssistant === "function") {
    onCloseAssistant();
  }

  router.push(productUrl);
};

  return (
    <article
      className="
        group
        relative
        flex
        h-full
        min-w-[230px]
        max-w-[260px]
        flex-col
        overflow-hidden
        rounded-2xl
        border border-slate-200
        bg-white
        shadow-sm
        transition-all duration-300

        hover:-translate-y-1
        hover:border-green-200
        hover:shadow-xl
        hover:shadow-green-100/60
      "
    >
      {/* Product image */}
      <div
  className="
    relative
    h-44
    w-full
    overflow-hidden
    bg-gradient-to-br
    from-slate-50
    via-white
    to-green-50
  "
>
  {hasDiscount && (
    <span
      className="
        absolute left-3 top-3 z-10
        rounded-full
        bg-red-500
        px-2.5 py-1
        text-[10px]
        font-black
        text-white
        shadow-sm
      "
    >
      -{product.discount}%
    </span>
  )}

  {productImage ? (
    <Image
      src={productImage}
      alt={product?.name || "Amoakay Deals product"}
      fill
      sizes="260px"
      onClick={handleViewProduct}
      className="
        cursor-pointer
        object-contain
        p-4
        transition-transform
        duration-300
        group-hover:scale-105
      "
    />
  ) : (
    <div className="flex h-full items-center justify-center px-4 text-center">
      <p className="text-xs font-medium text-slate-400">
        Product image unavailable
      </p>
    </div>
  )}
</div>

      {/* Product information */}
      <div className="flex flex-1 flex-col p-4">
        <button
          type="button"
          onClick={handleViewProduct}
          className="text-left"
        >
          <h3
            className="
              line-clamp-2
              min-h-[42px]
              text-sm
              font-bold
              leading-5
              text-slate-900
              transition
              hover:text-green-700
            "
          >
            {product?.name || "Product"}
          </h3>
        </button>

        {/* Rating */}
        <div className="mt-2 flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map(
              (_, index) => (
                <Star
                  key={index}
                  size={13}
                  className={
                    averageRating >= index + 1
                      ? "text-amber-400"
                      : "text-slate-300"
                  }
                  fill={
                    averageRating >= index + 1
                      ? "currentColor"
                      : "none"
                  }
                />
              )
            )}
          </div>

          <span className="text-[11px] font-semibold text-slate-500">
            {averageRating.toFixed(1)}
          </span>

          <span className="text-[10px] text-slate-400">
            ({ratingCount})
          </span>
        </div>

        {/* Store */}
        <div className="mt-2 flex min-w-0 items-center gap-1.5 text-xs text-slate-500">
          <Store
            size={13}
            className="shrink-0 text-green-600"
          />

          <span className="truncate">
            {product?.store?.name ||
              "Amoakay Deals Store"}
          </span>
        </div>

        {/* Stock */}
        <div className="mt-2">
          {product?.inStock && product?.stock > 0 ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700">
              <PackageCheck size={13} />
              {product.stock} available
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600">
              <PackageX size={13} />
              Out of stock
            </span>
          )}
        </div>

        {/* Price */}
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <p className="text-base font-black text-green-700">
            {currency}
            {price.toLocaleString()}
          </p>

          {hasDiscount && (
            <p className="pb-0.5 text-xs text-slate-400 line-through">
              {currency}
              {mrp.toLocaleString()}
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={
              !product?.inStock ||
              Number(product?.stock) <= 0
            }
            className="
              flex min-h-10 items-center justify-center gap-1.5
              rounded-xl
              bg-gradient-to-r
              from-green-600
              to-emerald-700
              px-2
              text-[11px]
              font-bold
              text-white
              shadow-sm
              transition

              hover:-translate-y-0.5
              hover:shadow-md

              disabled:cursor-not-allowed
              disabled:bg-slate-300
              disabled:shadow-none
            "
          >
            <ShoppingCart size={14} />
            Add to Cart
          </button>

          <button
            type="button"
            onClick={handleViewProduct}
            className="
              flex min-h-10 items-center justify-center gap-1.5
              rounded-xl
              border border-slate-200
              bg-white
              px-2
              text-[11px]
              font-bold
              text-slate-700
              transition

              hover:border-green-300
              hover:bg-green-50
              hover:text-green-700
            "
          >
            <Eye size={14} />
            View Product
          </button>
        </div>
      </div>
    </article>
  );
};

export default AssistantProductCard;