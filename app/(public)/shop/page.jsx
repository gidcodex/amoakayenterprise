"use client";

import { Suspense, useEffect,useMemo, useState } from "react";
import { MoveLeftIcon, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";

import ProductCard from "@/components/ProductCard";
import FilterSidebar from "@/components/shop/FilterSidebar";
import ShopToolbar from "@/components/shop/ShopToolbar";
import { categorySpecFields, defaultSpecFields, getSpecFields, } from "@/lib/productSpecifications";



const normalizeValue = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const formatSpecLabel = (key) => {
  const specialLabels = {
    ram: "RAM",
    rom: "ROM",
    cpu: "Processor",
    gpu: "Graphics",
    os: "Operating System",
    nfc: "NFC",
    wifi: "WiFi",
    hdmi: "HDMI Ports",
    usb: "USB Ports",
  };

  if (specialLabels[key]) {
    return specialLabels[key];
  }

  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .trim();
};

const getRecommendedScore = (product) => {
  const rating = Number(
    product.averageRating ??
      product.rating ??
      product.ratingsAverage ??
      0
  );

  const reviewCount = Number(
    product.reviewCount ??
      product.ratingsCount ??
      product._count?.ratings ??
      0
  );

  const salesCount = Number(
    product.salesCount ??
      product.sold ??
      product.totalSold ??
      product._count?.orderItems ??
      0
  );

  const createdTime = new Date(product.createdAt || 0).getTime();

  return (
    (product.isFeatured ? 100000 : 0) +
    (product.isBestSeller ? 50000 : 0) +
    salesCount * 1000 +
    rating * 100 +
    reviewCount * 10 +
    (product.inStock ? 5 : 0) +
    createdTime / 1000000000000
  );
};



function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const products = useSelector((state) => state.product.list || []);

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const subcategory = searchParams.get("subcategory") || "";
  const child = searchParams.get("child") || "";

  const pageTitle = child || subcategory || category || "All Products";

  const [sortBy, setSortBy] = useState("recommended");
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedSpecs, setSelectedSpecs] = useState({});
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);

  const [inStockOnly, setInStockOnly] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(search);


  /*
   * First filter only by the category route and search query.
   * Dynamic filter options are generated from this product group,
   * not from unrelated products in other categories.
   */
  
  const categoryProducts = useMemo(() => {
  const normalizedSearch = normalizeValue(search);
  const normalizedCategory = normalizeValue(category);
  const normalizedSubcategory = normalizeValue(subcategory);
  const normalizedChild = normalizeValue(child);

  return products.filter((product) => {
    const productName = normalizeValue(product.name);

    const productCategory = normalizeValue(
      product.categoryRef?.name || product.category
    );

    const productSubcategory = normalizeValue(
      product.subcategoryRef?.name
    );

    const productChild = normalizeValue(
      product.childCategory?.name
    );

    const matchesSearch = normalizedSearch
      ? productName.includes(normalizedSearch)
      : true;

    const matchesCategory = normalizedCategory
      ? productCategory === normalizedCategory
      : true;

    const matchesSubcategory = normalizedSubcategory
      ? productSubcategory === normalizedSubcategory
      : true;

    const matchesChild = normalizedChild
      ? productChild === normalizedChild
      : true;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesSubcategory &&
      matchesChild
    );
  });
}, [products, search, category, subcategory, child]);

const priceBounds = useMemo(() => {
  const prices = categoryProducts
    .map((product) => Number(product.price))
    .filter((price) => Number.isFinite(price));

  if (prices.length === 0) {
    return {
      min: 0,
      max: 0,
    };
  }

  return {
    min: Math.floor(Math.min(...prices)),
    max: Math.ceil(Math.max(...prices)),
  };
}, [categoryProducts]);

useEffect(() => {
  setMinPrice(priceBounds.min);
  setMaxPrice(priceBounds.max);
}, [priceBounds.min, priceBounds.max]); 
  

  /*
   * Only generate relevant specification filters for the
   * selected category/subcategory/child category.
   */
 const specificationLabels = useMemo(() => {
  const entries = [
    ...defaultSpecFields,
    ...Object.values(categorySpecFields).flat(),
  ];

  return Object.fromEntries(
    entries.map(([key, label]) => [key, label])
  );
}, []);

