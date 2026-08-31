"use client";

import React, { useState } from "react";
import { OrderDocument } from "@/types/order.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Coins, 
  Store, 
  Award, 
  Calculator, 
  FileText, 
  CheckCircle2, 
  Loader2, 
  Users, 
  Building,
  TrendingUp,
  ShieldCheck
} from "lucide-react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";

interface GovDiskopWorkspaceProps {
  orders: OrderDocument[];
  loading: boolean;
}

export function GovDiskopWorkspace({ orders, loading }: GovDiskopWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<"nib" | "shu">("nib");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const pendingNIBOrders = orders.filter(o => o.status === "pending_verification");

  const handleApproveNIB = async (orderId: string) => {
    setProcessingId(orderId);
    try {
      await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
        status: "completed",
        verifiedByDinasAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      alert("✅ Permohonan NIB Usaha Mikro Berhasil Disetujui! Petugas pendamping OSS telah ditugaskan.");
    } catch (err: any) {
      alert(`Gagal memproses: ${err.message || err}`);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Kas Cadangan SHU</span>
          <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-1">Rp 425 Juta</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">Stamp Poin Beredar</span>
          <div className="text-xl font-black text-slate-900 dark:text-white">14.850 🪙</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">Subsidi Karcis Harian</span>
          <div className="text-xl font-black text-blue-600 dark:text-blue-400">120 Driver/Hari</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider">Pengajuan NIB Masuk</span>
          <div className="text-xl font-black text-purple-600 dark:text-purple-400">{orders.length} Usaha</div>
        </div>
      </div>

      {/* 2. TAB SELECTOR */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-zinc-800/80 rounded-2xl">
        <button
          onClick={() => setActiveTab("nib")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "nib"
              ? "bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Antrean Pendampingan NIB UMKM ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("shu")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "shu"
              ? "bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Coins className="h-4 w-4" />
          <span>Alokasi Dividen & Koperasi</span>
        </button>
      </div>

      {/* TAB 1: NIB QUEUE */}
      {activeTab === "nib" && (
        <div className="space-y-3">
          {loading ? (
            <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800">
              <Loader2 className="h-6 w-6 text-emerald-500 animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500">Memeriksa permohonan NIB...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 text-xs text-slate-500">
              Belum ada permohonan pendampingan NIB baru dari warga.
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="sg-card p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 space-y-3 shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {order.citizenDetails?.businessName || "Usaha Mikro Warga"}
                      </span>
                      <Badge variant={order.status === "completed" ? "emerald" : "amber"} size="sm">
                        {order.status === "completed" ? "NIB Terfasilitasi" : "Perlu Pendampingan"}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                      Kategori: <strong>{order.citizenDetails?.businessType}</strong> • Pemilik: {order.customerName}
                    </p>
                  </div>

                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    Binaan Diskop
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl space-y-1 text-xs text-slate-600 dark:text-zinc-300 border border-slate-100 dark:border-zinc-700/60">
                  <div className="flex justify-between">
                    <span className="text-[10px] text-slate-400">Lokasi Usaha:</span>
                    <span className="font-medium text-slate-800 dark:text-zinc-200 truncate max-w-[220px]">{order.dropoffLocation.address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] text-slate-400">WhatsApp Pemilik:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{order.citizenDetails?.ownerPhone}</span>
                  </div>
                </div>

                {order.status === "pending_verification" && (
                  <Button
                    size="sm"
                    onClick={() => order.id && handleApproveNIB(order.id)}
                    disabled={processingId === order.id}
                    className="w-full h-9 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {processingId === order.id ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Memproses...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" /> Jadwalkan Petugas Pendamping NIB OSS
                      </>
                    )}
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: SHU MANAGEMENT */}
      {activeTab === "shu" && (
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Formulasi Dividen Koperasi Warga Solo</h4>
            <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
              Setiap transaksi ojek dan belanja UMKM menyisihkan 3% ke kas cadangan koperasi. Seluruh keuntungan bersih dibagikan kembali kepada anggota dan subsidi flat karcis harian driver.
            </p>
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Status Keuangan:</span>
              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">SURPLUS & SEHAT (Audit Dinas Koperasi 2026)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
