"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FolderTree, ImageIcon, ChevronDown } from "lucide-react";

export default function CategoryMegaMenu() {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();

      if (res.ok) {
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  if (categories.length === 0) return null;

  return (
    <div className="mx-4 md:mx-6 mt-4">
      <div
        className="relative max-w-7xl mx-auto bg-white border border-slate-100 rounded-2xl shadow-lg shadow-slate-200/50 px-4 py-3"
        onMouseLeave={() => setActiveCategory(null)}
      >
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden flex items-center justify-between w-full font-semibold text-slate-800"
        >
          Shop by Category
          <ChevronDown size={18} />
        </button>

        <div className={`${mobileOpen ? "flex" : "hidden"} lg:flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-1`}>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/shop?category=${encodeURIComponent(category.name)}`}
              onMouseEnter={() => setActiveCategory(category)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition"
            >
              {category.image ? (
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-5 h-5 rounded object-cover"
                />
              ) : (
                <FolderTree size={17} />
              )}

              {category.name}
            </Link>
          ))}
        </div>

        {activeCategory && (
          <div
            className="hidden lg:block absolute left-0 right-0 top-full mt-3 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 p-6"
            onMouseEnter={() => setActiveCategory(activeCategory)}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <p className="text-sm font-semibold text-blue-600">
                  Featured Category
                </p>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">
                  {activeCategory.name}
                </h2>
              </div>

              <Link
                href={`/shop?category=${encodeURIComponent(activeCategory.name)}`}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                View all
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-5 mt-6">
              {activeCategory.subcategories?.length > 0 ? (
                activeCategory.subcategories.map((sub) => (
                  <Link
                    key={sub.id}
                    href={`/shop?category=${encodeURIComponent(
                      activeCategory.name
                    )}&subcategory=${encodeURIComponent(sub.name)}`}
                    className="group text-center"
                  >
                    <div className="h-24 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                      {sub.image ? (
                        <img
                          src={sub.image}
                          alt={sub.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition"
                        />
                      ) : (
                        <ImageIcon size={28} className="text-slate-400" />
                      )}
                    </div>

                    <p className="text-sm font-semibold text-slate-700 mt-3 group-hover:text-blue-600">
                      {sub.name}
                    </p>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-slate-400 col-span-full">
                  No subcategories available.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}