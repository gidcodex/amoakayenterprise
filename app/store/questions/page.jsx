"use client";

import Loading from "@/components/Loading";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import { Send } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function StoreQuestionsPage() {
  const { getToken } = useAuth();

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});

  const fetchQuestions = async () => {
    try {
      const token = await getToken();

      const { data } = await axios.get("/api/store/questions", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setQuestions(data.questions || []);
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async (questionId) => {
    try {
      const answer = answers[questionId];

      if (!answer?.trim()) {
        return toast.error("Please write an answer.");
      }

      const token = await getToken();

      const { data } = await axios.patch(
        "/api/store/questions",
        {
          questionId,
          answer,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(data.message);

      setQuestions((prev) =>
        prev.map((item) =>
          item.id === questionId
            ? { ...item, answer, answeredAt: new Date().toISOString() }
            : item
        )
      );

      setAnswers((prev) => ({
        ...prev,
        [questionId]: "",
      }));
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="text-slate-500 pb-12">
      <div className="mb-8">
        <h1 className="text-2xl">
          Product <span className="text-slate-800 font-medium">Questions</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Answer customer questions about your products.
        </p>
      </div>

      <div className="space-y-5 max-w-5xl">
        {questions.length > 0 ? (
          questions.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-100 rounded-2xl shadow-lg shadow-slate-200/50 p-5"
            >
              <div className="flex gap-4">
                <Image
                  src={item.product.images?.[0]}
                  alt={item.product.name}
                  width={70}
                  height={70}
                  className="w-20 h-20 object-contain bg-slate-50 rounded-xl border border-slate-100 p-2"
                />

                <div className="flex-1">
                  <h2 className="font-bold text-slate-900">
                    {item.product.name}
                  </h2>

                  <p className="mt-3 text-slate-800 font-semibold">
                    Q: {item.question}
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    Asked by {item.user?.name || "Customer"} ·{" "}
                    {new Date(item.createdAt).toDateString()}
                  </p>

                  {item.answer ? (
                    <div className="mt-4 bg-green-50 border border-green-100 rounded-xl p-4">
                      <p className="font-semibold text-green-700">
                        Your Answer
                      </p>
                      <p className="text-slate-600 mt-1">{item.answer}</p>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <textarea
                        value={answers[item.id] || ""}
                        onChange={(e) =>
                          setAnswers((prev) => ({
                            ...prev,
                            [item.id]: e.target.value,
                          }))
                        }
                        placeholder="Write your answer..."
                        rows={3}
                        className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:ring-4 focus:ring-blue-100"
                      />

                      <button
                        onClick={() =>
                          toast.promise(submitAnswer(item.id), {
                            loading: "Submitting answer...",
                          })
                        }
                        className="mt-3 bg-slate-800 hover:bg-black text-white px-5 py-2.5 rounded-xl inline-flex items-center gap-2"
                      >
                        <Send size={16} />
                        Submit Answer
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white border border-dashed border-slate-200 rounded-3xl py-20 text-center text-slate-400">
            No customer questions yet.
          </div>
        )}
      </div>
    </div>
  );
}