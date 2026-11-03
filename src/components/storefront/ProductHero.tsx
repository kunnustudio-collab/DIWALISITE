"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Clock,
  Sparkles,
  ShoppingBag,
  Zap,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ProductHeroProps {
  product: {
    id: string;
    name: string;
    brand: string;
    modelName: string;
    subtitle: string;
    description: string;
    originalPrice: number;
    sellingPrice: number;
    discountPercentage: number;
    stockQuantity: number;
    isInStock: boolean;
    images: { id: string; url: string; altText?: string | null }[];
    warrantyInfo?: string | null;
  };
  stats: {
    averageRating: number | null;
    totalApprovedReviews: number;
  };
  deliveryDays?: string;
}

export function ProductHero({
  product,
  stats,
  deliveryDays = "2 to 4 Business Days",
}: ProductHeroProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const images =
    product.images && product.images.length > 0
      ? product.images
      : [
          {
            id: "default-1",
            url: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=1000&q=80",
            altText: product.name,
          },
        ];

  const currentImage = images[selectedImageIndex] || images[0];

  const handleQtyChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(10, prev + delta)));
  };

  const savings = Math.max(0, product.originalPrice - product.sellingPrice);

  return (
    <section id="product-overview" className="relative pt-6 pb-16 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="text-xs text-slate-500 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-sky-600">Home</Link>
          <span>/</span>
          <span>Home Appliances</span>
          <span>/</span>
          <span>Immersion Heaters</span>
          <span>/</span>
          <span className="text-slate-800 font-medium truncate max-w-xs">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* ================= LEFT: Product Gallery ================= */}
          <div className="lg:col-span-7 space-y-4">
            {/* Main Stage Image */}
            <div className="relative aspect-square w-full rounded-2xl bg-slate-50 border border-slate-200/80 overflow-hidden shadow-inner group">
              <img
                src={currentImage.url}
                alt={currentImage.altText || product.name}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />

              {/* Badges Over Image */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <span className="inline-flex items-center gap-1.5 bg-sky-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  {product.discountPercentage}% OFF
                </span>
                <span className="inline-flex items-center gap-1 bg-white/95 backdrop-blur-sm text-slate-800 text-[11px] font-semibold px-2.5 py-1 rounded-md shadow border border-slate-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  100% Genuine Havells Pack
                </span>
              </div>

              {/* Watermark / Authorized Disclaimer */}
              <div className="absolute bottom-3 right-3 bg-black/60 text-white text-[10px] px-2.5 py-1 rounded backdrop-blur-sm font-medium">
                Photo for illustration • Genuine sealed stock
              </div>
            </div>

            {/* Thumbnail Row */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      selectedImageIndex === idx
                        ? "border-sky-600 ring-2 ring-sky-600/30 shadow-md scale-102"
                        : "border-slate-200 hover:border-slate-300 opacity-75 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={img.altText || `View ${idx + 1}`}
                      className="w-full h-full object-cover object-center"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Quick Trust Highlights under photo */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-center">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <Zap className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                <p className="text-xs font-bold text-slate-800">1000W Power</p>
                <p className="text-[11px] text-slate-500">Heats 15-20L in ~12m</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <ShieldCheck className="w-5 h-5 text-sky-600 mx-auto mb-1" />
                <p className="text-xs font-bold text-slate-800">Nickel Plated</p>
                <p className="text-[11px] text-slate-500">Scale & Rust Resistant</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                <p className="text-xs font-bold text-slate-800">2-Year Warranty</p>
                <p className="text-[11px] text-slate-500">Brand Service Coverage</p>
              </div>
            </div>
          </div>

          {/* ================= RIGHT: Pricing & Buy Box ================= */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Product Title & Brand */}
              <div>
                <div className="inline-block text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md uppercase tracking-wider mb-2">
                  Havells • Series Zella • Electric Blue
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  {product.name}
                </h1>
                <p className="mt-2 text-sm sm:text-base text-slate-600 font-normal">
                  {product.subtitle}
                </p>
              </div>

              {/* Star Rating Section - Derived ONLY from Approved Genuine Reviews */}
              <div className="flex items-center gap-3 py-2 border-y border-slate-100">
                {stats.totalApprovedReviews > 0 && stats.averageRating ? (
                  <>
                    <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-amber-900 font-bold text-xs">
                      <span>{stats.averageRating}</span>
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    </div>
                    <span className="text-xs text-slate-500">
                      Based on{" "}
                      <a href="#reviews" className="font-semibold text-slate-700 underline">
                        {stats.totalApprovedReviews} genuine verified review{stats.totalApprovedReviews > 1 ? "s" : ""}
                      </a>
                    </span>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <div className="flex text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-3.5 h-3.5 fill-amber-300 text-amber-400" />
                      ))}
                    </div>
                    <span>Fresh batch • Customer reviews appear after admin moderation</span>
                  </div>
                )}
              </div>

              {/* Pricing Display */}
              <div id="hero-buy" className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-sky-50/40 border border-sky-100 space-y-2">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                    {formatCurrency(product.sellingPrice)}
                  </span>
                  {product.originalPrice > product.sellingPrice && (
                    <>
                      <span className="text-lg text-slate-400 line-through">
                        {formatCurrency(product.originalPrice)}
                      </span>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Save {formatCurrency(savings)} ({product.discountPercentage}% OFF)
                      </span>
                    </>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  Inclusive of all taxes. Free Express Delivery across India.
                </p>

                {/* Stock Availability */}
                <div className="pt-2 flex items-center justify-between text-xs">
                  {product.isInStock && product.stockQuantity > 0 ? (
                    <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                      </span>
                      <span>In Stock • Ready to Dispatch (Only {product.stockQuantity} left)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-red-600 font-semibold">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Temporarily Out of Stock</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quantity Selector */}
              {product.isInStock && product.stockQuantity > 0 && (
                <div className="flex items-center justify-between gap-4 py-1">
                  <span className="text-sm font-semibold text-slate-700">Select Quantity:</span>
                  <div className="flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden shadow-sm">
                    <button
                      type="button"
                      onClick={() => handleQtyChange(-1)}
                      disabled={quantity <= 1}
                      className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-40 font-bold text-base transition-colors"
                    >
                      −
                    </button>
                    <span className="px-4 py-1.5 font-bold text-slate-900 text-sm select-none">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQtyChange(1)}
                      disabled={quantity >= Math.min(10, product.stockQuantity)}
                      className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-40 font-bold text-base transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <Link
                  href={`/checkout?qty=${quantity}`}
                  className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white text-base font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 transform active:scale-[0.99] transition-all"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>BUY NOW • {formatCurrency(product.sellingPrice * quantity)}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <p className="text-[11px] text-center text-slate-500">
                  ⚡ Express Checkout: Pay via UPI (Google Pay / PhonePe) or Cash on Delivery
                </p>
              </div>

              {/* Delivery & Assurance Details */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 space-y-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <Truck className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-800">
                      Standard Express Shipping: FREE
                    </p>
                    <p className="text-slate-500">
                      Estimated delivery within {deliveryDays} via BlueDart / Delhivery.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-800">
                      {product.warrantyInfo || "2 Years Manufacturer Warranty"}
                    </p>
                    <p className="text-slate-500">
                      Doorstep brand service support across 500+ Indian cities.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-800">
                      48-Hour Replacement Guarantee
                    </p>
                    <p className="text-slate-500">
                      Instant replacement provided in case of transit damage.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
