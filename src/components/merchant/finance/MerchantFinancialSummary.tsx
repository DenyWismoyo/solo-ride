"use client";

import React, { useMemo } from "react";
import { useMerchantContext } from "../layout/MerchantContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Wallet, 
  TrendingUp, 
  Coins, 
  ShieldCheck, 
  ArrowUpRight, 
  Sparkles, 
  CheckCircle2,
  Calendar,
  Receipt
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";

export function MerchantFinancialSummary() {
  const { orders, merchant } = useMerchantContext();

  const completedOrders = useMemo(() => orders.filter(o => o.status === "completed"), [orders]);

  const totalOmzet = useMemo(() => {
    return completedOrders.reduce((sum, o) => sum + (o.price || 0), 0);
  }, [completedOrders]);

  // Estimated savings compared to 25% big tech commission
  const savedCommission = useMemo(() => {
    return Math.round(totalOmzet * 0.25);
  }, [totalOmzet]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-[2rem] bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 shadow-sm space-y-3">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-2xl shrink-0">
            💰
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              Laporan Keuangan & Omzet Bersih UMKM
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              100% Hak Penuh Mitra Tanpa Biaya Komisi per Pesanan (Zero Commission Platform)
            </p>
          </div>
        </div>
      </div>

      {/* Financial Bento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Omzet */}
        <div className="p-5 rounded-[2rem] bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/[0.08] shadow-xs space-y-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
            TOTAL OMZET BERSIH
          </span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono block">
            {formatRupiah(totalOmzet)}
          </span>
          <span className="text-[10px] text-slate-500 font-medium block">
            Dari {completedOrders.length} pesanan berhasil
          </span>
        </div>

        {/* Saved Commission */}
        <div className="p-5 rounded-[2rem] bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/30 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider">
              PENGHEMATAN KOMISI
            </span>
            <Badge variant="amber" size="sm" className="text-[9px] font-bold">HEMAT 25%</Badge>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 font-mono block">
            +{formatRupiah(savedCommission)}
          </span>
          <span className="text-[10px] text-slate-600 dark:text-zinc-400 font-medium block">
            Uang ekstra yang tidak dipotong oleh Ride-Solo
          </span>
        </div>

        {/* Cooperative Wallet Info */}
        <div className="p-5 rounded-[2rem] bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/[0.08] shadow-xs space-y-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
            STATUS DOMPET KOPERASI
          </span>
          <span className="text-2xl sm:text-3xl font-black text-teal-600 dark:text-teal-400 font-mono block">
            {formatRupiah(totalOmzet)}
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Siap Dicairkan Kapan Saja
          </span>
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="p-5 sm:p-6 rounded-[2rem] bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/[0.08] shadow-xs space-y-4">
        <h3 className="text-sm font-black text-slate-900 dark:text-white">
          Riwayat Transaksi Penjualan Selesai
        </h3>

        {completedOrders.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 space-y-2">
            <Receipt className="h-8 w-8 text-slate-300 mx-auto" />
            <p>Belum ada transaksi selesai pada sesi ini.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {completedOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                      #{order.id?.slice(0, 7).toUpperCase()}
                    </span>
                    <Badge variant="emerald" size="sm" className="text-[9px] font-bold">Lunas 100%</Badge>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Pelanggan: <strong className="text-slate-700 dark:text-zinc-300">{order.customerName || "Warga Solo"}</strong> ({order.items?.length || 1} Menu)
                  </p>
                </div>

                <div className="text-right">
                  <span className="font-mono text-sm font-black text-emerald-600 dark:text-emerald-400 block">
                    +{formatRupiah(order.price || 0)}
                  </span>
                  <span className="text-[9px] text-slate-400">
                    {order.paymentMethod === "cash" ? "Tunai COD" : "QRIS Dompet"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
