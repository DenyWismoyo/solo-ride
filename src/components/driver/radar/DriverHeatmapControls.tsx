"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Flame, 
  Navigation, 
  MapPin, 
  TrendingUp, 
  Clock, 
  Sparkles, 
  ArrowUpRight, 
  Compass,
  Zap,
  CheckCircle2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface SurgeHotspot {
  id: string;
  name: string;
  category: "ride" | "market" | "food" | "campus";
  district: string;
  surgeMultiplier: number;
  pendingOrdersCount: number;
  bestTime: string;
  lat: number;
  lng: number;
  icon: string;
  extraIncomeText: string;
}

const SURGE_HOTSPOTS: SurgeHotspot[] = [
  {
    id: "stasiun_balapan",
    name: "Stasiun Solo Balapan",
    category: "ride",
    district: "Banjarsari",
    surgeMultiplier: 2.5,
    pendingOrdersCount: 14,
    bestTime: "Kedatangan Kereta (Pagi & Malam)",
    lat: -7.5583,
    lng: 110.8217,
    icon: "🚆",
    extraIncomeText: "+Rp 8.000 / trip"
  },
  {
    id: "pasar_legi",
    name: "Pasar Legi (Sentra Induk)",
    category: "market",
    district: "Banjarsari",
    surgeMultiplier: 2.0,
    pendingOrdersCount: 11,
    bestTime: "Subuh - Pagi (04.00 - 08.00 WIB)",
    lat: -7.5611,
    lng: 110.8242,
    icon: "🥬",
    extraIncomeText: "+Rp 6.000 / trip"
  },
  {
    id: "pasar_gede",
    name: "Pasar Gede & Balai Kota",
    category: "food",
    district: "Jebres",
    surgeMultiplier: 1.8,
    pendingOrdersCount: 9,
    bestTime: "Siang - Sore (11.00 - 16.00 WIB)",
    lat: -7.5703,
    lng: 110.8315,
    icon: "🏛️",
    extraIncomeText: "+Rp 5.000 / trip"
  },
  {
    id: "solo_paragon",
    name: "Solo Paragon & Jl. Slamet Riyadi",
    category: "food",
    district: "Banjarsari",
    surgeMultiplier: 1.7,
    pendingOrdersCount: 8,
    bestTime: "Sore - Malam (16.00 - 21.00 WIB)",
    lat: -7.5636,
    lng: 110.8124,
    icon: "🛍️",
    extraIncomeText: "+Rp 4.500 / trip"
  },
  {
    id: "uns_kentingan",
    name: "Kawasan Kampus UNS Kentingan",
    category: "campus",
    district: "Jebres",
    surgeMultiplier: 1.6,
    pendingOrdersCount: 7,
    bestTime: "Jam Kuliah (07.30 & 16.00 WIB)",
    lat: -7.5594,
    lng: 110.8566,
    icon: "🎓",
    extraIncomeText: "+Rp 4.000 / trip"
  }
];

interface DriverHeatmapControlsProps {
  onSelectHotspotLocation?: (lat: number, lng: number) => void;
}

export function DriverHeatmapControls({
  onSelectHotspotLocation
}: DriverHeatmapControlsProps) {
  const [selectedFilter, setSelectedFilter] = useState<"all" | "ride" | "market" | "food" | "campus">("all");

  const filteredHotspots = SURGE_HOTSPOTS.filter(
    (h) => selectedFilter === "all" || h.category === selectedFilter
  );

  const handleOpenGoogleNavigation = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
  };

  return (
    <div className="space-y-3">
      {/* Header Banner */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-transparent border border-orange-500/20 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-orange-500/20 text-orange-600 dark:text-orange-400">
            <Flame className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-black text-slate-900 dark:text-white">
                Hotspot Lonjakan Order Solo
              </h3>
              <Badge variant="orange" size="sm">LIVE SURGE</Badge>
            </div>
            <p className="text-[10px] text-slate-500">
              Area berpeluang order tertinggi dengan tip & tarif optimal
            </p>
          </div>
        </div>

        <span className="text-[10px] font-black text-orange-600 dark:text-orange-400 bg-orange-500/10 px-2 py-1 rounded-xl">
          🔥 5 Hotspot Aktif
        </span>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
        {[
          { id: "all", label: "Semua Area" },
          { id: "ride", label: "🚆 Stasiun" },
          { id: "market", label: "🥬 Pasar Induk" },
          { id: "food", label: "🛍️ Wisata & Mall" },
          { id: "campus", label: "🎓 Kampus" }
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setSelectedFilter(f.id as any)}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all shrink-0 cursor-pointer ${
              selectedFilter === f.id
                ? "bg-orange-500 text-white shadow-xs"
                : "bg-white dark:bg-white/[0.04] text-slate-600 dark:text-zinc-400 border border-slate-200/60 dark:border-white/10 hover:bg-slate-100"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Hotspots Carousel / Grid */}
      <div className="space-y-2.5">
        {filteredHotspots.map((h) => (
          <motion.div
            key={h.id}
            whileHover={{ y: -1 }}
            className="p-3.5 rounded-2xl bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/[0.08] shadow-xs space-y-2.5"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{h.icon}</span>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                    {h.name}
                  </h4>
                  <span className="text-[10px] text-slate-500 font-bold">
                    Kecamatan {h.district} · {h.bestTime}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-black text-orange-600 dark:text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-lg inline-block">
                  🔥 {h.surgeMultiplier}x Surge
                </span>
                <span className="text-[9px] text-emerald-600 block font-bold mt-0.5">
                  {h.extraIncomeText}
                </span>
              </div>
            </div>

            {/* Quick Actions Row */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-white/[0.04]">
              <span className="text-[10px] text-slate-400 font-semibold">
                ⚡ {h.pendingOrdersCount} Penumpang/Order menunggu
              </span>

              <div className="flex items-center gap-1.5">
                {onSelectHotspotLocation && (
                  <button
                    type="button"
                    onClick={() => onSelectHotspotLocation(h.lat, h.lng)}
                    className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 text-slate-700 dark:text-zinc-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Compass className="h-3 w-3 text-emerald-500" />
                    <span>Fokus Peta</span>
                  </button>
                )}

                <Button
                  size="sm"
                  onClick={() => handleOpenGoogleNavigation(h.lat, h.lng)}
                  className="h-7 px-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-[10px] font-black gap-1 cursor-pointer shadow-xs"
                >
                  <Navigation className="h-3 w-3" />
                  <span>Arahkan GPS</span>
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
