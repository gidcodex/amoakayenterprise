"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  FolderTree,
  ImageIcon,
  Menu,
} from "lucide-react";

export default function CategoryMegaMenu({
  mode = "navbar",
  className = "",
}) {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSubcategory, setActiveSubcategory] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        const data = await response.json();

        if (response.ok) {
          const fetchedCategories = data.categories || [];

          setCategories(fetchedCategories);

          if (fetchedCategories.length > 0) {
            setActiveCategory(fetchedCategories[0]);

            if (fetchedCategories[0].subcategories?.length > 0) {
              setActiveSubcategory(
                fetchedCategories[0].subcategories[0]
              );
            }
          }
        }
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const selectCategory = (category) => {
    setActiveCategory(category);

    setActiveSubcategory(
      category.subcategories?.length > 0
        ? category.subcategories[0]
        : null
    );
  };

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  if (categories.length === 0) {
    return null;
  }

  if (mode === "sidebar") {
    return (
      <aside
        className={`relative border border-slate-200 bg-white ${className}`}
        onMouseLeave={() => {
          setActiveCategory(null);
          setActiveSubcategory(null);
        }}
      >
        <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
          <Menu size={19} className="text-slate-700" />

          <h2 className="font-bold text-slate-900">
            Shop by category
          </h2>
        </div>

        <nav className="p-2">
          {categories.slice(0, 10).map((category) => (
            <div
              key={category.id}
              onMouseEnter={() => selectCategory(category)}
            >
              <Link
                href={`/shop?category=${encodeURIComponent(
                  category.name
                )}`}
                className="group flex items-center justify-between px-3 py-3 text-sm font-semibold text-slate-600 transition hover:bg-green-50 hover:text-green-700"
              >
                <span className="flex min-w-0 items-center gap-3">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="h-5 w-5 shrink-0 rounded object-cover"
                    />
                  ) : (
                    <FolderTree size={18} className="shrink-0" />
                  )}

                  <span className="truncate">
                    {category.name}
                  </span>
                </span>

                <ChevronRight
                  size={16}
                  className="shrink-0 transition group-hover:translate-x-1"
                />
              </Link>
            </div>
          ))}

          <Link
            href="/shop"
            className="mt-2 flex items-center justify-between border-t border-slate-100 px-3 py-4 text-sm font-bold text-green-700"
          >
            View all categories
            <ChevronRight size={16} />
          </Link>
        </nav>

        {activeCategory && (
          <DesktopFlyout
            category={activeCategory}
            activeSubcategory={activeSubcategory}
            setActiveSubcategory={setActiveSubcategory}
          />
        )}
      </aside>
    );
  }

  return (
    <div
      className={`relative ${className}`}
      onMouseLeave={() => {
        setActiveCategory(null);
        setActiveSubcategory(null);
      }}
    >
      <button
        type="button"
        onClick={() => setMobileOpen((current) => !current)}
        className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-800 shadow-sm transition hover:border-green-300 hover:text-green-700"
      >
        <Menu size={20} />
        All Categories

        <ChevronDown
          size={17}
          className={`transition-transform ${
            mobileOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`absolute left-0 top-full z-50 mt-3 w-[920px] max-w-[90vw] border border-slate-200 bg-white shadow-2xl ${
          mobileOpen ? "block" : "hidden"
        }`}
      >
        <div className="grid grid-cols-[240px_minmax(0,1fr)]">
          <nav className="border-r border-slate-200 p-2">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onMouseEnter={() => selectCategory(category)}
                onClick={() => selectCategory(category)}
                className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold transition ${
                  activeCategory?.id === category.id
                    ? "bg-green-50 text-green-700"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className="flex min-w-0 items-center gap-3">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="h-5 w-5 shrink-0 rounded object-cover"
                    />
                  ) : (
                    <FolderTree size={18} />
                  )}

                  <span className="truncate">{category.name}</span>
                </span>

                <ChevronRight size={16} />
              </button>
            ))}
          </nav>

          {activeCategory && (
            <MegaMenuContent
              category={activeCategory}
              activeSubcategory={activeSubcategory}
              setActiveSubcategory={setActiveSubcategory}
              onNavigate={closeMobileMenu}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function DesktopFlyout({
  category,
  activeSubcategory,
  setActiveSubcategory,
}) {
  return (
    <div
      className="absolute left-full top-0 z-50 ml-2 min-h-full w-[700px] border border-slate-200 bg-white p-6 shadow-2xl"
      onMouseEnter={() => {}}
    >
      <MegaMenuContent
        category={category}
        activeSubcategory={activeSubcategory}
        setActiveSubcategory={setActiveSubcategory}
      />
    </div>
  );
}

function MegaMenuContent({
  category,
  activeSubcategory,
  setActiveSubcategory,
  onNavigate,
}) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-green-600">
            Featured category
          </p>

          <h2 className="mt-1 text-2xl font-black text-slate-900">
            {category.name}
          </h2>
        </div>

        <Link
          href={`/shop?category=${encodeURIComponent(
            category.name
          )}`}
          onClick={onNavigate}
          className="text-sm font-bold text-green-700 hover:text-green-800"
        >
          View all
        </Link>
      </div>

      {category.subcategories?.length > 0 ? (
        <div className="mt-6 grid grid-cols-[190px_minmax(0,1fr)] gap-6">
          <div className="space-y-2 border-r border-slate-100 pr-4">
            {category.subcategories.map((subcategory) => (
              <button
                key={subcategory.id}
                type="button"
                onMouseEnter={() =>
                  setActiveSubcategory(subcategory)
                }
                onClick={() =>
                  setActiveSubcategory(subcategory)
                }
                className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-sm font-semibold transition ${
                  activeSubcategory?.id === subcategory.id
                    ? "bg-green-50 text-green-700"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className="truncate">{subcategory.name}</span>
                <ChevronRight size={15} />
              </button>
            ))}
          </div>

          <div>
            {activeSubcategory ? (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900">
                    {activeSubcategory.name}
                  </h3>

                  <Link
                    href={`/shop?category=${encodeURIComponent(
                      category.name
                    )}&subcategory=${encodeURIComponent(
                      activeSubcategory.name
                    )}`}
                    onClick={onNavigate}
                    className="text-xs font-bold text-green-700"
                  >
                    View all
                  </Link>
                </div>

                {activeSubcategory.childCategories?.length > 0 ? (
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {activeSubcategory.childCategories.map((child) => (
                      <Link
                        key={child.id}
                        href={`/shop?category=${encodeURIComponent(
                          category.name
                        )}&subcategory=${encodeURIComponent(
                          activeSubcategory.name
                        )}&child=${encodeURIComponent(child.name)}`}
                        onClick={onNavigate}
                        className="group flex items-center gap-3 border border-slate-100 bg-slate-50 p-3 transition hover:border-green-200 hover:bg-green-50"
                      >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded bg-white">
                          {child.image ? (
                            <img
                              src={child.image}
                              alt={child.name}
                              className="h-full w-full object-cover transition group-hover:scale-105"
                            />
                          ) : (
                            <ImageIcon
                              size={20}
                              className="text-slate-400"
                            />
                          )}
                        </div>

                        <span className="text-sm font-semibold text-slate-700 group-hover:text-green-700">
                          {child.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link
                    href={`/shop?category=${encodeURIComponent(
                      category.name
                    )}&subcategory=${encodeURIComponent(
                      activeSubcategory.name
                    )}`}
                    onClick={onNavigate}
                    className="mt-4 flex min-h-32 items-center justify-center border border-dashed border-slate-200 bg-slate-50 text-sm font-semibold text-slate-500 hover:border-green-300 hover:text-green-700"
                  >
                    Browse {activeSubcategory.name}
                  </Link>
                )}
              </>
            ) : (
              <p className="text-sm text-slate-400">
                Select a subcategory.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <p className="text-sm text-slate-400">
            No subcategories available.
          </p>
        </div>
      )}
    </div>
  );
}