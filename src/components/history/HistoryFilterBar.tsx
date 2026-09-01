"use client";

import React from "react";
import { ServiceCategory, getOrderCategory } from "@/constants/serviceCategories";
import { OrderDocument } from "@/types/order.types";
import { Car, UtensilsCrossed, Package, Landmark, Store, Factory } from "lucide-react";

interface HistoryFilterBarProps {
  activeCategory: ServiceCategory | "semua";
  onCategoryChange: (cat: ServiceCategory | "semua") => void;
  orders: OrderDocument[];
}

const CATEGORY_MAP: Record<ServiceCategory, { label: string; icon: React.ElementType; color: string }> = {
  mobilitas: { label: "Mobilitas", icon: Car, color: "blue" },
  kuliner: { label: "Kuliner", icon: UtensilsCrossed, color: "orange" },
  pengiriman: { label: "Pengiriman", icon: Package, color: "teal" },
  layanan_publik: { label: "Layanan Publik", icon: Landmark, color: "indigo" },
  umkm_pasar: { label: "UMKM Pasar", icon: Store, color: "emerald" },
  industri: { label: "Industri B2B", icon: Factory, color: "slate" },
};

export function HistoryFilterBar({ activeCategory, onCategoryChange, orders }: HistoryFilterBarProps) {
  // Hitung jumlah order per kategori
  const counts: Record<ServiceCategory | "semua", number> = {
    semua: orders.length,
    mobilitas: 0,
    kuliner: 0,
    pengiriman: 0,
    layanan_publik: 0,
    umkm_pasar: 0,
    industri: 0,
  };

  orders.forEach(order => {
    const cat = getOrderCategory(order);
    if (counts[cat] !== undefined) {
      counts[cat]++;
    }
  });

  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 pt-1">
      <button
        onClick={() => onCategoryChange("semua")}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-full whitespace-nowrap transition-all border ${
          activeCategory === "semua"
            ? "bg-slate-900 dark:bg-white text-white dark:text-black border-slate-900 dark:border-white shadow-sm"
            : "bg-white/50 dark:bg-zinc-900/50 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800"
        }`}
      >
        <span className="text-xs font-bold">Semua</span>
        <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
          activeCategory === "semua" 
            ? "bg-white/20 dark:bg-black/20" 
            : "bg-slate-100 dark:bg-zinc-800"
        }`}>
          {counts.semua}
        </span>
      </button>

      {(Object.entries(CATEGORY_MAP) as [ServiceCategory, typeof CATEGORY_MAP[ServiceCategory]][]).map(([cat, config]) => {
        if (counts[cat] === 0) return null; // Sembunyikan kategori kosong
        
        const isActive = activeCategory === cat;
        const Icon = config.icon;
        
        return (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full whitespace-nowrap transition-all border ${
              isActive
                ? `bg-${config.color}-600 text-white border-${config.color}-600 shadow-sm`
                : "bg-white/50 dark:bg-zinc-900/50 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="text-xs font-bold">{config.label}</span>
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
              isActive 
                ? "bg-white/20" 
                : "bg-slate-100 dark:bg-zinc-800"
            }`}>
              {counts[cat]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
