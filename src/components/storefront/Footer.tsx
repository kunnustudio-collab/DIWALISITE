"use client";

import React from "react";
import Link from "next/link";
import { Flame, Mail, Phone, MapPin, ShieldCheck, MessageCircle } from "lucide-react";

interface FooterProps {
  storeName?: string;
  supportEmail?: string;
  supportPhone?: string;
  supportWhatsapp?: string;
  businessAddress?: string;
  sellerDisclaimer?: string;
}

export function Footer({
  storeName = "AquaThermal Essentials",
  supportEmail = "care@aquathermal.store",
  supportPhone = "+91 98765 43210",
  supportWhatsapp = "+919876543210",
  businessAddress = "Plot 42, Electronics Zone, Phase IV, Gurgaon, Haryana 122016, India",
  sellerDisclaimer = "AquaThermal Essentials is an independent authorized retail stockist. 'Havells' and 'Zella' are registered trademarks of Havells India Ltd. This store is independently operated and not owned or endorsed by Havells India Ltd.",
}: FooterProps) {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand & About */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white">
                <Flame className="w-5 h-5 text-amber-300" />
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight">
                {storeName}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Curated home heating and seasonal appliance store. Delivering verified, genuine brand appliances with complete warranty protection.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>GST Registered & Supply Compliant</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#product-overview" className="hover:text-white transition-colors">
                  Product Overview
                </a>
              </li>
              <li>
                <a href="#benefits" className="hover:text-white transition-colors">
                  Features & Specifications
                </a>
              </li>
              <li>
                <a href="#reviews" className="hover:text-white transition-colors">
                  Customer Reviews
                </a>
              </li>
              <li>
                <a href="#faqs" className="hover:text-white transition-colors">
                  Frequently Asked Questions
                </a>
              </li>
              <li>
                <Link href="/track" className="hover:text-white text-sky-400 font-semibold transition-colors">
                  Track Existing Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Store Policies */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Customer Policies
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/policies/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/policies/terms" className="hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/policies/shipping" className="hover:text-white transition-colors">
                  Shipping & Delivery Policy
                </Link>
              </li>
              <li>
                <Link href="/policies/refund" className="hover:text-white transition-colors">
                  Cancellation & Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/policies/warranty" className="hover:text-white transition-colors">
                  Warranty Claim Information
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Support Desk */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Customer Assistance
            </h4>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>{businessAddress}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                <a href={`mailto:${supportEmail}`} className="hover:text-white">
                  {supportEmail}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-sky-400 shrink-0" />
                <a href={`tel:${supportPhone.replace(/\s+/g, "")}`} className="hover:text-white">
                  {supportPhone}
                </a>
              </div>
            </div>

            {supportWhatsapp && (
              <div className="pt-2">
                <a
                  href={`https://wa.me/${supportWhatsapp.replace(/\D/g, "")}?text=Hi%20AquaThermal,%20I%20have%20an%20order%20query`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow-sm transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Chat Support</span>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Legal Disclaimer Box */}
        <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700/60 text-[11px] text-slate-400 leading-relaxed">
          <p>
            <strong className="text-slate-300">Brand Disclosure:</strong> {sellerDisclaimer}
          </p>
        </div>

        {/* Copyright & Admin Link */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/admin/login" className="hover:text-slate-300 transition-colors">
              Staff & Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
