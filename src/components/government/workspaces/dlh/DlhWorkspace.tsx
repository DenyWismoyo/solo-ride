"use client";

import React, { useState } from "react";
import { OrderDocument } from "@/types/order.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, TreePine, Sparkles, CheckCircle2, Loader2, MapPin, Phone , XCircle} from "lucide-react";
import { doc, updateDoc, serverTimestamp, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";

interface GovWorkspaceProps {
  orders: OrderDocument[];
  loading: boolean;
}

export function DlhWorkspace({ orders, loading }: GovWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<"sampah" | "pohon">("sampah");
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

  const sampahOrders = orders.filter(o => o.serviceType?.includes("sampah"));
  const pohonOrders = orders.filter(o => o.serviceType?.includes("pohon"));

  const ECO_POINTS_PER_KG: Record<string, number> = {
    kardus: 200, plastik: 150, besi: 500, kaca: 100, jelantah: 300, kertas: 150
  };

  const calculateEcoPoints = (jenisSampah: string[], beratKg: number): number => {
    if (!jenisSampah || !jenisSampah.length) return Math.floor(beratKg * 150);
    const primaryRate = ECO_POINTS_PER_KG[jenisSampah[0]] || 150;
    return Math.floor(beratKg * primaryRate);
  };

  const handleResolveDlh = async (order: OrderDocument, label: string) => {
    let finalPoints = 0;
    let beratAktual = 0;
    
    if (activeTab === "sampah") {
      const input = prompt("Masukkan berat aktual timbangan sampah (kg):", "5");
      if (!input) return; // Cancelled
      beratAktual = Number(input) || 0;
      
      const jenisSampah = (order.citizenDetails as any)?.jenisSampah || [];
      finalPoints = calculateEcoPoints(jenisSampah, beratAktual);
    }

    setDispatchingId(order.id!);
    try {
      await updateDoc(doc(db, COLLECTIONS.ORDERS, order.id!), {
        status: "completed",
        "citizenDetails.beratAktualKg": beratAktual,
        "citizenDetails.ecoPointsAwarded": finalPoints,
        verifiedByDinasAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      if (finalPoints > 0) {
        await updateDoc(doc(db, "users", order.customerId), {
          points: increment(finalPoints)
        });
      }

      alert(`✅ ${label} Berhasil Diselesaikan!${finalPoints > 0 ? `\n+${finalPoints.toLocaleString()} Eco Points diberikan ke nasabah.` : ""}`);
    } catch (err: any) {
      alert(`Gagal: ${err.message || err}`);
    } finally {
      setDispatchingId(null);
    }
  };

  const currentList = activeTab === "sampah" ? sampahOrders : pohonOrders;

  return (
    <div className="space-y-5">
      {/* 1. METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Setoran Bank Sampah</span>
          <div className="text-xl font-black text-slate-900 dark:text-white">{sampahOrders.length}</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold uppercase tracking-wider">Total Sampah Terolah</span>
          <div className="text-xl font-black text-teal-600 dark:text-teal-400">12.4 Ton</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">Laporan Perantingan</span>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400">{pohonOrders.length}</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">Poin Daur Ulang Warga</span>
          <div className="text-sm font-black text-blue-600 dark:text-blue-400 mt-1">240.000 Poin</div>
        </div>
      </div>

      {/* 2. TAB SELECTOR */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-zinc-800/80 rounded-2xl">
        <button
          onClick={() => setActiveTab("sampah")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "sampah"
              ? "bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Trash2 className="h-4 w-4" />
          <span>Jemput Daur Ulang ({sampahOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("pohon")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "pohon"
              ? "bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <TreePine className="h-4 w-4" />
          <span>Laporan Perantingan ({pohonOrders.length})</span>
        </button>
      </div>

      {/* 3. ORDER LIST */}
      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Memuat data operasional DLH...</span>
        </div>
      ) : currentList.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800">
          Tidak ada antrean pada kategori {activeTab}.
        </div>
      ) : (
        <div className="space-y-3">
          {currentList.map((order) => {
            const details = order.citizenDetails || {};
            const isPending = order.status !== "completed";
            return (
              <div
                key={order.id}
                className="p-4 rounded-2xl bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/[0.08] shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {details.citizenName || details.reporterName || order.customerName}
                      </span>
                      <Badge variant="emerald" size="sm" className="text-[10px] truncate max-w-[120px]">
                        {details.jenisSampah ? `${details.jenisSampah.join(", ")} (~${details.estimasiBeratKg}kg)` : details.treeHazardCondition}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      {details.estimatedEcoPoints && <span>+{details.estimatedEcoPoints} Poin Stamp</span>}
                      {details.locationName && <span>Lokasi: {details.locationName}</span>}
                    </div>
                  </div>

                  <Badge variant={isPending ? "amber" : "emerald"} size="sm">
                    {order.status}
                  </Badge>
                </div>

                {isPending && (
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100 dark:border-white/[0.04]">
                    <Button
                      size="sm"
                      onClick={() => handleResolveDlh(order, activeTab === "sampah" ? "Penerimaan Daur Ulang" : "Penanganan Pohon")}
                      disabled={dispatchingId === order.id}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold h-8 px-3 cursor-pointer shadow-xs"
                    >
                      {dispatchingId === order.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                      )}
                      <span>Konfirmasi Selesai</span>
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
