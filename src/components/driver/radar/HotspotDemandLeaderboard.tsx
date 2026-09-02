"use client";

import React, { useMemo } from "react";
import { DEMAND_HOTSPOTS_SOLO, DemandHotspot, calculateDistanceKm, formatDistance, SOLO_DISTRICTS } from "@/constants/geofencing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Flame, 
  MapPin, 
  Clock, 
  Navigation, 
  Sparkles, 
  ChevronRight, 
  TrendingUp, 
  Compass, 
  Building2, 
  Store, 
  Train, 
  GraduationCap, 
  Hospital 
} from "lucide-react";

interface HotspotDemandLeaderboardProps {
  driverLocation: { lat: number; lng: number } | null;
  selectedDistrictId: string;
  onFocusHotspot: (hotspot: DemandHotspot) => void;
}

export function HotspotDemandLeaderboard({
  driverLocation,
  selectedDistrictId,
  onFocusHotspot
}: HotspotDemandLeaderboardProps) {
  // Sort hotspots by distance if driver location available, otherwise by weight/demand
  const sortedHotspots = useMemo(() => {
    let list = [...DEMAND_HOTSPOTS_SOLO];

    if (selectedDistrictId !== "all") {
      list = list.filter(h => h.districtId === selectedDistrictId);
    }

    if (driverLocation) {
      return list.sort((a, b) => {
        const distA = calculateDistanceKm(driverLocation.lat, driverLocation.lng, a.lat, a.lng);
        const distB = calculateDistanceKm(driverLocation.lat, driverLocation.lng, b.lat, b.lng);
        return distA - distB;
      });
    }

    return list.sort((a, b) => b.weight - a.weight);
  }, [driverLocation, selectedDistrictId]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "transport":
        return "🚉";
      case "campus":
        return "🎓";
      case "market":
        return "🏪";
      case "mall":
        return "🏬";
      case "hospital":
        return "🏥";
      case "tourism":
      default:
        return "🏟️";
    }
  };

  return (
    <div className="space-y-3.5">
      {/* Header Banner */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse" />
          <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-1.5">
            <span>Radar Titik Panas Demand Solo</span>
            <Badge variant="rose" size="sm" className="text-[9px] font-black">LIVE</Badge>
          </h3>
        </div>
        <span className="text-[11px] text-slate-400 font-medium">
          {sortedHotspots.length} Zona Terpantau
        </span>
      </div>

      {/* Vertical Card List */}
      <div className="flex flex-col gap-3">
        {sortedHotspots.map((hotspot, idx) => {
          const distanceKm = driverLocation 
            ? calculateDistanceKm(driverLocation.lat, driverLocation.lng, hotspot.lat, hotspot.lng)
            : null;
          
          const district = SOLO_DISTRICTS.find(d => d.id === hotspot.districtId);
          const isTopRank = idx < 3;

          return (
            <div
              key={hotspot.id}
              onClick={() => onFocusHotspot(hotspot)}
              className="p-4 sm:p-5 rounded-[2rem] bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/[0.08] hover:border-emerald-500/50 dark:hover:border-emerald-500/40 shadow-xs transition-all duration-200 cursor-pointer space-y-3 group hover:scale-[1.01]"
            >
              {/* Top Row: Rank Number, Title, and Demand Badge */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  {/* Rank Badge + Category Emoji */}
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg shrink-0 transition-transform group-hover:scale-105 shadow-xs ${
                    idx === 0 
                      ? "bg-rose-500/15 text-rose-600 border border-rose-500/30 dark:bg-rose-950/40" 
                      : idx === 1 
                      ? "bg-amber-500/15 text-amber-600 border border-amber-500/30 dark:bg-amber-950/40" 
                      : idx === 2
                      ? "bg-blue-500/15 text-blue-600 border border-blue-500/30 dark:bg-blue-950/40"
                      : "bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-zinc-400 border border-slate-200/60 dark:border-white/[0.04]"
                  }`}>
                    <span>{getCategoryIcon(hotspot.category)}</span>
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-md ${
                        idx === 0 ? "bg-rose-500 text-white" :
                        idx === 1 ? "bg-amber-500 text-white" :
                        idx === 2 ? "bg-blue-600 text-white" :
                        "bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300"
                      }`}>
                        #{idx + 1}
                      </span>
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug">
                        {hotspot.name}
                      </h4>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                      <span>Kecamatan {district?.shortName || "Solo"}</span>
                      <span>•</span>
                      <span className="truncate max-w-[180px] sm:max-w-none text-slate-600 dark:text-zinc-300">
                        📍 {hotspot.recommendedBasecamp}
                      </span>
                    </p>
                  </div>
                </div>

                <Badge 
                  variant={hotspot.demandLevel === "Sangat Tinggi" ? "rose" : "amber"} 
                  size="sm"
                  className="font-black text-[10px] shrink-0 gap-1"
                >
                  <span>{hotspot.demandLevel === "Sangat Tinggi" ? "🔥" : "⚡"}</span>
                  <span>{hotspot.demandLevel}</span>
                </Badge>
              </div>

              {/* Bottom Row: Metric Stats + Focus Action */}
              <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-slate-100 dark:border-white/[0.04]">
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  {/* Estimated Orders */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.04]">
                    <span className="text-[10px] text-slate-400 font-semibold">Estimasi:</span>
                    <span className="font-bold text-slate-800 dark:text-zinc-200 text-[11px]">
                      ~{hotspot.ordersPerHour} order/jam
                    </span>
                  </div>

                  {/* GPS Distance */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/20">
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">Jarak:</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-[11px]">
                      {distanceKm !== null ? formatDistance(distanceKm) : "Cek GPS"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-xs group-hover:translate-x-1 transition-transform shrink-0">
                  <span className="hidden sm:inline">Fokus Peta</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
