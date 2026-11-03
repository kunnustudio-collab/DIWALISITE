"use client";

import React, { useState } from "react";
import { Package, ShieldCheck, AlertTriangle, FileText, CheckCircle } from "lucide-react";

interface Spec {
  id?: string;
  label: string;
  value: string;
  category?: string;
  isVerified?: boolean;
}

interface ProductDetailsProps {
  description: string;
  specs: Spec[];
  boxContents?: string | null;
  warrantyInfo?: string | null;
}

export function ProductDetailsSection({
  description,
  specs,
  boxContents,
  warrantyInfo,
}: ProductDetailsProps) {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = ["All", ...Array.from(new Set(specs.map((s) => s.category || "General")))];

  const filteredSpecs =
    activeCategory === "All"
      ? specs
      : specs.filter((s) => (s.category || "General") === activeCategory);

  return (
    <section id="specifications" className="py-16 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Description & Overview */}
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-full uppercase tracking-wider">
            Comprehensive Overview
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Detailed Product Specifications
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed text-left sm:text-center">
            {description}
          </p>
        </div>

        {/* Specifications Filter & Table */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 max-w-5xl mx-auto shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6 border-b border-slate-200 pb-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-sky-600" />
              <span>Technical Data Sheet</span>
            </h3>

            {/* Category tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                    activeCategory === cat
                      ? "bg-sky-600 text-white shadow-sm"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <tbody className="divide-y divide-slate-200/80">
                {filteredSpecs.map((spec, idx) => (
                  <tr key={spec.id || idx} className="hover:bg-slate-100/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-500 w-2/5">
                      {spec.label}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span>{spec.value}</span>
                        {spec.isVerified && (
                          <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                            Verified
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Box Contents & Warranty Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Box Contents */}
          <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-sky-700 font-bold text-base">
              <Package className="w-5 h-5 text-sky-600" />
              <span>Package Box Contents</span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              {boxContents ||
                "1 N Havells Zella Immersion Rod (Blue), 1 N Pre-fitted Smart Collapsible Bucket Hanger, 1 N Official User Instruction Manual & 2-Year Warranty Registration Card."}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-2 border-t border-slate-200">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Ships in tamper-evident corrugated outer box.</span>
            </div>
          </div>

          {/* Warranty Info */}
          <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-base">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Warranty & Service Policy</span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              {warrantyInfo ||
                "2 Years Manufacturer Warranty covering manufacturing defects from the date of retail invoice. Serviceable at authorized brand centers across India."}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-2 border-t border-slate-200">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Toll-Free Customer Care Assistance: 1800-103-1313</span>
            </div>
          </div>
        </div>

        {/* Safety Precautions & Instructions */}
        <div className="max-w-5xl mx-auto bg-amber-50/60 border border-amber-200 rounded-2xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-base">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>Essential Safety Instructions for Immersion Rods</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-amber-950">
            <div className="flex items-start gap-2">
              <span className="font-bold text-amber-700 shrink-0">1.</span>
              <span>Always immerse rod vertically between the embossed MIN and MAX water levels before switching on power.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-amber-700 shrink-0">2.</span>
              <span>Use only with a standard, properly earthed 3-pin wall power socket (16A rated recommended).</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-amber-700 shrink-0">3.</span>
              <span><strong>DANGER:</strong> Never put your hand in the water or touch the bucket while the device is plugged into power.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-amber-700 shrink-0">4.</span>
              <span>Always switch off and unplug the power cord before removing the heater or drawing water from the bucket.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
