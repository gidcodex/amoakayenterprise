
import { assets } from "@/assets/assets";
import {
  ArrowRight,
  Headphones,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Tag,
  Truck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getCategories } from "@/lib/categories";
import HeroSlider from "./hero/HeroSlider";
import CategoriesMarquee from "./CategoriesMarquee";
import CategoryMegaMenu from "./CategoryMegaMenu";

const benefits = [
  {
    icon: Truck,
    title: "Fast delivery",
    text: "Reliable delivery across Ghana",
  },
  {
    icon: ShieldCheck,
    title: "Secure shopping",
    text: "Protected payments and purchases",
  },
  {
    icon: Headphones,
    title: "Customer support",
    text: "Help whenever you need it",
  },
];

export default async function Hero() {
  const currency =
    process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "₵";

    let categories = [];

try {
  categories = await getCategories();
} catch (error) {
  console.error("Failed to load hero categories:", error);
}

  return (
    <section className="overflow-hidden bg-white">
      {/* Top marketplace strip */}
      <div className="border-y border-slate-800 bg-slate-950 text-white">
        <div className="mx-auto flex max-w-[1600px] items-center justify-center px-4 py-2.5 sm:px-6 lg:justify-between lg:px-8">
          <div className="flex items-center gap-2 text-xs font-semibold sm:text-sm">
            <PackageCheck
              size={16}
              className="shrink-0 text-green-400"
            />

            <span>
              Free shipping on orders above {currency}900
            </span>
          </div>

          <div className="hidden items-center gap-2 text-sm font-medium lg:flex">
            <ShieldCheck
              size={16}
              className="text-green-400"
            />
            Secure payments and buyer protection
          </div>

          <div className="hidden items-center gap-2 text-sm font-medium xl:flex">
            <Headphones
              size={16}
              className="text-green-400"
            />
            Customer support when you need it
          </div>

          <Link
            href="/shop"
            className="hidden items-center gap-2 text-sm font-semibold text-green-400 transition hover:text-green-300 2xl:flex"
          >
            Explore marketplace
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>

     <div className="mx-auto max-w-[1600px] px-3 pt-5 pb-0 sm:px-6 sm:pt-7 sm:pb-0 lg:px-8">
        {/* Main hero layout */}
       <div className="grid items-stretch gap-4 xl:grid-cols-[250px_minmax(0,1fr)]">
          {/* Desktop categories */}
          <CategoryMegaMenu
            mode="sidebar"
            initialCategories={categories}
            className="hidden xl:block"
          />

          {/* Hero Slider */}
         <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-xl">
         <HeroSlider />
         </div>
        </div>

        {/* Category marquee 
        <div className="mt-4 pb-3">
          <CategoriesMarquee />
        </div> */}
      </div>
    </section>
  );
}