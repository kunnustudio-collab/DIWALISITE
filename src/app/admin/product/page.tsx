"use client";

import React, { useState, useEffect } from "react";
import {
  Package,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Image as ImageIcon,
} from "lucide-react";

export default function AdminProductPage() {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Product Fields
  const [name, setName] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [stockQuantity, setStockQuantity] = useState(45);
  const [isInStock, setIsInStock] = useState(true);
  const [isFeatured, setIsFeatured] = useState(true);
  const [warrantyInfo, setWarrantyInfo] = useState("");
  const [boxContents, setBoxContents] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  // Images, Features, Specs arrays
  const [images, setImages] = useState<{ url: string; altText?: string }[]>([]);
  const [features, setFeatures] = useState<{ title: string; description: string; icon: string; isVerified: boolean }[]>([]);
  const [specs, setSpecs] = useState<{ label: string; value: string; category: string; isVerified: boolean }[]>([]);

  // New Image URL input
  const [newImageUrl, setNewImageUrl] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/product");
        const data = await res.json();
        if (data.product) {
          const p = data.product;
          setProduct(p);
          setName(p.name);
          setSubtitle(p.subtitle);
          setDescription(p.description);
          setStockQuantity(p.stockQuantity);
          setIsInStock(p.isInStock);
          setIsFeatured(p.isFeatured);
          setWarrantyInfo(p.warrantyInfo || "");
          setBoxContents(p.boxContents || "");
          setMetaTitle(p.metaTitle || "");
          setMetaDescription(p.metaDescription || "");
          setImages(p.images || []);
          setFeatures(p.features || []);
          setSpecs(p.specs || []);
        }
      } catch (err) {
        console.error("Failed to load product", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    setImages([...images, { url: newImageUrl.trim(), altText: `${name} gallery photo` }]);
    setNewImageUrl("");
  };

  const handleRemoveImage = (idx: number) => {
    setImages(images.filter((_, i) => i !== idx));
  };

  const handleAddSpec = () => {
    setSpecs([...specs, { label: "New Spec", value: "Value", category: "General", isVerified: true }]);
  };

  const handleRemoveSpec = (idx: number) => {
    setSpecs(specs.filter((_, i) => i !== idx));
  };

  const handleAddFeature = () => {
    setFeatures([...features, { title: "Feature Title", description: "Feature detail description", icon: "Zap", isVerified: true }]);
  };

  const handleRemoveFeature = (idx: number) => {
    setFeatures(features.filter((_, i) => i !== idx));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product?.id) return;

    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await fetch("/api/product", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: product.id,
          name,
          subtitle,
          description,
          stockQuantity,
          isInStock,
          isFeatured,
          warrantyInfo,
          boxContents,
          metaTitle,
          metaDescription,
          images,
          features,
          specs,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update product");
      }

      setSuccessMsg("Product specifications and content updated successfully!");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save product.");
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
    <form onSubmit={handleSave} className="space-y-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Product Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage product images, verified technical specifications, stock, and descriptions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 px-3.5 py-2 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <span>Live Preview</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving Changes..." : "Save Product Details"}</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-sm rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Basic Info Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
          Core Product Identification
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">Product Title *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">Headline Subtitle</label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Stock Quantity (Units)</label>
            <input
              type="number"
              min={0}
              value={stockQuantity}
              onChange={(e) => setStockQuantity(parseInt(e.target.value) || 0)}
              className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-6 pt-5">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isInStock}
                onChange={(e) => setIsInStock(e.target.checked)}
                className="w-4 h-4 text-sky-600 rounded"
              />
              <span>Mark as In Stock</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 text-sky-600 rounded"
              />
              <span>Featured on Homepage</span>
            </label>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">Warranty Information</label>
            <input
              type="text"
              value={warrantyInfo}
              onChange={(e) => setWarrantyInfo(e.target.value)}
              className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">Box Package Contents</label>
            <input
              type="text"
              value={boxContents}
              onChange={(e) => setBoxContents(e.target.value)}
              className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Gallery Images Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
          Image Gallery & Media
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {images.map((img, idx) => (
            <div key={idx} className="relative rounded-xl border border-slate-200 overflow-hidden group bg-slate-50 aspect-square">
              <img src={img.url} alt={img.altText || "Product"} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemoveImage(idx)}
                className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              {idx === 0 && (
                <span className="absolute bottom-2 left-2 bg-sky-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  Primary Thumbnail
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-2">
          <input
            type="url"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            placeholder="Add new image direct URL (https://...)"
            className="flex-1 text-xs px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleAddImage}
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-lg"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Image</span>
          </button>
        </div>
      </div>

      {/* Technical Specifications Editor */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h2 className="text-sm font-bold text-slate-900">
            Technical Specifications Table ({specs.length})
          </h2>
          <button
            type="button"
            onClick={handleAddSpec}
            className="flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-700"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Specification</span>
          </button>
        </div>

        <div className="space-y-3">
          {specs.map((sp, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <input
                type="text"
                value={sp.label}
                onChange={(e) => {
                  const updated = [...specs];
                  updated[idx].label = e.target.value;
                  setSpecs(updated);
                }}
                placeholder="Spec Label (e.g. Wattage)"
                className="w-1/3 text-xs px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
              />
              <input
                type="text"
                value={sp.value}
                onChange={(e) => {
                  const updated = [...specs];
                  updated[idx].value = e.target.value;
                  setSpecs(updated);
                }}
                placeholder="Value (e.g. 1000 Watts)"
                className="flex-1 text-xs px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
              />
              <input
                type="text"
                value={sp.category}
                onChange={(e) => {
                  const updated = [...specs];
                  updated[idx].category = e.target.value;
                  setSpecs(updated);
                }}
                placeholder="Category"
                className="w-28 text-xs px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
              />
              <button
                type="button"
                onClick={() => handleRemoveSpec(idx)}
                className="p-1.5 text-slate-400 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Verified Feature Highlights */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h2 className="text-sm font-bold text-slate-900">
            Feature Highlights Cards ({features.length})
          </h2>
          <button
            type="button"
            onClick={handleAddFeature}
            className="flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-700"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Feature</span>
          </button>
        </div>

        <div className="space-y-3">
          {features.map((f, idx) => (
            <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <input
                  type="text"
                  value={f.title}
                  onChange={(e) => {
                    const updated = [...features];
                    updated[idx].title = e.target.value;
                    setFeatures(updated);
                  }}
                  placeholder="Feature Title (e.g. Nickel-Plated Element)"
                  className="flex-1 text-xs font-bold px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveFeature(idx)}
                  className="p-1 text-slate-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <textarea
                rows={2}
                value={f.description}
                onChange={(e) => {
                  const updated = [...features];
                  updated[idx].description = e.target.value;
                  setFeatures(updated);
                }}
                placeholder="Description of the verified feature"
                className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
              />
            </div>
          ))}
        </div>
      </div>
    </form>
  );
}
