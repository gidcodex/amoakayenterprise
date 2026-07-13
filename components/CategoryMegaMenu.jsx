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
  onNavigate,
}) {
  const [categories, setCategories] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSubcategory, setActiveSubcategory] = useState(null);

  const [mobileCategoryId, setMobileCategoryId] = useState(null);
  const [mobileSubcategoryId, setMobileSubcategoryId] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        const data = await response.json();

        if (!response.ok) return;

        const loadedCategories = data.categories || [];

        setCategories(loadedCategories);

      

      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const getChildren = (subcategory) => {
    return (
      subcategory?.childCategories ||
      subcategory?.children ||
      []
    );
  };

  const selectDesktopCategory = (category) => {
    setActiveCategory(category);
    setActiveSubcategory(
      category.subcategories?.[0] || null
    );
  };

  const closeMenu = () => {
    setMenuOpen(false);
    setMobileCategoryId(null);
    setMobileSubcategoryId(null);
    onNavigate?.();
  };

  const toggleMobileCategory = (categoryId) => {
    setMobileCategoryId((current) =>
      current === categoryId ? null : categoryId
    );

    setMobileSubcategoryId(null);
  };

  const toggleMobileSubcategory = (subcategoryId) => {
    setMobileSubcategoryId((current) =>
      current === subcategoryId ? null : subcategoryId
    );
  };

  if (categories.length === 0) return null;

  if (mode === "sidebar") {
    return (
     <DesktopSidebar
       categories={categories}
       activeCategory={activeCategory}
       setActiveCategory={setActiveCategory}
       activeSubcategory={activeSubcategory}
       setActiveSubcategory={setActiveSubcategory}
       selectDesktopCategory={selectDesktopCategory}
       getChildren={getChildren}
       className={className}
     />
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setMenuOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-3 rounded-full border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-800 shadow-sm transition hover:border-green-300 hover:text-green-700 lg:w-auto"
        aria-expanded={menuOpen}
      >
        <span className="flex items-center gap-3">
          <Menu size={20} />
          All Categories
        </span>

        <ChevronDown
          size={18}
          className={`transition-transform duration-300 ${
            menuOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {menuOpen && (
        <>
          {/* Mobile and tablet accordion */}
          <div className="mt-4 w-full overflow-hidden border border-slate-200 bg-white shadow-xl lg:hidden">
            <div className="max-h-[65vh] overflow-y-auto">
              {categories.map((category) => {
                const categoryOpen =
                  mobileCategoryId === category.id;

                return (
                  <div
                    key={category.id}
                    className="border-b border-slate-100 last:border-b-0"
                  >
                    <div className="flex items-center">
                      <Link
                        href={`/shop?category=${encodeURIComponent(
                          category.name
                        )}`}
                        onClick={closeMenu}
                        className="flex min-w-0 flex-1 items-center gap-3 px-4 py-4 text-sm font-semibold text-slate-700 hover:bg-green-50 hover:text-green-700"
                      >
                        <CategoryImage item={category} />

                        <span className="truncate">
                          {category.name}
                        </span>
                      </Link>

                      {category.subcategories?.length > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            toggleMobileCategory(category.id)
                          }
                          className="flex h-12 w-12 shrink-0 items-center justify-center text-green-600"
                          aria-label={`Open ${category.name}`}
                        >
                          <ChevronDown
                            size={18}
                            className={`transition-transform ${
                              categoryOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                      )}
                    </div>

                    {categoryOpen && (
                      <div className="bg-slate-50 px-3 pb-3">
                        {category.subcategories?.map(
                          (subcategory) => {
                            const children =
                              getChildren(subcategory);

                            const subcategoryOpen =
                              mobileSubcategoryId ===
                              subcategory.id;

                            return (
                              <div
                                key={subcategory.id}
                                className="mt-2 overflow-hidden border border-slate-200 bg-white"
                              >
                                <div className="flex items-center">
                                  <Link
                                    href={`/shop?category=${encodeURIComponent(
                                      category.name
                                    )}&subcategory=${encodeURIComponent(
                                      subcategory.name
                                    )}`}
                                    onClick={closeMenu}
                                    className="flex min-w-0 flex-1 items-center gap-3 px-3 py-3 text-sm font-semibold text-slate-700 hover:text-green-700"
                                  >
                                    <CategoryImage
                                      item={subcategory}
                                      small
                                    />

                                    <span className="truncate">
                                      {subcategory.name}
                                    </span>
                                  </Link>

                                  {children.length > 0 && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        toggleMobileSubcategory(
                                          subcategory.id
                                        )
                                      }
                                      className="flex h-11 w-11 shrink-0 items-center justify-center text-green-600"
                                    >
                                      <ChevronDown
                                        size={17}
                                        className={`transition-transform ${
                                          subcategoryOpen
                                            ? "rotate-180"
                                            : ""
                                        }`}
                                      />
                                    </button>
                                  )}
                                </div>

                                {subcategoryOpen &&
                                  children.length > 0 && (
                                    <div className="grid grid-cols-1 gap-2 border-t border-slate-100 bg-slate-50 p-3 min-[430px]:grid-cols-2">
                                      {children.map((child) => (
                                        <Link
                                          key={child.id}
                                          href={`/shop?category=${encodeURIComponent(
                                            category.name
                                          )}&subcategory=${encodeURIComponent(
                                            subcategory.name
                                          )}&child=${encodeURIComponent(
                                            child.name
                                          )}`}
                                          onClick={closeMenu}
                                          className="flex min-w-0 items-center gap-3 border border-slate-200 bg-white p-3 hover:border-green-300 hover:bg-green-50"
                                        >
                                          <CategoryImage
                                            item={child}
                                            child
                                          />

                                          <span className="min-w-0 truncate text-xs font-semibold text-slate-700">
                                            {child.name}
                                          </span>
                                        </Link>
                                      ))}
                                    </div>
                                  )}
                              </div>
                            );
                          }
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              <Link
                href="/shop"
                onClick={closeMenu}
                className="flex items-center justify-between px-4 py-4 text-sm font-bold text-green-700"
              >
                View all products
                <ChevronRight size={17} />
              </Link>
            </div>
          </div>

          {/* Desktop mega menu */}
          <div className="absolute left-0 top-full z-[100] mt-3 hidden w-[920px] max-w-[calc(100vw-2rem)] overflow-hidden border border-slate-200 bg-white shadow-2xl lg:block">
            <div className="grid grid-cols-[240px_minmax(0,1fr)]">
              <nav className="max-h-[620px] overflow-y-auto border-r border-slate-200 p-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onMouseEnter={() =>
                      selectDesktopCategory(category)
                    }
                    onClick={() =>
                      selectDesktopCategory(category)
                    }
                    className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold transition ${
                      activeCategory?.id === category.id
                        ? "bg-green-50 text-green-700"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <CategoryImage item={category} small />

                      <span className="truncate">
                        {category.name}
                      </span>
                    </span>

                    <ChevronRight size={16} />
                  </button>
                ))}
              </nav>

              {activeCategory && (
                <MegaMenuContent
                  category={activeCategory}
                  activeSubcategory={activeSubcategory}
                  setActiveSubcategory={
                    setActiveSubcategory
                  }
                  getChildren={getChildren}
                  onNavigate={closeMenu}
                />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function DesktopSidebar({
  categories,
  activeCategory,
  setActiveCategory,
  activeSubcategory,
  setActiveSubcategory,
  selectDesktopCategory,
  getChildren,
  className,
}) {
  return (
     <aside
        className={`relative border border-slate-200 bg-white ${className}`}
        onMouseLeave={() => {
        setActiveCategory(null);
        setActiveSubcategory(null);
       }}
     >
      <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
        <Menu size={19} />
        <h2 className="font-bold text-slate-900">
          Shop by category
        </h2>
      </div>

      <nav className="p-2">
        {categories.slice(0, 10).map((category) => (
          <Link
            key={category.id}
            href={`/shop?category=${encodeURIComponent(
              category.name
            )}`}
            onMouseEnter={() =>
              selectDesktopCategory(category)
            }
            className="group flex items-center justify-between px-3 py-3 text-sm font-semibold text-slate-600 transition hover:bg-green-50 hover:text-green-700"
          >
            <span className="flex min-w-0 items-center gap-3">
              <CategoryImage item={category} small />
              <span className="truncate">
                {category.name}
              </span>
            </span>

            <ChevronRight size={16} />
          </Link>
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
                       <div className="absolute left-full top-0 z-[100] hidden min-h-full w-[700px] border border-slate-200 bg-white shadow-2xl xl:block"
                           onMouseEnter={() => {
                           setActiveCategory(activeCategory);
                             }}
                        >

          <MegaMenuContent
            category={activeCategory}
            activeSubcategory={activeSubcategory}
            setActiveSubcategory={setActiveSubcategory}
            getChildren={getChildren}
          />
        </div>
      )}
    </aside>
  );
}

function MegaMenuContent({
  category,
  activeSubcategory,
  setActiveSubcategory,
  getChildren,
  onNavigate,
}) {
  const children = getChildren(activeSubcategory);

  return (
    <div className="min-w-0 p-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-green-600">
            Featured category
          </p>

          <h2 className="mt-1 truncate text-2xl font-black text-slate-900">
            {category.name}
          </h2>
        </div>

        <Link
          href={`/shop?category=${encodeURIComponent(
            category.name
          )}`}
          onClick={onNavigate}
          className="shrink-0 text-sm font-bold text-green-700"
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
                className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-sm font-semibold ${
                  activeSubcategory?.id === subcategory.id
                    ? "bg-green-50 text-green-700"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className="truncate">
                  {subcategory.name}
                </span>

                <ChevronRight size={15} />
              </button>
            ))}
          </div>

          <div className="min-w-0">
            {activeSubcategory && (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="truncate font-bold text-slate-900">
                    {activeSubcategory.name}
                  </h3>

                  <Link
                    href={`/shop?category=${encodeURIComponent(
                      category.name
                    )}&subcategory=${encodeURIComponent(
                      activeSubcategory.name
                    )}`}
                    onClick={onNavigate}
                    className="shrink-0 text-xs font-bold text-green-700"
                  >
                    View all
                  </Link>
                </div>

                {children.length > 0 ? (
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {children.map((child) => (
                      <Link
                        key={child.id}
                        href={`/shop?category=${encodeURIComponent(
                          category.name
                        )}&subcategory=${encodeURIComponent(
                          activeSubcategory.name
                        )}&child=${encodeURIComponent(
                          child.name
                        )}`}
                        onClick={onNavigate}
                        className="group flex min-w-0 items-center gap-3 border border-slate-100 bg-slate-50 p-3 hover:border-green-200 hover:bg-green-50"
                      >
                        <CategoryImage item={child} child />

                        <span className="min-w-0 truncate text-sm font-semibold text-slate-700 group-hover:text-green-700">
                          {child.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="mt-5 text-sm text-slate-400">
                    No child categories available.
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        <p className="mt-6 text-sm text-slate-400">
          No subcategories available.
        </p>
      )}
    </div>
  );
}

function CategoryImage({
  item,
  small = false,
  child = false,
}) {
  const sizeClass = child
    ? "h-11 w-11"
    : small
    ? "h-6 w-6"
    : "h-8 w-8";

  return (
    <div
      className={`${sizeClass} flex shrink-0 items-center justify-center overflow-hidden rounded bg-white`}
    >
      {item?.image ? (
        <img
          src={item.image}
          alt={item.name || "Category"}
          className="h-full w-full object-cover"
        />
      ) : child ? (
        <ImageIcon size={18} className="text-slate-400" />
      ) : (
        <FolderTree size={18} className="text-slate-500" />
      )}
    </div>
  );
}