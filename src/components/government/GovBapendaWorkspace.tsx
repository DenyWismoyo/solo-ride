"use client";

import React, { useState } from "react";
import { OrderDocument } from "@/types/order.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Receipt, 
  Store, 
  ShieldCheck, 
  CheckCircle2, 
  Loader2, 
  TrendingUp, 
  Coins, 
  Search, 
  Filter, 
  BarChart3, 
  Clock, 
  ArrowUpRight,
  QrCode,
  Sparkles,
  HelpCircle,
  FileCheck2
} from "lucide-react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";

interface GovBapendaWorkspaceProps {
  orders: OrderDocument[];
  loading: boolean;
}

export function GovBapendaWorkspace({ orders, loading }: GovBapendaWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<"verifikasi" | "retribusi" | "analisis">("verifikasi");
  const [searchQuery, setSearchQuery] = useState("");
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const pendingVerificationOrders = orders.filter(o => o.status === "pending_verification");
  const completedTaxOrders = orders.filter(o => o.status === "completed");

  const totalPAD = completedTaxOrders.reduce((acc, curr) => acc + (curr.price || 0), 0) + 845000000; // Baseline simulasi PAD

  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      (o.citizenDetails?.nikOrNpwp || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.citizenDetails?.spptNumber || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.customerName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.citizenDetails?.kiosId || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleApproveTaxPayment = async (orderId: string) => {
    setVerifyingId(orderId);
    try {
      await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
        status: "completed",
        verifiedByDinasAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      alert("✅ Pembayaran Pajak / Retribusi Sah Divalidasi! Bukti Setor Elektronik diterbitkan ke aplikasi wajib pajak.");
    } catch (err: any) {
      console.error("Gagal memvalidasi pajak:", err);
      alert(`Gagal memvalidasi: ${err.message || err}`);
    } finally {
      setVerifyingId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. EXECUTIVE METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">Total Realisasi PAD</span>
          <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
            Rp {(totalPAD / 1000000).toFixed(1)} Juta
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wider">Perlu Verifikasi Fisik/SPPT</span>
          <div className="text-xl font-black text-rose-600 dark:text-rose-400">
            {pendingVerificationOrders.length}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Kios Pasar Terintegrasi QRIS</span>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
            854 Kios
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold uppercase tracking-wider">Indeks Kepatuhan Wajib Pajak</span>
          <div className="text-xl font-black text-teal-600 dark:text-teal-400">
            94.8%
          </div>
        </div>
      </div>

      {/* 2. TAB SELECTOR */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-white/[0.04] rounded-2xl">
        <button
          onClick={() => setActiveTab("verifikasi")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "verifikasi"
              ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-zinc-800"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900"
          }`}
        >
          <Receipt className="h-4 w-4" />
          <span>Antrean Verifikasi Pajak & SPPT ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("retribusi")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "retribusi"
              ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-zinc-800"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900"
          }`}
        >
          <Store className="h-4 w-4" />
          <span>Monitoring e-Retribusi Pasar</span>
        </button>

        <button
          onClick={() => setActiveTab("analisis")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "analisis"
              ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-zinc-800"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900"
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>Analisis PAD Surakarta</span>
        </button>
      </div>

      {/* TAB 1: VERIFIKASI PAJAK */}
      {activeTab === "verifikasi" && (
        <div className="space-y-3.5">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari NOP, NIK / NPWP, nama wajib pajak, atau nomor kios..."
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {loading ? (
            <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800">
              <Loader2 className="h-6 w-6 text-indigo-500 animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500">Memeriksa permohonan setoran pajak masuk...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 text-xs text-slate-500">
              Tidak ada permohonan pembayaran pajak yang menunggu verifikasi saat ini.
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className="sg-card p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 space-y-3 shadow-sm hover:border-indigo-500/40 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {order.serviceTitle || "Pembayaran Pajak Daerah"}
                      </span>
                      <Badge
                        variant={order.status === "pending_verification" ? "rose" : "emerald"}
                        size="sm"
                      >
                        {order.status === "pending_verification" ? "Menunggu Validasi Kasir" : "Lunas & Sah"}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-zinc-300">
                      Wajib Pajak: <strong>{order.customerName}</strong> • {order.customerPhone}
                    </p>
                  </div>

                  <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                    Rp {(order.price || 0).toLocaleString("id-ID")}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl space-y-1 text-xs text-slate-600 dark:text-zinc-300 border border-slate-100 dark:border-zinc-700/60">
                  {order.citizenDetails?.spptNumber && (
                    <div className="flex justify-between">
                      <span className="text-[10px] text-slate-400">NOP / SPPT:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{order.citizenDetails.spptNumber}</span>
                    </div>
                  )}
                  {order.citizenDetails?.kiosId && (
                    <div className="flex justify-between">
                      <span className="text-[10px] text-slate-400">Identitas Kios:</span>
                      <span className="font-medium text-slate-900 dark:text-white">{order.citizenDetails.kiosId}</span>
                    </div>
                  )}
                  {order.citizenDetails?.nikOrNpwp && (
                    <div className="flex justify-between">
                      <span className="text-[10px] text-slate-400">NIK / NPWPD:</span>
                      <span className="font-mono text-slate-800 dark:text-zinc-200">{order.citizenDetails.nikOrNpwp}</span>
                    </div>
                  )}
                  {order.citizenDetails?.notes && (
                    <div className="flex justify-between">
                      <span className="text-[10px] text-slate-400">Keterangan:</span>
                      <span className="text-slate-800 dark:text-zinc-200">{order.citizenDetails.notes}</span>
                    </div>
                  )}
                </div>

                {order.status === "pending_verification" && (
                  <Button
                    size="sm"
                    onClick={() => order.id && handleApproveTaxPayment(order.id)}
                    disabled={verifyingId === order.id}
                    className="w-full h-9 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {verifyingId === order.id ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Menerbitkan Bukti Setor...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-3.5 w-3.5" /> Sahkan Pembayaran & Terbitkan Tanda Bukti Lunas
                      </>
                    )}
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: MONITORING RETRIBUSI PASAR */}
      {activeTab === "retribusi" && (
        <div className="space-y-3">
          <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-500/30 rounded-2xl text-xs text-indigo-900 dark:text-indigo-300">
            Monitoring digitalisasi retribusi harian kios pasar tradisional Surakarta terintegrasi QRIS Kas Daerah.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { name: "Pasar Gede Hardjonagoro", activeKios: "245 / 260 Kios", collected: "Rp 3.850.000 / Hari", status: "Kepatuhan 94%" },
              { name: "Pasar Legi Surakarta", activeKios: "320 / 340 Kios", collected: "Rp 5.200.000 / Hari", status: "Kepatuhan 92%" },
              { name: "Pasar Klewer Solo", activeKios: "410 / 430 Kios", collected: "Rp 8.600.000 / Hari", status: "Kepatuhan 95%" },
              { name: "Pasar Harjodaksino (Gemblegan)", activeKios: "120 / 135 Kios", collected: "Rp 1.800.000 / Hari", status: "Kepatuhan 89%" }
            ].map((m, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 space-y-2 shadow-sm">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{m.name}</h4>
                  <Badge variant="emerald" size="sm">{m.status}</Badge>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100 dark:border-zinc-700">
                  <span>Kios Aktif QRIS: <strong>{m.activeKios}</strong></span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">{m.collected}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ANALISIS PAD SURAKARTA */}
      {activeTab === "analisis" && (
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <span>Transparansi Sirkulasi Pajak & PAD Kota Surakarta</span>
            </h4>
            <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
              Seluruh retribusi kios pasar dan pembayaran PBB terhubung otomatis ke kas daerah secara transparan. Setiap rupiah yang disetor warga dialokasikan kembali untuk subsidi operasional armada ojek lansia/difabel dan dana bergulir UMKM pasar.
            </p>
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-center">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Status Efisiensi Penyerapan Pajak Daerah:</span>
              <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">OPTIMAL & TEPAT SASARAN (Surat Edaran Walikota 2026)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
