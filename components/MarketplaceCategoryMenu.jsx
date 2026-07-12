"use client";

import { useEffect, useState, useRef} from "react";
import Link from "next/link";
import { ChevronRight, FolderTree, ImageIcon, Menu } from "lucide-react";


export default function MarketplaceCategoryMenu() {
  const [categories, setCategories] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSubcategory, setActiveSubcategory] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setMenuOpen(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();

      if (res.ok) {
        const list = data.categories || [];
        setCategories(list);
        setActiveCategory(list[0] || null);
        setActiveSubcategory(list[0]?.subcategories?.[0] || null);
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
  <div className="relative z-50">
    <div ref={menuRef} className="relative pb-3">
       <button type="button"
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-2.5 shadow-sm font-semibold text-slate-900 hover:bg-slate-50 transition"
       >
          <Menu size={20} />
          All Categories
        </button>

        {menuOpen && (
           <div className="absolute left-0 top-full w-[1100px] bg-white border border-slate-100 rounded-3xl shadow-2xl shadow-slate-300/60 overflow-hidden">
            <div className="grid grid-cols-[280px_320px_1fr] min-h-[430px]">
              <div className="bg-slate-50 border-r border-slate-100 py-4">
                {categories.map((category) => {
                  const active = activeCategory?.id === category.id;

                  return (
                    <button
                      key={category.id}
                      onMouseEnter={() => {
                        setActiveCategory(category);
                        setActiveSubcategory(category.subcategories?.[0] || null);
                      }}
                      className={`w-full flex items-center justify-between px-5 py-3 text-left transition ${
                        active
                          ? "bg-white text-blue-600 font-bold"
                          : "text-slate-600 hover:bg-white"
                      }`}
                    >
                      <span className="flex items-center gap-3 min-w-0">
                        {category.image ? (
                          <img
                            src={category.image}
                            alt={category.name}
                            className="w-6 h-6 rounded object-cover shrink-0"
                          />
                        ) : (
                          <FolderTree size={18} />
                        )}

                        <span className="truncate">{category.name}</span>
                      </span>

                      <ChevronRight size={16} />
                    </button>
                  );
                })}
              </div>

              <div className="bg-white border-r border-slate-100">
                <div className="px-6 py-5 border-b border-slate-100">
                  <p className="text-sm font-semibold text-blue-600">
                    {activeCategory?.name}
                  </p>
                </div>

                <div className="p-4 space-y-2">
                  {activeCategory?.subcategories?.length > 0 ? (
                    activeCategory.subcategories.map((sub) => {
                      const active = activeSubcategory?.id === sub.id;

                      return (
                        <Link
                          key={sub.id}
                          href={`/shop?category=${encodeURIComponent(
                            activeCategory.name
                          )}&subcategory=${encodeURIComponent(sub.name)}`}
                          onMouseEnter={() => setActiveSubcategory(sub)}
                          className={`flex items-center justify-between rounded-2xl p-4 transition ${
                            active
                              ? "bg-blue-50 border border-blue-100"
                              : "hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-100 shrink-0">
                              {sub.image ? (
                                <img
                                  src={sub.image}
                                  alt={sub.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <ImageIcon
                                  size={22}
                                  className="w-full h-full p-3 text-slate-400"
                                />
                              )}
                            </div>

                            <h3 className="font-bold text-lg text-slate-900 truncate">
                              {sub.name}
                            </h3>
                          </div>

                          <ChevronRight
                            size={20}
                            className={active ? "text-blue-600" : "text-slate-400"}
                          />
                        </Link>
                      );
                    })
                  ) : (
                    <p className="text-sm text-slate-400 p-3">
                      No subcategories available.
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-br from-white via-blue-50/40 to-white p-7">
                <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                  <div>
                    <p className="text-sm font-semibold text-blue-600">
                      Explore
                    </p>
                    <h2 className="text-3xl font-bold text-slate-900 mt-1">
                      {activeSubcategory?.name || activeCategory?.name}
                    </h2>
                  </div>

                  {activeSubcategory && (
                    <Link
                      href={`/shop?category=${encodeURIComponent(
                        activeCategory.name
                      )}&subcategory=${encodeURIComponent(activeSubcategory.name)}`}
                      className="text-sm font-semibold text-blue-600"
                    >
                      View all
                    </Link>
                  )}
                </div>

                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 mt-6">
                  {activeSubcategory?.childCategories?.length > 0 ? (
                    activeSubcategory.childCategories.map((child) => (
                      <Link
                        key={child.id}
                        href={`/shop?category=${encodeURIComponent(
                          activeCategory.name
                        )}&subcategory=${encodeURIComponent(
                          activeSubcategory.name
                        )}&child=${encodeURIComponent(child.name)}`}
                        className="group bg-white border border-slate-100 rounded-2xl p-4 hover:shadow-lg hover:-translate-y-1 transition"
                      >
                        <div className="h-24 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center">
                          {child.image ? (
                            <img
                              src={child.image}
                              alt={child.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition"
                            />
                          ) : (
                            <ImageIcon size={28} className="text-slate-400" />
                          )}
                        </div>

                        <p className="font-bold text-slate-900 mt-3 group-hover:text-blue-600">
                          {child.name}
                        </p>
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400 col-span-full">
                      Hover a subcategory to see child categories.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
   </div>
  );
}