import { getCategories } from "@/lib/categories";

import CategoryMegaMenu from "./CategoryMegaMenu";
import HeroSlider from "./hero/HeroSlider";
import HeroMarketplaceStrip from "./hero/HeroMarketplaceStrip";

export default async function Hero() {
  const currency =
    process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "₵";

  let categories = [];

  try {
    categories = await getCategories();
  } catch (error) {
    console.error(
      "Failed to load hero categories:",
      error
    );
  }

  return (
    <section className="overflow-hidden bg-white">
      <HeroMarketplaceStrip currency={currency} />

      <div className="mx-auto max-w-[1600px] px-3 pb-0 pt-5 sm:px-6 sm:pb-0 sm:pt-7 lg:px-8">
        <div className="grid items-stretch gap-4 xl:grid-cols-[250px_minmax(0,1fr)]">
          <CategoryMegaMenu
            mode="sidebar"
            initialCategories={categories}
            className="hidden xl:block"
          />

          <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-xl">
            <HeroSlider />
          </div>
        </div>
      </div>
    </section>
  );
}