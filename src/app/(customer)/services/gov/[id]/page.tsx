"use client";

import React, { use, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  Clock, 
  Phone, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight,
  Info,
  ExternalLink,
  HelpCircle,
  Search,
  Headphones
} from "lucide-react";
import { GOVERNMENT_SECTORS } from "@/constants/ecosystemSectors";
import { ALL_ECOSYSTEM_SERVICES, AppService } from "@/constants/services";
import { useOpdServices } from "@/hooks/useOpdServices";
import { OpdServiceConfig } from "@/services/opdService.service";
import { useAuthContext } from "@/components/AuthProvider";
import { AppHeader } from "@/components/layout/AppHeader";
import { AdminImpersonationBar } from "@/components/admin/AdminImpersonationBar";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

const AGENCY_ADDRESSES: Record<string, { address: string; hours: string; hotline: string }> = {
  gov_dukcapil: { address: "Balai Kota Surakarta, Jl. Jend. Sudirman No. 2", hours: "Senin - Jumat: 08.00 - 15.30 WIB", hotline: "0812-2612-3372" },
  gov_dinkes: { address: "Jl. Jend. Sudirman No. 2 (Kompleks Balai Kota Solo)", hours: "24 Jam Siaga Faskes / Farmasi", hotline: "119 / 0271-632202" },
  gov_dinsos: { address: "Jl. Slamet Riyadi No. 340, Surakarta", hours: "Senin - Jumat: 08.00 - 15.30 WIB", hotline: "0271-714522" },
  gov_diskop: { address: "Pusat Layanan Usaha Terpadu (PLUT) Balai Kota Solo", hours: "Senin - Jumat: 08.00 - 15.30 WIB", hotline: "0813-9090-3372" },
  gov_dispar: { address: "Jl. Brigjen Slamet Riyadi No. 275, Sriwedari", hours: "Setiap Hari: 08.00 - 16.00 WIB", hotline: "0271-711444" },
  gov_dishub: { address: "Jl. Menteri Supeno No. 7, Manahan, Solo", hours: "24 Jam Command Center CCROOM", hotline: "0271-718288" },
  gov_bapenda: { address: "Gedung Kantor Bapenda, Balai Kota Surakarta", hours: "Senin - Jumat: 08.00 - 15.00 WIB", hotline: "0271-642020" },
  gov_disdik: { address: "Jl. Jagalan No. 42, Jebres, Surakarta", hours: "Senin - Jumat: 07.30 - 15.30 WIB", hotline: "0271-635032" },
  gov_dlh: { address: "Jl. Menteri Supeno No. 11, Manahan, Solo", hours: "Senin - Sabtu: 07.00 - 14.00 WIB", hotline: "0271-715503" },
  gov_damkar: { address: "Mako Damkar Solo, Jl. Supomo No. 58", hours: "24 Jam Non-Stop Siaga 113", hotline: "0271-7630133 / 113" },
  gov_dispusip: { address: "Jl. Hasanudin No. 112, Kerten, Laweyan", hours: "Senin - Minggu: 08.00 - 20.00 WIB", hotline: "0271-714156" },
  gov_dispertan: { address: "Puskeswan Solo, Jl. Tentara Pelajar No. 1", hours: "Senin - Jumat: 08.00 - 15.00 WIB", hotline: "0271-654877" },
  gov_disnaker: { address: "Balai Latihan Kerja (BLK), Jl. Ki Hajar Dewantara", hours: "Senin - Jumat: 08.00 - 15.30 WIB", hotline: "0271-646849" },
  gov_diskominfo: { address: "Pusat ULAS, Balai Kota Surakarta Lantai 2", hours: "24 Jam Layanan Tiket ULAS", hotline: "0811-265-2026" },
  gov_satpolpp: { address: "Jl. Jendral Sudirman No. 2, Surakarta", hours: "24 Jam Regu Reaksi Cepat Patroli", hotline: "0271-644555" },
  gov_dpmptsp: { address: "Mal Pelayanan Publik (MPP) Jend. Sudirman", hours: "Senin - Jumat: 08.30 - 15.00 WIB", hotline: "0271-667788" },
  gov_bpbd: { address: "Posko BPBD Solo, Jl. Mayor Achmadi No. 1", hours: "24 Jam Posko Siaga Bencana EWS", hotline: "0271-2932900" },
  gov_dp3a: { address: "PUSPAGA Balai Kota Surakarta", hours: "24 Jam Hotline Perlindungan Perempuan & Anak", hotline: "0812-2550-3372" }
};

