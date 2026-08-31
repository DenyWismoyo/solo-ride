"use client";

import React, { useState } from "react";
import { OrderDocument } from "@/types/order.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileCheck2, CheckCircle2, Loader2, KeyRound , XCircle} from "lucide-react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";

interface GovWorkspaceProps {
  orders: OrderDocument[];
  loading: boolean;
}

export function DpmptspWorkspace({ orders, loading }: GovWorkspaceProps) {
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
  const mppOrders = orders.filter(o => o.serviceType?.includes("mpp") || o.serviceType?.includes("dpmptsp") || o.serviceType?.includes("izin"));

  const handleApproveMpp = async (orderId: string) => {
    setDispatchingId(orderId);
    try {
      await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
        status: "pending",
        verifiedByDinasAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      alert("✅ Dokumen Izin MPP Berhasil Diverifikasi! Kurir dipanggil untuk pengantaran.");
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
        <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">Antar Izin MPP</span>
          <div className="text-xl font-black text-slate-900 dark:text-white">{mppOrders.length}</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Investasi Terealisasi</span>
          <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-1">Rp 2.8 Triliun</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold uppercase tracking-wider">Layanan Loket MPP</span>
          <div className="text-xl font-black text-teal-600 dark:text-teal-400">182 Layanan</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">Kepuasan Pemohon</span>
          <div className="text-xl font-black text-indigo-600 dark:text-indigo-400">98.2%</div>
        </div>
      </div>

      {/* 2. ORDER LIST */}
      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Memuat data pengantaran izin MPP...</span>
        </div>
      ) : mppOrders.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800">
          Tidak ada berkas izin siap antar saat ini.
        </div>
      ) : (
        <div className="space-y-3">
          {mppOrders.map((order) => {
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
                        {details.applicantName || order.customerName}
                      </span>
                      <Badge variant="blue" size="sm" className="text-[10px]">
                        {details.mppPermitType || "Izin MPP"}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span>No Daftar: {details.mppRegistrationNo || "-"}</span>
                      <span>•</span>
                      <span>NIK: {details.nik || "-"}</span>
                    </div>
                  </div>

                  <Badge variant={isPendingVerification ? "amber" : "emerald"} size="sm">
                    {order.status}
                  </Badge>
                </div>

                {order.otpCode && (
                  <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40">
                    <span className="text-[11px] text-blue-700 dark:text-blue-300 flex items-center gap-1 font-semibold">
                      <KeyRound className="h-3.5 w-3.5" />
                      <span>OTP Serah Terima Izin:</span>
                    </span>
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">
                      {order.otpCode}
                    </span>
                  </div>
                )}

                {isPendingVerification && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-white/[0.04]">
                    <label className="flex items-center gap-2 cursor-pointer w-full sm:w-auto p-2 sm:p-0 bg-slate-50 sm:bg-transparent dark:bg-white/[0.02] sm:dark:bg-transparent rounded-lg">
                      <input type="checkbox" className="w-4 h-4 rounded text-blue-600 bg-slate-100 border-slate-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600 cursor-pointer" />
                      <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Fisik SK / Izin Siap Diambil</span>
                    </label>

                    
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
                      onClick={() => order.id && handleApproveMpp(order.id)}
                      disabled={dispatchingId === order.id}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold h-8 px-3 cursor-pointer shadow-xs w-full sm:w-auto"
                    >
                      {dispatchingId === order.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                      )}
                      <span>Verifikasi & Panggil Kurir</span>
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
