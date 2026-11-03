"use client";

import React from "react";
import { Tag, Truck, RefreshCw, Lock } from "lucide-react";

interface AnnouncementBarProps {
  text?: string;
  enabled?: boolean;
  link?: string;
}

export function AnnouncementBar({
  text = "Winter Special Offer - Get Flat ₹200 OFF on Your Order!",
  enabled = true,
}: AnnouncementBarProps) {
  if (!enabled) return null;

  return (
    <div className="bg-[#0b1e36] text-white text-[11px] sm:text-xs py-2 px-4 shadow-sm border-b border-sky-900/40">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center font-medium">
        {/* Left Offer */}
        <div className="flex items-center gap-2">
          <Tag className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span>{text}</span>
        </div>

        {/* Right Value Points */}
        <div className="hidden md:flex items-center gap-4 text-slate-300 text-[11px]">
          <span className="flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-sky-400" />
            <span>Free Shipping</span>
          </span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
            <span>Easy Returns</span>
          </span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Secure Checkout</span>
          </span>
        </div>
      </div>
    </div>
  );
}
