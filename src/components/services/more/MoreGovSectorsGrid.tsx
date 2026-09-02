"use client";

import React from "react";
import { motion } from "motion/react";
import { Landmark, ArrowRight, ShieldCheck } from "lucide-react";
import { SectorDefinition } from "@/constants/ecosystemSectors";
import { Badge } from "@/components/ui/badge";

interface MoreGovSectorsGridProps {
  sectors: SectorDefinition[];
  onOpenSector: (sectorId: string) => void;
}

export function MoreGovSectorsGrid({
  sectors,
  onOpenSector
}: MoreGovSectorsGridProps) {
  if (sectors.length === 0) return null;

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Landmark className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 dark:text-white">
              18 Gerbang Pelayanan Publik Pemkot Surakarta
            </h2>
            <p className="text-[11px] text-slate-400">Integrasi resmi dinas daerah dan program sosial warga</p>
          </div>
        </div>
        <Badge variant="blue" size="sm" className="font-bold">
          {sectors.length} Dinas
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {sectors.map((sector) => (
          <motion.div
            key={sector.id}
            whileTap={{ scale: 0.98 }}
            whileHover={{ y: -2 }}
            onClick={() => onOpenSector(sector.id)}
            className="sg-card p-5 flex flex-col justify-between space-y-3 group hover:border-blue-500/40 transition-all cursor-pointer"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl">{sector.avatar}</span>
                <Badge variant="blue" size="sm" className="text-[9px] font-bold">
                  {sector.services.length} Layanan
                </Badge>
              </div>

              <div>
                <h3 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {sector.agencyOrCompanyName}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-2 mt-0.5">
                  {sector.tagline || sector.description}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-white/[0.04] flex items-center justify-between text-[11px] font-bold text-blue-600 dark:text-blue-400">
              <span>Buka Portal Layanan</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
