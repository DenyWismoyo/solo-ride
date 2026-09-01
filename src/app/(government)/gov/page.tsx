"use client";

import React, { useState, useMemo } from "react";
import { useGovWorkspace, GovTab } from "@/components/government/layout/GovWorkspaceContext";
import { useAuthContext } from "@/components/AuthProvider";
import { broadcastService } from "@/services/broadcast.service";
import { useBroadcasts } from "@/hooks/useBroadcasts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GOVERNMENT_SECTORS } from "@/constants/ecosystemSectors";
import { 
  Megaphone, 
  Users, 
  ShieldCheck, 
  Send, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  MapPin, 
  FileCheck2, 
  ChevronRight, 
  Inbox, 
  Clock, 
  Layers, 
  History,
  Search,
  X,
  Building2,
  ExternalLink,
  Phone,
  Filter,
  Check
} from "lucide-react";
import { BroadcastTarget } from "@/types/notification.types";
import { OrderDocument } from "@/types/order.types";
import { GovWorkspaceDispatcher } from "@/components/government/workspaces/GovWorkspaceDispatcher";
import { CivicServiceFulfillmentModal } from "@/components/government/shared/CivicServiceFulfillmentModal";
import { GovServiceCatalogManager } from "@/components/government/services/GovServiceCatalogManager";
import { formatRupiah } from "@/lib/utils";

