"use client";

import React, { useState, useMemo } from "react";
import { Search, X, Inbox, Filter, Clock, MapPin, CheckCircle2, ChevronRight, FileCheck2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrderDocument } from "@/types/order.types";
import { CivicServiceFulfillmentModal } from "@/components/government/shared/CivicServiceFulfillmentModal";

interface GovOrdersTabProps {
  citizenRequests: OrderDocument[];
  loadingRequests: boolean;
  activeDinasId: string;
}

export function GovOrdersTab({
  citizenRequests,
  loadingRequests,
  activeDinasId
}: GovOrdersTabProps) {
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [selectedFulfillmentOrder, setSelectedFulfillmentOrder] = useState<OrderDocument | null>(null);

  const filteredOrders = useMemo(() => {
    return citizenRequests.filter((order) => {
      const matchStatus = 
        orderStatusFilter === "all" ? true :
        orderStatusFilter === "pending_verification" ? order.status === "pending_verification" :
        orderStatusFilter === "in_progress" ? (order.status === "pending" || order.status === "accepted" || order.status === "in_progress") :
        orderStatusFilter === "completed" ? order.status === "completed" :
        orderStatusFilter === "rejected" ? order.status === "rejected" : true;

      const q = orderSearchQuery.toLowerCase().trim();
      const matchSearch = !q ||
        order.id?.toLowerCase().includes(q) ||
        order.customerName?.toLowerCase().includes(q) ||
        order.serviceTitle?.toLowerCase().includes(q) ||
        (order.citizenDetails?.nikOrRef && order.citizenDetails.nikOrRef.toLowerCase().includes(q));

      return matchStatus && matchSearch;
    });
  }, [citizenRequests, orderStatusFilter, orderSearchQuery]);

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={orderSearchQuery}
            onChange={(e) => setOrderSearchQuery(e.target.value)}
            placeholder="Cari nama warga, nomor tiket, NIK, jenis permohonan..."
            className="w-full pl-9 pr-9 py-2.5 bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-xs"
          />
          {orderSearchQuery && (
            <button
              onClick={() => setOrderSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: "all", label: "Semua", count: citizenRequests.length },
            { id: "pending_verification", label: "Menunggu Verifikasi", count: citizenRequests.filter(o => o.status === "pending_verification").length },
            { id: "in_progress", label: "Proses & Kurir", count: citizenRequests.filter(o => o.status === "pending" || o.status === "accepted" || o.status === "in_progress").length },
            { id: "completed", label: "Selesai", count: citizenRequests.filter(o => o.status === "completed").length },
            { id: "rejected", label: "Ditolak", count: citizenRequests.filter(o => o.status === "rejected").length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setOrderStatusFilter(tab.id)}
              className={`px-3 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer border ${
                orderStatusFilter === tab.id
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-white dark:bg-[#0c1220] text-slate-600 dark:text-zinc-400 border-slate-200/80 dark:border-white/[0.08] hover:border-slate-300"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                orderStatusFilter === tab.id ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-white/[0.06] text-slate-500"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Orders Stream List */}
      {loadingRequests ? (
        <div className="p-16 text-center bg-white dark:bg-[#0c1220] rounded-[2rem] border border-slate-200/80 dark:border-white/[0.08]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
          <p className="text-xs text-slate-400">Memuat berkas permohonan warga...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-[#0c1220] rounded-[2rem] border border-dashed border-slate-200 dark:border-white/[0.08] space-y-2">
          <Inbox className="h-10 w-10 text-slate-300 dark:text-zinc-600 mx-auto" />
          <h4 className="text-sm font-bold text-slate-700 dark:text-zinc-300">
            Tidak ada permohonan warga
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {orderSearchQuery
              ? `Tidak ditemukan permohonan yang sesuai dengan "${orderSearchQuery}".`
              : "Semua permohonan layanan pada dinas ini telah selesai diproses."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              onClick={() => setSelectedFulfillmentOrder(order)}
              className="p-5 rounded-[2rem] bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/[0.08] shadow-xs hover:border-blue-500/40 transition-all cursor-pointer space-y-3.5 group"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400">
                      #{order.id?.slice(0, 8).toUpperCase()}
                    </span>
                    <Badge
                      variant={
                        order.status === "pending_verification" ? "amber" :
                        order.status === "completed" ? "emerald" :
                        order.status === "rejected" ? "rose" : "blue"
                      }
                      size="sm"
                      className="font-bold text-[10px]"
                    >
                      {order.status === "pending_verification" ? "⏳ Menunggu Verifikasi" :
                       order.status === "completed" ? "✅ Selesai Terbit" :
                       order.status === "rejected" ? "❌ Ditolak" : "🚀 Diproses / Kurir OTW"}
                    </Badge>
                  </div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {order.serviceTitle || "Layanan Administrasi"}
                  </h4>
                </div>

                <div className="text-right text-[11px] text-slate-400 space-y-0.5">
                  <span className="block font-medium">Pemohon:</span>
                  <span className="font-bold text-slate-800 dark:text-zinc-200">
                    {order.customerName || "Warga Surakarta"}
                  </span>
                </div>
              </div>

              {/* Citizen Details Preview */}
              {order.citizenDetails && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] text-xs grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {order.citizenDetails.nikOrRef && (
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">NIK / No. Identitas:</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">
                        {order.citizenDetails.nikOrRef}
                      </span>
                    </div>
                  )}
                  {order.dropoffLocation?.address && (
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Alamat Pengantaran Dokumen:</span>
                      <span className="truncate block font-medium text-slate-700 dark:text-zinc-300">
                        {order.dropoffLocation.address}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Action Bar */}
              <div className="pt-2 border-t border-slate-100 dark:border-white/[0.04] flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">
                  {order.price === 0 ? "Subsidi Pemkot (Gratis)" : `Ongkir Kurir: Rp ${order.price?.toLocaleString("id-ID")}`}
                </span>

                <div className="flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform">
                  <span>Proses & Tentukan Luaran</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fulfillment Modal */}
      {selectedFulfillmentOrder && (
        <CivicServiceFulfillmentModal
          isOpen={Boolean(selectedFulfillmentOrder)}
          onClose={() => setSelectedFulfillmentOrder(null)}
          order={selectedFulfillmentOrder}
        />
      )}
    </div>
  );
}
