"use client";

import React, { useState, useMemo } from "react";
import { useOpdServices } from "@/hooks/useOpdServices";
import { OpdServiceConfig } from "@/services/opdService.service";
import { ServiceEditorModal } from "./ServiceEditorModal";
import { SectorDefinition } from "@/constants/ecosystemSectors";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Settings2, 
  Plus, 
  Search, 
  SlidersHorizontal, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Coins, 
  Truck, 
  FileCheck2, 
  Siren, 
  Ticket, 
  UserCheck, 
  QrCode, 
  Trash2, 
  Edit3,
  Loader2,
  Sparkles,
  ShieldAlert
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";

interface GovServiceCatalogManagerProps {
  sector: SectorDefinition;
}

export function GovServiceCatalogManager({ sector }: GovServiceCatalogManagerProps) {
  const { 
    services, 
    loading, 
    toggleService, 
    saveConfig, 
    deleteCustom 
  } = useOpdServices(sector.id);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<string>("all");
  const [editingService, setEditingService] = useState<OpdServiceConfig | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Statistics
  const activeCount = useMemo(() => services.filter(s => s.isActive).length, [services]);
  const inactiveCount = useMemo(() => services.filter(s => !s.isActive).length, [services]);

  // Filtered Services
  const filteredServices = useMemo(() => {
    return services.filter(srv => {
      const matchSearch = srv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        srv.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchSearch) return false;
      if (filterMode === "active") return srv.isActive;
      if (filterMode === "inactive") return !srv.isActive;
      if (filterMode === "emergency") return srv.isEmergency;
      if (filterMode === "custom") return srv.isCustom;
      return true;
    });
  }, [services, searchQuery, filterMode]);

  const handleToggle = async (service: OpdServiceConfig) => {
    setTogglingId(service.id);
    try {
      await toggleService(service.id, service.isActive, service);
    } catch (err: any) {
      alert(`Gagal mengubah status: ${err.message || err}`);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (serviceId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus layanan custom ini?")) return;
    try {
      await deleteCustom(serviceId);
    } catch (err: any) {
      alert(`Gagal menghapus: ${err.message || err}`);
    }
  };

  const getOutputBadge = (mode: string) => {
    switch (mode) {
      case "delivery":
        return <Badge variant="teal" size="sm" className="font-bold flex items-center gap-1"><Truck className="h-3 w-3" /> Kurir Mitra & OTP</Badge>;
      case "digital_issuance":
        return <Badge variant="blue" size="sm" className="font-bold flex items-center gap-1"><QrCode className="h-3 w-3" /> E-Certificate & QR</Badge>;
      case "emergency_dispatch":
        return <Badge variant="rose" size="sm" className="font-bold flex items-center gap-1"><Siren className="h-3 w-3" /> Satgas 24 Jam</Badge>;
      case "subsidy_voucher":
        return <Badge variant="amber" size="sm" className="font-bold flex items-center gap-1"><Ticket className="h-3 w-3" /> Voucher Subsidi</Badge>;
      case "field_visit":
        return <Badge variant="emerald" size="sm" className="font-bold flex items-center gap-1"><UserCheck className="h-3 w-3" /> Kunjungan Petugas</Badge>;
      default:
        return <Badge variant="outline" size="sm" className="font-bold">Tiket Layanan</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-[2rem] bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/[0.08] shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center text-2xl shrink-0">
            ⚙️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Manajemen Template & Katalog Layanan
              </h2>
              <Badge variant="outline" size="sm" className="font-mono text-[10px]">
                {sector.name}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Atur status buka/tutup, tarif subsidi, batas SLA, dan tambah inovasi layanan baru
            </p>
          </div>
        </div>

        <Button
          onClick={() => {
            setEditingService(null);
            setIsModalOpen(true);
          }}
          className="h-11 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs gap-2 shadow-md shadow-teal-500/20 shrink-0 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Sub-Layanan Baru</span>
        </Button>
      </div>

      {/* Analytics Bento Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/[0.06] shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">TOTAL SUB-LAYANAN</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">{services.length}</span>
          <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold mt-0.5 block">Tersinkron dengan Warga</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/[0.06] shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">LAYANAN AKTIF</span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">{activeCount}</span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Dapat diajukan warga</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/[0.06] shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">TUTUP SEMENTARA</span>
          <span className="text-2xl font-black text-rose-500 mt-1 block">{inactiveCount}</span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Disembunyikan dari katalog</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/[0.06] shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">INOVASI CUSTOM</span>
          <span className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1 block">
            {services.filter(s => s.isCustom).length}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Dibuat mandiri oleh dinas</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#0c1220] p-3.5 rounded-2xl border border-slate-200/80 dark:border-white/[0.06]">
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari sub-layanan berdasarkan nama atau deskripsi..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: "all", label: "Semua" },
            { id: "active", label: "Aktif Saja" },
            { id: "inactive", label: "Tutup" },
            { id: "emergency", label: "Darurat" },
            { id: "custom", label: "Custom OPD" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterMode(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filterMode === tab.id
                  ? "bg-teal-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-zinc-400 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600 mx-auto" />
          <p className="text-xs text-slate-400">Memuat katalog layanan dinas...</p>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white dark:bg-[#0c1220] rounded-[2rem] border border-dashed border-slate-200 dark:border-white/10 p-8">
          <span className="text-3xl">📋</span>
          <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200">Tidak ada layanan yang sesuai</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery ? `Tidak ada hasil untuk pencarian "${searchQuery}".` : "Belum ada sub-layanan yang ditambahkan untuk filter ini."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredServices.map(srv => (
            <div
              key={srv.id}
              className={`p-5 rounded-[2rem] bg-white dark:bg-[#0c1220] border transition-all space-y-4 shadow-xs relative overflow-hidden ${
                srv.isActive
                  ? "border-slate-200/80 dark:border-white/[0.08]"
                  : "border-rose-200/60 dark:border-rose-950/40 bg-slate-50/50 dark:bg-slate-900/20 opacity-80"
              }`}
            >
              {/* Card Header & Toggle */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getOutputBadge(srv.outputMode)}
                    {srv.isCustom && (
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                        Custom Inovasi
                      </span>
                    )}
                    {srv.isEmergency && (
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 flex items-center gap-0.5">
                        <ShieldAlert className="h-2.5 w-2.5" /> Darurat
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white pt-1">
                    {srv.name}
                  </h3>
                </div>

                {/* Instant Active / Inactive Toggle Switch */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={togglingId === srv.id}
                    onClick={() => handleToggle(srv)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      srv.isActive ? "bg-teal-600" : "bg-slate-300 dark:bg-zinc-700"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        srv.isActive ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed line-clamp-2">
                {srv.description || "Tidak ada deskripsi layanan."}
              </p>

              {/* Metadata Badges */}
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                    <Clock className="h-3 w-3 text-teal-500" /> SLA Target:
                  </span>
                  <span className="font-bold text-slate-800 dark:text-zinc-200">
                    {srv.slaMinutes} Menit ({Math.round(srv.slaMinutes / 60 * 10) / 10} Jam)
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                    <Coins className="h-3 w-3 text-amber-500" /> Tarif:
                  </span>
                  <span className="font-bold text-slate-800 dark:text-zinc-200">
                    {srv.price === 0 ? "Gratis / Subsidi" : formatRupiah(srv.price)}
                  </span>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-white/[0.04] flex items-center justify-between">
                <span className={`text-[10px] font-bold ${srv.isActive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}`}>
                  ● {srv.isActive ? "Layanan Dibuka untuk Warga" : "Layanan Ditutup Sementara"}
                </span>

                <div className="flex items-center gap-1.5">
                  {srv.isCustom && (
                    <button
                      onClick={() => handleDelete(srv.id)}
                      className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs transition-colors"
                      title="Hapus Layanan"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingService(srv);
                      setIsModalOpen(true);
                    }}
                    className="h-8 text-xs font-bold rounded-xl gap-1.5"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Edit Pengaturan</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Service Editor Modal */}
      {isModalOpen && (
        <ServiceEditorModal
          service={editingService}
          agencyId={sector.id}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingService(null);
          }}
          onSave={saveConfig}
        />
      )}
    </div>
  );
}
