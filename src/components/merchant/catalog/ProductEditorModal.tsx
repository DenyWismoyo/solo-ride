"use client";

import React, { useState, useEffect } from "react";
import { ProductItem } from "@/services/merchant.service";
import { Button } from "@/components/ui/button";
import { 
  X, 
  UtensilsCrossed, 
  Save, 
  Coins, 
  Image as ImageIcon, 
  Tag, 
  FileText,
  Loader2
} from "lucide-react";

interface ProductEditorModalProps {
  product: ProductItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<ProductItem>) => Promise<void>;
}

export function ProductEditorModal({
  product,
  isOpen,
  onClose,
  onSave
}: ProductEditorModalProps) {
  const isEditing = Boolean(product);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(15000);
  const [category, setCategory] = useState("Makanan Utama");
  const [imageUrl, setImageUrl] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name || "");
      setDescription(product.description || "");
      setPrice(product.price || 0);
      setCategory(product.category || "Makanan Utama");
      setImageUrl(product.imageUrl || "");
      setIsAvailable(product.isAvailable ?? true);
    } else {
      setName("");
      setDescription("");
      setPrice(15000);
      setCategory("Makanan Utama");
      setImageUrl("");
      setIsAvailable(true);
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      await onSave({
        id: product?.id,
        name: name.trim(),
        description: description.trim(),
        price: Number(price) || 0,
        category,
        imageUrl: imageUrl.trim(),
        isAvailable
      });
      onClose();
    } catch (err: any) {
      alert(`Gagal menyimpan menu: ${err.message || err}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#0c1220] rounded-[2rem] max-w-md w-full p-6 shadow-2xl border border-slate-200/80 dark:border-white/10 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-orange-500/15 text-orange-600 dark:text-orange-400 flex items-center justify-center text-xl shrink-0">
              <UtensilsCrossed className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400 block">
                {isEditing ? "EDIT MENU / PRODUK" : "TAMBAH MENU BARU"}
              </span>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                {name || "Menu Warung Mitra"}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Name */}
          <div>
            <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
              Nama Menu / Barang Dagangan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Tengkleng Kambing Solo Porsi Spesial..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
              required
            />
          </div>

          {/* Category & Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                Kategori Menu
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
              >
                <option value="Makanan Utama">🍲 Makanan Utama</option>
                <option value="Minuman">🥤 Minuman Segar</option>
                <option value="Cemilan / Snack">🥟 Snack & Gorengan</option>
                <option value="Paket Sembako">🌾 Paket Sembako Pasar</option>
                <option value="Bahan Pokok">🥩 Bahan Pokok / Sayur</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                Harga Jual (Rp) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                min={1000}
                step={500}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
              Deskripsi Menu / Porsi
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Jelaskan isi porsi, tingkat kepedasan, atau bahan..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1 flex items-center gap-1">
              <ImageIcon className="h-3 w-3 text-orange-500" />
              <span>URL Foto Menu (Opsional)</span>
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Stock Toggle */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04]">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
              />
              <span className="font-bold text-slate-800 dark:text-zinc-200">
                Stok Tersedia (Dapat Dipesan Warga)
              </span>
            </label>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-10 rounded-xl text-xs"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="h-10 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs gap-1.5 shadow-md shadow-orange-500/20"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>Simpan Menu</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
