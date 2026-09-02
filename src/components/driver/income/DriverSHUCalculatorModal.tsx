"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Calculator, 
  Coins, 
  ShieldCheck, 
  TrendingUp, 
  Award, 
  X, 
  Gift, 
  Sparkles, 
  Building2, 
  Wallet,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DriverSHUCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  driverName?: string;
}

export function DriverSHUCalculatorModal({
  isOpen,
  onClose,
  driverName = "Mitra Driver Solo"
}: DriverSHUCalculatorModalProps) {
  const [activeDays, setActiveDays] = useState<number>(300);
  const [tripsPerDay, setTripsPerDay] = useState<number>(12);
  const averageFarePerTrip = 15000; // Rata-rata tarif per trip di Surakarta

  if (!isOpen) return null;

  // Calculations
  const totalKarcisPaid = activeDays * 5000;
  const totalGrossIncome = activeDays * tripsPerDay * averageFarePerTrip;
  
  // Aplikator besar memotong 25%
  const bigAppDeduction = totalGrossIncome * 0.25;
  const netSavingsVsBigApp = bigAppDeduction - totalKarcisPaid;

  // SHU Koperasi (45% Surplus Alokasi ke Anggota + Voucher Sembako Pasar)
  const estimatedCashSHU = Math.round(totalKarcisPaid * 0.45);
  const pasarVoucherBonus = 250000;
  const totalSHUBenefit = estimatedCashSHU + pasarVoucherBonus;

  // Total Keuntungan Bersih Tambahan yang dinikmati mitra
  const totalDriverExtraProfit = netSavingsVsBigApp + totalSHUBenefit;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="sg-bento-card max-w-lg w-full max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border-amber-500/20 bg-white dark:bg-[#0c1220]"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-white/[0.06] flex items-center justify-between bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Kalkulator Dividen SHU Koperasi
                </h3>
                <Badge variant="amber" size="sm">0% KOMISI</Badge>
              </div>
              <p className="text-[11px] text-slate-500">
                Simulasi bagi hasil tahunan & penghematan nyata tanpa potongan aplikator
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="sg-icon-btn h-8 w-8 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* 1. SLIDER INPUTS */}
          <div className="space-y-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.05]">
            {/* Slider 1: Hari Aktif */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between font-bold">
                <span className="text-slate-700 dark:text-zinc-300">
                  Hari Aktif Narik Karcis (per Tahun):
                </span>
                <span className="text-amber-600 dark:text-amber-400 font-mono text-sm font-black">
                  {activeDays} Hari
                </span>
              </div>
              <input
                type="range"
                min={30}
                max={365}
                step={5}
                value={activeDays}
                onChange={(e) => setActiveDays(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-400">
                <span>30 Hari (Part-time)</span>
                <span>300 Hari (Reguler)</span>
                <span>365 Hari (Full)</span>
              </div>
            </div>

            {/* Slider 2: Trip per Hari */}
            <div className="space-y-1.5 pt-2 border-t border-slate-200/60 dark:border-white/[0.05]">
              <div className="flex items-center justify-between font-bold">
                <span className="text-slate-700 dark:text-zinc-300">
                  Rata-rata Trip Selesai per Hari:
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono text-sm font-black">
                  {tripsPerDay} Trip / Hari
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={30}
                step={1}
                value={tripsPerDay}
                onChange={(e) => setTripsPerDay(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-400">
                <span>5 Trip (Santai)</span>
                <span>12 Trip (Standar)</span>
                <span>25+ Trip (Pahlawan Jalanan)</span>
              </div>
            </div>
          </div>

          {/* 2. SUMMARY HERO CARD */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-xl space-y-3 relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-100 uppercase tracking-wider">
                Total Keuntungan Lebih Mitra Driver
              </span>
              <Badge variant="emerald" size="sm" className="bg-white/20 text-white border-0">
                Koperasi Solo
              </Badge>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                +{formatRupiah(totalDriverExtraProfit)}
              </h2>
              <p className="text-[11px] text-emerald-100 mt-0.5">
                Uang yang tetap di kantong Anda dibanding kena potongan 25% aplikator besar.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/20 text-[11px]">
              <div>
                <span className="text-emerald-200 block text-[9px]">Hemat dari Potongan Fee</span>
                <span className="font-bold text-white">+{formatRupiah(netSavingsVsBigApp)}</span>
              </div>
              <div>
                <span className="text-emerald-200 block text-[9px]">Estimasi Dividen SHU RAT</span>
                <span className="font-bold text-amber-300">+{formatRupiah(totalSHUBenefit)}</span>
              </div>
            </div>
          </div>

          {/* 3. COMPARISON BREAKDOWN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Model Aplikator Besar */}
            <div className="p-3.5 rounded-2xl bg-rose-500/5 dark:bg-rose-950/20 border border-rose-500/20 space-y-2">
              <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold">
                <span className="text-sm">❌</span> Aplikator Korporasi (25%)
              </div>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between text-slate-500">
                  <span>Omset Bruto:</span>
                  <span className="font-bold text-slate-700 dark:text-zinc-300">{formatRupiah(totalGrossIncome)}</span>
                </div>
                <div className="flex justify-between text-rose-600 dark:text-rose-400 font-bold">
                  <span>Dipotong Fee 25%:</span>
                  <span>-{formatRupiah(bigAppDeduction)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Bagi Hasil Akhir Tahun:</span>
                  <span className="font-bold">Rp 0 (Nol)</span>
                </div>
              </div>
            </div>

            {/* Model Koperasi Ride-Solo */}
            <div className="p-3.5 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 space-y-2">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                <span className="text-sm">✅</span> Koperasi Ride-Solo (Karcis)
              </div>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between text-slate-500">
                  <span>Biaya Karcis Flat:</span>
                  <span className="font-bold text-slate-700 dark:text-zinc-300">{formatRupiah(totalKarcisPaid)}</span>
                </div>
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                  <span>Take Home Tunai:</span>
                  <span>100% Bersih</span>
                </div>
                <div className="flex justify-between text-amber-600 dark:text-amber-400 font-bold">
                  <span>Dividen SHU Koperasi:</span>
                  <span>+{formatRupiah(totalSHUBenefit)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. KOPERASI PHILOSOPHY FOOTNOTE */}
          <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/15 flex items-start gap-2.5 text-[11px] text-slate-600 dark:text-zinc-400">
            <Sparkles className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              * Dana karcis Rp 5.000/hari dikelola oleh Koperasi Mitra Surakarta untuk santunan kecelakaan, subsidi sembako pasar, dan 45% dikembalikan sebagai <strong>SHU Tahunan</strong> kepada seluruh driver yang aktif.
            </p>
          </div>
        </div>

        {/* Footer Close */}
        <div className="p-4 border-t border-slate-100 dark:border-white/[0.06]">
          <Button
            onClick={onClose}
            className="w-full h-11 text-xs font-black rounded-2xl bg-amber-600 hover:bg-amber-500 text-white cursor-pointer shadow-md"
          >
            Tutup Simulasi
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
