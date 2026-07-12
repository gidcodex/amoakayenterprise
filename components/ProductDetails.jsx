'use client'

import { addToCart } from "@/lib/features/cart/cartSlice";
import {
  StarIcon,
  TagIcon,
  EarthIcon,
  CreditCardIcon,
  UserIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import Counter from "./Counter";
import { useDispatch, useSelector } from "react-redux";

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
};

const ProductDetails = ({ product }) => {
  const productId = product.id;
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";

  const cart = useSelector((state) => state.cart.cartItems);
  const dispatch = useDispatch();
  const router = useRouter();

  const [mainImage, setMainImage] = useState(product.images[0]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [zoom, setZoom] = useState({ show: false, x: 50, y: 50 });

  const variants = product.variants || [];

  const selectedVariantImages =
    selectedVariant?.images?.length > 0
      ? selectedVariant.images
      : selectedVariant?.image
      ? [selectedVariant.image]
      : [];

  const visibleThumbnails =
    selectedVariantImages.length > 0 ? selectedVariantImages : product.images;

  const activePrice = selectedVariant?.price
    ? selectedVariant.price
    : product.price;

  const cartKey = selectedVariant
    ? `${productId}-${selectedVariant.id}`
    : productId;

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setZoom({
      show: true,
      x: Math.min(100, Math.max(0, x)),
      y: Math.min(100, Math.max(0, y)),
    });
  };

  const handleVariantSelect = (variant) => {
    const firstVariantImage =
      variant.images?.length > 0 ? variant.images[0] : variant.image;

    if (selectedVariant?.id === variant.id) {
      setSelectedVariant(null);
      setMainImage(product.images[0]);
      return;
    }

    setSelectedVariant(variant);

    if (firstVariantImage) {
      setMainImage(firstVariantImage);
    }
  };

  const isColorVariant = (variant) => {
    return variant.name?.toLowerCase().includes("color");
  };

  const getColorValue = (value) => {
    return colorMap[value?.toLowerCase()] || null;
  };

  const addToCartHandler = () => {
    if (variants.length > 0 && !selectedVariant) {
      return alert("Please select a product option");
    }

    dispatch(
      addToCart({
        productId,
        variantId: selectedVariant?.id || null,
        variant: selectedVariant || null,
      })
    );
  };

  const averageRating =
    product.rating.length > 0
      ? product.rating.reduce((acc, item) => acc + item.rating, 0) /
        product.rating.length
      : 0;

  return (
    <div className="flex max-lg:flex-col gap-12">
      <div className="flex max-sm:flex-col-reverse gap-4">
        <div className="flex sm:flex-col gap-3">
          {visibleThumbnails.map((image, index) => {
            const active = mainImage === image;

            return (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setMainImage(image)}
                className={`relative size-24 rounded-2xl flex items-center justify-center overflow-hidden bg-white border transition-all duration-300 ${
                  active
                    ? "border-blue-500 ring-2 ring-blue-500 shadow-md"
                    : "border-slate-200 hover:border-blue-500 hover:shadow-md"
                }`}
              >
                <Image
                  src={image}
                  alt=""
                  width={90}
                  height={90}
                  className="w-full h-full object-contain p-2"
                />
              </button>
            );
          })}
        </div>

        <div
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setZoom((prev) => ({ ...prev, show: true }))}
          onMouseLeave={() => setZoom((prev) => ({ ...prev, show: false }))}
          className="relative flex justify-center items-center h-[430px] sm:w-[500px] bg-gradient-to-br from-white via-slate-50 to-blue-50 border border-slate-200 rounded-3xl shadow-lg overflow-hidden cursor-zoom-in"
        >
          <Image
            src={mainImage}
            alt={product.name}
            width={650}
            height={650}
            className={`w-full h-full object-contain p-3 transition-transform duration-300 ease-out ${
              zoom.show ? "scale-125" : "scale-100"
            }`}
            style={{
              transformOrigin: `${zoom.x}% ${zoom.y}%`,
            }}
            priority
          />
        </div>
      </div>

      <div className="flex-1">
        <h1 className="text-3xl font-semibold text-slate-800">
          {product.name}
        </h1>

        <div className="flex items-center mt-2">
          {Array(5)
            .fill("")
            .map((_, index) => (
              <StarIcon
                key={index}
                size={14}
                className="text-transparent mt-0.5"
                fill={averageRating >= index + 1 ? "#00C950" : "#D1D5DB"}
              />
            ))}

          <p className="text-sm ml-3 text-slate-500">
            {product.rating.length} Reviews
          </p>
        </div>

        <div className="flex items-start my-6 gap-3 text-2xl font-semibold text-slate-800">
          <p>
            {currency}
            {activePrice}
          </p>

          <p className="text-xl text-slate-500 line-through">
            {currency}
            {product.mrp}
          </p>
        </div>

        <div className="flex items-center gap-2 text-slate-500">
          <TagIcon size={14} />
          <p>
            Save {(((product.mrp - activePrice) / product.mrp) * 100).toFixed(0)}
            % right now
          </p>
        </div>

        {variants.length > 0 && (
          <div className="mt-8">
            <p className="text-lg text-slate-800 font-semibold mb-3">
              Select Option
              {selectedVariant && (
                <span className="text-sm text-slate-500 font-normal ml-2">
                  {selectedVariant.name}: {selectedVariant.value}
                </span>
              )}
            </p>

            <div className="flex flex-wrap gap-3">
              {variants.map((variant) => {
                const selected = selectedVariant?.id === variant.id;
                const colorValue = getColorValue(variant.value);
                const showColorCircle = isColorVariant(variant) && colorValue;

                return (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => handleVariantSelect(variant)}
                    className={`transition ${
                      showColorCircle
                        ? `size-12 rounded-full border flex items-center justify-center ${
                            selected
                              ? "border-blue-600 ring-2 ring-blue-500"
                              : "border-slate-300 hover:border-blue-400"
                          }`
                        : `border rounded-xl px-4 py-3 text-left ${
                            selected
                              ? "border-blue-600 bg-blue-50 text-blue-700"
                              : "border-slate-200 hover:border-slate-400 text-slate-600"
                          }`
                    }`}
                    title={`${variant.name}: ${variant.value}`}
                  >
                    {showColorCircle ? (
                      <span
                        className="size-8 rounded-full border border-slate-300"
                        style={{ backgroundColor: colorValue }}
                      />
                    ) : (
                      <div>
                        <p className="font-semibold text-sm">
                          {variant.name}: {variant.value}
                        </p>

                        {variant.price && (
                          <p className="text-xs mt-1">
                            {currency}
                            {variant.price}
                          </p>
                        )}

                        <p className="text-xs text-slate-400 mt-1">
                          Stock: {variant.stock}
                        </p>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex items-end gap-5 mt-10">
          {cart[cartKey] && (
            <div className="flex flex-col gap-3">
              <p className="text-lg text-slate-800 font-semibold">Quantity</p>
              <Counter productId={productId} variantId={selectedVariant?.id} />
            </div>
          )}

          <button
            onClick={() =>
              !cart[cartKey] ? addToCartHandler() : router.push("/cart")
            }
            className="bg-slate-800 text-white px-10 py-3 text-sm font-medium rounded hover:bg-slate-900 active:scale-95 transition"
          >
            {!cart[cartKey] ? "Add to Cart" : "View Cart"}
          </button>
        </div>

        <hr className="border-gray-300 my-5" />

        <div className="flex flex-col gap-4 text-slate-500">
          <p className="flex gap-3">
            <EarthIcon className="text-slate-400" /> Free shipping worldwide
          </p>
          <p className="flex gap-3">
            <CreditCardIcon className="text-slate-400" /> 100% Secured Payment
          </p>
          <p className="flex gap-3">
            <UserIcon className="text-slate-400" /> Trusted by top brands
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;