const relevantSpecFields = useMemo(() => {
  const hasSelectedCategory = Boolean(
    category || subcategory || child
  );

  if (hasSelectedCategory) {
    return getSpecFields(category, subcategory, child).filter(
      ([key]) => key !== "brand"
    );
  }

  const specificationKeys = new Set();

  categoryProducts.forEach((product) => {
    Object.keys(product.specifications || {}).forEach((key) => {
      if (key !== "brand") {
        specificationKeys.add(key);
      }
    });
  });

  return Array.from(specificationKeys).map((key) => [
    key,
    specificationLabels[key] || formatSpecLabel(key),
  ]);
}, [
  category,
  subcategory,
  child,
  categoryProducts,
  specificationLabels,
]);

  const brands = useMemo(() => {
    const brandValues = categoryProducts
      .map(
        (product) =>
          product.brand ||
          product.specifications?.brand
      )
      .filter(Boolean)
      .map((brand) => String(brand).trim());

    return [...new Set(brandValues)].sort((a, b) =>
      a.localeCompare(b, undefined, {
        numeric: true,
        sensitivity: "base",
      })
    );
  }, [categoryProducts]);

  /*
   * Result example:
   *
   * {
   *   ram: {
   *     label: "RAM",
   *     values: ["8GB", "12GB"]
   *   }
   * }
   */
  
  const dynamicSpecs = useMemo(() => {
  const result = {};

  relevantSpecFields.forEach(([key, label]) => {
    const values = categoryProducts.flatMap((product) => {
      const value = product.specifications?.[key];

      if (
        value === undefined ||
        value === null ||
        String(value).trim() === ""
      ) {
        return [];
      }

      if (Array.isArray(value)) {
        return value
          .filter(Boolean)
          .map((item) => String(item).trim());
      }

      return [String(value).trim()];
    });

    const uniqueValues = [...new Set(values)].sort((a, b) =>
      a.localeCompare(b, undefined, {
        numeric: true,
        sensitivity: "base",
      })
    );

    if (uniqueValues.length > 0) {
      result[key] = {
        label: label || formatSpecLabel(key),
        values: uniqueValues,
      };
    }
  });

  return result;
}, [categoryProducts, relevantSpecFields]);

  const filteredProducts = useMemo(() => {
    const result = categoryProducts.filter((product) => {
      const productBrand =
        product.brand ||
        product.specifications?.brand ||
        "";

      const matchesBrand =
        selectedBrands.length === 0 ||
        selectedBrands.some(
          (brand) =>
            normalizeValue(brand) ===
            normalizeValue(productBrand)
        );

      const price = Number(product.price || 0);

      const matchesPrice =
         price >= Number(minPrice) &&
         price <= Number(maxPrice);

      const matchesStock =
        !inStockOnly ||
        (product.inStock && Number(product.stock || 0) > 0);

      const matchesSpecifications = Object.entries(
        selectedSpecs
      ).every(([specKey, selectedValues]) => {
        if (
          !Array.isArray(selectedValues) ||
          selectedValues.length === 0
        ) {
          return true;
        }

      const productValue = product.specifications?.[specKey];

     if (
         productValue === undefined ||
         productValue === null
     ) {
         return false;
       }

      const productValues = Array.isArray(productValue)
        ? productValue
         : [productValue];

         return selectedValues.some((selectedValue) =>
           productValues.some(
               (value) =>
                 normalizeValue(selectedValue) ===
                   normalizeValue(value)
            )
          );

      });

      return (
        matchesBrand &&
        matchesPrice &&
        matchesStock &&
        matchesSpecifications
      );
    });

    const sorted = [...result];

    switch (sortBy) {
      case "price-low":
        sorted.sort(
          (a, b) =>
            Number(a.price || 0) - Number(b.price || 0)
        );
        break;

      case "price-high":
        sorted.sort(
          (a, b) =>
            Number(b.price || 0) - Number(a.price || 0)
        );
        break;

      case "newest":
        sorted.sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
        );
        break;

      case "name":
        sorted.sort((a, b) =>
          String(a.name || "").localeCompare(
            String(b.name || "")
          )
        );
        break;

      case "recommended":
        default:
           sorted.sort(
               (a, b) =>
                 getRecommendedScore(b) - getRecommendedScore(a)
         );
          break;
    }

    return sorted;
  }, [
    categoryProducts,
    selectedBrands,
    selectedSpecs,
    minPrice,
    maxPrice,
    inStockOnly,
    sortBy,
  ]);

 const clearFilters = () => {
  setSelectedBrands([]);
  setSelectedSpecs({});
  setMinPrice(priceBounds.min);
  setMaxPrice(priceBounds.max);
  setInStockOnly(false);
};

  const handleSearch = (event) => {
    event.preventDefault();

    const params = new URLSearchParams(
      searchParams.toString()
    );

    const trimmedSearch = searchInput.trim();

    if (trimmedSearch) {
      params.set("search", trimmedSearch);
    } else {
      params.delete("search");
    }

    const query = params.toString();

    router.push(query ? `/shop?${query}` : "/shop");
  };

  const filterSidebarProps = {
    brands,
    selectedBrands,
    setSelectedBrands,
    dynamicSpecs,
    selectedSpecs,
    setSelectedSpecs,
    minPrice,
    maxPrice,
    priceBounds,
    setMinPrice,
    setMaxPrice,
    inStockOnly,
    setInStockOnly,
    onClearFilters: clearFilters,
  };

  return (
    <main className="min-h-screen bg-slate-50 py-6 sm:py-8">
      <div className="mx-auto max-w-[1600px] px-3 sm:px-6">
        {(search || category || subcategory || child) && (
          <button
            type="button"
            onClick={() => router.push("/shop")}
            className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-green-700"
          >
            <MoveLeftIcon size={18} />
            Back to all products
          </button>
        )}

        <ShopToolbar
          title={pageTitle}
          productCount={filteredProducts.length}
          sortBy={sortBy}
          setSortBy={setSortBy}
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          onSearch={handleSearch}
          onOpenFilters={() => setMobileFiltersOpen(true)}
        />

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="hidden lg:sticky lg:top-24 lg:block">
            <FilterSidebar {...filterSidebarProps} />
          </div>

          <section className="min-w-0">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-slate-300 bg-white px-5 py-20 text-center">
                <h2 className="text-xl font-bold text-slate-800">
                  No matching products
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  No products match the selected filters. Remove
                  one or more filters and try again.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-6 rounded-full bg-gradient-to-r from-green-600 to-emerald-500 px-6 py-3 text-sm font-semibold text-white transition hover:from-green-700 hover:to-emerald-600"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </section>
        </div>
      </div>

      {mobileFiltersOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 lg:hidden"
          onClick={() => setMobileFiltersOpen(false)}
        >
          <div
            className="absolute left-0 top-0 h-full w-[88%] max-w-sm overflow-y-auto bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
              <div>
                <h2 className="font-bold text-slate-900">
                  Product filters
                </h2>
                <p className="text-xs text-slate-500">
                  {filteredProducts.length} matching products
                </p>
              </div>

              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="rounded-full bg-slate-100 p-2 text-slate-600"
                aria-label="Close filters"
              >
                <X size={18} />
              </button>
            </div>

            <FilterSidebar {...filterSidebarProps} />

            <div className="sticky bottom-0 border-t border-slate-200 bg-white p-4">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full rounded-full bg-gradient-to-r from-green-600 to-emerald-500 py-3 font-semibold text-white"
              >
                Show {filteredProducts.length} products
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function Shop() {
  return (
    <Suspense fallback={<div className="p-10">Loading shop...</div>}>
      <ShopContent />
    </Suspense>
  );
}