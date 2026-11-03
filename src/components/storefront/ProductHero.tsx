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
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Sliders,
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

const defaultGallery = [
  {
    id: "hero-dual",
    url: "/images/havells-zella-hero.jpg",
    altText: "Havells Zella 1000W Immersion Rod - Dual View Folded & Deployed in Water Splash",
    title: "Dual View (Hero)",
  },
  {
    id: "hero-infographic",
    url: "/images/havells-zella-features-infographic.jpg",
    altText: "Havells Zella Infographic - Adjustable Heat Settings, Heating Element & Sturdy Build",
    title: "Feature Infographic",
  },
  {
    id: "hero-lifestyle",
    url: "/images/havells-zella-safety-lifestyle.jpg",
    altText: "Havells Zella Lifestyle - Safe, Fast & Energy Efficient with Heavy Duty 3-Pin Plug",
    title: "Safety & Efficiency",
  },
  {
    id: "hero-hanger",
    url: "/images/zella-opened-hanger.jpg",
    altText: "Havells Zella with Open Bucket Hanger Flaps and Nickel Coils",
    title: "Bucket Hanger",
  },
  {
    id: "hero-body",
    url: "/images/zella-folded-body.jpg",
    altText: "Havells Zella Compact Folded Body with Indicator Window",
    title: "Folded Body",
  },
  {
    id: "hero-dial",
    url: "/images/zella-dial-knob.jpg",
    altText: "Havells Zella Rotary Temperature Setting Dial (Low, Medium, High)",
    title: "Temp Dial",
  },
  {
    id: "hero-coils",
    url: "/images/zella-nickel-coils.jpg",
    altText: "Heavy-Duty Nickel Plated Heating Coils and Water Level Shaft",
    title: "Nickel Coils",
  },
];

