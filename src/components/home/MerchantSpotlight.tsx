"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { LOCAL_MERCHANTS_SURAKARTA } from "@/constants/merchants";
import { Merchant } from "@/types/merchant.types";
import { Star, MapPin, Tag, ArrowRight, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MerchantSpotlightProps {
  onSelectMerchant?: (merchant: Merchant) => void;
}

export function MerchantSpotlight({ onSelectMerchant }: MerchantSpotlightProps) {
  const router = useRouter();
  const featuredMerchants = LOCAL_MERCHANTS_SURAKARTA.slice(0, 4);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white sg-editorial-title">
            Kuliner & UMKM Warga Solo
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 pl-4 mt-0.5">
            Pesan langsung dari pedagang legendaris tanpa potongan komisi
          </p>
        </div>

        <button
          onClick={() => router.push("/services/food")}
          className="text-xs font-black text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>Lihat Semua</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="space-y-3">
        {featuredMerchants.map((merchant) => (
          <div
            key={merchant.id}
            onClick={() => onSelectMerchant?.(merchant)}
            className="p-4 rounded-[1.8rem] bg-white dark:bg-[#0c1220] hover:bg-slate-50 dark:hover:bg-[#11192e] transition-all space-y-3.5 cursor-pointer shadow-[0_8px_25px_-4px_rgba(15,23,42,0.05)] dark:shadow-[0_14px_35px_-8px_rgba(0,0,0,0.7)] group relative overflow-hidden"
          >
            <div className="flex gap-3.5">
              <div className="w-20 h-20 rounded-[1.3rem] bg-slate-100 dark:bg-white/[0.04] overflow-hidden shrink-0 relative shadow-xs">
                <img 
                  src={merchant.imageUrl} 
                  alt={merchant.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute bottom-1 right-1 text-[9px] font-black bg-slate-950/80 text-white px-1.5 py-0.5 rounded-md backdrop-blur-md">
                  {merchant.distanceKm} KM
                </span>
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.2 rounded-full">
                    {merchant.category.toUpperCase()}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-500 dark:text-amber-400">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span>{merchant.rating}</span>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500">({merchant.totalReviews})</span>
                  </div>
                </div>

                <h4 className="text-sm font-black text-slate-900 dark:text-white truncate leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {merchant.name}
                </h4>

                <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                  <MapPin className="h-3 w-3 text-emerald-500 shrink-0" />
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
                  className="text-[10px] font-medium bg-slate-100/90 dark:bg-white/[0.04] text-slate-700 dark:text-zinc-300 px-2.5 py-1 rounded-xl shrink-0 shadow-xs"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}

        <Button
          onClick={() => router.push("/services/food")}
          variant="outline"
          className="w-full h-12 rounded-[1.4rem] bg-white dark:bg-[#0c1220] hover:bg-orange-50 dark:hover:bg-orange-950/20 text-orange-600 dark:text-orange-400 border border-orange-500/20 font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
        >
          <UtensilsCrossed className="h-4 w-4" />
          <span>Jelajahi 14+ Kuliner & Warung Ikonik Solo</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
