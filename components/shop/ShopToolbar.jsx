"use client";

import { Search, SlidersHorizontal } from "lucide-react";

export default function ShopToolbar({
  title,
  productCount,
  sortBy,
  setSortBy,
  searchInput,
  setSearchInput,
  onSearch,
  onOpenFilters,
}) {
  return (
    <div className="border border-slate-200 bg-white">
      <div className="flex flex-col gap-5 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            {title}
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {productCount} product{productCount === 1 ? "" : "s"} found
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={onOpenFilters}
            className="inline-flex items-center justify-center gap-2 border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 lg:hidden"
          >
            <SlidersHorizontal size={18} />
            Filters
          </button>

          <form
            onSubmit={onSearch}
            className="flex min-w-0 overflow-hidden border border-slate-300 bg-white sm:min-w-[320px]"
          >
            <input
              type="text"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search within results"
              className="min-w-0 flex-1 px-4 py-3 text-sm outline-none"
            />

            <button
              type="submit"
              className="flex w-12 shrink-0 items-center justify-center bg-slate-900 text-white hover:bg-green-600"
            >
              <Search size={18} />
            </button>
          </form>

          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none"
          >
            <option value="recommended">Recommended</option>
            <option value="newest">Newest arrivals</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name">Name: A to Z</option>
          </select>
        </div>
      </div>
    </div>
  );
}