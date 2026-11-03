"use client";

import React from "react";
import { Award, Zap, Headphones, ShieldCheck } from "lucide-react";

export function WhyChooseSection() {
  const cards = [
    {
      icon: <Award className="w-6 h-6 text-amber-500" />,
      title: "Premium Quality",
      subtitle: "Trusted Brand",
    },
    {
      icon: <Zap className="w-6 h-6 text-sky-500 fill-sky-400" />,
      title: "Energy Efficient",
      subtitle: "1000W Power",
    },
    {
      icon: <Headphones className="w-6 h-6 text-sky-600" />,
      title: "Dedicated Support",
      subtitle: "We're Here to Help",
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-emerald-500" />,
      title: "Safe & Secure",
      subtitle: "Shopping",
    },
  ];

  return (
    <section className="py-14 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Editorial Section Header with Decorative Lines */}
        <div className="flex items-center justify-center gap-4 text-center">
          <span className="h-px w-12 sm:w-20 bg-sky-300" />
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Why Choose AquaHome?
          </h2>
          <span className="h-px w-12 sm:w-20 bg-sky-300" />
        </div>

        {/* 4 Cards Grid matching reference */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {cards.map((c, idx) => (
            <div
              key={idx}
              className="bg-[#edf6fc] hover:bg-[#e4f1fa] transition-colors rounded-2xl p-6 flex flex-col items-center justify-center text-center border border-sky-100 shadow-xs group"
            >
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mb-3 shadow-xs group-hover:scale-105 transition-transform">
                {c.icon}
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                {c.title}
              </h3>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                {c.subtitle}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
