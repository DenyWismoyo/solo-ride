"use client";

import React, { useState, useEffect } from "react";
import { OrderDocument } from "@/types/order.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Flame, 
  CheckCircle2, 
  Loader2, 
  ShieldAlert, 
  MapPin, 
  Phone, 
  Clock, 
  Radio, 
  Truck, 
  Compass, 
  Bug, 
  Activity, 
  Volume2, 
  VolumeX,
  Send,
  AlertTriangle,
  History
} from "lucide-react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";
import { playOrderAlertSound, stopOrderAlertSound, playSuccessChime } from "@/lib/sound";

interface GovDamkarWorkspaceProps {
  orders: OrderDocument[];
  loading: boolean;
}

const DAMKAR_SECTORS = [
  { id: "pos_induk", name: "Pos Induk Slamet Riyadi", address: "Jl. Brigjend Slamet Riyadi No. 445 (Laweyan)", fleet: "3 Unit Bronto & Water Supply" },
  { id: "pos_jebres", name: "Pos Sektor Pedaringan", address: "Kawasan Industri Pedaringan (Jebres)", fleet: "2 Unit Medium Pumper" },
  { id: "pos_banjarsari", name: "Pos Sektor Manahan", address: "Jl. KS Tubun (Banjarsari)", fleet: "2 Unit Quick Response" },
  { id: "pos_pasarkliwon", name: "Pos Sektor Gading", address: "Kawasan Pasar Kliwon & Solo Selatan", fleet: "1 Unit Tanki & Rescue Van" }
];

