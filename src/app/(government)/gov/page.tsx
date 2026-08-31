"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { broadcastService } from "@/services/broadcast.service";
import { useBroadcasts } from "@/hooks/useBroadcasts";
import { AppHeader } from "@/components/layout/AppHeader";
import { AdminImpersonationBar } from "@/components/admin/AdminImpersonationBar";
import { ProfileDrawer } from "@/components/layout/ProfileDrawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GOVERNMENT_SECTORS, SectorDefinition } from "@/constants/ecosystemSectors";
import { 
  Landmark, 
  Megaphone, 
  TrendingUp, 
  Users, 
  Coins, 
  ShieldCheck, 
  Send, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Calendar, 
  MapPin, 
  FileCheck2, 
  HeartHandshake, 
  BarChart3, 
  Stethoscope, 
  TrafficCone, 
  Plus, 
  Sparkles, 
  ChevronRight, 
  ArrowRight,
  Inbox,
  Truck,
  Clock,
  Layers
} from "lucide-react";
import { BroadcastTarget } from "@/types/notification.types";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";
import { OrderDocument } from "@/types/order.types";

// Dedicated Dinas Workspaces
import { GovDukcapilWorkspace } from "@/components/government/GovDukcapilWorkspace";
import { GovDinsosWorkspace } from "@/components/government/GovDinsosWorkspace";
import { GovDinkesWorkspace } from "@/components/government/GovDinkesWorkspace";
import { GovDisparWorkspace } from "@/components/government/GovDisparWorkspace";
import { GovDiskopWorkspace } from "@/components/government/GovDiskopWorkspace";
import { GovDishubWorkspace } from "@/components/government/GovDishubWorkspace";