export function ProductHero({ product }: ProductHeroProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null);
  const [cartAddedNotice, setCartAddedNotice] = useState(false);

  // Gallery items - prioritize product.images from database if populated
  const gallery =
    product.images && product.images.length > 0
      ? product.images.map((img, i) => {
          const match = defaultGallery.find((g) => g.url === img.url);
          return {
            id: img.id,
            url: img.url,
            altText: img.altText || product.name,
            title: match?.title || `View ${i + 1}`,
          };
        })
      : defaultGallery;

  const currentImage = gallery[activeSlide] || gallery[0];

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

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % gallery.length);
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + gallery.length) % gallery.length);
  };

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
                <span>In Stock • Free Delivery Across India</span>
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
                  aria-label="Decrease quantity"
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
                  aria-label="Increase quantity"
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
                <span>✓ Added {quantity} unit(s) of Havells Zella to your cart.</span>
                <Link href="/checkout" className="underline font-bold text-emerald-900">
                  Go to Checkout →
                </Link>
              </div>
            )}

            {/* Micro-Trust Note */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-1">
              <Lock className="w-3.5 h-3.5 text-sky-600" />
              <span>Secure Payment via YouPI-PG & UPI • Fast Dispatch</span>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: Hero Immersion Rod in Water Splash ================= */}
          <div className="lg:col-span-6 relative flex flex-col items-center justify-center">
            {/* Main Stage with Water Splash */}
            <div className="relative w-full max-w-lg aspect-square rounded-3xl overflow-hidden flex items-center justify-center group shadow-2xl shadow-sky-600/15 border-2 border-white/80 bg-gradient-to-b from-sky-100 to-sky-200">
              <img
                src={currentImage.url}
                alt={currentImage.altText || product.name}
                className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-500"
              />

              {/* Prev / Next Arrows */}
              <button
                type="button"
                onClick={prevSlide}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900 shadow-md flex items-center justify-center transition-all opacity-70 group-hover:opacity-100"
                aria-label="Previous view"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900 shadow-md flex items-center justify-center transition-all opacity-70 group-hover:opacity-100"
                aria-label="Next view"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Interactive Hotspot Pins (Only on Slide 0 - Dual Hero View) */}
              {(activeSlide === 0 || currentImage.url.includes("havells-zella-hero")) && (
                <>
                  {/* Hotspot 1: Temperature Dial (Top Left) */}
                  <div
                    className="absolute top-[13%] left-[34%] -translate-x-1/2 -translate-y-1/2 group/pin cursor-pointer z-20"
                    onMouseEnter={() => setActiveHotspot(1)}
                    onMouseLeave={() => setActiveHotspot(null)}
                    onClick={() => setActiveHotspot(activeHotspot === 1 ? null : 1)}
                  >
                    <div className="relative flex items-center justify-center">
                      <span className="absolute w-6 h-6 rounded-full bg-sky-400/50 animate-ping" />
                      <div className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px] font-black shadow-md border-2 border-white">
                        1
                      </div>
                    </div>
                    {activeHotspot === 1 && (
                      <div className="absolute top-7 -left-12 sm:left-0 w-48 bg-slate-900/95 backdrop-blur-md text-white p-2.5 rounded-xl text-[11px] shadow-2xl z-30 border border-slate-700 animate-in fade-in zoom-in-95 duration-150">
                        <p className="font-bold text-sky-400 flex items-center gap-1 mb-1">
                          <Sliders className="w-3 h-3" />
                          <span>Rotary Dial Knob</span>
                        </p>
                        <p className="text-slate-200 leading-snug">
                          Ergonomic temperature adjustment between Low, Medium, and High settings.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Hotspot 2: Collapsible Bucket Hanger (Top Right) */}
                  <div
                    className="absolute top-[20%] left-[68%] -translate-x-1/2 -translate-y-1/2 group/pin cursor-pointer z-20"
                    onMouseEnter={() => setActiveHotspot(2)}
                    onMouseLeave={() => setActiveHotspot(null)}
                    onClick={() => setActiveHotspot(activeHotspot === 2 ? null : 2)}
                  >
                    <div className="relative flex items-center justify-center">
                      <span className="absolute w-6 h-6 rounded-full bg-sky-400/50 animate-ping" />
                      <div className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px] font-black shadow-md border-2 border-white">
                        2
                      </div>
                    </div>
                    {activeHotspot === 2 && (
                      <div className="absolute top-7 right-0 sm:-right-8 w-52 bg-slate-900/95 backdrop-blur-md text-white p-2.5 rounded-xl text-[11px] shadow-2xl z-30 border border-slate-700 animate-in fade-in zoom-in-95 duration-150">
                        <p className="font-bold text-sky-400 flex items-center gap-1 mb-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Collapsible Flap Hanger</span>
                        </p>
                        <p className="text-slate-200 leading-snug">
                          Dual wings open into a sturdy hook to safely attach to the bucket edge.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Hotspot 3: Water Level Gauge (Mid Right) */}
                  <div
                    className="absolute top-[42%] left-[68%] -translate-x-1/2 -translate-y-1/2 group/pin cursor-pointer z-20"
                    onMouseEnter={() => setActiveHotspot(3)}
                    onMouseLeave={() => setActiveHotspot(null)}
                    onClick={() => setActiveHotspot(activeHotspot === 3 ? null : 3)}
                  >
                    <div className="relative flex items-center justify-center">
                      <span className="absolute w-6 h-6 rounded-full bg-sky-400/50 animate-ping" />
                      <div className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px] font-black shadow-md border-2 border-white">
                        3
                      </div>
                    </div>
                    {activeHotspot === 3 && (
                      <div className="absolute top-7 right-0 sm:-right-6 w-52 bg-slate-900/95 backdrop-blur-md text-white p-2.5 rounded-xl text-[11px] shadow-2xl z-30 border border-slate-700 animate-in fade-in zoom-in-95 duration-150">
                        <p className="font-bold text-sky-400 flex items-center gap-1 mb-1">
                          <Shield className="w-3 h-3" />
                          <span>Water Level Gauge</span>
                        </p>
                        <p className="text-slate-200 leading-snug">
                          Embossed Minimum & Maximum immersion lines for safe, dry-heat protected operation.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Hotspot 4: Nickel Coils (Bottom Right) */}
                  <div
                    className="absolute top-[80%] left-[69%] -translate-x-1/2 -translate-y-1/2 group/pin cursor-pointer z-20"
                    onMouseEnter={() => setActiveHotspot(4)}
                    onMouseLeave={() => setActiveHotspot(null)}
                    onClick={() => setActiveHotspot(activeHotspot === 4 ? null : 4)}
                  >
                    <div className="relative flex items-center justify-center">
                      <span className="absolute w-6 h-6 rounded-full bg-sky-400/50 animate-ping" />
                      <div className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px] font-black shadow-md border-2 border-white">
                        4
                      </div>
                    </div>
                    {activeHotspot === 4 && (
                      <div className="absolute bottom-8 right-0 sm:-right-6 w-52 bg-slate-900/95 backdrop-blur-md text-white p-2.5 rounded-xl text-[11px] shadow-2xl z-30 border border-slate-700 animate-in fade-in zoom-in-95 duration-150">
                        <p className="font-bold text-sky-400 flex items-center gap-1 mb-1">
                          <Zap className="w-3 h-3" />
                          <span>Nickel-Plated Coil</span>
                        </p>
                        <p className="text-slate-200 leading-snug">
                          1000W heavy copper element coated with anti-corrosive nickel plating.
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Badge Overlay */}
              <div className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-xs text-[10px] font-bold text-sky-900 px-2.5 py-1 rounded-full border border-sky-100 flex items-center gap-1">
                <span>{currentImage.title}</span>
              </div>
            </div>

            {/* Slider Dots */}
            <div className="flex items-center justify-center gap-2 mt-3">
              {gallery.map((img, dot) => (
                <button
                  key={img.id || dot}
                  type="button"
                  onClick={() => setActiveSlide(dot)}
                  className={`h-2 rounded-full transition-all ${
                    activeSlide === dot ? "w-6 bg-sky-600" : "w-2 bg-sky-200 hover:bg-sky-400"
                  }`}
                  aria-label={`Switch to ${img.title || `Slide ${dot + 1}`}`}
                />
              ))}
            </div>

            {/* Thumbnail Preview Strip below */}
            <div className="flex items-center justify-center gap-2 mt-3 overflow-x-auto max-w-full px-2 py-1">
              {gallery.map((img, idx) => (
                <button
                  key={`thumb-${img.id || idx}`}
                  type="button"
                  onClick={() => setActiveSlide(idx)}
                  className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    activeSlide === idx
                      ? "border-sky-600 shadow-md scale-105 ring-2 ring-sky-300"
                      : "border-white/80 hover:border-sky-300 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img.url}
                    alt={img.altText || `Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}