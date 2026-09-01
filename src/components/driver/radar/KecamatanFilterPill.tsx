"use client";

import React from "react";
import { SOLO_DISTRICTS, SoloDistrict } from "@/constants/geofencing";
import { MapPin, Navigation, Compass } from "lucide-react";

interface KecamatanFilterPillProps {
  selectedDistrictId: string;
  onSelectDistrict: (districtId: string) => void;
  className?: string;
}

export function KecamatanFilterPill({
  selectedDistrictId,
  onSelectDistrict,
  className = ""
}: KecamatanFilterPillProps) {
  return (
    <div className={`flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 px-1 ${className}`}>
      {/* "Semua Solo" Option */}
      <button
        type="button"
        onClick={() => onSelectDistrict("all")}
        className={`px-3 py-1.5 rounded-full text-xs font-black transition-all duration-200 whitespace-nowrap flex items-center gap-1.5 cursor-pointer shadow-xs border ${
          selectedDistrictId === "all"
            ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-md scale-105"
            : "bg-white/80 dark:bg-[#0c1220]/80 backdrop-blur-md text-slate-600 dark:text-zinc-400 border-slate-200/80 dark:border-white/10 hover:border-slate-300"
        }`}
      >
        <Compass className="h-3.5 w-3.5 text-emerald-500" />
        <span>Semua Solo (5 Kecamatan)</span>
      </button>

      {/* 5 Solo Districts */}
      {SOLO_DISTRICTS.map((dist) => {
        const isSelected = selectedDistrictId === dist.id;

        return (
          <button
            key={dist.id}
            type="button"
            onClick={() => onSelectDistrict(dist.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 whitespace-nowrap flex items-center gap-1.5 cursor-pointer shadow-xs border ${
              isSelected
                ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20 scale-105"
                : "bg-white/80 dark:bg-[#0c1220]/80 backdrop-blur-md text-slate-600 dark:text-zinc-400 border-slate-200/80 dark:border-white/10 hover:border-slate-300"
            }`}
          >
            <MapPin className={`h-3.5 w-3.5 ${isSelected ? "text-white" : "text-emerald-500"}`} />
            <span>{dist.shortName}</span>
            <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-black ${
              isSelected ? "bg-white/20 text-white" : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
            }`}>
              ~{dist.estimatedOrdersPerHour}/j
            </span>
          </button>
        );
      })}
    </div>
  );
}
