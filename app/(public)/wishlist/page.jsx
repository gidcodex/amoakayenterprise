"use client";

import Loading from "@/components/Loading";
import FlashCountdown from "@/components/flash-deals/FlashCountdown";
import ProductCard from "@/components/ProductCard";
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
 const wishlist = useSelector(
  (state) => state.wishlist.items
);
 const products = useSelector(
  (state) => state.product.list || []);

 const wishlistProductIds =
  wishlist.map((item) => item.product.id );
 const recommendedProducts =
  products
    .filter(
      (product) =>
        !wishlistProductIds.includes(product.id)
    )
    .filter(
      (product) =>
        wishlist.some(
          (item) =>
            item.product.category ===
            product.category
        )
    )
    .slice(0, 4);
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
  <main className="min-h-screen bg-slate-50 pb-32">
    <div className="mx-auto max-w-[1500px] px-5 py-10 lg:px-8">

      {/* Header */}
     <div className="mb-10">

  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

    <div className="flex items-center gap-3">

      <div className="
        flex
        h-12
        w-12
        items-center
        justify-center
        bg-red-50
        text-red-500
      ">
        <HeartIcon
          size={28}
          fill="currentColor"
        />
      </div>


      <div>

        <h1 className="
          text-3xl
          font-black
          text-slate-900
        ">
          My Wishlist
        </h1>


        <p className="
          mt-1
          text-sm
          text-slate-500
        ">
          Your favourite products saved for later
        </p>

      </div>

    </div>


    <div className="
      border
      border-slate-200
      bg-white
      px-5
      py-3
      text-sm
      font-bold
      text-slate-700
    ">
      {wishlist.length} Saved Item
      {wishlist.length === 1 ? "" : "s"}
    </div>


  </div>



  {/* Summary Cards */}

  {wishlist.length > 0 && (

    <div className="
      mt-8
      grid
      grid-cols-1
      gap-4
      sm:grid-cols-3
    ">


      <div className="
        border
        border-slate-200
        bg-white
        p-5
      ">

        <p className="
          text-xs
          font-bold
          uppercase
          tracking-wide
          text-slate-400
        ">
          Saved Products
        </p>


        <p className="
          mt-2
          text-3xl
          font-black
          text-slate-900
        ">
          {wishlist.length}
        </p>

      </div>




      <div className="
        border
        border-slate-200
        bg-white
        p-5
      ">

        <p className="
          text-xs
          font-bold
          uppercase
          tracking-wide
          text-slate-400
        ">
          Flash Deals
        </p>


        <p className="
          mt-2
          text-3xl
          font-black
          text-red-600
        ">
          {
            wishlist.filter(
              (item) =>
                item.product.flashDeal?.isActive
            ).length
          }
        </p>
      </div>

      <div className=" border border-slate-200 bg-white p-5 ">
        <p className=" text-xs font-bold uppercase tracking-wide text-slate-400 ">
          Available Savings
        </p>
        <p className=" mt-2 text-3xl font-black text-emerald-600 ">
          {currency}
          {
            wishlist
              .reduce(
                (total, item) => {
                  const deal =
                    item.product.flashDeal;

                  if (
                    deal?.isActive
                  ) {
                    return (
                      total +
                      (
                        deal.originalPrice -
                        deal.dealPrice
                      )
                    );
                  }
                  return total;
                },
                0
              )
              .toLocaleString()
          }
        </p>

      </div>
    </div>
  )}
