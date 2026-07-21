"use client";

import {
  ArrowRight,
  BadgeCheck,
  Box,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Clock3,
  CreditCard,
  FileText,
  Headphones,
  MessageCircleQuestion,
  PackageCheck,
  RotateCcw,
  Send,
  ShieldCheck,
  ShoppingBag,
  Star,
  Store,
  Truck,
  UserRound,
  Warranty,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import toast from "react-hot-toast";

const tabs = [
  {
    id: "overview",
    label: "Overview",
    icon: FileText,
  },
  {
    id: "specifications",
    label: "Specifications",
    icon: Box,
  },
  {
    id: "reviews",
    label: "Reviews",
    icon: Star,
  },
  {
    id: "questions",
    label: "Questions",
    icon: MessageCircleQuestion,
  },
  {
    id: "shipping",
    label: "Shipping",
    icon: Truck,
  },
  {
    id: "warranty",
    label: "Warranty",
    icon: ShieldCheck,
  },
  {
    id: "seller",
    label: "Seller",
    icon: Store,
  },
];

export default function ProductDescription({
  product,
}) {
  const { user } = useUser();
  const { getToken } = useAuth();

  const [selectedTab, setSelectedTab] =
    useState("overview");

  const selectProductTab = (tabId) => {
  setSelectedTab(tabId);

  window.dispatchEvent(
    new CustomEvent(
      "amoakay:product-tab-changed",
      {
        detail: {
          tabId,
        },
      }
    )
  );
};

  const [specOpen, setSpecOpen] =
    useState(true);

  const [question, setQuestion] =
    useState("");

  const [questions, setQuestions] =
    useState(
      Array.isArray(product?.questions)
        ? product.questions
        : []
    );

  const [submittingQuestion, setSubmittingQuestion] =
    useState(false);

useEffect(() => {
  const handleSelectTab = (event) => {
    const tabId = event?.detail?.tabId;

    if (!tabId) return;

    setSelectedTab(tabId);
  };

  window.addEventListener(
    "amoakay:select-product-tab",
    handleSelectTab
  );

  return () => {
    window.removeEventListener(
      "amoakay:select-product-tab",
      handleSelectTab
    );
  };
}, []);

  const ratings = Array.isArray(product?.rating)
    ? product.rating
    : [];

  const averageRating = useMemo(() => {
    if (ratings.length === 0) return 0;

    const total = ratings.reduce(
      (sum, item) =>
        sum + Number(item.rating || 0),
      0
    );

    return total / ratings.length;
  }, [ratings]);

  const ratingDistribution = useMemo(() => {
    return [5, 4, 3, 2, 1].map(
      (ratingValue) => {
        const count = ratings.filter(
          (item) =>
            Number(item.rating) ===
            ratingValue
        ).length;

        const percentage =
          ratings.length > 0
            ? (count / ratings.length) * 100
            : 0;

        return {
          rating: ratingValue,
          count,
          percentage,
        };
      }
    );
  }, [ratings]);

  const specificationRows = useMemo(() => {
    const specifications =
      product?.specifications || {};

    const preferredFields = [
      ["Brand", specifications.brand],
      ["Model", specifications.model],
      ["Display", specifications.display],
      ["RAM", specifications.ram],
      ["Storage", specifications.storage],
      ["Processor", specifications.processor],
      ["Camera", specifications.camera],
      ["Battery", specifications.battery],
      [
        "Operating System",
        specifications.os,
      ],
      [
        "Connectivity",
        specifications.connectivity,
      ],
      ["Warranty", specifications.warranty],
    ];

    const usedKeys = new Set([
      "brand",
      "model",
      "display",
      "ram",
      "storage",
      "processor",
      "camera",
      "battery",
      "os",
      "connectivity",
      "warranty",
    ]);

    const additionalFields = Object.entries(
      specifications
    )
      .filter(
        ([key, value]) =>
          !usedKeys.has(key) &&
          value !== null &&
          value !== undefined &&
          value !== ""
      )
      .map(([key, value]) => [
        formatSpecificationLabel(key),
        value,
      ]);

    return [
      ...preferredFields.filter(
        ([, value]) =>
          value !== null &&
          value !== undefined &&
          value !== ""
      ),
      ...additionalFields,
    ];
  }, [product]);

  const submitQuestion = async (event) => {
    event.preventDefault();

    if (submittingQuestion) return;

    try {
      if (!user) {
        return toast.error(
          "Please log in to ask a question."
        );
      }

      if (!question.trim()) {
        return toast.error(
          "Please enter your question."
        );
      }

      setSubmittingQuestion(true);

      const token = await getToken();

      const { data } = await axios.post(
        "/api/questions",
        {
          productId: product.id,
          question: question.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const newQuestion =
        data.question || {
          id: `temporary-${Date.now()}`,
          question: question.trim(),
          answer: null,
          createdAt:
            new Date().toISOString(),
          user: {
            name:
              user.fullName ||
              user.firstName ||
              "Customer",
            image: user.imageUrl || null,
          },
        };

      setQuestions((current) => [
        newQuestion,
        ...current,
      ]);

      setQuestion("");

      toast.success(
        data.message ||
          "Your question was submitted."
      );
    } catch (error) {
      console.error(
        "SUBMIT QUESTION ERROR:",
        error
      );

      toast.error(
        error?.response?.data?.error ||
          error?.message ||
          "Failed to submit your question."
      );
    } finally {
      setSubmittingQuestion(false);
    }
  };

return (
  <section
  id="product-information-start"
  className="relative min-w-0 overflow-visible rounded-3xl border border-slate-200 bg-white shadow-sm"
>
    {/* Sticky heading and tab navigation */}
    <div className="overflow-hidden rounded-t-3xl border-b border-slate-200 bg-white">
      {/* Section heading */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-50 via-white to-cyan-50 px-5 py-6 sm:px-8 sm:py-7">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 right-0 h-80 w-80 rounded-full bg-cyan-100 opacity-60 blur-3xl" />

          <div className="absolute bottom-0 left-1/2 h-72 w-72 rounded-full bg-green-100 opacity-40 blur-3xl" />
        </div>

        {/* Grid pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(#2563eb 1px, transparent 1px), linear-gradient(to right, #2563eb 1px, transparent 1px)",
            backgroundSize: "34px 34px",
          }}
        />

        {/* Heading content */}
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-green-700 shadow-sm">
              <PackageCheck size={15} />
              Product information
            </span>

            <h2 className="mt-4 text-2xl font-black text-slate-900 sm:text-3xl">
              Everything you need to know
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Review the product details, technical specifications,
              delivery information, warranty, customer reviews and seller
              information before purchasing.
            </p>
          </div>

          {/* Rating */}
          <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-blue-100 bg-white/90 px-4 py-3 shadow-lg backdrop-blur">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  size={16}
                  className={
                    averageRating >= index + 1
                      ? "text-amber-400"
                      : "text-slate-300"
                  }
                  fill={
                    averageRating >= index + 1
                      ? "currentColor"
                      : "none"
                  }
                />
              ))}
            </div>

            <div>
              <p className="font-black text-slate-900">
                {averageRating.toFixed(1)}
              </p>

              <p className="text-xs text-slate-500">
                {ratings.length}{" "}
                {ratings.length === 1 ? "review" : "reviews"}
              </p>
            </div>
          </div>
        </div>
      </div>
   {/* Normal tabs */}
   <div className="border-b border-slate-200 bg-white px-3 sm:px-5">
        <div className="flex items-center justify-between gap-4 py-3">
        
        <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = selectedTab === tab.id;

            let count = null;

            if (tab.id === "reviews") {
              count = ratings.length;
            }

            if (tab.id === "questions") {
              count = questions.length;
            }

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => selectProductTab(tab.id)}
                className={`relative inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition ${
                  active
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon size={17} />

                {tab.label}

                {count !== null && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] ${
                      active
                        ? "bg-white/20 text-white"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        
 


        </div>
      </div>
    </div>

    {/* Selected tab content */}
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Overview */}
      {selectedTab === "overview" && (
        <OverviewTab product={product} />
      )}

      {/* Specifications */}
      {selectedTab === "specifications" && (
        <SpecificationsTab
          open={specOpen}
          onToggle={() =>
            setSpecOpen((current) => !current)
          }
          rows={specificationRows}
        />
      )}

      {/* Reviews */}
      {selectedTab === "reviews" && (
        <ReviewsTab
          ratings={ratings}
          averageRating={averageRating}
          distribution={ratingDistribution}
        />
      )}

      {/* Questions */}
      {selectedTab === "questions" && (
        <QuestionsTab
          questions={questions}
          question={question}
          setQuestion={setQuestion}
          submitQuestion={submitQuestion}
          submitting={submittingQuestion}
          signedIn={Boolean(user)}
        />
      )}

      {/* Shipping */}
      {selectedTab === "shipping" && (
        <ShippingTab product={product} />
      )}

      {/* Warranty */}
      {selectedTab === "warranty" && (
        <WarrantyTab product={product} />
      )}

      {/* Seller */}
      {selectedTab === "seller" && (
        <SellerTab product={product} />
      )}
    </div>
  </section>
);

}

function OverviewTab({ product }) {
  const description =
    product?.description ||
    "No detailed product description has been provided yet.";

  const highlights =
    Array.isArray(product?.highlights) &&
    product.highlights.length > 0
      ? product.highlights
      : [];

  return (
    <div className="grid gap-7 xl:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)]">
      <article className="rounded-3xl border border-slate-200 bg-slate-50/60 p-5 sm:p-7">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-green-700">
            <FileText size={22} />
          </div>

          <div>
            <h3 className="text-xl font-black text-slate-900">
              Product overview
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              A detailed introduction to this
              product.
            </p>
          </div>
        </div>

        <div className="mt-6 whitespace-pre-line text-sm leading-8 text-slate-600 sm:text-base">
          {description}
        </div>

        {highlights.length > 0 && (
          <div className="mt-7">
            <p className="text-sm font-black uppercase tracking-wider text-slate-900">
              Key highlights
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {highlights.map(
                (highlight, index) => (
                  <div
                    key={`${highlight}-${index}`}
                    className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <CheckCircle2
                      size={18}
                      className="mt-0.5 shrink-0 text-green-600"
                    />

                    <p className="text-sm leading-6 text-slate-700">
                      {highlight}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </article>

      <div className="space-y-4">
        <TrustCard
          icon={ShieldCheck}
          title="Buyer protection"
          description="Payments are securely verified before seller payout processing."
        />

        <TrustCard
          icon={PackageCheck}
          title="Verified marketplace"
          description="Purchase from approved marketplace sellers and track your order."
        />

        <TrustCard
          icon={Headphones}
          title="Customer support"
          description="Contact support if you need help with your purchase."
        />
      </div>
    </div>
  );
}

function SpecificationsTab({
  open,
  onToggle,
  rows,
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 bg-gradient-to-r from-slate-50 via-white to-green-50 px-5 py-5 text-left sm:px-7"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-green-700">
            <Box size={22} />
          </div>

          <div>
            <h3 className="text-xl font-black text-slate-900">
              Technical specifications
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Detailed technical information
              provided for this product.
            </p>
          </div>
        </div>

        <ChevronDown
          size={22}
          className={`shrink-0 text-slate-500 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div>
          {rows.length === 0 ? (
            <EmptyState
              icon={Box}
              title="No specifications available"
              description="Detailed specifications have not been provided for this product."
            />
          ) : (
            <div className="divide-y divide-slate-200">
              {rows.map(
                ([label, value], index) => (
                  <div
                    key={`${label}-${index}`}
                    className="grid grid-cols-1 sm:grid-cols-[220px_minmax(0,1fr)]"
                  >
                    <div className="bg-slate-50 px-5 py-4 font-bold text-slate-800 sm:px-7">
                      {label}
                    </div>

                    <div className="break-words px-5 py-4 text-slate-600 sm:px-7">
                      {formatSpecificationValue(
                        value
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ReviewsTab({
  ratings,
  averageRating,
  distribution,
}) {
  return (
    <div className="grid gap-7 xl:grid-cols-[340px_minmax(0,1fr)]">
      {/* Review summary */}
      <aside className="h-fit rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
        <p className="text-sm font-black uppercase tracking-wider text-slate-500">
          Customer rating
        </p>

        <div className="mt-5 flex items-end gap-3">
          <p className="text-5xl font-black text-slate-950">
            {averageRating.toFixed(1)}
          </p>

          <p className="pb-1 text-sm text-slate-500">
            out of 5
          </p>
        </div>

        <div className="mt-4 flex gap-1">
          {Array.from({
            length: 5,
          }).map((_, index) => (
            <Star
              key={index}
              size={20}
              className={
                averageRating >= index + 1
                  ? "text-amber-400"
                  : "text-slate-600"
              }
              fill={
                averageRating >= index + 1
                  ? "currentColor"
                  : "none"
              }
            />
          ))}
        </div>

        <p className="mt-3 text-sm text-slate-500">
          Based on {ratings.length} verified
          customer{" "}
          {ratings.length === 1
            ? "review"
            : "reviews"}
          .
        </p>

        <div className="mt-6 space-y-3">
          {distribution.map((item) => (
            <div
              key={item.rating}
              className="grid grid-cols-[44px_minmax(0,1fr)_32px] items-center gap-3"
            >
              <span className="text-xs font-bold text-slate-600">
                {item.rating} ★
              </span>

              <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-amber-400"
                  style={{
                    width: `${item.percentage}%`,
                  }}
                />
              </div>

              <span className="text-right text-xs text-slate-400">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </aside>

      {/* Reviews list */}
      <div>
        {ratings.length === 0 ? (
          <EmptyState
            icon={Star}
            title="No reviews yet"
            description="Be the first customer to review this product after your purchase."
          />
        ) : (
          <div className="space-y-4">
            {ratings.map((item, index) => (
              <ReviewCard
                key={item.id || index}
                review={item}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ReviewCard({ review }) {
  const userImage =
    review?.user?.image || null;

  const userName =
    review?.user?.name || "Customer";

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-sm sm:p-6">
      <div className="flex items-start gap-4">
        {userImage ? (
          <Image
            src={userImage}
            alt={userName}
            width={48}
            height={48}
            className="h-12 w-12 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <UserRound size={20} />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-black text-slate-900">
                {userName}
              </p>

              <div className="mt-2 flex items-center gap-1">
                {Array.from({
                  length: 5,
                }).map((_, index) => (
                  <Star
                    key={index}
                    size={16}
                    className={
                      Number(review.rating) >=
                      index + 1
                        ? "text-amber-400"
                        : "text-slate-600"
                    }
                    fill={
                      Number(review.rating) >=
                      index + 1
                        ? "currentColor"
                        : "none"
                    }
                  />
                ))}
              </div>
            </div>

            <p className="text-xs font-medium text-slate-400">
              {formatDate(
                review.createdAt
              )}
            </p>
          </div>

          <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">
            {review.review ||
              "The customer submitted a rating without a written review."}
          </p>

          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-[11px] font-bold text-green-700">
            <BadgeCheck size={14} />
            Verified marketplace review
          </div>
        </div>
      </div>
    </article>
  );
}

function QuestionsTab({
  questions,
  question,
  setQuestion,
  submitQuestion,
  submitting,
  signedIn,
}) {
  return (
    <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_330px]">
      <div className="overflow-hidden rounded-3xl border border-slate-200">
        <div className="border-b border-slate-200 bg-gradient-to-r from-blue-50 via-white to-green-50 px-5 py-5 sm:px-7">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
              <MessageCircleQuestion
                size={22}
              />
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900">
                Questions and answers
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Ask the seller about product
                details before buying.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <form
            onSubmit={submitQuestion}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
          >
            <label className="text-sm font-black text-slate-900">
              Ask a product question
            </label>

            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <textarea
                value={question}
                onChange={(event) =>
                  setQuestion(
                    event.target.value
                  )
                }
                placeholder={
                  signedIn
                    ? "Ask about availability, warranty, compatibility or product features..."
                    : "Log in to ask the seller a question..."
                }
                disabled={!signedIn}
                rows={3}
                className="min-h-[96px] min-w-0 flex-1 resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              />

              <button
                type="submit"
                disabled={
                  !signedIn ||
                  submitting ||
                  !question.trim()
                }
                className="inline-flex items-center justify-center gap-2 self-stretch rounded-2xl bg-slate-900 px-6 py-3 font-bold text-white transition hover:bg-black ..."
              >
                <Send size={17} />

                {submitting
                  ? "Submitting..."
                  : "Ask Seller"}
              </button>
            </div>
          </form>

          <div className="mt-6">
            {questions.length === 0 ? (
              <EmptyState
                icon={CircleHelp}
                title="No questions yet"
                description="Be the first customer to ask the seller about this product."
              />
            ) : (
              <div className="space-y-4">
                {questions.map((item) => (
                  <QuestionCard
                    key={item.id}
                    item={item}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <aside className="h-fit rounded-3xl border border-blue-200 bg-blue-50 p-5 sm:p-6">
        <CircleHelp
          size={28}
          className="text-blue-700"
        />

        <h3 className="mt-4 text-lg font-black text-slate-900">
          Before asking
        </h3>

        <div className="mt-4 space-y-3">
          {[
            "Check the product specifications first.",
            "Do not include payment information.",
            "Questions should relate to the product.",
            "The seller may need time to respond.",
          ].map((text) => (
            <div
              key={text}
              className="flex items-start gap-3"
            >
              <CheckCircle2
                size={17}
                className="mt-0.5 shrink-0 text-green-600"
              />

              <p className="text-sm leading-6 text-slate-600">
                {text}
              </p>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

function QuestionCard({ item }) {
  const userName =
    item?.user?.name || "Customer";

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start gap-3">
        {item?.user?.image ? (
          <Image
            src={item.user.image}
            alt={userName}
            width={40}
            height={40}
            className="h-10 w-10 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <UserRound size={18} />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="font-black leading-6 text-slate-900">
            {item.question}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Asked by {userName} ·{" "}
            {formatDate(item.createdAt)}
          </p>

          {item.answer ? (
            <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-4">
              <div className="flex items-center gap-2">
                <BadgeCheck
                  size={17}
                  className="text-green-700"
                />

                <p className="font-black text-green-800">
                  Seller answer
                </p>
              </div>

              <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-700">
                {item.answer}
              </p>
            </div>
          ) : (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
              <Clock3 size={14} />
              Waiting for seller response
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function ShippingTab() {
  const shippingSteps = [
    {
      icon: ShoppingBag,
      title: "Order confirmed",
      description:
        "Your order and payment details are verified.",
    },
    {
      icon: PackageCheck,
      title: "Seller processing",
      description:
        "The seller prepares the product for shipment.",
    },
    {
      icon: Truck,
      title: "Shipped and tracked",
      description:
        "Use your order number to monitor delivery progress.",
    },
    {
      icon: CheckCircle2,
      title: "Delivered",
      description:
        "The courier delivers the order to your selected address.",
    },
  ];

  return (
    <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="rounded-3xl border border-slate-200 p-5 sm:p-7">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
            <Truck size={22} />
          </div>

          <div>
            <h3 className="text-xl font-black text-slate-900">
              Delivery process
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Follow your order from checkout
              to final delivery.
            </p>
          </div>
        </div>

        <div className="relative mt-7 space-y-5">
          {shippingSteps.map(
            (step, index) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.title}
                  className="relative flex items-start gap-4"
                >
                  {index <
                    shippingSteps.length -
                      1 && (
                    <div className="absolute left-6 top-12 h-[calc(100%+20px)] w-px bg-slate-200" />
                  )}

                  <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white" >
                    <Icon size={20} />
                  </div>

                  <div className="min-w-0 flex-1 rounded-2xl bg-slate-50 p-4">
                    <p className="font-black text-slate-900">
                      {step.title}
                    </p>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>

      <div className="space-y-4">
        <TrustCard
          icon={Truck}
          title="Order tracking"
          description="Use the tracking page to monitor your shipment."
        />

        <TrustCard
          icon={CreditCard}
          title="Shipping fees"
          description="Any applicable shipping cost is displayed during checkout."
        />

        <TrustCard
          icon={Headphones}
          title="Delivery support"
          description="Contact support if delivery progress appears delayed."
        />
      </div>
    </div>
  );
}

function WarrantyTab({ product }) {
  const warranty =
    product?.specifications?.warranty ||
    product?.warranty ||
    "Warranty details are determined by the seller and manufacturer.";

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      <InformationCard
        icon={ShieldCheck}
        title="Product warranty"
        description={warranty}
      />

      <InformationCard
        icon={RotateCcw}
        title="Return eligibility"
        description="Returns are subject to the marketplace return policy and product condition."
      />

      <InformationCard
        icon={PackageCheck}
        title="Genuine product"
        description="Purchase from verified marketplace sellers and approved stores."
      />

      <InformationCard
        icon={CreditCard}
        title="Payment protection"
        description="Online payments are confirmed before seller payout processing."
      />

      <InformationCard
        icon={Headphones}
        title="Support assistance"
        description="Customer support can help with eligible order, delivery and return issues."
      />

      <InformationCard
        icon={FileText}
        title="Keep your order record"
        description="Your order number serves as an important reference for support and warranty claims."
      />
    </div>
  );
}

function SellerTab({ product }) {
  const store = product?.store;

  if (!store) {
    return (
      <EmptyState
        icon={Store}
        title="Seller information unavailable"
        description="This product does not currently include detailed seller information."
      />
    );
  }

  return (
    <div className="grid min-w-0 grid-cols-1 gap-6">
      {/* Main seller card */}
      <div className="min-w-0 rounded-3xl border border-slate-200 p-5 sm:p-6">
        <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-start">
          {store.logo ? (
            <Image
              src={store.logo}
              alt={store.name || "Seller"}
              width={90}
              height={90}
              className="h-20 w-20 shrink-0 rounded-2xl border border-slate-200 object-cover shadow-sm"
            />
          ) : (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
              <Store size={30} />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <h3 className="min-w-0 break-words text-xl font-black leading-tight text-slate-900 sm:text-2xl">
                {store.name || "Marketplace Seller"}
              </h3>

              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-blue-700">
                <BadgeCheck size={13} />
                Verified seller
              </span>
            </div>

            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-500">
              This product is sold by an approved Amoakay marketplace store.
            </p>

            {/* Responsive seller metrics */}
           <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <SellerMetric
                label="Seller status"
                value="Verified"
              />

              <SellerMetric
                label="Marketplace"
                value="Amoakay Deals"
              />

              <SellerMetric
                label="Product support"
                value="Available"
              />
            </div>

            {store.username && (
              <Link
                href={`/shop/${store.username}`}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-green-600 px-5 py-3 font-bold text-white transition hover:bg-green-700 sm:w-auto"
              >
                Visit Seller Store
                <ArrowRight size={17} />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Seller trust cards */}
      <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
        <TrustCard
          icon={BadgeCheck}
          title="Verified store"
          description="The seller has completed the marketplace approval process."
        />

        <TrustCard
          icon={MessageCircleQuestion}
          title="Ask before buying"
          description="Use the Questions tab to contact the seller about this product."
        />

        <TrustCard
          icon={Headphones}
          title="Marketplace support"
          description="Amoakay support can assist if you experience a problem."
        />
      </div>
    </div>
  );
}

function TrustCard({
  icon: Icon,
  title,
  description,
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-50 text-green-700">
        <Icon size={20} />
      </div>

      <p className="mt-4 font-black text-slate-900">
        {title}
      </p>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function InformationCard({
  icon: Icon,
  title,
  description,
}) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:border-green-300 hover:bg-white hover:shadow-sm sm:p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-green-700 shadow-sm">
        <Icon size={22} />
      </div>

      <h3 className="mt-5 text-lg font-black text-slate-900">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-7 text-slate-600">
        {description}
      </p>
    </article>
  );
}

function SellerMetric({ label, value }) {
  return (
    <div className="min-w-0 rounded-2xl bg-slate-50 p-4">
      <p className="break-words text-xs font-bold uppercase leading-5 tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-2 break-words font-black leading-6 text-slate-900">
        {value}
      </p>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
      <Icon
        size={38}
        className="mx-auto text-slate-600"
      />

      <h3 className="mt-5 text-lg font-black text-slate-900">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function formatDate(value) {
  if (!value) {
    return "Date unavailable";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );
}

function formatSpecificationLabel(key) {
  return String(key)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function formatSpecificationValue(value) {
  if (Array.isArray(value)) {
    return value.join(", ");
  }

  if (
    typeof value === "object" &&
    value !== null
  ) {
    return Object.entries(value)
      .map(
        ([key, item]) =>
          `${formatSpecificationLabel(
            key
          )}: ${item}`
      )
      .join(", ");
  }

  return String(value);
}