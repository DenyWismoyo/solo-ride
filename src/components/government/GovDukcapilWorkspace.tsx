"use client";

import React, { useState } from "react";
import { OrderDocument } from "@/types/order.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileCheck2, 
  Truck, 
  Loader2, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  Key, 
  ShieldCheck, 
  Clock, 
  Search, 
  Filter,
  Building,
  UserCheck
} from "lucide-react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";

interface GovDukcapilWorkspaceProps {
  orders: OrderDocument[];
  loading: boolean;
}

export function GovDukcapilWorkspace({ orders, loading }: GovDukcapilWorkspaceProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending_verification" | "pending" | "in_progress" | "completed">("all");
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);

  const pendingVerificationOrders = orders.filter(o => o.status === "pending_verification");
  const inTransitOrders = orders.filter(o => o.status === "in_progress" || o.status === "accepted" || o.status === "pending");
  const completedOrders = orders.filter(o => o.status === "completed");

  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      (o.citizenDetails?.nikOrRef || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.customerName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.citizenDetails?.documentType || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.dropoffLocation.address || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDispatchDocument = async (orderId: string) => {
    setDispatchingId(orderId);
    try {
      await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
        status: "pending", // Appears in Driver Mitra radar!
        verifiedByDinasAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      alert("✅ Dokumen Kependudukan Berhasil Divalidasi! Order pengantaran telah meluncur ke Radar Driver Mitra Surakarta.");
    } catch (err: any) {
      console.error("Gagal dispatch dokumen:", err);
      alert(`Gagal dispatch: ${err.message || err}`);
    } finally {
      setDispatchingId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. EXECUTIVE METRICS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">Berkas Masuk Warga</span>
          <div className="text-xl font-black text-slate-900 dark:text-white">{orders.length}</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wider">Perlu Validasi Fisik</span>
          <div className="text-xl font-black text-rose-600 dark:text-rose-400">{pendingVerificationOrders.length}</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">Dalam Pengantaran</span>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400">{inTransitOrders.length}</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Diterima Warga (Selesai)</span>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">{completedOrders.length}</div>
        </div>
      </div>

      {/* 2. SEARCH & STATUS FILTER */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 dark:text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari NIK, nama warga, jenis dokumen, atau kelurahan..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {(
            [
              { id: "all", label: "Semua Berkas", count: orders.length },
              { id: "pending_verification", label: "Perlu Validasi", count: pendingVerificationOrders.length },
              { id: "pending", label: "Di Radar Driver", count: orders.filter(o => o.status === "pending").length },
              { id: "in_progress", label: "Sedang Diantar", count: orders.filter(o => o.status === "in_progress").length },
              { id: "completed", label: "Telah Diterima", count: completedOrders.length },
            ] as const
          ).map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer shrink-0 border ${
                statusFilter === st.id
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800 hover:border-blue-400"
              }`}
            >
              <span>{st.label}</span>
              <span className="text-[9px] opacity-70 ml-1.5 px-1 py-0.2 bg-black/10 dark:bg-white/20 rounded">
                {st.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. DOCUMENT QUEUE LIST */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800">
            <Loader2 className="h-6 w-6 text-blue-500 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500">Memeriksa antrean berkas kependudukan...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 text-xs text-slate-500">
            Tidak ada berkas yang cocok dengan pencarian atau filter status.
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="sg-card p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 space-y-3 shadow-sm hover:border-blue-500/40 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {order.citizenDetails?.documentType || "KTP-el / Dokumen Kependudukan"}
                    </span>
                    <Badge
                      variant={
                        order.status === "pending_verification" ? "rose" :
                        order.status === "pending" ? "amber" :
                        order.status === "in_progress" ? "blue" : "emerald"
                      }
                      size="sm"
                    >
                      {order.status === "pending_verification" ? "Menunggu Validasi Fisik" :
                       order.status === "pending" ? "Dalam Radar Driver" :
                       order.status === "in_progress" ? "Driver Sedang Mengantar" : "Telah Diterima Warga"}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-zinc-300">
                    Pemohon: <strong>{order.customerName}</strong> • {order.customerPhone}
                  </p>
                </div>

                <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                  Rp {order.price.toLocaleString("id-ID")}
                </span>
              </div>

              {/* Document details box */}
              <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl space-y-1.5 text-xs text-slate-600 dark:text-zinc-300 border border-slate-100 dark:border-zinc-700/60">
                <div className="flex justify-between">
                  <span className="text-[10px] text-slate-400">NIK / No. Registrasi:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{order.citizenDetails?.nikOrRef || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] text-slate-400">Lokasi Asal Berkas:</span>
                  <span className="font-medium text-slate-800 dark:text-zinc-200">{order.pickupLocation.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] text-slate-400">Alamat Antar Rumah:</span>
                  <span className="font-medium text-slate-800 dark:text-zinc-200 truncate max-w-[220px]">{order.dropoffLocation.address}</span>
                </div>
                {order.citizenDetails?.otpCode && (
                  <div className="flex justify-between items-center pt-1 border-t border-slate-200 dark:border-zinc-700">
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">Kode OTP Amplop Fisik:</span>
                    <span className="font-mono font-black text-xs text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                      {order.citizenDetails.otpCode}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              {order.status === "pending_verification" && (
                <Button
                  size="sm"
                  onClick={() => order.id && handleDispatchDocument(order.id)}
                  disabled={dispatchingId === order.id}
                  className="w-full h-9 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {dispatchingId === order.id ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Menyerahkan ke Driver...
                    </>
                  ) : (
                    <>
                      <Truck className="h-3.5 w-3.5" /> Validasi Fisik & Dispatch ke Driver Mitra Solo
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
