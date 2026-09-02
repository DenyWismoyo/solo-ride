"use client";

import React from "react";
import { Plus, ShieldCheck, Truck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectorDefinition } from "@/constants/ecosystemSectors";

interface IndustryOverviewCardProps {
  sector: SectorDefinition;
  onOpenCreateContract: () => void;
}

export function IndustryOverviewCard({
  sector,
  onOpenCreateContract
}: IndustryOverviewCardProps) {
  return (
    <div className="p-5 rounded-[2rem] bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/[0.08] space-y-4 shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center text-2xl border border-teal-500/30 shrink-0">
            {sector.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-slate-900 dark:text-white">
                {sector.agencyOrCompanyName}
              </h2>
              <Badge variant="teal" size="sm" className="text-[9px] font-bold">
                B2B Mitra
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {sector.tagline}
            </p>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
        {sector.description}
      </p>

      {/* Feature tags */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {sector.sampleFeatures.map((feat, idx) => (
          <span
            key={idx}
            className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-white/[0.04] text-[10px] font-semibold text-slate-700 dark:text-zinc-300"
          >
            ✓ {feat}
          </span>
        ))}
      </div>

      {/* Action Button */}
      <Button
        onClick={onOpenCreateContract}
        className="w-full h-11 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-teal-600/20"
      >
        <Plus className="h-4 w-4" />
        <span>Terbitkan Kontrak Armada / Pengadaan B2B</span>
      </Button>
    </div>
  );
}
