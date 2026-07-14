"use client";

import {
  CreditCard,
  PlusIcon,
  Smartphone,
  SquarePenIcon,
  Truck,
  XIcon,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import AddressModal from "./AddressModal";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import { fetchCart } from "@/lib/features/cart/cartSlice";
import { assets } from "@/assets/assets";

const mobileMoneyProviders = [
  {
    name: "MTN MoMo",
    image: assets.mtn_momo_logo,
  },
  {
    name: "Telecel Cash",
    image: assets.telecel_cash_logo,
  },
  {
    name: "AirtelTigo Money",
    image: assets.airteltigo_money_logo,
  },
];


const OrderSummary = ({ totalPrice, items }) => {
  const { user } = useUser();
  const { getToken, has } = useAuth();

  const dispatch = useDispatch();
  const router = useRouter();

  const currency =
    process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "₵";

  const addressList = useSelector(
    (state) => state.address.list
  );

  const [settings, setSettings] = useState(null);
  const [paymentMethod, setPaymentMethod] =
    useState("");
  const [selectedAddress, setSelectedAddress] =
    useState(null);
  const [showAddressModal, setShowAddressModal] =
    useState(false);
  const [couponCodeInput, setCouponCodeInput] =
    useState("");
  const [coupon, setCoupon] = useState("");
  const [placingOrder, setPlacingOrder] =
    useState(false);

  const isPlusMember = has
    ? has({ plan: "plus" })
    : false;

  /*
   * This allows Paystack to appear even before you add
   * allowPaystack to AdminSettings.
   *
   * After adding allowPaystack to Prisma, this will use
   * the value returned by /api/settings.
   */
  const allowPaystack =
    settings?.allowPaystack !== false;

  const shippingFee =
    isPlusMember && settings?.plusFreeShipping
      ? 0
      : Number(settings?.shippingFee || 0);

  const discount = coupon
    ? (Number(coupon.discount) / 100) *
      Number(totalPrice)
    : 0;

  const finalTotal =
    Number(totalPrice) + shippingFee - discount;

  const hasAvailablePaymentMethod =
    Boolean(settings?.allowCOD) ||
    Boolean(settings?.allowStripe) ||
    allowPaystack;

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await axios.get(
          "/api/settings"
        );

        const loadedSettings =
          data.settings || {};

        setSettings(loadedSettings);

        if (loadedSettings.allowCOD) {
          setPaymentMethod("COD");
        } else if (
          loadedSettings.allowPaystack !== false
        ) {
          setPaymentMethod("PAYSTACK");
        } else if (
          loadedSettings.allowStripe
        ) {
          setPaymentMethod("STRIPE");
        }
      } catch (error) {
        console.error(error);
        toast.error(
          "Failed to load checkout settings."
        );
      }
    };

    fetchSettings();
  }, []);

  const handleCouponCode = async (event) => {
    event.preventDefault();

    try {
      if (!user) {
        return toast.error(
          "Please log in to apply a coupon."
        );
      }

      if (!couponCodeInput.trim()) {
        return toast.error(
          "Please enter a coupon code."
        );
      }

      const token = await getToken();

      const { data } = await axios.post(
        "/api/coupon",
        {
          code: couponCodeInput.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCoupon(data.coupon);
      toast.success("Coupon applied.");
    } catch (error) {
      toast.error(
        error?.response?.data?.error ||
          error.message
      );
    }
  };

  const handlePlaceOrder = async (event) => {
    event.preventDefault();

    if (placingOrder) return;

    try {
      if (!user) {
        return toast.error(
          "Please log in to place an order."
        );
      }

      if (!settings?.marketplaceOpen) {
        return toast.error(
          settings?.maintenanceMessage ||
            "The marketplace is currently unavailable."
        );
      }

      if (!paymentMethod) {
        return toast.error(
          "Please select a payment method."
        );
      }

      if (!selectedAddress) {
        return toast.error(
          "Please select a delivery address."
        );
      }

      if (!Array.isArray(items) || items.length === 0) {
        return toast.error(
          "Your cart is empty."
        );
      }

      setPlacingOrder(true);

      const token = await getToken();

      const orderData = {
        addressId: selectedAddress.id,
        paymentMethod,

        items: items.map((item) => {
          const variantImages =
            item.variant?.images?.length > 0
              ? item.variant.images
              : item.variant?.image
              ? [item.variant.image]
              : [];

          return {
            id: item.id,
            quantity: Number(item.quantity),
            variantId:
              item.variantId ||
              item.variant?.id ||
              null,

            variant: item.variant
              ? {
                  id: item.variant.id,
                  name: item.variant.name,
                  value: item.variant.value,
                  price: item.variant.price,
                  stock: item.variant.stock,
                  image:
                    variantImages[0] ||
                    null,
                  images: variantImages,
                }
              : null,

            variantImage:
              variantImages[0] || null,
            variantImages,
          };
        }),
      };

      if (coupon) {
        orderData.couponCode = coupon.code;
      }

      /*
       * Step 1:
       * Create the orders.
       */
      const orderResponse = await axios.post(
        "/api/orders",
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const orderResult = orderResponse.data;

      /*
       * Stripe payment
       */
      if (paymentMethod === "STRIPE") {
        const stripeUrl =
          orderResult?.session?.url;

        if (!stripeUrl) {
          throw new Error(
            "Stripe did not return a checkout URL."
          );
        }

        window.location.assign(stripeUrl);
        return;
      }

      /*
       * Paystack Mobile Money / Card payment
       */
      if (paymentMethod === "PAYSTACK") {
        if (
          !orderResult.paymentRequired ||
          orderResult.paymentProvider !==
            "PAYSTACK" ||
          !Array.isArray(
            orderResult.orderIds
          ) ||
          orderResult.orderIds.length === 0
        ) {
          throw new Error(
            "The Paystack order information is incomplete."
          );
        }

        /*
         * Step 2:
         * Initialize the Paystack transaction using
         * the newly created order IDs.
         */
        const paymentResponse =
          await axios.post(
            "/api/payments/paystack/initialize",
            {
              orderIds:
                orderResult.orderIds,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

        const paymentResult =
          paymentResponse.data;

        if (
          !paymentResult.authorizationUrl
        ) {
          throw new Error(
            "Paystack did not return a checkout URL."
          );
        }

        toast.success(
          "Redirecting to Paystack..."
        );

        /*
         * Do not clear the cart here.
         * The payment still needs to be confirmed.
         */
        window.location.assign(
          paymentResult.authorizationUrl
        );

        return;
      }

      /*
       * Cash on Delivery
       */
      toast.success(
        orderResult.message ||
          "Order placed successfully."
      );

      await dispatch(
        fetchCart({ getToken })
      );

      router.push("/orders");
    } catch (error) {
      console.error(
        "PLACE ORDER ERROR:",
        error
      );

      toast.error(
        error?.response?.data?.error ||
          error?.message ||
          "Failed to place the order."
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  if (!settings) {
    return (
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 lg:max-w-[370px]">
        Loading payment summary...
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm sm:p-7 lg:max-w-[370px]">
      <h2 className="text-xl font-bold text-slate-900">
        Payment Summary
      </h2>

      <p className="mt-1 text-xs text-slate-400">
        Select your payment and delivery options
      </p>

      {!settings.marketplaceOpen && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-red-600">
          {settings.maintenanceMessage}
        </div>
      )}

      {/* Payment methods */}
      <div className="mt-6">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
          Payment Method
        </p>

        <div className="space-y-3">
          {settings.allowCOD && (
            <PaymentOption
              id="COD"
              title="Cash on Delivery"
              description="Pay when your order arrives"
              icon={Truck}
              checked={
                paymentMethod === "COD"
              }
              onChange={() =>
                setPaymentMethod("COD")
              }
            />
          )}

{allowPaystack && (
  <PaymentOption
    id="PAYSTACK"
    title="Mobile Money / Card"
    description="MTN MoMo, Telecel Cash, AirtelTigo or card"
    icon={Smartphone}
    checked={paymentMethod === "PAYSTACK"}
    onChange={() => setPaymentMethod("PAYSTACK")}
    recommended
  >
    <div className="mt-4 grid grid-cols-3 gap-2">
      {mobileMoneyProviders.map((provider) => (
        <div
          key={provider.name}
          title={provider.name}
          className="flex min-h-14 items-center justify-center rounded-xl border border-slate-200 bg-white p-2 shadow-sm"
        >
          <Image
            src={provider.image}
            alt={provider.name}
            width={90}
            height={40}
            className="h-8 w-full object-contain"
          />
        </div>
      ))}
    </div>

    <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-950 px-3 py-2.5">
      <span className="text-xs font-semibold text-white">
        Secured by Paystack
      </span>

      <Image
        src={assets.paystack_logo}
        alt="Paystack"
        width={85}
        height={24}
        className="h-5 w-auto object-contain"
      />
    </div>
  </PaymentOption>
)}

          {settings.allowStripe && (
            <PaymentOption
              id="STRIPE"
              title="Stripe Card Payment"
              description="Pay securely with your bank card"
              icon={CreditCard}
              checked={
                paymentMethod ===
                "STRIPE"
              }
              onChange={() =>
                setPaymentMethod(
                  "STRIPE"
                )
              }
            />
          )}
        </div>

        {!hasAvailablePaymentMethod && (
          <p className="mt-3 rounded-xl bg-red-50 p-3 text-red-600">
            No payment method is currently
            available.
          </p>
        )}
      </div>

      {/* Address */}
      <div className="my-5 border-y border-slate-200 py-5">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Delivery Address
        </p>

        {selectedAddress ? (
          <div className="mt-3 flex items-start justify-between gap-3 rounded-xl bg-slate-50 p-3">
            <div className="min-w-0">
              <p className="font-semibold text-slate-800">
                {selectedAddress.name}
              </p>

              <p className="mt-1 break-words text-xs leading-5 text-slate-500">
                {selectedAddress.street},{" "}
                {selectedAddress.city},{" "}
                {selectedAddress.state},{" "}
                {selectedAddress.zip}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {selectedAddress.phone}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setSelectedAddress(null)
              }
              className="shrink-0 rounded-lg p-2 text-slate-500 transition hover:bg-white hover:text-green-700"
              aria-label="Change delivery address"
            >
              <SquarePenIcon size={18} />
            </button>
          </div>
        ) : (
          <div className="mt-3">
            {addressList.length > 0 && (
              <select
                value=""
                className="my-2 w-full rounded-xl border border-slate-300 bg-white p-3 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100"
                onChange={(event) => {
                  const index =
                    Number(
                      event.target.value
                    );

                  if (
                    Number.isInteger(index)
                  ) {
                    setSelectedAddress(
                      addressList[index]
                    );
                  }
                }}
              >
                <option value="">
                  Select Address
                </option>

                {addressList.map(
                  (address, index) => (
                    <option
                      key={
                        address.id || index
                      }
                      value={index}
                    >
                      {address.name},{" "}
                      {address.city},{" "}
                      {address.state}
                    </option>
                  )
                )}
              </select>
            )}

            <button
              type="button"
              className="mt-2 flex items-center gap-1 font-semibold text-green-700"
              onClick={() =>
                setShowAddressModal(true)
              }
            >
              Add Address
              <PlusIcon size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Amounts */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex justify-between">
          <div className="flex flex-col gap-2 text-slate-500">
            <p>Subtotal</p>
            <p>Shipping</p>
            {coupon && <p>Coupon</p>}
          </div>

          <div className="flex flex-col gap-2 text-right font-semibold text-slate-800">
            <p>
              {currency}
              {Number(
                totalPrice
              ).toLocaleString()}
            </p>

            <p>
              {shippingFee === 0
                ? "Free"
                : `${currency}${shippingFee.toLocaleString()}`}
            </p>

            {coupon && (
              <p className="text-green-600">
                -{currency}
                {discount.toFixed(2)}
              </p>
            )}
          </div>
        </div>

        {!coupon ? (
          <form
            onSubmit={handleCouponCode}
            className="mt-4 flex gap-2"
          >
            <input
              onChange={(event) =>
                setCouponCodeInput(
                  event.target.value
                )
              }
              value={couponCodeInput}
              type="text"
              placeholder="Coupon code"
              className="min-w-0 flex-1 rounded-xl border border-slate-300 p-2.5 uppercase outline-none focus:border-green-500"
            />

            <button
              type="submit"
              className="rounded-xl bg-slate-700 px-4 font-semibold text-white transition hover:bg-slate-900"
            >
              Apply
            </button>
          </form>
        ) : (
          <div className="mt-4 flex items-center justify-between gap-2 rounded-xl bg-green-50 p-3 text-xs text-green-800">
            <div className="min-w-0">
              <p>
                Code:{" "}
                <span className="font-bold">
                  {coupon.code.toUpperCase()}
                </span>
              </p>

              <p className="mt-1 truncate">
                {coupon.description}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setCoupon("")}
              aria-label="Remove coupon"
            >
              <XIcon size={18} />
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between py-5">
        <p className="font-semibold text-slate-700">
          Total
        </p>

        <p className="text-xl font-black text-slate-900">
          {currency}
          {finalTotal.toFixed(2)}
        </p>
      </div>

      <button
        type="button"
        onClick={handlePlaceOrder}
        disabled={
          placingOrder ||
          !settings.marketplaceOpen ||
          !paymentMethod ||
          !hasAvailablePaymentMethod
        }
        className="w-full rounded-xl bg-green-600 py-3 font-bold text-white transition hover:bg-green-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {placingOrder
          ? "Processing..."
          : paymentMethod === "PAYSTACK"
          ? "Continue to Paystack"
          : paymentMethod === "STRIPE"
          ? "Continue to Stripe"
          : "Place Order"}
      </button>

      {paymentMethod === "PAYSTACK" && (
        <p className="mt-3 text-center text-xs leading-5 text-slate-400">
          You will be redirected to Paystack to
          complete your Mobile Money or card
          payment securely.
        </p>
      )}

      {showAddressModal && (
        <AddressModal
          setShowAddressModal={
            setShowAddressModal
          }
        />
      )}
    </div>
  );
};

function PaymentOption({
  id,
  title,
  description,
  icon: Icon,
  checked,
  onChange,
  recommended = false,
  children,
}) {
 return (
  <label
    htmlFor={id}
    className={`relative block cursor-pointer rounded-xl border p-3 transition ${
      checked
        ? "border-green-500 bg-green-50 ring-2 ring-green-100"
        : "border-slate-200 hover:border-green-300"
    }`}
  >
    <div className="flex items-center gap-3">
      <input
        type="radio"
        id={id}
        name="payment"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 accent-green-600"
      />

      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          checked
            ? "bg-green-600 text-white"
            : "bg-slate-100 text-slate-600"
        }`}
      >
        <Icon size={19} />
      </div>

      <div className="min-w-0 flex-1 pr-8">
        <p className="font-bold text-slate-800">
          {title}
        </p>

        <p className="mt-0.5 text-xs leading-5 text-slate-500">
          {description}
        </p>
      </div>

      {recommended && (
        <span className="absolute right-2 top-2 rounded-full bg-green-600 px-2 py-0.5 text-[9px] font-bold uppercase text-white">
          Recommended
        </span>
      )}
    </div>

    {checked && children}
  </label>
);
}

export default OrderSummary;