"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Zap,
  Sliders,
  CheckCircle2,
  Sparkles,
  Layers,
  ThermometerSun,
  Maximize2,
  X,
} from "lucide-react";

export function VisualShowcaseSection() {
  const [modalImage, setModalImage] = useState<string | null>(null);

  return (
    <section className="py-16 lg:py-20 bg-gradient-to-b from-white via-sky-50/40 to-white border-t border-sky-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 bg-sky-100/80 text-sky-800 text-xs font-bold px-3.5 py-1.5 rounded-full border border-sky-200">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>Official Visual Overview</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Advanced Engineering. Intuitive Design.
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Explore how Havells Zella 1000W balances precision heating controls with multi-tier electrical safety for everyday winter use.
          </p>
        </div>

        {/* 2-Column Editorial Card Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          
          {/* ================= CARD 1: Feature Callouts Infographic ================= */}
          <div className="bg-white rounded-3xl border border-sky-100 shadow-xl shadow-sky-500/5 overflow-hidden flex flex-col justify-between group transition-all hover:shadow-2xl hover:border-sky-300">
            {/* Visual Header */}
            <div className="p-6 sm:p-8 space-y-2 border-b border-slate-100 bg-gradient-to-r from-sky-50/50 to-white">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-sky-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-sky-600" />
                  <span>Precision Heating System</span>
                </span>
                <span className="text-[11px] font-bold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-full shadow-2xs">
                  Infographic 01
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                Adjustable Heat & Durable Architecture
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                Ergonomic temperature regulation knob, fast copper heating element, and durable thermoplastic build.
              </p>
            </div>

            {/* Clickable High-Res Image Container */}
            <div
              className="relative aspect-square sm:aspect-[4/3] bg-sky-50 cursor-pointer overflow-hidden flex items-center justify-center p-2 group/img"
              onClick={() => setModalImage("/images/havells-zella-features-infographic.jpg")}
            >
              <img
                src="/images/havells-zella-features-infographic.jpg"
                alt="Havells Zella Adjustable Heat Settings, Heating Element and Durable Build Infographic"
                className="w-full h-full object-contain group-hover/img:scale-102 transition-transform duration-500"
              />
              <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-xs text-white text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-lg opacity-85 group-hover/img:opacity-100 transition-opacity">
                <Maximize2 className="w-3.5 h-3.5 text-sky-400" />
                <span>Click to Expand</span>
              </div>
            </div>

            {/* Feature Highlights Footer */}
            <div className="grid grid-cols-2 gap-3 p-5 sm:p-6 bg-slate-50/70 border-t border-slate-100 text-xs">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-md bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 mt-0.5">
                  <ThermometerSun className="w-3 h-3 text-sky-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Adjustable Heat</p>
                  <p className="text-slate-500 text-[11px]">Low, Medium & High Dial</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-md bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Zap className="w-3 h-3 text-sky-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Fast Heating Coil</p>
                  <p className="text-slate-500 text-[11px]">High-efficiency element</p>
                </div>
              </div>
            </div>
          </div>

          {/* ================= CARD 2: Safety & Lifestyle Showcase ================= */}
          <div className="bg-white rounded-3xl border border-sky-100 shadow-xl shadow-sky-500/5 overflow-hidden flex flex-col justify-between group transition-all hover:shadow-2xl hover:border-sky-300">
            {/* Visual Header */}
            <div className="p-6 sm:p-8 space-y-2 border-b border-slate-100 bg-gradient-to-r from-sky-50/50 to-white">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-sky-700 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Certified Protection</span>
                </span>
                <span className="text-[11px] font-bold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-full shadow-2xs">
                  Infographic 02
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                Safe, Fast & Energy Efficient
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                Thermal overheat protection, heavy-duty 3-pin grounded plug, and high thermal transfer efficiency.
              </p>
            </div>

            {/* Clickable High-Res Image Container */}
            <div
              className="relative aspect-square sm:aspect-[4/3] bg-sky-50 cursor-pointer overflow-hidden flex items-center justify-center p-2 group/img"
              onClick={() => setModalImage("/images/havells-zella-safety-lifestyle.jpg")}
            >
              <img
                src="/images/havells-zella-safety-lifestyle.jpg"
                alt="Havells Zella Safe, Fast & Energy Efficient with 3-Pin Plug and Countertop Presentation"
                className="w-full h-full object-contain group-hover/img:scale-102 transition-transform duration-500"
              />
              <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-xs text-white text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-lg opacity-85 group-hover/img:opacity-100 transition-opacity">
                <Maximize2 className="w-3.5 h-3.5 text-sky-400" />
                <span>Click to Expand</span>
              </div>
            </div>

            {/* Feature Highlights Footer */}
            <div className="grid grid-cols-2 gap-3 p-5 sm:p-6 bg-slate-50/70 border-t border-slate-100 text-xs">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Overheat Safety</p>
                  <p className="text-slate-500 text-[11px]">Protective thermal threshold</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-md bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3 h-3 text-sky-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Heavy 3-Pin Plug</p>
                  <p className="text-slate-500 text-[11px]">Indian wall socket grounded</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Lightbox Modal for High-Resolution View */}
      {modalImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setModalImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-white rounded-3xl overflow-hidden shadow-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setModalImage(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={modalImage}
              alt="Expanded High Resolution View"
              className="max-h-[82vh] w-auto mx-auto object-contain rounded-2xl"
            />
          </div>
        </div>
      )}
    </section>
  );
}