"use client";

import { ArrowRight, ChevronDown, StarIcon, Send } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import toast from "react-hot-toast";

const ProductDescription = ({ product }) => {
  const [selectedTab, setSelectedTab] = useState("Description");
  const [specOpen, setSpecOpen] = useState(true);
  const [question, setQuestion] = useState("");
  const [questions, setQuestions] = useState(product.questions || []);

  const { user } = useUser();
  const { getToken } = useAuth();

  const submitQuestion = async (e) => {
    e.preventDefault();

    try {
      if (!user) return toast.error("Please login to ask a question.");
      if (!question.trim()) return toast.error("Please enter your question.");

      const token = await getToken();

      const { data } = await axios.post(
        "/api/questions",
        {
          productId: product.id,
          question,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(data.message);

      setQuestions((prev) => [
        {
          id: Date.now(),
          question,
          answer: null,
          createdAt: new Date().toISOString(),
          user: {
            name: user.fullName || "Customer",
            image: user.imageUrl,
          },
        },
        ...prev,
      ]);

      setQuestion("");
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message);
    }
  };

  return (
    <div className="my-18 text-sm text-slate-600">
      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 max-w-3xl">
        {["Description", "Specifications", "Reviews", "Questions"].map(
          (tab, index) => (
            <button
              className={`${
                tab === selectedTab
                  ? "border-b-[1.5px] font-semibold text-slate-800"
                  : "text-slate-400"
              } px-3 py-2 font-medium`}
              key={index}
              onClick={() => setSelectedTab(tab)}
            >
              {tab}
            </button>
          )
        )}
      </div>

      {/* Description */}
      {selectedTab === "Description" && (
        <p className="max-w-xl">{product.description}</p>
      )}

      {/* Specifications */}
      {selectedTab === "Specifications" && (
        <div className="max-w-5xl rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setSpecOpen(!specOpen)}
            className="w-full flex items-center justify-between bg-gradient-to-r from-blue-50 via-white to-sky-50 px-6 py-5 border-b border-blue-100"
          >
            <div className="text-left">
              <h3 className="text-xl font-bold text-slate-900">
                Technical Specifications
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Detailed product specifications
              </p>
            </div>

            <ChevronDown
              size={22}
              className={`text-slate-500 transition-transform ${
                specOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {specOpen && (
            <div className="divide-y divide-slate-100">
              {[
                ["Brand", product.specifications?.brand],
                ["Model", product.specifications?.model],
                ["Display", product.specifications?.display],
                ["RAM", product.specifications?.ram],
                ["Storage", product.specifications?.storage],
                ["Processor", product.specifications?.processor],
                ["Camera", product.specifications?.camera],
                ["Battery", product.specifications?.battery],
                ["Operating System", product.specifications?.os],
                ["Connectivity", product.specifications?.connectivity],
                ["Warranty", product.specifications?.warranty],
              ].map(([label, value], index) => (
                <div key={index} className="grid grid-cols-12">
                  <div className="col-span-4 bg-slate-50 px-6 py-4 font-semibold text-slate-700">
                    {label}
                  </div>
                  <div className="col-span-8 px-6 py-4 text-slate-600">
                    {value || "-"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reviews */}
      {selectedTab === "Reviews" && (
        <div className="flex flex-col gap-3 mt-10">
          {product.rating?.length > 0 ? (
            product.rating.map((item, index) => (
              <div key={index} className="flex gap-5 mb-10">
                <Image
                  src={item.user.image}
                  alt=""
                  className="size-10 rounded-full"
                  width={100}
                  height={100}
                />
                <div>
                  <div className="flex items-center">
                    {Array(5)
                      .fill("")
                      .map((_, index) => (
                        <StarIcon
                          key={index}
                          size={18}
                          className="text-transparent mt-0.5"
                          fill={item.rating >= index + 1 ? "#00C950" : "#D1D5DB"}
                        />
                      ))}
                  </div>
                  <p className="text-sm max-w-lg my-4">{item.review}</p>
                  <p className="font-medium text-slate-800">
                    {item.user.name}
                  </p>
                  <p className="mt-3 font-light">
                    {new Date(item.createdAt).toDateString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-400">No reviews yet.</p>
          )}
        </div>
      )}

      {/* Questions */}
      {selectedTab === "Questions" && (
        <div className="max-w-4xl">
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 via-white to-sky-50 px-6 py-5 border-b border-blue-100">
              <h3 className="text-xl font-bold text-slate-900">
                Questions & Answers
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Ask the seller about this product before buying.
              </p>
            </div>

            <div className="p-6">
              <form onSubmit={submitQuestion} className="flex gap-3 mb-8">
                <input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask a question about this product..."
                  className="flex-1 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-blue-100"
                />

                <button className="bg-slate-800 hover:bg-black text-white px-5 py-3 rounded-xl flex items-center gap-2">
                  <Send size={16} />
                  Ask
                </button>
              </form>

              {questions.length > 0 ? (
                <div className="space-y-5">
                  {questions.map((item) => (
                    <div
                      key={item.id}
                      className="border border-slate-100 rounded-xl p-5 bg-slate-50"
                    >
                      <div className="flex items-start gap-3">
                        {item.user?.image && (
                          <Image
                            src={item.user.image}
                            alt=""
                            width={36}
                            height={36}
                            className="size-9 rounded-full"
                          />
                        )}

                        <div>
                          <p className="font-semibold text-slate-900">
                            Q: {item.question}
                          </p>

                          <p className="text-xs text-slate-400 mt-1">
                            Asked by {item.user?.name || "Customer"} ·{" "}
                            {new Date(item.createdAt).toDateString()}
                          </p>

                          {item.answer ? (
                            <div className="mt-4 bg-white border border-green-100 rounded-xl p-4">
                              <p className="text-green-700 font-semibold">
                                Seller Answer
                              </p>
                              <p className="mt-1 text-slate-600">
                                {item.answer}
                              </p>
                            </div>
                          ) : (
                            <p className="mt-4 text-orange-500 text-sm">
                              Waiting for seller response.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-center py-10">
                  No questions yet. Be the first to ask.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Store Page */}
      <div className="flex gap-3 mt-14">
        <Image
          src={product.store.logo}
          alt=""
          className="size-11 rounded-full ring ring-slate-400"
          width={100}
          height={100}
        />
        <div>
          <p className="font-medium text-slate-600">
            Product by {product.store.name}
          </p>
          <Link
            href={`/shop/${product.store.username}`}
            className="flex items-center gap-1.5 text-green-500"
          >
            view store <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductDescription;