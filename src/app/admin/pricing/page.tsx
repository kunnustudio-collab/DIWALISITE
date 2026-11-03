"use client";

import React, { useState, useEffect } from "react";
import {
  BadgePercent,
  IndianRupee,
  Save,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  Sparkles,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function AdminPricingPage() {
  const [product, setProduct] = useState<any>(null);
  const [originalPrice, setOriginalPrice] = useState(2190);
  const [sellingPrice, setSellingPrice] = useState(1499);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function loadPricing() {
      try {
        const res = await fetch("/api/pricing");
        const data = await res.json();
        if (data.pricing) {
          setProduct(data.pricing);
          setOriginalPrice(data.pricing.originalPrice);
          setSellingPrice(data.pricing.sellingPrice);
        }
      } catch (err) {
        console.error("Failed to load pricing", err);
      } finally {
        setLoading(false);
      }
    }
    loadPricing();
  }, []);

  const discountAmount = Math.max(0, originalPrice - sellingPrice);
  const discountPercentage =
    originalPrice > 0 ? Math.round(((originalPrice - sellingPrice) / originalPrice) * 100) : 0;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sellingPrice > originalPrice) {
      setErrorMsg("Selling price cannot exceed the original MRP.");
      return;
    }
    if (sellingPrice <= 0 || originalPrice <= 0) {
      setErrorMsg("Prices must be greater than zero.");
      return;
    }

    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await fetch("/api/pricing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product?.id,
          originalPrice,
          sellingPrice,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update pricing");
      }

      setSuccessMsg("Dynamic pricing updated successfully! Storefront will reflect this instantly.");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update pricing");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Dynamic Pricing & Discounts
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure active product pricing, manufacturer MRP, and real discount percentages.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-sm rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Pricing Inputs */}
        <div className="md:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-5">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Price Configuration
          </h2>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Manufacturer Maximum Retail Price (MRP) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  required
                  min={1}
                  step="1"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(parseFloat(e.target.value) || 0)}
                  className="w-full text-base font-bold pl-8 pr-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
              <span className="text-[10px] text-slate-400">Printed manufacturer box price.</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Active Selling Price (Payable by Customer) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  required
                  min={1}
                  step="1"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                  className="w-full text-base font-bold pl-8 pr-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none text-sky-700"
                />
              </div>
              <span className="text-[10px] text-slate-400">Actual price charged at checkout.</span>
            </div>

            {/* Auto-Calculated Metrics Box */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between font-semibold text-slate-600">
                <span>Calculated Discount Value:</span>
                <span className="text-emerald-700">{formatCurrency(discountAmount)}</span>
              </div>
              <div className="flex justify-between font-semibold text-slate-600">
                <span>Calculated Discount %:</span>
                <span className="text-emerald-700 font-bold">{discountPercentage}% OFF</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-sm py-3 rounded-xl shadow transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Updating..." : "Save Active Pricing"}</span>
            </button>
          </form>
        </div>

        {/* Live Storefront Preview */}
        <div className="md:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">
            Storefront Live Preview
          </h2>

          <div className="p-4 bg-gradient-to-br from-slate-50 to-sky-50/50 rounded-xl border border-sky-100 space-y-2">
            <span className="text-[11px] font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded">
              Havells Zella 1000W
            </span>

            <div className="flex items-baseline gap-2 pt-1 flex-wrap">
              <span className="text-3xl font-black text-slate-900">
                {formatCurrency(sellingPrice)}
              </span>
              {originalPrice > sellingPrice && (
                <>
                  <span className="text-base text-slate-400 line-through">
                    {formatCurrency(originalPrice)}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {discountPercentage}% OFF
                  </span>
                </>
              )}
            </div>

            <p className="text-[11px] text-slate-500">
              Customer saves {formatCurrency(discountAmount)} on this purchase.
            </p>
          </div>

          <div className="text-[11px] text-slate-400 space-y-1">
            <p className="font-semibold text-slate-600">Pricing Policy Compliance:</p>
            <p>• Server validates every checkout order against active database price.</p>
            <p>• Zero client-side price modification vulnerability.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
