"use client";

import React, { useState, useEffect } from "react";
import { Boxes, Plus, Minus, CheckCircle2, History } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AdminInventoryPage() {
  const [product, setProduct] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [adjustAmount, setAdjustAmount] = useState(10);
  const [reason, setReason] = useState("RESTOCK_SHIPMENT");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/product");
      const data = await res.json();
      if (data.product) {
        setProduct(data.product);
      }
      // Also fetch audit logs for inventory
      const logsRes = await fetch("/api/admin/audit-logs?limit=30");
      const logsData = await logsRes.json();
      setHistory(logsData.logs?.filter((l: any) => l.action.includes("PRODUCT") || l.action.includes("ORDER")) || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdjust = async (direction: 1 | -1) => {
    if (!product?.id) return;
    const finalChange = adjustAmount * direction;
    const newQty = Math.max(0, product.stockQuantity + finalChange);

    setSaving(true);
    setSuccessMsg("");

    try {
      const res = await fetch("/api/product", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: product.id,
          stockQuantity: newQty,
          isInStock: newQty > 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setProduct({ ...product, stockQuantity: newQty, isInStock: newQty > 0 });
      setSuccessMsg(`Inventory updated by ${finalChange > 0 ? "+" : ""}${finalChange} units (${reason}).`);
      setTimeout(() => setSuccessMsg(""), 3500);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to adjust stock");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Inventory & Stock Management
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time product stock level and automated fulfillment decrement audit log.
        </p>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Current Stock Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Current Available Inventory
          </span>
          <div className="text-4xl font-black text-slate-900 mt-1">
            {product?.stockQuantity || 0} Units
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Product: <strong>{product?.name || "Havells Zella 1000W"}</strong>
          </p>
        </div>

        {/* Quick Adjust Box */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 w-full sm:w-auto">
          <p className="text-xs font-bold text-slate-700">Quick Stock Adjustment</p>

          <div className="flex items-center gap-2">
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
            >
              <option value="RESTOCK_SHIPMENT">Restock Shipment</option>
              <option value="WAREHOUSE_AUDIT">Warehouse Audit</option>
              <option value="DAMAGED_RETURN">Damaged / Return</option>
            </select>

            <input
              type="number"
              min={1}
              value={adjustAmount}
              onChange={(e) => setAdjustAmount(parseInt(e.target.value) || 1)}
              className="w-16 text-xs px-2 py-1.5 border border-slate-300 rounded-lg bg-white text-center font-bold"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleAdjust(1)}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-1.5 rounded-lg shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Units</span>
            </button>
            <button
              onClick={() => handleAdjust(-1)}
              disabled={saving || (product?.stockQuantity || 0) <= 0}
              className="flex-1 flex items-center justify-center gap-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-1.5 rounded-lg shadow-xs"
            >
              <Minus className="w-3.5 h-3.5" />
              <span>Deduct Units</span>
            </button>
          </div>
        </div>
      </div>

      {/* Inventory & Order Decrement Log */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <History className="w-5 h-5 text-sky-600" />
          <h2 className="text-sm font-bold text-slate-900">
            Automated Stock Decrement & Adjustment Activity
          </h2>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {history.length > 0 ? (
            history.map((h) => (
              <div key={h.id} className="py-2.5 flex items-center justify-between text-slate-600">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-800">{h.action}</span>
                  <p className="text-[11px] text-slate-400">
                    Target: {h.entityType} ({h.entityId || "N/A"}) • By: {h.adminEmail}
                  </p>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">
                  {formatDate(h.createdAt)}
                </span>
              </div>
            ))
          ) : (
            <p className="py-6 text-center text-slate-400">No stock history recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