</div>


      {/* Products */}
      {wishlist.length > 0 ? (

        <div className="
          grid
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-3
          xl:grid-cols-4
          gap-6
        ">

          {wishlist.map((item) => {

            const product = item.product;

            return (

              <article
                key={item.id}
                className="
                  group
                  relative
                  flex
                  flex-col
                  overflow-hidden
                  border
                  border-slate-200
                  bg-white
                  transition
                  hover:-translate-y-1
                  hover:shadow-xl
                "
              >

                {/* Remove */}
                <button
                  onClick={() =>
                    removeFromWishlist(product.id)
                  }
                  className="
                    absolute
                    right-4
                    top-4
                    z-10
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    bg-red-50
                    text-red-600
                    transition
                    hover:bg-red-100
                  "
                >
                  <Trash2 size={17}/>
                </button>


                {/* Image */}

                <Link
                  href={`/product/${product.id}`}
                  className="
                    flex
                    h-64
                    items-center
                    justify-center
                    bg-slate-50
                    p-6
                  "
                >

                  <Image
                    src={
                      product.images?.[0] ||
                      "/placeholder.png"
                    }
                    alt={product.name}
                    width={230}
                    height={230}
                    className="
                      h-full
                      w-full
                      object-contain
                      transition
                      duration-500
                      group-hover:scale-105
                    "
                  />

                </Link>



                {/* Details */}

                <div className="flex flex-1 flex-col p-5">


                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {product.category || "Product"}
                  </p>


                  <Link
                    href={`/product/${product.id}`}
                  >

                    <h2
                      className="
                        mt-2
                        line-clamp-2
                        min-h-[48px]
                        text-base
                        font-black
                        text-slate-900
                        hover:text-green-600
                      "
                    >
                      {product.name}
                    </h2>

                  </Link>



                  {/* Rating */}

                  <div className="mt-3 flex items-center gap-1 text-sm">

                    <span className="text-yellow-500">
                      ★
                    </span>

                    <span className="font-bold text-slate-700">
                      {product.rating?.length
                        ? (
                          product.rating.reduce(
                            (a,b)=>a+b.rating,
                            0
                          ) /
                          product.rating.length
                        ).toFixed(1)
                        : "New"}
                    </span>

                  </div>



                  {/* Price */}

                  {/* Price */}

<div className="mt-4">

  {product.flashDeal?.isActive ? (

    <>
      <div className="
        mb-2
        inline-flex
        items-center
        gap-1
        bg-red-50
        px-3
        py-1
        text-xs
        font-black
        uppercase
        tracking-wide
        text-red-600
      ">
        🔥 Flash Deal
      </div>


      <p className="
        text-xl
        font-black
        text-red-600
      ">
        {currency}
        {product.flashDeal.dealPrice?.toLocaleString()}
      </p>


      <p className="
        text-sm
        font-semibold
        text-slate-400
        line-through
      ">
        {currency}
        {product.flashDeal.originalPrice?.toLocaleString()}
      </p>


      <p className="
        mt-1
        text-xs
        font-bold
        text-emerald-600
      ">
        Save {currency}
        {(
          product.flashDeal.originalPrice -
          product.flashDeal.dealPrice
        ).toLocaleString()}
      </p>

    </>

  ) : (

    <>

      <p className="
        text-xl
        font-black
        text-green-600
      ">
        {currency}
        {product.price?.toLocaleString()}
      </p>


      {product.mrp > product.price && (

        <p className="
          text-sm
          font-semibold
          text-slate-400
          line-through
        ">
          {currency}
          {product.mrp?.toLocaleString()}
        </p>

      )}

    </>

  )}

</div>

                  {/* Seller + Stock */}

<div className="mt-4 space-y-3">

  <div className="flex items-center justify-between">

    <p className="
      text-xs
      font-semibold
      text-slate-500
    ">
      Seller:
      {" "}
      <span className="font-bold text-slate-700">
        {product.store?.name ||
        "Amoakay Seller"}
      </span>
    </p>


    <span className="
      inline-flex
      items-center
      gap-1
      rounded-full
      bg-green-50
      px-2
      py-1
      text-[10px]
      font-black
      text-green-700
    ">
      ✓ Verified
    </span>

  </div>


  {product.flashDeal?.isActive && (
  <div
    className="
      border
      border-red-100
      bg-red-50
      px-3
      py-3
    "
  >
    <div
      className="
        flex
        items-center
        justify-between
        text-xs
        font-bold
      "
    >
      <span className="text-red-600">
        🔥 Selling fast
      </span>

      <span className="text-slate-600">
        {Math.max(
          (product.flashDeal.stockLimit || 0) -
            (product.flashDeal.soldCount || 0),
          0
        )}{" "}
        left
      </span>
    </div>

    <div
      className="
        mt-2
        h-2
        overflow-hidden
        bg-white
      "
    >
      <div
        className="
          h-full
          bg-gradient-to-r
          from-orange-400
          to-red-500
        "
        style={{
          width: `${Math.min(
            ((product.flashDeal.soldCount || 0) /
              (product.flashDeal.stockLimit || 1)) *
              100,
            100
          )}%`,
        }}
      />
    </div>

    {product.flashDeal.endsAt && (
      <div className="mt-3 border-t border-red-100 pt-3">
        <p
          className="
            mb-2
            text-[10px]
            font-black
            uppercase
            tracking-wider
            text-red-600
          "
        >
          Deal ends in
        </p>

        <FlashCountdown
          endsAt={product.flashDeal.endsAt}
          compact
        />
      </div>
    )}
  </div>
)}


</div>

                {/* Buttons */}

                  <div className="
                    mt-6
                    grid
                    grid-cols-[1fr_auto]
                    gap-2
                  ">

                    <button
                      onClick={() =>
                        moveToCart(product)
                      }
                      className="
                        flex
                        items-center
                        justify-center
                        gap-2
                        bg-slate-900
                        py-3
                        text-sm
                        font-black
                        text-white
                        transition
                        hover:bg-green-600
                      "
                    >

                      <ShoppingCart size={17}/>

                      Add to Cart

                    </button>


                    <Link
                      href={`/product/${product.id}`}
                      className="
                        flex
                        items-center
                        justify-center
                        border
                        border-slate-200
                        px-4
                        text-sm
                        font-bold
                        text-slate-700
                        hover:bg-slate-50
                      "
                    >
                      View
                    </Link>


                  </div>


                </div>

              </article>

            );

          })}

        </div>


      ) : (

        <div className="
          flex
          min-h-[400px]
          flex-col
          items-center
          justify-center
          border
          border-dashed
          border-slate-300
          bg-white
        ">

          <HeartIcon
            size={60}
            className="text-slate-300"
          />

          <h2 className="
            mt-5
            text-2xl
            font-black
            text-slate-700
          ">
            Your wishlist is empty
          </h2>

          <p className="mt-2 text-slate-500">
            Save products you love and find them here later.
          </p>

        </div>

      )}

{/* Recommended Products */}

{recommendedProducts.length > 0 && (

<section className="mt-16">

  <div className="mb-6">

    <h2 className="
      text-2xl
      font-black
      text-slate-900
    ">
      You may also like
    </h2>


    <p className="
      mt-1
      text-sm
      text-slate-500
    ">
      Products related to your saved items
    </p>
  </div>
  <div className="
    grid
    grid-cols-1
    gap-5
    sm:grid-cols-2
    lg:grid-cols-4
  ">

    {recommendedProducts.map(
      (product) => (

        <ProductCard
          key={product.id}
          product={product}
        />

      )
    )}
  </div>
</section>

)}
    </div>
  </main>
);
}