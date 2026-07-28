"use client";

import {
  ArrowRight,
  CheckCircle2,
  Mail,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] =
    useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setMessage("Please enter your email address.");
      setMessageType("error");
      return;
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(cleanEmail)) {
      setMessage("Please enter a valid email address.");
      setMessageType("error");
      return;
    }

    /*
      Replace this temporary success response later
      with your newsletter API request.
    */

    setMessage(
      "Thank you. You have joined the Amoakay Deals newsletter."
    );
    setMessageType("success");
    setEmail("");
  };

  return (
    <section className="bg-slate-950 pb-16 sm:pb-20 lg:pb-24">
      <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden border border-white/10 bg-gradient-to-r from-emerald-950 via-slate-900 to-blue-950 px-6 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-14">
          {/* Background details */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-400/10 blur-[90px]"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-blue-500/10 blur-[100px]"
          />

          <div className="relative grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            {/* Copy */}
            <div>
              <div className="inline-flex items-center gap-2 border border-white/10 bg-white/5 px-3 py-2">
                <Sparkles
                  size={14}
                  className="text-emerald-400"
                />

                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">
                  Member updates
                </span>
              </div>

              <h2 className="mt-5 max-w-xl text-3xl font-black leading-tight text-white sm:text-4xl">
                Get better deals delivered to your inbox
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                Receive selected promotions, product launches,
                marketplace updates and shopping inspiration
                from Amoakay Deals.
              </p>

              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-slate-300">
                <Feature text="Exclusive promotions" />
                <Feature text="New product alerts" />
                <Feature text="No unnecessary emails" />
              </div>
            </div>

            {/* Subscription form */}
            <div className="border border-white/10 bg-white/[0.06] p-5 backdrop-blur sm:p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-emerald-400 text-slate-950">
                  <Mail size={20} />
                </div>

                <div>
                  <h3 className="text-lg font-black text-white">
                    Join the newsletter
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    Enter your email to receive marketplace
                    updates and selected offers.
                  </p>
                </div>
              </div>

              <form
                onSubmit={handleSubmit}
                className="mt-6"
              >
                <label
                  htmlFor="newsletter-email"
                  className="sr-only"
                >
                  Email address
                </label>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    id="newsletter-email"
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);

                      if (message) {
                        setMessage("");
                        setMessageType("");
                      }
                    }}
                    placeholder="Enter your email address"
                    autoComplete="email"
                    className="min-h-14 flex-1 border border-white/15 bg-white px-4 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                  />

                  <button
                    type="submit"
                    className="inline-flex min-h-14 shrink-0 items-center justify-center gap-2 bg-emerald-400 px-6 text-sm font-black text-slate-950 transition hover:bg-emerald-300 active:scale-[0.98]"
                  >
                    Get updates
                    <ArrowRight size={17} />
                  </button>
                </div>

                {message && (
                  <p
                    className={`mt-3 text-sm font-semibold ${
                      messageType === "success"
                        ? "text-emerald-300"
                        : "text-red-300"
                    }`}
                  >
                    {message}
                  </p>
                )}

                <p className="mt-4 text-xs leading-5 text-slate-500">
                  By subscribing, you agree to receive
                  marketing emails from Amoakay Deals. You may
                  unsubscribe at any time.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

function Feature({ text }) {
  return (
    <div className="flex items-center gap-2">
      <CheckCircle2
        size={16}
        className="text-emerald-400"
      />

      <span>{text}</span>
    </div>
  );
}

export default Newsletter;