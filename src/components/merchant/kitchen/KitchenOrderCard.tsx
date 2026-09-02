"use client";

import React, { useState } from "react";
import { OrderDocument } from "@/types/order.types";
import { useMerchantContext } from "../layout/MerchantContext";
import { RejectionModal } from "@/components/government/shared/RejectionModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ChefHat, 
  Clock, 
  Bike, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  UtensilsCrossed, 
  MapPin, 
  Receipt,
  MessageSquare,
  AlertCircle
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";

interface KitchenOrderCardProps {
  order: OrderDocument;
}

export function KitchenOrderCard({ order }: KitchenOrderCardProps) {
  const { updateOrderStatus } = useMerchantContext();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);

  const handleAcceptOrder = async () => {
    if (!order.id) return;
    setIsProcessing(true);
    try {
      await updateOrderStatus(order.id, "preparing");
    } catch (err: any) {
      alert(`Gagal menerima pesanan: ${err.message || err}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMarkReady = async () => {
    if (!order.id) return;
    setIsProcessing(true);
    try {
      await updateOrderStatus(order.id, "ready_for_pickup");
    } catch (err: any) {
      alert(`Gagal memperbarui status: ${err.message || err}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const items = order.items || [];
  const itemCount = items.reduce((acc, item) => acc + (item.qty || 1), 0);

  return (
    <>
      <div className="sg-bento-card p-4 sm:p-5 space-y-3.5 transition-all">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-white/[0.06] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black text-orange-600 dark:text-orange-400">
                #{order.id?.slice(0, 7).toUpperCase()}
              </span>
              <Badge 
                variant={
                  order.status === "pending_merchant" ? "rose" :
                  order.status === "preparing" ? "amber" :
                  order.status === "ready_for_pickup" || order.status === "accepted" || order.status === "in_progress" ? "blue" :
                  order.status === "completed" ? "emerald" : "outline"
                } 
                size="sm" 
                className="font-bold text-[10px]"
              >
                {order.status === "pending_merchant" ? "Pesanan Baru Masuk" :
                 order.status === "preparing" ? "Sedang Dimasak" :
                 order.status === "ready_for_pickup" ? "Siap Diambil Kurir" :
                 order.status === "accepted" ? "Kurir Merapat" :
                 order.status === "in_progress" ? "Dalam Pengantaran" :
                 order.status === "completed" ? "Selesai Diterima" :
                 order.status === "rejected" ? "Ditolak" : order.status}
              </Badge>
            </div>
            <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white mt-1">
              Pemesan: {order.customerName || "Pelanggan Solo"}
            </h4>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-semibold block">Total Menu:</span>
            <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
              {formatRupiah(order.price || 0)}
            </span>
          </div>
        </div>

        {/* Item List / Menu Breakdown */}
        <div className="space-y-2 text-xs">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04]">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-orange-500/10 text-orange-600 dark:text-orange-400 font-black text-[11px] flex items-center justify-center shrink-0">
                  {item.qty}x
                </span>
                <span className="font-bold text-slate-800 dark:text-zinc-200">{item.name}</span>
              </div>
              <span className="text-slate-500 font-mono text-[11px]">
                {formatRupiah((item.price || 0) * (item.qty || 1))}
              </span>
            </div>
          ))}

          {/* Customer Order Notes */}
          {(order as any).notes && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-300 text-[11px] flex items-start gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span><strong>Catatan Pelanggan:</strong> {(order as any).notes}</span>
            </div>
          )}
        </div>

        {/* Delivery / Address Destination */}
        {order.dropoffLocation?.address && (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-zinc-400 pt-1">
            <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0" />
            <span className="truncate">Antar ke: {order.dropoffLocation.address}</span>
          </div>
        )}

        {/* Action Buttons based on Status */}
        <div className="pt-3 border-t border-slate-100 dark:border-white/[0.04] flex items-center justify-between gap-2">
          {order.status === "pending_merchant" && (
            <>
              <Button
                type="button"
                variant="outline"
                disabled={isProcessing}
                onClick={() => setIsRejectOpen(true)}
                className="flex-1 h-10 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 border-rose-200 dark:border-rose-900 text-xs font-bold gap-1 cursor-pointer"
              >
                <XCircle className="h-4 w-4" />
                <span>Tolak</span>
              </Button>

              <Button
                type="button"
                disabled={isProcessing}
                onClick={handleAcceptOrder}
                className="flex-2 h-10 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs gap-1.5 shadow-md shadow-orange-500/20 cursor-pointer"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                ) : (
                  <ChefHat className="h-4 w-4" />
                )}
                <span>Terima & Mulai Masak</span>
              </Button>
            </>
          )}

          {order.status === "preparing" && (
            <Button
              type="button"
              disabled={isProcessing}
              onClick={handleMarkReady}
              className="w-full h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              <span>Makanan Selesai Dimasak & Siap Diambil</span>
            </Button>
          )}

          {(order.status === "ready_for_pickup" || order.status === "accepted" || order.status === "in_progress") && (
            <div className="w-full p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Bike className="h-4 w-4 text-blue-600" />
                <span>{order.status === "ready_for_pickup" ? "Menunggu Driver Merapat..." : "Driver Membawa Makanan ke Pelanggan"}</span>
              </span>
              <Badge variant="blue" size="sm">Kurir OTW</Badge>
            </div>
          )}

          {order.status === "completed" && (
            <div className="w-full p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Pesanan Berhasil Diserahkan & Lunas</span>
              </span>
              <span className="font-mono text-[11px]">{formatRupiah(order.price || 0)}</span>
            </div>
          )}

          {order.status === "rejected" && (
            <div className="w-full p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs font-bold flex items-center gap-1.5">
              <XCircle className="h-4 w-4" />
              <span>Pesanan Ditolak Warung ({(order as any).rejectionReason || "Stok Habis"})</span>
            </div>
          )}
        </div>
      </div>

      {/* Rejection Modal */}
      {isRejectOpen && (
        <RejectionModal
          isOpen={isRejectOpen}
          onClose={() => setIsRejectOpen(false)}
          orderInfo={{
            orderId: order.id,
            serviceName: `Pesanan Kuliner (${itemCount} Item)`,
            customerName: order.customerName
          }}
          onConfirm={async (reason) => {
            if (!order.id) return;
            await updateOrderStatus(order.id, "rejected", reason);
            setIsRejectOpen(false);
          }}
        />
      )}
    </>
  );
}
