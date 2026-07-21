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
    <main className="min-h-screen bg-white">
      <Hero />

      <TrendingBrands />

      <ShopByCategory />

      <div className="relative z-10 mt-0 sm:-mt-16 lg:-mt-6">
        <LatestProducts />
      </div>

      <BestSelling />

      <RecentlyViewed />

      <OurSpecs />

      <Newsletter />
    </main>
  );
}