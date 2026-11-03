"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Droplets,
  Search,
  ShoppingCart,
  Menu,
  X,
  Phone,
  User,
} from "lucide-react";

interface HeaderProps {
  storeName?: string;
  supportPhone?: string;
}

export function Header({
  storeName = "AquaHome",
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-4">
        {/* Brand Logo matching reference */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 via-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
            <Droplets className="w-5 h-5 text-white fill-white/20" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tight text-slate-900 leading-none">
              {storeName}
            </span>
            <span className="text-[10px] font-semibold text-slate-500 tracking-wide mt-0.5">
              Smart Home Essentials
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs sm:text-sm font-semibold text-slate-700">
          <a href="#product-overview" className="hover:text-sky-600 transition-colors">
            Home
          </a>
          <a href="#benefits" className="hover:text-sky-600 transition-colors">
            Product
          </a>
          <a href="#reviews" className="hover:text-sky-600 transition-colors">
            Reviews
          </a>
          <a href="#faqs" className="hover:text-sky-600 transition-colors">
            FAQ
          </a>
          <a href="#contact" className="hover:text-sky-600 transition-colors">
            Contact
          </a>
        </nav>

        {/* Action Controls matching reference */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="p-2 text-slate-600 hover:text-sky-600 transition-colors rounded-full hover:bg-slate-50"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          <Link
            href="/checkout"
            className="relative p-2 text-slate-700 hover:text-sky-600 transition-colors rounded-full hover:bg-slate-50"
            aria-label="View Cart"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white font-bold text-[10px] flex items-center justify-center shadow-xs">
              1
            </span>
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-700 hover:text-sky-600"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-slate-800" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 animate-in fade-in duration-150">
          <nav className="flex flex-col space-y-2 text-sm font-semibold text-slate-700">
            <a href="#product-overview" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-sky-600">Home</a>
            <a href="#benefits" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-sky-600">Product Features</a>
            <a href="#reviews" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-sky-600">Customer Reviews</a>
            <a href="#faqs" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-sky-600">FAQ</a>
            <Link href="/track" onClick={() => setMobileMenuOpen(false)} className="py-1 text-sky-600">Track Order</Link>
          </nav>
          <div className="pt-2 border-t border-slate-100">
            <Link
              href="/checkout"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center bg-[#0c2444] hover:bg-sky-950 text-white font-bold text-xs py-2.5 rounded-xl shadow-sm"
            >
              Order Now • Free Delivery
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
