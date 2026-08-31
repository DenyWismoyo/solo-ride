"use client";

import React, { useState } from "react";
import { OrderDocument } from "@/types/order.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Megaphone, CheckCircle2, Loader2, MapPin, Phone , XCircle} from "lucide-react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";

interface GovWorkspaceProps {
  orders: OrderDocument[];
  loading: boolean;
}

export function DiskominfoWorkspace({ orders, loading }: GovWorkspaceProps) {
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
  const ulasOrders = orders.filter(o => o.serviceType?.includes("ulas") || o.serviceType?.includes("diskominfo"));

  const handleResolveUlas = async (orderId: string) => {
    setDispatchingId(orderId);
    try {
      await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
        status: "completed",
        verifiedByDinasAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      alert("✅ Aduan ULAS Berhasil Ditindaklanjuti secara Mandiri!");
    } catch (err: any) {
      alert(`Gagal: ${err.message || err}`);
    } finally {
      setDispatchingId(null);
    }
  };

  const handleForwardUlas = async (orderId: string, currentTitle: string) => {
    const targetOpd = prompt(`Teruskan "${currentTitle}" ke Dinas mana?\nContoh: gov_dishub, gov_dlh, gov_pupr`, "gov_dishub");
    if (!targetOpd) return;

    setDispatchingId(orderId);
    try {
      await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
        additionalRole: targetOpd,
        updatedAt: serverTimestamp()
      });
      alert(`✅ Aduan berhasil diteruskan ke ${targetOpd}!`);
    } catch (err: any) {
      alert(`Gagal: ${err.message || err}`);
    } finally {
      setDispatchingId(null);
    }
  };

  const getElapsedHours = (createdAt: any) => {
    if (!createdAt) return 0;
    const created = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
    return (Date.now() - created.getTime()) / (1000 * 60 * 60);
  };

  return (
    <div className="space-y-5">
      {/* 1. METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Main Bento Cell */}
        <div className="sm:col-span-2 p-5 rounded-[2rem] bg-gradient-to-br from-cyan-500/10 via-cyan-500/5 to-transparent border border-cyan-500/20 flex flex-col justify-between h-full min-h-[120px]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-400">
              <Megaphone className="h-5 w-5" />
            </div>
            <span className="text-xs text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-wider">Aduan Masuk ULAS</span>
          </div>
          <div className="text-4xl sm:text-5xl font-black text-cyan-600 dark:text-cyan-400 mt-3">{ulasOrders.length}</div>
        </div>
        
        {/* Secondary Bento Cells */}
        <div className="flex flex-col gap-3">
          <div className="p-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider w-1/2">Terselesaikan</span>
            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">96.8%</div>
          </div>
          <div className="grid grid-cols-2 gap-3 flex-1">
            <div className="p-3 rounded-3xl bg-teal-500/10 border border-teal-500/20 flex flex-col justify-center items-center text-center">
              <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold uppercase tracking-wider mb-1">Respon</span>
              <div className="text-sm font-black text-teal-600 dark:text-teal-400">&lt; 24 Jam</div>
            </div>
            <div className="p-3 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex flex-col justify-center items-center text-center">
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider mb-1">CCTV</span>
              <div className="text-sm font-black text-blue-600 dark:text-blue-400">320 Unit</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. ORDER LIST */}
      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Memuat antrean aduan ULAS...</span>
        </div>
      ) : ulasOrders.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800">
          Tidak ada aduan warga yang tertunda di portal ULAS.
        </div>
      ) : (
        <div className="space-y-3">
          {ulasOrders.map((order) => {
            const details = order.citizenDetails || {};
            const isPending = order.status !== "completed";
            const elapsed = getElapsedHours(order.createdAt);
            return (
              <div
                key={order.id}
                className="p-4 rounded-2xl bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/[0.08] shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {details.ulasTitle || order.serviceTitle}
                      </span>
                      <Badge variant="blue" size="sm" className="text-[10px]">
                        {details.ulasCategory || "Pengaduan"}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span>Pelapor: {details.citizenName || order.customerName}</span>
                      <span>•</span>
                      <span>Lokasi: {details.locationName || order.pickupLocation?.address}</span>
                      {isPending && (
                        <>
                          <span>•</span>
                          <span className={`font-medium flex items-center gap-1 ${elapsed > 24 ? "text-red-600 animate-pulse" : elapsed > 18 ? "text-amber-500" : "text-emerald-600"}`}>
                            ⏱️ {elapsed > 24 ? "LEWAT SLA 1x24 JAM!" : `Sisa SLA: ${Math.max(0, Math.floor(24 - elapsed))} Jam`}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <Badge variant={isPending ? "amber" : "emerald"} size="sm">
                    {order.status}
                  </Badge>
                </div>

                <div className="text-xs text-slate-600 dark:text-zinc-300 bg-slate-50 dark:bg-white/[0.02] p-2.5 rounded-xl">
                  {details.description || "Tidak ada deskripsi rinci."}
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
                      variant="outline"
                      onClick={() => order.id && handleForwardUlas(order.id, details.ulasTitle || "")}
                      disabled={dispatchingId === order.id}
                      className="rounded-xl text-xs font-bold h-8 px-3 cursor-pointer shadow-xs border-slate-200 dark:border-zinc-700"
                    >
                      Teruskan ke OPD
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => order.id && handleResolveUlas(order.id)}
                      disabled={dispatchingId === order.id}
                      className="bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold h-8 px-3 cursor-pointer shadow-xs"
                    >
                      {dispatchingId === order.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                      )}
                      <span>Selesai Sendiri</span>
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
