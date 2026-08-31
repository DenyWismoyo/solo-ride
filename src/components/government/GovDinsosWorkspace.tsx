"use client";

import React, { useState } from "react";
import { OrderDocument } from "@/types/order.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  HeartHandshake, 
  Accessibility, 
  Store, 
  Truck, 
  Loader2, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Users,
  QrCode
} from "lucide-react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";

interface GovDinsosWorkspaceProps {
  orders: OrderDocument[];
  loading: boolean;
}

export function GovDinsosWorkspace({ orders, loading }: GovDinsosWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<"difabel" | "vouchers">("difabel");
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);

  const pendingVerificationOrders = orders.filter(o => o.status === "pending_verification");
  const activeTrips = orders.filter(o => o.status === "in_progress" || o.status === "accepted" || o.status === "pending");

  const handleDispatchDifabelRide = async (orderId: string) => {
    setDispatchingId(orderId);
    try {
      await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
        status: "pending", // Enters driver radar!
        verifiedByDinasAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      alert("✅ Permohonan Ojek Siaga Difabel/Lansia Berhasil Disetujui! Subsidi 100% dialokasikan dan pesanan diteruskan ke Radar Driver Mitra.");
    } catch (err: any) {
      alert(`Gagal dispatch: ${err.message || err}`);
    } finally {
      setDispatchingId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wider">Panggilan Difabel/Lansia</span>
          <div className="text-xl font-black text-slate-900 dark:text-white">{orders.length}</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">Perlu Persetujuan</span>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400">{pendingVerificationOrders.length}</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold uppercase tracking-wider">Armada Sedang Bergerak</span>
          <div className="text-xl font-black text-teal-600 dark:text-teal-400">{activeTrips.length}</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Cadangan Bansos Pangan</span>
          <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-1">Rp 120 Juta</div>
        </div>
      </div>

      {/* 2. TAB SELECTOR */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-zinc-800/80 rounded-2xl">
        <button
          onClick={() => setActiveTab("difabel")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "difabel"
              ? "bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-sm"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Accessibility className="h-4 w-4" />
          <span>Antrean Ojek Siaga Difabel/Lansia ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("vouchers")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "vouchers"
              ? "bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-sm"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Store className="h-4 w-4" />
          <span>Monitoring Kupon Sembako Pasar</span>
        </button>
      </div>

      {/* TAB 1: DIFABEL QUEUE */}
      {activeTab === "difabel" && (
        <div className="space-y-3">
          {loading ? (
            <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800">
              <Loader2 className="h-6 w-6 text-rose-500 animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500">Memuat data armada difabel...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 text-xs text-slate-500">
              Belum ada permohonan armada siaga difabel atau lansia yang masuk.
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="sg-card p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 space-y-3 shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {order.citizenDetails?.passengerType || "Warga Difabel / Lansia"}
                      </span>
                      <Badge variant={order.status === "pending_verification" ? "rose" : "emerald"} size="sm">
                        {order.status === "pending_verification" ? "Perlu Verifikasi Dinsos" : "Subsidi Disetujui"}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-zinc-300">
                      Pendamping: <strong>{order.customerName}</strong> • {order.customerPhone}
                    </p>
                  </div>

                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                    Subsidi 100% (Rp 0)
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl space-y-1 text-xs text-slate-600 dark:text-zinc-300 border border-slate-100 dark:border-zinc-700/60">
                  <div className="flex justify-between">
                    <span className="text-[10px] text-slate-400">Jemput:</span>
                    <span className="font-medium text-slate-800 dark:text-zinc-200 truncate max-w-[220px]">{order.pickupLocation.address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] text-slate-400">Tujuan Faskes:</span>
                    <span className="font-medium text-slate-800 dark:text-zinc-200 truncate max-w-[220px]">{order.dropoffLocation.address}</span>
                  </div>
                </div>

                {order.status === "pending_verification" && (
                  <Button
                    size="sm"
                    onClick={() => order.id && handleDispatchDifabelRide(order.id)}
                    disabled={dispatchingId === order.id}
                    className="w-full h-9 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {dispatchingId === order.id ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Menyetujui Subsidi...
                      </>
                    ) : (
                      <>
                        <Accessibility className="h-3.5 w-3.5" /> Setujui Subsidi & Alokasikan Driver Siaga
                      </>
                    )}
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: MONITORING KUPON SEMBAKO */}
      {activeTab === "vouchers" && (
        <div className="space-y-3">
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-500/30 rounded-2xl text-xs text-rose-900 dark:text-rose-300">
            Daftar kios sembako pasar tradisional mitra penyalur program beras subsidi Dinsos Kota Surakarta.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Pasar Gede (Kios Mbok Darmi)</span>
                <Badge variant="emerald" size="sm">45 Kupon Cair</Badge>
              </div>
              <p className="text-[10px] text-slate-500">Stok Beras Tersedia: 1.500 Kg (Beras C4 Delanggu)</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Pasar Legi (Kios Paguyuban)</span>
                <Badge variant="emerald" size="sm">62 Kupon Cair</Badge>
              </div>
              <p className="text-[10px] text-slate-500">Stok Beras Tersedia: 2.200 Kg (Beras Mentik Wangi)</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
