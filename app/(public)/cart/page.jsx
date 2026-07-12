'use client'

import Counter from "@/components/Counter";
import OrderSummary from "@/components/OrderSummary";
import PageTitle from "@/components/PageTitle";
import { deleteItemFromCart } from "@/lib/features/cart/cartSlice";
import { Trash2Icon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function Cart() {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";

  const { cartItems } = useSelector((state) => state.cart);
  const products = useSelector((state) => state.product.list);

  const dispatch = useDispatch();

  const [cartArray, setCartArray] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  const createCartArray = () => {
    let total = 0;
    const newCartArray = [];

    Object.entries(cartItems).forEach(([cartKey, cartItem]) => {
      const isOldCart = typeof cartItem === "number";

      const productId = isOldCart ? cartKey : cartItem.productId;
      const quantity = isOldCart ? cartItem : cartItem.quantity || 0;
      const variant = isOldCart ? null : cartItem.variant || null;
      const variantId = isOldCart ? null : cartItem.variantId || null;

      const product = products.find((item) => item.id === productId);

      if (!product) return;

      const itemPrice = Number(variant?.price || product.price || 0);

      newCartArray.push({
        ...product,
        cartKey,
        quantity,
        variant,
        variantId,
        itemPrice,
      });

      total += itemPrice * quantity;
    });

    setCartArray(newCartArray);
    setTotalPrice(total);
  };

  const handleDeleteItemFromCart = (item) => {
    dispatch(
      deleteItemFromCart({
        productId: item.id,
        variantId: item.variantId,
      })
    );
  };

  useEffect(() => {
    createCartArray();
  }, [cartItems, products]);

  return cartArray.length > 0 ? (
    <div className="min-h-screen mx-6 text-slate-800">
      <div className="max-w-7xl mx-auto">
        <PageTitle heading="My Cart" text="items in your cart" linkText="Add more" />

        <div className="flex items-start justify-between gap-5 max-lg:flex-col">
          <table className="w-full max-w-4xl text-slate-600 table-auto">
            <thead>
              <tr className="max-sm:text-sm">
                <th className="text-left">Product</th>
                <th>Quantity</th>
                <th>Total Price</th>
                <th className="max-md:hidden">Remove</th>
              </tr>
            </thead>

            <tbody>
              {cartArray.map((item) => (
                <tr key={item.cartKey}>
                  <td className="flex gap-3 my-4">
                    <div className="flex items-center justify-center bg-slate-100 size-18 rounded-md">
                      
                      <Image
                     src={
                       item.variant?.images?.length > 0
                         ? item.variant.images[0]
                         : item.variant?.image
                         ? item.variant.image
                         : item.images[0]
                  }
                  className="h-16 w-auto object-contain"
                  alt={item.name}
                  width={70}
                  height={70}
                  />

                    </div>

                         <div>
                         <p className="max-sm:text-sm">{item.name}</p>

                            <p className="text-xs text-slate-500">
                             {item.category}
                            </p>

                            {item.variant && (
                          <>
                         <div className="flex items-center gap-2 mt-2">
                            <span className="px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
                                {item.variant.name}
                            </span>

                          <span className="text-sm text-slate-600">
                            {item.variant.value}
                          </span>
                        </div>

                  {item.variant?.images?.length > 0 && (
                     <div className="flex gap-2 mt-3">
                        {item.variant.images.map((image, index) => (
                    <div
                    key={index}
                     className="w-10 h-10 rounded-lg border border-slate-200 bg-white overflow-hidden"
                     >
                 <Image
                     src={image}
                      alt={`${item.variant.value} ${index + 1}`}
                      width={40}
                      height={40}
                     className="w-full h-full object-contain p-1"
                 />
            </div>
          ))}
        </div>
      )}
    </>
  )}

  <p className="mt-3 font-semibold">
    {currency}
    {item.itemPrice.toLocaleString()}
  </p>
</div>

                    
                  </td>

                  <td className="text-center">
                    <Counter productId={item.id} variantId={item.variantId} />
                  </td>

                  <td className="text-center">
                    {currency}{(item.itemPrice * item.quantity).toLocaleString()}
                  </td>

                  <td className="text-center max-md:hidden">
                    <button
                      onClick={() => handleDeleteItemFromCart(item)}
                      className="text-red-500 hover:bg-red-50 p-2.5 rounded-full active:scale-95 transition-all"
                    >
                      <Trash2Icon size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <OrderSummary totalPrice={totalPrice} items={cartArray} />
        </div>
      </div>
    </div>
  ) : (
    <div className="min-h-[80vh] mx-6 flex items-center justify-center text-slate-400">
      <h1 className="text-2xl sm:text-4xl font-semibold">Your cart is empty</h1>
    </div>
  );
}