export default function GovAgencyDetailPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const rawId = resolvedParams.id;
  const normalizedId = rawId.startsWith("gov_") ? rawId : `gov_${rawId}`;

  // Find Sector Definition
  const sector = useMemo(() => {
    return GOVERNMENT_SECTORS.find(s => s.id === normalizedId || s.id === rawId);
  }, [normalizedId, rawId]);

  // Realtime Live OPD Services Hook
  const { services: liveServices, loading: loadingServices } = useOpdServices(normalizedId);

  const { isImpersonating } = useAuthContext();

  const agencyMeta = AGENCY_ADDRESSES[normalizedId] || {
    address: "Balai Kota Surakarta, Jl. Jend. Sudirman No. 2",
    hours: "Senin - Jumat: 08.00 - 15.30 WIB",
    hotline: "0271-642020"
  };

  const handleOpenServiceModal = (service: OpdServiceConfig | AppService) => {
    if ("isActive" in service && !service.isActive) {
      alert("Layanan ini sedang ditutup sementara oleh dinas terkait.");
      return;
    }
    router.push(`/services/gov/${sector?.id || normalizedId}/${service.id}`);
  };

  if (!sector) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-white p-4 flex flex-col items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 rounded-3xl bg-rose-500/15 border border-rose-500/30 text-rose-500 flex items-center justify-center mx-auto text-2xl">
            🏛️
          </div>
          <h2 className="text-lg font-bold">Dinas Pemerintahan Tidak Ditemukan</h2>
          <p className="text-xs text-slate-500">ID OPD &ldquo;{rawId}&rdquo; belum terdaftar di ekosistem Pemkot Surakarta.</p>
          <Button onClick={() => router.push("/services/more")} className="rounded-xl text-xs font-bold">
            Kembali ke Direktori Layanan
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-white pb-24">
      {/* Impersonation bar */}
      <AdminImpersonationBar />

      {/* Header */}
      <AppHeader onOpenProfile={() => router.push("/")} />

      <main className={cn(
        "max-w-4xl mx-auto px-4 space-y-4 transition-all duration-200",
        isImpersonating ? "pt-28 sm:pt-28" : "pt-20 sm:pt-20"
      )}>
        {/* Breadcrumb Navigation & Back Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-zinc-400 overflow-x-auto no-scrollbar py-0.5">
            <button
              type="button"
              onClick={() => router.back()}
              className="p-1.5 rounded-xl bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white shadow-xs transition-transform active:scale-95 cursor-pointer flex items-center gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="font-bold text-[10px]">Kembali</span>
            </button>
            <Link href="/services/more?tab=government" className="hover:text-blue-600 transition-colors shrink-0 font-medium ml-1">
              Katalog (18 Dinas)
            </Link>
            <ChevronRight className="h-3 w-3 shrink-0 text-slate-400" />
            <span className="text-slate-900 dark:text-white font-bold truncate">
              {sector.name}
            </span>
          </div>

          <Badge variant="emerald" size="sm" className="text-[10px] font-bold shrink-0">
            {liveServices.filter(s => s.isActive).length} Layanan Aktif
          </Badge>
        </div>

        {/* Agency Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-white via-slate-50 to-blue-50/40 dark:from-[#0c1220] dark:via-[#0c1220] dark:to-blue-950/20 border border-slate-200/80 dark:border-white/[0.08] p-5 sm:p-6 shadow-sm space-y-4"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-3xl shrink-0 shadow-inner">
                {sector.avatar}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    {sector.agencyOrCompanyName}
                  </h1>
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-bold">
                  {sector.tagline}
                </p>
                <p className="text-xs text-slate-600 dark:text-zinc-300 max-w-2xl leading-relaxed">
                  {sector.description}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t border-slate-200/60 dark:border-white/[0.06] text-xs">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-100/60 dark:bg-white/[0.03]">
              <MapPin className="h-4 w-4 text-blue-500 shrink-0" />
              <div className="truncate">
                <span className="text-[10px] text-slate-400 block">Kantor Layanan:</span>
                <span className="font-semibold text-slate-700 dark:text-zinc-200 truncate block">{agencyMeta.address}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-100/60 dark:bg-white/[0.03]">
              <Clock className="h-4 w-4 text-emerald-500 shrink-0" />
              <div className="truncate">
                <span className="text-[10px] text-slate-400 block">Jam Operasional:</span>
                <span className="font-semibold text-slate-700 dark:text-zinc-200 truncate block">{agencyMeta.hours}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-100/60 dark:bg-white/[0.03]">
              <Headphones className="h-4 w-4 text-purple-500 shrink-0" />
              <div className="truncate">
                <span className="text-[10px] text-slate-400 block">Hotline / WhatsApp:</span>
                <span className="font-semibold text-slate-700 dark:text-zinc-200 truncate block">{agencyMeta.hotline}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Services List Section */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Daftar Jenis Layanan Warga
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {liveServices.map((service, idx) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => handleOpenServiceModal(service)}
                  className={`group relative p-4 rounded-[1.5rem] bg-white dark:bg-[#0c1220] border transition-all space-y-3 ${
                    service.isActive
                      ? "border-slate-200/80 dark:border-white/[0.08] hover:border-blue-500/50 dark:hover:border-blue-500/50 hover:shadow-md cursor-pointer"
                      : "border-rose-200/60 dark:border-rose-950/40 bg-slate-50/60 dark:bg-slate-900/30 opacity-75 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-transform shadow-sm ${
                        service.isActive
                          ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200/60 dark:border-blue-800/40 group-hover:scale-105"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700"
                      }`}>
                        {typeof Icon === "function" ? (
                          React.createElement(Icon as any, { size: 20, className: "h-5 w-5" })
                        ) : (
                          <span className="text-lg">{typeof Icon === "string" ? Icon : "🏛️"}</span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className={`text-xs font-bold transition-colors ${
                            service.isActive
                              ? "text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400"
                              : "text-slate-500 dark:text-zinc-400"
                          }`}>
                            {service.name}
                          </h3>
                          {!service.isActive && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                              Tutup Sementara
                            </span>
                          )}
                          {service.isCustom && (
                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-700 dark:text-purple-300">
                              Baru
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 line-clamp-2">
                          {service.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/[0.04] text-xs">
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                      {service.feeLabel || "Resmi Pemkot Solo"}
                    </span>
                    <div className={`flex items-center gap-1 text-[11px] font-bold ${
                      service.isActive ? "text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform" : "text-slate-400"
                    }`}>
                      <span>{service.isActive ? "Buka Formulir" : "Sedang Tutup"}</span>
                      {service.isActive && <ChevronRight className="h-3.5 w-3.5" />}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Call Center & Help Banner */}
        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-blue-900 dark:text-blue-200">
                Pusat Pelayanan & Informasi Terpadu Pemkot Surakarta
              </h4>
              <p className="text-[11px] text-blue-700 dark:text-blue-300 mt-0.5">
                Setiap dokumen fisik dan pesanan layanan diproses resmi oleh petugas dinas dan diantar kurir mitra bersertifikasi.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => window.open(`https://wa.me/62${agencyMeta.hotline.replace(/\D/g, "")}`, "_blank")}
            className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl h-8 cursor-pointer"
          >
            Hubungi Hotline Dinas
          </Button>
        </div>
      </main>
    </div>
  );
}
