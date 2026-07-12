"use client";

import { HeartIcon, StarIcon, GitCompare } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth, useUser } from "@clerk/nextjs";
import { useDispatch, useSelector } from "react-redux";
import { toggleWishlist } from "@/lib/features/wishlist/wishlistSlice";
import { addToCompare } from "@/lib/features/compare/compareSlice";
import toast from "react-hot-toast";

const ProductCard = ({ product }) => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";

  const { getToken } = useAuth();
  const { user } = useUser();
  const dispatch = useDispatch();

  const wishlistIds = useSelector((state) => state.wishlist.ids);
  const compareItems = useSelector((state) => state.compare.items);

  const isWished = wishlistIds.includes(product.id);
  const isCompared = compareItems.some((item) => item.id === product.id);

  const rating =
    product.rating?.length > 0
      ? Math.round(
          product.rating.reduce((acc, curr) => acc + curr.rating, 0) /
            product.rating.length
        )
      : 0;

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      return toast.error("Please login to add wishlist.");
    }

    dispatch(toggleWishlist({ productId: product.id, getToken }));
  };

  const handleCompare = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isCompared) {
      return toast("Already added to compare.");
    }

    if (compareItems.length >= 4) {
      return toast.error("You can compare up to 4 products only.");
    }

    dispatch(addToCompare(product));
    toast.success("Added to compare.");
  };

  return (
    <div className="group max-xl:mx-auto max-w-60">
      <Link href={`/product/${product.id}`}>
        <div className="relative h-48 sm:w-60 sm:h-72 rounded-2xl flex items-center justify-center overflow-hidden bg-gradient-to-br from-white via-slate-50 to-blue-50 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300">
          <button
            onClick={handleWishlist}
            className="absolute top-3 right-3 z-10 bg-white rounded-full p-2 shadow hover:scale-110 transition"
          >
            <HeartIcon
              size={18}
              className={isWished ? "text-red-500" : "text-slate-500"}
              fill={isWished ? "#ef4444" : "none"}
            />
          </button>

          <Image
            width={500}
            height={500}
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-contain p-4 group-hover:scale-110 transition duration-300"
          />
        </div>

        <div className="flex justify-between gap-3 text-sm text-slate-800 pt-2">
          <div>
            <p className="line-clamp-1">{product.name}</p>

            <div className="flex">
              {Array(5)
                .fill("")
                .map((_, index) => (
                  <StarIcon
                    key={index}
                    size={14}
                    className="text-transparent mt-0.5"
                    fill={rating >= index + 1 ? "#00C950" : "#D1D5DB"}
                  />
                ))}
            </div>
          </div>

          <p>
            {currency}
            {product.price}
          </p>
        </div>
      </Link>

      <button
        onClick={handleCompare}
        className={`mt-3 w-full text-xs font-semibold py-2 rounded-lg flex items-center justify-center gap-2 transition ${
          isCompared
            ? "bg-blue-100 text-blue-700"
            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
        }`}
      >
        <GitCompare size={14} />
        {isCompared ? "Added to Compare" : "Compare"}
      </button>
    </div>
  );
};

export default ProductCard;