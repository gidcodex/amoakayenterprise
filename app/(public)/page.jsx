'use client'

import BestSelling from "@/components/BestSelling";
import Hero from "@/components/Hero";
import Newsletter from "@/components/Newsletter";
import OurSpecs from "@/components/OurSpec";
import LatestProducts from "@/components/LatestProducts";
import RecentlyViewed from "@/components/RecentlyViewed";

export default function Home() {
  return (
    <div>
      <Hero />
      <div className="relative z-10 mt-0 sm:-mt-16 lg:-mt-24">
        <LatestProducts />
     </div>

      <BestSelling />

       <RecentlyViewed />

      <OurSpecs />

      <Newsletter />
    </div>
  );
}