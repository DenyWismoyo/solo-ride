"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Truck, 
  FileText, 
  Handshake, 
  BarChart3, 
  Plus, 
  Search, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  QrCode, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  Package, 
  Building2, 
  Sparkles,
  Phone,
  Layers,
  ChevronRight,
  X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/utils";

export type IndustryTab = "fleet" | "manifest" | "contracts" | "analytics";

const MOCK_FLEET = [
  { id: "FLT-01", name: "Truk CDD Box Pendingin", plate: "AD 8921 QA", driver: "Bambang Trihatmodjo", phone: "0812-3456-7890", capacityKg: 5000, currentLoadKg: 3800, status: "in_transit", destination: "Pasar Legi Surakarta", cargoType: "Sayur & Daging Segar" },
  { id: "FLT-02", name: "Truk Engkel Bak Terbuka", plate: "AD 9102 QA", driver: "Agus Prasetyo", phone: "0813-9876-5432", capacityKg: 2500, currentLoadKg: 2500, status: "loading", destination: "Pabrik Tekstil Laweyan", cargoType: "Kain Mori & Pewarna Batik" },
  { id: "FLT-03", name: "Blind Van Express B2B", plate: "AD 7712 BZ", driver: "Eko Supriyanto", phone: "0811-2233-4455", capacityKg: 1000, currentLoadKg: 650, status: "in_transit", destination: "Kios Pasar Gede Blok C", cargoType: "Bumbu Giling & Rempah Kering" },
  { id: "FLT-04", name: "Truk CDD Long Chasis", plate: "AD 8011 QA", driver: "Hendra Wijaya", phone: "0856-7788-9900", capacityKg: 6000, currentLoadKg: 0, status: "standby", destination: "Gudang Logistik Palur", cargoType: "Siap Muat Beras SPHP" }
];

const MOCK_MANIFESTS = [
  { id: "MAN-SOLO-2026-0881", origin: "Gudang Bulog Palur", destination: "Posko Pasar Murah Jebres", itemsCount: 400, weightKg: 2000, totalValue: 21600000, status: "on_delivery", driverName: "Bambang Trihatmodjo", createdAt: "Hari ini, 06.30 WIB" },
  { id: "MAN-SOLO-2026-0880", origin: "Pabrik Tepung Kartasura", destination: "Sentra Roti & Kuliner Laweyan", itemsCount: 80, weightKg: 1600, totalValue: 18400000, status: "delivered", driverName: "Eko Supriyanto", createdAt: "Hari ini, 08.15 WIB" },
  { id: "MAN-SOLO-2026-0879", origin: "Sentra Peternak Sapi Boyolali", destination: "Los Daging Pasar Nusukan", itemsCount: 15, weightKg: 850, totalValue: 89000000, status: "delivered", driverName: "Agus Prasetyo", createdAt: "Kemarin, 04.00 WIB" }
];

const MOCK_CONTRACTS = [
  { id: "CTR-B2B-01", merchantGroup: "Paguyuban Pedagang Pasar Legi", frequency: "Setiap Hari (Subuh 04.00)", commodity: "Pasokan Bawang & Cabai Segar", volumeMonthTon: 45, valuePerMonth: 185000000, status: "active" },
  { id: "CTR-B2B-02", merchantGroup: "Asosiasi Kuliner Tradisional Gladag", frequency: "3x Seminggu (Senin/Rabu/Jumat)", commodity: "Beras C4 Organik & Minyak Goreng", volumeMonthTon: 20, valuePerMonth: 82000000, status: "active" },
  { id: "CTR-B2B-03", merchantGroup: "Sentra Perajin Batik Kauman", frequency: "Mingguan (Setiap Senin)", commodity: "Malam Lilin & Kain Primissima", volumeMonthTon: 8, valuePerMonth: 46000000, status: "active" }
];

