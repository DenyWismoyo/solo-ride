"use client";

import React, { useState, useEffect, useRef } from "react";
import { OrderDocument } from "@/types/order.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Flame, Phone, MapPin, CheckCircle2, Loader2, AlertOctagon , XCircle} from "lucide-react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";
import { playOrderAlertSound } from "@/lib/sound";

interface GovWorkspaceProps {
  orders: OrderDocument[];
  loading: boolean;
}

export function DamkarWorkspace({ orders, loading }: GovWorkspaceProps) {
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);

  const handleReject = async (orderId: string) => {
    const reason = prompt("Masukkan alasan penolakan:");
    if (!reason) return;
    
    setDispatchingId(orderId);
    try {
      await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
        status: "cancelled",
        rejectionReason: reason,
        updatedAt: serverTimestamp()
      });
      alert("Permohonan berhasil ditolak.");
    } catch (err: any) {
      alert(`Gagal menolak: ${err.message || err}`);
    } finally {
      setDispatchingId(null);
    }
  };
  const previousOrderCountRef = useRef(0);

  const panicOrders = orders.filter(o => o.serviceType?.includes("damkar") || o.serviceType?.includes("panic"));

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
        updatedAt: serverTimestamp()
      });
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
          <div className="text-4xl sm:text-5xl font-black text-red-600 dark:text-red-400 mt-3">{panicOrders.length}</div>
        </div>
        
        {/* Secondary Bento Cells */}
        <div className="flex flex-col gap-3">
          <div className="p-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider w-1/2">Response Time</span>
            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">&lt; 7 Menit</div>
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

      {/* 2. ORDER LIST */}
      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Memuat pemantauan alarm Mako Damkar...</span>
        </div>
      ) : panicOrders.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800">
          Tidak ada sinyal darurat aktif. Kondisi Kota Surakarta kondusif.
        </div>
      ) : (
        <div className="space-y-3">
          {panicOrders.map((order) => {
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
                      onClick={() => order.id && handleReject(order.id)}
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
    </div>
  );
}
