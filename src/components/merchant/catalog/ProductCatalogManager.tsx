"use client";

import React, { useState, useMemo } from "react";
import { useMerchantContext } from "../layout/MerchantContext";
import { ProductEditorModal } from "./ProductEditorModal";
import { FlashSaleLauncherModal } from "../flashsale/FlashSaleLauncherModal";
import { ProductItem } from "@/services/merchant.service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  UtensilsCrossed, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Sparkles,
  Tag,
  Coins,
  Loader2,
  Zap,
  Flame
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { toast } from "@/components/ui/toast";

export function ProductCatalogManager() {
  const { products, saveProduct, deleteProduct, loading, merchant } = useMerchantContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFlashSaleModalOpen, setIsFlashSaleModalOpen] = useState(false);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchSearch) return false;
      if (selectedCategory !== "all" && p.category !== selectedCategory) return false;
      return true;
    });
  }, [products, searchQuery, selectedCategory]);

  const handleToggleStock = async (product: ProductItem) => {
    try {
      await saveProduct({
        ...product,
        isAvailable: !product.isAvailable
      });
      toast.success(product.isAvailable ? "Stok Dinonaktifkan" : "Stok Siap Dijual", {
        description: `${product.name} diperbarui.`
      });
    } catch (err: any) {
      toast.error("Gagal Mengubah Stok", {
        description: err.message || "Terjadi kesalahan."
      });
    }
  };

  const handleDelete = async (productId: string) => {
    try {
      await deleteProduct(productId);
      toast.success("Menu Berhasil Dihapus");
    } catch (err: any) {
      toast.error("Gagal Menghapus Menu", {
        description: err.message || "Terjadi kesalahan."
      });
    }
  };


  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 sg-bento-card">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/15 text-orange-600 dark:text-orange-400 flex items-center justify-center text-2xl shrink-0">
            📦
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              Katalog Menu & Stok Dagangan
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Atur ketersediaan menu makanan & harga jual langsung ke aplikasi warga
            </p>
          </div>
        </div>

        <Button
          onClick={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
          className="h-11 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs gap-2 shadow-md shadow-orange-500/20 shrink-0 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Menu Baru</span>
        </Button>
      </div>

      {/* Dynamic Flash Sale Scheduler Card */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent border border-orange-500/20 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/20 text-orange-600 dark:text-orange-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-black text-slate-900 dark:text-white">
                  Flash Sale Dinamis (Subuh & Sore)
                </h3>
                {merchant?.activeFlashSale?.isActive && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-black animate-pulse">
                    🟢 AKTIF ({merchant.activeFlashSale.remainingQuota || 0} PORSI)
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500">
                Tingkatkan penjualan dengan diskon otomatis pada jam sibuk warga Solo
              </p>
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => setIsFlashSaleModalOpen(true)}
            className="rounded-xl text-xs font-black bg-orange-600 hover:bg-orange-500 text-white shadow-xs gap-1.5 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span>Atur Flash Sale</span>
          </Button>
        </div>

        {merchant?.activeFlashSale?.isActive && (
          <div className="p-3 rounded-2xl bg-white/60 dark:bg-white/[0.04] border border-orange-500/20 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-slate-800 dark:text-zinc-200">
                {merchant.activeFlashSale.shiftTitle || "Flash Sale Aktif"}
              </span>
              <p className="text-[10px] text-slate-500">
                Menu: {merchant.activeFlashSale.targetItemName || "Menu Pilihan"} • Sisa: {merchant.activeFlashSale.remainingQuota} dari {merchant.activeFlashSale.totalQuota} porsi
              </p>
            </div>
            <Badge variant="orange" size="sm" className="font-black">
              Diskon {merchant.activeFlashSale.discountPercent}%
            </Badge>
          </div>
        )}
      </div>

      {/* Search & Category Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sg-bento-card p-3.5">

        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari menu makanan atau barang dagangan..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedCategory === "all"
                ? "bg-orange-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-zinc-400 hover:text-slate-900"
            }`}
          >
            Semua ({products.length})
          </button>

          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-orange-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-zinc-400 hover:text-slate-900"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Cards Grid */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto" />
          <p className="text-xs text-slate-400">Memuat katalog menu...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white dark:bg-[#0c1220] rounded-[2rem] border border-dashed border-slate-200 dark:border-white/10 p-8">
          <span className="text-3xl">🍲</span>
          <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200">Tidak ada menu yang ditemukan</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery ? `Tidak ada hasil untuk pencarian "${searchQuery}".` : "Belum ada produk di etalase warung Anda."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredProducts.map((prod) => (
            <div
              key={prod.id}
              className={`p-4 rounded-[2rem] bg-white dark:bg-[#0c1220] border transition-all space-y-3 shadow-xs flex flex-col justify-between ${
                prod.isAvailable
                  ? "border-slate-200/80 dark:border-white/[0.08]"
                  : "border-rose-200/60 dark:border-rose-950/40 bg-slate-50/50 dark:bg-slate-900/20 opacity-80"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="outline" size="sm" className="font-bold text-[10px]">
                    {prod.category || "Menu"}
                  </Badge>

                  {/* Stock Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => handleToggleStock(prod)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      prod.isAvailable ? "bg-emerald-600" : "bg-slate-300 dark:bg-zinc-700"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        prod.isAvailable ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                  {prod.name}
                </h3>

                {prod.description && (
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-2">
                    {prod.description}
                  </p>
                )}

                <div className="pt-1">
                  <span className="font-mono text-sm font-black text-orange-600 dark:text-orange-400">
                    {formatRupiah(prod.price || 0)}
                  </span>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-2 border-t border-slate-100 dark:border-white/[0.04] flex items-center justify-between">
                <span className={`text-[10px] font-bold ${prod.isAvailable ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}`}>
                  ● {prod.isAvailable ? "Stok Tersedia" : "Stok Habis"}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => prod.id && handleDelete(prod.id)}
                    className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs transition-colors cursor-pointer"
                    title="Hapus Menu"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingProduct(prod);
                      setIsModalOpen(true);
                    }}
                    className="h-7 text-[10px] font-bold rounded-xl gap-1 cursor-pointer"
                  >
                    <Edit3 className="h-3 w-3" />
                    <span>Edit</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Editor Modal */}
      {isModalOpen && (
        <ProductEditorModal
          product={editingProduct}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingProduct(null);
          }}
          onSave={saveProduct}
        />
      )}

      {/* Flash Sale Launcher Modal */}
      <FlashSaleLauncherModal
        isOpen={isFlashSaleModalOpen}
        onClose={() => setIsFlashSaleModalOpen(false)}
      />
    </div>
  );
}