export function IndustryWorkspace() {
  const [activeTab, setActiveTab] = useState<IndustryTab>("fleet");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedManifest, setSelectedManifest] = useState<typeof MOCK_MANIFESTS[0] | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in_transit":
      case "on_delivery":
        return <Badge variant="blue" size="sm" className="animate-pulse">🚚 Perjalanan</Badge>;
      case "loading":
        return <Badge variant="amber" size="sm">📦 Muat Barang</Badge>;
      case "delivered":
      case "active":
        return <Badge variant="emerald" size="sm">✅ Selesai / Aktif</Badge>;
      default:
        return <Badge variant="outline" size="sm">⏳ Siaga (Standby)</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Hero Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 text-white shadow-xl relative overflow-hidden space-y-4">
        <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-3xl shrink-0 shadow-md">
              🏢
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-white">
                  Portal Logistik B2B Industri Solo
                </h1>
                <Badge variant="blue" size="sm" className="bg-white/20 text-white border-0">
                  PT Bengawan Kargo
                </Badge>
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                Supply Chain Manajemen Distribusi Grosir & Pasokan Bahan Baku Lokal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-right">
              <span className="text-[9px] text-blue-200 block uppercase">Total Armada</span>
              <strong className="text-white font-mono text-sm">4 Truk / Van</strong>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-right">
              <span className="text-[9px] text-blue-200 block uppercase">Bahan Terkirim</span>
              <strong className="text-emerald-300 font-mono text-sm">73.5 Ton / Bln</strong>
            </div>
          </div>
        </div>

        {/* 4 Pilar Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/15 relative z-10">
          {[
            { id: "fleet", label: "Armada Truk & Van", icon: Truck },
            { id: "manifest", label: "Surat Jalan Digital", icon: FileText },
            { id: "contracts", label: "Kontrak Pasokan UMKM", icon: Handshake },
            { id: "analytics", label: "Tonase & Efisiensi", icon: BarChart3 }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                  isActive
                    ? "bg-white text-blue-900 shadow-md scale-[1.02]"
                    : "bg-white/10 hover:bg-white/15 text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. TAB FLEET (ARMADA LOGISTIK) */}
      {/* ========================================================================= */}
      {activeTab === "fleet" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Truck className="h-4 w-4 text-blue-500" /> Status Armada Kargo Aktif
            </h3>
            <span className="text-xs text-slate-500 font-semibold">4 Unit Terhubung GPS</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {MOCK_FLEET.map((f) => (
              <div
                key={f.id}
                className="p-5 rounded-3xl bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/[0.08] shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[9px] font-mono font-bold text-slate-400 block">{f.id}</span>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{f.name}</h4>
                    <p className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">{f.plate}</p>
                  </div>
                  {getStatusBadge(f.status)}
                </div>

                {/* Capacity Gauge */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-zinc-300">
                    <span>Kapasitas Muatan:</span>
                    <span>{f.currentLoadKg} / {f.capacityKg} kg ({Math.round((f.currentLoadKg/f.capacityKg)*100)}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-white/[0.06] h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full rounded-full"
                      style={{ width: `${(f.currentLoadKg/f.capacityKg)*100}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] space-y-1 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Muatan:</span>
                    <strong className="text-slate-800 dark:text-zinc-200">{f.cargoType}</strong>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Tujuan:</span>
                    <strong className="text-slate-800 dark:text-zinc-200">{f.destination}</strong>
                  </div>
                </div>

                {/* Driver Row */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{f.driver}</p>
                    <p className="text-[10px] text-slate-400">{f.phone}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(`https://wa.me/62${f.phone.replace(/[^0-9]/g, "").replace(/^0/, "")}`, "_blank")}
                    className="h-8 rounded-xl text-xs text-emerald-600 border-emerald-500/30 gap-1 cursor-pointer"
                  >
                    <Phone className="h-3.5 w-3.5" /> Kontak PIC
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TAB MANIFEST (SURAT JALAN DIGITAL) */}
      {/* ========================================================================= */}
      {activeTab === "manifest" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" /> Surat Jalan & Manifes Kargo Digital
            </h3>
            <span className="text-xs text-slate-500 font-semibold">Stempel Digital QR Pasokan</span>
          </div>

          <div className="space-y-3">
            {MOCK_MANIFESTS.map((m) => (
              <div
                key={m.id}
                onClick={() => setSelectedManifest(m)}
                className="p-4.5 rounded-3xl bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/[0.08] shadow-xs space-y-3 cursor-pointer hover:border-blue-500/40 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono font-black text-blue-600 dark:text-blue-400">{m.id}</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">{m.createdAt}</p>
                  </div>
                  {getStatusBadge(m.status)}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04]">
                    <span className="text-[10px] text-slate-400 block font-bold">Titik Muat (Origin):</span>
                    <strong className="text-slate-800 dark:text-zinc-200 text-xs">{m.origin}</strong>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04]">
                    <span className="text-[10px] text-slate-400 block font-bold">Titik Bongkar (Destinasi):</span>
                    <strong className="text-slate-800 dark:text-zinc-200 text-xs">{m.destination}</strong>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/[0.04] text-xs">
                  <span className="text-slate-500 font-bold">{m.weightKg} kg · {formatRupiah(m.totalValue)}</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1">
                    <QrCode className="h-4 w-4" /> Buka QR Serah Terima
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TAB CONTRACTS (KONTRAK PASOKAN UMKM) */}
      {/* ========================================================================= */}
      {activeTab === "contracts" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Handshake className="h-4 w-4 text-blue-500" /> Kontrak Pasokan Rutin Bahan Baku
            </h3>
            <span className="text-xs text-slate-500 font-semibold">Kemitraan Terikat Pasar Solo</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {MOCK_CONTRACTS.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-3xl bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/[0.08] shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-400">{c.id}</span>
                    <Badge variant="emerald" size="sm">Aktif</Badge>
                  </div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                    {c.merchantGroup}
                  </h4>
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                    {c.commodity}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] space-y-1 text-xs">
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>Jadwal Kirim:</span>
                    <strong className="text-slate-800 dark:text-zinc-200">{c.frequency}</strong>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>Volume Bulanan:</span>
                    <strong className="text-slate-800 dark:text-zinc-200">{c.volumeMonthTon} Ton</strong>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>Nilai Kontrak:</span>
                    <strong className="text-emerald-600 font-black">{formatRupiah(c.valuePerMonth)} / bln</strong>
                  </div>
                </div>

                <Button
                  size="sm"
                  className="w-full h-9 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer shadow-xs"
                >
                  Kelola Jadwal Distribusi
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TAB ANALYTICS (TONASE & EFISIENSI) */}
      {/* ========================================================================= */}
      {activeTab === "analytics" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl sg-bento-card space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Tonase Bahan Baku Terdistribusi
              </span>
              <h3 className="text-3xl font-black text-blue-600 dark:text-blue-400">73.5 Ton</h3>
              <p className="text-[11px] text-slate-500">Mencakup beras SPHP, sayur Merbabu, daging, dan kain batik.</p>
            </div>

            <div className="p-5 rounded-3xl sg-bento-card space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Efisiensi Rute & Batching Logistik
              </span>
              <h3 className="text-3xl font-black text-emerald-600 dark:text-emerald-400">94.2%</h3>
              <p className="text-[11px] text-slate-500">Pengurangan emisi karbon dan trip kosong armada kargo.</p>
            </div>

            <div className="p-5 rounded-3xl sg-bento-card space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Nilai Transaksi Grosir B2B
              </span>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">Rp 313 Juta</h3>
              <p className="text-[11px] text-slate-500">Perputaran pasokan bahan baku lokal tanpa tengkulak luar.</p>
            </div>
          </div>
        </div>
      )}

      {/* Manifest Detail QR Modal */}
      <AnimatePresence>
        {selectedManifest && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="sg-bento-card p-6 max-w-sm w-full space-y-4 rounded-3xl shadow-2xl relative text-center border-blue-500/30 bg-white dark:bg-[#0c1220]"
            >
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/[0.06] pb-3">
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Surat Jalan Digital Terverifikasi
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedManifest(null)}
                  className="sg-icon-btn h-8 w-8 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* QR Code Placeholder */}
              <div className="p-6 rounded-2xl bg-white text-slate-900 inline-block shadow-md mx-auto">
                <QrCode className="h-32 w-32 text-slate-900" />
                <span className="text-[9px] font-mono font-black mt-2 block tracking-wider">
                  {selectedManifest.id}
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <p className="font-bold text-slate-900 dark:text-white">{selectedManifest.destination}</p>
                <p className="text-[11px] text-slate-500">
                  Total Muatan: {selectedManifest.weightKg} kg · {formatRupiah(selectedManifest.totalValue)}
                </p>
                <p className="text-[10px] text-emerald-600 font-bold">Driver: {selectedManifest.driverName}</p>
              </div>

              <Button
                onClick={() => setSelectedManifest(null)}
                className="w-full h-11 text-xs font-black rounded-2xl bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
              >
                Tutup QR Code
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
