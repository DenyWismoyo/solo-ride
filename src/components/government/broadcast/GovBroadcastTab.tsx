"use client";

import React, { useState } from "react";
import { 
  Megaphone, 
  Send, 
  Users, 
  ShieldCheck, 
  AlertCircle, 
  AlertTriangle,
  AlertOctagon,
  Sparkles,
  CheckCircle2, 
  Loader2, 
  Clock, 
  Store, 
  FileText,
  Bookmark
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { broadcastService } from "@/services/broadcast.service";
import { useBroadcasts } from "@/hooks/useBroadcasts";
import { BroadcastTarget, BroadcastCategory } from "@/types/notification.types";

interface GovBroadcastTabProps {
  user: any;
  activeSector: any;
}

// 1-Click Visionary Templates Pemkot Surakarta
const CIVIC_BROADCAST_TEMPLATES = [
  {
    label: "🛵 Rekayasa Lalin CFD Slamet Riyadi (Dishub)",
    target: "all" as BroadcastTarget,
    category: "warning" as BroadcastCategory,
    title: "Rekayasa Lalu Lintas & Penutupan Jalur CFD Slamet Riyadi Hari Minggu",
    body: "Diberitahukan kepada seluruh warga dan mitra driver bahwa Jl. Slamet Riyadi (Gendengan s/d Gladag) ditutup untuk kendaraan bermotor setiap Minggu pukul 06.00 - 09.00 WIB. Titik shelter penjemputan ojek tersedia di Jl. Gajah Mada dan Jl. Yosodipuro.",
    actionUrl: "/services/gov/gov_dishub",
    actionLabel: "Lihat Peta Shelter CFD"
  },
  {
    label: "🍚 Mobil Keliling Pasar Murah GPM (Disdag)",
    target: "customer" as BroadcastTarget,
    category: "program" as BroadcastCategory,
    title: "Jadwal Mobil Siaga Gerakan Pangan Murah (GPM) Besok Pagi",
    body: "Dinas Perdagangan bersama BULOG menggelar penyaluran beras SPHP 5kg (@ Rp 62.500) dan Minyakita di Halaman Kelurahan Nusukan dan Purwosari mulai pukul 08.00 WIB. Warga dapat melakukan reservasi e-voucher sekarang.",
    actionUrl: "/services/pasar-murah",
    actionLabel: "Tebus Sembako Murah"
  },
  {
    label: "🌊 Peringatan Siaga Banjir Bengawan Solo (BPBD)",
    target: "all" as BroadcastTarget,
    category: "emergency" as BroadcastCategory,
    title: "Peringatan Siaga Debit Air Bengawan Solo & Kali Pepe",
    body: "TMA Pos Jurug mendekati Siaga Kuning akibat curah hujan tinggi di hulu. Warga bantaran kali Semanggi dan Sewu diimbau mengamankan barang berharga. Tim Reaksi Cepat BPBD dan Perahu Karet siaga 24 jam.",
    actionUrl: "/services/gov/gov_bpbd",
    actionLabel: "Hotline Darurat BPBD"
  },
  {
    label: "⚖️ Tera Ulang Timbangan Kios Pasar (Disdag)",
    target: "merchant" as BroadcastTarget,
    category: "info" as BroadcastCategory,
    title: "Jadwal Pemeriksaan Tera Metrologi Legalitas Timbangan Pasar Legi",
    body: "Petugas Metrologi Disdag Surakarta akan melakukan tera ulang timbangan pedagang los basah/kering di Pasar Legi Blok A dan B mulai Senin pagi. Gratis biaya retribusi tera.",
    actionUrl: "/merchant",
    actionLabel: "Informasi Tera Los"
  },
  {
    label: "💰 Fasilitasi Dana Bergulir & NIB Gratis (Diskop)",
    target: "merchant" as BroadcastTarget,
    category: "program" as BroadcastCategory,
    title: "Program Fasilitasi Modal Usaha & Pendampingan NIB Gratis",
    body: "Dinas Koperasi & UMKM membuka pendaftaran inkubasi usaha mikro dan fasilitasi dana bergulir bunga 0% bagi pedagang kuliner dan warung kelontong mitra terdaftar.",
    actionUrl: "/services/gov/gov_diskop",
    actionLabel: "Daftar Bantuan Usaha"
  }
];

export function GovBroadcastTab({ user, activeSector }: GovBroadcastTabProps) {
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementText, setAnnouncementText] = useState("");
  const [targetRole, setTargetRole] = useState<BroadcastTarget>("all");
  const [category, setCategory] = useState<BroadcastCategory>("info");
  const [actionUrl, setActionUrl] = useState("");
  const [actionLabel, setActionLabel] = useState("");
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isToggling, setIsToggling] = useState<string | null>(null);

  const { broadcasts, loading: loadingBroadcasts } = useBroadcasts();

  const handleApplyTemplate = (tpl: typeof CIVIC_BROADCAST_TEMPLATES[0]) => {
    setAnnouncementTitle(tpl.title);
    setAnnouncementText(tpl.body);
    setTargetRole(tpl.target);
    setCategory(tpl.category);
    setActionUrl(tpl.actionUrl || "");
    setActionLabel(tpl.actionLabel || "");
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !announcementTitle.trim() || !announcementText.trim()) return;

    setIsBroadcasting(true);
    try {
      await broadcastService.createBroadcast({
        authorId: user.uid,
        institutionName: `${activeSector.agencyOrCompanyName || activeSector.name} Kota Surakarta`,
        title: announcementTitle,
        body: announcementText,
        target: targetRole,
        category: category,
        actionUrl: actionUrl.trim() || undefined,
        actionLabel: actionLabel.trim() || undefined,
        geofence: {
          center: { lat: -7.5755, lng: 110.8243 },
          radiusKm: 15.0,
          areaName: "Kota Surakarta & Sekitarnya"
        }
      });

      setAnnouncementTitle("");
      setAnnouncementText("");
      setActionUrl("");
      setActionLabel("");
      alert("✅ Siaran resmi berhasil dipublikasikan ke seluruh target aplikasi!");
    } catch (err: any) {
      alert(`Gagal mengirim siaran: ${err.message || err}`);
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleDeactivateBroadcast = async (id: string) => {
    if (!confirm("Akhiri siaran ini sekarang? Siaran akan ditarik dari semua aplikasi warga & mitra.")) return;
    setIsToggling(id);
    try {
      await broadcastService.toggleBroadcastStatus(id, false);
    } catch (err) {
      alert("Gagal mengakhiri siaran.");
    } finally {
      setIsToggling(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {/* 1. Broadcast Composer Form */}
      <div className="sg-bento-card p-6 space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/[0.04] pb-4">
          <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Megaphone className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              Pusat Komando Siaran Resmi Pemkot
            </h3>
            <p className="text-xs text-slate-400">
              Pengumuman resmi yang langsung terdistribusi ke Customer, Driver, dan UMKM
            </p>
          </div>
        </div>

        {/* 1-Click Templates */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 flex items-center gap-1">
            <Bookmark className="w-3 h-3 text-emerald-500" /> Template Siaran Instan (1-Click):
          </label>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {CIVIC_BROADCAST_TEMPLATES.map((tpl, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleApplyTemplate(tpl)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.04] hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-white/10 text-[10px] font-semibold text-slate-700 dark:text-zinc-300 shrink-0 transition-colors cursor-pointer"
              >
                {tpl.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSendBroadcast} className="space-y-3.5 text-xs">
          {/* Target Role Selector */}
          <div>
            <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
              Target Penerima Siaran:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "all", label: "Semua Warga", icon: Users },
                { id: "customer", label: "Pelanggan", icon: ShieldCheck },
                { id: "driver", label: "Mitra Driver", icon: Megaphone },
                { id: "merchant", label: "Mitra UMKM", icon: Store }
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTargetRole(t.id as any)}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    targetRole === t.id
                      ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                      : "bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.06] text-slate-600 dark:text-zinc-400"
                  }`}
                >
                  <t.icon className="h-4 w-4" />
                  <span className="text-[11px]">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
              Kategori & Sifat Pesan:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {[
                { id: "info", label: "Warta Umum", icon: Megaphone, color: "text-blue-500" },
                { id: "warning", label: "Lalin / Cuaca", icon: AlertTriangle, color: "text-amber-500" },
                { id: "emergency", label: "Siaga Darurat", icon: AlertOctagon, color: "text-rose-500" },
                { id: "program", label: "Pangan / Subsidi", icon: Sparkles, color: "text-emerald-500" }
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id as any)}
                  className={`px-2 py-2 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    category === c.id
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white"
                      : "bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.06] text-slate-600 dark:text-zinc-400"
                  }`}
                >
                  <c.icon className={`h-3.5 w-3.5 ${category === c.id ? "" : c.color}`} />
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
              Judul Pengumuman / Siaran:
            </label>
            <input
              type="text"
              value={announcementTitle}
              onChange={(e) => setAnnouncementTitle(e.target.value)}
              placeholder="Contoh: Rekayasa Lalu Lintas CFD Slamet Riyadi..."
              className="sg-input w-full text-xs font-semibold"
              required
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
              Isi Arahan / Pesan Detail:
            </label>
            <textarea
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              rows={4}
              placeholder="Tuliskan arahan, imbauan, atau informasi penting untuk warga dan mitra..."
              className="sg-input w-full text-xs font-normal"
              required
            />
          </div>

          {/* Action Link (Optional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                Tautan Layanan Terkait (Opsional):
              </label>
              <input
                type="text"
                value={actionUrl}
                onChange={(e) => setActionUrl(e.target.value)}
                placeholder="/services/pasar-murah"
                className="sg-input w-full text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                Label Tombol Tautan (Opsional):
              </label>
              <input
                type="text"
                value={actionLabel}
                onChange={(e) => setActionLabel(e.target.value)}
                placeholder="Tebus Sembako Murah"
                className="sg-input w-full text-xs"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isBroadcasting}
            className="w-full h-11 text-xs font-black rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            {isBroadcasting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Publikasikan Siaran ke Seluruh Ekosistem Solo</span>
              </>
            )}
          </Button>
        </form>
      </div>

      {/* 2. Active Broadcasts Feed */}
      <div className="sg-bento-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.04] pb-4">
          <h3 className="text-sm font-black text-slate-900 dark:text-white">
            Riwayat Siaran Pemkot Aktif
          </h3>
          <Badge variant="blue" size="sm" className="font-bold">
            {broadcasts.length} Siaran
          </Badge>
        </div>

        {loadingBroadcasts ? (
          <div className="p-8 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Memuat riwayat siaran...</p>
          </div>
        ) : broadcasts.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            Belum ada siaran resmi yang aktif di Kota Surakarta.
          </div>
        ) : (
          <div className="space-y-3">
            {broadcasts.map((b) => (
              <div
                key={b.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] space-y-2 text-xs"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <span className="font-black text-slate-900 dark:text-white text-xs">
                      {b.title}
                    </span>
                    <p className="text-[10px] text-slate-400">
                      Instansi: {b.institutionName}
                    </p>
                  </div>
                  <Badge variant="emerald" size="sm" className="text-[9px] shrink-0">
                    {b.target === "all" ? "Semua Warga" : b.target === "merchant" ? "UMKM/Pasar" : b.target === "driver" ? "Mitra Driver" : "Pelanggan"}
                  </Badge>
                </div>
                <p className="text-slate-600 dark:text-zinc-300 text-[11px] leading-relaxed">
                  {b.body}
                </p>
                <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 border-t border-slate-200/60 dark:border-white/[0.04]">
                  <span>Kategori: {b.category || "info"}</span>
                  <button
                    onClick={() => handleDeactivateBroadcast(b.id!)}
                    disabled={isToggling === b.id}
                    className="text-rose-600 dark:text-rose-400 font-bold hover:underline cursor-pointer"
                  >
                    {isToggling === b.id ? "Memproses..." : "Tarik Siaran"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
