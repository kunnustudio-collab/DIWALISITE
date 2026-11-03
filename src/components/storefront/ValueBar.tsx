"use client";

import React from "react";
import { Truck, ShieldCheck, Headphones, RefreshCw } from "lucide-react";

export function ValueBar() {
  const items = [
    {
      icon: <Truck className="w-5 h-5 text-sky-600" />,
      title: "Fast & Reliable Delivery",
      subtitle: "Dispatched in 24-48 Hours",
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-sky-600" />,
      title: "Secure Payments",
      subtitle: "(UPI / COD Available)",
    },
    {
      icon: <Headphones className="w-5 h-5 text-sky-600" />,
      title: "24x7 Customer Support",
      subtitle: "Dedicated WhatsApp & Phone",
    },
    {
      icon: <RefreshCw className="w-5 h-5 text-sky-600" />,
      title: "Easy Returns",
      subtitle: "Within 7 Days Replacement",
    },
  ];

  return (
    <div className="bg-white border-b border-slate-200 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x divide-slate-200">
          {items.map((it, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 px-2 lg:px-6 justify-start lg:justify-center"
            >
              <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center shrink-0 border border-sky-100">
                {it.icon}
              </div>
              <div>
                <p className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">
                  {it.title}
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  {it.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
