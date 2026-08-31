"use client";

import React, { useState } from "react";
import { OrderDocument } from "@/types/order.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Store, Coins, Users, CheckCircle2, Loader2, MapPin, Phone , XCircle} from "lucide-react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";

interface GovWorkspaceProps {
  orders: OrderDocument[];
  loading: boolean;
}

export function DiskopWorkspace({ orders, loading }: GovWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<"nib" | "dana">("nib");
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

  const nibOrders = orders.filter(o => o.serviceType?.includes("nib") || o.serviceType?.includes("legalitas"));
  const danaOrders = orders.filter(o => o.serviceType?.includes("dana") || o.serviceType?.includes("modal"));

  const handleApproveDiskop = async (orderId: string) => {
    setDispatchingId(orderId);
    try {
      await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
        status: "completed",
        verifiedByDinasAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      alert("✅ Berkas UMKM Berhasil Diverifikasi & Disetujui oleh Petugas PLUT Diskop!");
    } catch (err: any) {
      alert(`Gagal: ${err.message || err}`);
    } finally {
      setDispatchingId(null);
    }
  };

  const currentList = activeTab === "nib" ? nibOrders : danaOrders;

  return (
    <div className="space-y-5">
      {/* 1. METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Mitra UMKM Aktif</span>
          <div className="text-xl font-black text-slate-900 dark:text-white">1.250 Mitra</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Fasilitasi NIB OSS</span>
          <div className="text-xl font-black text-slate-900 dark:text-white">{nibOrders.length}</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">Pengajuan Dana Bergulir</span>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400">{danaOrders.length}</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold uppercase tracking-wider">Dana Cadangan SHU</span>
          <div className="text-sm font-black text-teal-600 dark:text-teal-400 mt-1">Rp 480 Juta</div>
        </div>
      </div>

      {/* SHU DASHBOARD (Mock UI) */}
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-zinc-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800 dark:text-zinc-200">
            <Coins className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-bold">Proyeksi Sisa Hasil Usaha (SHU) Koperasi</span>
          </div>
          <Badge variant="emerald" size="sm" className="text-[9px]">Tahun 2026</Badge>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white dark:bg-[#0c1220] p-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08]">
            <div className="text-[10px] text-slate-500">Estimasi Total SHU</div>
            <div className="text-sm font-bold text-emerald-600">Rp 1.25 Miliar</div>
          </div>
          <div className="bg-white dark:bg-[#0c1220] p-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08]">
            <div className="text-[10px] text-slate-500">Koperasi Terdaftar</div>
            <div className="text-sm font-bold text-emerald-600">420 Lembaga</div>
          </div>
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
          <Store className="h-4 w-4" />
          <span>Fasilitasi NIB OSS ({nibOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("dana")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "dana"
              ? "bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Coins className="h-4 w-4" />
          <span>Pengajuan Dana Modal ({danaOrders.length})</span>
        </button>
      </div>

      {/* 3. ORDER CARDS */}
      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Memuat data UMKM & Koperasi...</span>
        </div>
      ) : currentList.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800">
          Tidak ada berkas pada kategori {activeTab}.
        </div>
      ) : (
        <div className="space-y-3">
          {currentList.map((order) => {
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
                        {details.businessName || order.customerName || "Pelaku UMKM Solo"}
                      </span>
                      <Badge variant="emerald" size="sm" className="text-[10px]">
                        {details.businessSector || details.loanPlafon || order.serviceTitle}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span>Pemilik: {details.ownerName || order.customerName}</span>
                      <span>•</span>
                      <span>NIK: {details.nik || "-"}</span>
                    </div>
                  </div>

                  <Badge variant={isPendingVerification ? "amber" : "emerald"} size="sm">
                    {order.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-zinc-300 bg-slate-50 dark:bg-white/[0.02] p-2.5 rounded-xl">
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{order.dropoffLocation?.address || "Alamat usaha"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{order.customerPhone || "-"}</span>
                  </div>
                  {details.omzetBulananEstimasi && (
                    <div className="col-span-1 sm:col-span-2 pt-1 border-t border-slate-200 dark:border-white/[0.04]">
                      <span className="font-semibold text-slate-700 dark:text-zinc-200">Estimasi Omzet:</span> Rp {Number(details.omzetBulananEstimasi).toLocaleString('id-ID')}
                    </div>
                  )}
                  {details.agunanYangDimiliki && (
                    <div className="col-span-1 sm:col-span-2 pt-1 border-t border-slate-200 dark:border-white/[0.04]">
                      <span className="font-semibold text-slate-700 dark:text-zinc-200">Agunan:</span> {details.agunanYangDimiliki}
                    </div>
                  )}
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
                      onClick={() => order.id && handleApproveDiskop(order.id)}
                      disabled={dispatchingId === order.id}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold h-8 px-3 cursor-pointer shadow-xs"
                    >
                      {dispatchingId === order.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                      )}
                      <span>Verifikasi & Setujui PLUT</span>
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
