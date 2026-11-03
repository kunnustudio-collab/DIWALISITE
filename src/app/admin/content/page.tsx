"use client";

import React, { useState, useEffect } from "react";
import { Globe, Save, CheckCircle2, AlertCircle, Plus, Trash2 } from "lucide-react";

export default function AdminContentPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/content");
        const data = await res.json();
        setSettings(data.settings || {});
        setFaqs(data.faqs || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSettingChange = (key: string, val: string) => {
    setSettings((prev) => ({ ...prev, [key]: val }));
  };

  const handleAddFaq = () => {
    setFaqs([...faqs, { question: "New FAQ Question?", answer: "Clear detailed answer.", isActive: true }]);
  };

  const handleRemoveFaq = (idx: number) => {
    setFaqs(faqs.filter((_, i) => i !== idx));
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");

    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings,
          faqs,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccessMsg("Website content and settings saved successfully!");
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err: any) {
      alert(err.message || "Failed to save content");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSaveAll} className="max-w-4xl space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Website Content & CMS
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage store identity, announcement banners, FAQs, and customer policy disclosures.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Saving Changes..." : "Publish Website Content"}</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Announcement Bar Settings */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
          Header Announcement Bar
        </h2>

        <div className="space-y-3 text-xs">
          <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={settings["announcement_enabled"] === "true"}
              onChange={(e) =>
                handleSettingChange("announcement_enabled", e.target.checked ? "true" : "false")
              }
              className="w-4 h-4 text-sky-600 rounded"
            />
            <span>Enable Announcement Bar on Storefront</span>
          </label>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Promotional Announcement Text</label>
            <input
              type="text"
              value={settings["announcement_text"] || ""}
              onChange={(e) => handleSettingChange("announcement_text", e.target.value)}
              className="w-full text-xs px-3.5 py-2 border border-slate-300 rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Brand & Contact Configuration */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
          Store Branding & Support Contacts
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Store Name</label>
            <input
              type="text"
              value={settings["store_name"] || ""}
              onChange={(e) => handleSettingChange("store_name", e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Support Email</label>
            <input
              type="email"
              value={settings["support_email"] || ""}
              onChange={(e) => handleSettingChange("support_email", e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Support Helpline Phone</label>
            <input
              type="text"
              value={settings["support_phone"] || ""}
              onChange={(e) => handleSettingChange("support_phone", e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">WhatsApp Chat Support Number</label>
            <input
              type="text"
              value={settings["support_whatsapp"] || ""}
              onChange={(e) => handleSettingChange("support_whatsapp", e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">Physical Business Address</label>
            <input
              type="text"
              value={settings["business_address"] || ""}
              onChange={(e) => handleSettingChange("business_address", e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">Authorized Seller Disclaimer</label>
            <textarea
              rows={3}
              value={settings["seller_disclaimer"] || ""}
              onChange={(e) => handleSettingChange("seller_disclaimer", e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
            <span className="text-[10px] text-slate-400">
              Clear disclosure stating independent reseller authorization. Never claim Havells ownership.
            </span>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h2 className="text-sm font-bold text-slate-900">
            Store FAQs Accordion ({faqs.length})
          </h2>
          <button
            type="button"
            onClick={handleAddFaq}
            className="flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-700"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add FAQ</span>
          </button>
        </div>

        <div className="space-y-3">
          {faqs.map((f, idx) => (
            <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <input
                  type="text"
                  value={f.question}
                  onChange={(e) => {
                    const updated = [...faqs];
                    updated[idx].question = e.target.value;
                    setFaqs(updated);
                  }}
                  className="flex-1 font-bold px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveFaq(idx)}
                  className="p-1 text-slate-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <textarea
                rows={2}
                value={f.answer}
                onChange={(e) => {
                  const updated = [...faqs];
                  updated[idx].answer = e.target.value;
                  setFaqs(updated);
                }}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
              />
            </div>
          ))}
        </div>
      </div>
    </form>
  );
}
