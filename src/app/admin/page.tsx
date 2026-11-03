"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  IndianRupee,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Boxes,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  FileText,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const res = await fetch("/api/admin/dashboard");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Dashboard metrics error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const recentOrders = data?.recentOrders || [];
  const product = data?.product;

  return (
    <div className="space-y-8">
      {/* Title & Quick Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time store performance and order processing status.
          </p>
        </div>

        {metrics.pendingVerificationOrders > 0 && (
          <Link
            href="/admin/settings/payments"
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-colors"
          >
            <Clock className="w-4 h-4 animate-spin" />
            <span>{metrics.pendingVerificationOrders} Payment Verification Pending</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Settled Revenue
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {formatCurrency(metrics.totalRevenue || 0)}
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> Real bank verified funds
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Orders
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {metrics.totalOrders || 0}
            </div>
            <span className="text-[10px] text-slate-500 font-medium block mt-1">
              {metrics.completedOrders || 0} Confirmed / Delivered
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Stock Level */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Stock In Hand
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {metrics.stockQuantity || 0} units
            </div>
            <span
              className={`text-[10px] font-semibold block mt-1 ${
                metrics.stockQuantity < 10 ? "text-amber-600" : "text-emerald-600"
              }`}
            >
              {metrics.stockQuantity < 10 ? "Low Stock Alert" : "Healthy Inventory"}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Boxes className="w-6 h-6" />
          </div>
        </div>

        {/* Reviews Status */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Reviews Moderation
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {metrics.publishedReviews || 0} Live
            </div>
            <Link
              href="/admin/reviews"
              className="text-[10px] text-sky-600 hover:underline font-semibold block mt-1"
            >
              {metrics.pendingReviews || 0} pending approval →
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <Clock className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-amber-900 block">
              {metrics.pendingOrders || 0} Awaiting Payment / Processing
            </span>
            <span className="text-amber-700">Orders placed by customers in checkout flow.</span>
          </div>
        </div>

        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-emerald-900 block">
              {metrics.completedOrders || 0} Successfully Confirmed
            </span>
            <span className="text-emerald-700">Dispatched or fulfilled orders.</span>
          </div>
        </div>

        <div className="bg-red-50/70 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <XCircle className="w-5 h-5 text-red-600 shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-red-900 block">
              {metrics.cancelledOrders || 0} Cancelled / Rejected
            </span>
            <span className="text-red-700">Stock restored automatically to catalog.</span>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="font-extrabold text-sm sm:text-base text-slate-900">
              Recent Customer Orders
            </h2>
            <p className="text-xs text-slate-500">Latest transactions from the online storefront.</p>
          </div>
          <Link
            href="/admin/orders"
            className="flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-700"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {recentOrders.length > 0 ? (
                recentOrders.map((ord: any) => (
                  <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{ord.orderNumber}</td>
                    <td className="py-3 px-4">{ord.customerName}</td>
                    <td className="py-3 px-4 text-slate-500">{ord.customerPhone}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {formatCurrency(ord.finalAmount)}
                    </td>
                    <td className="py-3 px-4">{ord.paymentMethod}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          ord.paymentStatus === "PAID"
                            ? "bg-emerald-100 text-emerald-800"
                            : ord.paymentStatus === "PENDING_VERIFICATION"
                            ? "bg-amber-100 text-amber-800"
                            : ord.paymentStatus === "REJECTED"
                            ? "bg-red-100 text-red-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold">{ord.orderStatus}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{formatDate(ord.createdAt)}</td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/admin/orders?search=${ord.orderNumber}`}
                        className="text-sky-600 hover:underline font-bold"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No orders recorded yet. Place a test order from the storefront.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
