"use client";

import React from "react";
import { CivicTicketMetadata } from "@/types/civic.types";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  ShieldCheck, 
  Tag 
} from "lucide-react";

interface CivicTicketCardProps {
  data: CivicTicketMetadata;
  serviceTitle: string;
  orderId: string;
  className?: string;
}

export function CivicTicketCard({
  data,
  serviceTitle,
  orderId,
  className = ""
}: CivicTicketCardProps) {
  return (
    <div className={`relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-purple-500/10 via-slate-50 to-white dark:from-purple-950/30 dark:via-[#0c1220] dark:to-[#0c1220] border-2 border-purple-500/30 dark:border-purple-500/30 p-5 sm:p-6 shadow-lg space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 flex items-center justify-center text-2xl shrink-0 shadow-inner">
            🎫
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-400 block">
              TIKET LAYANAN / ADUAN PUBLIK
            </span>
            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
              {serviceTitle}
            </h3>
          </div>
        </div>

        <Badge variant="blue" size="sm" className="font-bold">
          Prioritas: {data.priority?.toUpperCase() || "NORMAL"}
        </Badge>
      </div>

      {/* Ticket Box */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#070b14] border border-slate-200/80 dark:border-white/10 space-y-3 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-2.5">
          <div>
            <span className="text-[10px] text-slate-400 font-semibold block">Nomor Registrasi Tiket:</span>
            <span className="font-mono text-xs sm:text-sm font-black text-purple-700 dark:text-purple-300">
              {data.ticketNumber || `TKT-SOLO-${orderId.slice(0, 8).toUpperCase()}`}
            </span>
          </div>
          <span className="text-[10px] bg-purple-500/10 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-md font-bold">
            {data.category || "Publik"}
          </span>
        </div>

        {/* Official Response if available */}
        {data.officialResponse ? (
          <div className="p-3 bg-purple-50/70 dark:bg-purple-950/20 rounded-xl border border-purple-500/20 space-y-1 text-xs">
            <div className="flex items-center gap-1.5 text-purple-800 dark:text-purple-300 font-bold text-[11px]">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Tanggapan Resmi Pejabat OPD ({data.respondedBy || "Petugas Terkait"}):</span>
            </div>
            <p className="text-slate-700 dark:text-zinc-200 leading-relaxed text-[11px]">
              {data.officialResponse}
            </p>
            {data.respondedAt && (
              <span className="text-[9px] text-slate-400 block mt-1">
                Dijawab pada: {data.respondedAt}
              </span>
            )}
          </div>
        ) : (
          <div className="p-3 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-100 dark:border-white/[0.04] text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-2">
            <Clock className="h-4 w-4 text-purple-500 shrink-0" />
            <span>Tiket telah terdisposisi ke dinas terkait dan sedang diproses oleh staf pengkaji.</span>
          </div>
        )}
      </div>
    </div>
  );
}
