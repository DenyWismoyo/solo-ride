"use client";

import React, { useState, useMemo } from "react";
import { useAuthContext } from "@/components/AuthProvider";
import { useRoleHistory } from "@/hooks/useRoleHistory";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrderDocument, OrderStatus } from "@/types/order.types";
import { HistoryDetailReceiptModal } from "./HistoryDetailReceiptModal";
import { 
  History, 
  Clock, 
  MapPin, 
  Store, 
  Bike, 
  Car, 
  Package, 
  UtensilsCrossed, 
  Users2, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  Coins, 
  Building2, 
  Landmark, 
  ChevronRight, 
  FileText, 
  Loader2, 
  X,
  Calendar,
  Sparkles,
  Award
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface UnifiedHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: string;
}

export function UnifiedHistoryModal({
  isOpen,
  onClose,
  initialRole,
}: UnifiedHistoryModalProps) {
  const { user, userData, activeRole: contextRole, effectiveUid, impersonatedPersona } = useAuthContext();
  
  const activeRole = (initialRole || contextRole || "customer") as any;
  const activeUid = effectiveUid || user?.uid;
  const additionalRole = impersonatedPersona?.additionalRole || userData?.additionalRole;
  const storeSlug = impersonatedPersona?.attributes?.storeSlug || userData?.storeSlug;

  // Real-time role-scoped history
  const { orders, stats, loading } = useRoleHistory(activeRole, activeUid, additionalRole, storeSlug);

  // Filter States
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "active" | "cancelled">("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Selected Order for Receipt Modal
  const [selectedOrder, setSelectedOrder] = useState<OrderDocument | null>(null);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // 1. Status Filter
      if (statusFilter === "completed" && order.status !== "completed") return false;
      if (statusFilter === "cancelled" && order.status !== "cancelled") return false;
      if (statusFilter === "active" && (order.status === "completed" || order.status === "cancelled")) return false;

      // 2. Service Filter
      if (serviceFilter !== "all" && order.serviceType !== serviceFilter) return false;

      // 3. Search Query Filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const idMatch = order.id?.toLowerCase().includes(query);
        const titleMatch = (order as any).serviceTitle?.toLowerCase().includes(query) || order.serviceType?.toLowerCase().includes(query);
        const pickupMatch = order.pickupLocation?.address?.toLowerCase().includes(query);
        const dropoffMatch = order.dropoffLocation?.address?.toLowerCase().includes(query);
        const merchantMatch = order.merchantName?.toLowerCase().includes(query);
        const driverMatch = order.driverName?.toLowerCase().includes(query);
        const itemsMatch = order.items?.some(i => i.name.toLowerCase().includes(query));

        if (!idMatch && !titleMatch && !pickupMatch && !dropoffMatch && !merchantMatch && !driverMatch && !itemsMatch) {
          return false;
        }
      }

      return true;
    });
  }, [orders, statusFilter, serviceFilter, searchQuery]);

  const getServiceIcon = (type: string) => {
    switch (type) {
      case "ojek":
      case "ride":
        return <Bike className="h-4 w-4 text-emerald-500" />;
      case "mobil":
      case "car":
        return <Car className="h-4 w-4 text-teal-500" />;
      case "kirim":
      case "send":
        return <Package className="h-4 w-4 text-blue-500" />;
      case "kuliner":
      case "food":
        return <UtensilsCrossed className="h-4 w-4 text-orange-500" />;
      case "titip":
        return <Users2 className="h-4 w-4 text-amber-500" />;
      default:
        return <FileText className="h-4 w-4 text-emerald-500" />;
    }
  };

  const getRoleHeaderInfo = () => {
    switch (activeRole) {
      case "driver":
        return {
          title: "Riwayat Trip & Pendapatan Mitra",
          subtitle: "Catatan riwayat order selesai & 100% pendapatan tunai bersih",
          statLabel: "Total Pendapatan Selesai",
          icon: Bike,
          badgeColor: "amber",
        };
      case "merchant":
        return {
          title: "Riwayat Penjualan & Omset Toko",
          subtitle: "Rekap transaksi pesanan makanan & penjualan UMKM lokal",
          statLabel: "Total Omset Penjualan",
          icon: Store,
          badgeColor: "orange",
        };
      case "government":
        return {
          title: "Riwayat Layanan Berkas & Bansos",
          subtitle: "Log audit pengantaran dokumen kependudukan & kupon bansos",
          statLabel: "Total Berkas Dilayani",
          icon: Landmark,
          badgeColor: "teal",
        };
      case "industry":
        return {
          title: "Riwayat Pengantaran Kargo & B2B",
          subtitle: "Rekap pengiriman logistik, spesimen lab medis, dan shuttle",
          statLabel: "Total Nilai Logistik",
          icon: Building2,
          badgeColor: "blue",
        };
      default:
        return {
          title: "Riwayat Pesanan & Aktivitas Warga",
          subtitle: "Daftar pesanan ojek, kuliner, belanja mart & layanan dinas",
          statLabel: "Total Pengeluaran",
          icon: History,
          badgeColor: "emerald",
        };
    }
  };

  const headerInfo = getRoleHeaderInfo();

  return (
    <>
      <BottomSheet 
        isOpen={isOpen} 
        onClose={onClose} 
        className="max-w-lg mx-auto max-h-[92vh] overflow-y-auto bg-slate-50 dark:bg-[#080d1a] border-slate-200 dark:border-white/[0.08]"
      >
        <div className="space-y-4 pb-8">
          {/* Top Modal Header */}
          <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.06] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <headerInfo.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white sg-editorial-title">
                    {headerInfo.title}
                  </h2>
                  <Badge variant={headerInfo.badgeColor as any} size="sm">
                    {activeRole.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                  {headerInfo.subtitle}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-200/60 dark:hover:bg-white/[0.08] text-slate-400 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Quick Stats Metric Cards */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-3.5 sg-bento-card text-center">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Total Riwayat</span>
              <span className="text-base font-black text-slate-900 dark:text-white mt-0.5 block">
                {stats.totalOrders}
              </span>
              <span className="text-[9px] text-slate-500 dark:text-zinc-400">Transaksi</span>
            </div>

            <div className="p-3.5 sg-bento-card text-center">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Selesai</span>
              <span className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                {stats.completedOrders}
              </span>
              <span className="text-[9px] text-slate-500 dark:text-zinc-400">Sukses</span>
            </div>

            <div className="p-3.5 sg-bento-card text-center">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase block truncate">
                {activeRole === "driver" || activeRole === "merchant" ? "Total Omset" : "Total Nilai"}
              </span>
              <span className="text-xs font-black text-amber-600 dark:text-amber-400 mt-1 block truncate">
                Rp {stats.totalVolumeRp.toLocaleString("id-ID")}
              </span>
              <span className="text-[9px] text-slate-500 dark:text-zinc-400">100% Tercatat</span>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari ID pesanan, alamat jemput/tujuan, menu..."
              className="w-full h-11 pl-9 pr-3.5 sg-input text-xs"
            />
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                statusFilter === "all"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                  : "bg-white dark:bg-white/[0.04] text-slate-600 dark:text-zinc-400 border border-slate-200/80 dark:border-white/[0.06]"
              }`}
            >
              Semua ({orders.length})
            </button>

            <button
              onClick={() => setStatusFilter("completed")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === "completed"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-white dark:bg-white/[0.04] text-slate-600 dark:text-zinc-400 border border-slate-200/80 dark:border-white/[0.06]"
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Selesai ({stats.completedOrders})
            </button>

            <button
              onClick={() => setStatusFilter("active")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === "active"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "bg-white dark:bg-white/[0.04] text-slate-600 dark:text-zinc-400 border border-slate-200/80 dark:border-white/[0.06]"
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              Dalam Proses ({stats.activeOrders})
            </button>

            <button
              onClick={() => setStatusFilter("cancelled")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === "cancelled"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "bg-white dark:bg-white/[0.04] text-slate-600 dark:text-zinc-400 border border-slate-200/80 dark:border-white/[0.06]"
              }`}
            >
              <XCircle className="h-3.5 w-3.5" />
              Dibatalkan ({stats.cancelledOrders})
            </button>
          </div>

          {/* Orders Feed List */}
          <div className="space-y-2.5 pt-1">
            {loading ? (
              <div className="p-8 text-center bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/80 dark:border-white/[0.06] space-y-2 shadow-sm">
                <Loader2 className="h-7 w-7 animate-spin text-emerald-500 mx-auto" />
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Memuat riwayat transaksi...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/80 dark:border-white/[0.06] space-y-2 shadow-sm">
                <History className="h-8 w-8 text-slate-300 dark:text-zinc-600 mx-auto mb-1" />
                <p className="text-xs font-bold text-slate-800 dark:text-zinc-200">Tidak Ada Riwayat Ditemukan</p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 max-w-xs mx-auto">
                  {searchQuery ? "Tidak ada transaksi yang cocok dengan kata kunci pencarian Anda." : "Belum ada catatan aktivitas untuk filter ini."}
                </p>
              </div>
            ) : (
              filteredOrders.map((order) => {
                const dateObj = order.createdAt?.toDate 
                  ? order.createdAt.toDate() 
                  : order.createdAt?.seconds 
                    ? new Date(order.createdAt.seconds * 1000)
                    : order.createdAt instanceof Date 
                      ? order.createdAt 
                      : new Date();

                const timeStr = dateObj.toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit"
                });

                return (
                  <motion.div
                    key={order.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedOrder(order)}
                    className="p-3.5 sg-bento-card hover:border-emerald-500/40 transition-all cursor-pointer space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.05]">
                          {getServiceIcon(order.serviceType)}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
                            {(order as any).serviceTitle || order.serviceType}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            #{order.id?.slice(0, 8).toUpperCase()} • {timeStr}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <Badge 
                          variant={
                            order.status === "completed" ? "emerald" :
                            order.status === "cancelled" ? "rose" :
                            order.status === "in_progress" ? "blue" : "amber"
                          }
                          size="sm"
                        >
                          {order.status === "completed" ? "Selesai" : order.status === "cancelled" ? "Batal" : order.status}
                        </Badge>
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block mt-0.5">
                          Rp {Number(order.price || 0).toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>

                    {/* Route Preview */}
                    <div className="text-[11px] text-slate-600 dark:text-zinc-300 space-y-0.5 pt-1 border-t border-slate-100 dark:border-white/[0.04]">
                      <p className="truncate text-slate-500 dark:text-zinc-400">
                        🟢 <span className="text-slate-800 dark:text-zinc-200">{order.pickupLocation?.address || "Titik Jemput"}</span>
                      </p>
                      <p className="truncate text-slate-500 dark:text-zinc-400">
                        🔴 <span className="text-slate-800 dark:text-zinc-200">{order.dropoffLocation?.address || "Titik Antar"}</span>
                      </p>
                    </div>

                    {/* Menu items count or partner info */}
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                      <span>
                        {order.items && order.items.length > 0 
                          ? `${order.items.length} item pesanan`
                          : order.driverName 
                            ? `Driver: ${order.driverName}` 
                            : order.merchantName 
                              ? `Warung: ${order.merchantName}`
                              : "Transportasi Langsung"}
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                        Lihat E-Struk <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </BottomSheet>

      {/* Detail E-Struk Modal */}
      <HistoryDetailReceiptModal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
        currentRole={activeRole}
      />
    </>
  );
}
