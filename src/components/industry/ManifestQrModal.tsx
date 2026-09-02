"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  FileText, 
  X, 
  QrCode, 
  Printer, 
  CheckCircle2, 
  Truck, 
  MapPin, 
  Building2, 
  ShieldCheck, 
  Copy, 
  Share2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OrderDocument } from "@/types/order.types";
import { toast } from "@/components/ui/toast";

interface ManifestQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderDocument | null;
  sectorName?: string;
}

export function ManifestQrModal({
  isOpen,
  onClose,
  order,
  sectorName = "Kargo & Distribusi B2B Solo"
}: ManifestQrModalProps) {
  const [copied, setCopied] = useState(false);

  if (!order) return null;

  const manifestNo = `MNF-${order.id?.slice(0, 6).toUpperCase() || "7821"}/${new Date().getFullYear()}/SLO-B2B`;
  const qrMockData = `RIDE-SOLO-MANIFEST|${order.id}|${manifestNo}|${order.customerName}|SURAKARTA`;
  const qrSvgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrMockData)}`;

  const handleCopyManifest = () => {
    navigator.clipboard.writeText(`SURAT JALAN DIGITAL RIDE-SOLO\nNo: ${manifestNo}\nLayanan: ${order.serviceTitle}\nPengirim: ${order.customerName}\nTujuan: ${order.dropoffLocation?.address || "Surakarta"}\nStatus: Siap Diambil Driver`);
    setCopied(true);
    toast.success("No. Manifest Disalin!", {
      description: "Data surat jalan siap dikirimkan ke driver mitra."
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    toast.info("Mencetak Surat Jalan", {
      description: "Mengirim dokumen manifest ke antrean printer kasir..."
    });
    window.print();
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
            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-white/[0.08] flex items-center justify-between bg-teal-500/10">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-teal-500/20 text-teal-600 dark:text-teal-400">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    Surat Jalan Digital (Manifest B2B)
                  </h3>
                  <p className="text-[10px] text-slate-500">{sectorName}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Manifest Card Header */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-700/80 text-center space-y-2">
                <Badge variant="teal" size="sm" className="font-mono text-[10px]">
                  {manifestNo}
                </Badge>
                <div className="text-sm font-black text-slate-900 dark:text-white">
                  {order.serviceTitle || "Pengiriman Logistik Pabrik"}
                </div>
                <div className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>Terverifikasi Sistem Koperasi Surakarta</span>
                </div>
              </div>

              {/* QR Code Serah Terima */}
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-inner space-y-2">
                <img
                  src={qrSvgUrl}
                  alt="QR Manifest"
                  className="w-36 h-36 rounded-xl border border-slate-100 dark:border-zinc-700"
                />
                <span className="text-[10px] text-slate-400 font-mono tracking-wider">
                  SCAN UNTUK SERAH TERIMA MUATAN
                </span>
              </div>

              {/* Logistics Points */}
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                    <Building2 className="w-3.5 h-3.5 text-teal-500" />
                    <span>Asal Pabrik / Distributor:</span>
                  </div>
                  <p className="font-bold text-slate-800 dark:text-zinc-200 truncate">
                    {order.pickupLocation?.address || "Kawasan Industri Palur / Pergudangan Solo"}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>Tujuan Merchant / Depo:</span>
                  </div>
                  <p className="font-bold text-slate-800 dark:text-zinc-200 truncate">
                    {order.dropoffLocation?.address || "Pusat Grosir Solo (PGS) & Pasar Tradisional"}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-white/[0.06]">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyManifest}
                  className="rounded-xl text-xs font-bold h-9 gap-1.5 cursor-pointer border-slate-200 dark:border-zinc-700"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? "Tersalin!" : "Salin Manifest"}</span>
                </Button>

                <Button
                  size="sm"
                  onClick={handlePrint}
                  className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold h-9 gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Dokumen</span>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
