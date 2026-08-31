"use client";

import React from "react";
import { LocationPoint } from "@/types/order.types";
import { History, MapPin } from "lucide-react";
import { useRecentDestinations } from "@/hooks/useRecentDestinations";

interface RecentDestinationsListProps {
  onSelect: (location: LocationPoint) => void;
  className?: string;
}

export function RecentDestinationsList({ onSelect, className = "" }: RecentDestinationsListProps) {
  const { recentDestinations } = useRecentDestinations();

  if (!recentDestinations || recentDestinations.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center gap-1.5 px-2">
        <History className="h-3 w-3 text-slate-400" />
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Terakhir Dicari
        </span>
      </div>
      <div className="flex flex-col gap-1">
        {recentDestinations.map((addr, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelect(addr)}
            className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-white dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800 text-left hover:border-emerald-300 dark:hover:border-emerald-500/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all group"
          >
            <div className="mt-0.5 p-1 bg-slate-100 dark:bg-zinc-700 rounded-md text-slate-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              <MapPin className="h-3.5 w-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-700 dark:text-zinc-200 truncate">
                {addr.address.split(",")[0] || "Lokasi Tersimpan"}
              </p>
              <p className="text-[9px] text-slate-500 dark:text-zinc-400 truncate">
                {addr.address}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
