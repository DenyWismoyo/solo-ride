"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  Flame, 
  Activity, 
  FileText, 
  Building2, 
  TrendingUp, 
  Award,
  Filter,
  CheckCircle2,
  Calendar,
  Sparkles
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SLAItem {
  id: string;
  name: string;
  category: "emergency" | "admin" | "license";
  targetText: string;
  targetMinutes: number;
  actualAvgMinutes: number;
  compliancePercent: number;
  totalRequests: number;
  icon: string;
}

const SLA_DATA: SLAItem[] = [
  // Emergency (< 15 Menit)
  { id: "damkar", name: "Dinas Pemadam Kebakaran", category: "emergency", targetText: "< 15 Mnt", targetMinutes: 15, actualAvgMinutes: 7.8, compliancePercent: 99.2, totalRequests: 142, icon: "🚒" },
  { id: "bpbd", name: "BPBD Kota Surakarta", category: "emergency", targetText: "< 20 Mnt", targetMinutes: 20, actualAvgMinutes: 12.1, compliancePercent: 97.8, totalRequests: 89, icon: "🚨" },
  { id: "dinkes_psc", name: "PSC 119 Ambulans Gawat Darurat", category: "emergency", targetText: "< 15 Mnt", targetMinutes: 15, actualAvgMinutes: 10.4, compliancePercent: 98.6, totalRequests: 215, icon: "🚑" },

  // Administrasi (< 24 Jam)
  { id: "dukcapil", name: "Dispendukcapil (KTP & Akta)", category: "admin", targetText: "< 24 Jam", targetMinutes: 1440, actualAvgMinutes: 250, compliancePercent: 98.1, totalRequests: 620, icon: "🪪" },
  { id: "dinsos", name: "Dinas Sosial (Bansos & Disabilitas)", category: "admin", targetText: "< 24 Jam", targetMinutes: 1440, actualAvgMinutes: 380, compliancePercent: 96.4, totalRequests: 180, icon: "🤝" },
  { id: "disnaker", name: "Disnaker (Kartu Kuning AK-1)", category: "admin", targetText: "< 24 Jam", targetMinutes: 1440, actualAvgMinutes: 310, compliancePercent: 97.9, totalRequests: 135, icon: "💼" },
  { id: "disdag_sphp", name: "Disdag (Pasar Murah Beras SPHP)", category: "admin", targetText: "< 12 Jam", targetMinutes: 720, actualAvgMinutes: 190, compliancePercent: 99.4, totalRequests: 480, icon: "🌾" },

  // Perizinan & Pembinaan (< 48 Jam)
  { id: "dpmptsp", name: "DPMPTSP (Perizinan NIB Berusaha)", category: "license", targetText: "< 48 Jam", targetMinutes: 2880, actualAvgMinutes: 890, compliancePercent: 95.8, totalRequests: 95, icon: "🏢" },
  { id: "diskop", name: "Diskop UKM (Sertifikasi Halal)", category: "license", targetText: "< 48 Jam", targetMinutes: 2880, actualAvgMinutes: 620, compliancePercent: 98.2, totalRequests: 110, icon: "🏷️" }
];

