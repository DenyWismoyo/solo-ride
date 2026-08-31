"use client";

import React, { useState } from "react";
import { OrderDocument } from "@/types/order.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Stethoscope, 
  Pill, 
  Truck, 
  Loader2, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Search,
  Filter,
  Building
} from "lucide-react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";

interface GovDinkesWorkspaceProps {
  orders: OrderDocument[];
  loading: boolean;
}

export function GovDinkesWorkspace({ orders, loading }: GovDinkesWorkspaceProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);

  const pendingVerificationOrders = orders.filter(o => o.status === "pending_verification");
  const completedOrders = orders.filter(o => o.status === "completed");

  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      (o.citizenDetails?.medicalRecordNumber || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.customerName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.citizenDetails?.selectedPuskesmas || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleDispatchMedicine = async (orderId: string) => {
    setDispatchingId(orderId);
    try {
      await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
        status: "pending", // Enters driver radar!
        verifiedByDinasAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      alert("✅ Resep Farmasi Berhasil Divalidasi & Disegel Steril! Pesanan diteruskan ke Radar Kurir Medis Driver.");
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
        <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold uppercase tracking-wider">Total Resep Obat</span>
          <div className="text-xl font-black text-slate-900 dark:text-white">{orders.length}</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wider">Perlu Segel Farmasi</span>
          <div className="text-xl font-black text-rose-600 dark:text-rose-400">{pendingVerificationOrders.length}</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">Jaringan 17 Puskesmas</span>
          <div className="text-xl font-black text-blue-600 dark:text-blue-400">17 Faskes</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Obat Telah Diterima Pasien</span>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">{completedOrders.length}</div>
        </div>
      </div>

      {/* 2. SEARCH BAR */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 dark:text-zinc-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari No. RM, nama pasien, atau puskesmas asal..."
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-teal-500"
        />
      </div>

      {/* 3. PHARMACY QUEUE LIST */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800">
            <Loader2 className="h-6 w-6 text-teal-500 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500">Memeriksa antrean resep farmasi...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 text-xs text-slate-500">
            Tidak ada permohonan resep obat yang cocok.
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="sg-card p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 space-y-3 shadow-sm hover:border-teal-500/40 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {order.citizenDetails?.selectedPuskesmas?.split(" (")[0] || "Puskesmas Surakarta"}
                    </span>
                    <Badge variant={order.status === "pending_verification" ? "rose" : "teal"} size="sm">
                      {order.status === "pending_verification" ? "Menunggu Verifikasi RM" : "Siap Antar"}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-zinc-300">
                    Pasien: <strong>{order.customerName}</strong> • {order.customerPhone}
                  </p>
                </div>

                <span className="text-xs font-black text-teal-600 dark:text-teal-400">
                  Rp {order.price.toLocaleString("id-ID")}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl space-y-1 text-xs text-slate-600 dark:text-zinc-300 border border-slate-100 dark:border-zinc-700/60">
                <div className="flex justify-between">
                  <span className="text-[10px] text-slate-400">No. Rekam Medis (No. RM):</span>
                  <span className="font-mono font-bold text-teal-600 dark:text-teal-400">{order.citizenDetails?.medicalRecordNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] text-slate-400">Kategori Obat:</span>
                  <span className="font-medium text-slate-900 dark:text-white">{order.citizenDetails?.medicineType}</span>
                </div>
                {order.citizenDetails?.allergyNotes && (
                  <div className="flex justify-between text-rose-500 font-semibold">
                    <span className="text-[10px]">Catatan Alergi:</span>
                    <span>{order.citizenDetails.allergyNotes}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[10px] text-slate-400">Alamat Pasien:</span>
                  <span className="font-medium text-slate-800 dark:text-zinc-200 truncate max-w-[220px]">{order.dropoffLocation.address}</span>
                </div>
              </div>

              {order.status === "pending_verification" && (
                <Button
                  size="sm"
                  onClick={() => order.id && handleDispatchMedicine(order.id)}
                  disabled={dispatchingId === order.id}
                  className="w-full h-9 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {dispatchingId === order.id ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Menyetujui Farmasi...
                    </>
                  ) : (
                    <>
                      <Pill className="h-3.5 w-3.5" /> Konfirmasi Segel Steril & Panggil Kurir Medis
                    </>
                  )}
                </Button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
