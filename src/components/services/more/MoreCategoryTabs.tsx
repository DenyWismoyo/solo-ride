"use client";

import React from "react";
import { Landmark, Bike, Store, Building2, Sparkles } from "lucide-react";

export type CategoryTab = "all" | "government" | "mobility" | "merchant" | "industry";

interface MoreCategoryTabsProps {
  activeCategory: CategoryTab;
  onCategoryChange: (cat: CategoryTab) => void;
  activeSubCategory: string;
  onSubCategoryChange: (sub: string) => void;
  availableSubCategories: { id: string; label: string; count: number }[];
  totalGovCount: number;
  totalNonGovCount: number;
}

export function MoreCategoryTabs({
  activeCategory,
  onCategoryChange,
  activeSubCategory,
  onSubCategoryChange,
  availableSubCategories,
  totalGovCount,
  totalNonGovCount
}: MoreCategoryTabsProps) {
  const categories = [
    { id: "all", label: "Semua", count: totalGovCount + totalNonGovCount, icon: Sparkles },
    { id: "government", label: "Layanan Publik Pemkot", count: totalGovCount, icon: Landmark },
    { id: "mobility", label: "Mobilitas & Kurir", count: null, icon: Bike },
    { id: "merchant", label: "Warung & Pasar", count: null, icon: Store },
    { id: "industry", label: "Industri & Bisnis", count: null, icon: Building2 },
  ];

  return (
    <div className="space-y-2.5">
      {/* Main Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id as CategoryTab)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer border ${
                isActive
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm"
                  : "bg-white dark:bg-[#0c1220] text-slate-600 dark:text-zinc-400 border-slate-200/80 dark:border-white/[0.08] hover:border-slate-300"
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span>{cat.label}</span>
              {cat.count !== null && (
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                  isActive ? "bg-white/20 dark:bg-slate-900/20" : "bg-slate-100 dark:bg-white/[0.06] text-slate-500"
                }`}>
                  {cat.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Sub Category Filter Pills (if any available) */}
      {availableSubCategories.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pl-1">
          <button
            onClick={() => onSubCategoryChange("all")}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer border ${
              activeSubCategory === "all"
                ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                : "bg-white dark:bg-[#0c1220] text-slate-600 dark:text-zinc-400 border-slate-200/80 dark:border-white/[0.08]"
            }`}
          >
            Semua Sub
          </button>
          {availableSubCategories.map((sub) => (
            <button
              key={sub.id}
              onClick={() => onSubCategoryChange(sub.id)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer border ${
                activeSubCategory === sub.id
                  ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                  : "bg-white dark:bg-[#0c1220] text-slate-600 dark:text-zinc-400 border-slate-200/80 dark:border-white/[0.08]"
              }`}
            >
              <span>{sub.label}</span>
              <span className="text-[10px] opacity-70">({sub.count})</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
