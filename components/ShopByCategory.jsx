import Link from "next/link";
import {
  Smartphone,
  Laptop,
  Headphones,
  Camera,
  Monitor,
  Watch,
  Gamepad2,
  House,
  Cable,
} from "lucide-react";

const categories = [
  {
    name: "Phones",
    icon: Smartphone,
    href: "/shop?category=phones",
  },
  {
    name: "Laptops",
    icon: Laptop,
    href: "/shop?category=laptops",
  },
  {
    name: "Audio",
    icon: Headphones,
    href: "/shop?category=audio",
  },
  {
    name: "Cameras",
    icon: Camera,
    href: "/shop?category=cameras",
  },
  {
    name: "Monitors",
    icon: Monitor,
    href: "/shop?category=monitors",
  },
  {
    name: "Smartwatches",
    icon: Watch,
    href: "/shop?category=smartwatches",
  },
  {
    name: "Gaming",
    icon: Gamepad2,
    href: "/shop?category=gaming",
  },
  {
    name: "Home Electronics",
    icon: House,
    href: "/shop?category=home",
  },
  {
    name: "Accessories",
    icon: Cable,
    href: "/shop?category=accessories",
  },
];

export default function ShopByCategory() {
  return (
    <section className="bg-white py-12">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-green-600">
            Shop your way
          </p>

          <h2 className="mt-2 text-3xl font-black text-slate-900">
            Shop by Category
          </h2>

          <p className="mt-2 text-slate-500">
            Find exactly what you're looking for.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
          {categories.map((category) => {
            const Icon = category.icon;

            return (
              <Link
                key={category.name}
                href={category.href}
                className="
                  group rounded-2xl
                  border border-slate-200
                  bg-white
                  p-6
                  shadow-sm
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:border-green-400
                  hover:shadow-xl
                "
              >
                <div className="mb-4 inline-flex rounded-xl bg-green-50 p-4">
                  <Icon
                    className="text-green-600"
                    size={30}
                  />
                </div>

                <h3 className="font-bold text-slate-900">
                  {category.name}
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Browse products
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}