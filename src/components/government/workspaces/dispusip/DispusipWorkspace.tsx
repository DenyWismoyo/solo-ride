"use client";

import React, { useState } from "react";
import { OrderDocument } from "@/types/order.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, CheckCircle2, Loader2, KeyRound , XCircle} from "lucide-react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";

interface GovWorkspaceProps {
  orders: OrderDocument[];
  loading: boolean;
}

export function DispusipWorkspace({ orders, loading }: GovWorkspaceProps) {
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
  const bookOrders = orders.filter(o => o.serviceType?.includes("buku") || o.serviceType?.includes("dispusip"));

  const handleApproveBookOrder = async (orderId: string) => {
    setDispatchingId(orderId);
    try {
      await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
        status: "pending",
        verifiedByDinasAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      alert("✅ Peminjaman Buku Disetujui! Kurir dipanggil untuk mengambil buku dari Perpusda.");
    } catch (err: any) {
      alert(`Gagal: ${err.message || err}`);
    } finally {
      setDispatchingId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Main Bento Cell */}
        <div className="sm:col-span-2 p-5 rounded-[2rem] bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-transparent border border-indigo-500/20 flex flex-col justify-between h-full min-h-[120px]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">Peminjaman Buku Aktif</span>
          </div>
          <div className="text-4xl sm:text-5xl font-black text-indigo-600 dark:text-indigo-400 mt-3">{bookOrders.length}</div>
        </div>
        
        {/* Secondary Bento Cells */}
        <div className="flex flex-col gap-3">
          <div className="p-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider w-1/2">Koleksi Buku</span>
            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">45.000+</div>
          </div>
          <div className="grid grid-cols-2 gap-3 flex-1">
            <div className="p-3 rounded-3xl bg-teal-500/10 border border-teal-500/20 flex flex-col justify-center items-center text-center">
              <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold uppercase tracking-wider mb-1">Anggota</span>
              <div className="text-sm font-black text-teal-600 dark:text-teal-400">18.400</div>
            </div>
            <div className="p-3 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex flex-col justify-center items-center text-center">
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider mb-1">Indeks L.</span>
              <div className="text-sm font-black text-blue-600 dark:text-blue-400">88.6 (Tinggi)</div>
            </div>
          </div>
        </div>
      </div>

      {/* ALERT JATUH TEMPO (Mock UI) */}
      <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 p-3 rounded-2xl">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-rose-100 dark:bg-rose-900/40 rounded-full shrink-0">
            <BookOpen className="h-4 w-4 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-rose-800 dark:text-rose-300">Peringatan Jatuh Tempo Pengembalian</h4>
            <p className="text-[11px] text-rose-600/80 dark:text-rose-400/80 leading-relaxed">
              Terdapat <strong>12 buku</strong> yang jatuh tempo hari ini dan <strong>45 buku</strong> masuk masa H-3. 
              Sistem akan mengirimkan notifikasi WhatsApp otomatis ke anggota.
            </p>
          </div>
        </div>
      </div>

      {/* 2. ORDER LIST */}
      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Memuat data peminjaman buku perpustakaan...</span>
        </div>
      ) : bookOrders.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800">
          Tidak ada antrean kurir buku saat ini.
        </div>
      ) : (
        <div className="space-y-3">
          {bookOrders.map((order) => {
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
                        {details.memberName || order.customerName}
                      </span>
                      <Badge variant="blue" size="sm" className="text-[10px]">
                        {details.bookCategory || "Buku Perpusda"}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2 truncate">
                      <span>No Anggota: {details.bookMemberId || "-"}</span>
                      <span>•</span>
                      <span>Durasi: {details.loanDuration || "14 Hari"}</span>
                    </div>
                    <div className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300">
                      Judul: {details.bookTitle || "Buku"}
                    </div>
                  </div>

                  <Badge variant={isPendingVerification ? "amber" : "emerald"} size="sm">
                    {order.status}
                  </Badge>
                </div>

                {order.otpCode && (
                  <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/40">
                    <span className="text-[11px] text-indigo-700 dark:text-indigo-300 flex items-center gap-1 font-semibold">
                      <KeyRound className="h-3.5 w-3.5" />
                      <span>OTP Serah Terima Buku:</span>
                    </span>
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                      {order.otpCode}
                    </span>
                  </div>
                )}

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
                      onClick={() => order.id && handleApproveBookOrder(order.id)}
                      disabled={dispatchingId === order.id}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold h-8 px-3 cursor-pointer shadow-xs"
                    >
                      {dispatchingId === order.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                      )}
                      <span>Verifikasi & Siapkan Buku</span>
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