export default function GovernmentDashboardPage() {
  const { user, userData } = useAuthContext();
  const {
    activeSector,
    selectedDinasId,
    setSelectedDinasId,
    activeTab,
    setActiveTab,
    setIsOPDDrawerOpen,
    setIsHistoryModalOpen,
    citizenRequests,
    loadingRequests,
    pendingCount
  } = useGovWorkspace();

  // Orders Tab Filter & Search State
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [selectedFulfillmentOrder, setSelectedFulfillmentOrder] = useState<OrderDocument | null>(null);

  // Broadcast Form States
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementText, setAnnouncementText] = useState("");
  const [targetRole, setTargetRole] = useState<BroadcastTarget>("all");
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isToggling, setIsToggling] = useState<string | null>(null);

  // Real-time civic broadcasts listener
  const { broadcasts, loading: loadingBroadcasts } = useBroadcasts();

  // Filtered Citizen Requests for Orders Tab
  const filteredOrders = useMemo(() => {
    return citizenRequests.filter((order) => {
      const matchStatus = 
        orderStatusFilter === "all" ? true :
        orderStatusFilter === "pending_verification" ? order.status === "pending_verification" :
        orderStatusFilter === "in_progress" ? (order.status === "pending" || order.status === "accepted" || order.status === "in_progress") :
        orderStatusFilter === "completed" ? order.status === "completed" :
        orderStatusFilter === "rejected" ? order.status === "rejected" : true;

      const q = orderSearchQuery.toLowerCase().trim();
      const matchSearch = !q ||
        order.id?.toLowerCase().includes(q) ||
        order.customerName?.toLowerCase().includes(q) ||
        order.serviceTitle?.toLowerCase().includes(q) ||
        (order.citizenDetails?.nikOrRef && order.citizenDetails.nikOrRef.toLowerCase().includes(q));

      return matchStatus && matchSearch;
    });
  }, [citizenRequests, orderStatusFilter, orderSearchQuery]);

  const handleDeactivateBroadcast = async (id: string) => {
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
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. HORIZONTAL OPD QUICK SLIDER (FOR FAST TOUCH SWITCHING)                 */}
      {/* ========================================================================= */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-zinc-200">
              Instansi Pemerintah Kota Surakarta
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsOPDDrawerOpen(true)}
            className="text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>Semua 18 Dinas</span>
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide no-scrollbar touch-pan-x">
          {GOVERNMENT_SECTORS.map((dinas) => {
            const isSelected = dinas.id === selectedDinasId;
            return (
              <button
                key={dinas.id}
                type="button"
                onClick={() => setSelectedDinasId(dinas.id)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer border ${
                  isSelected
                    ? "bg-teal-600 text-white border-teal-500 shadow-md shadow-teal-500/20 scale-102"
                    : "bg-white dark:bg-[#0c1220] text-slate-700 dark:text-zinc-300 border-slate-200/80 dark:border-white/[0.08] hover:border-teal-500/40"
                }`}
              >
                <span className="text-base">{dinas.avatar}</span>
                <span className="whitespace-nowrap text-[11px] font-bold">{dinas.name.replace("Dinas ", "")}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. ACTIVE DINAS HERO BENTO                                                */}
      {/* ========================================================================= */}
      <div className="p-5 sm:p-6 rounded-[2rem] bg-white/85 dark:bg-[#0c1220]/85 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] shadow-[0_8px_30px_-4px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,0.7)] dark:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(255,255,255,0.08)] space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-500/15 border border-teal-500/30 text-teal-600 dark:text-teal-400 flex items-center justify-center text-3xl shrink-0 shadow-inner">
              {activeSector.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  {activeSector.name}
                </h1>
                <Badge variant="teal" size="sm" className="font-bold">
                  RESMI PEMKOT
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                {activeSector.agencyOrCompanyName}
              </p>
              <p className="text-xs text-teal-600 dark:text-teal-400 font-bold mt-0.5">
                &ldquo;{activeSector.tagline}&rdquo;
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsHistoryModalOpen(true)}
              className="flex-1 sm:flex-initial rounded-xl text-xs font-bold gap-1.5 h-10"
            >
              <History className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <span>Audit Log OPD</span>
            </Button>
            <Button
              size="sm"
              onClick={() => window.open(`/services/gov/${activeSector.id}`, "_blank")}
              className="flex-1 sm:flex-initial rounded-xl text-xs font-bold gap-1.5 h-10 bg-teal-600 hover:bg-teal-500 text-white"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Portal Warga</span>
            </Button>
          </div>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-white/[0.02] rounded-2xl border border-slate-100 dark:border-white/[0.04] text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
          {activeSector.description}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB CONTENT: 1. WORKSPACE OPERASIONAL                                     */}
      {/* ========================================================================= */}
      {activeTab === "workspace" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Workspace Operasional: {activeSector.name}
              </h2>
            </div>
            <Badge variant="teal" size="sm" className="font-bold">
              {activeSector.services.length} Sub-Layanan Aktif
            </Badge>
          </div>

          <GovWorkspaceDispatcher
            dinasId={selectedDinasId}
            orders={citizenRequests}
            loading={loadingRequests}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB CONTENT: 2. ANTREAN PERMOHONAN                                        */}
      {/* ========================================================================= */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Antrean & Berkas Permohonan Warga ({activeSector.name})
              </h2>
              <p className="text-xs text-slate-500">
                Total {citizenRequests.length} permohonan tercatat di database
              </p>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/[0.04] p-1 rounded-xl overflow-x-auto no-scrollbar">
              {[
                { id: "all", label: "Semua" },
                { id: "pending_verification", label: `Verifikasi (${pendingCount})` },
                { id: "in_progress", label: "Proses" },
                { id: "completed", label: "Selesai" },
                { id: "rejected", label: "Ditolak" },
              ].map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setOrderStatusFilter(filter.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    orderStatusFilter === filter.id
                      ? "bg-white dark:bg-[#0c1220] text-teal-600 dark:text-teal-400 shadow-xs"
                      : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={orderSearchQuery}
              onChange={(e) => setOrderSearchQuery(e.target.value)}
              placeholder="Cari nama warga, nomor NIK, jenis permohonan, atau ID pesanan..."
              className="w-full pl-10 pr-9 py-2.5 bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-teal-500 shadow-xs"
            />
            {orderSearchQuery && (
              <button
                onClick={() => setOrderSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Orders List */}
          {loadingRequests ? (
            <div className="p-12 text-center bg-white dark:bg-[#0c1220] rounded-3xl border border-slate-200 dark:border-white/10">
              <Loader2 className="h-6 w-6 animate-spin text-teal-500 mx-auto mb-2" />
              <p className="text-xs text-slate-500">Memuat permohonan masuk...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-[#0c1220] rounded-3xl border border-slate-200 dark:border-white/10 space-y-2">
              <Inbox className="h-10 w-10 text-slate-300 dark:text-zinc-700 mx-auto" />
              <h4 className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                Tidak ada permohonan pada filter ini
              </h4>
              <p className="text-[11px] text-slate-400">
                Permohonan baru dari warga akan otomatis tampil secara realtime di sini.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredOrders.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-2xl bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/[0.08] shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 block">
                        #{req.id?.slice(0, 8).toUpperCase()}
                      </span>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white">
                        {req.serviceTitle || "Layanan Dinas"}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                        Pemohon: <span className="font-bold text-slate-800 dark:text-zinc-200">{req.customerName}</span>
                      </p>
                    </div>

                    <Badge
                      variant={
                        req.status === "pending_verification" ? "rose" :
                        req.status === "in_progress" || req.status === "accepted" ? "blue" :
                        req.status === "completed" ? "emerald" : "outline"
                      }
                      size="sm"
                      className="text-[9px] font-bold"
                    >
                      {req.status === "pending_verification" ? "Menunggu Verifikasi" :
                       req.status === "in_progress" ? "Dalam Pengantaran" :
                       req.status === "accepted" ? "Driver Menuju Lokasi" :
                       req.status === "completed" ? "Selesai" :
                       req.status === "rejected" ? "Ditolak" : req.status}
                    </Badge>
                  </div>

                  {req.citizenDetails && (
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] text-[11px] space-y-1 text-slate-600 dark:text-zinc-300">
                      {req.citizenDetails.nikOrRef && (
                        <p><span className="text-slate-400">NIK/Ref:</span> {req.citizenDetails.nikOrRef}</p>
                      )}
                      {req.citizenDetails.notes && (
                        <p><span className="text-slate-400">Catatan:</span> {req.citizenDetails.notes}</p>
                      )}
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 dark:border-white/[0.04] flex items-center justify-between text-xs gap-2">
                    <span className="text-[10px] text-slate-400">
                      Biaya: <strong className="text-slate-700 dark:text-zinc-200">{req.price === 0 ? "Gratis / Subsidi" : formatRupiah(req.price)}</strong>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`/order/${req.id}`, "_blank")}
                        className="h-7 text-[10px] font-bold rounded-lg"
                      >
                        Detail
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setSelectedFulfillmentOrder(req)}
                        className="h-7 text-[10px] font-bold rounded-lg bg-teal-600 hover:bg-teal-500 text-white"
                      >
                        Proses & Verifikasi
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB CONTENT: 3. KATALOG & TEMPLATE LAYANAN OPD                            */}
      {/* ========================================================================= */}
      {activeTab === "catalog" && (
        <GovServiceCatalogManager sector={activeSector} />
      )}

      {/* ========================================================================= */}
      {/* TAB CONTENT: 4. PUSAT SIARAN RESMI                                        */}
      {/* ========================================================================= */}
      {activeTab === "broadcast" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form Composer */}
          <div className="lg:col-span-6 p-5 sm:p-6 rounded-[2rem] bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/[0.08] shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <Megaphone className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Terbitkan Siaran Resmi ({activeSector.name})
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Notifikasi instan ke smartphone warga, driver & UMKM Surakarta
                </p>
              </div>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                  Judul Pengumuman
                </label>
                <input
                  type="text"
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  placeholder={`Contoh: [${activeSector.name}] Informasi Layanan Warga...`}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
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
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-teal-500"
                >
                  <option value="all">📢 Seluruh Warga, Driver & UMKM (Publik Solo)</option>
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
                  placeholder="Tuliskan detail pengumuman resmi dari dinas terkait..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isBroadcasting}
                className="w-full h-11 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold gap-2 shadow-md shadow-teal-500/20"
              >
                {isBroadcasting ? (
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span>Terbitkan Siaran ke Seluruh Kota Solo</span>
              </Button>
            </form>
          </div>

          {/* Active Broadcasts List */}
          <div className="lg:col-span-6 p-5 sm:p-6 rounded-[2rem] bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/[0.08] shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              Daftar Siaran Aktif di Kota Surakarta
            </h3>

            {loadingBroadcasts ? (
              <div className="py-12 text-center text-xs text-slate-400">
                <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-teal-500" />
                Memuat siaran...
              </div>
            ) : broadcasts.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Belum ada siaran aktif yang dipublikasikan.
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto sg-custom-scrollbar pr-1">
                {broadcasts.map((bc) => (
                  <div
                    key={bc.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {bc.title}
                        </h4>
                        <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">
                          {bc.institutionName}
                        </span>
                      </div>
                      <Badge variant={bc.isActive ? "teal" : "outline"} size="sm" className="text-[9px]">
                        {bc.isActive ? "Aktif" : "Non-aktif"}
                      </Badge>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-zinc-300 line-clamp-2">
                      {bc.body}
                    </p>

                    {bc.isActive && (
                      <div className="pt-2 border-t border-slate-100 dark:border-white/[0.04] flex justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isToggling === bc.id}
                          onClick={() => bc.id && handleDeactivateBroadcast(bc.id)}
                          className="h-7 text-[10px] rounded-lg text-rose-600 hover:bg-rose-50 border-rose-200"
                        >
                          {isToggling === bc.id ? "Memproses..." : "Akhiri Siaran"}
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB CONTENT: 4. BUKU EKSPEDISI & AUDIT LOG                                */}
      {/* ========================================================================= */}
      {activeTab === "audit" && (
        <div className="p-5 sm:p-6 rounded-[2rem] bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/[0.08] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <History className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Buku Ekspedisi & Audit Log: {activeSector.name}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Immutable Chain of Custody pencatatan verifikasi dan penyerahan berkas
                </p>
              </div>
            </div>

            <Button
              size="sm"
              onClick={() => setIsHistoryModalOpen(true)}
              className="rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white h-9"
            >
              Buka Audit Log Lengkap
            </Button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
            Setiap aksi verifikasi, persetujuan, penolakan dengan alasan resmi, dan pengantaran oleh kurir mitra driver tercatat secara permanen di sub-collection <code className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono text-[10px]">orders/{`{orderId}`}/auditLog</code> sesuai standar regulasi Pemkot Surakarta.
          </div>
        </div>
      )}

      {/* Dynamic Fulfillment Modal */}
      {selectedFulfillmentOrder && (
        <CivicServiceFulfillmentModal
          order={selectedFulfillmentOrder}
          isOpen={Boolean(selectedFulfillmentOrder)}
          onClose={() => setSelectedFulfillmentOrder(null)}
        />
      )}
    </div>
  );
}
