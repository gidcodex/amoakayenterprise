import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

const brands = [
  {
    name: "Samsung",
    href: "/shop?search=samsung",
    color: "#1428A0",
    background: "#EEF2FF",
  },
  {
    name: "Apple",
    href: "/shop?search=apple",
    color: "#111827",
    background: "#F3F4F6",
  },
  {
    name: "Google",
    href: "/shop?search=google",
    color: "#4285F4",
    background: "#EFF6FF",
  },
  {
    name: "Xiaomi",
    href: "/shop?search=xiaomi",
    color: "#FF6900",
    background: "#FFF7ED",
  },
  {
    name: "OnePlus",
    href: "/shop?search=oneplus",
    color: "#EB0029",
    background: "#FFF1F2",
  },
  {
    name: "Lenovo",
    href: "/shop?search=lenovo",
    color: "#E2231A",
    background: "#FEF2F2",
  },
  {
    name: "HP",
    href: "/shop?search=hp",
    color: "#0096D6",
    background: "#F0F9FF",
  },
  {
    name: "Dell",
    href: "/shop?search=dell",
    color: "#0076CE",
    background: "#EFF6FF",
  },
  {
    name: "Sony",
    href: "/shop?search=sony",
    color: "#111827",
    background: "#F8FAFC",
  },
  {
    name: "ASUS",
    href: "/shop?search=asus",
    color: "#00539B",
    background: "#EFF6FF",
  },
];

export default function TrendingBrands() {
  const repeatedBrands = [...brands, ...brands];

  return (
    <section className="relative overflow-hidden bg-white py-10 sm:py-12 lg:py-14">
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute -left-24 top-8
          h-72 w-72
          rounded-full
          bg-green-100/45
          blur-[110px]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute -right-28 bottom-0
          h-80 w-80
          rounded-full
          bg-blue-100/40
          blur-[120px]
        "
      />

      <div className="relative mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-green-100 bg-green-50 px-3 py-1.5">
              <Sparkles size={14} className="text-green-600" />

              <span className="text-[11px] font-black uppercase tracking-[0.18em] text-green-700">
                Trusted technology
              </span>
            </div>

            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Shop leading global brands
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
              Discover electronics, smart devices and accessories from popular
              technology brands.
            </p>
          </div>

          <Link
            href="/shop"
            className="
              group
              inline-flex
              w-fit
              items-center
              gap-2
              rounded-full
              border border-slate-200
              bg-white
              px-4 py-2.5
              text-sm
              font-black
              text-slate-700
              shadow-sm
              transition-all duration-300
              hover:-translate-y-0.5
              hover:border-green-300
              hover:text-green-700
              hover:shadow-md
            "
          >
            View all products

            <ArrowRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>

        <div
          className="
            relative
            overflow-hidden
            rounded-[28px]
            border border-slate-200/80
            bg-gradient-to-br
            from-white
            via-slate-50/90
            to-white
            px-3 py-5
            shadow-[0_20px_60px_rgba(15,23,42,0.08)]
            sm:px-4 sm:py-6
          "
        >
          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute inset-x-0 top-0
              h-px
              bg-gradient-to-r
              from-transparent
              via-green-400/70
              to-transparent
            "
          />

          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute inset-y-0 left-0 z-10
              w-16
              bg-gradient-to-r
              from-white
              via-white/90
              to-transparent
              sm:w-28
            "
          />

          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute inset-y-0 right-0 z-10
              w-16
              bg-gradient-to-l
              from-white
              via-white/90
              to-transparent
              sm:w-28
            "
          />

          <div
            className="
              flex
              w-max
              animate-[brandMarquee_30s_linear_infinite]
              gap-4
              px-2
              hover:[animation-play-state:paused]
              sm:gap-5
            "
          >
            {repeatedBrands.map((brand, index) => (
              <Link
                key={`${brand.name}-${index}`}
                href={brand.href}
                aria-label={`Shop ${brand.name} products`}
                className="
                  group
                  relative
                  flex
                  h-[112px]
                  min-w-[215px]
                  items-center
                  gap-4
                  overflow-hidden
                  rounded-2xl
                  border border-slate-200/80
                  bg-white
                  px-5
                  shadow-sm
                  transition-all duration-300
                  hover:-translate-y-1
                  hover:border-green-300
                  hover:shadow-[0_18px_40px_rgba(22,163,74,0.14)]
                  sm:min-w-[240px]
                "
              >
                <div
                  aria-hidden="true"
                  className="
                    pointer-events-none
                    absolute -right-8 -top-8
                    h-24 w-24
                    rounded-full
                    bg-green-100/50
                    blur-2xl
                    transition duration-300
                    group-hover:bg-green-200/70
                  "
                />

                <div
                  className="
                    relative
                    flex
                    h-16
                    w-24
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    border border-slate-100
                    px-3
                    shadow-sm
                    transition-transform
                    duration-300
                    group-hover:scale-105
                  "
                  style={{
                    backgroundColor: brand.background,
                  }}
                >
                  <span
                    className="text-center text-xl font-black tracking-tight sm:text-2xl"
                    style={{
                      color: brand.color,
                    }}
                  >
                    {brand.name}
                  </span>
                </div>

                <div className="relative min-w-0">
                  <p
                    className="truncate text-base font-black tracking-tight sm:text-lg"
                    style={{
                      color: brand.color,
                    }}
                  >
                    {brand.name}
                  </p>

                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    Explore products
                  </p>

                  <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-black text-green-700">
                    Shop brand

                    <ArrowRight
                      size={13}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-4 sm:hidden">
          <p className="text-xs font-semibold text-slate-500">
            Swipe to explore more brands
          </p>

          <Link
            href="/shop"
            className="inline-flex items-center gap-1 text-sm font-black text-green-700"
          >
            View all

            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}