export default function GovernmentDashboard() {
  const router = useRouter();
  const { user, userData, impersonatedPersona, isImpersonating } = useAuthContext();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Active Dinas Selection (Defaults to impersonated persona's additional role or user data or gov_dukcapil)
  const defaultSectorId = impersonatedPersona?.additionalRole || userData?.additionalRole || "gov_dukcapil";
  const [selectedDinasId, setSelectedDinasId] = useState<string>(defaultSectorId);

  // Sync if impersonated persona changes
  useEffect(() => {
    if (impersonatedPersona?.additionalRole) {
      setSelectedDinasId(impersonatedPersona.additionalRole);
    }
  }, [impersonatedPersona]);

  const activeSector = GOVERNMENT_SECTORS.find((s) => s.id === selectedDinasId) || GOVERNMENT_SECTORS[0];

  // Citizen Requests for this Dinas
  const [citizenRequests, setCitizenRequests] = useState<OrderDocument[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  // Broadcast Form States
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementText, setAnnouncementText] = useState("");
  const [targetRole, setTargetRole] = useState<BroadcastTarget>("all");
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isToggling, setIsToggling] = useState<string | null>(null);

  // Real-time civic broadcasts listener
  const { broadcasts, loading: loadingBroadcasts } = useBroadcasts();

  // Live listener for citizen requests submitted to this specific Dinas
  useEffect(() => {
    setLoadingRequests(true);
    const q = query(
      collection(db, COLLECTIONS.ORDERS),
      where("additionalRole", "==", selectedDinasId)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const docs: OrderDocument[] = [];
      snapshot.forEach((d) => {
        docs.push({ id: d.id, ...d.data() } as OrderDocument);
      });
      setCitizenRequests(docs);
      setLoadingRequests(false);
    });

    return () => unsub();
  }, [selectedDinasId]);

  const handleDeactivate = async (id: string) => {
    if (!confirm("Akhiri siaran ini sekarang? Siaran akan ditarik dari semua aplikasi warga.")) return;
    setIsToggling(id);
    try {
      await broadcastService.toggleBroadcastStatus(id, false);
    } catch (err) {
      alert("Gagal mengakhiri siaran.");
    } finally {
      setIsToggling(null);
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !announcementTitle.trim() || !announcementText.trim()) return;

    setIsBroadcasting(true);
    try {
      await broadcastService.createBroadcast({
        authorId: user.uid,
        institutionName: `${activeSector.agencyOrCompanyName} (${activeSector.name})`,
        title: announcementTitle,
        body: announcementText,
        target: targetRole,
        geofence: {
          center: { lat: -7.5755, lng: 110.8243 },
          radiusKm: 15.0,
          areaName: "Seluruh Wilayah Kota Surakarta"
        }
      });

      setAnnouncementTitle("");
      setAnnouncementText("");
      alert(`✅ Siaran resmi dari ${activeSector.name} berhasil dipublikasikan ke seluruh aplikasi warga & mitra Surakarta!`);
    } catch (err) {
      alert("Gagal mengirim siaran pengumuman resmi.");
    } finally {
      setIsBroadcasting(false);
    }
  };

  return (
    <div className="relative min-h-[100dvh] bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 flex flex-col justify-between pb-16 transition-colors duration-200">
      <AdminImpersonationBar />
      <AppHeader onOpenProfile={() => setIsProfileOpen(true)} />

      <main className="pt-20 px-4 max-w-lg w-full mx-auto space-y-5 flex-1">
        {/* ========================================================================= */}
        {/* 1. DINAS SELECTOR PILL TABS */}
        {/* ========================================================================= */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Pilih Dinas Pelayanan Masyarakat:
            </span>
            <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold">
              {GOVERNMENT_SECTORS.length} Dinas Aktif
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {GOVERNMENT_SECTORS.map((dinas) => {
              const isSelected = dinas.id === selectedDinasId;
              return (
                <button
                  key={dinas.id}
                  onClick={() => setSelectedDinasId(dinas.id)}
                  className={`px-3 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer border ${
                    isSelected
                      ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white border-teal-500 shadow-md shadow-teal-500/20"
                      : "bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-800 hover:border-teal-500/40"
                  }`}
                >
                  <span className="text-sm">{dinas.avatar}</span>
                  <span className="whitespace-nowrap text-[11px]">{dinas.name.replace("Dinas ", "")}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. ACTIVE DINAS HERO BANNER */}
        {/* ========================================================================= */}
        <div className="sg-card p-5 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-gradient-to-tr dark:from-teal-950/40 dark:via-zinc-900 dark:to-zinc-900 space-y-4 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-500/30 text-3xl shrink-0 shadow-sm">
              {activeSector.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {activeSector.name}
                </h2>
                <Badge variant="teal" size="sm">
                  RESMI
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 font-medium">
                {activeSector.agencyOrCompanyName}
              </p>
              <p className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold mt-1">
                "{activeSector.tagline}"
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border border-slate-100 dark:border-zinc-700/60 text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
            {activeSector.description}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. DEDICATED DINAS OPERATIONAL WORKSPACE (BASED ON SELECTED DINAS) */}
        {/* ========================================================================= */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Layers className="h-4 w-4 text-teal-500" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Pusat Operasional: {activeSector.name}
            </h3>
          </div>

          {selectedDinasId === "gov_dukcapil" && (
            <GovDukcapilWorkspace orders={citizenRequests} loading={loadingRequests} />
          )}

          {selectedDinasId === "gov_dinsos" && (
            <GovDinsosWorkspace orders={citizenRequests} loading={loadingRequests} />
          )}

          {selectedDinasId === "gov_dinkes" && (
            <GovDinkesWorkspace orders={citizenRequests} loading={loadingRequests} />
          )}

          {selectedDinasId === "gov_dispar" && (
            <GovDisparWorkspace />
          )}

          {selectedDinasId === "gov_diskop" && (
            <GovDiskopWorkspace orders={citizenRequests} loading={loadingRequests} />
          )}

          {selectedDinasId === "gov_dishub" && (
            <GovDishubWorkspace />
          )}

          {/* Fallback for other dinas */}
          {![
            "gov_dukcapil", 
            "gov_dinsos", 
            "gov_dinkes", 
            "gov_dispar", 
            "gov_diskop", 
            "gov_dishub"
          ].includes(selectedDinasId) && (
            <GovDukcapilWorkspace orders={citizenRequests} loading={loadingRequests} />
          )}
        </div>

        {/* ========================================================================= */}
        {/* 4. CIVIC BROADCAST COMPOSER (PER DINAS) */}
        {/* ========================================================================= */}
        <div className="sg-card p-5 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 space-y-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Terbitkan Siaran Resmi: {activeSector.name}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Pesan darurat & pengumuman resmi ke seluruh smartphone warga & mitra
              </p>
            </div>
          </div>

          <form onSubmit={handleSendBroadcast} className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                Judul Pengumuman
              </label>
              <input
                type="text"
                value={announcementTitle}
                onChange={(e) => setAnnouncementTitle(e.target.value)}
                placeholder={`Contoh: [${activeSector.name}] Pengumuman Layanan Warga...`}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                Target Penerima Siaran
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value as BroadcastTarget)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-teal-500"
              >
                <option value="all">📢 Seluruh Warga, Driver & UMKM (Publik)</option>
                <option value="driver">🛵 Khusus Mitra Driver Ojek & Mobil</option>
                <option value="merchant">🍲 Khusus Mitra UMKM & Pedagang Pasar</option>
                <option value="customer">🛒 Khusus Pelanggan / Warga Perumahan</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                Isi Pengumuman Resmi
              </label>
              <textarea
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                rows={3}
                placeholder="Tulis instruksi, jadwal, atau informasi detail dari dinas terkait..."
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isBroadcasting}
              className="w-full h-11 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-2xl shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              {isBroadcasting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Menyiarkan ke Seluruh Warga...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" /> Publikasikan Siaran Resmi
                </>
              )}
            </Button>
          </form>
        </div>

        {/* ========================================================================= */}
        {/* 5. LIVE CIVIC BROADCASTS FEED */}
        {/* ========================================================================= */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
              Siaran Aktif Terpasang di Kota Solo ({broadcasts.length})
            </h3>
          </div>

          {loadingBroadcasts ? (
            <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800">
              <Loader2 className="h-6 w-6 text-teal-500 animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500">Memuat siaran aktif...</p>
            </div>
          ) : broadcasts.length === 0 ? (
            <div className="p-6 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 text-xs text-slate-500">
              Belum ada siaran aktif. Gunakan form di atas untuk menerbitkan pengumuman.
            </div>
          ) : (
            <div className="space-y-3">
              {broadcasts.map((b) => (
                <div
                  key={b.id}
                  className="sg-card p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 space-y-2 shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{b.title}</span>
                        <Badge variant="teal" size="sm">{b.target?.toUpperCase() || "ALL"}</Badge>
                      </div>
                      <p className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold mt-0.5">{b.institutionName}</p>
                    </div>
                    {b.isActive && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => b.id && handleDeactivate(b.id)}
                        disabled={isToggling === b.id}
                        className="h-7 text-[10px] text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/10 rounded-lg cursor-pointer"
                      >
                        Akhiri Siaran
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">{b.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Account Drawer */}
      <ProfileDrawer 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
      />
    </div>
  );
}
