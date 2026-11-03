"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Truck, ShieldCheck, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface FinalCtaSectionProps {
  product: {
    id: string;
    name: string;
    sellingPrice: number;
    originalPrice: number;
    discountPercentage: number;
    stockQuantity: number;
    isInStock: boolean;
    images: { url: string }[];
  };
}

export function FinalCtaSection({ product }: FinalCtaSectionProps) {
  const [qty, setQty] = useState(1);

  const imageUrl =
    product.images && product.images.length > 0
      ? product.images[0].url
      : "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=600&q=80";

  return (
    <section className="py-16 bg-gradient-to-b from-white via-sky-50/30 to-slate-100 border-t border-slate-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl shadow-sky-500/5 flex flex-col md:flex-row items-center gap-8">
          {/* Left: Product Thumbnail */}
          <div className="relative w-40 h-40 sm:w-52 sm:h-52 rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 shrink-0">
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute top-2 left-2 bg-sky-600 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow">
              {product.discountPercentage}% OFF
            </div>
          </div>

          {/* Right: Info & Purchase Controls */}
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div>
              <span className="text-xs font-bold text-sky-700 uppercase tracking-wider">
                Instant Winter Warmth • 1000W
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
                {product.name}
              </h2>
            </div>

            {/* Price & savings */}
            <div className="flex items-baseline justify-center md:justify-start gap-3 flex-wrap">
              <span className="text-3xl font-black text-slate-900">
                {formatCurrency(product.sellingPrice)}
              </span>
              {product.originalPrice > product.sellingPrice && (
                <span className="text-base text-slate-400 line-through">
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                Flat {product.discountPercentage}% Discount
              </span>
            </div>

            {/* Quantity Selector & Buy Now Button */}
            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 pt-2">
              <div className="flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden shadow-sm">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 font-bold"
                >
                  −
                </button>
                <span className="px-4 py-2 font-bold text-slate-900 text-sm">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(10, q + 1))}
                  className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 font-bold"
                >
                  +
                </button>
              </div>

              <Link
                href={`/checkout?qty=${qty}`}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white font-bold text-base px-8 py-3.5 rounded-xl shadow-lg shadow-sky-500/25 hover:shadow-sky-500/35 transition-all"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Buy Now • {formatCurrency(product.sellingPrice * qty)}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center justify-center md:justify-start gap-4 text-[11px] text-slate-500 pt-2">
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-sky-600" />
                Free Express Delivery
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                2 Years Havells Warranty
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
