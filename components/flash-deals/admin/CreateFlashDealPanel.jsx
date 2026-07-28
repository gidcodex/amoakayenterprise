"use client";

import { useEffect, useState } from "react";
import ProductSelectionTable from "./ProductSelectionTable";

import { X, Search, Package, CalendarDays, Euro, Zap } from "lucide-react";



const CreateFlashDealPanel = ({ open, onClose, onSaved, }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [originalPrice, setOriginalPrice] = useState("");
  const [dealPrice, setDealPrice] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [isFeatured, setIsFeatured] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const originalPriceNumber = Number(originalPrice);
  const dealPriceNumber = Number(dealPrice);

  const discountPercent =
    originalPriceNumber > 0 &&
    dealPriceNumber > 0 &&
    dealPriceNumber < originalPriceNumber
      ? Math.round(
          ((originalPriceNumber - dealPriceNumber) /
            originalPriceNumber) *
            100
        )
      : 0;

  const invalidDealPrice =
    dealPrice !== "" &&
    (!dealPriceNumber ||
      dealPriceNumber <= 0 ||
      dealPriceNumber >= originalPriceNumber);

  useEffect(() => {
    if (!open) return;

    const fetchProducts = async () => {
      setLoading(true);

      try {
        const response = await fetch(
          "/api/admin/flash-deals/products"
        );

        const data = await response.json();

        if (response.ok && data.success) {
          setProducts(data.products || []);
        }
      } catch (error) {
        console.error("Product loading error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [open]);

  const handleSaveFlashDeal = async () => {
    console.log("Save Flash Deal clicked");

    setSubmitError("");
    setSuccessMessage("");

    if (!selectedProduct) {
      setSubmitError("Please select a product.");
      return;
    }

    if (!dealPrice || invalidDealPrice) {
      setSubmitError(
        "Enter a valid Flash Deal price lower than the original price."
      );
      return;
    }

    if (!startsAt || !endsAt) {
      setSubmitError("Please select the start and end dates.");
      return;
    }

    const startDate = new Date(startsAt);
    const endDate = new Date(endsAt);

    if (endDate <= startDate) {
      setSubmitError(
        "The end date must be later than the start date."
      );
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        "/api/admin/flash-deals",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId: selectedProduct.id,
            originalPrice: originalPriceNumber,
            dealPrice: dealPriceNumber,
            discountPercent,
            startsAt,
            endsAt,
            isFeatured,
          }),
        }
      );

      const data = await response.json();

      console.log("Flash Deal API response:", data);

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to create Flash Deal."
        );
      }

      setSuccessMessage(
        "Flash Deal created successfully."
      );
      
      if (onSaved) {
            await onSaved();
        }

      setSelectedProduct(null);
      setOriginalPrice("");
      setDealPrice("");
      setStartsAt("");
      setEndsAt("");
      setIsFeatured(true);

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (error) {
      console.error("Flash Deal save error:", error);

      setSubmitError(
        error.message || "Unable to create Flash Deal."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Overlay */}

      <div
        className={`fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${
          open
            ? "opacity-100 visible"
            : "opacity-0 invisible"
        }`}
        onClick={onClose}
      />

      {/* Panel */}

      <aside
        className={`fixed top-0 right-0 z-50 h-screen w-full max-w-2xl bg-white shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}

        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white">

          <div className="flex items-center justify-between px-8 py-6">

            <div>

              <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-500">
                Flash Deals
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                Create Flash Deal
              </h2>

            </div>

            <button
              onClick={onClose}
              className="border border-slate-200 p-2 hover:bg-slate-100 transition"
            >
              <X size={18} />
            </button>

          </div>

        </div>

        {/* Content */}

        <div className="overflow-y-auto h-[calc(100vh-170px)] px-8 py-8 space-y-10">

          {/* Product */}

          {/* Product Selection */}

<section>
  <div className="flex items-center gap-3">
    <Package className="text-red-500" size={20} />

    <h3 className="font-semibold text-lg">
      Select Product
    </h3>
  </div>

  {loading ? (
    <div className="mt-6 border border-slate-200 py-16 text-center text-slate-500">
      Loading products...
    </div>
  ) : (
   
    <ProductSelectionTable
  products={products.map((product) => ({
    id: product.id,
    name: product.name,
    image:
      product.variants?.[0]?.images?.[0] ||
      product.images?.[0] ||
      "/placeholder.png",
    price:
      product.offerPrice ??
      product.price ??
      0,
    stock: product.stock,
    category:
      product.categoryRef?.name ||
      product.category ||
      "Uncategorized",
    store:
      product.store?.name ||
      "Unknown store",
  }))}
  selectedProductId={selectedProduct?.id}
  onSelect={(product) => {
  setSelectedProduct(product);
  setOriginalPrice(String(product.price || ""));
  setDealPrice("");
}}
/>
  )}
</section>

          {/* Pricing */}
{/* Pricing */}

<section>
  <div className="flex items-center gap-3">
    <Euro className="text-emerald-600" size={20} />

    <div>
      <h3 className="text-lg font-semibold text-slate-900">
        Deal Pricing
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        Set a temporary promotional price for the selected product.
      </p>
    </div>
  </div>

  {!selectedProduct ? (
    <div className="mt-5 border border-amber-200 bg-amber-50 px-5 py-4">
      <p className="text-sm font-semibold text-amber-800">
        Select a product before setting the Flash Deal price.
      </p>
    </div>
  ) : (
    <>
      <div className="mt-5 border-l-4 border-red-500 bg-slate-50 px-5 py-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
          Selected product
        </p>

        <p className="mt-1 font-bold text-slate-900">
          {selectedProduct.name}
        </p>

        <p className="mt-1 text-sm text-slate-500">
          {selectedProduct.store} · Stock: {selectedProduct.stock}
        </p>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="original-price"
            className="text-sm font-semibold text-slate-700"
          >
            Original Price
          </label>

          <div className="relative mt-2">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-slate-500">
              €
            </span>

            <input
              id="original-price"
              type="number"
              value={originalPrice}
              readOnly
              className="w-full border border-slate-200 bg-slate-100 py-3 pl-9 pr-4 font-semibold text-slate-700 outline-none"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="deal-price"
            className="text-sm font-semibold text-slate-700"
          >
            Flash Deal Price
          </label>

          <div className="relative mt-2">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-slate-500">
              €
            </span>

            <input
              id="deal-price"
              type="number"
              min="0.01"
              step="0.01"
              value={dealPrice}
              onChange={(event) => setDealPrice(event.target.value)}
              placeholder="Enter deal price"
              className={`w-full border py-3 pl-9 pr-4 font-semibold outline-none transition ${
                invalidDealPrice
                  ? "border-red-400 bg-red-50"
                  : "border-slate-200 bg-white focus:border-red-500"
              }`}
            />
          </div>

          {invalidDealPrice && (
            <p className="mt-2 text-xs font-medium text-red-600">
              The deal price must be lower than the original price.
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 border border-slate-200 bg-white sm:grid-cols-3">
        <div className="border-b border-slate-200 px-5 py-4 sm:border-b-0 sm:border-r">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
            Discount
          </p>

          <p className="mt-1 text-xl font-black text-red-600">
            {discountPercent}%
          </p>
        </div>

        <div className="border-b border-slate-200 px-5 py-4 sm:border-b-0 sm:border-r">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
            Customer saves
          </p>

          <p className="mt-1 text-xl font-black text-emerald-600">
            €
            {discountPercent > 0
              ? (
                  originalPriceNumber - dealPriceNumber
                ).toFixed(2)
              : "0.00"}
          </p>
        </div>

        <div className="px-5 py-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
            Deal price
          </p>

          <p className="mt-1 text-xl font-black text-slate-900">
            €
            {dealPriceNumber > 0
              ? dealPriceNumber.toFixed(2)
              : "0.00"}
          </p>
        </div>
      </div>
    </>
  )}
</section>



          {/* Schedule */}

          <section>

            <div className="flex items-center gap-3">

              <CalendarDays
                className="text-blue-500"
                size={20}
              />

              <h3 className="font-semibold text-lg">
                Schedule
              </h3>

            </div>

            <div className="grid grid-cols-2 gap-5 mt-5">

              <div>

                <label className="text-sm font-medium">
                  Start Date
                </label>

                <input
                   type="datetime-local"
                   value={startsAt}
                   onChange={(event) => {
                   setStartsAt(event.target.value);
                   setSubmitError("");
                 }}
                  className="mt-2 w-full border border-slate-200 px-4 py-3 outline-none transition focus:border-red-500"
                />

              </div>

              <div>

                <label className="text-sm font-medium">
                  End Date
                </label>

                <input
                   type="datetime-local"
                   value={endsAt}
                   min={startsAt || undefined}
                   onChange={(event) => {
                   setEndsAt(event.target.value);
                   setSubmitError("");
                }}
                className="mt-2 w-full border border-slate-200 px-4 py-3 outline-none transition focus:border-red-500"
               />

              </div>

            </div>

          </section>

          {/* Hero */}

          <section>

            <div className="flex items-center gap-3">

              <Zap
                className="text-yellow-500"
                size={20}
              />

              <h3 className="font-semibold text-lg">
                Homepage Settings
              </h3>

            </div>

            <div className="mt-5 flex items-center justify-between border border-slate-200 p-5">

              <div>

                <p className="font-medium">
                  Feature on Homepage
                </p>

                <p className="text-sm text-slate-500 mt-1">
                  Display this deal in the Flash Deals section.
                </p>

              </div>

              <input
                 type="checkbox"
                 checked={isFeatured}
                 onChange={(event) => setIsFeatured(event.target.checked) }
                 className="h-5 w-5 accent-red-500"
               />

            </div>

          </section>
 
        </div>

        {/* Footer */}

        <div className="sticky bottom-0 border-t border-slate-200 bg-white">

          <div className="flex justify-end gap-3 px-8 py-5">
            
                {submitError && (
                   <div className="mb-4 border-l-4 border-red-500 bg-red-50 px-4 py-3">
                      <p className="text-sm font-semibold text-red-700">
                            {submitError}
                      </p>
                    </div>
                   )}

               {successMessage && (
                   <div className="mb-4 border-l-4 border-emerald-500 bg-emerald-50 px-4 py-3">
                       <p className="text-sm font-semibold text-emerald-700">
                        {successMessage}
                      </p>
                   </div>
                   )}

            <button
              onClick={onClose}
              className="border border-slate-300 px-6 py-3 font-medium hover:bg-slate-50 transition"
            >
              Cancel
            </button>

            <button
                 type="button"
                 onClick={handleSaveFlashDeal}
                 disabled={saving}
                 className="bg-red-500 px-6 py-3 font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-red-300"
            >
                {saving ? "Saving Deal..." : "Save Flash Deal"}
           </button>

          </div>

        </div>

      </aside>
    </>
  );
};

export default CreateFlashDealPanel;