export function GovDamkarWorkspace({ orders, loading }: GovDamkarWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<"panic_map" | "triage" | "history">("panic_map");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedPos, setSelectedPos] = useState<string>(DAMKAR_SECTORS[0].name);
  const [dispatcherName, setDispatcherName] = useState("Danru Regu 1 Damkar Solo");
  const [isMuted, setIsMuted] = useState(false);

  // Filter orders
  const activePanicOrders = orders.filter(o => o.status === "pending" || o.status === "pending_verification");
  const inProgressOrders = orders.filter(o => o.status === "in_progress" || o.status === "accepted");
  const completedOrders = orders.filter(o => o.status === "completed");

  // Audio siren alert on new active panic orders
  useEffect(() => {
    const hasEmergency = activePanicOrders.some(o => o.citizenDetails?.isEmergency);
    if (hasEmergency && !isMuted) {
      playOrderAlertSound(true);
    } else {
      stopOrderAlertSound();
    }
    return () => {
      stopOrderAlertSound();
    };
  }, [activePanicOrders, isMuted]);

  const handleDispatchDamkar = async (orderId: string, customPos?: string) => {
    setProcessingId(orderId);
    try {
      await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
        status: "in_progress",
        verifiedByDinasAt: serverTimestamp(),
        dispatchedPos: customPos || selectedPos,
        dispatchedBy: dispatcherName,
        updatedAt: serverTimestamp()
      });
      stopOrderAlertSound();
      playSuccessChime();
      alert(`🚨 SIAGA MERAH: Armada dari [${customPos || selectedPos}] telah dikerahkan ke lokasi kejadian!`);
    } catch (err: any) {
      console.error("Gagal mendispatch armada Damkar:", err);
      alert(`Gagal dispatch: ${err.message || err}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleCompleteMission = async (orderId: string) => {
    setProcessingId(orderId);
    try {
      await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
        status: "completed",
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      playSuccessChime();
      alert("✅ Laporan Damkar telah ditandai tuntas & situasi kondusif.");
    } catch (err: any) {
      console.error("Gagal menyelesaikan laporan:", err);
      alert(`Gagal: ${err.message || err}`);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. EXECUTIVE METRICS & SIREN CONTROLLER */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center space-y-0.5 shadow-sm">
          <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wider">
            🚨 Panic / Darurat Aktif
          </span>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 animate-pulse">
            {activePanicOrders.length}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-0.5 shadow-sm">
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">
            🚒 Armada Bergerak
          </span>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {inProgressOrders.length}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-0.5 shadow-sm">
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
            ✅ Tuntas / Kondusif
          </span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {completedOrders.length}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] text-center space-y-0.5 flex flex-col justify-center items-center">
          <button
            type="button"
            onClick={() => {
              if (!isMuted) stopOrderAlertSound();
              setIsMuted(!isMuted);
            }}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              isMuted
                ? "bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"
                : "bg-rose-600 text-white shadow-md shadow-rose-600/30 animate-pulse"
            }`}
          >
            {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            <span>{isMuted ? "Alarm Dibisukan" : "Sirine Audio Aktif"}</span>
          </button>
        </div>
      </div>

      {/* 2. TAB SELECTOR */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-white/[0.04] rounded-2xl border border-slate-200/80 dark:border-white/[0.06]">
        <button
          type="button"
          onClick={() => setActiveTab("panic_map")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "panic_map"
              ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Radio className="h-3.5 w-3.5" />
          <span>Radar Panic Map ({activePanicOrders.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("triage")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "triage"
              ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Flame className="h-3.5 w-3.5" />
          <span>Triage Sektor Damkar ({inProgressOrders.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "history"
              ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <History className="h-3.5 w-3.5" />
          <span>Log Selesai ({completedOrders.length})</span>
        </button>
      </div>

      {/* 3. TAB CONTENTS */}
      {loading ? (
        <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800">
          <Loader2 className="h-6 w-6 text-rose-500 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">Menghubungkan ke Pusat Komando Damkar...</p>
        </div>
      ) : activeTab === "panic_map" ? (
        /* LIVE PANIC RADAR TAB */
        <div className="space-y-3.5">
          {/* Pos Sektor Status Card */}
          <div className="p-4 bg-white/90 dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/[0.08] rounded-3xl space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-rose-600" />
                Kesiapan 4 Pos Sektor Pemadam Kebakaran Surakarta
              </h4>
              <span className="text-[10px] text-emerald-600 font-bold">🟢 Siaga 24 Jam</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {DAMKAR_SECTORS.map((pos) => (
                <div key={pos.id} className="p-2.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900 dark:text-white text-xs">{pos.name}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 font-bold">Siap Luncur</span>
                  </div>
                  <p className="text-[10px] text-slate-500">{pos.address}</p>
                  <p className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">{pos.fleet}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Active Panic List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 animate-bounce" />
                Permohonan Masuk ({activePanicOrders.length})
              </h4>
            </div>

            {activePanicOrders.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 text-xs text-slate-500 space-y-1">
                <ShieldAlert className="h-8 w-8 text-emerald-500 mx-auto mb-1 opacity-75" />
                <p className="font-bold text-slate-700 dark:text-zinc-300">Situasi Kota Surakarta Terpantau Aman</p>
                <p className="text-[11px] text-slate-400">Tidak ada sinyal panic button atau laporan darurat aktif saat ini.</p>
              </div>
            ) : (
              activePanicOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 rounded-3xl bg-rose-500/10 border-2 border-rose-500/40 space-y-3 shadow-lg shadow-rose-500/10 animate-in fade-in"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="rose" size="sm" className="animate-pulse">
                          {order.citizenDetails?.isEmergency ? "🚨 DARURAT API" : "🐝 RESCUE"}
                        </Badge>
                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          {order.serviceTitle}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-zinc-300 flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                        <span className="font-semibold">{order.dropoffLocation?.address}</span>
                      </p>
                      {order.citizenDetails?.gpsCoords && (
                        <p className="text-[10px] font-mono text-rose-700 dark:text-rose-300 bg-white/60 dark:bg-black/30 px-2 py-0.5 rounded-md inline-block">
                          GPS: {order.citizenDetails.gpsCoords.lat.toFixed(6)}, {order.citizenDetails.gpsCoords.lng.toFixed(6)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-white/80 dark:bg-black/40 text-xs text-slate-700 dark:text-zinc-300 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Pelapor:</span>
                      <span className="font-bold text-xs">{order.customerName}</span>
                    </div>
                    <a
                      href={`tel:${order.customerPhone}`}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-xl flex items-center gap-1 shadow-sm"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      <span>{order.customerPhone}</span>
                    </a>
                  </div>

                  {/* Dispatch Sektor Selector */}
                  <div className="pt-2 border-t border-rose-500/20 flex flex-col sm:flex-row gap-2">
                    <select
                      value={selectedPos}
                      onChange={(e) => setSelectedPos(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white dark:bg-zinc-800 border border-rose-500/30 rounded-xl text-xs text-slate-900 dark:text-white font-bold"
                    >
                      {DAMKAR_SECTORS.map((s) => (
                        <option key={s.id} value={s.name}>Kirim: {s.name}</option>
                      ))}
                    </select>

                    <Button
                      onClick={() => order.id && handleDispatchDamkar(order.id, selectedPos)}
                      disabled={processingId === order.id}
                      className="h-10 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {processingId === order.id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Mengerahkan Armada...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" /> Luncurkan Armada Pos
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : activeTab === "triage" ? (
        /* IN PROGRESS / RUNNING TRIAGE TAB */
        <div className="space-y-3">
          {inProgressOrders.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 text-xs text-slate-500">
              Tidak ada operasi pemadaman atau evakuasi yang sedang berlangsung.
            </div>
          ) : (
            inProgressOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/30 space-y-3 shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="teal" size="sm">ARMADA DI LAPANGAN</Badge>
                      <span className="text-xs font-black text-slate-900 dark:text-white">{order.serviceTitle}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-zinc-300 mt-1">
                      Lokasi: {order.dropoffLocation?.address}
                    </p>
                  </div>
                </div>

                <div className="p-2.5 rounded-2xl bg-white/70 dark:bg-black/30 text-xs text-slate-700 dark:text-zinc-300 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[10px] text-slate-500">Pos Pengirim:</span>
                    <span className="font-bold text-amber-700 dark:text-amber-400">{(order as any).dispatchedPos || "Pos Induk Slamet Riyadi"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] text-slate-500">Komandan Regu:</span>
                    <span className="font-semibold">{(order as any).dispatchedBy || "Regu Siaga"}</span>
                  </div>
                </div>

                <Button
                  onClick={() => order.id && handleCompleteMission(order.id)}
                  disabled={processingId === order.id}
                  className="w-full h-10 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {processingId === order.id ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Memperbarui Status...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" /> Tandai Api Padam / Penanganan Tuntas
                    </>
                  )}
                </Button>
              </div>
            ))
          )}
        </div>
      ) : (
        /* HISTORY TAB */
        <div className="space-y-3">
          {completedOrders.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 text-xs text-slate-500">
              Belum ada riwayat operasi tuntas pada sesi ini.
            </div>
          ) : (
            completedOrders.map((order) => (
              <div
                key={order.id}
                className="p-3.5 rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 space-y-1.5 shadow-sm text-xs"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900 dark:text-white">{order.serviceTitle}</span>
                  <Badge variant="emerald" size="sm">TUNTAS</Badge>
                </div>
                <p className="text-[11px] text-slate-500">{order.dropoffLocation?.address}</p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  Ditangani oleh: {(order as any).dispatchedPos || "Pos Damkar Surakarta"}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
