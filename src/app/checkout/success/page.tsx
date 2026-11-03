"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  FileText,
  Truck,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber") || "";
  const token = searchParams.get("token") || "";

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!orderNumber) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/orders/${orderNumber}?token=${token}`);
        const data = await res.json();
        if (data.order) {
          setOrder(data.order);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [orderNumber, token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-md space-y-6 text-center">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
            Order Confirmed
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Thank You For Your Order!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Order Reference: <strong className="text-slate-800">{orderNumber}</strong>
          </p>
        </div>

        {order && (
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-left space-y-4 text-xs sm:text-sm">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <span className="text-slate-500">Order Placed On:</span>
              <span className="font-semibold text-slate-800">{formatDate(order.createdAt)}</span>
            </div>

            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <span className="text-slate-500">Payment Method:</span>
              <span className="font-bold text-slate-800">{order.paymentMethod}</span>
            </div>

            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <span className="text-slate-500">Total Payable Amount:</span>
              <span className="font-extrabold text-sky-700 text-base">
                {formatCurrency(order.finalAmount)}
              </span>
            </div>

            {order.shippingAddress && (
              <div>
                <p className="font-bold text-slate-700 mb-1">Delivering To:</p>
                <p className="text-slate-600">
                  {order.shippingAddress.fullName} • {order.shippingAddress.phone}
                </p>
                <p className="text-slate-500">
                  {order.shippingAddress.houseNumber}, {order.shippingAddress.street},{" "}
                  {order.shippingAddress.city}, {order.shippingAddress.state} -{" "}
                  {order.shippingAddress.pincode}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href={`/track?orderId=${encodeURIComponent(orderNumber)}&token=${encodeURIComponent(token)}`}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow transition-colors"
          >
            <Truck className="w-4 h-4" />
            <span>Track Order Delivery</span>
          </Link>

          <a
            href={`/api/orders/${orderNumber}/invoice?token=${encodeURIComponent(token)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-sm px-5 py-3 rounded-xl transition-colors"
          >
            <FileText className="w-4 h-4 text-sky-600" />
            <span>Print Tax Invoice</span>
          </a>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <Link href="/" className="text-xs text-sky-600 hover:underline font-semibold">
            Return to Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
