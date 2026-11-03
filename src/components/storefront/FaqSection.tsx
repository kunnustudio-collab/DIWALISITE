"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FaqItem {
  id?: string;
  question: string;
  answer: string;
  isActive?: boolean;
}

interface FaqSectionProps {
  faqs?: FaqItem[];
}

export function FaqSection({ faqs }: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const defaultFaqs: FaqItem[] = [
    {
      question: "How much electricity does the 1000W Havells Zella consume?",
      answer: "At 1000 Watts (1 kW), continuous operation for 1 hour consumes exactly 1 unit (1 kWh) of electricity. Since heating a standard 15 to 20-liter bucket typically takes only 10 to 15 minutes, each heating cycle consumes approximately 0.2 to 0.25 units—costing less than ₹2 per bucket in most residential tariff slabs.",
    },
    {
      question: "How long does it take to heat a bucket of water?",
      answer: "In regular winter ambient conditions (water at 15°C to 18°C), a standard 15 to 20-liter bucket reaches a warm bath temperature of 38°C to 42°C in approximately 10 to 15 minutes. Note that heating time varies depending on the starting temperature of the tap water and bucket volume.",
    },
    {
      question: "What is included inside the box?",
      answer: "The factory-sealed retail pack contains: 1 Unit Havells Zella 1000W Immersion Rod (Blue) with pre-fitted smart collapsible bucket hanger, 3-pin power cord with molded plug, and 1 Official User Manual & 2-Year Manufacturer Warranty Card.",
    },
    {
      question: "What is the warranty coverage and how do I claim it?",
      answer: "The product carries an authentic 2-Year Havells Manufacturer Warranty against manufacturing defects. To claim warranty support, you can call the Havells India national toll-free customer helpline (1800-103-1313) with your invoice copy.",
    },
    {
      question: "Which payment options are supported?",
      answer: "We support instant peer-to-bank UPI transfers (via Google Pay, PhonePe, Paytm, BHIM, and CRED through YouPI-PG) as well as Cash on Delivery (COD) for supported Indian pincodes.",
    },
    {
      question: "How can I track my order once placed?",
      answer: "After placing an order, you receive a secure unguessable order tracking link. You can also visit our Order Tracking page anytime and look up your status with your Order ID and phone number.",
    },
    {
      question: "What is the return and replacement policy?",
      answer: "We offer a 48-Hour Transit Replacement Guarantee. If the appliance arrives damaged or defective in transit, provide an unboxing video to our care desk for an immediate replacement at zero cost.",
    },
  ];

  const displayFaqs = faqs && faqs.length > 0 ? faqs.filter((f) => f.isActive !== false) : defaultFaqs;

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faqs" className="py-16 bg-slate-50 border-t border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-sky-700 bg-sky-100 px-3 py-1 rounded-full uppercase tracking-wider">
            Common Inquiries
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Clear, transparent answers about usage, power consumption, delivery, and warranty.
          </p>
        </div>

        <div className="space-y-3">
          {displayFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={faq.id || idx}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 font-bold text-slate-900 text-sm sm:text-base hover:text-sky-600 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-sky-600 shrink-0" />
                    <span>{faq.question}</span>
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-sky-600" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50 animate-in fade-in duration-150">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
