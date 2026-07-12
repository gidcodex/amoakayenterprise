"use client";

import {
  ChevronDown,
  RotateCcw,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";

const searchableSpecificationKeys = [
  "model",
  "os",
  "operatingSystem",
  "smartTvOs",
];

const AUTO_SEARCH_THRESHOLD = 6;

export default function FilterSidebar({
  brands = [],
  selectedBrands = [],
  setSelectedBrands,

  dynamicSpecs = {},
  selectedSpecs = {},
  setSelectedSpecs,

  minPrice = 0,
  maxPrice = 0,
  priceBounds = {
    min: 0,
    max: 0,
  },
  setMinPrice,
  setMaxPrice,

  inStockOnly = false,
  setInStockOnly,

  onClearFilters,
}) {
  const [openSections, setOpenSections] = useState({
    brand: true,
    price: true,
    availability: true,
  });

  const [filterSearches, setFilterSearches] = useState({
    brand: "",
  });

  const toggleSection = (section) => {
    setOpenSections((previous) => ({
      ...previous,

      // Dynamic sections default to open.
      // This makes the first click close them immediately.
      [section]: !(previous[section] ?? true),
    }));
  };

  const updateFilterSearch = (key, value) => {
    setFilterSearches((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const toggleBrand = (brand) => {
    setSelectedBrands((previous) =>
      previous.includes(brand)
        ? previous.filter((item) => item !== brand)
        : [...previous, brand]
    );
  };

  const toggleSpecification = (key, value) => {
    setSelectedSpecs((previous) => {
      const currentValues = Array.isArray(previous[key])
        ? previous[key]
        : [];

      const updatedValues = currentValues.includes(value)
        ? currentValues.filter((item) => item !== value)
        : [...currentValues, value];

      return {
        ...previous,
        [key]: updatedValues,
      };
    });
  };

  const filteredBrands = useMemo(() => {
    const query = String(filterSearches.brand || "")
      .trim()
      .toLowerCase();

    if (!query) return brands;

    return brands.filter((brand) =>
      String(brand).toLowerCase().includes(query)
    );
  }, [brands, filterSearches.brand]);

  const safeMinimum = Number(priceBounds.min || 0);
  const safeMaximum = Number(priceBounds.max || 0);

  const priceDifference = Math.max(
    safeMaximum - safeMinimum,
    1
  );

  const minimumPercentage =
    ((Number(minPrice) - safeMinimum) /
      priceDifference) *
    100;

  const maximumPercentage =
    ((Number(maxPrice) - safeMinimum) /
      priceDifference) *
    100;

  const handleMinimumPrice = (value) => {
    const parsedValue = Number(value);

    if (!Number.isFinite(parsedValue)) return;

    setMinPrice(
      Math.min(
        Math.max(parsedValue, safeMinimum),
        Number(maxPrice)
      )
    );
  };

  const handleMaximumPrice = (value) => {
    const parsedValue = Number(value);

    if (!Number.isFinite(parsedValue)) return;

    setMaxPrice(
      Math.max(
        Math.min(parsedValue, safeMaximum),
        Number(minPrice)
      )
    );
  };

  const handleReset = () => {
    setFilterSearches({
      brand: "",
    });

    onClearFilters?.();
  };

  return (
    <aside className="border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div>
          <p className="font-bold text-slate-900">
            Filters
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Refine your product results
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 transition hover:text-green-800"
        >
          <RotateCcw size={14} />
          Reset
        </button>
      </div>

      <FilterSection
        title="Brand"
        open={openSections.brand ?? true}
        onToggle={() => toggleSection("brand")}
      >
        {brands.length > 0 ? (
          <>
            <div className="sticky top-0 z-10 bg-white pb-3">
              <FilterSearchInput
                value={filterSearches.brand || ""}
                onChange={(value) =>
                  updateFilterSearch("brand", value)
                }
                placeholder="Search brands"
              />
            </div>

            <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
              {filteredBrands.length > 0 ? (
                filteredBrands.map((brand) => (
                  <FilterOption
                    key={brand}
                    checked={selectedBrands.includes(
                      brand
                    )}
                    onChange={() =>
                      toggleBrand(brand)
                    }
                    label={brand}
                  />
                ))
              ) : (
                <EmptyFilterMessage text="No matching brands." />
              )}
            </div>
          </>
        ) : (
          <EmptyFilterMessage text="No brands available." />
        )}
      </FilterSection>

      {Object.entries(dynamicSpecs).map(
        ([key, configuration]) => {
          const values = Array.isArray(
            configuration?.values
          )
            ? configuration.values
            : [];

          if (values.length === 0) return null;

          const sectionOpen =
            openSections[key] ?? true;

          const searchable =
            searchableSpecificationKeys.includes(key) ||
            values.length > AUTO_SEARCH_THRESHOLD;

          const searchQuery = String(
            filterSearches[key] || ""
          )
            .trim()
            .toLowerCase();

          const filteredValues = searchQuery
            ? values.filter((value) =>
                String(value)
                  .toLowerCase()
                  .includes(searchQuery)
              )
            : values;

          const label =
            configuration.label || key;

          return (
            <FilterSection
              key={key}
              title={label}
              open={sectionOpen}
              onToggle={() => toggleSection(key)}
            >
              {searchable && (
                <div className="sticky top-0 z-10 bg-white pb-3">
                  <FilterSearchInput
                    value={filterSearches[key] || ""}
                    onChange={(value) =>
                      updateFilterSearch(key, value)
                    }
                    placeholder={`Search ${label}`}
                  />
                </div>
              )}

              <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
                {filteredValues.length > 0 ? (
                  filteredValues.map((value) => {
                    const checked = Array.isArray(
                      selectedSpecs[key]
                    )
                      ? selectedSpecs[key].includes(
                          value
                        )
                      : false;

                    return (
                      <FilterOption
                        key={`${key}-${value}`}
                        checked={checked}
                        onChange={() =>
                          toggleSpecification(
                            key,
                            value
                          )
                        }
                        label={value}
                      />
                    );
                  })
                ) : (
                  <EmptyFilterMessage text="No matching options." />
                )}
              </div>
            </FilterSection>
          );
        }
      )}

      <FilterSection
        title="Price"
        open={openSections.price ?? true}
        onToggle={() => toggleSection("price")}
      >
        {safeMaximum > safeMinimum ? (
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Minimum</span>
              <span>Maximum</span>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-3">
              <PriceInput
                value={minPrice}
                min={safeMinimum}
                max={maxPrice}
                onChange={handleMinimumPrice}
              />

              <PriceInput
                value={maxPrice}
                min={minPrice}
                max={safeMaximum}
                onChange={handleMaximumPrice}
              />
            </div>

            <div className="relative mt-7 h-6">
              <div className="absolute left-0 right-0 top-2 h-1 rounded-full bg-slate-200" />

              <div
                className="absolute top-2 h-1 rounded-full bg-green-600"
                style={{
                  left: `${Math.max(
                    Math.min(minimumPercentage, 100),
                    0
                  )}%`,
                  right: `${Math.max(
                    Math.min(
                      100 - maximumPercentage,
                      100
                    ),
                    0
                  )}%`,
                }}
              />

              <PriceRangeInput
                min={safeMinimum}
                max={safeMaximum}
                value={minPrice}
                onChange={handleMinimumPrice}
              />

              <PriceRangeInput
                min={safeMinimum}
                max={safeMaximum}
                value={maxPrice}
                onChange={handleMaximumPrice}
              />
            </div>

            <div className="mt-2 flex justify-between text-xs text-slate-400">
              <span>
                ₵{safeMinimum.toLocaleString()}
              </span>

              <span>
                ₵{safeMaximum.toLocaleString()}
              </span>
            </div>
          </div>
        ) : (
          <EmptyFilterMessage text="Price range is unavailable." />
        )}
      </FilterSection>

      <FilterSection
        title="Availability"
        open={openSections.availability ?? true}
        onToggle={() =>
          toggleSection("availability")
        }
      >
        <FilterOption
          checked={Boolean(inStockOnly)}
          onChange={(event) =>
            setInStockOnly(event.target.checked)
          }
          label="In stock only"
        />
      </FilterSection>
    </aside>
  );
}

function FilterSection({
  title,
  open,
  onToggle,
  children,
}) {
  return (
    <div className="border-b border-slate-200 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="group flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-green-50/50"
      >
        <span className="font-semibold text-slate-900 transition group-hover:text-green-700">
          {title}
        </span>

        <ChevronDown
          size={18}
          className={`shrink-0 text-green-600 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="px-5 pb-5">
          {children}
        </div>
      )}
    </div>
  );
}

function FilterSearchInput({
  value,
  onChange,
  placeholder,
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 transition focus-within:border-green-500 focus-within:ring-4 focus-within:ring-green-100">
      <Search
        size={15}
        className="shrink-0 text-slate-400"
      />

      <input
        type="search"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-slate-400"
      />
    </div>
  );
}

function FilterOption({
  checked,
  onChange,
  label,
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-600 transition hover:text-green-700">
      <input
        type="checkbox"
        checked={Boolean(checked)}
        onChange={onChange}
        className="h-4 w-4 shrink-0 accent-green-600"
      />

      <span className="break-words">
        {label}
      </span>
    </label>
  );
}

function EmptyFilterMessage({ text }) {
  return (
    <p className="text-sm text-slate-400">
      {text}
    </p>
  );
}

function PriceInput({
  value,
  min,
  max,
  onChange,
}) {
  return (
    <div className="flex items-center rounded-lg border border-slate-300 bg-white px-3 transition focus-within:border-green-500 focus-within:ring-4 focus-within:ring-green-100">
      <span className="text-sm text-slate-400">
        ₵
      </span>

      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm outline-none"
      />
    </div>
  );
}

function PriceRangeInput({
  min,
  max,
  value,
  onChange,
}) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(event) =>
        onChange(event.target.value)
      }
      className="pointer-events-none absolute left-0 top-0 h-5 w-full appearance-none bg-transparent
      [&::-webkit-slider-thumb]:pointer-events-auto
      [&::-webkit-slider-thumb]:h-5
      [&::-webkit-slider-thumb]:w-5
      [&::-webkit-slider-thumb]:cursor-pointer
      [&::-webkit-slider-thumb]:appearance-none
      [&::-webkit-slider-thumb]:rounded-full
      [&::-webkit-slider-thumb]:border-2
      [&::-webkit-slider-thumb]:border-white
      [&::-webkit-slider-thumb]:bg-green-600
      [&::-webkit-slider-thumb]:shadow-md
      [&::-moz-range-thumb]:pointer-events-auto
      [&::-moz-range-thumb]:h-5
      [&::-moz-range-thumb]:w-5
      [&::-moz-range-thumb]:cursor-pointer
      [&::-moz-range-thumb]:rounded-full
      [&::-moz-range-thumb]:border-2
      [&::-moz-range-thumb]:border-white
      [&::-moz-range-thumb]:bg-green-600"
    />
  );
}