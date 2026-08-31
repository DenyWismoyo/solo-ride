"use client";

import React, { useState } from "react";
import { OrderDocument } from "@/types/order.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Compass, CheckCircle2, Loader2, MapPin, Phone, Calendar , XCircle} from "lucide-react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";

interface GovWorkspaceProps {
  orders: OrderDocument[];
  loading: boolean;
}

export function DisparWorkspace({ orders, loading }: GovWorkspaceProps) {
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
  const tourOrders = orders.filter(o => o.serviceType?.includes("tour") || o.serviceType?.includes("heritage") || o.serviceType?.includes("dispar"));

  const handleApproveTour = async (orderId: string) => {
    setDispatchingId(orderId);
    try {
      await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
        status: "pending", // Enters driver mitra radar
        verifiedByDinasAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      alert("✅ Paket Tur Wisata Heritage Disetujui! Diteruskan ke Radar Driver Mitra.");
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
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">Booking Tur Heritage</span>
          <div className="text-xl font-black text-slate-900 dark:text-white">{tourOrders.length}</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Kunjungan Wisatawan</span>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">1.8 Juta</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold uppercase tracking-wider">Destinasi Terverifikasi</span>
          <div className="text-xl font-black text-teal-600 dark:text-teal-400">42 Objek</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">Event Budaya Solo</span>
          <div className="text-sm font-black text-blue-600 dark:text-blue-400 mt-1">68 Kalender Event</div>
        </div>
      </div>

      {/* KALENDER EVENT (Mock UI) */}
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-zinc-800/80 space-y-3">
        <div className="flex items-center gap-2 text-slate-800 dark:text-zinc-200">
          <Calendar className="h-4 w-4 text-blue-500" />
          <span className="text-xs font-bold">Event Budaya Mendatang (Highlights)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="bg-white dark:bg-[#0c1220] p-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08] flex justify-between items-center">
            <span className="text-[11px] font-semibold">Solo Batik Carnival (SBC)</span>
            <Badge variant="blue" size="sm" className="text-[9px]">Okt 2026</Badge>
          </div>
          <div className="bg-white dark:bg-[#0c1220] p-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08] flex justify-between items-center">
            <span className="text-[11px] font-semibold">Kirab Pusaka 1 Suro</span>
            <Badge variant="emerald" size="sm" className="text-[9px]">Nov 2026</Badge>
          </div>
        </div>
      </div>

      {/* 2. ORDER LIST */}
      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Memuat data reservasi tur heritage...</span>
        </div>
      ) : tourOrders.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800">
          Belum ada reservasi tur wisata heritage masuk.
        </div>
      ) : (
        <div className="space-y-3">
          {tourOrders.map((order) => {
            const details = order.citizenDetails || {};
            const isPendingVerification = order.status === "pending_verification";
            return (
              <div
                key={order.id}
                className="p-4 rounded-2xl bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/[0.08] shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {details.touristName || order.customerName}
                      </span>
                      <Badge variant="blue" size="sm" className="text-[10px] truncate max-w-[150px]">
                        {details.heritageRoutes ? details.heritageRoutes.join(", ") : details.heritageRoute || "Tur Wisata Solo"}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span>Tanggal: {details.tourDate || "-"}</span>
                      <span>•</span>
                      <span>Peserta: {details.tourParticipants || "1 Orang"}</span>
                    </div>
                  </div>

                  <Badge variant={isPendingVerification ? "amber" : "emerald"} size="sm">
                    {order.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-zinc-300 bg-slate-50 dark:bg-white/[0.02] p-2.5 rounded-xl">
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{details.pickupPoint || order.pickupLocation?.address}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{details.phone || order.customerPhone || "-"}</span>
                  </div>
                </div>

                {isPendingVerification && (
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
                      onClick={() => order.id && handleApproveTour(order.id)}
                      disabled={dispatchingId === order.id}
                      className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold h-8 px-3 cursor-pointer shadow-xs"
                    >
                      {dispatchingId === order.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                      )}
                      <span>Konfirmasi & Dispatch Guide</span>
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
