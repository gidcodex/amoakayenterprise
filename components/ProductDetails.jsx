"use client";

import { addToCart } from "@/lib/features/cart/cartSlice";
import { ArrowLeft, ArrowRight, BadgeCheck, Banknote, CalendarDays, Check, ChevronLeft, ChevronRight, Cpu, CreditCard, Expand, HardDrive, Heart, MapPin, MemoryStick, MonitorSmartphone,
PackageCheck, RefreshCcw, Share2, ShieldCheck, ShoppingCart, Star, Store, Tag, Truck, WalletCards, X, Zap, } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Counter from "./Counter";

const colorMap = {
  black: "#111827",
  white: "#ffffff",
  blue: "#2563eb",
  red: "#dc2626",
  green: "#16a34a",
  yellow: "#facc15",
  gold: "#d4af37",
  silver: "#c0c0c0",
  gray: "#6b7280",
  grey: "#6b7280",
  pink: "#ec4899",
  purple: "#9333ea",
  orange: "#f97316",
  brown: "#92400e",
  beige: "#d6c7a1",
};

export default function ProductDetails({ product, children, }) {
  const dispatch = useDispatch();
  const router = useRouter();

  const cart = useSelector(
    (state) => state.cart.cartItems || {}
  );

  const currency =
    process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "₵";

  const productImages = useMemo(() => {
    if (
      Array.isArray(product?.images) &&
      product.images.length > 0
    ) {
      return product.images.filter(Boolean);
    }

    if (product?.image) {
      return [product.image];
    }

    return ["/placeholder.png"];
  }, [product]);

  const variants = Array.isArray(product?.variants)
    ? product.variants
    : [];

  const ratings = Array.isArray(product?.rating)
    ? product.rating
    : [];

  const [selectedVariant, setSelectedVariant] =
    useState(null);

  const [mainImage, setMainImage] = useState(
    productImages[0]
  );

  const [isFullscreenOpen, setIsFullscreenOpen] =
    useState(false);

  const [isWishlisted, setIsWishlisted] =
    useState(false);

  const selectedVariantImages = useMemo(() => {
    if (
      Array.isArray(selectedVariant?.images) &&
      selectedVariant.images.length > 0
    ) {
      return selectedVariant.images.filter(Boolean);
    }

    if (selectedVariant?.image) {
      return [selectedVariant.image];
    }

    return [];
  }, [selectedVariant]);

  const visibleImages =
    selectedVariantImages.length > 0
      ? selectedVariantImages
      : productImages;

  const activePrice = Number(
    selectedVariant?.price ?? product?.price ?? 0
  );

  const originalPrice = Number(
    product?.mrp ?? activePrice
  );

  const discountPercentage =
    originalPrice > activePrice
      ? Math.round(
          ((originalPrice - activePrice) /
            originalPrice) *
            100
        )
      : 0;

  const activeStock = Number(
    selectedVariant?.stock ?? product?.stock ?? 0
  );

  const isAvailable =
    product?.inStock !== false && activeStock > 0;

  const averageRating =
    ratings.length > 0
      ? ratings.reduce(
          (total, item) =>
            total + Number(item.rating || 0),
          0
        ) / ratings.length
      : 0;

  const cartKey = selectedVariant
    ? `${product.id}-${selectedVariant.id}`
    : product.id;

const productSpecifications =
  product?.specifications || {};

const specificationHighlights = [
  {
    label: "Display",
    value:
      productSpecifications.display ||
      "See specifications",
    icon: MonitorSmartphone,
  },
  {
    label: "Processor",
    value:
      productSpecifications.processor ||
      "See specifications",
    icon: Cpu,
  },
  {
    label: "Memory",
    value:
      productSpecifications.ram ||
      "See specifications",
    icon: MemoryStick,
  },
  {
    label: "Storage",
    value:
      selectedVariant?.value ||
      productSpecifications.storage ||
      "See specifications",
    icon: HardDrive,
  },
];

  const groupedVariants = useMemo(() => {
    return variants.reduce((groups, variant) => {
      const key = variant.name || "Option";

      if (!groups[key]) {
        groups[key] = [];
      }

      groups[key].push(variant);

      return groups;
    }, {});
  }, [variants]);

  const currentImageIndex = Math.max(
    0,
    visibleImages.indexOf(mainImage)
  );

  const handlePreviousImage = () => {
    const nextIndex =
      currentImageIndex === 0
        ? visibleImages.length - 1
        : currentImageIndex - 1;

    setMainImage(visibleImages[nextIndex]);
  };

  const handleNextImage = () => {
    const nextIndex =
      currentImageIndex === visibleImages.length - 1
        ? 0
        : currentImageIndex + 1;

    setMainImage(visibleImages[nextIndex]);
  };

  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);

    const images =
      Array.isArray(variant.images) &&
      variant.images.length > 0
        ? variant.images
        : variant.image
        ? [variant.image]
        : productImages;

    setMainImage(images[0]);
  };

  const validateVariant = () => {
    if (variants.length > 0 && !selectedVariant) {
      alert("Please select a product option.");

      return false;
    }

    return true;
  };

  const addProductToCart = () => {
    if (!validateVariant()) return false;

    if (!isAvailable) {
      alert("This product option is currently out of stock.");

      return false;
    }

    dispatch(
      addToCart({
        productId: product.id,
        variantId: selectedVariant?.id || null,
        variant: selectedVariant || null,
      })
    );

    return true;
  };

  const handleAddToCart = () => {
    if (cart[cartKey]) {
      router.push("/cart");
      return;
    }

    addProductToCart();
  };

  const handleBuyNow = () => {
    if (!cart[cartKey]) {
      const added = addProductToCart();

      if (!added) return;
    }

    router.push("/cart");
  };

  useEffect(() => {
  const handleStickyAddToCart = () => {
    handleAddToCart();
  };

  const handleStickyBuyNow = () => {
    handleBuyNow();
  };

  window.addEventListener(
    "amoakay:add-to-cart",
    handleStickyAddToCart
  );

  window.addEventListener(
    "amoakay:buy-now",
    handleStickyBuyNow
  );

  return () => {
    window.removeEventListener(
      "amoakay:add-to-cart",
      handleStickyAddToCart
    );

    window.removeEventListener(
      "amoakay:buy-now",
      handleStickyBuyNow
    );
  };
}, [
  selectedVariant,
  activeStock,
  isAvailable,
  cartKey,
  cart,
]);

