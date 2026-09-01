"use client";

import React from "react";
import { EmergencyDispatchMetadata } from "@/types/civic.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Siren, 
  Phone, 
  Clock, 
  MapPin, 
  ShieldAlert, 
  Radio, 
  CheckCircle2,
  Navigation
} from "lucide-react";

interface EmergencyDispatchCardProps {
  data: EmergencyDispatchMetadata;
  serviceTitle: string;
  orderId: string;
  className?: string;
}

export function EmergencyDispatchCard({
  data,
  serviceTitle,
  orderId,
  className = ""
}: EmergencyDispatchCardProps) {
  const statusLabels: Record<string, { label: string; color: string; badge: "rose" | "blue" | "amber" | "emerald" }> = {
    dispatched: { label: "Regu Meluncur ke Lokasi", color: "text-rose-600 dark:text-rose-400", badge: "rose" },
    on_scene: { label: "Regu Tiba di Tempat Kejadian", color: "text-blue-600 dark:text-blue-400", badge: "blue" },
    handling: { label: "Penanganan Sedang Berlangsung", color: "text-amber-600 dark:text-amber-400", badge: "amber" },
    resolved: { label: "Penanganan Darurat Selesai", color: "text-emerald-600 dark:text-emerald-400", badge: "emerald" },
  };

  const current = statusLabels[data.currentStatus] || statusLabels.dispatched;

  return (
    <div className={`relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-rose-500/15 via-slate-50 to-white dark:from-rose-950/40 dark:via-[#0c1220] dark:to-[#0c1220] border-2 border-rose-500/40 dark:border-rose-500/30 p-5 sm:p-6 shadow-xl space-y-4 ${className}`}>
      {/* Top Emergency Beacon */}
      <div className="flex items-center justify-between gap-2 border-b border-rose-500/20 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping absolute" />
            <div className="w-3 h-3 rounded-full bg-rose-600 relative z-10" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
            KOMANDO SIAGA DARURAT 24 JAM
          </span>
        </div>

        <Badge variant={current.badge} size="sm" className="font-black animate-pulse">
          {current.label}
        </Badge>
      </div>

      {/* Dispatch Unit Info */}
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center justify-center text-2xl shrink-0 shadow-inner">
          🚨
        </div>
        <div className="space-y-1">
          <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
            {data.unitName || serviceTitle}
          </h3>
          <p className="text-xs text-slate-600 dark:text-zinc-300 font-medium">
            Komandan Regu: <strong className="text-slate-900 dark:text-white">{data.commanderName || "Petugas Jaga Mako"}</strong>
          </p>
          <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
            <Clock className="h-3.5 w-3.5 text-rose-500" />
            <span>Target Respons SLA: {data.slaTargetMinutes || 15} Menit Menuju Lokasi</span>
          </p>
        </div>
      </div>

      {/* Live SLA & Instructions */}
      <div className="p-3.5 rounded-2xl bg-rose-50/80 dark:bg-rose-950/20 border border-rose-500/20 space-y-2 text-xs">
        <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-bold">
          <Radio className="h-4 w-4 animate-spin text-rose-600" />
          <span>Frekuensi Radio & GPS Unit Terkoneksi</span>
        </div>
        <p className="text-[11px] text-slate-600 dark:text-zinc-300 leading-relaxed">
          Tetap tenang dan amankan diri di titik kumpul aman. Regu penyelamat sedang melaju ke titik koordinat GPS yang dilaporkan.
        </p>
      </div>

      {/* Quick Call Action */}
      {data.commanderPhone && (
        <Button
          onClick={() => window.open(`tel:${data.commanderPhone}`, "_self")}
          className="w-full h-11 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs gap-2 shadow-md shadow-rose-500/20 cursor-pointer"
        >
          <Phone className="h-4 w-4" />
          <span>Hubungi Komandan Regu Darurat</span>
        </Button>
      )}
    </div>
  );
}
