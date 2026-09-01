"use client";

import React, { useState, useEffect, useRef } from "react";
import { OrderDocument } from "@/types/order.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Flame, Phone, MapPin, CheckCircle2, Loader2, AlertOctagon , XCircle} from "lucide-react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";
import { RejectionModal } from "@/components/government/shared/RejectionModal";
import { useAuthContext } from "@/components/AuthProvider";
import { writeAuditLog } from "@/lib/auditLog";
import { playOrderAlertSound } from "@/lib/sound";

interface GovWorkspaceProps {
  orders: OrderDocument[];
  loading: boolean;
}

export function DamkarWorkspace({ orders, loading }: GovWorkspaceProps) {
  const { user, userData } = useAuthContext();
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  const [rejectionTarget, setRejectionTarget] = useState<OrderDocument | null>(null);

  const handleReject = async (reason: string) => {
    if (!rejectionTarget?.id) return;
    const orderId = rejectionTarget.id;
    
    setDispatchingId(orderId);
    try {
      await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
        status: "rejected",
        rejectionReason: reason,
        rejectedByDinasAt: serverTimestamp(),
        rejectedByDinasName: userData?.displayName || "Petugas Damkar",
        updatedAt: serverTimestamp()
      });
      
      if (user) {
        await writeAuditLog({
          orderId,
          action: "rejected",
          actorId: user.uid,
          actorName: userData?.displayName || "Petugas Damkar",
          actorRole: userData?.additionalRole || "government",
          notes: reason
        });
      }
      
      alert("Permohonan berhasil ditolak.");
    } catch (err: any) {
      alert(`Gagal menolak: ${err.message || err}`);
    } finally {
      setDispatchingId(null);
      setRejectionTarget(null);
    }
  };
  const previousOrderCountRef = useRef(0);

  const panicOrders = orders.filter(o => o.serviceType?.includes("damkar") || o.serviceType?.includes("panic"));

  const daruratAktif = panicOrders.filter(o => o.status === "pending" && (o as any).serviceId !== "damkar_animal_rescue" && !o.serviceType?.includes("animal"));
  const animalRescue = panicOrders.filter(o => o.status === "pending" && ((o as any).serviceId === "damkar_animal_rescue" || o.serviceType?.includes("animal")));
  const riwayat = panicOrders.filter(o => o.status !== "pending");

  const [activeTab, setActiveTab] = useState<"darurat" | "animal" | "riwayat">("darurat");

  const displayedOrders = activeTab === "darurat" ? daruratAktif : activeTab === "animal" ? animalRescue : riwayat;

  const completedDamkarOrders = riwayat.filter(o => o.status === "completed");
  const avgResponseTime = completedDamkarOrders.length > 0 
    ? Math.round(completedDamkarOrders.reduce((acc, o) => {
        const start = o.createdAt?.toDate ? o.createdAt.toDate().getTime() : new Date(o.createdAt).getTime();
        const end = o.updatedAt?.toDate ? o.updatedAt.toDate().getTime() : new Date(o.updatedAt).getTime();
        return acc + (end - start);
      }, 0) / completedDamkarOrders.length / 60000)
    : 0;

  useEffect(() => {
    const currentPending = orders.filter(o =>
      o.status === "pending" &&
      (o.serviceType?.includes("damkar") || o.serviceType?.includes("panic"))
    );
    if (currentPending.length > previousOrderCountRef.current && previousOrderCountRef.current !== 0) {
      playOrderAlertSound(); // Bunyi alert saat laporan baru
    }
    previousOrderCountRef.current = currentPending.length;
  }, [orders]);

  const handleResolveEmergency = async (orderId: string) => {
    setDispatchingId(orderId);
    try {
      await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
        status: "completed",
        verifiedByDinasAt: serverTimestamp(),
        verifiedByDinasName: userData?.displayName || "Petugas Damkar",
        updatedAt: serverTimestamp()
      });
      
      if (user) {
        await writeAuditLog({
          orderId,
          action: "completed",
          actorId: user.uid,
          actorName: userData?.displayName || "Petugas Damkar",
          actorRole: userData?.additionalRole || "government"
        });
      }

      alert("✅ Status Tanggap Darurat Damkar Telah Selesai Ditangani.");
    } catch (err: any) {
      alert(`Gagal: ${err.message || err}`);
    } finally {
      setDispatchingId(null);
    }
  };

  const getElapsedMinutes = (createdAt: any) => {
    if (!createdAt) return 0;
    const created = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
    return Math.floor((Date.now() - created.getTime()) / 60000);
  };

  return (
    <div className="space-y-5">
      {/* 1. METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Main Bento Cell */}
        <div className="sm:col-span-2 p-5 rounded-[2rem] bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent border border-red-500/20 flex flex-col justify-between h-full min-h-[120px]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-red-500/20 text-red-600 dark:text-red-400">
              <Flame className="h-5 w-5" />
            </div>
            <span className="text-xs text-red-600 dark:text-red-400 font-bold uppercase tracking-wider">Alarm Siaga Masuk</span>
          </div>
          <div className="text-4xl sm:text-5xl font-black text-red-600 dark:text-red-400 mt-3">{daruratAktif.length}</div>
        </div>
        
        {/* Secondary Bento Cells */}
        <div className="flex flex-col gap-3">
          <div className="p-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider w-1/2">Avg Response</span>
            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">{avgResponseTime > 0 ? `${avgResponseTime} Menit` : "-"}</div>
          </div>
          <div className="grid grid-cols-2 gap-3 flex-1">
            <div className="p-3 rounded-3xl bg-teal-500/10 border border-teal-500/20 flex flex-col justify-center items-center text-center">
              <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold uppercase tracking-wider mb-1">Armada</span>
              <div className="text-xl font-black text-teal-600 dark:text-teal-400">14</div>
            </div>
            <div className="p-3 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex flex-col justify-center items-center text-center">
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider mb-1">Hidran</span>
              <div className="text-xl font-black text-blue-600 dark:text-blue-400">128</div>
            </div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-zinc-800 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab("darurat")}
          className={`px-4 py-2 text-xs font-bold rounded-full transition-colors whitespace-nowrap ${
            activeTab === "darurat" 
              ? "bg-red-600 text-white" 
              : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700"
          }`}
        >
          DARURAT AKTIF
          {daruratAktif.length > 0 && (
            <span className="ml-2 px-1.5 py-0.5 bg-white/20 rounded-md text-[10px]">{daruratAktif.length}</span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("animal")}
          className={`px-4 py-2 text-xs font-bold rounded-full transition-colors whitespace-nowrap ${
            activeTab === "animal" 
              ? "bg-orange-600 text-white" 
              : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700"
          }`}
        >
          Animal Rescue
          {animalRescue.length > 0 && (
            <span className="ml-2 px-1.5 py-0.5 bg-white/20 rounded-md text-[10px]">{animalRescue.length}</span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("riwayat")}
          className={`px-4 py-2 text-xs font-bold rounded-full transition-colors whitespace-nowrap ${
            activeTab === "riwayat" 
              ? "bg-slate-800 dark:bg-white text-white dark:text-black" 
              : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700"
          }`}
        >
          Riwayat
        </button>
      </div>

      {/* 2. ORDER LIST */}
      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Memuat data...</span>
        </div>
      ) : displayedOrders.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800">
          Tidak ada data untuk kategori ini.
        </div>
      ) : (
        <div className="space-y-3">
          {displayedOrders.map((order) => {
            const details = order.citizenDetails || {};
            const isPending = order.status !== "completed";
            const elapsed = getElapsedMinutes(order.createdAt);
            return (
              <div
                key={order.id}
                className={`p-4 rounded-2xl bg-white dark:bg-[#0c1220] border-2 shadow-md space-y-3 ${
                  isPending && elapsed > 5 ? "border-red-600" : "border-red-500/40"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Flame className="h-4 w-4 text-red-600 animate-pulse" />
                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        {details.jenisDarurat || details.emergencyCategory || "Panggilan Darurat Kebakaran"}
                      </span>
                      <Badge variant="rose" size="sm" className="text-[10px]">
                        {details.tingkatKeparahan || "Darurat"}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span>Pelapor: {details.reporterName || order.customerName}</span>
                      <span>•</span>
                      <span>Telp: {details.phone || order.customerPhone}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={isPending ? "rose" : "emerald"} size="sm">
                      {order.status}
                    </Badge>
                    {isPending && (
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-[10px] font-black ${elapsed > 7 ? "text-red-600 animate-pulse" : "text-emerald-600"}`}>
                          {elapsed} menit lalu {elapsed > 7 && "⚠️ LEWAT SLA!"}
                        </span>
                        <div className="w-24 h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all ${elapsed > 7 ? "bg-red-500" : elapsed > 5 ? "bg-amber-500" : "bg-emerald-500"}`} 
                            style={{ width: `${Math.min((elapsed / 7) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-xs text-slate-700 dark:text-zinc-200 bg-red-50/60 dark:bg-red-950/20 p-2.5 rounded-xl border border-red-200 dark:border-red-900/40">
                  <span className="font-semibold block">Titik Lokasi:</span>
                  <span>{details.alamatManual || details.emergencyAddress || order.dropoffLocation?.address}</span>
                  {details.gpsLat && details.gpsLng && (
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${details.gpsLat},${details.gpsLng}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="block mt-1 text-red-600 underline"
                    >
                      Buka Koordinat GPS di Maps
                    </a>
                  )}
                </div>

                {isPending && (
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100 dark:border-white/[0.04]">
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setRejectionTarget(order)}
                      disabled={dispatchingId === order.id}
                      className="text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-900/40 dark:hover:bg-rose-900/20 rounded-xl text-xs font-bold h-8 px-3 cursor-pointer"
                    >
                      <XCircle className="h-3.5 w-3.5 mr-1" />
                      Tolak
                    </Button>
<Button
                      size="sm"
                      onClick={() => order.id && handleResolveEmergency(order.id)}
                      disabled={dispatchingId === order.id}
                      className="bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold h-8 px-3 cursor-pointer shadow-xs"
                    >
                      {dispatchingId === order.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                      )}
                      <span>Selesaikan Tanggap Darurat</span>
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <RejectionModal
        isOpen={!!rejectionTarget}
        onClose={() => setRejectionTarget(null)}
        onConfirm={handleReject}
        orderInfo={{
          serviceName: rejectionTarget?.serviceTitle,
          customerName: rejectionTarget?.customerName,
          orderId: rejectionTarget?.id
        }}
      />
    </div>
  );
}
