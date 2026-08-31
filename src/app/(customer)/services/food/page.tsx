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
  { id: "liwet", label: "🍚 Nasi Liwet & Timlo" },
  { id: "soto", label: "🍲 Soto & Bakso" },
  { id: "selat", label: "🥗 Selat & Bistik" },
  { id: "bebek", label: "🍗 Bebek & Ayam Goreng" },
  { id: "jajan", label: "🥞 Serabi, Dawet & Wedangan" },
] as const;

export default function FoodServicePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredMerchants = useMemo(() => {
    return LOCAL_MERCHANTS_SURAKARTA.filter((m) => {
      // Only culinary / food items on this page
      if (m.category !== "kuliner") return false;

      const matchSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.popularItems.some(i => i.toLowerCase().includes(searchQuery.toLowerCase()));

      let matchCat = true;
      if (selectedCategory === "sate") {
        matchCat = m.name.toLowerCase().includes("sate") || m.name.toLowerCase().includes("tengkleng") || m.popularItems.some(i => i.toLowerCase().includes("sate") || i.toLowerCase().includes("tengkleng"));
      } else if (selectedCategory === "liwet") {
        matchCat = m.name.toLowerCase().includes("liwet") || m.name.toLowerCase().includes("timlo") || m.name.toLowerCase().includes("gudeg") || m.popularItems.some(i => i.toLowerCase().includes("liwet") || i.toLowerCase().includes("timlo") || i.toLowerCase().includes("gudeg"));
      } else if (selectedCategory === "soto") {
        matchCat = m.name.toLowerCase().includes("soto") || m.name.toLowerCase().includes("bakso") || m.popularItems.some(i => i.toLowerCase().includes("soto") || i.toLowerCase().includes("bakso"));
      } else if (selectedCategory === "selat") {
        matchCat = m.name.toLowerCase().includes("selat") || m.popularItems.some(i => i.toLowerCase().includes("selat"));
      } else if (selectedCategory === "bebek") {
        matchCat = m.name.toLowerCase().includes("ayam") || m.name.toLowerCase().includes("bebek") || m.popularItems.some(i => i.toLowerCase().includes("ayam") || i.toLowerCase().includes("bebek"));
      } else if (selectedCategory === "jajan") {
        matchCat = m.name.toLowerCase().includes("dawet") || m.name.toLowerCase().includes("serabi") || m.name.toLowerCase().includes("tahok") || m.name.toLowerCase().includes("wedang") || m.popularItems.some(i => i.toLowerCase().includes("dawet") || i.toLowerCase().includes("serabi") || i.toLowerCase().includes("tahok") || i.toLowerCase().includes("wedang"));
      }

      return matchSearch && matchCat;
    });
  }, [searchQuery, selectedCategory]);

  const handleOpenMerchant = (merchant: Merchant) => {
    router.push(`/store/${merchant.storeSlug || merchant.id}`);
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 flex flex-col pb-12 transition-colors duration-200">
      <AppHeader onOpenProfile={() => {}} />

      <main className="pt-20 px-4 max-w-lg w-full mx-auto space-y-4">
        {/* Header Back & Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.back()}
              className="p-2.5 rounded-2xl bg-white dark:bg-[#0c1220] shadow-[0_4px_15px_-3px_rgba(0,0,0,0.06)] text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white cursor-pointer transition-all"
            >
              <ArrowLeft className="h-4 w-4 stroke-[2.5]" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-[1.1rem] bg-gradient-to-tr from-orange-500/25 to-amber-500/15 text-orange-600 dark:text-orange-400 flex items-center justify-center shadow-xs">
                <UtensilsCrossed className="h-5 w-5 stroke-[2.2]" />
              </div>
              <div>
                <h1 className="text-sm font-black text-slate-900 dark:text-white leading-tight">Kuliner Warga Solo</h1>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400">Warung & Resto Legendaris 0% Komisi</p>
              </div>
            </div>
          </div>

          <Badge variant="orange" size="sm" className="font-extrabold shadow-xs">
            0% KOMISI
          </Badge>
        </div>

        {/* Promo / Pasar Warga Banner */}
        <div className="p-4 rounded-[1.6rem] bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-transparent flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-orange-500/20 text-orange-600 dark:text-orange-400 shadow-xs">
              <Flame className="h-4.5 w-4.5" />
            </div>
            <div>
              <span className="text-xs font-black text-orange-900 dark:text-orange-300 block">
                Pesan Langsung Tanpa Potongan
              </span>
              <p className="text-[10px] text-slate-600 dark:text-zinc-400 mt-0.5">
                Ongkir flat Rp 8.000 se-Solo Raya, 100% uang makanan masuk kas pedagang.
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400 stroke-[2.2]" />
          </div>
          <input
            type="text"
            placeholder="Cari sate buntel, nasi liwet, soto gading, serabi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-[#0c1220] rounded-[1.4rem] pl-10 pr-4 py-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none transition-all shadow-[0_4px_20px_-4px_rgba(15,23,42,0.04)] dark:shadow-[0_8px_25px_-6px_rgba(0,0,0,0.6)]"
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
                className={`px-3.5 py-2 rounded-2xl text-[11px] font-black transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-xs ${
                  isSelected
                    ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md shadow-orange-500/25"
                    : "bg-white dark:bg-[#0c1220] text-slate-700 dark:text-zinc-300 hover:text-orange-600 dark:hover:text-orange-400"
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
            <span className="text-xs font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
              Daftar Warung ({filteredMerchants.length})
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold bg-emerald-500/10 px-2 py-0.5 rounded-full">
              Pilihan Legendaris Surakarta
            </span>
          </div>

          {filteredMerchants.length === 0 ? (
            <div className="text-center p-8 bg-white dark:bg-[#0c1220] rounded-[2rem] shadow-sm space-y-2">
              <Store className="h-10 w-10 text-slate-400 mx-auto" />
              <p className="text-xs font-bold text-slate-800 dark:text-zinc-200">Warung Kuliner Tidak Ditemukan</p>
              <p className="text-[10px] text-slate-500">Coba ketik kata kunci lain seperti sate, liwet, soto, atau serabi.</p>
            </div>
          ) : (
            filteredMerchants.map((merchant) => (
              <motion.div 
                key={merchant.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleOpenMerchant(merchant)}
                className="p-4 rounded-[1.8rem] bg-white dark:bg-[#0c1220] hover:bg-slate-50 dark:hover:bg-[#11192e] shadow-[0_6px_25px_-6px_rgba(15,23,42,0.05)] dark:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.7)] flex items-center gap-3.5 cursor-pointer transition-all group relative overflow-hidden"
              >
                <div className="w-18 h-18 rounded-[1.3rem] bg-orange-100 dark:bg-orange-950/40 flex items-center justify-center shrink-0 overflow-hidden group-hover:scale-105 transition-transform shadow-xs">
                  {merchant.imageUrl ? (
                    <img src={merchant.imageUrl} alt={merchant.name} className="w-full h-full object-cover" />
                  ) : (
                    <Store className="h-7 w-7 text-orange-500" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-1">
                    <h3 className="text-xs font-black text-slate-900 dark:text-white truncate group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                      {merchant.name}
                    </h3>
                    <span className="flex items-center text-[10px] font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full shrink-0">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400 mr-1" /> {merchant.rating}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-zinc-400 mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-emerald-500" /> {merchant.area}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <Clock className="h-3 w-3" /> 15-25 mnt
                    </span>
                  </div>

                  <p className="text-[10px] font-medium text-slate-500 dark:text-zinc-400 truncate mt-1.5">
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
