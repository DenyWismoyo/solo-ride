"use client";

import React, { useState } from "react";
import { OrderDocument } from "@/types/order.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Receipt, Coins, CheckCircle2, Loader2, MapPin, Phone , XCircle} from "lucide-react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";

interface GovWorkspaceProps {
  orders: OrderDocument[];
  loading: boolean;
}

export function BapendaWorkspace({ orders, loading }: GovWorkspaceProps) {
  const pbbOrders = orders.filter(o => o.serviceType?.includes("pbb") || o.serviceType?.includes("retribusi"));

  return (
    <div className="space-y-5">
      {/* 1. METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">Transaksi PBB-P2</span>
          <div className="text-xl font-black text-slate-900 dark:text-white">{pbbOrders.length}</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">PAD Terkumpul</span>
          <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-1">Rp 1.45 Miliar</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold uppercase tracking-wider">e-Retribusi Pasar</span>
          <div className="text-xl font-black text-teal-600 dark:text-teal-400">44 Pasar</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">Kepatuhan Pajak</span>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400">92.4%</div>
        </div>
      </div>

      {/* 2. ORDER LIST */}
      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Memuat data transaksi pajak Bapenda...</span>
        </div>
      ) : pbbOrders.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800">
          Belum ada riwayat transaksi PBB / retribusi masuk.
        </div>
      ) : (
        <div className="space-y-3">
          {pbbOrders.map((order) => {
            const details = order.citizenDetails || {};
            return (
              <div
                key={order.id}
                className="p-4 rounded-2xl bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/[0.08] shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {details.taxpayerName || order.customerName || "Wajib Pajak Surakarta"}
                      </span>
                      <Badge variant="blue" size="sm" className="text-[10px]">
                        NOP: {details.nopPbb || "-"}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span>Tahun: {details.taxYear || "2026"}</span>
                      <span>•</span>
                      <span>Total: Rp {(order.price || 0).toLocaleString("id-ID")}</span>
                    </div>
                  </div>

                  <Badge variant="emerald" size="sm">
                    {order.status}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
