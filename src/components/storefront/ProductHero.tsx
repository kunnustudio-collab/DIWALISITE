"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Zap,
  Shield,
  Lightbulb,
  CheckCircle2,
  ShoppingCart,
  ArrowRight,
  Lock,
  Sparkles,
  Info,
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
}

export function ProductHero({ product }: ProductHeroProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null);
  const [cartAddedNotice, setCartAddedNotice] = useState(false);

  const handleQtyChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(10, prev + delta)));
  };

  const handleAddToCart = () => {
    setCartAddedNotice(true);
    setTimeout(() => setCartAddedNotice(false), 3000);
  };

  const handleBuyNow = () => {
    router.push(`/checkout?qty=${quantity}`);
  };

  const heroImage = "/images/hero-rod-splash-2x.jpg";

  return (
    <section
      id="product-overview"
      className="relative overflow-hidden bg-gradient-to-br from-[#dff1fd] via-[#eaf5fc] to-[#f4f9fd] pt-8 sm:pt-12 pb-16 lg:pb-24 border-b border-sky-100"
    >
      {/* Decorative subtle ambient water background glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-sky-200/50 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-blue-100/40 rounded-full blur-2xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* ================= LEFT COLUMN: Typography & Purchase ================= */}
          <div className="lg:col-span-6 space-y-6 z-10">
            {/* Pill Tag */}
            <div>
              <span className="inline-flex items-center gap-1.5 bg-white/80 backdrop-blur-xs text-sky-800 text-xs font-bold px-3.5 py-1.5 rounded-full border border-sky-200/70 shadow-xs">
                Trusted. Reliable. Efficient.
              </span>
            </div>

            {/* Massive Editorial Headline */}
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-black text-slate-900 tracking-tight leading-[1.08]">
                Havells Zella<br />
                Immersion Rod<br />
                <span className="text-sky-600">1000W</span>
              </h1>
              <p className="mt-3 text-base sm:text-lg text-slate-600 font-medium">
                Heat Water Quickly & Effortlessly
              </p>
            </div>

            {/* 3 Horizontal Feature Badges */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-1">
              {/* Badge 1 */}
              <div className="flex items-center gap-2 bg-white/85 backdrop-blur-xs border border-sky-100 px-3.5 py-2 rounded-xl shadow-xs">
                <div className="w-6 h-6 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                  <Zap className="w-3.5 h-3.5 text-sky-600 fill-sky-500" />
                </div>
                <div className="leading-tight">
                  <p className="text-[11px] font-black text-slate-900">1000W</p>
                  <p className="text-[10px] text-slate-500 font-medium">Power</p>
                </div>
              </div>

              {/* Badge 2 */}
              <div className="flex items-center gap-2 bg-white/85 backdrop-blur-xs border border-sky-100 px-3.5 py-2 rounded-xl shadow-xs">
                <div className="w-6 h-6 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                  <Shield className="w-3.5 h-3.5 text-sky-600" />
                </div>
                <div className="leading-tight">
                  <p className="text-[11px] font-black text-slate-900">Copper Tube</p>
                  <p className="text-[10px] text-slate-500 font-medium">Heating Element</p>
                </div>
              </div>

              {/* Badge 3 */}
              <div className="flex items-center gap-2 bg-white/85 backdrop-blur-xs border border-sky-100 px-3.5 py-2 rounded-xl shadow-xs">
                <div className="w-6 h-6 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                  <Lightbulb className="w-3.5 h-3.5 text-sky-600" />
                </div>
                <div className="leading-tight">
                  <p className="text-[11px] font-black text-slate-900">Heating</p>
                  <p className="text-[10px] text-slate-500 font-medium">Indicator</p>
                </div>
              </div>
            </div>

            {/* Price Block */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl sm:text-4xl font-black text-sky-600 tracking-tight">
                  {formatCurrency(product.sellingPrice)}
                </span>
                <span className="text-lg sm:text-xl text-slate-400 line-through font-medium">
                  {formatCurrency(product.originalPrice)}
                </span>
                <span className="text-xs font-bold text-white bg-sky-600 px-2.5 py-0.5 rounded-md shadow-xs">
                  {product.discountPercentage}% OFF
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>In Stock • Free Delivery</span>
              </div>
            </div>

            {/* Quantity Selector & Action Buttons matching reference */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              {/* Quantity Pill */}
              <div className="inline-flex items-center justify-between border border-slate-300 rounded-xl bg-white px-3 py-2 shadow-xs sm:w-28">
                <button
                  type="button"
                  onClick={() => handleQtyChange(-1)}
                  disabled={quantity <= 1}
                  className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-slate-900 font-bold disabled:opacity-30"
                >
                  −
                </button>
                <span className="font-bold text-slate-900 text-sm select-none">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => handleQtyChange(1)}
                  disabled={quantity >= 10}
                  className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-slate-900 font-bold disabled:opacity-30"
                >
                  +
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex items-center justify-center gap-2 bg-[#0c2444] hover:bg-sky-950 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md transition-all active:scale-[0.98]"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              {/* Buy Now Button */}
              <button
                type="button"
                onClick={handleBuyNow}
                className="flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 text-sky-800 border-2 border-sky-300 hover:border-sky-500 font-bold text-sm px-6 py-3 rounded-xl shadow-xs transition-all active:scale-[0.98]"
              >
                <span>Buy Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Cart Notification Popup */}
            {cartAddedNotice && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold rounded-xl flex items-center justify-between animate-in fade-in duration-200">
                <span>✓ Added {quantity} unit(s) of Havells Zella to your bag.</span>
                <Link href="/checkout" className="underline font-bold text-emerald-900">
                  Go to Checkout →
                </Link>
              </div>
            )}

            {/* Micro-Trust Note */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-1">
              <Lock className="w-3.5 h-3.5 text-sky-600" />
              <span>Secure Payment via YouPI-PG & UPI</span>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: Hero Immersion Rod in Water Splash ================= */}
          <div className="lg:col-span-6 relative flex flex-col items-center justify-center">
            {/* Main Stage with Water Splash */}
            <div className="relative w-full max-w-lg aspect-square sm:aspect-[4/3] rounded-3xl overflow-hidden flex items-center justify-center group shadow-xl shadow-sky-500/10 border border-white/60">
              <img
                src={heroImage}
                alt={product.name}
                className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-700"
              />

              {/* Connecting Hotspot Labels around the product */}
              {/* Hotspot 1: Smart Hanger */}
              <div
                className="absolute top-10 left-6 sm:left-10 group/pin cursor-pointer"
                onMouseEnter={() => setActiveHotspot(1)}
                onMouseLeave={() => setActiveHotspot(null)}
              >
                <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-sky-200 text-[11px] font-bold text-slate-900 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-sky-500" />
                  <span>Collapsible Hanger</span>
                </div>
                {activeHotspot === 1 && (
                  <div className="absolute top-8 left-0 w-48 bg-slate-900 text-white p-2.5 rounded-xl text-[10px] shadow-xl z-20">
                    Dual utility flap that folds open as a safe bucket edge hook.
                  </div>
                )}
              </div>

              {/* Hotspot 2: Neon Indicator */}
              <div
                className="absolute top-36 right-4 sm:right-8 group/pin cursor-pointer"
                onMouseEnter={() => setActiveHotspot(2)}
                onMouseLeave={() => setActiveHotspot(null)}
              >
                <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-sky-200 text-[11px] font-bold text-slate-900">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span>Neon Power Lamp</span>
                </div>
                {activeHotspot === 2 && (
                  <div className="absolute top-8 right-0 w-48 bg-slate-900 text-white p-2.5 rounded-xl text-[10px] shadow-xl z-20">
                    Bright neon indicator illuminates when actively heating water.
                  </div>
                )}
              </div>

              {/* Hotspot 3: Nickel Element */}
              <div
                className="absolute bottom-16 left-6 sm:left-12 group/pin cursor-pointer"
                onMouseEnter={() => setActiveHotspot(3)}
                onMouseLeave={() => setActiveHotspot(null)}
              >
                <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-sky-200 text-[11px] font-bold text-slate-900">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Nickel-Plated Element</span>
                </div>
                {activeHotspot === 3 && (
                  <div className="absolute bottom-8 left-0 w-52 bg-slate-900 text-white p-2.5 rounded-xl text-[10px] shadow-xl z-20">
                    Corrosion-resistant nickel coating prevents mineral scaling in hard water.
                  </div>
                )}
              </div>
            </div>

            {/* Slider Dots matching reference */}
            <div className="flex items-center justify-center gap-2 mt-4">
              {[0, 1, 2, 3].map((dot) => (
                <button
                  key={dot}
                  type="button"
                  onClick={() => setActiveSlide(dot)}
                  className={`h-2 rounded-full transition-all ${
                    activeSlide === dot ? "w-6 bg-sky-600" : "w-2 bg-sky-200 hover:bg-sky-400"
                  }`}
                  aria-label={`Slide ${dot + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
