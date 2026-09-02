"use client";

import React from "react";
import { Loader2, MapPin, Navigation, Store, ChefHat, Package, Bike, PhoneCall, MessageSquare, ShieldCheck, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OrderDocument } from "@/types/order.types";

interface OrderStatusLiveCardProps {
  order: OrderDocument;
  isFood: boolean;
  onCancelOrder: () => void;
  isCancelling: boolean;
  onOpenReviewModal: () => void;
  reviewSubmitted: boolean;
}

export function OrderStatusLiveCard({
  order,
  isFood,
  onCancelOrder,
  isCancelling,
  onOpenReviewModal,
  reviewSubmitted
}: OrderStatusLiveCardProps) {
  return (
    <div className="space-y-4">
      {/* 1. Status: PENDING */}
      {order.status === "pending" && (
        <div className="space-y-4">
          <div className="flex items-center space-x-3 bg-orange-500/10 border border-orange-500/20 p-3.5 rounded-2xl">
            <Loader2 className="h-6 w-6 text-orange-500 animate-spin shrink-0" />
            <div>
              <p className="text-sm font-bold text-orange-600 dark:text-orange-400">
                {isFood ? "Menunggu Konfirmasi Warung" : "Mencari Mitra Driver Terdekat"}
              </p>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {isFood ? "Warung sedang memeriksa pesanan & kurir terdekat bersiap merapat..." : "Menghubungkan pesanan Anda ke mitra lokal di Surakarta..."}
              </p>
            </div>
          </div>
          
          <div className="sg-bento-card p-4 space-y-3">
            <div className="flex items-start space-x-3">
              {isFood ? (
                <Store className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
              ) : (
                <MapPin className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
              )}
              <div className="text-xs">
                <span className="text-slate-500 dark:text-zinc-500 block">
                  {isFood ? "Warung Kuliner:" : "Jemput:"}
                </span>
                <span className="text-slate-800 dark:text-zinc-200 font-medium line-clamp-1">{order.pickupLocation?.address}</span>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Navigation className="h-4 w-4 text-rose-500 mt-0.5 shrink-0" />
              <div className="text-xs">
                <span className="text-slate-500 dark:text-zinc-500 block">Alamat Pengantaran:</span>
                <span className="text-slate-800 dark:text-zinc-200 font-medium line-clamp-1">{order.dropoffLocation?.address}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-white/[0.06] flex justify-between items-center text-sm">
              <span className="text-slate-500 dark:text-zinc-400">Total Tagihan ({order.paymentMethod === "cash" ? "Tunai" : "QRIS"})</span>
              <span className="font-bold text-slate-900 dark:text-white">Rp {order.price?.toLocaleString("id-ID")}</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 h-12 cursor-pointer"
            onClick={onCancelOrder}
            disabled={isCancelling}
          >
            {isCancelling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Batalkan Pesanan
          </Button>
        </div>
      )}

      {/* 2. Status: COOKING */}
      {order.status === "cooking" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-2xl">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-amber-500/20 rounded-xl text-amber-600 dark:text-amber-400 animate-pulse">
                <ChefHat className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-700 dark:text-amber-400">
                  Warung Sedang Memasak! 🍳
                </p>
                <p className="text-xs text-slate-600 dark:text-zinc-300">
                  Menu pesanan Anda sedang dimasak segar di dapur.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Status: READY FOR PICKUP */}
      {order.status === "ready_for_pickup" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-purple-500/10 border border-purple-500/30 p-3.5 rounded-2xl">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-purple-500/20 rounded-xl text-purple-600 dark:text-purple-400">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-purple-700 dark:text-purple-400">
                  Makanan Sudah Matang! ✅
                </p>
                <p className="text-xs text-slate-600 dark:text-zinc-300">
                  Siap di kasir & kurir bersiap mengambil untuk diantar.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Status: ACCEPTED / IN_PROGRESS (Driver on the way) */}
      {(order.status === "accepted" || order.status === "in_progress") && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 p-3.5 rounded-2xl">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 animate-bounce">
                <Bike className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                  {order.status === "accepted" ? "Mitra Menuju Titik Jemput" : "Sedang Dalam Perjalanan Antar"}
                </p>
                <p className="text-xs text-slate-600 dark:text-zinc-300">
                  {order.status === "accepted" ? "Mitra driver sedang bergerak ke lokasi awal" : "Pesanan Anda sedang diantar menuju alamat tujuan"}
                </p>
              </div>
            </div>
          </div>

          {/* Driver Profile Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-lg">
                🛵
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                  {order.driverName || "Mitra Driver Ride-Solo"}
                </h4>
                <p className="text-xs font-mono font-bold text-slate-500">
                  {order.driverVehiclePlate || "AD 4821 QA"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.open("tel:081234567890", "_self")}
                className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-sm hover:bg-emerald-500 cursor-pointer"
              >
                <PhoneCall className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Status: COMPLETED */}
      {order.status === "completed" && (
        <div className="space-y-4 text-center">
          <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
            <h3 className="text-base font-black text-emerald-700 dark:text-emerald-400">
              Pesanan Telah Selesai! 🎉
            </h3>
            <p className="text-xs text-slate-600 dark:text-zinc-300">
              Terima kasih telah menggunakan ekosistem lokal Ride-Solo Surakarta.
            </p>
          </div>

          {!reviewSubmitted && (
            <Button
              onClick={onOpenReviewModal}
              className="w-full h-11 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md"
            >
              ⭐ Beri Bintang & Ulasan Driver
            </Button>
          )}
        </div>
      )}

      {/* 6. Status: CANCELLED / REJECTED */}
      {(order.status === "cancelled" || order.status === "rejected") && (
        <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center space-y-2">
          <XCircle className="h-10 w-10 text-rose-500 mx-auto" />
          <h3 className="text-base font-black text-rose-600 dark:text-rose-400">
            {order.status === "rejected" ? "Permohonan Ditolak" : "Pesanan Dibatalkan"}
          </h3>
          <p className="text-xs text-slate-600 dark:text-zinc-300">
            {order.rejectionReason 
              ? `Alasan: ${order.rejectionReason}`
              : "Pesanan telah dibatalkan."}
          </p>
        </div>
      )}
    </div>
  );
}
