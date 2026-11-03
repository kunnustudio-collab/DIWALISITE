"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import QRCode from "qrcode";
import {
  ShieldCheck,
  Clock,
  Copy,
  CheckCircle2,
  AlertCircle,
  Truck,
  FileText,
  Lock,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Smartphone,
  QrCode,
  Sparkles,
  Info,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

function VerificationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "";
  const token = searchParams.get("token") || "";

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [utr, setUtr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [dynamicQrUrl, setDynamicQrUrl] = useState<string>("");
  const [qrViewMode, setQrViewMode] = useState<"DYNAMIC" | "BHARATPE">("DYNAMIC");
  const [showUtrHelp, setShowUtrHelp] = useState(false);
  const [timeLeft, setTimeLeft] = useState(599); // 10 minutes session

  // 10-Minute Countdown Timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  // Load Order Details & Poll status every 4s
  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${orderId}?token=${token}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.order && isMounted) {
          setOrder(data.order);
          if (
            data.order.paymentStatus === "PAID" ||
            data.order.orderStatus === "CONFIRMED"
          ) {
            // Automatically forward to success screen if confirmed
            router.push(`/checkout/success?orderNumber=${data.order.orderNumber}&token=${token}`);
          } else if (
            data.order.orderStatus === "PAYMENT_VERIFICATION" ||
            data.order.paymentStatus === "PENDING_VERIFICATION"
          ) {
            setSubmissionSuccess(true);
          }
        }
      } catch (err) {
        console.error("Error loading order:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchOrder();

    // Polling interval
    const pollInterval = setInterval(fetchOrder, 4000);
    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [orderId, token, router]);

  const merchantUpiId = order?.merchantUpiId || "BHARATPE09892884396@yesbankltd";
  const merchantPayeeName = order?.merchantPayeeName || "AquaHome";
  const payableAmount = order?.finalAmount || 1499;
  const orderRef = order?.orderNumber || orderId || "AquaHomeOrder";

  // Build UPI URI with auto-filled Amount, Payee Name & Order Note
  const cleanAmount = payableAmount.toFixed(2);
  const transactionNote = `${merchantPayeeName} Order ${orderRef}`;

  const genericUpiUri = `upi://pay?pa=${encodeURIComponent(merchantUpiId)}&pn=${encodeURIComponent(
    merchantPayeeName
  )}&am=${cleanAmount}&cu=INR&tn=${encodeURIComponent(transactionNote)}&tr=${encodeURIComponent(orderRef)}`;

  // Mobile App Dedicated Deep Links
  const phonepeUri = `phonepe://pay?pa=${encodeURIComponent(merchantUpiId)}&pn=${encodeURIComponent(
    merchantPayeeName
  )}&am=${cleanAmount}&cu=INR&tn=${encodeURIComponent(transactionNote)}&tr=${encodeURIComponent(orderRef)}`;

  const gpayUri = `gpay://upi/pay?pa=${encodeURIComponent(merchantUpiId)}&pn=${encodeURIComponent(
    merchantPayeeName
  )}&am=${cleanAmount}&cu=INR&tn=${encodeURIComponent(transactionNote)}&tr=${encodeURIComponent(orderRef)}`;

  const paytmUri = `paytmmp://pay?pa=${encodeURIComponent(merchantUpiId)}&pn=${encodeURIComponent(
    merchantPayeeName
  )}&am=${cleanAmount}&cu=INR&tn=${encodeURIComponent(transactionNote)}&tr=${encodeURIComponent(orderRef)}`;

  const credUri = `credpay://upi/pay?pa=${encodeURIComponent(merchantUpiId)}&pn=${encodeURIComponent(
    merchantPayeeName
  )}&am=${cleanAmount}&cu=INR&tn=${encodeURIComponent(transactionNote)}&tr=${encodeURIComponent(orderRef)}`;

  // Generate dynamic QR code data URL client-side
  useEffect(() => {
    QRCode.toDataURL(genericUpiUri, {
      margin: 1,
      width: 320,
      color: {
        dark: "#0c2444",
        light: "#ffffff",
      },
    })
      .then((url) => setDynamicQrUrl(url))
      .catch((err) => console.error("QR Code Error:", err));
  }, [genericUpiUri]);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(merchantUpiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleUtrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!utr.trim()) return;

    const cleanUtr = utr.trim().replace(/\D/g, "");
    if (cleanUtr.length < 6 || cleanUtr.length > 18) {
      setErrorMessage("Please enter a valid 12-digit UPI reference number (UTR).");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          utr: cleanUtr,
          token,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit payment reference");
      }

      setSubmissionSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to submit UTR. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-slate-600">Initializing Payment Gateway...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f7fb] py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* ================= GATEWAY BRAND HEADER ================= */}
        <div className="bg-white rounded-3xl border border-sky-100 p-6 shadow-xl shadow-sky-500/5 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#0c2444] text-white flex items-center justify-center font-black text-lg shadow-md">
                AH
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-lg font-black text-slate-900 tracking-tight">
                    {merchantPayeeName} Payments
                  </h1>
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Verified Merchant
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Secured by NPCI Unified Payments Interface & BharatPe
                </p>
              </div>
            </div>

            {/* Countdown Badge */}
            <div className="flex items-center gap-2 self-start sm:self-auto bg-amber-50 border border-amber-200/80 px-3 py-1.5 rounded-xl">
              <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <div className="text-right">
                <span className="text-[10px] text-amber-800 font-semibold uppercase tracking-wider block">
                  Session Expires In
                </span>
                <span className="text-xs font-mono font-black text-amber-900">
                  {formattedTime}
                </span>
              </div>
            </div>
          </div>

          {/* Order Summary Strip */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50/80 rounded-2xl p-4 border border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 font-medium block">Order Number</span>
              <strong className="text-slate-800 font-mono text-sm">{orderRef}</strong>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Customer</span>
              <strong className="text-slate-800 truncate block">
                {order?.customerName || "Customer"}
              </strong>
            </div>
            <div className="col-span-2 sm:col-span-1 border-t sm:border-t-0 sm:border-l border-slate-200/60 pt-2 sm:pt-0 sm:pl-3">
              <span className="text-slate-400 font-medium block">Total Payable</span>
              <div className="text-xl sm:text-2xl font-black text-sky-700 leading-tight">
                {formatCurrency(payableAmount)}
              </div>
            </div>
          </div>
        </div>

        {/* ================= MAIN PAYMENT CONTAINER ================= */}
        {submissionSuccess ? (
          /* Success / Under Verification State */
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-xl space-y-6 text-center animate-in fade-in duration-300">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Clock className="w-8 h-8 animate-pulse text-emerald-600" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                UTR Received • Verification in Progress
              </span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Payment Verification Pending
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Your payment reference has been submitted. Our automated ledger system is verifying your funds receipt from <strong>Yes Bank / BharatPe</strong>.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs text-slate-600 text-left space-y-2">
              <p className="font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                <span>Next Automated Steps:</span>
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-600">
                <li>Automatic polling will confirm this page the moment funds clear.</li>
                <li>Order status automatically changes to <strong className="text-emerald-700">CONFIRMED</strong>.</li>
                <li>Your dispatch tracking number and tax invoice will be issued.</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href={`/track?orderId=${encodeURIComponent(orderId)}&token=${encodeURIComponent(token)}`}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#0c2444] hover:bg-sky-950 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md transition-all"
              >
                <Truck className="w-4 h-4" />
                <span>Track Order Live</span>
              </Link>

              <a
                href={`/api/orders/${orderId}/invoice?token=${encodeURIComponent(token)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-sm px-5 py-3 rounded-xl shadow-xs transition-colors"
              >
                <FileText className="w-4 h-4 text-sky-600" />
                <span>Download Invoice</span>
              </a>
            </div>
          </div>
        ) : (
          /* Active Payment Flow */
          <div className="space-y-6">
            
            {/* ================= OPTION A: ONE-CLICK MOBILE UPI APP REDIRECT ================= */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sky-100 shadow-xl shadow-sky-500/5 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-black text-slate-900">
                      Tap to Pay with Installed UPI App
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      Amount ({formatCurrency(payableAmount)}) & Payee Name ({merchantPayeeName}) are auto-filled!
                    </p>
                  </div>
                </div>
                <span className="hidden sm:inline-block text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                  Instant Auto-Fill
                </span>
              </div>

              {/* 4 Branded Mobile UPI Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* 1. PhonePe Button */}
                <a
                  href={phonepeUri}
                  className="flex items-center justify-between p-3.5 bg-gradient-to-r from-[#5f259f] to-[#7b32cd] hover:brightness-105 text-white rounded-2xl shadow-md transition-all active:scale-[0.98] group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center font-black text-[#5f259f] text-base shadow-sm">
                      पे
                    </div>
                    <div className="text-left">
                      <p className="font-extrabold text-sm leading-tight text-white">PhonePe</p>
                      <p className="text-[10px] text-purple-200">Instant Redirect</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-lg">
                    Pay {formatCurrency(payableAmount)} →
                  </span>
                </a>

                {/* 2. Google Pay Button */}
                <a
                  href={gpayUri}
                  className="flex items-center justify-between p-3.5 bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-200 hover:border-sky-400 rounded-2xl shadow-sm transition-all active:scale-[0.98] group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center font-black text-slate-700 text-sm shadow-xs">
                      <span className="text-blue-500 font-black">G</span>
                      <span className="text-red-500 font-black">P</span>
                      <span className="text-yellow-500 font-black">a</span>
                      <span className="text-green-500 font-black">y</span>
                    </div>
                    <div className="text-left">
                      <p className="font-extrabold text-sm leading-tight text-slate-900">Google Pay</p>
                      <p className="text-[10px] text-slate-500">Tap to Open App</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2 py-1 rounded-lg border border-sky-200">
                    Pay {formatCurrency(payableAmount)} →
                  </span>
                </a>

                {/* 3. Paytm Button */}
                <a
                  href={paytmUri}
                  className="flex items-center justify-between p-3.5 bg-[#002e6e] hover:bg-[#002456] text-white rounded-2xl shadow-md transition-all active:scale-[0.98] group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center font-black text-[#00b9f5] text-xs shadow-sm">
                      Paytm
                    </div>
                    <div className="text-left">
                      <p className="font-extrabold text-sm leading-tight text-white">Paytm UPI</p>
                      <p className="text-[10px] text-sky-200">Fast Auto-Fill</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-lg">
                    Pay {formatCurrency(payableAmount)} →
                  </span>
                </a>

                {/* 4. Any UPI App Button */}
                <a
                  href={genericUpiUri}
                  className="flex items-center justify-between p-3.5 bg-gradient-to-r from-[#0c2444] to-[#1a3a60] hover:brightness-110 text-white rounded-2xl shadow-md transition-all active:scale-[0.98] group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white font-bold text-xs">
                      UPI
                    </div>
                    <div className="text-left">
                      <p className="font-extrabold text-sm leading-tight text-white">Any UPI App</p>
                      <p className="text-[10px] text-sky-200">BHIM, CRED, Navi</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold bg-sky-500 text-white px-2 py-1 rounded-lg">
                    Open Chooser →
                  </span>
                </a>
              </div>
            </div>

            {/* ================= OPTION B: SCAN QR CODE (DESKTOP OR ANY CAMERA) ================= */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sky-100 shadow-xl shadow-sky-500/5 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-black text-slate-900">
                      Or Scan QR Code with Any Phone
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      Scan using Google Pay, PhonePe, Paytm, BHIM, or Banking Apps
                    </p>
                  </div>
                </div>

                {/* QR Mode Toggle */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => setQrViewMode("DYNAMIC")}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      qrViewMode === "DYNAMIC"
                        ? "bg-white text-sky-800 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Auto-Fill QR
                  </button>
                  <button
                    type="button"
                    onClick={() => setQrViewMode("BHARATPE")}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      qrViewMode === "BHARATPE"
                        ? "bg-white text-sky-800 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    BharatPe QR
                  </button>
                </div>
              </div>

              {/* QR Display Area */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 p-4 sm:p-6 bg-gradient-to-br from-[#f8fbfe] to-[#edf6fd] rounded-3xl border border-sky-100">
                {/* QR Box with Authentic BharatPe & YesBank styling */}
                <div className="relative p-4 bg-white rounded-2xl border-2 border-sky-200 shadow-md flex flex-col items-center">
                  <div className="w-56 h-56 rounded-xl overflow-hidden flex items-center justify-center bg-white">
                    {qrViewMode === "DYNAMIC" ? (
                      dynamicQrUrl ? (
                        <img
                          src={dynamicQrUrl}
                          alt="Dynamic Auto-fill UPI QR Code"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
                      )
                    ) : (
                      <img
                        src="/images/bharatpe-qr.jpg"
                        alt="BharatPe Official Merchant QR"
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>

                  {/* Watermark Label */}
                  <div className="mt-2 text-center">
                    <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider block">
                      Payee: {merchantPayeeName}
                    </span>
                    <span className="text-[9px] text-slate-500 font-semibold">
                      Exact Amount: {formatCurrency(payableAmount)}
                    </span>
                  </div>
                </div>

                {/* VPA Copy Box */}
                <div className="space-y-4 text-center sm:text-left flex-1 max-w-sm">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Direct Merchant UPI ID
                    </span>
                    <div className="mt-1 flex items-center gap-2 bg-white px-3.5 py-2.5 rounded-xl border border-sky-200 shadow-xs">
                      <code className="text-xs font-mono font-bold text-slate-900 select-all truncate">
                        {merchantUpiId}
                      </code>
                      <button
                        type="button"
                        onClick={handleCopyUpi}
                        className="ml-auto shrink-0 px-2 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold rounded-lg flex items-center gap-1 transition-colors"
                      >
                        {copied ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-sky-600" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2 text-slate-700 font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Shows &quot;{merchantPayeeName}&quot; as Verified Payee</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Zero extra convenience or gateway fees</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Protected by NPCI Settlement Protocol</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ================= STEP 2: UTR NUMBER SUBMISSION FORM ================= */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sky-100 shadow-xl shadow-sky-500/5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs">
                    ✓
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-black text-slate-900">
                      Step 2: Submit 12-Digit UPI Reference (UTR)
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      Enter the 12-digit transaction ID from your payment confirmation screen
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowUtrHelp(!showUtrHelp)}
                  className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                >
                  <span>Where to find UTR?</span>
                  {showUtrHelp ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* UTR Help Accordion */}
              {showUtrHelp && (
                <div className="p-4 bg-sky-50/70 border border-sky-100 rounded-2xl text-xs text-slate-700 space-y-2 animate-in fade-in duration-150">
                  <p className="font-bold text-slate-900">How to find the 12-digit UTR on your receipt:</p>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    <li><strong className="text-slate-900">Google Pay:</strong> Tap transaction → View &quot;UPI Transaction ID&quot; (12 numerical digits).</li>
                    <li><strong className="text-slate-900">PhonePe:</strong> Tap payment details → Copy &quot;UTR&quot; number.</li>
                    <li><strong className="text-slate-900">Paytm:</strong> Tap order details → Copy &quot;UPI Ref No.&quot;.</li>
                    <li><strong className="text-slate-900">BHIM / Banks:</strong> Look for &quot;Ref No / RRN / UTR&quot; in the SMS confirmation.</li>
                  </ul>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleUtrSubmit} className="space-y-4 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Enter 12-Digit UTR / UPI Reference Number *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      maxLength={18}
                      value={utr}
                      onChange={(e) => setUtr(e.target.value.replace(/\s+/g, ""))}
                      placeholder="e.g. 432109876543"
                      className="w-full text-lg sm:text-xl font-mono font-bold tracking-widest px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-white focus:border-sky-600 focus:outline-none text-slate-900 shadow-inner"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-mono font-bold text-slate-400">
                      {utr.length}/12
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !utr.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-[#0c2444] hover:bg-sky-950 disabled:opacity-50 text-white font-extrabold text-sm sm:text-base py-3.5 px-6 rounded-2xl shadow-lg transition-all active:scale-[0.99]"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>
                    {submitting
                      ? "Verifying Transaction..."
                      : `I Have Paid ${formatCurrency(payableAmount)} • Confirm Order`}
                  </span>
                </button>
              </form>

              {/* Safe Mode Helper */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 flex items-center justify-between">
                <span>⚡ Test Mode Simulation: You can enter any 12-digit number (e.g. <code>432109876543</code>).</span>
                <span className="font-semibold text-sky-700">Safe Sandbox</span>
              </div>
            </div>

          </div>
        )}

        {/* Security Footer Note */}
        <div className="text-center space-y-1 pt-2">
          <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>End-to-end 256-Bit SSL Encrypted • Direct Bank Settlement</span>
          </p>
          <p className="text-[10px] text-slate-400">
            Having trouble? WhatsApp customer support at +91 98765 43210
          </p>
        </div>

      </div>
    </div>
  );
}

export default function PaymentVerificationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <VerificationContent />
    </Suspense>
  );
}