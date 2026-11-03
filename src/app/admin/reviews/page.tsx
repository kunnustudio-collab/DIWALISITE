"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Star,
  CheckCircle2,
  XCircle,
  Trash2,
  AlertTriangle,
  Search,
  Filter,
  ShieldCheck,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [counts, setCounts] = useState<any>({ pending: 0, approved: 0, rejected: 0, demo: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"PENDING" | "APPROVED" | "REJECTED" | "ALL">("PENDING");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/reviews?status=${activeTab}&search=${encodeURIComponent(search)}`
      );
      const data = await res.json();
      setReviews(data.reviews || []);
      if (data.counts) {
        setCounts(data.counts);
      }
    } catch (err) {
      console.error("Failed to load reviews", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [activeTab]);

  const handleAction = async (reviewId: string, action: "APPROVE" | "REJECT" | "DELETE") => {
    let reason = "";
    if (action === "REJECT") {
      const input = prompt("Please provide a reason for rejecting this review:");
      if (input === null) return;
      if (!input.trim()) {
        alert("Rejection reason cannot be blank.");
        return;
      }
      reason = input.trim();
    }

    if (action === "DELETE") {
      if (!confirm("Are you sure you want to permanently delete this review?")) {
        return;
      }
    }

    setActionLoading(reviewId);
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, action, reason }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Action failed");
      }

      loadReviews();
    } catch (err: any) {
      alert(err.message || "Failed to moderate review");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Review Moderation Panel
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Approve genuine customer feedback. Only approved reviews appear on the storefront.
          </p>
        </div>

        {counts.pending > 0 && (
          <div className="flex items-center gap-2 bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1.5 rounded-xl border border-amber-300">
            <span>{counts.pending} review{counts.pending > 1 ? "s" : ""} awaiting moderation</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("PENDING")}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
            activeTab === "PENDING"
              ? "bg-sky-600 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <span>Pending Moderation</span>
          <span className="bg-white/20 text-current px-1.5 py-0.2 rounded-full text-[10px]">
            {counts.pending}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("APPROVED")}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
            activeTab === "APPROVED"
              ? "bg-sky-600 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <span>Approved (Published)</span>
          <span className="bg-white/20 text-current px-1.5 py-0.2 rounded-full text-[10px]">
            {counts.approved}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("REJECTED")}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
            activeTab === "REJECTED"
              ? "bg-sky-600 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <span>Rejected</span>
          <span className="bg-white/20 text-current px-1.5 py-0.2 rounded-full text-[10px]">
            {counts.rejected}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("ALL")}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
            activeTab === "ALL"
              ? "bg-sky-600 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <span>All Records (Inc. Demo)</span>
        </button>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-slate-400">Loading review records...</div>
        ) : reviews.length > 0 ? (
          reviews.map((rev) => (
            <div
              key={rev.id}
              className={`bg-white rounded-2xl p-5 border shadow-sm space-y-3 transition-all ${
                rev.isDemoData
                  ? "border-amber-300 bg-amber-50/20"
                  : rev.status === "PENDING"
                  ? "border-sky-300"
                  : "border-slate-200/80"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-900 text-sm">{rev.customerName}</span>
                  <span className="text-xs text-slate-400">({rev.customerEmail})</span>

                  {rev.isDemoData && (
                    <span className="text-[10px] font-black text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded border border-amber-400">
                      ⚠️ DEMO SEED RECORD • NEVER PUBLISHED
                    </span>
                  )}

                  {rev.isVerifiedPurchase && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      Verified Purchase
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= rev.rating ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-300"
                        }`}
                      />
                    ))}
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded uppercase ${
                      rev.status === "APPROVED"
                        ? "bg-emerald-100 text-emerald-800"
                        : rev.status === "REJECTED"
                        ? "bg-red-100 text-red-800"
                        : "bg-sky-100 text-sky-800"
                    }`}
                  >
                    {rev.status}
                  </span>

                  <span className="text-xs text-slate-400">{formatDate(rev.createdAt)}</span>
                </div>
              </div>

              {/* Review Content */}
              <div>
                <h3 className="font-bold text-slate-900 text-sm leading-snug">{rev.title}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{rev.comment}</p>
              </div>

              {/* Moderation Notes & Audit Trail */}
              {rev.moderationNote && (
                <div className="p-2.5 bg-slate-50 rounded-lg text-[11px] text-slate-600 border border-slate-200">
                  <strong className="text-slate-800">Moderation Note:</strong> {rev.moderationNote}
                </div>
              )}

              {/* Moderation Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                {rev.status !== "APPROVED" && (
                  <button
                    onClick={() => handleAction(rev.id, "APPROVE")}
                    disabled={actionLoading === rev.id}
                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve & Publish</span>
                  </button>
                )}

                {rev.status !== "REJECTED" && (
                  <button
                    onClick={() => handleAction(rev.id, "REJECT")}
                    disabled={actionLoading === rev.id}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-colors shadow-xs"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                )}

                <button
                  onClick={() => handleAction(rev.id, "DELETE")}
                  disabled={actionLoading === rev.id}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                  title="Delete Review"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 bg-white rounded-2xl border border-slate-200 text-center text-slate-400 text-sm">
            No reviews found under {activeTab} tab.
          </div>
        )}
      </div>
    </div>
  );
}
