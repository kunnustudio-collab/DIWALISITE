"use client";

import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  Search,
  Filter,
  Download,
  Eye,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  Truck,
  IndianRupee,
  Clock,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

const STATUS_OPTIONS = [
  "ALL",
  "PENDING",
  "PAYMENT_PENDING",
  "PAYMENT_VERIFICATION",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState("");

  // Modal editing state
  const [newStatus, setNewStatus] = useState("");
  const [newPaymentStatus, setNewPaymentStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [statusNote, setStatusNote] = useState("");

  const loadOrders = async () => {
    setLoading(true);
    try {
      const url = `/api/orders?search=${encodeURIComponent(search)}&status=${encodeURIComponent(
        statusFilter
      )}`;
      const res = await fetch(url);
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error("Failed to load orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadOrders();
  };

  const openOrderDetail = (order: any) => {
    setSelectedOrder(order);
    setNewStatus(order.orderStatus);
    setNewPaymentStatus(order.paymentStatus);
    setAdminNotes(order.adminNotes || "");
    setStatusNote("");
    setUpdateSuccess("");
    setModalOpen(true);
  };

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setUpdating(true);
    setUpdateSuccess("");

    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderStatus: newStatus,
          paymentStatus: newPaymentStatus,
          adminNotes,
          note: statusNote || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update order");
      }

      setUpdateSuccess("Order status and notes updated successfully!");
      // Reload orders list
      loadOrders();
      // Update local modal data
      setSelectedOrder({
        ...selectedOrder,
        orderStatus: newStatus,
        paymentStatus: newPaymentStatus,
        adminNotes,
      });
      setTimeout(() => setUpdateSuccess(""), 3000);
    } catch (err: any) {
      alert(err.message || "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Order Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage customer orders, track verification, update dispatch status, and download invoices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={`/api/orders/export?status=${statusFilter}`}
            target="_blank"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 px-3.5 py-2 rounded-xl transition-colors shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Export to CSV</span>
          </a>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="w-full sm:w-80 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Order #, Name, Phone..."
              className="w-full text-xs pl-9 pr-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-900"
          >
            Search
          </button>
        </form>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:inline shrink-0" />
          {STATUS_OPTIONS.map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`text-[11px] font-bold px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? "bg-sky-600 text-white shadow-xs"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200"
              }`}
            >
              {st.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Payment Status</th>
                <th className="py-3 px-4">Order Status</th>
                <th className="py-3 px-4">Placed Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-slate-400">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length > 0 ? (
                orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{ord.orderNumber}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{ord.customerName}</td>
                    <td className="py-3 px-4 text-slate-500">{ord.customerPhone}</td>
                    <td className="py-3 px-4">
                      {ord.items?.reduce((s: number, i: any) => s + i.quantity, 0) || 1}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {formatCurrency(ord.finalAmount)}
                    </td>
                    <td className="py-3 px-4">{ord.paymentMethod}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          ord.paymentStatus === "PAID"
                            ? "bg-emerald-100 text-emerald-800"
                            : ord.paymentStatus === "PENDING_VERIFICATION"
                            ? "bg-amber-100 text-amber-800"
                            : ord.paymentStatus === "REJECTED"
                            ? "bg-red-100 text-red-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {ord.orderStatus.replace(/_/g, " ")}
                    </td>
                    <td className="py-3 px-4 text-slate-400">{formatDate(ord.createdAt)}</td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => openOrderDetail(ord)}
                        className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-800 font-bold"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Manage</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-slate-400">
                    No orders matching selected criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {modalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative border border-slate-200 max-h-[90vh] overflow-y-auto space-y-6">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Title */}
            <div className="border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded">
                Order Management
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">
                {selectedOrder.orderNumber}
              </h2>
              <p className="text-xs text-slate-500">
                Created: {formatDate(selectedOrder.createdAt)}
              </p>
            </div>

            {updateSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{updateSuccess}</span>
              </div>
            )}

            {/* Customer & Address Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <p className="font-bold text-slate-700 mb-1">Customer Information</p>
                <p className="font-semibold text-slate-900">{selectedOrder.customerName}</p>
                <p className="text-slate-600">{selectedOrder.customerEmail}</p>
                <p className="text-slate-600">+91 {selectedOrder.customerPhone}</p>
              </div>

              <div>
                <p className="font-bold text-slate-700 mb-1">Shipping Destination</p>
                {(() => {
                  try {
                    const addr = JSON.parse(selectedOrder.shippingAddressJson);
                    return (
                      <p className="text-slate-600 leading-relaxed">
                        {addr.houseNumber}, {addr.street}<br />
                        {addr.landmark ? `Near ${addr.landmark}, ` : ""}
                        {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                    );
                  } catch {
                    return <p className="text-slate-400">Address format error</p>;
                  }
                })()}
              </div>
            </div>

            {/* Items & Payment Info */}
            <div className="space-y-2 text-xs">
              <p className="font-bold text-slate-700">Order Items:</p>
              {selectedOrder.items?.map((it: any) => (
                <div key={it.id} className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="font-semibold text-slate-800">
                    {it.productName} × {it.quantity}
                  </span>
                  <span className="font-bold">{formatCurrency(it.totalAmount)}</span>
                </div>
              ))}
              <div className="flex justify-between pt-1 font-bold text-sm text-slate-900">
                <span>Final Payable Amount:</span>
                <span className="text-sky-700">{formatCurrency(selectedOrder.finalAmount)}</span>
              </div>
            </div>

            {/* Latest Payment Event / UTR if any */}
            {selectedOrder.paymentEvents?.[0] && (
              <div className="p-3 bg-sky-50/60 border border-sky-200 rounded-xl text-xs space-y-1">
                <p className="font-bold text-sky-900">Recorded Payment Reference:</p>
                <p className="text-slate-700">
                  Event: <strong>{selectedOrder.paymentEvents[0].eventType}</strong> | UTR:{" "}
                  <code className="bg-white px-2 py-0.5 rounded font-bold text-sky-800">
                    {selectedOrder.paymentEvents[0].utr || "N/A"}
                  </code>
                </p>
              </div>
            )}

            {/* Status Update Form */}
            <form onSubmit={handleUpdateOrder} className="space-y-4 pt-2 border-t border-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Order Fulfillment Status *
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white font-semibold"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="PAYMENT_PENDING">PAYMENT PENDING</option>
                    <option value="PAYMENT_VERIFICATION">PAYMENT VERIFICATION</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED (Restores Stock)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Payment Status *
                  </label>
                  <select
                    value={newPaymentStatus}
                    onChange={(e) => setNewPaymentStatus(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white font-semibold"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="PENDING_VERIFICATION">PENDING VERIFICATION</option>
                    <option value="PAID">PAID</option>
                    <option value="REJECTED">REJECTED</option>
                    <option value="REFUNDED">REFUNDED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Status Transition Note (Optional)
                </label>
                <input
                  type="text"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Courier tracking # dispatched via BlueDart"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Internal Admin Notes
                </label>
                <textarea
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Private administrative notes..."
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <a
                  href={`/api/orders/${selectedOrder.id}/invoice`}
                  target="_blank"
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 border border-slate-300 px-4 py-2 rounded-lg"
                >
                  <FileText className="w-4 h-4 text-sky-600" />
                  <span>Download Invoice</span>
                </a>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-5 py-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-sm"
                  >
                    {updating ? "Saving..." : "Update Status"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
