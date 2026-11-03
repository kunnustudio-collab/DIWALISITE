"use client";

import React from "react";
import {
  Zap,
  Shield,
  Sliders,
  ShieldCheck,
  CheckCircle,
  Lightbulb,
  Cpu,
  Layers,
} from "lucide-react";

interface Feature {
  id?: string;
  title: string;
  description: string;
  icon?: string;
  isVerified?: boolean;
}

interface BenefitsSectionProps {
  features?: Feature[];
}

const iconMap: Record<string, React.ReactNode> = {
  Zap: <Zap className="w-6 h-6 text-amber-500" />,
  Shield: <Shield className="w-6 h-6 text-sky-600" />,
  Sliders: <Sliders className="w-6 h-6 text-blue-600" />,
  ShieldCheck: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
  CheckCircle: <CheckCircle className="w-6 h-6 text-indigo-600" />,
  Lightbulb: <Lightbulb className="w-6 h-6 text-amber-600" />,
  Cpu: <Cpu className="w-6 h-6 text-sky-600" />,
  Layers: <Layers className="w-6 h-6 text-indigo-600" />,
};

export function BenefitsSection({ features }: BenefitsSectionProps) {
  const displayFeatures =
    features && features.length > 0
      ? features
      : [
          {
            title: "1000W Rapid Heating",
            description: "High heating efficiency warms a standard 15-20L bucket in approx. 10-15 minutes.",
            icon: "Zap",
            isVerified: true,
          },
          {
            title: "Nickel-Plated Heating Element",
            description: "Heavy copper tube core with anti-corrosive nickel plating protects against hard water scale.",
            icon: "Shield",
            isVerified: true,
          },
          {
            title: "Adjustable Temperature Dial",
            description: "Customize your water warmth between Low, Medium, and High easily with the rotary dial.",
            icon: "Sliders",
            isVerified: true,
          },
          {
            title: "Thermal Cut-Off Safety",
            description: "Equipped with automatic thermal cut-off mechanism for enhanced operational protection.",
            icon: "ShieldCheck",
            isVerified: true,
          },
          {
            title: "Smart Collapsible Hanger",
            description: "Dual-utility flap acts as a safe bucket edge hanger and protects element when stored.",
            icon: "CheckCircle",
            isVerified: true,
          },
          {
            title: "Neon Heating Indicator",
            description: "Bright visual indicator lamp confirms electrical contact and active water heating.",
            icon: "Lightbulb",
            isVerified: true,
          },
        ];

  return (
    <section id="benefits" className="py-16 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold text-sky-700 bg-sky-100/80 px-3 py-1 rounded-full uppercase tracking-wider">
            Verified Manufacturer Engineering
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
            Designed for Safe, Dependable Winter Heating
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600">
            Every specification is verified against the official manufacturer specification sheet and packaging.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {displayFeatures.map((f, idx) => (
            <div
              key={f.id || idx}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-sky-200 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {iconMap[f.icon || "Zap"] || <Zap className="w-6 h-6 text-sky-600" />}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                  {f.title}
                </h3>
                {f.isVerified && (
                  <span className="inline-block text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Verified Spec
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
