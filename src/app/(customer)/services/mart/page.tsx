"use client";

import React, { useState } from "react";
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
  Pill
} from "lucide-react";

export default function MartServicePage() {
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState("");

  // We reuse local merchants, but ideally filter by category: "mart" or "apotek".
  // For demo, we just use the same list or limit to a few.
  const merchants = LOCAL_MERCHANTS_SURAKARTA.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.area.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenMerchant = (merchant: Merchant) => {
    router.push(`/store/${merchant.storeSlug || merchant.id}`);
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 flex flex-col pb-6">
      <AppHeader onOpenProfile={() => {}} />

      <main className="pt-20 px-4 max-w-lg w-full mx-auto space-y-4">
        {/* Header Back & Title */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.back()}
            className="p-2 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white cursor-pointer transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Pill className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">Apotek & Mart</h1>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400">Belanja obat & kebutuhan harian</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Cari obat, sabun, sembako..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 focus:border-purple-500 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-900 dark:text-white focus:outline-none transition-colors shadow-sm"
          />
        </div>

        {/* Categories / Tags (Static for now) */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Badge variant="purple" className="cursor-pointer whitespace-nowrap px-3 py-1">24 Jam</Badge>
          <Badge variant="outline" className="cursor-pointer whitespace-nowrap px-3 py-1 bg-white dark:bg-zinc-900">Apotek</Badge>
          <Badge variant="outline" className="cursor-pointer whitespace-nowrap px-3 py-1 bg-white dark:bg-zinc-900">Toko Kelontong</Badge>
          <Badge variant="outline" className="cursor-pointer whitespace-nowrap px-3 py-1 bg-white dark:bg-zinc-900">Kebutuhan Ibu & Anak</Badge>
        </div>

        {/* Merchant List */}
        <div className="space-y-3">
          {merchants.length === 0 ? (
            <div className="text-center p-8 text-slate-500">
              <p className="text-sm">Toko tidak ditemukan.</p>
            </div>
          ) : (
            merchants.map((merchant) => (
              <div 
                key={merchant.id}
                onClick={() => handleOpenMerchant(merchant)}
                className="sg-card bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-3 shadow-sm flex items-center gap-4 cursor-pointer hover:border-purple-500/50 transition-all sg-hover-lift"
              >
                <div className="w-16 h-16 rounded-xl bg-purple-100 dark:bg-purple-950/30 flex items-center justify-center shrink-0 border border-purple-200 dark:border-purple-900/50 overflow-hidden">
                  {merchant.imageUrl ? (
                    <img src={merchant.imageUrl} alt={merchant.name} className="w-full h-full object-cover" />
                  ) : (
                    <Store className="h-6 w-6 text-purple-400" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0 py-1">
                  <div className="flex justify-between items-start mb-0.5">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate pr-2">
                      {merchant.name}
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-zinc-400 mb-1.5">
                    <span className="flex items-center text-amber-500 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded">
                      <Star className="h-3 w-3 fill-amber-400 mr-0.5" /> {merchant.rating}
                    </span>
                    <span className="flex items-center gap-1">
                      <Store className="h-3 w-3" /> {merchant.area}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-400 dark:text-zinc-500 truncate">
                    Obat-obatan, Sembako, Keperluan Mandi
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

    </div>
  );
}
