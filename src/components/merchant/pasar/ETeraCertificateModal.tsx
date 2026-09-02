"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, 
  Scale, 
  CheckCircle2, 
  Download, 
  Award,
  X
} from "lucide-react";
import { SoloAppLogoIcon } from "@/components/icons";
import { toast } from "@/components/ui/toast";

interface ETeraCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  marketName?: string;
  stallName?: string;
  teraNumber?: string;
  validUntil?: string;
}

export function ETeraCertificateModal({
  isOpen,
  onClose,
  marketName = "Pasar Gede Hardjonagoro",
  stallName = "Lapak Pedagang Terverifikasi",
  teraNumber = "SK-TERA/2026/DISDAG/SLO-0842",
  validUntil = "31 Desember 2026"
}: ETeraCertificateModalProps) {
  const handleDownloadCertificate = () => {
    toast.success("Mengunduh Piagam Tera Metrologi Legal Digital", {
      description: `Sertifikat ${teraNumber} tersimpan di perangkat.`
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="w-full max-w-md bg-white dark:bg-[#0c1220] rounded-[2rem] shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden"
          >
            {/* Modal Title Header */}
            <div className="p-4 border-b border-slate-100 dark:border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Sertifikat E-Tera Metrologi Legal
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Hologram Badge Header */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-5 text-white shadow-lg space-y-3">
                <div className="absolute right-[-10px] top-[-10px] opacity-15 pointer-events-none">
                  <SoloAppLogoIcon size={140} />
                </div>

                <div className="flex items-center justify-between gap-2 relative z-10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
                      <Scale className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-100 block">
                        DINAS PERDAGANGAN KOTA SURAKARTA
                      </span>
                      <h4 className="text-sm font-black tracking-tight">UPTD Metrologi Legal</h4>
                    </div>
                  </div>

                  <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-md text-[10px] font-bold">
                    SERTIFIKASI SAH
                  </Badge>
                </div>

                <div className="p-3 rounded-xl bg-black/20 backdrop-blur-sm border border-white/10 space-y-1 relative z-10">
                  <div className="text-[11px] text-emerald-100 font-medium">Nomor Tera Sah:</div>
                  <div className="font-mono text-sm font-black text-white tracking-wide">{teraNumber}</div>
                </div>
              </div>

              {/* Certificate Data Summary */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 space-y-3">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200 dark:border-zinc-700">
                  <span className="text-slate-500 dark:text-zinc-400 font-medium">Lokasi Pasar:</span>
                  <span className="font-bold text-slate-800 dark:text-zinc-100">{marketName}</span>
                </div>

                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200 dark:border-zinc-700">
                  <span className="text-slate-500 dark:text-zinc-400 font-medium">Lapak / Komoditas:</span>
                  <span className="font-bold text-slate-800 dark:text-zinc-100">{stallName}</span>
                </div>

                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200 dark:border-zinc-700">
                  <span className="text-slate-500 dark:text-zinc-400 font-medium">Tipe Alat Ukur:</span>
                  <span className="font-bold text-teal-600 dark:text-teal-400">Timbangan Digital Presisi (UTTP)</span>
                </div>

                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200 dark:border-zinc-700">
                  <span className="text-slate-500 dark:text-zinc-400 font-medium">Masa Berlaku Cap Tera:</span>
                  <span className="font-bold text-slate-800 dark:text-zinc-100">{validUntil}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-zinc-400 font-medium">Status Pengawasan:</span>
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Tera Ulang Tertib Ukur
                  </span>
                </div>
              </div>

              {/* Consumer Guarantee Banner */}
              <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs text-teal-800 dark:text-teal-300 flex items-start gap-2.5">
                <Award className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Jaminan Timbangan Pas:</strong> Pedagang di pasar ini telah melalui kalibrasi berkala oleh Pengawas Kemetrologian Disdag Surakarta demi transaksi yang jujur, berkah, dan adil.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl text-xs font-bold"
                  onClick={handleDownloadCertificate}
                >
                  <Download className="w-4 h-4 mr-1.5" />
                  Unduh Piagam
                </Button>

                <Button
                  variant="default"
                  className="flex-1 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold"
                  onClick={onClose}
                >
                  Tutup
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
