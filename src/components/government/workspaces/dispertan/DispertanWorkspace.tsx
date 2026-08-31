"use client";

import React, { useState } from "react";
import { OrderDocument } from "@/types/order.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dog, CheckCircle2, Loader2 , XCircle} from "lucide-react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";

interface GovWorkspaceProps {
  orders: OrderDocument[];
  loading: boolean;
}

export function DispertanWorkspace({ orders, loading }: GovWorkspaceProps) {
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
  const puskeswanOrders = orders.filter(o => o.serviceType?.includes("puskeswan") || o.serviceType?.includes("hewan") || o.serviceType?.includes("dispertan"));

  const handleResolvePuskeswan = async (orderId: string) => {
    setDispatchingId(orderId);
    try {
      await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
        status: "completed",
        verifiedByDinasAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      alert("✅ Kunjungan Dokter Hewan Puskeswan Telah Selesai Ditangani.");
    } catch (err: any) {
      alert(`Gagal: ${err.message || err}`);
    } finally {
      setDispatchingId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-lime-500/10 border border-lime-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-lime-600 dark:text-lime-400 font-bold uppercase tracking-wider">Antrean Puskeswan</span>
          <div className="text-xl font-black text-slate-900 dark:text-white">{puskeswanOrders.length}</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Vaksinasi Rabies Bebas</span>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">100% Solo Aman</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold uppercase tracking-wider">Dokter Hewan Keliling</span>
          <div className="text-xl font-black text-teal-600 dark:text-teal-400">8 Tim Medis</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">Ketahanan Pangan Kota</span>
          <div className="text-sm font-black text-blue-600 dark:text-blue-400 mt-1">Surplus Aman</div>
        </div>
      </div>

      {/* KALENDER KUNJUNGAN (Mock UI) */}
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-zinc-800/80 space-y-3">
        <div className="flex items-center gap-2 text-slate-800 dark:text-zinc-200">
          <Dog className="h-4 w-4 text-lime-600" />
          <span className="text-xs font-bold">Jadwal Kunjungan Homecare Hari Ini</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="bg-white dark:bg-[#0c1220] p-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08] flex justify-between items-center">
            <span className="text-[11px] font-semibold">09:00 - Vaksin Rabies (Kucing)</span>
            <Badge variant="emerald" size="sm" className="text-[9px]">Selesai</Badge>
          </div>
          <div className="bg-white dark:bg-[#0c1220] p-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08] flex justify-between items-center">
            <span className="text-[11px] font-semibold">14:00 - Pemeriksaan (Anjing)</span>
            <Badge variant="amber" size="sm" className="text-[9px]">Menunggu</Badge>
          </div>
        </div>
      </div>

      {/* 2. ORDER LIST */}
      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Memuat data kunjungan Puskeswan...</span>
        </div>
      ) : puskeswanOrders.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800">
          Tidak ada jadwal kunjungan dokter hewan saat ini.
        </div>
      ) : (
        <div className="space-y-3">
          {puskeswanOrders.map((order) => {
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
                        {details.ownerName || order.customerName}
                      </span>
                      <Badge variant="emerald" size="sm" className="text-[10px]">
                        {details.petType || "Hewan"} ({details.puskeswanService || "Pemeriksaan"})
                      </Badge>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span>Alamat: {order.dropoffLocation?.address}</span>
                      <span>•</span>
                      <span>Jumlah: {details.petCount || 1} Ekor</span>
                    </div>
                  </div>

                  <Badge variant={isPending ? "amber" : "emerald"} size="sm">
                    {order.status}
                  </Badge>
                </div>

                {(details.riwayatVaksin || details.riwayatObat || details.notes) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-zinc-300 bg-slate-50 dark:bg-white/[0.02] p-2.5 rounded-xl">
                    {details.riwayatVaksin && <div><span className="font-semibold text-slate-700 dark:text-zinc-200">Riwayat Vaksin:</span> {details.riwayatVaksin}</div>}
                    {details.riwayatObat && <div><span className="font-semibold text-slate-700 dark:text-zinc-200">Riwayat Obat:</span> {details.riwayatObat}</div>}
                    {details.notes && <div className="sm:col-span-2"><span className="font-semibold text-slate-700 dark:text-zinc-200">Catatan/Gejala:</span> {details.notes}</div>}
                  </div>
                )}

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
                      onClick={() => order.id && handleResolvePuskeswan(order.id)}
                      disabled={dispatchingId === order.id}
                      className="bg-lime-600 hover:bg-lime-700 text-white rounded-xl text-xs font-bold h-8 px-3 cursor-pointer shadow-xs"
                    >
                      {dispatchingId === order.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                      )}
                      <span>Selesaikan Kunjungan Dokter</span>
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
