"use client";

import React from "react";
import { SubsidyVoucherMetadata } from "@/types/civic.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Ticket, 
  Store, 
  MapPin, 
  Calendar, 
  CheckCircle2,
  Coins,
  QrCode
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";

interface SubsidyVoucherCardProps {
  data: SubsidyVoucherMetadata;
  serviceTitle: string;
  orderId: string;
  className?: string;
}

export function SubsidyVoucherCard({
  data,
  serviceTitle,
  orderId,
  className = ""
}: SubsidyVoucherCardProps) {
  return (
    <div className={`relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-amber-500/10 via-slate-50 to-white dark:from-amber-950/30 dark:via-[#0c1220] dark:to-[#0c1220] border-2 border-amber-500/30 dark:border-amber-500/30 p-5 sm:p-6 shadow-lg space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center text-2xl shrink-0 shadow-inner">
            🎟️
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
              VOUCHER BANTUAN RESMI PEMKOT
            </span>
            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
              {data.programName || serviceTitle}
            </h3>
          </div>
        </div>

        <Badge variant={data.isRedeemed ? "outline" : "amber"} size="sm" className="font-bold">
          {data.isRedeemed ? "Sudah Ditukar" : "Siap Ditukar"}
        </Badge>
      </div>

      {/* Voucher Value & Barcode Area */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#070b14] border border-slate-200/80 dark:border-white/10 space-y-3 text-center shadow-xs">
        <div>
          <span className="text-[10px] text-slate-400 font-semibold block">Nominal Nilai Bantuan Subsidi:</span>
          <span className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">
            {formatRupiah(data.subsidyAmount || 150000)}
          </span>
        </div>

        {/* Barcode & Code */}
        <div className="p-3 bg-amber-50/70 dark:bg-amber-950/20 rounded-xl border border-amber-500/20 space-y-1.5 inline-block w-full">
          {/* Simulated Barcode Lines */}
          <div className="h-10 flex items-center justify-center gap-1 opacity-85">
            {[4, 2, 6, 2, 4, 8, 2, 4, 6, 2, 4, 8, 4, 2, 6, 2, 4, 2, 6, 4, 8, 2, 4, 6].map((w, i) => (
              <div key={i} className={`bg-slate-900 dark:bg-white h-8 w-[${w}px] rounded-xs`} style={{ width: `${w}px` }} />
            ))}
          </div>
          <span className="font-mono text-xs sm:text-sm font-black tracking-widest text-slate-800 dark:text-zinc-200 block">
            {data.voucherCode || `VCH-SOLO-${orderId.slice(0, 8).toUpperCase()}`}
          </span>
        </div>
      </div>

      {/* Redeem Locations */}
      <div className="space-y-1.5 text-xs">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-zinc-300">
          <Store className="h-3.5 w-3.5 text-amber-500" />
          <span>Lokasi Penukaran Voucher:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(data.redeemLocations || ["Pasar Gede Surakarta", "Pasar Klewer", "Koperasi Mitra Solo"]).map((loc, i) => (
            <span key={i} className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20">
              {loc}
            </span>
          ))}
        </div>
        <p className="text-[10px] text-slate-400 mt-1">
          Tunjukkan barcode ini kepada petugas loket pasar atau kasir koperasi saat mengambil sembako/bantuan.
        </p>
      </div>
    </div>
  );
}
