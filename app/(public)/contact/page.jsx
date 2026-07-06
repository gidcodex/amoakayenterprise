"use client";

import toast from "react-hot-toast";
import { useState } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  Facebook,
  Instagram,
  Twitter,
  MessageCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const contactCards = [
  { icon: <Phone size={26} />, title: "Phone", value: "+233 XX XXX XXXX" },
  { icon: <Mail size={26} />, title: "Email", value: "support@amoakaydeals.com" },
  { icon: <MapPin size={26} />, title: "Address", value: "Accra, Ghana" },
  { icon: <Clock size={26} />, title: "Working Hours", value: "Mon - Fri • 8:00 AM - 6:00 PM" },
];

const faqs = [
  {
    question: "How long does delivery take?",
    answer: "Most orders are delivered within 2–5 business days depending on your location.",
  },
  {
    question: "Which payment methods do you accept?",
    answer: "We accept Mobile Money, Visa, Mastercard, and other secure payment methods.",
  },
  {
    question: "Can I return a product?",
    answer: "Yes. Eligible products can be returned within our return policy period.",
  },
  {
    question: "How do I track my order?",
    answer: "Once your order ships, you'll receive tracking details via email or SMS.",
  },
];

export default function ContactPage() {
  const [openFAQ, setOpenFAQ] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const toastId = toast.loading("Sending your message...");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, subject, message }),
      });

      if (res.ok) {
        toast.success(
          "Thank you for contacting Amoakay Deals. We have received your message and will get back to you shortly.",
          {
            id: toastId,
            duration: 5000,
          }
        );

        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to send message.", {
          id: toastId,
          duration: 5000,
        });
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.", {
        id: toastId,
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-white">
      <section className="relative overflow-hidden bg-gradient-to-br from-cyan-100 via-white to-green-50">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-green-200/40 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-cyan-200/50 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-28 text-center">
          <span className="inline-flex bg-green-100 text-green-700 px-5 py-2 rounded-full text-sm font-semibold">
            CONTACT US
          </span>

          <h1 className="text-4xl md:text-6xl font-bold mt-6 text-slate-900">
            We&apos;d Love To Hear From You
          </h1>

          <p className="max-w-3xl mx-auto mt-6 text-base md:text-lg text-slate-600 leading-8">
            Have questions about products, delivery, partnerships, or customer
            support? Send us a message and our team will respond shortly.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {contactCards.map((card) => (
            <div
              key={card.title}
              className="group bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition p-7 text-center"
            >
              <div className="mx-auto w-14 h-14 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mb-5 group-hover:bg-green-500 group-hover:text-white transition">
                {card.icon}
              </div>

              <h3 className="font-bold text-lg text-slate-900">{card.title}</h3>
              <p className="text-slate-600 mt-2 text-sm">{card.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid lg:grid-cols-5 gap-10 items-start">
          <div className="lg:col-span-3 bg-white border border-slate-100 rounded-[2rem] shadow-xl shadow-slate-200/60 p-6 md:p-10">
            <div className="mb-8">
              <span className="text-green-600 font-semibold text-sm">
                SEND MESSAGE
              </span>

              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2">
                Get in touch with us
              </h2>

              <p className="text-slate-500 mt-3 leading-7">
                Fill out the form below and our support team will get back to
                you as soon as possible.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  placeholder="What is your message about?"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Message
                </label>
                <textarea
                  rows={6}
                  placeholder="Write your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-2xl flex items-center justify-center gap-3 font-semibold transition shadow-lg shadow-green-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send size={18} />
                )}

                {loading ? "Sending Message..." : "Send Message"}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-green-50 text-black rounded-[2rem] p-8 shadow-xl">
              <h2 className="text-2xl font-bold mb-5">Business Hours</h2>

              <div className="space-y-4 text-slate-500">
                <p className="flex justify-between gap-4">
                  <span>Monday - Friday</span>
                  <span className="text-black">8:00 AM - 6:00 PM</span>
                </p>

                <p className="flex justify-between gap-4">
                  <span>Saturday</span>
                  <span className="text-black">9:00 AM - 2:00 PM</span>
                </p>

                <p className="flex justify-between gap-4">
                  <span>Sunday</span>
                  <span className="text-black">Closed</span>
                </p>
              </div>
            </div>

            <div className="bg-green-50 border border-green-100 rounded-[2rem] p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-3">
                Need Immediate Help?
              </h2>

              <p className="text-slate-600 leading-8">
                Contact our support team by phone or email and we&apos;ll respond
                as quickly as possible.
              </p>

              <div className="mt-6 space-y-3">
                <p className="flex items-center gap-3 text-slate-700">
                  <Phone size={18} className="text-green-600" />
                  +233 XX XXX XXXX
                </p>

                <p className="flex items-center gap-3 text-slate-700">
                  <Mail size={18} className="text-green-600" />
                  support@amoakaydeals.com
                </p>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-5">
                Follow Us
              </h2>

              <div className="flex gap-4">
                {[Facebook, Instagram, Twitter, MessageCircle].map((Icon, index) => (
                  <a
                    key={index}
                    href="#"
                    className="w-12 h-12 bg-slate-50 hover:bg-green-500 hover:text-white rounded-full shadow-sm flex items-center justify-center transition hover:-translate-y-1"
                  >
                    <Icon size={20} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="rounded-[2rem] overflow-hidden shadow-xl border border-slate-100">
          <iframe
          title="Amoakay Deals Location"
          src="https://maps.google.com/maps?q=SCC%20Gicel%20Estate,%20New%20Weija,%20Accra,%20Ghana&t=&z=17&ie=UTF8&iwloc=&output=embed"
          className="w-full h-[350px] md:h-[450px]"
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-slate-900">
            Frequently Asked Questions
          </h2>

          <div className="space-y-5">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-sm border border-slate-100">
                <button
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                  className="w-full p-6 flex justify-between items-center text-left"
                >
                  <span className="font-semibold text-slate-900">
                    {faq.question}
                  </span>

                  {openFAQ === index ? <ChevronUp /> : <ChevronDown />}
                </button>

                {openFAQ === index && (
                  <div className="px-6 pb-6 text-slate-600 leading-8">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-[2rem] text-white text-center p-8 md:p-14 shadow-xl shadow-green-200">
            <h2 className="text-3xl md:text-4xl font-bold">Stay Updated</h2>

            <p className="mt-5 mb-8 text-green-50">
              Subscribe to receive updates on our newest products, promotions,
              and exclusive offers.
            </p>

            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-5 py-4 rounded-2xl text-slate-800 md:w-[400px] outline-none focus:ring-4 focus:ring-white/30"
              />

              <button className="bg-slate-900 hover:bg-black px-8 py-4 rounded-2xl font-semibold transition">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}