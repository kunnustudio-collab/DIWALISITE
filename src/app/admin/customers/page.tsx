"use client";

import React, { useState, useEffect } from "react";
import { Users, Search, ShoppingBag, IndianRupee, MapPin } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/customers?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      setCustomers(data.customers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadCustomers();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Customer Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered customer contact details, purchase history, and delivery destinations.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Name, Email, Phone..."
              className="text-xs pl-9 pr-3.5 py-2 border border-slate-300 rounded-lg w-64 focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-900"
          >
            Search
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4">Delivery Location</th>
                <th className="py-3 px-4">Total Orders</th>
                <th className="py-3 px-4">Total Spend</th>
                <th className="py-3 px-4">First Purchase</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Loading customer directory...
                  </td>
                </tr>
              ) : customers.length > 0 ? (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{c.name}</span>
                      <span className="text-[11px] text-slate-400">{c.email}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-semibold">+91 {c.phone}</td>
                    <td className="py-3 px-4">
                      {c.latestAddress ? (
                        <span className="text-slate-600">
                          {c.latestAddress.city}, {c.latestAddress.state} ({c.latestAddress.pincode})
                        </span>
                      ) : (
                        <span className="text-slate-400">Not recorded</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{c.totalOrders}</td>
                    <td className="py-3 px-4 font-bold text-emerald-700">
                      {formatCurrency(c.totalSpent)}
                    </td>
                    <td className="py-3 px-4 text-slate-400">{formatDate(c.createdAt)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No customers found matching search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
