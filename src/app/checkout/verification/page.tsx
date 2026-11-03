"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  QrCode,
  Copy,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  FileText,
  Truck,
  ArrowRight,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

function VerificationContent() {
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

  // Load Order Details
  useEffect(() => {
    async function loadOrder() {
      if (!orderId) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/orders/${orderId}?token=${token}`);
        const data = await res.json();
        if (data.order) {
          setOrder(data.order);
          // If already in PAYMENT_VERIFICATION or PAID
          if (
            data.order.orderStatus === "PAYMENT_VERIFICATION" ||
            data.order.paymentStatus === "PENDING_VERIFICATION"
          ) {
            setSubmissionSuccess(true);
          }
        }
      } catch (err) {
        console.error("Failed to load order", err);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderId, token]);

  const merchantUpiId = "aquathermal.pay@okhdfcbank";
  const payableAmount = order?.finalAmount || 1499;

  // Generate UPI URI
  const upiUri = `upi://pay?pa=${encodeURIComponent(merchantUpiId)}&pn=${encodeURIComponent(
    "AquaThermal Store"
  )}&am=${payableAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(orderId || "Order")}`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(merchantUpiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          <p className="text-sm font-semibold text-slate-600">Loading Payment Session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Top Header Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-sky-50 text-sky-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-sky-600" />
            <span>YouPI-PG Direct Peer UPI Settlement</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Complete Your UPI Payment
          </h1>

          <p className="text-xs sm:text-sm text-slate-500">
            Order Reference: <strong className="text-slate-800">{orderId}</strong>
          </p>

          <div className="pt-2">
            <span className="text-xs font-semibold text-slate-500">Total Amount Payable:</span>
            <div className="text-3xl sm:text-4xl font-black text-sky-700 mt-1">
              {formatCurrency(payableAmount)}
            </div>
          </div>
        </div>

        {/* If Already Submitted / Pending Verification */}
        {submissionSuccess ? (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-emerald-200 shadow-md space-y-6 text-center animate-in fade-in duration-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900">
                Payment Reference Submitted Successfully
              </h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Thank you! Your UPI reference (UTR) has been logged. Our accounts verification team is matching it against our bank settlement ledger.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 text-left space-y-2">
              <p className="font-bold text-slate-800">What happens next?</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Bank ledger reconciliation confirms receipt of exact funds.</li>
                <li>Your order will move to <strong className="text-emerald-700">CONFIRMED</strong> status.</li>
                <li>Package will be dispatched via express courier with tracking SMS.</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href={`/track?orderId=${encodeURIComponent(orderId)}&token=${encodeURIComponent(token)}`}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow transition-colors"
              >
                <Truck className="w-4 h-4" />
                <span>Track Order Live Status</span>
              </Link>

              <a
                href={`/api/orders/${orderId}/invoice?token=${encodeURIComponent(token)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-sm px-5 py-3 rounded-xl transition-colors"
              >
                <FileText className="w-4 h-4 text-sky-600" />
                <span>View Tax Invoice</span>
              </a>
            </div>
          </div>
        ) : (
          /* Payment Instructions & UTR Form */
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-8">
            {/* Step 1: Scan QR or Transfer */}
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 text-xs flex items-center justify-center font-bold">
                  1
                </span>
                <span>Scan UPI QR Code with Any App</span>
              </h2>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                {/* SVG QR Code Illustration */}
                <div className="p-3 bg-white rounded-xl border border-slate-300 shadow-sm flex flex-col items-center">
                  <div className="w-44 h-44 bg-slate-900 rounded-lg p-2 flex items-center justify-center text-white">
                    <QrCode className="w-36 h-36 text-white" />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-2 font-medium">
                    Google Pay • PhonePe • Paytm • BHIM
                  </span>
                </div>

                <div className="space-y-3 text-center sm:text-left">
                  <p className="text-xs text-slate-600">
                    Alternatively, transfer <strong>{formatCurrency(payableAmount)}</strong> directly to our merchant VPA:
                  </p>

                  <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-300">
                    <code className="text-xs font-mono font-bold text-sky-800 select-all">
                      {merchantUpiId}
                    </code>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="p-1 text-slate-500 hover:text-sky-600 text-xs font-semibold flex items-center gap-1"
                    >
                      {copied ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      <span>{copied ? "Copied" : "Copy"}</span>
                    </button>
                  </div>

                  <a
                    href={upiUri}
                    className="inline-flex sm:hidden items-center gap-2 bg-sky-600 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm"
                  >
                    Open Supported UPI App
                  </a>
                </div>
              </div>
            </div>

            {/* Step 2: Submit 12-digit UTR */}
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 text-xs flex items-center justify-center font-bold">
                  2
                </span>
                <span>Enter 12-Digit UPI Transaction Reference (UTR)</span>
              </h2>

              <p className="text-xs text-slate-600">
                After completing payment, copy the 12-digit reference / UTR number from your payment receipt and enter it below:
              </p>

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleUtrSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    UPI Reference Number (UTR) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={18}
                    value={utr}
                    onChange={(e) => setUtr(e.target.value.replace(/\s+/g, ""))}
                    placeholder="e.g. 432109876543"
                    className="w-full text-base font-mono px-3.5 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none tracking-widest text-slate-900"
                  />
                  <span className="text-[10px] text-slate-400">
                    Usually 12 numerical digits in Google Pay, PhonePe, or Paytm receipt.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !utr.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 disabled:opacity-50 text-white font-bold text-sm py-3 px-6 rounded-xl shadow transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{submitting ? "Verifying..." : "Submit Payment Reference"}</span>
                </button>
              </form>
            </div>

            {/* Test Mode Simulation Help */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
              <p className="font-bold">🧪 Test Mode Simulation Note:</p>
              <p className="mt-0.5">
                You can enter any 12-digit mock number (such as <code>432109876543</code>) to simulate successful customer submission.
              </p>
            </div>
          </div>
        )}
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
