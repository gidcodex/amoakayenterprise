"use client";

import Loading from "@/components/Loading";
import { fetchWishlist, toggleWishlist,} from "@/lib/features/wishlist/wishlistSlice";
import { addToCart } from "@/lib/features/cart/cartSlice";
import { useAuth, useUser } from "@clerk/nextjs";
import { HeartIcon, ShoppingCart, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

export default function WishlistPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();

  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";
  const wishlist = useSelector((state) => state.wishlist.items);

  useEffect(() => {
    if (user) {
      dispatch(fetchWishlist({ getToken }));
    }
  }, [user, dispatch, getToken]);

  const removeFromWishlist = async (productId) => {
    await dispatch(toggleWishlist({ productId, getToken }));
    toast.success("Removed from wishlist");
  };

  
  const moveToCart = async (product) => {
  if (product.variants?.length > 0) {
    toast("Please select a product option first.");
    router.push(`/product/${product.id}`);
    return;
  }

  dispatch(
    addToCart({
      productId: product.id,
      variantId: null,
      variant: null,
    })
  );

  await dispatch(toggleWishlist({ productId: product.id, getToken }));
  toast.success("Moved to cart");
};

  if (!isLoaded) return <Loading />;

  if (!user) {
    return (
      <div className="min-h-[70vh] mx-6 flex items-center justify-center text-slate-400">
        <h1 className="text-2xl font-semibold">
          Please login to view your wishlist.
        </h1>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] mx-6">
      <div className="max-w-7xl mx-auto">
        <div className="my-8">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <HeartIcon className="text-red-500" fill="#ef4444" />
            My Wishlist
          </h1>

          <p className="text-slate-400 mt-1">
            {wishlist.length} saved product{wishlist.length === 1 ? "" : "s"}
          </p>
        </div>

        {wishlist.length > 0 ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5 mb-32">
            {wishlist.map((item) => {
              const product = item.product;

              return (
                <div
                  key={item.id}
                  className="bg-white border border-slate-100 rounded-2xl shadow-lg shadow-slate-200/50 p-4"
                >
                  <Link
                    href={`/product/${product.id}`}
                    className="flex gap-4"
                  >
                    <div className="w-28 h-28 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                      <Image
                        src={product.images?.[0]}
                        alt={product.name}
                        width={90}
                        height={90}
                        className="max-h-24 w-auto object-contain"
                      />
                    </div>

                    <div className="min-w-0">
                      <h2 className="font-bold text-slate-900 line-clamp-2">
                        {product.name}
                      </h2>

                      <p className="text-sm text-slate-400 mt-1">
                        {product.category}
                      </p>

                      <p className="font-bold text-green-600 mt-3">
                        {currency}
                        {product.price?.toLocaleString()}
                      </p>
                    </div>
                  </Link>

                  <div className="flex gap-3 mt-5">
                    <button
                      onClick={() => moveToCart(product)}
                      className="flex-1 bg-slate-800 hover:bg-black text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                    >
                      <ShoppingCart size={16} />
                      Move to Cart
                    </button>

                    <button
                      onClick={() => removeFromWishlist(product.id)}
                      className="px-4 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-24 text-center border border-dashed border-slate-200 rounded-3xl bg-slate-50">
            <HeartIcon size={48} className="mx-auto text-slate-300" />

            <h2 className="text-2xl font-bold text-slate-700 mt-4">
              Your wishlist is empty
            </h2>

            <p className="text-slate-400 mt-2">
              Save products you love and find them here later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}