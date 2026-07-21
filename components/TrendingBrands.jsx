import Link from "next/link";

const brands = [
  {
    name: "Samsung",
    href: "/shop?search=samsung",
  },
  {
    name: "Apple",
    href: "/shop?search=apple",
  },
  {
    name: "Google",
    href: "/shop?search=google",
  },
  {
    name: "Xiaomi",
    href: "/shop?search=xiaomi",
  },
  {
    name: "OnePlus",
    href: "/shop?search=oneplus",
  },
  {
    name: "Lenovo",
    href: "/shop?search=lenovo",
  },
  {
    name: "HP",
    href: "/shop?search=hp",
  },
  {
    name: "Dell",
    href: "/shop?search=dell",
  },
  {
    name: "Sony",
    href: "/shop?search=sony",
  },
  {
    name: "ASUS",
    href: "/shop?search=asus",
  },
];

export default function TrendingBrands() {
  const repeatedBrands = [...brands, ...brands];

  return (
    <section className="bg-white pt-4 pb-8 sm:pt-5 sm:pb-10">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-green-600">
              Trusted technology
            </p>

            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Trending brands
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Explore popular electronics and accessories
              from leading brands.
            </p>
          </div>

          <Link
            href="/shop"
            className="hidden text-sm font-bold text-green-700 transition hover:text-green-800 sm:block"
          >
            View all products
          </Link>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 py-4">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-slate-50 to-transparent sm:w-24"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-slate-50 to-transparent sm:w-24"
          />

          <div className="flex w-max animate-[brandMarquee_28s_linear_infinite] gap-3 px-3 hover:[animation-play-state:paused]">
            {repeatedBrands.map((brand, index) => (
              <Link
                key={`${brand.name}-${index}`}
                href={brand.href}
                aria-label={`Shop ${brand.name} products`}
                className="
                  group flex h-20 min-w-[150px]
                  items-center justify-center
                  rounded-xl
                  border border-slate-200
                  bg-white
                  px-6
                  text-center
                  shadow-sm
                  transition
                  duration-300
                  hover:-translate-y-1
                  hover:border-green-300
                  hover:shadow-md
                "
              >
                <span className="text-lg font-black tracking-tight text-slate-800 transition group-hover:text-green-700">
                  {brand.name}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <Link
          href="/shop"
          className="mt-5 inline-flex text-sm font-bold text-green-700 sm:hidden"
        >
          View all products
        </Link>
      </div>
    </section>
  );
}