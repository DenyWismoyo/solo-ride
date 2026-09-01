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
  Compass
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

      {/* Hotspots Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sortedHotspots.slice(0, 6).map((hotspot, idx) => {
          const distanceKm = driverLocation 
            ? calculateDistanceKm(driverLocation.lat, driverLocation.lng, hotspot.lat, hotspot.lng)
            : null;

          return (
            <div
              key={hotspot.id}
              onClick={() => onFocusHotspot(hotspot)}
              className="p-4 rounded-[1.75rem] bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/[0.08] hover:border-emerald-500/50 dark:hover:border-emerald-500/40 shadow-xs transition-all duration-200 cursor-pointer space-y-3 group hover:scale-[1.01]"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                    idx === 0 ? "bg-rose-500/15 text-rose-600 border border-rose-500/30" :
                    idx === 1 ? "bg-amber-500/15 text-amber-600 border border-amber-500/30" :
                    "bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-zinc-400"
                  }`}>
                    #{idx + 1}
                  </span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {hotspot.name}
                    </h4>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400">
                      Kecamatan {SOLO_DISTRICTS.find(d => d.id === hotspot.districtId)?.shortName}
                    </span>
                  </div>
                </div>

                <Badge 
                  variant={hotspot.demandLevel === "Sangat Tinggi" ? "rose" : "amber"} 
                  size="sm"
                  className="font-bold text-[9px] shrink-0"
                >
                  {hotspot.demandLevel === "Sangat Tinggi" ? "🔥 Ramai" : "⚡ Sedang"}
                </Badge>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] text-[11px]">
                <div>
                  <span className="text-[9px] text-slate-400 block font-semibold">Estimasi Order:</span>
                  <span className="font-bold text-slate-800 dark:text-zinc-200">
                    ~{hotspot.ordersPerHour} order/jam
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block font-semibold">Jarak dari GPS:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {distanceKm !== null ? formatDistance(distanceKm) : "Aktifkan GPS"}
                  </span>
                </div>
              </div>

              {/* Basecamp info & CTA */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 pt-1">
                <span className="truncate max-w-[190px] text-[10px]">
                  📍 {hotspot.recommendedBasecamp}
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[10px] flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform shrink-0">
                  <span>Fokus</span>
                  <ChevronRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
