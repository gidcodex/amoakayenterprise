import Link from "next/link";
import {
  Award,
  BadgeCheck,
  ShieldCheck,
  Truck,
  HeartHandshake,
  Users,
  ArrowRight,
} from "lucide-react";

const stats = [
  {
    number: "500+",
    label: "Products",
  },
  {
    number: "2,000+",
    label: "Happy Customers",
  },
  {
    number: "99%",
    label: "Customer Satisfaction",
  },
  {
    number: "24/7",
    label: "Support",
  },
];

const values = [
  {
    icon: <BadgeCheck size={32} />,
    title: "Quality Products",
    description:
      "Every product is carefully selected to ensure quality, durability, and excellent value.",
  },
  {
    icon: <Truck size={32} />,
    title: "Fast Delivery",
    description:
      "We process and deliver orders quickly so you receive your purchases on time.",
  },
  {
    icon: <ShieldCheck size={32} />,
    title: "Secure Shopping",
    description:
      "Safe checkout, trusted payment methods, and customer protection every step of the way.",
  },
  {
    icon: <HeartHandshake size={32} />,
    title: "Customer First",
    description:
      "Your satisfaction is our priority. We're committed to providing exceptional service.",
  },
];

const team = [
  {
    name: "Amoako",
    role: "Founder & CEO",
  },
  {
    name: "Sandra",
    role: "Operations Manager",
  },
  {
    name: "Michael",
    role: "Customer Support",
  },
  {
    name: "Linda",
    role: "Marketing Lead",
  },
];

const journey = [
  ["2021", "Amoakay Deals was founded."],
  ["2022", "Expanded our catalogue with hundreds of products."],
  ["2023", "Reached over 1,000 satisfied customers."],
  ["2024", "Introduced faster delivery and improved customer service."],
  ["2025", "Continuing to grow and serve customers nationwide."],
];