/* Send the current product purchase state
   to the floating sticky bar */
useEffect(() => {
  window.dispatchEvent(
    new CustomEvent(
      "amoakay:product-purchase-state",
      {
        detail: {
          productId: product.id,
          productName: product.name,
          price: activePrice,
          originalPrice,
          isAvailable,
          selectedVariant: selectedVariant
            ? {
                id: selectedVariant.id,
                name: selectedVariant.name,
                value: selectedVariant.value,
              }
            : null,
          inCart: Boolean(cart[cartKey]),
        },
      }
    )
  );
}, [
  product.id,
  product.name,
  activePrice,
  originalPrice,
  isAvailable,
  selectedVariant,
  cart,
  cartKey,
]);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: `View ${product.name} on Amoakay Deals`,
          url: window.location.href,
        });

        return;
      }

      await navigator.clipboard.writeText(
        window.location.href
      );

      alert("Product link copied.");
    } catch (error) {
      console.error("SHARE PRODUCT ERROR:", error);
    }
  };

  return (
    <>
     <section className="grid items-start gap-7 lg:grid-cols-[minmax(0,1.2fr)_minmax(400px,0.8fr)] xl:grid-cols-[minmax(0,1.28fr)_minmax(460px,0.72fr)] 2xl:grid-cols-[minmax(0,1.35fr)_minmax(500px,0.75fr)]">
        {/* Product gallery */}
        <div className="min-w-0">
          <div className="relative rounded-3xl border border-slate-200 bg-white p-3 shadow-sm sm:p-5">
            <div className="absolute left-5 top-5 z-10 flex flex-wrap gap-2">
              {discountPercentage > 0 && (
                <span className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-black text-white shadow-sm">
                  -{discountPercentage}%
                </span>
              )}

              {isAvailable && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700">
                  <Check size={13} />
                  In stock
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() =>
                setIsFullscreenOpen(true)
              }
              className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-green-400 hover:text-green-700"
              aria-label="Open fullscreen image"
            >
              <Expand size={18} />
            </button>

            <div className="relative flex min-h-[340px] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 via-white to-blue-50 sm:min-h-[480px] lg:min-h-[560px]">
              <Image
                key={mainImage}
                src={mainImage}
                alt={product.name}
                width={850}
                height={850}
                priority
                className="h-[310px] w-full object-contain p-5 transition duration-500 sm:h-[450px] lg:h-[530px]"
              />

              {visibleImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePreviousImage}
                    className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-700 shadow-md transition hover:bg-slate-900 hover:text-white"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={21} />
                  </button>

                  <button
                    type="button"
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-700 shadow-md transition hover:bg-slate-900 hover:text-white"
                    aria-label="Next image"
                  >
                    <ChevronRight size={21} />
                  </button>
                </>
              )}
            </div>

            <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
              {visibleImages.map((image, index) => {
                const active = mainImage === image;

                return (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() =>
                      setMainImage(image)
                    }
                    className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border bg-white p-1 transition sm:h-24 sm:w-24 ${
                      active
                        ? "border-slate-900 ring-2 ring-slate-900/10"
                        : "border-slate-200 hover:border-green-500"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} image ${
                        index + 1
                      }`}
                      fill
                      sizes="96px"
                      className="object-contain p-2"
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Product service highlights */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <ServiceCard
              icon={ShieldCheck}
              title="Secure payment"
              description="Protected checkout"
            />

            <ServiceCard
              icon={PackageCheck}
              title="Genuine product"
              description="Seller verified"
            />

            <ServiceCard
              icon={RefreshCcw}
              title="Easy returns"
              description="Return policy applies"
            />

            <ServiceCard
              icon={Truck}
              title="Delivery support"
              description="Track your order"
            />
          </div>
          
            {/* Product information below gallery */}
           {children && (
          <div className="mt-7">
           {children}
           </div>
            )}        

        </div>

        {/* Product information and purchase panel */}
        <div className="min-w-0">
          <div className="self-start">
            <div  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              {/* Top actions */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  {product.brand && (
                    <p className="text-sm font-bold uppercase tracking-[0.14em] text-green-700">
                      {product.brand}
                    </p>
                  )}

                  <p className="mt-1 text-xs font-medium text-slate-400">
                    Item No.{" "}
                    {product.sku ||
                      product.id
                        ?.slice(-10)
                        .toUpperCase()}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setIsWishlisted(
                        (current) => !current
                      )
                    }
                    className={`flex h-10 w-10 items-center justify-center rounded-full border transition ${
                      isWishlisted
                        ? "border-red-200 bg-red-50 text-red-600"
                        : "border-slate-200 text-slate-600 hover:border-red-300 hover:text-red-600"
                    }`}
                    aria-label="Add to wishlist"
                  >
                    <Heart
                      size={18}
                      fill={
                        isWishlisted
                          ? "currentColor"
                          : "none"
                      }
                    />
                  </button>

                  <button
                    type="button"
                    onClick={handleShare}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-green-400 hover:text-green-700"
                    aria-label="Share product"
                  >
                    <Share2 size={18} />
                  </button>
                </div>
              </div>

              <h1 className="mt-5 text-2xl font-black leading-tight text-slate-950 sm:text-3xl xl:text-[34px]">
                {product.name}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map(
                    (_, index) => (
                      <Star
                        key={index}
                        size={17}
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

                <span className="font-bold text-slate-800">
                  {averageRating.toFixed(1)}
                </span>

                <span className="text-sm text-slate-500">
                  ({ratings.length}{" "}
                  {ratings.length === 1
                    ? "review"
                    : "reviews"}
                  )
                </span>
              </div>

              {/* Premium product highlights */}
<     div className="mt-5 grid grid-cols-2 gap-3">
          {specificationHighlights.map(
            ({ label, value, icon: Icon }) => (
      <div
        key={label}
        className="flex min-w-0 items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3 transition hover:border-green-300 hover:shadow-sm"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          <Icon size={18} />
        </div>

        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            {label}
          </p>

          <p className="mt-1 line-clamp-2 text-xs font-bold leading-5 text-slate-800 sm:text-sm">
            {value}
          </p>
        </div>
      </div>
    )
  )}
</div>

              {/* Price */}
              <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                <div className="flex flex-wrap items-end gap-x-3 gap-y-2">
                  <p className="text-3xl font-black text-slate-950 sm:text-4xl">
                    {currency}
                    {activePrice.toLocaleString()}
                  </p>

                  {originalPrice > activePrice && (
                    <p className="pb-1 text-lg font-semibold text-slate-400 line-through">
                      {currency}
                      {originalPrice.toLocaleString()}
                    </p>
                  )}
                </div>

                {discountPercentage > 0 && (
                  <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-red-600">
                    <Tag size={16} />

                    Save {currency}
                    {(
                      originalPrice - activePrice
                    ).toLocaleString()}{" "}
                    today
                  </div>
                )}
              </div>

              {/* Availability */}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 p-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Availability
                  </p>

                  <p
                    className={`mt-1 font-black ${
                      isAvailable
                        ? "text-green-700"
                        : "text-red-600"
                    }`}
                  >
                    {isAvailable
                      ? `${activeStock} unit${
                          activeStock === 1 ? "" : "s"
                        } available`
                      : "Out of stock"}
                  </p>
                </div>

                <div className="rounded-xl bg-green-50 px-3 py-2 text-xs font-bold text-green-700">
                  Ready for checkout
                </div>
              </div>

              {/* Delivery estimate */}
<div className="mt-4 overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 via-white to-cyan-50">
  <div className="flex items-start gap-4 p-4">
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
      <Truck size={20} />
    </div>

    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-blue-700">
            Estimated delivery
          </p>

          <p className="mt-1 font-black text-slate-900">
            Usually delivered within 1–4 business days
          </p>
        </div>

        <span className="rounded-full bg-green-100 px-3 py-1 text-[10px] font-black uppercase text-green-700">
          Trackable
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <MapPin size={14} />
          Delivery address selected at checkout
        </span>

        <span className="inline-flex items-center gap-1.5">
          <CalendarDays size={14} />
          Exact fee shown before payment
        </span>
      </div>
    </div>
  </div>
</div>

              {/* Variants */}
              {Object.entries(groupedVariants).map(
                ([variantName, options]) => (
                  <VariantGroup
                    key={variantName}
                    name={variantName}
                    options={options}
                    selectedVariant={
                      selectedVariant
                    }
                    currency={currency}
                    onSelect={
                      handleVariantSelect
                    }
                  />
                )
              )}

{/* Financing preview */}
<div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
  <div className="flex items-start gap-4">
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm">
      <Banknote size={20} />
    </div>

    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-black text-slate-900">
            Flexible payment options
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Installment payment options are being prepared for eligible purchases.
          </p>
        </div>

        <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black uppercase text-amber-700">
          Coming soon
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Estimated monthly
          </p>

          <p className="mt-1 text-lg font-black text-slate-900">
            {currency}
            {Math.ceil(activePrice / 6).toLocaleString()}
          </p>

          <p className="mt-1 text-[11px] text-slate-400">
            Example over 6 months
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Payment channels
          </p>

          <p className="mt-1 font-black text-slate-900">
            MoMo and Card
          </p>

          <p className="mt-1 text-[11px] text-slate-400">
            Subject to provider approval
          </p>
        </div>
      </div>
    </div>
  </div>
</div>

             {/* Premium seller card */}
<div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
  <div className="flex items-center justify-between gap-3">
    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
      Sold and fulfilled by
    </p>

    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-black uppercase text-blue-700">
      <BadgeCheck size={13} />
      Verified
    </span>
  </div>

  <div className="mt-4 flex items-center gap-3">
    {product.store?.logo ? (
      <Image
        src={product.store.logo}
        alt={product.store.name || "Seller"}
        width={54}
        height={54}
        className="h-14 w-14 shrink-0 rounded-2xl border border-slate-200 object-cover"
      />
    ) : (
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-green-700">
        <Store size={23} />
      </div>
    )}

    <div className="min-w-0 flex-1">
      <p className="truncate text-base font-black text-slate-900">
        {product.store?.name ||
          "Amoakay Marketplace Seller"}
      </p>

      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1">
          <Star
            size={13}
            className="text-amber-400"
            fill="currentColor"
          />
          Marketplace seller
        </span>

        <span className="inline-flex items-center gap-1">
          <ShieldCheck
            size={13}
            className="text-green-600"
          />
          Approved store
        </span>
      </div>
    </div>

    {product.store?.username && (
      <button
        type="button"
        onClick={() =>
          router.push(
            `/shop/${product.store.username}`
          )
        }
        className="hidden shrink-0 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-green-400 hover:text-green-700 sm:block"
      >
        Visit Store
      </button>
    )}
  </div>
</div>

              {/* Quantity */}
              {cart[cartKey] && (
                <div className="mt-6">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Quantity
                  </p>

                  <Counter
                    productId={product.id}
                    variantId={
                      selectedVariant?.id || null
                    }
                  />
                </div>
              )}

              {/* Purchase actions */}
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!isAvailable}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-green-600 bg-white px-5 py-3.5 font-black text-green-700 transition hover:bg-green-50 active:scale-[0.99] disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400"
                >
                  <ShoppingCart size={19} />

                  {cart[cartKey]
                    ? "View Cart"
                    : "Add to Cart"}
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={!isAvailable}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-5 py-3.5 font-black text-white shadow-lg shadow-green-200 transition hover:bg-green-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                >
                  <Zap size={19} />
                  Buy Now
                </button>
              </div>

    {/* Payment methods */}
<div className="mt-5 rounded-2xl border border-green-200 bg-green-50/60 p-4">
  <div className="flex items-center gap-3">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-600 text-white">
      <WalletCards size={18} />
    </div>

    <div>
      <p className="font-black text-slate-900">
        Secure checkout
      </p>

      <p className="mt-0.5 text-xs text-slate-500">
        Mobile Money and card payments protected by Paystack.
      </p>
    </div>
  </div>

  <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
    {[
      "MTN MoMo",
      "Telecel Cash",
      "AirtelTigo",
      "Bank Card",
    ].map((method) => (
      <div
        key={method}
        className="rounded-xl border border-green-100 bg-white px-3 py-2 text-center text-[11px] font-bold text-slate-700"
      >
        {method}
      </div>
    ))}
  </div>
</div>

              {/* Payment and delivery */}
              <div className="mt-6 divide-y divide-slate-200 border-t border-slate-200">
                <PurchaseBenefit
                  icon={Truck}
                  title="Tracked delivery"
                  description="Monitor your shipment with your order tracking number."
                />

                <PurchaseBenefit
                  icon={CreditCard}
                  title="Secure payment"
                  description="Pay securely with Mobile Money or card through Paystack."
                />

                <PurchaseBenefit
                  icon={ShieldCheck}
                  title="Buyer protection"
                  description="Payments are verified before seller payout processing."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile sticky purchase bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3 shadow-[0_-8px_24px_rgba(15,23,42,0.12)] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-slate-500">
              {product.name}
            </p>

            <p className="text-lg font-black text-slate-950">
              {currency}
              {activePrice.toLocaleString()}
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!isAvailable}
            className="rounded-xl border border-green-600 px-4 py-3 text-sm font-black text-green-700 disabled:border-slate-300 disabled:text-slate-400"
          >
            <ShoppingCart size={19} />
          </button>

          <button
            type="button"
            onClick={handleBuyNow}
            disabled={!isAvailable}
            className="rounded-xl bg-green-600 px-5 py-3 text-sm font-black text-white disabled:bg-slate-300"
          >
            Buy Now
          </button>
        </div>
      </div>

      {/* Fullscreen image viewer */}
      {isFullscreenOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 p-4">
          <button
            type="button"
            onClick={() =>
              setIsFullscreenOpen(false)
            }
            className="absolute right-5 top-5 flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-900 shadow-lg"
            aria-label="Close fullscreen image"
          >
            <X size={22} />
          </button>

          {visibleImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePreviousImage}
                className="absolute left-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-900 shadow-lg"
              >
                <ArrowLeft size={21} />
              </button>

              <button
                type="button"
                onClick={handleNextImage}
                className="absolute right-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-900 shadow-lg"
              >
                <ArrowRight size={21} />
              </button>
            </>
          )}

          <Image
            src={mainImage}
            alt={product.name}
            width={1300}
            height={1300}
            className="max-h-[88vh] max-w-[88vw] object-contain"
          />
        </div>
      )}
    </>
  );
}

function VariantGroup({
  name,
  options,
  selectedVariant,
  currency,
  onSelect,
}) {
  const isColorGroup = name
    .toLowerCase()
    .includes("color");

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-black uppercase tracking-wider text-slate-800">
          {name}
        </p>

        {selectedVariant?.name === name && (
          <p className="text-sm font-semibold text-green-700">
            {selectedVariant.value}
          </p>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-3">
        {options.map((variant) => {
          const selected =
            selectedVariant?.id === variant.id;

          const colorValue =
            colorMap[
              String(
                variant.value || ""
              ).toLowerCase()
            ];

          if (isColorGroup && colorValue) {
            return (
              <button
                key={variant.id}
                type="button"
                onClick={() => onSelect(variant)}
                title={variant.value}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 transition ${
                  selected
                    ? "border-slate-900 bg-slate-50 ring-2 ring-slate-900/10"
                    : "border-slate-200 hover:border-green-500"
                }`}
              >
                <span
                  className="h-7 w-7 rounded-full border border-slate-300"
                  style={{
                    backgroundColor: colorValue,
                  }}
                />

                <span className="text-sm font-bold text-slate-800">
                  {variant.value}
                </span>
              </button>
            );
          }

          return (
            <button
              key={variant.id}
              type="button"
              onClick={() => onSelect(variant)}
              className={`rounded-xl border px-4 py-3 text-left transition ${
                selected
                  ? "border-green-600 bg-green-50 text-green-800 ring-2 ring-green-100"
                  : "border-slate-200 text-slate-700 hover:border-green-400"
              }`}
            >
              <p className="font-black">
                {variant.value}
              </p>

              <p className="mt-1 text-xs">
                {currency}
                {Number(
                  variant.price || 0
                ).toLocaleString()}
              </p>

              <p className="mt-1 text-[11px] text-slate-400">
                {Number(variant.stock || 0)} in stock
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ServiceCard({
  icon: Icon,
  title,
  description,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <Icon
        size={20}
        className="text-green-600"
      />

      <p className="mt-3 text-sm font-black text-slate-900">
        {title}
      </p>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function PurchaseBenefit({
  icon: Icon,
  title,
  description,
}) {
  return (
    <div className="flex items-start gap-3 py-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
        <Icon size={18} />
      </div>

      <div>
        <p className="font-black text-slate-900">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}