"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/layout/AppHeader";
import { LOCAL_MERCHANTS_SURAKARTA } from "@/constants/merchants";
import { Merchant } from "@/types/merchant.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Store, 
  Search, 
  Star, 
  Clock,
  UtensilsCrossed,
  Sparkles,
  Flame,
  ShieldCheck,
  MapPin,
  ChevronRight
} from "lucide-react";
import { motion } from "motion/react";

const FOOD_CATEGORIES = [
  { id: "all", label: "🌟 Semua Kuliner" },
  { id: "sate", label: "🍢 Sate & Tengkleng" },
  { id: "selat", label: "🥗 Selat & Bistik" },
  { id: "liwet", label: "🍚 Nasi Liwet & Timlo" },
  { id: "wedangan", label: "☕ Wedangan & Dawet" },
  { id: "ayam", label: "🍗 Bebek & Ayam Goreng" },
] as const;

export default function FoodServicePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredMerchants = useMemo(() => {
    return LOCAL_MERCHANTS_SURAKARTA.filter((m) => {
      const matchSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.popularItems.some(i => i.toLowerCase().includes(searchQuery.toLowerCase()));

      let matchCat = true;
      if (selectedCategory === "sate") {
        matchCat = m.name.toLowerCase().includes("sate") || m.name.toLowerCase().includes("tengkleng") || m.popularItems.some(i => i.toLowerCase().includes("sate") || i.toLowerCase().includes("tengkleng"));
      } else if (selectedCategory === "selat") {
        matchCat = m.name.toLowerCase().includes("selat") || m.popularItems.some(i => i.toLowerCase().includes("selat"));
      } else if (selectedCategory === "liwet") {
        matchCat = m.name.toLowerCase().includes("liwet") || m.name.toLowerCase().includes("timlo") || m.popularItems.some(i => i.toLowerCase().includes("liwet") || i.toLowerCase().includes("timlo"));
      } else if (selectedCategory === "wedangan") {
        matchCat = m.name.toLowerCase().includes("dawet") || m.name.toLowerCase().includes("wedang") || m.popularItems.some(i => i.toLowerCase().includes("dawet") || i.toLowerCase().includes("wedang"));
      } else if (selectedCategory === "ayam") {
        matchCat = m.name.toLowerCase().includes("ayam") || m.name.toLowerCase().includes("bebek") || m.popularItems.some(i => i.toLowerCase().includes("ayam") || i.toLowerCase().includes("bebek"));
      }

      return matchSearch && matchCat;
    });
  }, [searchQuery, selectedCategory]);

  const handleOpenMerchant = (merchant: Merchant) => {
    router.push(`/store/${merchant.storeSlug || merchant.id}`);
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 flex flex-col pb-10 transition-colors duration-200">
      <AppHeader onOpenProfile={() => {}} />

      <main className="pt-20 px-4 max-w-lg w-full mx-auto space-y-4">
        {/* Header Back & Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.back()}
              className="p-2 rounded-2xl bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/[0.08] shadow-sm text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white cursor-pointer transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-orange-500/15 text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-500/20">
                <UtensilsCrossed className="h-4.5 w-4.5" />
              </div>
              <div>
                <h1 className="text-sm font-black text-slate-900 dark:text-white leading-tight">Kuliner Warga Solo</h1>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400">Warung lokal 0% komisi aplikator</p>
              </div>
            </div>
          </div>

          <Badge variant="orange" size="sm" className="font-bold">
            0% Komisi
          </Badge>
        </div>

        {/* Promo / Pasar Warga Banner */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-transparent border border-orange-500/25 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/20 text-orange-600 dark:text-orange-400">
              <Flame className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-orange-800 dark:text-orange-300 block">
                Pesan Langsung Tanpa Potongan
              </span>
              <p className="text-[9px] text-slate-500 dark:text-zinc-400">
                Ongkir flat Rp 8.000 se-Solo, 100% uang makanan masuk kas UMKM.
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Cari sate buntel, selat solo, dawet..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/95 dark:bg-[#0c1220]/95 border border-slate-200/80 dark:border-white/[0.08] focus:border-orange-500 dark:focus:border-orange-500 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none transition-all shadow-sm"
          />
        </div>

        {/* Categories Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {FOOD_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer border ${
                  isSelected
                    ? "bg-orange-600 text-white border-orange-500 shadow-sm"
                    : "bg-white/90 dark:bg-[#0c1220]/90 text-slate-700 dark:text-zinc-300 border-slate-200/80 dark:border-white/[0.06] hover:border-orange-500/40"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Merchant Cards List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pl-1">
            <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
              Daftar Warung ({filteredMerchants.length})
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              Terdekat di Surakarta
            </span>
          </div>

          {filteredMerchants.length === 0 ? (
            <div className="text-center p-8 bg-white dark:bg-[#0c1220] border border-slate-200 dark:border-zinc-800 rounded-3xl space-y-2">
              <Store className="h-8 w-8 text-slate-400 mx-auto" />
              <p className="text-xs font-bold text-slate-700 dark:text-zinc-300">Warung Kuliner Tidak Ditemukan</p>
              <p className="text-[10px] text-slate-500">Coba ketik kata kunci lain seperti sate, selat, atau dawet.</p>
            </div>
          ) : (
            filteredMerchants.map((merchant) => (
              <motion.div 
                key={merchant.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleOpenMerchant(merchant)}
                className="p-3.5 rounded-2xl bg-white/95 dark:bg-[#0c1220]/95 hover:bg-slate-50 dark:hover:bg-zinc-900 border border-slate-200/80 dark:border-white/[0.08] shadow-sm flex items-center gap-3.5 cursor-pointer transition-all group"
              >
                <div className="w-16 h-16 rounded-2xl bg-orange-100 dark:bg-orange-950/40 flex items-center justify-center shrink-0 border border-orange-200 dark:border-orange-900/50 overflow-hidden group-hover:scale-105 transition-transform">
                  {merchant.imageUrl ? (
                    <img src={merchant.imageUrl} alt={merchant.name} className="w-full h-full object-cover" />
                  ) : (
                    <Store className="h-6 w-6 text-orange-500" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-1">
                    <h3 className="text-xs font-extrabold text-slate-900 dark:text-white truncate group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                      {merchant.name}
                    </h3>
                    <span className="flex items-center text-[10px] font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded shrink-0">
                      <Star className="h-3 w-3 fill-amber-400 mr-0.5" /> {merchant.rating}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">
                    <span className="flex items-center gap-0.5">
                      <MapPin className="h-3 w-3 text-emerald-500" /> {merchant.area}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5 text-slate-500">
                      <Clock className="h-3 w-3" /> 15-25 mnt
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-400 dark:text-zinc-500 truncate mt-1">
                    {merchant.popularItems.join(" • ")}
                  </p>
                </div>

                <ChevronRight className="h-4 w-4 text-slate-400 shrink-0 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </motion.div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
