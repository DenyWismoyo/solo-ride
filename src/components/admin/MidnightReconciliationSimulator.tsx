"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Clock, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Coins, 
  Users, 
  MessageSquare, 
  Terminal, 
  Settings2, 
  Sparkles, 
  Sliders, 
  Building2, 
  ShieldCheck, 
  Wallet,
  Loader2
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { playSuccessChime } from "@/lib/sound";

interface ExecutionLog {
  timestamp: string;
  step: string;
  detail: string;
  type: "info" | "success" | "warning";
}

interface SimulatedDriverResult {
  driverName: string;
  plate: string;
  onlineHours: number;
  tripsToday: number;
  grossIncome: number;
  karcisStatus: "waived" | "deducted";
  karcisAmount: number;
  shuContribution: number;
}

export function MidnightReconciliationSimulator() {
  // Customizable RAT Cooperative Parameters
  const [shuPercentageRAT, setShuPercentageRAT] = useState<number>(45); // % Alokasi hasil keputusan RAT
  const [flatKarcisRate, setFlatKarcisRate] = useState<number>(5000); // Rp 5.000 / hari
  const [freeThresholdHours, setFreeThresholdHours] = useState<number>(6); // >= 6 Jam online gratis
  const [dailySPHPQuotaSak, setDailySPHPQuotaSak] = useState<number>(2); // 2 Sak (10 kg)

  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [simulatedDrivers, setSimulatedDrivers] = useState<SimulatedDriverResult[]>([]);
  const [summaryStats, setSummaryStats] = useState<{
    totalActiveDrivers: number;
    totalKarcisCollected: number;
    totalSHUAllocated: number;
    totalWaivedDrivers: number;
    totalQuotaReset: number;
  } | null>(null);

  const mockDriversPool: Array<{ name: string; plate: string; hours: number; trips: number }> = [
    { name: "Slamet Raharjo", plate: "AD 4821 QA", hours: 7.5, trips: 14 },
    { name: "Agus Prasetyo", plate: "AD 5902 BZ", hours: 8.0, trips: 18 },
    { name: "Bambang Trihatmodjo", plate: "AD 3110 XY", hours: 4.2, trips: 8 },
    { name: "Eko Supriyanto", plate: "AD 6721 MK", hours: 5.0, trips: 9 },
    { name: "Wahyu Hidayat", plate: "AD 2291 QA", hours: 3.5, trips: 6 },
    { name: "Hendra Gunawan", plate: "AD 9812 BZ", hours: 6.5, trips: 12 }
  ];

  const handleRunMidnightCron = async () => {
    setIsRunning(true);
    setCurrentStep(1);
    setLogs([]);
    setSimulatedDrivers([]);
    setSummaryStats(null);

    const addLog = (step: string, detail: string, type: "info" | "success" | "warning" = "info") => {
      const now = new Date();
      const timeStr = "00:00:" + String(now.getSeconds()).padStart(2, "0") + " WIB";
      setLogs((prev) => [...prev, { timestamp: timeStr, step, detail, type }]);
    };

    // Step 1: Initialize Cron
    addLog("CRON_START", `⏰ Memulai Scheduled Cloud Function: 'scheduledDailyReconciliation' pada 00:00:00 WIB`, "info");
    await new Promise((r) => setTimeout(r, 600));

    // Step 2: Driver Audit & Karcis Evaluation
    setCurrentStep(2);
    addLog("AUDIT_DRIVERS", `🔍 Mengaudit ${mockDriversPool.length} driver aktif hari ini di database Firestore 'ride-solo'...`, "info");
    await new Promise((r) => setTimeout(r, 800));

    let totalKarcis = 0;
    let waivedCount = 0;
    const processed: SimulatedDriverResult[] = [];

    for (const d of mockDriversPool) {
      const isFree = d.hours >= freeThresholdHours;
      const karcisCost = isFree ? 0 : flatKarcisRate;
      const shuPart = Math.round(karcisCost * (shuPercentageRAT / 100));

      if (isFree) {
        waivedCount++;
      } else {
        totalKarcis += karcisCost;
      }

      processed.push({
        driverName: d.name,
        plate: d.plate,
        onlineHours: d.hours,
        tripsToday: d.trips,
        grossIncome: d.trips * 15000,
        karcisStatus: isFree ? "waived" : "deducted",
        karcisAmount: karcisCost,
        shuContribution: shuPart
      });
    }

    setSimulatedDrivers(processed);
    addLog("KARCIS_SETTLED", `✅ Rekonsiliasi karcis selesai: ${waivedCount} Driver Gratis (>=${freeThresholdHours} jam), ${mockDriversPool.length - waivedCount} Driver Terpotong Rp ${flatKarcisRate.toLocaleString("id-ID")}`, "success");
    await new Promise((r) => setTimeout(r, 700));

    // Step 3: Cooperative SHU Allocation (Based on RAT parameter)
    setCurrentStep(3);
    const totalSHU = Math.round(totalKarcis * (shuPercentageRAT / 100));
    addLog("SHU_ALLOCATION", `🏦 Alokasi Kas Koperasi: Total karcis terkumpul ${formatRupiah(totalKarcis)}. Alokasi ${shuPercentageRAT}% (SK RAT Koperasi) = ${formatRupiah(totalSHU)} disetor ke Pos Dividen SHU Anggota.`, "success");
    await new Promise((r) => setTimeout(r, 700));

    // Step 4: SPHP Quota Reset
    setCurrentStep(4);
    addLog("SPHP_RESET", `🌾 Reset kuota harian pasar murah beras SPHP Bulog untuk seluruh NIK terdaftar di Disdag Solo (Maks: ${dailySPHPQuotaSak} sak / 10 kg).`, "info");
    await new Promise((r) => setTimeout(r, 600));

    // Step 5: Push WhatsApp Alert Broadcast
    setCurrentStep(5);
    addLog("WHATSAPP_BROADCAST", `📱 Broadcast WhatsApp ringkasan ledger & dividen SHU harian berhasil dikirim ke ${mockDriversPool.length} driver mitra!`, "success");
    addLog("CRON_COMPLETE", `🎉 Rekonsiliasi harian 00:00 WIB sukses dieksekusi dalam 3.4 detik (Memory: 128 MB).`, "success");

    playSuccessChime();

    setSummaryStats({
      totalActiveDrivers: mockDriversPool.length,
      totalKarcisCollected: totalKarcis,
      totalSHUAllocated: totalSHU,
      totalWaivedDrivers: waivedCount,
      totalQuotaReset: 1480
    });

    setIsRunning(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-700 via-blue-800 to-slate-900 text-white shadow-xl space-y-3 relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-2xl shrink-0 shadow-md">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Simulator Scheduled Cloud Functions (Midnight Cron 00:00 WIB)
                </h2>
                <Badge variant="blue" size="sm" className="bg-white/20 text-white border-0">
                  Firebase Functions
                </Badge>
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                Simulasi pemotongan karcis harian, alokasi SHU hasil RAT Koperasi, dan reset kuota sembako
              </p>
            </div>
          </div>

          <Button
            onClick={handleRunMidnightCron}
            disabled={isRunning}
            className="h-11 px-5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs gap-2 cursor-pointer shadow-lg shrink-0"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Menjalankan Cron...</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-current" />
                <span>Jalankan Cron Tengah Malam (00:00 WIB)</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 1. RAT COOPERATIVE CUSTOMIZABLE SETTINGS */}
      <div className="sg-bento-card p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-3">
          <div className="flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-xs font-black text-slate-900 dark:text-white">
              Parameter Koperasi Hasil Keputusan RAT (Rapat Anggota Tahunan)
            </h3>
          </div>
          <Badge variant="teal" size="sm">Dapat Disesuaikan</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Setting 1: SHU % RAT */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-700 dark:text-zinc-300">Alokasi SHU Anggota:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono text-sm font-black">
                {shuPercentageRAT}%
              </span>
            </div>
            <input
              type="range"
              min={20}
              max={70}
              step={5}
              value={shuPercentageRAT}
              onChange={(e) => setShuPercentageRAT(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <p className="text-[10px] text-slate-400">
              * Diputuskan pada RAT Koperasi untuk dividen akhir tahun mitra.
            </p>
          </div>

          {/* Setting 2: Karcis Rate */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-700 dark:text-zinc-300">Tarif Karcis Flat:</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-mono text-sm font-black">
                {formatRupiah(flatKarcisRate)}
              </span>
            </div>
            <input
              type="range"
              min={3000}
              max={10000}
              step={1000}
              value={flatKarcisRate}
              onChange={(e) => setFlatKarcisRate(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <p className="text-[10px] text-slate-400">
              * Biaya 24 jam penuh tanpa komisi per-trip.
            </p>
          </div>

          {/* Setting 3: Free Threshold Hours */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-700 dark:text-zinc-300">Ambang Jam Gratis:</span>
              <span className="text-amber-600 dark:text-amber-400 font-mono text-sm font-black">
                {freeThresholdHours} Jam Online
              </span>
            </div>
            <input
              type="range"
              min={4}
              max={10}
              step={1}
              value={freeThresholdHours}
              onChange={(e) => setFreeThresholdHours(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <p className="text-[10px] text-slate-400">
              * Driver aktif &ge; {freeThresholdHours} jam bebas biaya karcis (Gratis).
            </p>
          </div>

          {/* Setting 4: SPHP Quota */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-700 dark:text-zinc-300">Batas Kuota SPHP:</span>
              <span className="text-blue-600 dark:text-blue-400 font-mono text-sm font-black">
                {dailySPHPQuotaSak} Sak / NIK
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={dailySPHPQuotaSak}
              onChange={(e) => setDailySPHPQuotaSak(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
            <p className="text-[10px] text-slate-400">
              * Kuota beras Bulog per hari per KTP Solo.
            </p>
          </div>
        </div>
      </div>

      {/* 2. SUMMARY STATS AFTER EXECUTION */}
      {summaryStats && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4.5 rounded-3xl bg-emerald-600 text-white shadow-lg space-y-1">
            <span className="text-[10px] text-emerald-100 uppercase tracking-wider block font-bold">
              Total Karcis Terhimpun
            </span>
            <h4 className="text-2xl font-black">{formatRupiah(summaryStats.totalKarcisCollected)}</h4>
            <span className="text-[10px] text-emerald-100 block">Dari {summaryStats.totalActiveDrivers} driver mitra</span>
          </div>

          <div className="p-4.5 rounded-3xl bg-gradient-to-br from-indigo-600 to-blue-700 text-white shadow-lg space-y-1">
            <span className="text-[10px] text-indigo-100 uppercase tracking-wider block font-bold">
              Alokasi Dividen SHU ({shuPercentageRAT}%)
            </span>
            <h4 className="text-2xl font-black">{formatRupiah(summaryStats.totalSHUAllocated)}</h4>
            <span className="text-[10px] text-indigo-100 block">Cadangan Kas RAT Koperasi</span>
          </div>

          <div className="p-4.5 rounded-3xl sg-bento-card space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
              Driver Bebas Biaya (Gratis)
            </span>
            <h4 className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {summaryStats.totalWaivedDrivers} Driver
            </h4>
            <span className="text-[10px] text-slate-500 block">Narik &ge; {freeThresholdHours} jam penuh</span>
          </div>

          <div className="p-4.5 rounded-3xl sg-bento-card space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
              Reset Kuota SPHP Bulog
            </span>
            <h4 className="text-2xl font-black text-blue-600 dark:text-blue-400">
              {summaryStats.totalQuotaReset} NIK KTP
            </h4>
            <span className="text-[10px] text-slate-500 block">Siap belanja pasar murah besok</span>
          </div>
        </div>
      )}

      {/* 3. TERMINAL LOGS & STEP PROGRESS */}
      <div className="sg-bento-card p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-emerald-500" />
            <h3 className="text-xs font-black text-slate-900 dark:text-white">
              Live Console Output (Server-side Functions Log)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">node:functions/scheduled</span>
        </div>

        {/* Console Window */}
        <div className="p-4 rounded-2xl bg-slate-950 text-emerald-400 font-mono text-xs space-y-2 min-h-[160px] max-h-64 overflow-y-auto border border-white/10 shadow-inner">
          {logs.length === 0 ? (
            <p className="text-slate-600 italic">
              Klik tombol 'Jalankan Cron Tengah Malam' di atas untuk memulai simulasi otomasi rekonsiliasi harian...
            </p>
          ) : (
            logs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-2 leading-relaxed">
                <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
                <span className={`font-bold ${
                  log.type === "success" ? "text-emerald-400" :
                  log.type === "warning" ? "text-amber-400" :
                  "text-blue-400"
                }`}>
                  [{log.step}]
                </span>
                <span className="text-slate-200">{log.detail}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 4. DRIVERS LEDGER MUTATION TABLE */}
      {simulatedDrivers.length > 0 && (
        <div className="sg-bento-card p-5 sm:p-6 space-y-4">
          <h3 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Wallet className="h-4 w-4 text-indigo-500" />
            Hasil Rekonsiliasi Saldo & Ledger Driver
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/[0.06] text-slate-400 text-[10px] uppercase">
                  <th className="py-2.5">Mitra Driver</th>
                  <th className="py-2.5">Jam Online</th>
                  <th className="py-2.5">Trip Selesai</th>
                  <th className="py-2.5">Omset Tunai</th>
                  <th className="py-2.5">Status Karcis</th>
                  <th className="py-2.5">Potongan Karcis</th>
                  <th className="py-2.5">Alokasi SHU ({shuPercentageRAT}%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                {simulatedDrivers.map((d, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                    <td className="py-3 font-bold text-slate-900 dark:text-white">
                      <div>{d.driverName}</div>
                      <span className="text-[10px] font-mono text-slate-400">{d.plate}</span>
                    </td>
                    <td className="py-3 font-mono font-bold text-slate-700 dark:text-zinc-300">
                      {d.onlineHours} Jam
                    </td>
                    <td className="py-3 font-bold text-slate-700 dark:text-zinc-300">
                      {d.tripsToday} Trip
                    </td>
                    <td className="py-3 font-bold text-slate-900 dark:text-white">
                      {formatRupiah(d.grossIncome)}
                    </td>
                    <td className="py-3">
                      <Badge variant={d.karcisStatus === "waived" ? "emerald" : "amber"} size="sm">
                        {d.karcisStatus === "waived" ? "GRATIS (>=6J)" : "DIPOTONG"}
                      </Badge>
                    </td>
                    <td className="py-3 font-mono font-bold text-slate-900 dark:text-white">
                      {formatRupiah(d.karcisAmount)}
                    </td>
                    <td className="py-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      +{formatRupiah(d.shuContribution)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
