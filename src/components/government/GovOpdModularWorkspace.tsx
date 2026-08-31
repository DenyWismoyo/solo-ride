"use client";

import React, { useState } from "react";
import { OrderDocument } from "@/types/order.types";
import { SectorDefinition } from "@/constants/ecosystemSectors";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileCheck2, 
  CheckCircle2, 
  Loader2, 
  ShieldCheck, 
  Search, 
  Clock, 
  AlertTriangle, 
  Sparkles, 
  Phone, 
  MapPin, 
  HelpCircle,
  Truck,
  Activity,
  Layers,
  Send
} from "lucide-react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";

interface GovOpdModularWorkspaceProps {
  sector: SectorDefinition;
  orders: OrderDocument[];
  loading: boolean;
}

export function GovOpdModularWorkspace({ sector, orders, loading }: GovOpdModularWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<"requests" | "features" | "operational">("requests");
  const [searchQuery, setSearchQuery] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const pendingOrders = orders.filter(o => o.status === "pending_verification");
  const inProgressOrders = orders.filter(o => o.status === "in_progress" || o.status === "accepted" || o.status === "pending");
  const completedOrders = orders.filter(o => o.status === "completed");

  const filteredOrders = orders.filter(o => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      (o.customerName || "").toLowerCase().includes(q) ||
      (o.serviceTitle || "").toLowerCase().includes(q) ||
      (o.dropoffLocation?.address || "").toLowerCase().includes(q) ||
      (o.citizenDetails?.notes || "").toLowerCase().includes(q);
    return matchesSearch;
  });

  const handleApproveCitizenRequest = async (orderId: string) => {
    setProcessingId(orderId);
    try {
      await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
        status: "pending", // Masuk radar driver mitra
        verifiedByDinasAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      alert(`✅ Permohonan layanan [${sector.name}] berhasil disetujui & dialokasikan ke armada mitra terdekat!`);
    } catch (err: any) {
      console.error("Gagal memproses permohonan dinas:", err);
      alert(`Gagal memproses: ${err.message || err}`);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. EXECUTIVE METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/[0.08] text-center space-y-0.5 shadow-sm">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Permohonan Masuk</span>
          <div className="text-xl font-black text-slate-900 dark:text-white">{orders.length}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center space-y-0.5 shadow-sm">
          <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wider">Perlu Tindakan Dinas</span>
          <div className="text-xl font-black text-rose-600 dark:text-rose-400">{pendingOrders.length}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-0.5 shadow-sm">
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">Armada / Driver Siaga</span>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400">{inProgressOrders.length}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-0.5 shadow-sm">
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Layanan Tuntas</span>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">{completedOrders.length}</div>
        </div>
      </div>

      {/* 2. TAB SELECTOR */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-white/[0.04] rounded-2xl">
        <button
          onClick={() => setActiveTab("requests")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "requests"
              ? "bg-white dark:bg-zinc-900 text-teal-600 dark:text-teal-400 shadow-sm border border-slate-200 dark:border-zinc-800"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900"
          }`}
        >
          <FileCheck2 className="h-4 w-4" />
          <span>Antrean Layanan Warga ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("features")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "features"
              ? "bg-white dark:bg-zinc-900 text-teal-600 dark:text-teal-400 shadow-sm border border-slate-200 dark:border-zinc-800"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>Katalog Program & SOP ({sector.services.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("operational")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "operational"
              ? "bg-white dark:bg-zinc-900 text-teal-600 dark:text-teal-400 shadow-sm border border-slate-200 dark:border-zinc-800"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900"
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>Pusat Kendali Solo</span>
        </button>
      </div>

      {/* TAB 1: CITIZEN REQUESTS */}
      {activeTab === "requests" && (
        <div className="space-y-3.5">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Cari permohonan layanan ${sector.name}...`}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-teal-500"
            />
          </div>

          {loading ? (
            <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800">
              <Loader2 className="h-6 w-6 text-teal-500 animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500">Memeriksa antrean berkas & permohonan warga...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 text-xs text-slate-500 space-y-1">
              <p className="font-bold">Belum ada permohonan layanan baru yang menunggu tindakan.</p>
              <p className="text-[11px] opacity-70">Warga dapat mengajukan layanan ini melalui menu katalog layanan kota.</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className="sg-card p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 space-y-3 shadow-sm hover:border-teal-500/40 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {order.serviceTitle || sector.name}
                      </span>
                      <Badge
                        variant={order.status === "pending_verification" ? "rose" : "emerald"}
                        size="sm"
                      >
                        {order.status === "pending_verification" ? "Perlu Validasi Dinas" : "Telah Divalidasi"}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-zinc-300">
                      Pemohon: <strong>{order.customerName}</strong> • {order.customerPhone}
                    </p>
                  </div>

                  <span className="text-xs font-black text-teal-600 dark:text-teal-400">
                    {order.price === 0 ? "Subsidi Pemkot (Rp 0)" : `Rp ${(order.price || 0).toLocaleString("id-ID")}`}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl space-y-1 text-xs text-slate-600 dark:text-zinc-300 border border-slate-100 dark:border-zinc-700/60">
                  <div className="flex justify-between">
                    <span className="text-[10px] text-slate-400">Alamat / Lokasi Warga:</span>
                    <span className="font-medium text-slate-800 dark:text-zinc-200 truncate max-w-[220px]">{order.dropoffLocation?.address || "-"}</span>
                  </div>
                  {order.citizenDetails?.notes && (
                    <div className="flex justify-between">
                      <span className="text-[10px] text-slate-400">Detail Permohonan:</span>
                      <span className="text-slate-800 dark:text-zinc-200 truncate max-w-[220px]">{order.citizenDetails.notes}</span>
                    </div>
                  )}
                </div>

                {order.status === "pending_verification" && (
                  <Button
                    size="sm"
                    onClick={() => order.id && handleApproveCitizenRequest(order.id)}
                    disabled={processingId === order.id}
                    className="w-full h-9 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {processingId === order.id ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Menugaskan Petugas & Armada...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" /> Setujui Layanan & Teruskan ke Driver Mitra
                      </>
                    )}
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: FEATURES & SOP */}
      {activeTab === "features" && (
        <div className="space-y-3">
          <div className="p-3.5 bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-500/30 rounded-2xl text-xs text-teal-900 dark:text-teal-300">
            Daftar program layanan resmi <strong>{sector.agencyOrCompanyName}</strong> yang aktif terintegrasi di platform Ride-Solo Surakarta.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sector.services.map((srv, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 space-y-1.5 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center text-[10px] font-bold">
                    {idx + 1}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{srv}</h4>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 pl-7">
                  Layanan terhubung otomatis ke aplikasi mobile warga dan armada pengemudi koperasi.
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: OPERATIONAL HUB */}
      {activeTab === "operational" && (
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="h-4 w-4 text-teal-500" />
              <span>Pusat Kendali Hyperlocal: {sector.agencyOrCompanyName}</span>
            </h4>
            <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
              Seluruh data permohonan dari warga Surakarta diproses dengan standar operasional resmi dinas. Petugas posko dapat memvalidasi dokumen, menerbitkan disposisi, dan memobilisasi armada pengemudi mitra secara terpadu.
            </p>
            <div className="p-3 bg-teal-500/10 border border-teal-500/30 rounded-xl text-center">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Status Konektivitas Sistem:</span>
              <span className="text-sm font-black text-teal-600 dark:text-teal-400">TERHUBUNG & SIAP MELAYANI WARGA (Pemkot Solo 2026)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
