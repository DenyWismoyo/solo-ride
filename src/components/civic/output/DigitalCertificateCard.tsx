"use client";

import React from "react";
import { DigitalCertificateMetadata } from "@/types/civic.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileCheck2, 
  QrCode, 
  Download, 
  ExternalLink, 
  ShieldCheck, 
  Calendar,
  Building2,
  CheckCircle2,
  Lock
} from "lucide-react";
import { SoloAppLogoIcon } from "@/components/icons";

import { toast } from "@/components/ui/toast";

interface DigitalCertificateCardProps {
  data: DigitalCertificateMetadata;
  serviceTitle: string;
  customerName?: string;
  orderId: string;
  className?: string;
}

export function DigitalCertificateCard({
  data,
  serviceTitle,
  customerName,
  orderId,
  className = ""
}: DigitalCertificateCardProps) {
  const handleDownload = () => {
    toast.success(`Mengunduh dokumen resmi: ${data.certificateNumber}.pdf`, {
      description: "Dokumen terenkripsi & tervalidasi tanda tangan elektronik Pemkot Surakarta."
    });
  };


  return (
    <div className={`relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-white via-slate-50 to-teal-50/40 dark:from-[#0c1220] dark:via-[#0c1220] dark:to-teal-950/20 border-2 border-teal-500/30 dark:border-teal-500/30 p-5 sm:p-6 shadow-lg space-y-4 ${className}`}>
      {/* Watermark Emblem */}
      <div className="absolute right-[-20px] top-[-20px] opacity-5 dark:opacity-10 pointer-events-none">
        <SoloAppLogoIcon size={200} />
      </div>

      {/* Header with Official Badges */}
      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-500/30 flex items-center justify-center text-2xl shrink-0 shadow-inner">
            🏛️
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-teal-700 dark:text-teal-400 block">
              {data.issuerAgency || "Pemerintah Kota Surakarta"}
            </span>
            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight">
              {data.documentTitle || serviceTitle}
            </h3>
          </div>
        </div>

        <Badge variant="teal" size="sm" className="font-bold flex items-center gap-1 shrink-0">
          <ShieldCheck className="h-3 w-3" />
          <span>TERVERIFIKASI</span>
        </Badge>
      </div>

      {/* Certificate Body */}
      <div className="p-4 rounded-2xl bg-white/90 dark:bg-[#070b14]/90 border border-slate-200/80 dark:border-white/10 space-y-3 relative z-10 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-white/[0.06] pb-2.5">
          <div>
            <span className="text-[10px] text-slate-400 font-semibold block">Nomor Registrasi Surat / Sertifikat:</span>
            <span className="font-mono text-xs sm:text-sm font-black text-teal-700 dark:text-teal-300">
              {data.certificateNumber}
            </span>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-[10px] text-slate-400 font-semibold block">Tanggal Terbit:</span>
            <span className="text-xs font-bold text-slate-700 dark:text-zinc-200">
              {data.issuedAt || new Date().toLocaleDateString("id-ID", { dateStyle: "long" })}
            </span>
          </div>
        </div>

        {customerName && (
          <div>
            <span className="text-[10px] text-slate-400 font-semibold block">Diberikan Kepada:</span>
            <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
              {customerName}
            </span>
          </div>
        )}

        {/* QR Code Validation Box */}
        <div className="flex items-center gap-3.5 p-3 rounded-xl bg-teal-50/80 dark:bg-teal-950/30 border border-teal-500/20">
          {/* Simulated QR Code */}
          <div className="w-14 h-14 bg-white dark:bg-slate-900 rounded-lg border border-teal-500/30 p-1 flex items-center justify-center shrink-0 shadow-xs">
            <QrCode className="h-full w-full text-teal-700 dark:text-teal-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1 text-[11px] font-bold text-teal-800 dark:text-teal-200">
              <Lock className="h-3 w-3 text-teal-600 dark:text-teal-400" />
              <span>Keabsahan Elektronik Terjamin</span>
            </div>
            <p className="text-[10px] text-slate-600 dark:text-zinc-400 mt-0.5 truncate">
              Ditandatangani secara elektronik oleh {data.signeeName || "Kepala Dinas Terkait"}
            </p>
            <span className="text-[9px] font-mono text-teal-600 dark:text-teal-400 mt-0.5 block">
              Hash: #{orderId.slice(0, 10).toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-1 relative z-10">
        <Button
          onClick={handleDownload}
          className="flex-1 h-11 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs gap-2 shadow-md shadow-teal-500/20 cursor-pointer"
        >
          <Download className="h-4 w-4" />
          <span>Unduh Berkas Resmi (PDF)</span>
        </Button>
      </div>
    </div>
  );
}
