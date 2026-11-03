"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Flame,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Menu,
  X,
  Phone,
  HelpCircle,
} from "lucide-react";

interface HeaderProps {
  storeName?: string;
  supportPhone?: string;
}

export function Header({
  storeName = "AquaThermal Essentials",
  supportPhone = "+91 98765 43210",
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
        {/* Brand Logo & Authorized Tag */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-700 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
            <Flame className="w-6 h-6 text-amber-300" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 group-hover:text-sky-600 transition-colors">
              {storeName}
            </span>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-sky-700 tracking-wide uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Authorized Retailer</span>
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <a href="#product-overview" className="hover:text-sky-600 transition-colors">
            Overview
          </a>
          <a href="#benefits" className="hover:text-sky-600 transition-colors">
            Features
          </a>
          <a href="#specifications" className="hover:text-sky-600 transition-colors">
            Specifications
          </a>
          <a href="#reviews" className="hover:text-sky-600 transition-colors">
            Customer Reviews
          </a>
          <a href="#faqs" className="hover:text-sky-600 transition-colors">
            FAQs
          </a>
          <Link
            href="/track"
            className="flex items-center gap-1 text-slate-700 hover:text-sky-600 transition-colors font-semibold"
          >
            <Truck className="w-4 h-4 text-sky-600" />
            <span>Track Order</span>
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          <a
            href={`tel:${supportPhone.replace(/\s+/g, "")}`}
            className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 border border-slate-200 px-3 py-1.5 rounded-full"
          >
            <Phone className="w-3.5 h-3.5 text-sky-600" />
            <span>Help: {supportPhone}</span>
          </a>

          <Link
            href="/checkout"
            className="flex items-center gap-2 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-sm hover:shadow transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Buy Now</span>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex sm:hidden items-center gap-2">
          <Link
            href="/checkout"
            className="p-2 text-sky-700 bg-sky-50 rounded-lg hover:bg-sky-100"
            aria-label="Checkout"
          >
            <ShoppingBag className="w-5 h-5" />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 hover:text-sky-600 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col space-y-3 text-base font-medium text-slate-700">
            <a
              href="#product-overview"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-sky-600"
            >
              Overview
            </a>
            <a
              href="#benefits"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-sky-600"
            >
              Features & Specs
            </a>
            <a
              href="#reviews"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-sky-600"
            >
              Customer Reviews
            </a>
            <a
              href="#faqs"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-sky-600"
            >
              FAQs
            </a>
            <Link
              href="/track"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 py-1 text-sky-700 font-semibold"
            >
              <Truck className="w-4 h-4" />
              <span>Track Your Order</span>
            </Link>
          </nav>
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Link
              href="/checkout"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2.5 rounded-lg shadow-sm"
            >
              Buy Now - Fast Checkout
            </Link>
            <a
              href={`tel:${supportPhone.replace(/\s+/g, "")}`}
              className="flex items-center justify-center gap-1.5 text-xs text-slate-500 py-2"
            >
              <Phone className="w-3.5 h-3.5 text-sky-600" />
              <span>Need help? Call {supportPhone}</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
