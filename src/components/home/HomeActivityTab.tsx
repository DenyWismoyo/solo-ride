"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { Clock, CheckCircle2, XCircle, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { HistoryFilterBar } from "@/components/history/HistoryFilterBar";
import { OrderDocument } from "@/types/order.types";
import { ServiceCategory, getOrderCategory, GOV_STATUS_LABELS } from "@/constants/serviceCategories";

interface HomeActivityTabProps {
  customerOrders: OrderDocument[];
  onSelectOrderReceipt: (order: OrderDocument) => void;
}

export function HomeActivityTab({
  customerOrders,
  onSelectOrderReceipt
}: HomeActivityTabProps) {
  const [orderStatusFilter, setOrderStatusFilter] = useState<"all" | "active" | "completed" | "cancelled">("all");
  const [activeHistoryCategory, setActiveHistoryCategory] = useState<ServiceCategory | "semua">("semua");

  const filtered = customerOrders.filter((order) => {
    const catMatch = activeHistoryCategory === "semua" || getOrderCategory(order) === activeHistoryCategory;
    const statusMatch = orderStatusFilter === "all"
      || (orderStatusFilter === "active" && !["completed","cancelled","rejected"].includes(order.status))
      || order.status === orderStatusFilter;
    return catMatch && statusMatch;
  });

  return (
    <motion.main
      key="orders"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="pt-20 px-4 max-w-lg w-full mx-auto flex-1 space-y-4 relative z-10 pb-24"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Pesanan & Aktivitas
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">Riwayat mobilitas, kuliner & pengantaran</p>
        </div>
        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          {customerOrders.length} Total
        </span>
      </div>

      <div className="mb-3">
        <HistoryFilterBar 
          activeCategory={activeHistoryCategory} 
          onCategoryChange={setActiveHistoryCategory} 
          orders={customerOrders} 
        />
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setOrderStatusFilter("all")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
            orderStatusFilter === "all"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
              : "bg-white dark:bg-white/[0.04] text-slate-600 dark:text-zinc-400 border border-slate-200/80 dark:border-white/[0.06]"
          }`}
        >
          Semua ({customerOrders.length})
        </button>

        <button
          onClick={() => setOrderStatusFilter("active")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
            orderStatusFilter === "active"
              ? "bg-amber-600 text-white shadow-sm"
              : "bg-white dark:bg-white/[0.04] text-slate-600 dark:text-zinc-400 border border-slate-200/80 dark:border-white/[0.06]"
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          <span>Dalam Proses ({customerOrders.filter(o => o.status !== "completed" && o.status !== "cancelled" && o.status !== "rejected").length})</span>
        </button>

        <button
          onClick={() => setOrderStatusFilter("completed")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
            orderStatusFilter === "completed"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-white dark:bg-white/[0.04] text-slate-600 dark:text-zinc-400 border border-slate-200/80 dark:border-white/[0.06]"
          }`}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Selesai ({customerOrders.filter(o => o.status === "completed").length})</span>
        </button>

        <button
          onClick={() => setOrderStatusFilter("cancelled")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
            orderStatusFilter === "cancelled"
              ? "bg-rose-600 text-white shadow-sm"
              : "bg-white dark:bg-white/[0.04] text-slate-600 dark:text-zinc-400 border border-slate-200/80 dark:border-white/[0.06]"
          }`}
        >
          <XCircle className="h-3.5 w-3.5" />
          <span>Dibatalkan ({customerOrders.filter(o => o.status === "cancelled" || o.status === "rejected").length})</span>
        </button>
      </div>

      {/* Filtered Order Feed */}
      {filtered.length === 0 ? (
        <div className="p-8 rounded-3xl border border-slate-200 dark:border-zinc-800 text-center space-y-3 shadow-sm bg-white/95 dark:bg-[#0c1220]/95">
          <Clock className="h-10 w-10 text-slate-400 dark:text-zinc-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200">Tidak Ada Riwayat</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-xs mx-auto">
            {orderStatusFilter === "active" 
              ? "Tidak ada pesanan yang sedang berlangsung." 
              : "Pesan ojek, makanan, atau kebutuhan harian Anda untuk melihat riwayat aktivitas di sini."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const isGovOrder = getOrderCategory(order) === "layanan_publik";
            const govStatus = GOV_STATUS_LABELS[order.status];
            
            return (
              <motion.div
                key={order.id}
                whileTap={{ scale: 0.97 }}
                whileHover={{ y: -2 }}
                onClick={() => onSelectOrderReceipt(order)}
                className="p-4.5 rounded-[1.8rem] bg-white/95 dark:bg-[#0c1220]/95 space-y-3.5 shadow-xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden border border-slate-200/80 dark:border-white/[0.08]"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                        {order.serviceTitle || order.serviceType}
                      </span>
                      {isGovOrder && govStatus ? (
                        <Badge variant={govStatus.color as any} size="sm">
                          {govStatus.label}
                        </Badge>
                      ) : (
                        <Badge 
                          variant={
                            order.status === "completed" ? "emerald" :
                            order.status === "cancelled" || order.status === "rejected" ? "rose" :
                            order.status === "in_progress" ? "blue" : "amber"
                          } 
                          size="sm"
                        >
                          {order.status === "completed" ? "Selesai" : order.status === "cancelled" || order.status === "rejected" ? "Batal" : order.status}
                        </Badge>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      ID: #{order.id?.slice(0, 8).toUpperCase()}
                    </p>
                  </div>

                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    Rp {Number(order.price || 0).toLocaleString("id-ID")}
                  </span>
                </div>

                {isGovOrder ? (
                  <div className="p-3 bg-indigo-500/5 dark:bg-indigo-950/20 rounded-2xl space-y-1.5">
                    <div className="flex items-start gap-2">
                      <span className="text-[10px] font-bold text-indigo-500 uppercase shrink-0 mt-0.5">Dinas:</span>
                      <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                        {order.agencyName || "Dinas Pemkot Surakarta"}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0 mt-0.5">Layanan:</span>
                      <span className="text-xs text-slate-700 dark:text-zinc-300">
                        {order.serviceTitle || order.serviceType}
                      </span>
                    </div>
                    {order.status === "rejected" && order.rejectionReason && (
                      <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-xl mt-1">
                        <p className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold leading-snug">
                          Ditolak: {order.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50/90 dark:bg-white/[0.03] rounded-2xl space-y-1.5 text-xs text-slate-600 dark:text-zinc-300">
                    <div className="flex items-start gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mt-0.5">Jemput:</span>
                      <span className="font-semibold text-slate-800 dark:text-zinc-200 truncate">{order.pickupLocation?.address}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mt-0.5">Tujuan:</span>
                      <span className="font-semibold text-slate-800 dark:text-zinc-200 truncate">{order.dropoffLocation?.address}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                  <span className="font-medium">
                    {order.driverName ? `Mitra: ${order.driverName}` : "Pesanan Langsung"}
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-0.5">
                    Buka E-Struk <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.main>
  );
}
