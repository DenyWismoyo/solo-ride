"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  QrCode, 
  Clock, 
  ShieldCheck, 
  Copy, 
  CheckCircle2, 
  X, 
  Loader2, 
  Sparkles,
  Building2
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { paymentService, DynamicQrisPayload } from "@/services/payment.service";
import { toast } from "@/components/ui/toast";
import { playSuccessChime } from "@/lib/sound";

interface DynamicQrisModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  amount: number;
  merchantName?: string;
  serviceType?: string;
  onPaymentSuccess?: () => void;
}

export function DynamicQrisModal({
  isOpen,
  onClose,
  orderId,
  amount,
  merchantName = "Koperasi Solo Bersama",
  serviceType = "pasar",
  onPaymentSuccess,
}: DynamicQrisModalProps) {
  const [qrisData, setQrisData] = useState<DynamicQrisPayload | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(300); // 5 minutes in seconds
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isOpen && orderId && amount > 0) {
      const payload = paymentService.generateDynamicQRIS(orderId, amount, merchantName, serviceType);
      setQrisData(payload);
      setTimeLeft(300);
    }
  }, [isOpen, orderId, amount, merchantName, serviceType]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, timeLeft]);

  if (!isOpen || !qrisData) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  const handleCopyQris = () => {
    if (qrisData?.qrisString) {
      navigator.clipboard.writeText(qrisData.qrisString);
      setIsCopied(true);
      toast.info("Kode string QRIS berhasil disalin ke clipboard.", "Disalin");
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const handleSimulatePayment = async () => {
    setIsVerifying(true);
    try {
      await paymentService.simulateWebhookPayment(orderId, qrisData.referenceId);
      playSuccessChime();
      toast.success(`Pembayaran ${formatRupiah(amount)} Lunas via QRIS Koperasi!`, "Pembayaran Berhasil");
      if (onPaymentSuccess) {
        onPaymentSuccess();
      }
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Gagal verifikasi pembayaran", "Error");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="sg-bento-card max-w-md w-full bg-white dark:bg-[#0c1220] rounded-t-3xl sm:rounded-3xl shadow-2xl border-emerald-500/20 overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-white/[0.06] flex items-center justify-between bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  QRIS Dinamis Koperasi
                </h3>
                <Badge variant="emerald" size="sm">0% Admin Fee</Badge>
              </div>
              <p className="text-[11px] text-slate-500">
                {merchantName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-center">
          {/* Amount Tag */}
          <div className="bg-slate-50 dark:bg-white/[0.03] p-3 rounded-2xl border border-slate-200 dark:border-white/[0.06] flex items-center justify-between">
            <div className="text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Tagihan</span>
              <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                {formatRupiah(amount)}
              </p>
            </div>
            <div className="text-right flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 rounded-xl text-amber-600 dark:text-amber-400 text-xs font-mono font-bold">
              <Clock className="w-3.5 h-3.5" />
              <span>{formattedTime}</span>
            </div>
          </div>

          {/* QR Code Canvas Mock View */}
          <div className="bg-white p-4 rounded-3xl border-2 border-dashed border-emerald-500/30 shadow-inner flex flex-col items-center justify-center max-w-[240px] mx-auto relative group">
            {/* National QRIS Header Badge */}
            <div className="w-full border-b border-slate-200 pb-2 mb-3 flex items-center justify-between px-1">
              <span className="text-[9px] font-black tracking-widest text-slate-800 uppercase">QRIS</span>
              <span className="text-[8px] font-bold text-slate-500">PEMBAYARAN DIGITAL</span>
            </div>

            {/* Visual SVG QR Matrix Pattern */}
            <div className="w-44 h-44 bg-slate-950 rounded-2xl p-2.5 flex items-center justify-center relative overflow-hidden shadow-sm">
              <div className="absolute inset-2 grid grid-cols-6 grid-rows-6 gap-1 p-1 bg-white rounded-xl">
                {/* Corner Position Boxes */}
                <div className="col-span-2 row-span-2 bg-slate-900 rounded-md p-1">
                  <div className="w-full h-full bg-white rounded-xs p-1 flex items-center justify-center">
                    <div className="w-full h-full bg-slate-900 rounded-2xs" />
                  </div>
                </div>
                <div className="col-span-2 row-span-2" />
                <div className="col-span-2 row-span-2 bg-slate-900 rounded-md p-1">
                  <div className="w-full h-full bg-white rounded-xs p-1 flex items-center justify-center">
                    <div className="w-full h-full bg-slate-900 rounded-2xs" />
                  </div>
                </div>

                {/* Random pseudo QR data dots */}
                <div className="bg-slate-900 rounded-2xs" />
                <div className="bg-slate-900 rounded-2xs" />
                <div className="bg-slate-900 rounded-2xs" />
                <div className="bg-slate-900 rounded-2xs" />
                <div className="bg-slate-900 rounded-2xs" />
                <div className="bg-slate-900 rounded-2xs" />

                {/* Center Badge Icon */}
                <div className="col-span-2 row-span-2 bg-emerald-600 rounded-lg flex items-center justify-center text-white shadow-xs">
                  <Building2 className="w-5 h-5" />
                </div>

                <div className="bg-slate-900 rounded-2xs" />
                <div className="bg-slate-900 rounded-2xs" />
                <div className="bg-slate-900 rounded-2xs" />
                <div className="bg-slate-900 rounded-2xs" />

                <div className="col-span-2 row-span-2 bg-slate-900 rounded-md p-1">
                  <div className="w-full h-full bg-white rounded-xs p-1 flex items-center justify-center">
                    <div className="w-full h-full bg-slate-900 rounded-2xs" />
                  </div>
                </div>
                <div className="col-span-2 row-span-2" />
                <div className="col-span-2 row-span-2 bg-slate-900 rounded-md p-1 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 bg-white rounded-full" />
                </div>
              </div>
            </div>

            <span className="text-[9px] font-mono text-slate-500 mt-2 font-bold">
              NMID: ID1020268892019
            </span>
          </div>

          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleCopyQris}
              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 bg-slate-100 dark:bg-white/[0.04] px-3 py-1.5 rounded-xl cursor-pointer transition-colors"
            >
              {isCopied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? "String QRIS Tersalin" : "Salin String QRIS"}</span>
            </button>
          </div>

          {/* Action Simulation Buttons */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/[0.06]">
            <Button
              type="button"
              onClick={handleSimulatePayment}
              disabled={isVerifying || timeLeft <= 0}
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl cursor-pointer shadow-md shadow-emerald-600/20"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Memverifikasi Webhook Gateway...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-1.5" />
                  Simulasi Bayar Instan (BCA / Mandiri / GoPay)
                </>
              )}
            </Button>
            <p className="text-[10px] text-slate-400">
              Scan dengan aplikasi BCA Mobile, Livin, GoPay, OVO, atau ShopeePay mana saja.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
