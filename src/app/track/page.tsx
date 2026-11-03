"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Truck,
  CheckCircle2,
  Clock,
  Package,
  ArrowLeft,
  AlertCircle,
  FileText,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

const ORDER_STEPS = [
  { key: "PENDING", label: "Order Placed" },
  { key: "PAYMENT_VERIFICATION", label: "Payment Verification" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "PROCESSING", label: "Processing & Packed" },
  { key: "SHIPPED", label: "Dispatched / In Transit" },
  { key: "DELIVERED", label: "Delivered" },
];

function TrackContent() {
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get("orderId") || "";
  const token = searchParams.get("token") || "";

  const [orderNumberInput, setOrderNumberInput] = useState(initialOrderId);
  const [tokenInput, setTokenInput] = useState(token);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(Boolean(initialOrderId));
  const [error, setError] = useState("");

  const fetchOrder = async (oid: string, tok: string) => {
    if (!oid) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(oid)}?token=${encodeURIComponent(tok)}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Order not found or invalid access token.");
      }
      setOrder(data.order);
    } catch (err: any) {
      setError(err.message || "Failed to find order.");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderId) {
      fetchOrder(initialOrderId, token);
    }
  }, [initialOrderId, token]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(orderNumberInput.trim(), tokenInput.trim());
  };

  // Determine current active step
  const getStepStatus = (stepKey: string, currentStatus: string) => {
    const statusOrder = [
      "PENDING",
      "PAYMENT_PENDING",
      "PAYMENT_VERIFICATION",
      "CONFIRMED",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
    ];

    if (currentStatus === "CANCELLED") return "cancelled";

    const currentIndex = statusOrder.indexOf(currentStatus);
    const stepIndex = statusOrder.indexOf(stepKey);

    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "active";
    return "upcoming";
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-sky-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Storefront</span>
        </Link>

        {/* Search Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Truck className="w-6 h-6 text-sky-600" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Track Your Order Delivery
            </h1>
          </div>

          <p className="text-xs sm:text-sm text-slate-500">
            Enter your order reference and secure access token provided upon checkout.
          </p>

          <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
            <div className="sm:col-span-6">
              <input
                type="text"
                required
                value={orderNumberInput}
                onChange={(e) => setOrderNumberInput(e.target.value.toUpperCase())}
                placeholder="Order Number (e.g. ORD-2026-1001)"
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none uppercase"
              />
            </div>
            <div className="sm:col-span-4">
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Security Access Token"
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-lg shadow transition-colors"
              >
                {loading ? "..." : "Track"}
              </button>
            </div>
          </form>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 mt-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Live Order Timeline & Details */}
        {order && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-8 animate-in fade-in duration-200">
            {/* Order Overview Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wider">
                  Order Details
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                  {order.orderNumber}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Placed on {formatDate(order.createdAt)}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                    order.orderStatus === "DELIVERED"
                      ? "bg-emerald-100 text-emerald-800"
                      : order.orderStatus === "CANCELLED"
                      ? "bg-red-100 text-red-800"
                      : "bg-sky-100 text-sky-800"
                  }`}
                >
                  {order.orderStatus.replace(/_/g, " ")}
                </span>

                <a
                  href={`/api/orders/${order.orderNumber}/invoice?token=${tokenInput || token}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-sky-600 border border-slate-200 px-3 py-1 rounded-lg"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Invoice</span>
                </a>
              </div>
            </div>

            {/* Stepper Timeline */}
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">
                Live Fulfillment Progress
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 text-center">
                {ORDER_STEPS.map((s, idx) => {
                  const state = getStepStatus(s.key, order.orderStatus);

                  return (
                    <div key={s.key} className="flex flex-col items-center space-y-2">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                          state === "completed"
                            ? "bg-emerald-600 text-white shadow-sm"
                            : state === "active"
                            ? "bg-sky-600 text-white ring-4 ring-sky-100 shadow-md"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {state === "completed" ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          idx + 1
                        )}
                      </div>
                      <span
                        className={`text-[11px] font-semibold ${
                          state === "active"
                            ? "text-sky-700 font-bold"
                            : state === "completed"
                            ? "text-slate-800"
                            : "text-slate-400"
                        }`}
                      >
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Item & Address Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 text-xs">
              <div className="space-y-2">
                <p className="font-bold text-slate-700">Purchased Items:</p>
                {order.items?.map((it: any) => (
                  <div key={it.id} className="flex justify-between py-1 border-b border-slate-100">
                    <span>
                      {it.productName} × {it.quantity}
                    </span>
                    <span className="font-bold">{formatCurrency(it.totalAmount)}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-1 font-bold text-sm text-slate-900">
                  <span>Total Amount:</span>
                  <span className="text-sky-700">{formatCurrency(order.finalAmount)}</span>
                </div>
              </div>

              {order.shippingAddress && (
                <div className="space-y-1">
                  <p className="font-bold text-slate-700">Delivery Address:</p>
                  <p className="text-slate-800 font-semibold">{order.shippingAddress.fullName}</p>
                  <p className="text-slate-600">
                    {order.shippingAddress.houseNumber}, {order.shippingAddress.street},{" "}
                    {order.shippingAddress.city}, {order.shippingAddress.state} -{" "}
                    {order.shippingAddress.pincode}
                  </p>
                  <p className="text-slate-500 pt-1">Contact: +91 {order.shippingAddress.phone}</p>
                </div>
              )}
            </div>

            {/* Status History Logs */}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <p className="font-bold text-xs text-slate-700">Order Activity Log:</p>
                <div className="space-y-2">
                  {order.statusHistory.map((sh: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                      <span className="text-slate-400 shrink-0 w-36">
                        {formatDate(sh.date)}
                      </span>
                      <span className="font-semibold text-slate-800">[{sh.status}]</span>
                      <span>{sh.note}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <TrackContent />
    </Suspense>
  );
}
