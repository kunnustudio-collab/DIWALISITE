"use client";

import React from "react";
import { ShieldCheck, Award, Truck, Lock, RotateCcw, Headphones } from "lucide-react";

export function WhyBuyFromUsSection() {
  const points = [
    {
      title: "100% Genuine Sealed Units",
      description: "Direct distribution supply chain. Every immersion rod comes in brand retail packaging with security hologram.",
      icon: <ShieldCheck className="w-6 h-6 text-sky-600" />,
    },
    {
      title: "2-Year Manufacturer Warranty",
      description: "Full warranty registration card included. Backed by Havells India nationwide service center network.",
      icon: <Award className="w-6 h-6 text-amber-500" />,
    },
    {
      title: "Insured 48-Hour Dispatch",
      description: "Carefully packed with multi-layer bubble wrap to prevent element damage during transit.",
      icon: <Truck className="w-6 h-6 text-blue-600" />,
    },
    {
      title: "Transparent & Safe Payment",
      description: "Pay securely via peer-to-peer UPI (YouPI-PG) or Cash on Delivery (COD) with zero hidden checkout fees.",
      icon: <Lock className="w-6 h-6 text-emerald-600" />,
    },
    {
      title: "Transit Damage Protection",
      description: "If the package arrives damaged, report within 48 hours with an unboxing video for an instant hassle-free replacement.",
      icon: <RotateCcw className="w-6 h-6 text-indigo-600" />,
    },
    {
      title: "Dedicated Order Assistance",
      description: "Reach our customer desk via WhatsApp, Phone, or Email for order tracking and delivery queries.",
      icon: <Headphones className="w-6 h-6 text-cyan-600" />,
    },
  ];

  return (
    <section className="py-16 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-sky-700 bg-sky-100 px-3 py-1 rounded-full uppercase tracking-wider">
            Authenticity & Service
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
            Why Order From AquaThermal?
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600">
            Real seller guarantees, genuine brand stock, and customer-first support.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {points.map((p, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
                  {p.icon}
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2">
                  {p.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {p.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
