"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { broadcastService } from "@/services/broadcast.service";
import { useBroadcasts } from "@/hooks/useBroadcasts";
import { AppHeader } from "@/components/layout/AppHeader";
import { AdminImpersonationBar } from "@/components/admin/AdminImpersonationBar";
import { ProfileDrawer } from "@/components/layout/ProfileDrawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  Loader2
} from "lucide-react";
import { BroadcastTarget } from "@/types/notification.types";

export default function GovernmentDashboard() {
  const router = useRouter();
  const { user, userData } = useAuthContext();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementText, setAnnouncementText] = useState("");
  const [targetRole, setTargetRole] = useState<BroadcastTarget>("all");
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isToggling, setIsToggling] = useState<string | null>(null);

  // Real-time civic broadcasts listener
  const { broadcasts, loading: loadingBroadcasts } = useBroadcasts();

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
        institutionName: userData?.institutionName || "Pemerintah Kota Surakarta & Koperasi Warga",
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
      alert("✅ Pengumuman resmi berhasil dipublikasikan ke Firestore dan disiarkan ke seluruh aplikasi warga & mitra di Surakarta!");
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
        {/* Civic Entity Banner */}
        <div className="sg-card p-5 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-gradient-to-tr dark:from-teal-950/30 dark:via-zinc-900 dark:to-zinc-900 space-y-4 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-500/30 shrink-0">
              <Landmark className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                {userData?.institutionName || "Pemerintah Kota Surakarta & Koperasi Warga"}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                <span className="text-teal-600 dark:text-teal-400 font-semibold">Dinas Koperasi & UMKM</span>
                <span>•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Portal Smart Civic</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800/80 text-center">
            <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-zinc-800/40">
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-medium">Perputaran Lokal</span>
              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">Rp 128 Juta</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-zinc-800/40">
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-medium">Mitra UMKM Binaan</span>
              <span className="text-sm font-black text-slate-900 dark:text-white">64 Toko</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-zinc-800/40">
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-medium">Dana SHU Terkumpul</span>
              <span className="text-sm font-black text-amber-600 dark:text-amber-400">Rp 14.8 Juta</span>
            </div>
          </div>
        </div>

        {/* Civic Broadcast Form */}
        <div className="sg-card p-4 rounded-3xl border border-teal-500/30 bg-white/90 dark:bg-zinc-900/90 space-y-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Broadcast Pengumuman Resmi Warga
            </h3>
          </div>

          <form onSubmit={handleSendBroadcast} className="space-y-2.5 text-xs">
            <div>
              <input
                type="text"
                value={announcementTitle}
                onChange={(e) => setAnnouncementTitle(e.target.value)}
                placeholder="Judul Pengumuman (misal: Operasi Pasar Murah Sembako Warga)"
                className="w-full bg-slate-50 dark:bg-zinc-800/70 border border-slate-300 dark:border-zinc-700/80 rounded-xl p-2.5 text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:border-teal-500"
                required
              />
            </div>

            <div>
              <textarea
                rows={2}
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                placeholder="Isi rincian pengumuman kecamatan, pasar murah, atau program subsidi..."
                className="w-full bg-slate-50 dark:bg-zinc-800/70 border border-slate-300 dark:border-zinc-700/80 rounded-xl p-2.5 text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:border-teal-500 resize-none shadow-inner"
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-[11px] font-bold text-slate-600 dark:text-zinc-400">Target Sasaran:</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value as BroadcastTarget)}
                className="p-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white text-[11px]"
              >
                <option value="all">Seluruh Warga & Mitra</option>
                <option value="customer">Hanya Pelanggan (Warga)</option>
                <option value="driver">Hanya Driver Mitra</option>
                <option value="merchant">Hanya Merchant UMKM</option>
              </select>
            </div>

            <Button
              type="submit"
              disabled={isBroadcasting}
              className="w-full h-10 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              {isBroadcasting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Mengirim Siaran...
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  Publikasikan Siaran Resmi
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Broadcast History */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white sg-editorial-title">
            Riwayat Siaran Resmi Pemda & Koperasi ({broadcasts.length})
          </h3>

          {loadingBroadcasts ? (
            <div className="p-6 text-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl">
              <Loader2 className="h-5 w-5 text-teal-500 animate-spin mx-auto mb-1" />
              <p className="text-xs text-slate-500">Memuat siaran aktif...</p>
            </div>
          ) : broadcasts.length === 0 ? (
            <div className="sg-card p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 text-center text-xs text-slate-500">
              Belum ada siaran resmi yang dipublikasikan.
            </div>
          ) : (
            <div className="space-y-2.5">
              {broadcasts.map((b) => (
                <div
                  key={b.id}
                  className="sg-card p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/80 space-y-2 shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">{b.title}</h4>
                    <span className="text-[10px] text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-md shrink-0 font-bold ml-2">
                      Sasaran: {b.target}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-zinc-300">{b.body}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-zinc-400 border-t border-slate-200 dark:border-zinc-800/80 pt-2">
                    <span>Wilayah: {b.geofence?.areaName || "Surakarta"}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Aktif Mengudara</span>
                      <Button
                        size="sm"
                        variant="danger"
                        className="h-6 text-[9px] px-2"
                        disabled={isToggling === b.id}
                        onClick={() => b.id && handleDeactivate(b.id)}
                      >
                        {isToggling === b.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Akhiri"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <ProfileDrawer isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
}
