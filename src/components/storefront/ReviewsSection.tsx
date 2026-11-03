"use client";

import React, { useState, useEffect } from "react";
import { Star, ShieldCheck, MessageSquarePlus, CheckCircle2, X, AlertCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ReviewItem {
  id: string;
  customerName: string;
  rating: number;
  title: string;
  comment: string;
  imageUrl?: string | null;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

interface ReviewsSectionProps {
  initialReviews?: ReviewItem[];
  stats: {
    averageRating: number | null;
    totalApprovedReviews: number;
    ratingDistribution: Record<number, number>;
  };
}

export function ReviewsSection({
  initialReviews = [],
  stats,
}: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Review Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, rating, title, comment }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit review");
      }

      setSubmitSuccess(true);
      // Reset form
      setName("");
      setEmail("");
      setTitle("");
      setComment("");
      setRating(5);
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const totalReviews = stats.totalApprovedReviews || 0;
  const avgRating = stats.averageRating || 0;

  return (
    <section id="reviews" className="py-16 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-slate-200 pb-8">
          <div>
            <span className="text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-full uppercase tracking-wider">
              Authentic Customer Feedback
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
              Verified Customer Reviews
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Only genuine reviews submitted by buyers and verified by store moderators are published.
            </p>
          </div>

          <button
            onClick={() => {
              setIsModalOpen(true);
              setSubmitSuccess(false);
              setErrorMessage("");
            }}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-300 font-bold text-sm px-5 py-2.5 rounded-xl shadow-sm hover:border-slate-400 transition-all self-start md:self-auto"
          >
            <MessageSquarePlus className="w-4 h-4 text-sky-600" />
            <span>Write a Review</span>
          </button>
        </div>

        {/* Rating Summary & Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12 bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-200">
          {/* Average Rating Block */}
          <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-4 border-b md:border-b-0 md:border-r border-slate-200">
            {totalReviews > 0 ? (
              <>
                <div className="text-5xl font-black text-slate-900 tracking-tight">
                  {avgRating}
                </div>
                <div className="flex gap-1 my-2 text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.round(avgRating)
                          ? "fill-amber-400 text-amber-500"
                          : "fill-slate-200 text-slate-300"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs font-semibold text-slate-600">
                  Based on {totalReviews} approved review{totalReviews > 1 ? "s" : ""}
                </p>
              </>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-center text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-5 h-5 fill-amber-300 text-amber-400" />
                  ))}
                </div>
                <p className="font-bold text-slate-800 text-sm">No Published Reviews Yet</p>
                <p className="text-xs text-slate-500 max-w-xs">
                  Be the first verified customer to share your experience with the Havells Zella immersion rod!
                </p>
              </div>
            )}
          </div>

          {/* Rating Breakdown Bars */}
          <div className="md:col-span-8 flex flex-col justify-center space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = stats.ratingDistribution[stars] || 0;
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

              return (
                <div key={stars} className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1 w-12 text-slate-600 font-semibold">
                    <span>{stars}</span>
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  </div>
                  <div className="flex-1 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-right font-medium text-slate-500">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Customer Reviews List */}
        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="bg-slate-50/50 rounded-2xl p-6 border border-slate-200 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${
                            s <= r.rating ? "fill-amber-400 text-amber-500" : "fill-slate-200 text-slate-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-slate-400">{formatDate(r.createdAt)}</span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base leading-snug">
                    {r.title}
                  </h3>

                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                    {r.comment}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{r.customerName}</span>
                  {r.isVerifiedPurchase && (
                    <span className="flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Verified Purchase
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-300 max-w-xl mx-auto">
            <MessageSquarePlus className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <p className="font-bold text-slate-700 text-sm">Customer reviews appear here after moderation</p>
            <p className="text-xs text-slate-500 mt-1">
              Have you received your order? Submit your feedback to help future buyers.
            </p>
          </div>
        )}
      </div>

      {/* Review Submission Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-slate-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            {submitSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Thank You For Your Review!</h3>
                <p className="text-sm text-slate-600">
                  Your feedback has been submitted successfully. It will appear on the storefront after review and verification by our moderation team.
                </p>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="bg-sky-600 text-white font-semibold text-sm px-6 py-2.5 rounded-lg"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Write a Product Review</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Share your experience with the Havells Zella 1000W Immersion Rod.
                  </p>
                </div>

                {errorMessage && (
                  <div className="flex items-center gap-2 p-3 text-xs bg-red-50 text-red-700 border border-red-200 rounded-lg">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Rating Stars Picker */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Overall Rating *
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 focus:outline-none"
                      >
                        <Star
                          className={`w-6 h-6 transition-colors ${
                            star <= (hoverRating || rating)
                              ? "fill-amber-400 text-amber-500"
                              : "fill-slate-100 text-slate-300"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-semibold text-slate-600 ml-2">
                      {rating} out of 5 stars
                    </span>
                  </div>
                </div>

                {/* Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ramesh Patel"
                      className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. ramesh@example.com"
                      className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400">Used for verified buyer check only.</span>
                  </div>
                </div>

                {/* Review Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Review Headline *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Heats water quickly, very solid build!"
                    className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                {/* Review Text */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Detailed Review *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Describe heating speed, bucket hanger fit, temperature dial, etc."
                    className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-sm rounded-lg shadow-sm"
                  >
                    {submitting ? "Submitting..." : "Submit for Moderation"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
