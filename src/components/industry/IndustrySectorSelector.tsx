"use client";

import React from "react";
import { INDUSTRY_SECTORS, SectorDefinition } from "@/constants/ecosystemSectors";

interface IndustrySectorSelectorProps {
  selectedSectorId: string;
  onSelectSector: (id: string) => void;
}

export function IndustrySectorSelector({
  selectedSectorId,
  onSelectSector
}: IndustrySectorSelectorProps) {
  return (
    <div className="space-y-1.5">
      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 pl-1 block">
        Pilih Sektor Industri B2B:
      </span>
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {INDUSTRY_SECTORS.map((sector) => {
          const isSelected = selectedSectorId === sector.id;

          return (
            <button
              key={sector.id}
              onClick={() => onSelectSector(sector.id)}
              className={`px-3 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer border ${
                isSelected
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm"
                  : "bg-white dark:bg-[#0c1220] text-slate-600 dark:text-zinc-400 border-slate-200/80 dark:border-white/[0.08] hover:border-slate-300"
              }`}
            >
              <span className="text-base">{sector.avatar}</span>
              <span>{sector.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
