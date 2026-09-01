"use client";

import React from "react";
import { FieldVisitMetadata } from "@/types/civic.types";
import { Badge } from "@/components/ui/badge";
import { 
  UserCheck, 
  Calendar, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  FileCheck 
} from "lucide-react";

interface FieldVisitCardProps {
  data: FieldVisitMetadata;
  serviceTitle: string;
  orderId: string;
  className?: string;
}

export function FieldVisitCard({
  data,
  serviceTitle,
  orderId,
  className = ""
}: FieldVisitCardProps) {
  return (
    <div className={`relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-500/10 via-slate-50 to-white dark:from-blue-950/30 dark:via-[#0c1220] dark:to-[#0c1220] border-2 border-blue-500/30 dark:border-blue-500/30 p-5 sm:p-6 shadow-lg space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 flex items-center justify-center text-2xl shrink-0 shadow-inner">
            🧑‍💼
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-400 block">
              SURAT TUGAS KUNJUNGAN LAPANGAN
            </span>
            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
              {serviceTitle}
            </h3>
          </div>
        </div>

        <Badge variant={data.isCompleted ? "emerald" : "blue"} size="sm" className="font-bold">
          {data.isCompleted ? "Kunjungan Selesai" : "Petugas Ditugaskan"}
        </Badge>
      </div>

      {/* Officer ID & Schedule Card */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#070b14] border border-slate-200/80 dark:border-white/10 space-y-3 shadow-xs">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/[0.06] pb-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold block">Petugas Resmi Ditugaskan:</span>
            <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
              {data.officerName || "Petugas Lapangan Pemkot"}
            </h4>
            {data.officerBadge && (
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono font-bold">
                KTA / Lencana: {data.officerBadge}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04]">
            <span className="text-[10px] text-slate-400 font-semibold block flex items-center gap-1">
              <Calendar className="h-3 w-3 text-blue-500" />
              <span>Tanggal Kunjungan:</span>
            </span>
            <span className="font-bold text-slate-800 dark:text-zinc-200">
              {data.scheduledDate || "Sesuai Jadwal"}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04]">
            <span className="text-[10px] text-slate-400 font-semibold block flex items-center gap-1">
              <Clock className="h-3 w-3 text-blue-500" />
              <span>Estimasi Waktu:</span>
            </span>
            <span className="font-bold text-slate-800 dark:text-zinc-200">
              {data.scheduledTimeWindow || "09.00 - 12.00 WIB"}
            </span>
          </div>
        </div>

        {data.purpose && (
          <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
            <strong className="text-slate-700 dark:text-zinc-300">Tujuan Kunjungan:</strong> {data.purpose}
          </p>
        )}
      </div>

      <div className="p-3 bg-blue-50/70 dark:bg-blue-950/20 rounded-xl border border-blue-500/20 text-[11px] text-slate-600 dark:text-zinc-300 flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0" />
        <span>Pastikan petugas menunjukkan KTA/Lencana resmi sebelum memberikan akses ke lokasi rumah Anda.</span>
      </div>
    </div>
  );
}