export function GovSLAAnalyticsTab() {
  const [selectedFilter, setSelectedFilter] = useState<"all" | "emergency" | "admin" | "license">("all");
  const [timeRange, setTimeRange] = useState<"today" | "7d" | "30d">("7d");

  const filteredData = SLA_DATA.filter(
    (item) => selectedFilter === "all" || item.category === selectedFilter
  );

  const overallCompliance = (
    SLA_DATA.reduce((acc, curr) => acc + curr.compliancePercent, 0) / SLA_DATA.length
  ).toFixed(1);

  const totalCivicOrders = SLA_DATA.reduce((acc, curr) => acc + curr.totalRequests, 0);

  const formatMinutes = (minutes: number) => {
    if (minutes < 60) return `${minutes.toFixed(1)} mnt`;
    const hours = (minutes / 60).toFixed(1);
    return `${hours} jam`;
  };

  return (
    <div className="space-y-6">
      {/* Header & Metric Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 sg-bento-card">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center text-2xl shrink-0">
            📊
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              Dashboard Analitik SLA 19 Dinas Pemkot
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Pemantauan kecepatan respon aparat & kepatuhan standar pelayanan publik Surakarta
            </p>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-white/[0.04] rounded-2xl self-start sm:self-auto">
          {[
            { id: "today", label: "Hari Ini" },
            { id: "7d", label: "7 Hari" },
            { id: "30d", label: "30 Hari" }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTimeRange(t.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                timeRange === t.id
                  ? "bg-white dark:bg-white/[0.14] text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:text-zinc-400"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Hero Stats Bento */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Compliance Gauge */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-teal-600 to-emerald-700 text-white shadow-xl space-y-3 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <span className="text-[10px] font-bold text-teal-100 uppercase tracking-wider block">
            Tingkat Kepatuhan SLA Kota
          </span>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black">{overallCompliance}%</h3>
            <span className="text-xs text-emerald-200 font-bold">🟢 On-Time</span>
          </div>
          <p className="text-[11px] text-teal-100 leading-relaxed">
            98.4% permohonan warga ditangani sebelum batas waktu SLA kedaluwarsa.
          </p>
        </div>

        {/* Total Handled */}
        <div className="p-5 rounded-3xl sg-bento-card space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Berkas & Layanan Ditangani
          </span>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-slate-900 dark:text-white">
              {totalCivicOrders.toLocaleString("id-ID")}
            </h3>
            <span className="text-xs text-teal-600 dark:text-teal-400 font-bold">+18.2% minggu ini</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Mencakup layanan darurat, dokumen kependudukan, dan kuota subsidi pangan.
          </p>
        </div>

        {/* Emergency Response Avg */}
        <div className="p-5 rounded-3xl sg-bento-card space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Rata-rata Respon Darurat (Damkar & PSC)
          </span>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
              8.9 Menit
            </h3>
            <Badge variant="emerald" size="sm">Target &lt; 15 Mnt</Badge>
          </div>
          <p className="text-[11px] text-slate-500">
            Respon kilat satuan tugas tanggap darurat se-Surakarta.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: "all", label: "Semua Dinas (19 OPD)" },
          { id: "emergency", label: "🚨 Siaga Darurat (< 15 Mnt)" },
          { id: "admin", label: "📑 Administrasi (< 24 Jam)" },
          { id: "license", label: "💼 Perizinan & UKM (< 48 Jam)" }
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setSelectedFilter(f.id as any)}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedFilter === f.id
                ? "bg-teal-600 text-white shadow-xs"
                : "bg-white dark:bg-white/[0.04] text-slate-600 dark:text-zinc-400 border border-slate-200/60 dark:border-white/10 hover:bg-slate-100"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* SLA Breakdown Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredData.map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ y: -2 }}
            className="p-4.5 rounded-3xl bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/[0.08] shadow-xs space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                    {item.name}
                  </h4>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    Target SLA: {item.targetText}
                  </span>
                </div>
              </div>

              <Badge 
                variant={item.compliancePercent >= 98 ? "emerald" : "teal"} 
                size="sm"
              >
                {item.compliancePercent}% On-Time
              </Badge>
            </div>

            {/* Performance Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                <span>Rata-rata Respon:</span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  {formatMinutes(item.actualAvgMinutes)}
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-white/[0.06] h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full"
                  style={{ width: `${item.compliancePercent}%` }}
                />
              </div>
            </div>

            {/* Footer Metrics */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/[0.04] text-[10px] text-slate-400">
              <span>{item.totalRequests} Layanan Selesai</span>
              <span className="text-teal-600 dark:text-teal-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Terverifikasi
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
