"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  ShoppingBag,
  Truck,
  ArrowLeft,
  Tag,
  Check,
  AlertCircle,
  QrCode,
  Banknote,
  Lock,
} from "lucide-react";
import { formatCurrency, validateIndianPhone, validateIndianPincode } from "@/lib/utils";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir", "Ladakh"
];

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQty = parseInt(searchParams.get("qty") || "1");

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [street, setStreet] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("Haryana");
  const [pincode, setPincode] = useState("");
  const [quantity, setQuantity] = useState(initialQty > 0 ? initialQty : 1);
  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "COD">("UPI");

  // Coupon State
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    description?: string;
    discountAmount: number;
  } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Product & Pricing State
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Fetch product on mount
  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await fetch("/api/product");
        const data = await res.json();
        if (data.product) {
          setProduct(data.product);
        }
      } catch (err) {
        console.error("Failed to load product for checkout", err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, []);

  const unitSellingPrice = product?.sellingPrice || 1499;
  const unitOriginalPrice = product?.originalPrice || 2190;
  const subtotal = unitSellingPrice * quantity;
  const originalSubtotal = unitOriginalPrice * quantity;
  const productDiscount = originalSubtotal - subtotal;
  const couponDiscount = appliedCoupon?.discountAmount || 0;
  const shippingFee = 0; // Free delivery
  const finalAmount = Math.max(1, subtotal - couponDiscount + shippingFee);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setValidatingCoupon(true);
    setCouponError("");

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, cartAmount: subtotal }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Invalid coupon code");
      }

      setAppliedCoupon({
        code: data.coupon.code,
        description: data.coupon.description,
        discountAmount: data.coupon.discountAmount,
      });
    } catch (err: any) {
      setCouponError(err.message || "Failed to validate coupon");
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    // Validate inputs
    if (!fullName || !email || !phone || !houseNumber || !street || !city || !state || !pincode) {
      setFormError("Please fill in all required shipping address fields.");
      return;
    }

    if (!validateIndianPhone(phone)) {
      setFormError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (!validateIndianPincode(pincode)) {
      setFormError("Please enter a valid 6-digit Indian PIN code.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        fullName,
        email,
        phone,
        houseNumber,
        street,
        landmark,
        city,
        state,
        pincode,
        quantity,
        paymentMethod,
        couponCode: appliedCoupon?.code || null,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create order");
      }

      // If UPI, navigate to verification / YouPI checkout
      if (paymentMethod === "UPI") {
        if (data.checkoutUrl) {
          router.push(data.checkoutUrl);
        } else {
          router.push(
            `/checkout/verification?orderId=${data.order.orderNumber}&token=${data.order.accessToken}`
          );
        }
      } else {
        // COD
        router.push(
          `/checkout/success?orderNumber=${data.order.orderNumber}&token=${data.order.accessToken}`
        );
      }
    } catch (err: any) {
      setFormError(err.message || "Failed to submit order. Please try again.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-slate-600">Loading Checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Checkout Header */}
      <div className="bg-white border-b border-slate-200 py-4 px-4 sm:px-6 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-sky-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Product</span>
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-Bit SSL Encrypted Checkout</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          Secure Order Checkout
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mb-8">
          Complete your delivery details below to finalize your order.
        </p>

        {formError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ================= LEFT: Shipping & Payment ================= */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Contact & Delivery Address */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 text-xs flex items-center justify-center font-bold">
                  1
                </span>
                <span>Delivery Address (India Only)</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Recipient Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ramesh Patel"
                    className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mobile Number *
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 text-xs font-semibold text-slate-500 bg-slate-100 border border-r-0 border-slate-300 rounded-l-lg">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-r-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400">Used for courier delivery updates.</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ramesh@example.com"
                    className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">Invoice copy will be sent here.</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    House / Flat / Block No. *
                  </label>
                  <input
                    type="text"
                    required
                    value={houseNumber}
                    onChange={(e) => setHouseNumber(e.target.value)}
                    placeholder="e.g. Flat 402, Block B"
                    className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Street / Colony / Area *
                  </label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="e.g. Park View Road, Sector 14"
                    className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nearby Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="e.g. Near Shiv Mandir"
                    className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    6-Digit PIN Code *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="e.g. 122001"
                    className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    City / Town *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Gurgaon"
                    className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    State *
                  </label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
                  >
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Payment Method Selector */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 text-xs flex items-center justify-center font-bold">
                  2
                </span>
                <span>Select Payment Method</span>
              </h2>

              <div className="space-y-3">
                {/* Option 1: YouPI-PG Direct UPI */}
                <label
                  className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === "UPI"
                      ? "border-sky-600 bg-sky-50/50 shadow-sm"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="UPI"
                    checked={paymentMethod === "UPI"}
                    onChange={() => setPaymentMethod("UPI")}
                    className="mt-1 text-sky-600 focus:ring-sky-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <QrCode className="w-5 h-5 text-sky-600" />
                        <span className="font-bold text-slate-900 text-sm">
                          Instant UPI via YouPI-PG (Recommended)
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        Fast Verification
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Pay directly to our merchant account using Google Pay, PhonePe, Paytm, BHIM, or CRED. Zero processing charges.
                    </p>
                  </div>
                </label>

                {/* Option 2: Cash on Delivery */}
                <label
                  className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === "COD"
                      ? "border-sky-600 bg-sky-50/50 shadow-sm"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={() => setPaymentMethod("COD")}
                    className="mt-1 text-sky-600 focus:ring-sky-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Banknote className="w-5 h-5 text-slate-700" />
                        <span className="font-bold text-slate-900 text-sm">
                          Cash on Delivery (COD)
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Pay cash to the courier agent when your package is delivered to your doorstep.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* ================= RIGHT: Order Summary & Pay ================= */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-5">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                Order Summary
              </h2>

              {/* Product Card */}
              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0">
                  <img
                    src={
                      product?.images?.[0]?.url ||
                      "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=300&q=80"
                    }
                    alt={product?.name || "Product"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
                    {product?.name || "Havells Zella Immersion Rod 1000W (Blue)"}
                  </h3>
                  <p className="text-[11px] text-slate-500">2-Year Brand Warranty • Sealed Pack</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs font-bold text-slate-800">
                      {formatCurrency(unitSellingPrice)} × {quantity}
                    </span>
                    <div className="flex items-center border border-slate-300 rounded bg-white text-xs">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="px-2 py-0.5 text-slate-600 hover:bg-slate-100"
                      >
                        −
                      </button>
                      <span className="px-2 font-bold">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                        className="px-2 py-0.5 text-slate-600 hover:bg-slate-100"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coupon Box */}
              <div className="pt-2 border-t border-slate-100">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-emerald-600" />
                      <div>
                        <span className="font-bold">{appliedCoupon.code}</span> applied:{" "}
                        <span>Saved {formatCurrency(appliedCoupon.discountAmount)}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-xs text-red-600 hover:text-red-800 font-semibold underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Coupon code (e.g. WARMTH100)"
                        className="flex-1 text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none uppercase"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={validatingCoupon || !couponCode.trim()}
                        className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors"
                      >
                        {validatingCoupon ? "..." : "Apply"}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-[11px] text-red-600 mt-1 font-medium">{couponError}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                <div className="flex justify-between text-slate-600">
                  <span>Original MRP:</span>
                  <span className="line-through">{formatCurrency(originalSubtotal)}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Product Discount:</span>
                  <span>-{formatCurrency(productDiscount)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Coupon Discount ({appliedCoupon?.code}):</span>
                    <span>-{formatCurrency(couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Express Shipping:</span>
                  <span className="text-emerald-700 font-bold">FREE</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base font-extrabold text-slate-900 border-t border-slate-200 pt-3">
                  <span>Final Payable Amount:</span>
                  <span className="text-sky-700">{formatCurrency(finalAmount)}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 disabled:opacity-60 text-white font-extrabold text-sm sm:text-base py-3.5 px-6 rounded-xl shadow-lg shadow-sky-500/25 transition-all"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>
                  {submitting
                    ? "Processing Order..."
                    : paymentMethod === "UPI"
                    ? `Proceed to UPI Payment • ${formatCurrency(finalAmount)}`
                    : `Confirm COD Order • ${formatCurrency(finalAmount)}`}
                </span>
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 text-center">
                <Truck className="w-3.5 h-3.5 text-sky-600" />
                <span>Dispatched within 24–48 hours in shockproof packaging</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
