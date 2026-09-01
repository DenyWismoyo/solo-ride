"use client";

import React from "react";
import { DemandHotspot, SOLO_DISTRICTS, formatDistance, calculateDistanceKm } from "@/constants/geofencing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Flame, 
  MapPin, 
  Clock, 
  Navigation, 
  X, 
  Compass, 
  Sparkles, 
  ExternalLink,
  ShieldCheck
} from "lucide-react";

interface HotspotDetailDrawerProps {
  hotspot: DemandHotspot | null;
  driverLocation: { lat: number; lng: number } | null;
  onClose: () => void;
}

export function HotspotDetailDrawer({
  hotspot,
  driverLocation,
  onClose
}: HotspotDetailDrawerProps) {
  if (!hotspot) return null;

  const district = SOLO_DISTRICTS.find(d => d.id === hotspot.districtId);
  const distanceKm = driverLocation 
    ? calculateDistanceKm(driverLocation.lat, driverLocation.lng, hotspot.lat, hotspot.lng)
    : null;

  const handleOpenGoogleMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${hotspot.lat},${hotspot.lng}`;
    window.open(url, "_blank");
  };

  return (
    <div className="fixed inset-x-0 bottom-16 sm:bottom-6 z-40 px-4 flex justify-center pointer-events-none">
      <div className="pointer-events-auto bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/10 rounded-[2rem] p-5 shadow-2xl max-w-lg w-full space-y-4 animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-500/15 text-rose-600 border border-rose-500/30 flex items-center justify-center text-xl shrink-0">
              🔥
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge variant={hotspot.demandLevel === "Sangat Tinggi" ? "rose" : "amber"} size="sm" className="font-bold text-[9px]">
                  {hotspot.demandLevel} Demand
                </Badge>
                <span className="text-[10px] text-slate-400 font-bold">
                  Kecamatan {district?.shortName}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-0.5">
                {hotspot.name}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
          {hotspot.description}
        </p>

        {/* Bento Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.04]">
            <span className="text-[9px] font-bold text-slate-400 block">ESTIMASI</span>
            <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
              ~{hotspot.ordersPerHour}/jam
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.04]">
            <span className="text-[9px] font-bold text-slate-400 block">RESPON</span>
            <span className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400">
              {hotspot.avgPickupWaitMinutes} Menit
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.04]">
            <span className="text-[9px] font-bold text-slate-400 block">JARAK GPS</span>
            <span className="text-xs sm:text-sm font-black font-mono text-blue-600 dark:text-blue-400">
              {distanceKm !== null ? formatDistance(distanceKm) : "-"}
            </span>
          </div>
        </div>

        {/* Recommended Basecamp */}
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-950 dark:text-emerald-300 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="text-[11px] leading-tight">
            <strong>Posko Rekomendasi:</strong> {hotspot.recommendedBasecamp}
          </span>
        </div>

        {/* Action Button */}
        <Button
          onClick={handleOpenGoogleMaps}
          className="w-full h-11 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs gap-2 shadow-lg shadow-black/10 cursor-pointer"
        >
          <Navigation className="h-4 w-4 text-emerald-500" />
          <span>Navigasi Rute Menuju Hotspot</span>
          <ExternalLink className="h-3.5 w-3.5 opacity-60" />
        </Button>
      </div>
    </div>
  );
}
