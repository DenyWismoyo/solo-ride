"use client";

import React from "react";
import { LOCAL_MERCHANTS_SURAKARTA } from "@/constants/merchants";
import { Merchant } from "@/types/merchant.types";
import { Star, MapPin, Tag, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MerchantSpotlightProps {
  onSelectMerchant?: (merchant: Merchant) => void;
}

export function MerchantSpotlight({ onSelectMerchant }: MerchantSpotlightProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white sg-editorial-title">
            Kuliner & UMKM Warga Solo
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 pl-4 mt-0.5">
            Pesan langsung dari pedagang lokal tanpa potongan komisi
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {LOCAL_MERCHANTS_SURAKARTA.map((merchant) => (
          <div
            key={merchant.id}
            onClick={() => onSelectMerchant?.(merchant)}
            className="sg-card sg-hover-lift p-3.5 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white/95 dark:bg-[#0c1220]/95 hover:border-emerald-500/40 transition-all space-y-3 cursor-pointer shadow-sm"
          >
            <div className="flex gap-3">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-white/[0.04] overflow-hidden shrink-0 border border-slate-200/80 dark:border-white/[0.08] relative">
                <img 
                  src={merchant.imageUrl} 
                  alt={merchant.name} 
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1 right-1 text-[9px] font-bold bg-slate-950/80 text-white px-1.5 py-0.5 rounded-md backdrop-blur-md">
                  {merchant.distanceKm} KM
                </span>
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.2 rounded-full">
                    {merchant.category.toUpperCase()}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-500 dark:text-amber-400">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span>{merchant.rating}</span>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500">({merchant.totalReviews})</span>
                  </div>
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate leading-tight">
                  {merchant.name}
                </h4>

                <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                  <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                  <span className="truncate">{merchant.area}</span>
                </div>

                {merchant.promoTag && (
                  <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 pt-0.5">
                    <Tag className="h-3 w-3 shrink-0" />
                    <span className="truncate">{merchant.promoTag}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Popular Items Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1 border-t border-slate-100 dark:border-white/[0.06]">
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold shrink-0">Menu:</span>
              {merchant.popularItems.map((item, idx) => (
                <span 
                  key={idx}
                  className="text-[10px] bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-zinc-300 px-2 py-0.5 rounded-lg shrink-0 border border-slate-200/80 dark:border-white/[0.06]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
