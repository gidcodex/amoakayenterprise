"use client";

import Loading from "@/components/Loading";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function StoreReviewsPage() {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);

  const fetchReviews = async () => {
    try {
      const token = await getToken();

      const { data } = await axios.get("/api/store/reviews", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setReviews(data.reviews || []);
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="text-slate-500 pb-16">
      <div className="mb-8">
        <p className="text-sm font-semibold text-green-600">SELLER CENTER</p>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
          Product Reviews
        </h1>

        <p className="text-sm sm:text-base text-slate-500 mt-2">
          See customer feedback and ratings for your store products.
        </p>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-10 text-center text-slate-400">
          No reviews yet.
        </div>
      ) : (
        <div className="grid gap-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white border border-slate-100 rounded-2xl shadow-md p-4 sm:p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
                <div className="flex gap-3">
                  <Image
                    src={review.user?.image || "/placeholder.png"}
                    alt={review.user?.name || "Customer"}
                    width={44}
                    height={44}
                    className="w-11 h-11 rounded-full object-cover"
                  />

                  <div>
                    <p className="font-bold text-slate-900">
                      {review.user?.name || "Customer"}
                    </p>

                    <p className="text-xs text-slate-400">
                      {new Date(review.createdAt).toDateString()}
                    </p>

                    <div className="flex items-center mt-2">
                      {Array(5)
                        .fill("")
                        .map((_, index) => (
                          <Star
                            key={index}
                            size={17}
                            className="text-transparent"
                            fill={
                              review.rating >= index + 1
                                ? "#00C950"
                                : "#D1D5DB"
                            }
                          />
                        ))}
                    </div>
                  </div>
                </div>

                <Link
                  href={`/product/${review.product?.id}`}
                  className="bg-slate-900 hover:bg-black text-white px-5 py-2 rounded-xl text-sm font-semibold text-center"
                >
                  View Product
                </Link>
              </div>

              <p className="text-slate-600 mt-5 leading-7">
                {review.review || "No written review."}
              </p>

              <div className="mt-5 flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl p-3">
                {review.product?.images?.[0] && (
                  <Image
                    src={review.product.images[0]}
                    alt={review.product?.name || "Product"}
                    width={54}
                    height={54}
                    className="w-14 h-14 object-contain bg-white rounded-lg p-1"
                  />
                )}

                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 line-clamp-1">
                    {review.product?.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {review.product?.category}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}