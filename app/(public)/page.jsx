import BestSelling from "@/components/BestSelling";
import Hero from "@/components/Hero";
import ShopByCategory from "@/components/ShopByCategory";
import LatestProducts from "@/components/LatestProducts";
import Newsletter from "@/components/Newsletter";
import OurSpecs from "@/components/OurSpec";
import RecentlyViewed from "@/components/RecentlyViewed";
import TrendingBrands from "@/components/TrendingBrands";

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-white">
      {/* =====================================================
          HERO
          Keep the existing hero slider unchanged
      ===================================================== */}
      <section className="relative">
        <Hero />
      </section>

      {/* =====================================================
          TRENDING BRANDS
      ===================================================== */}
      <section className="relative bg-white">
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute inset-x-0 top-0
            h-40
            bg-gradient-to-b
            from-slate-50/80
            to-transparent
          "
        />

        <div className="relative">
          <TrendingBrands />
        </div>
      </section>

      {/* =====================================================
          SHOP BY CATEGORY
          Keep the current structure unchanged
      ===================================================== */}
      <section
        className="
          relative
          overflow-hidden
          bg-gradient-to-b
          from-white
          via-slate-50/40
          to-white
        "
      >
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute -left-24 top-24
            h-72 w-72
            rounded-full
            bg-green-100/40
            blur-[110px]
          "
        />

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute -right-24 bottom-10
            h-72 w-72
            rounded-full
            bg-blue-100/40
            blur-[110px]
          "
        />

        <div className="relative">
          <ShopByCategory />
        </div>
      </section>

      {/* =====================================================
          LATEST PRODUCTS
      ===================================================== */}
      <section
        className="
          relative
          overflow-hidden
          border-y border-slate-100
          bg-gradient-to-b
          from-slate-50/70
          via-white
          to-white
        "
      >
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute left-1/2 top-0
            h-72 w-[70%]
            -translate-x-1/2
            rounded-full
            bg-blue-100/30
            blur-[120px]
          "
        />

        <div className="relative z-10">
          <LatestProducts />
        </div>
      </section>

      {/* =====================================================
          BEST SELLING
      ===================================================== */}
      <section
        className="
          relative
          overflow-hidden
          bg-white
        "
      >
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute -right-32 top-32
            h-80 w-80
            rounded-full
            bg-emerald-100/35
            blur-[120px]
          "
        />

        <div className="relative">
          <BestSelling />
        </div>
      </section>

      {/* =====================================================
          RECENTLY VIEWED
      ===================================================== */}
      <section
        className="
          relative
          overflow-hidden
          border-y border-slate-100
          bg-gradient-to-b
          from-slate-50/70
          via-white
          to-slate-50/50
        "
      >
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute -left-28 bottom-0
            h-80 w-80
            rounded-full
            bg-indigo-100/30
            blur-[120px]
          "
        />

        <div className="relative">
          <RecentlyViewed />
        </div>
      </section>

      {/* =====================================================
          TRUST / SHOPPING BENEFITS
      ===================================================== */}
      <section
        className="
          relative
          overflow-hidden
          bg-white
        "
      >
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute inset-x-0 top-1/2
            h-64
            -translate-y-1/2
            bg-gradient-to-r
            from-green-50/60
            via-transparent
            to-blue-50/60
          "
        />

        <div className="relative">
          <OurSpecs />
        </div>
      </section>

      {/* =====================================================
          NEWSLETTER
      ===================================================== */}
      <section
        className="
          relative
          overflow-hidden
          border-t border-slate-100
          bg-gradient-to-b
          from-slate-50/70
          to-white
        "
      >
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute left-1/2 top-10
            h-64 w-[75%]
            -translate-x-1/2
            rounded-full
            bg-green-100/35
            blur-[120px]
          "
        />

        <div className="relative">
          <Newsletter />
        </div>
      </section>
    </main>
  );
}