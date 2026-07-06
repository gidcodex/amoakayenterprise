import Link from "next/link";
import { Award, BadgeCheck, ShieldCheck, Truck, HeartHandshake, Users, Star, ArrowRight,} from "lucide-react";
//export const metadata = {
  //title: "About Us | Amoakay Deals",
//};

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
    icon: <BadgeCheck size={36} />,
    title: "Quality Products",
    description:
      "Every product is carefully selected to ensure quality, durability, and excellent value.",
  },
  {
    icon: <Truck size={36} />,
    title: "Fast Delivery",
    description:
      "We process and deliver orders quickly so you receive your purchases on time.",
  },
  {
    icon: <ShieldCheck size={36} />,
    title: "Secure Shopping",
    description:
      "Safe checkout, trusted payment methods, and customer protection every step of the way.",
  },
  {
    icon: <HeartHandshake size={36} />,
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

export default function AboutPage() {
  return (
    <main>

      {/* HERO */}

      {/* HERO */}

<section className="bg-gradient-to-r from-cyan-200 via-cyan-100 to-white">
  <div className="max-w-7xl mx-auto px-6 py-24">
    <div className="max-w-3xl">

      <span className="inline-block bg-green-100 text-green-700 px-5 py-2 rounded-full text-sm font-semibold mb-6">
        ABOUT AMOAKAY DEALS
      </span>

      <h1 className="text-5xl lg:text-6xl font-bold text-slate-800 leading-tight">
        Gadgets You'll Love.
        <br />
        Prices You'll Trust.
      </h1>

      <p className="mt-8 text-lg text-slate-600 leading-8">
        Amoakay Deals is your trusted destination for quality electronics,
        gadgets, accessories, and lifestyle products. We combine
        affordability, innovation, and excellent customer service to
        create an exceptional shopping experience.
      </p>

      <div className="flex gap-5 mt-10">
        <Link
          href="/shop"
          className="bg-slate-900 text-white px-8 py-4 rounded-xl hover:bg-slate-700 transition flex items-center gap-2"
        >
          Shop Now
          <ArrowRight size={18} />
        </Link>

        <Link
          href="/contact"
          className="border border-slate-300 px-8 py-4 rounded-xl hover:bg-white transition"
        >
          Contact Us
        </Link>
      </div>

      {/* SVG IMAGES */}

    </div>
  </div>
</section>

      {/* STORY */}

      <section className="max-w-7xl mx-auto px-6 py-24">

        <div className="grid lg:grid-cols-2 gap-16 items-center">

          <div>

            <span className="text-green-600 font-semibold">
              OUR STORY
            </span>

            <h2 className="text-4xl font-bold mt-3 mb-6 text-slate-800">
              Making Shopping Easier Every Day
            </h2>

            <p className="text-slate-600 leading-8 mb-6">
              Amoakay Deals was founded with one simple goal—to make premium
              products accessible at affordable prices. From electronics and
              smart gadgets to everyday essentials, every item is carefully
              selected with quality in mind.
            </p>

            <p className="text-slate-600 leading-8">
              We believe shopping should be simple, secure, and enjoyable.
              That's why we continuously improve our services, ensuring our
              customers always receive the best value for their money.
            </p>

          </div>

          <div className="bg-slate-100 rounded-3xl p-10">

            <Award
              size={55}
              className="text-green-500 mb-6"
            />

            <h3 className="text-2xl font-semibold mb-5">
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

      <section className="bg-slate-50 py-20">

        <div className="max-w-7xl mx-auto px-6">

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">

            {stats.map((item) => (

              <div
                key={item.label}
                className="bg-white rounded-3xl shadow-sm hover:shadow-lg transition p-10 text-center"
              >

                <h2 className="text-5xl font-bold text-green-500">
                  {item.number}
                </h2>

                <p className="text-slate-600 mt-3">
                  {item.label}
                </p>

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* VALUES */}

      <section className="max-w-7xl mx-auto px-6 py-24">

        <div className="text-center mb-16">

          <span className="text-green-600 font-semibold">
            WHY CHOOSE US
          </span>

          <h2 className="text-4xl font-bold mt-3">
            Our Core Values
          </h2>

        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

          {values.map((value) => (

            <div
              key={value.title}
              className="bg-white rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-2 transition duration-300 p-8"
            >

              <div className="text-green-500 mb-5">
                {value.icon}
              </div>

              <h3 className="text-xl font-semibold mb-4">
                {value.title}
              </h3>

              <p className="text-slate-600 leading-7">
                {value.description}
              </p>

            </div>

          ))}

        </div>

      </section>

      {/* MISSION */}

      <section className="bg-slate-50 py-24">

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-8">

          <div className="bg-white rounded-3xl shadow-sm p-10">

            <h3 className="text-3xl font-bold mb-5">
              Our Mission
            </h3>

            <p className="text-slate-600 leading-8">
              To provide customers with affordable access to innovative
              products while delivering exceptional customer service and a
              secure online shopping experience.
            </p>

          </div>

          <div className="bg-white rounded-3xl shadow-sm p-10">

            <h3 className="text-3xl font-bold mb-5">
              Our Vision
            </h3>

            <p className="text-slate-600 leading-8">
              To become one of Africa's most trusted online shopping platforms,
              recognized for quality products, affordability, innovation, and
              customer satisfaction.
            </p>

          </div>

        </div>

      </section>

      {/* TEAM */}

      <section className="max-w-7xl mx-auto px-6 py-24">

        <div className="text-center mb-16">

          <span className="text-green-600 font-semibold">
            OUR TEAM
          </span>

          <h2 className="text-4xl font-bold mt-3">
            Meet the People Behind Amoakay Deals
          </h2>

        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

          {team.map((member) => (

            <div
              key={member.name}
              className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition p-8 text-center"
            >

              <div className="w-24 h-24 bg-cyan-200 rounded-full flex items-center justify-center mx-auto mb-6">

                <Users
                  size={40}
                  className="text-slate-700"
                />

              </div>

              <h3 className="font-semibold text-xl">
                {member.name}
              </h3>

              <p className="text-slate-500 mt-2">
                {member.role}
              </p>

            </div>

          ))}

        </div>

      </section>

      {/* TIMELINE */}

      <section className="bg-slate-50 py-24">

        <div className="max-w-5xl mx-auto px-6">

          <div className="text-center mb-16">

            <h2 className="text-4xl font-bold">
              Our Journey
            </h2>

          </div>

          {[
            ["2021", "Amoakay Deals was founded."],
            ["2022", "Expanded our catalogue with hundreds of products."],
            ["2023", "Reached over 1,000 satisfied customers."],
            ["2024", "Introduced faster delivery and improved customer service."],
            ["2025", "Continuing to grow and serve customers nationwide."],
          ].map(([year, event]) => (

            <div
              key={year}
              className="flex gap-8 mb-10"
            >

              <div className="text-green-500 font-bold text-2xl w-24">
                {year}
              </div>

              <div className="w-1 bg-green-400 rounded-full"></div>

              <div className="text-slate-600 leading-7">
                {event}
              </div>

            </div>

          ))}

        </div>

      </section>

      {/* CTA */}

      <section className="bg-green-500 py-20">

        <div className="max-w-5xl mx-auto text-center text-white px-6">

          <h2 className="text-4xl font-bold">
            Ready to Start Shopping?
          </h2>

          <p className="mt-5 text-lg">
            Discover quality products at prices you'll love.
          </p>

          <Link
            href="/shop"
            className="inline-block mt-10 bg-white text-green-600 font-semibold px-10 py-4 rounded-xl hover:scale-105 transition"
          >
            Visit Shop
          </Link>

        </div>

      </section>

    </main>
  );
}