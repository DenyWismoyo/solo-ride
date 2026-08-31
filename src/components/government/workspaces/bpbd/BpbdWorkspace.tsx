"use client";

import React, { useState } from "react";
import { OrderDocument } from "@/types/order.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Waves, CheckCircle2, Loader2, MapPin, Phone, Activity , XCircle} from "lucide-react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";

interface GovWorkspaceProps {
  orders: OrderDocument[];
  loading: boolean;
}

const EWS_STATUS_DATA = [
  { sungai: "Bengawan Solo", level: "Normal", siaga: "Siaga 4", color: "emerald" },
  { sungai: "Kali Pepe", level: "Waspada", siaga: "Siaga 3", color: "amber" },
  { sungai: "Kali Jenes", level: "Normal", siaga: "Siaga 4", color: "emerald" },
];

const LOGISTIK_STOK = [
  { id: "tenda", label: "Tenda Darurat", stok: 45, threshold: 10 },
  { id: "selimut", label: "Selimut", stok: 200, threshold: 50 },
  { id: "air", label: "Air (dus)", stok: 150, threshold: 30 },
  { id: "sembako", label: "Sembako Paket", stok: 80, threshold: 20 },
];

export function BpbdWorkspace({ orders, loading }: GovWorkspaceProps) {
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
  
  // Ambil order yang merupakan permintaan bantuan BPBD
  const ewsOrders = orders.filter(o => o.serviceType?.includes("banjir") || o.serviceType?.includes("bpbd"));

  const handleResolveBpbd = async (orderId: string) => {
    setDispatchingId(orderId);
    try {
      await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
        status: "completed",
        verifiedByDinasAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      alert("✅ Status Bantuan Bencana BPBD Telah Ditangani Tim Reaksi Cepat!");
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
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">Permohonan Bantuan</span>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400">{ewsOrders.filter(o => o.status !== "completed").length}</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Status Bengawan Solo</span>
          <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-1">SIAGA 4 (Normal)</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold uppercase tracking-wider">Perahu Evakuasi Siap</span>
          <div className="text-xl font-black text-teal-600 dark:text-teal-400">18 Unit</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">Posko Tanggap Bencana</span>
          <div className="text-xl font-black text-blue-600 dark:text-blue-400">5 Kecamatan</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* KOLOM KIRI: Dashboard EWS & Inventory */}
        <div className="md:col-span-1 space-y-4">
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30">
              <div className="flex items-center gap-2 mb-3 text-blue-700 dark:text-blue-400">
                <Activity className="h-4 w-4" />
                <h3 className="text-sm font-bold">Status Siaga Sungai</h3>
              </div>
              {EWS_STATUS_DATA.map(({ sungai, level, siaga, color }) => (
                <div key={sungai} className={`flex justify-between p-2 rounded-xl mb-1.5 bg-${color}-500/10`}>
                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200">{sungai}</span>
                  <span className={`text-xs font-black text-${color}-600 dark:text-${color}-400`}>{siaga}</span>
                </div>
              ))}
            </div>

            {/* Logistik Inventory */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c1220]">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">Stok Logistik Posko Utama</h3>
              <div className="grid grid-cols-2 gap-2">
                {LOGISTIK_STOK.map(item => (
                  <div key={item.id} className={`p-3 rounded-xl text-center ${
                    item.stok <= item.threshold ? "bg-red-500/10 border border-red-500/30" : "bg-slate-50 dark:bg-zinc-800"
                  }`}>
                    <p className="text-[10px] font-bold uppercase text-slate-500">{item.label}</p>
                    <p className={`text-lg font-black ${item.stok <= item.threshold ? "text-red-600" : "text-slate-900 dark:text-white"}`}>
                      {item.stok}
                    </p>
                    {item.stok <= item.threshold && (
                      <p className="text-[9px] text-red-500 font-bold">STOK MENIPIS!</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: Daftar Permintaan Bantuan */}
        <div className="md:col-span-2">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2 border border-dashed rounded-2xl">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Memuat laporan bantuan BPBD...</span>
            </div>
          ) : ewsOrders.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800">
              Tidak ada permohonan bantuan darurat banjir saat ini.
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 px-1">Permohonan Bantuan Darurat</h3>
              {ewsOrders.map((order) => {
                const details = order.citizenDetails || {};
                const isPending = order.status !== "completed";
            return (
              <div
                key={order.id}
                    className="p-4 rounded-2xl bg-white dark:bg-[#0c1220] border-2 border-orange-500/40 shadow-sm space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Waves className="h-4 w-4 text-orange-600" />
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {details.levelSiaga || "Permohonan Bantuan Darurat"}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2">
                          <span>Pelapor: {details.reporterName || order.customerName}</span>
                          <span>•</span>
                          <span>Telp: {details.phone || order.customerPhone}</span>
                        </div>
                      </div>

                      <Badge variant={isPending ? "amber" : "emerald"} size="sm">
                        {order.status}
                      </Badge>
                    </div>

                    <div className="text-xs text-slate-600 dark:text-zinc-300 bg-orange-50/60 dark:bg-orange-950/20 p-2.5 rounded-xl border border-orange-200 dark:border-orange-900/40">
                      <span>Lokasi: {details.address || order.pickupLocation?.address}</span>
                      
                      {details.bantuanDipilih && details.bantuanDipilih.length > 0 && (
                        <div className="mt-2">
                          <span className="font-semibold block text-orange-800 dark:text-orange-300 mb-1">Bantuan Diminta:</span>
                          <div className="flex flex-wrap gap-1">
                            {details.bantuanDipilih.map((b: string) => (
                              <span key={b} className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 rounded-md text-[10px] font-medium border border-orange-200 dark:border-orange-800/50">
                                {b.replace(/_/g, ' ').toUpperCase()}
                              </span>
                            ))}
                          </div>
                        </div>
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
                          onClick={() => order.id && handleResolveBpbd(order.id)}
                          disabled={dispatchingId === order.id}
                          className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold h-8 px-3 cursor-pointer shadow-xs"
                        >
                          {dispatchingId === order.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                          ) : (
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                          )}
                          <span>Tindak Lanjuti & Kirim Tim TRC</span>
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