export default function AboutPage() {
  return (
    <main className="overflow-x-hidden">
      {/* HERO */}
      <section className="bg-gradient-to-r from-cyan-200 via-cyan-100 to-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:py-24">
          <div className="max-w-3xl">
            <span className="inline-block rounded-full bg-green-100 px-4 py-2 text-xs font-semibold text-green-700 sm:px-5 sm:text-sm">
              ABOUT AMOAKAY DEALS
            </span>

            <h1 className="mt-6 text-4xl font-bold leading-tight text-slate-800 sm:text-5xl lg:text-6xl">
              Gadgets You&apos;ll Love.
              <br />
              Prices You&apos;ll Trust.
            </h1>

            <p className="mt-6 text-base leading-7 text-slate-600 sm:mt-8 sm:text-lg sm:leading-8">
              Amoakay Deals is your trusted destination for quality
              electronics, gadgets, accessories, and lifestyle products. We
              combine affordability, innovation, and excellent customer service
              to create an exceptional shopping experience.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:gap-5">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 text-white transition hover:bg-slate-700 sm:px-8 sm:py-4"
              >
                Shop Now
                <ArrowRight size={18} />
              </Link>

              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-6 py-3.5 transition hover:bg-white sm:px-8 sm:py-4"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* STORY */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <span className="font-semibold text-green-600">OUR STORY</span>

            <h2 className="mt-3 text-3xl font-bold text-slate-800 sm:text-4xl">
              Making Shopping Easier Every Day
            </h2>

            <p className="mt-6 leading-7 text-slate-600 sm:leading-8">
              Amoakay Deals was founded with one simple goal—to make premium
              products accessible at affordable prices. From electronics and
              smart gadgets to everyday essentials, every item is carefully
              selected with quality in mind.
            </p>

            <p className="mt-5 leading-7 text-slate-600 sm:leading-8">
              We believe shopping should be simple, secure, and enjoyable.
              That&apos;s why we continuously improve our services, ensuring
              our customers always receive the best value for their money.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-100 p-6 sm:rounded-3xl sm:p-10">
            <Award size={50} className="mb-6 text-green-500" />

            <h3 className="mb-5 text-2xl font-semibold">
              Why Customers Trust Us
            </h3>

            <ul className="space-y-4 text-slate-600">
              <li>✔ Carefully Selected Products</li>
              <li>✔ Affordable Pricing</li>
              <li>✔ Secure Checkout</li>
              <li>✔ Excellent Customer Support</li>
              <li>✔ Fast Delivery</li>
              <li>✔ Satisfaction Guaranteed</li>
            </ul>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-slate-50 py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4 lg:gap-8">
            {stats.map((item) => (
              <div
                key={item.label}
                className="flex min-w-0 flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white px-3 py-8 text-center shadow-sm transition hover:shadow-lg sm:rounded-3xl sm:px-5 sm:py-10"
              >
                <h2 className="max-w-full break-words text-[clamp(2rem,8vw,4rem)] font-bold leading-none tracking-tight text-green-500">
                  {item.number}
                </h2>

                <p className="mt-4 max-w-[9rem] text-sm leading-5 text-slate-600 sm:text-base sm:leading-6">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:py-24">
        <div className="mb-10 text-center sm:mb-16">
          <span className="font-semibold text-green-600">WHY CHOOSE US</span>

          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            Our Core Values
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {values.map((value) => (
            <div
              key={value.title}
              className="rounded-2xl bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:rounded-3xl sm:p-8"
            >
              <div className="mb-5 text-green-500">{value.icon}</div>

              <h3 className="mb-3 text-xl font-semibold">{value.title}</h3>

              <p className="leading-7 text-slate-600">{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MISSION */}
      <section className="bg-slate-50 py-14 sm:py-20 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 lg:grid-cols-2 lg:gap-8">
          <div className="rounded-2xl bg-white p-6 shadow-sm sm:rounded-3xl sm:p-10">
            <h3 className="mb-4 text-2xl font-bold sm:text-3xl">
              Our Mission
            </h3>

            <p className="leading-7 text-slate-600 sm:leading-8">
              To provide customers with affordable access to innovative
              products while delivering exceptional customer service and a
              secure online shopping experience.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm sm:rounded-3xl sm:p-10">
            <h3 className="mb-4 text-2xl font-bold sm:text-3xl">
              Our Vision
            </h3>

            <p className="leading-7 text-slate-600 sm:leading-8">
              To become one of Africa&apos;s most trusted online shopping
              platforms, recognized for quality products, affordability,
              innovation, and customer satisfaction.
            </p>
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:py-24">
        <div className="mb-10 text-center sm:mb-16">
          <span className="font-semibold text-green-600">OUR TEAM</span>

          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            Meet the People Behind Amoakay Deals
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4 lg:gap-8">
          {team.map((member) => (
            <div
              key={member.name}
              className="min-w-0 rounded-2xl bg-white p-5 text-center shadow-sm transition hover:shadow-xl sm:rounded-3xl sm:p-8"
            >
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-cyan-200 sm:h-24 sm:w-24">
                <Users size={36} className="text-slate-700 sm:size-10" />
              </div>

              <h3 className="break-words text-lg font-semibold sm:text-xl">
                {member.name}
              </h3>

              <p className="mt-2 break-words text-sm text-slate-500 sm:text-base">
                {member.role}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* TIMELINE */}
      <section className="bg-slate-50 py-14 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-10 text-center sm:mb-16">
            <h2 className="text-3xl font-bold sm:text-4xl">Our Journey</h2>
          </div>

          <div className="space-y-7 sm:space-y-10">
            {journey.map(([year, event]) => (
              <div
                key={year}
                className="grid grid-cols-[64px_4px_minmax(0,1fr)] gap-4 sm:grid-cols-[96px_4px_minmax(0,1fr)] sm:gap-8"
              >
                <div className="text-xl font-bold text-green-500 sm:text-2xl">
                  {year}
                </div>

                <div className="min-h-14 rounded-full bg-green-400" />

                <div className="min-w-0 break-words leading-7 text-slate-600">
                  {event}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-green-500 py-14 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 text-center text-white sm:px-6">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Ready to Start Shopping?
          </h2>

          <p className="mt-4 text-base sm:mt-5 sm:text-lg">
            Discover quality products at prices you&apos;ll love.
          </p>

          <Link
            href="/shop"
            className="mt-8 inline-block rounded-xl bg-white px-8 py-3.5 font-semibold text-green-600 transition hover:scale-105 sm:mt-10 sm:px-10 sm:py-4"
          >
            Visit Shop
          </Link>
        </div>
      </section>
    </main>
  );
}