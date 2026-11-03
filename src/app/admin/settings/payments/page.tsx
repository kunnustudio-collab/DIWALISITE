"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Save,
  Clock,
  ShieldCheck,
  XCircle,
  HelpCircle,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AdminPaymentSettingsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Settings form state
  const [isUpiEnabled, setIsUpiEnabled] = useState(true);
  const [isCodEnabled, setIsCodEnabled] = useState(true);
  const [isTestMode, setIsTestMode] = useState(true);
  const [customerReturnUrl, setCustomerReturnUrl] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings/payments");
      const json = await res.json();
      setData(json);
      if (json.settings) {
        setIsUpiEnabled(json.settings.isUpiEnabled);
        setIsCodEnabled(json.settings.isCodEnabled);
        setIsTestMode(json.settings.isTestMode);
        setCustomerReturnUrl(json.settings.customerReturnUrl || "");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");

    try {
      const res = await fetch("/api/admin/settings/payments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isUpiEnabled,
          isCodEnabled,
          isTestMode,
          customerReturnUrl,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setSuccessMsg("Payment configuration saved successfully.");
      setTimeout(() => setSuccessMsg(""), 3500);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  // Manual payment verification decision
  const handleVerifyDecision = async (
    orderId: string,
    action: "VERIFIED" | "REJECTED" | "INVESTIGATION"
  ) => {
    let reason = "";
    if (action === "REJECTED") {
      const input = prompt("Please provide a reason for rejecting this payment (required):");
      if (input === null) return;
      if (!input.trim()) {
        alert("Rejection reason cannot be blank.");
        return;
      }
      reason = input.trim();
    }

    let note = "";
    if (action === "VERIFIED") {
      note = prompt("Optional confirmation note (e.g. Matched in HDFC Bank Netbanking at 14:10):") || "";
    }

    if (action === "INVESTIGATION") {
      note = prompt("Investigation note (e.g. UTR pending NEFT credit):") || "";
    }

    setActionLoading(orderId);

    try {
      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          action,
          reason,
          note,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      alert(json.message);
      loadData();
    } catch (err: any) {
      alert(err.message || "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const settings = data?.settings;
  const diagnostics = data?.diagnostics;
  const recentEvents = data?.recentEvents || [];
  const pendingEvents = recentEvents.filter(
    (e: any) => e.verificationStatus === "PENDING" || e.verificationStatus === "INVESTIGATION"
  );

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Payment Gateway & Verification Queue
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage YouPI-PG integration, gateway diagnostics, and manual bank ledger reconciliation.
        </p>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Experimental Notice Banner */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-950 space-y-1">
        <p className="font-bold flex items-center gap-2 text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>Important Gateway Notice & Compliance Rule:</span>
        </p>
        <p>
          YouPI-PG operates on automated bank observation. Observed events (such as <code>OBSERVED_SUCCESS</code>) indicate detection but do not automatically settle funds. As per protocol, all UPI transactions remain in <strong>PAYMENT_VERIFICATION</strong> until an authorized administrator verifies the actual receiving bank ledger.
        </p>
      </div>

      {/* Gateway Diagnostics Status Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-sky-600" />
            <h2 className="text-sm font-bold text-slate-900">
              YouPI-PG Gateway Connection Diagnostics
            </h2>
          </div>
          <button
            onClick={loadData}
            className="text-xs font-bold text-sky-600 hover:text-sky-700 underline"
          >
            Re-test Gateway Ping
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400 font-bold uppercase text-[10px] block">
              Gateway Endpoint URL
            </span>
            <code className="text-slate-800 font-mono font-bold mt-1 block truncate">
              {diagnostics?.apiUrl || "http://localhost:6100"}
            </code>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400 font-bold uppercase text-[10px] block">
              Connection Status
            </span>
            <span
              className={`font-bold mt-1 inline-flex items-center gap-1 ${
                diagnostics?.reachable ? "text-emerald-700" : "text-amber-600"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  diagnostics?.reachable ? "bg-emerald-600" : "bg-amber-500"
                }`}
              />
              {diagnostics?.reachable ? "Online & Reachable" : "Test Mode Sandbox Fallback Active"}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400 font-bold uppercase text-[10px] block">
              Ping Latency
            </span>
            <span className="font-bold text-slate-800 mt-1 block">
              {diagnostics?.latencyMs || 0} ms
            </span>
          </div>
        </div>
      </div>

      {/* Manual Verification Queue */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden space-y-3">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <div>
              <h2 className="font-bold text-sm text-slate-900">
                Pending Bank Reconciliation Queue ({pendingEvents.length})
              </h2>
              <p className="text-xs text-slate-500">
                Verify customer UTR against your receiving bank account transaction records before approving dispatch.
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Customer Submitted UTR</th>
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">Submitted At</th>
                <th className="py-3 px-4 text-right">Ledger Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {pendingEvents.length > 0 ? (
                pendingEvents.map((evt: any) => (
                  <tr key={evt.id} className="hover:bg-amber-50/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {evt.order?.orderNumber}
                    </td>
                    <td className="py-3 px-4">{evt.order?.customerName}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {formatCurrency(evt.amount || 0)}
                    </td>
                    <td className="py-3 px-4">
                      <code className="bg-slate-100 border border-slate-300 px-2 py-0.5 rounded text-sky-800 font-mono font-bold tracking-wider">
                        {evt.utr || "Awaiting UTR"}
                      </code>
                    </td>
                    <td className="py-3 px-4 font-semibold">{evt.eventType}</td>
                    <td className="py-3 px-4 text-slate-400">{formatDate(evt.createdAt)}</td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleVerifyDecision(evt.orderId, "VERIFIED")}
                        disabled={actionLoading === evt.orderId}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded shadow-xs"
                      >
                        ✓ Verified in Bank
                      </button>
                      <button
                        onClick={() => handleVerifyDecision(evt.orderId, "REJECTED")}
                        disabled={actionLoading === evt.orderId}
                        className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] rounded shadow-xs"
                      >
                        ✗ Reject
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400">
                    No transactions awaiting manual verification.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gateway Configuration Controls */}
      <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-5">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
          Payment Method Controls & Security Settings
        </h2>

        <div className="space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="font-bold text-slate-800">YouPI-PG UPI Payments</span>
              <p className="text-slate-500">Enable or disable direct UPI checkout on the storefront.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isUpiEnabled}
                onChange={(e) => setIsUpiEnabled(e.target.checked)}
                className="w-4 h-4 text-sky-600 rounded"
              />
              <span className="ml-2 font-bold text-slate-700">
                {isUpiEnabled ? "Enabled" : "Disabled"}
              </span>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="font-bold text-slate-800">Cash on Delivery (COD)</span>
              <p className="text-slate-500">Allow customers to order with post-delivery cash payment.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isCodEnabled}
                onChange={(e) => setIsCodEnabled(e.target.checked)}
                className="w-4 h-4 text-sky-600 rounded"
              />
              <span className="ml-2 font-bold text-slate-700">
                {isCodEnabled ? "Enabled" : "Disabled"}
              </span>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200">
            <div>
              <span className="font-bold text-amber-900">Gateway Test Mode Sandbox</span>
              <p className="text-amber-700">
                Allows testing checkout sessions without charging real money.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isTestMode}
                onChange={(e) => setIsTestMode(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded"
              />
              <span className="ml-2 font-bold text-amber-900">
                {isTestMode ? "Test Mode (Active)" : "Live Production"}
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Merchant API Key (Masked)
              </label>
              <input
                type="text"
                disabled
                value={settings?.maskedApiKey || "yk_test_••••••••••••3421"}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-100 font-mono text-slate-500 cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-400">
                Configured securely in environment variables (YOUPI_MERCHANT_API_KEY).
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Webhook Signing Secret (Masked)
              </label>
              <input
                type="text"
                disabled
                value={settings?.maskedWebhookSecret || "whsec_test_••••••••••••9812"}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-100 font-mono text-slate-500 cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-400">
                Used to verify x-gateway-signature HMAC-SHA256 headers.
              </span>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                Customer Return URL
              </label>
              <input
                type="text"
                value={customerReturnUrl}
                onChange={(e) => setCustomerReturnUrl(e.target.value)}
                placeholder="http://localhost:3000/checkout/verification"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-bold px-5 py-2.5 rounded-xl shadow transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Save Payment Settings"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
