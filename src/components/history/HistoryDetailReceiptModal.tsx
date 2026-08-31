"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrderDocument } from "@/types/order.types";
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Store, 
  Bike, 
  Car, 
  Package, 
  UtensilsCrossed, 
  Users2, 
  Copy, 
  Check, 
  Share2, 
  ExternalLink, 
  ShieldCheck, 
  FileText, 
  Coins, 
  CreditCard, 
  X,
  Phone,
  User,
  ArrowRight,
  RotateCcw
} from "lucide-react";

interface HistoryDetailReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderDocument | null;
  currentRole?: string;
}

export function HistoryDetailReceiptModal({
  isOpen,
  onClose,
  order,
  currentRole = "customer",
}: HistoryDetailReceiptModalProps) {
  const router = useRouter();
  const [isCopied, setIsCopied] = useState(false);

  if (!order) return null;

  const dateObj = order.createdAt?.toDate 
    ? order.createdAt.toDate() 
    : order.createdAt?.seconds 
      ? new Date(order.createdAt.seconds * 1000)
      : order.createdAt instanceof Date 
        ? order.createdAt 
        : new Date();

  const formattedDate = dateObj.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const getServiceIcon = (type: string) => {
    switch (type) {
      case "ojek":
      case "ride":
        return <Bike className="h-5 w-5 text-emerald-500" />;
      case "mobil":
      case "car":
        return <Car className="h-5 w-5 text-teal-500" />;
      case "kirim":
      case "send":
        return <Package className="h-5 w-5 text-blue-500" />;
      case "kuliner":
      case "food":
        return <UtensilsCrossed className="h-5 w-5 text-orange-500" />;
      case "titip":
        return <Users2 className="h-5 w-5 text-amber-500" />;
      default:
        return <FileText className="h-5 w-5 text-emerald-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="emerald" size="sm">Selesai Berhasil</Badge>;
      case "cancelled":
        return <Badge variant="rose" size="sm">Dibatalkan</Badge>;
      case "in_progress":
        return <Badge variant="blue" size="sm">Sedang Diantar</Badge>;
      case "accepted":
        return <Badge variant="amber" size="sm">Driver Menuju Lokasi</Badge>;
      case "cooking":
        return <Badge variant="orange" size="sm">Warung Memasak</Badge>;
      case "ready_for_pickup":
        return <Badge variant="emerald" size="sm">Siap Diambil</Badge>;
      case "pending":
        return <Badge variant="amber" size="sm">Mencari Driver</Badge>;
      default:
        return <Badge variant="outline" size="sm">{status}</Badge>;
    }
  };

  const handleCopyReceipt = () => {
    const summaryText = `
*BUKTI TRANSAKSI RIDE-SOLO*
-----------------------------
No. Order: #${order.id?.slice(0, 8).toUpperCase()}
Layanan: ${(order as any).serviceTitle || order.serviceType?.toUpperCase()}
Waktu: ${formattedDate}
Status: ${order.status?.toUpperCase()}

Titik Jemput: ${order.pickupLocation?.address}
Titik Antar: ${order.dropoffLocation?.address}

Total Biaya: Rp ${Number(order.price || 0).toLocaleString("id-ID")}
Metode: ${order.paymentMethod ? order.paymentMethod.toUpperCase() : "TUNAI"}
${order.driverName ? `Mitra Driver: ${order.driverName}` : ""}
${order.merchantName ? `Warung UMKM: ${order.merchantName}` : ""}
-----------------------------
Ekosistem Transportasi & UMKM Lokal Surakarta
Tanpa Potongan Komisi 100% Warga
    `.trim();

    navigator.clipboard.writeText(summaryText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleReorder = () => {
    onClose();
    if (order.serviceType === "kuliner" || order.serviceType === "food") {
      router.push("/services/food");
    } else if (order.serviceType === "mobil" || order.serviceType === "car") {
      router.push("/services/car");
    } else if (order.serviceType === "kirim" || order.serviceType === "send") {
      router.push("/services/send");
    } else if (order.serviceType === "titip") {
      router.push("/services/titip");
    } else {
      router.push("/services/ride");
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} className="max-w-md mx-auto max-h-[90vh] overflow-y-auto bg-slate-50 dark:bg-[#090d16] border-slate-200 dark:border-white/[0.08]">
      <div className="space-y-4 pb-6">
        {/* Header E-Receipt */}
        <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.06] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-200/60 dark:bg-white/[0.05]">
              {getServiceIcon(order.serviceType)}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {(order as any).serviceTitle || order.serviceType?.toUpperCase()}
                </h3>
                {getStatusBadge(order.status)}
              </div>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono mt-0.5">
                ID: #{order.id?.slice(0, 10).toUpperCase()} • {formattedDate}
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

        {/* Receipt Digital Paper Card */}
        <div className="p-4 bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-sm space-y-4 relative overflow-hidden">
          {/* Top Zig-zag / Badge Pill */}
          <div className="flex items-center justify-between bg-emerald-500/10 dark:bg-emerald-500/15 p-2.5 rounded-2xl border border-emerald-500/20">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                E-Struk Resmi Ride-Solo Surakarta
              </span>
            </div>
            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-md uppercase">
              {order.paymentMethod || "Tunai"}
            </span>
          </div>

          {/* Rute Perjalanan / Alamat */}
          <div className="space-y-3 p-3 bg-slate-50 dark:bg-white/[0.02] rounded-2xl border border-slate-100 dark:border-white/[0.04]">
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 p-1 rounded-full bg-emerald-500/20 text-emerald-600 shrink-0">
                <MapPin className="h-3 w-3" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Titik Penjemputan / Asal</span>
                <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200 leading-snug">
                  {order.pickupLocation?.address || "Lokasi Penjemputan"}
                </p>
              </div>
            </div>

            <div className="w-0.5 h-3 bg-slate-200 dark:bg-zinc-700 ml-2.5" />

            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 p-1 rounded-full bg-rose-500/20 text-rose-600 shrink-0">
                <MapPin className="h-3 w-3" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Titik Pengantaran / Tujuan</span>
                <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200 leading-snug">
                  {order.dropoffLocation?.address || "Lokasi Tujuan"}
                </p>
              </div>
            </div>
          </div>

          {/* Rincian Menu / Barang (Jika Ada) */}
          {order.items && order.items.length > 0 && (
            <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-white/[0.04]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Daftar Menu / Pesanan</span>
              <div className="space-y-1.5">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <span className="text-slate-700 dark:text-zinc-300 font-medium">
                      {item.qty}x {item.name}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      Rp {(item.price * item.qty).toLocaleString("id-ID")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Partner & Driver Info */}
          {(order.driverName || order.merchantName || order.agencyName) && (
            <div className="p-3 bg-slate-50 dark:bg-white/[0.02] rounded-2xl border border-slate-100 dark:border-white/[0.04] space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pihak Terlibat</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {order.driverName && (
                  <div>
                    <span className="text-[10px] text-slate-400 block">Mitra Driver:</span>
                    <span className="font-bold text-slate-800 dark:text-zinc-200">{order.driverName}</span>
                    {order.driverPhone && <span className="text-[10px] text-slate-500 block">{order.driverPhone}</span>}
                  </div>
                )}
                {order.merchantName && (
                  <div>
                    <span className="text-[10px] text-slate-400 block">Warung UMKM:</span>
                    <span className="font-bold text-slate-800 dark:text-zinc-200">{order.merchantName}</span>
                  </div>
                )}
                {order.agencyName && (
                  <div>
                    <span className="text-[10px] text-slate-400 block">Instansi Dinas:</span>
                    <span className="font-bold text-teal-600 dark:text-teal-400">{order.agencyName}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Rincian Finansial & Ongkir */}
          <div className="space-y-1.5 pt-2 border-t border-dashed border-slate-200 dark:border-zinc-700">
            <div className="flex justify-between items-center text-xs text-slate-500 dark:text-zinc-400">
              <span>Tarif Ongkir / Layanan</span>
              <span>Rp {Number(order.price || 0).toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500 dark:text-zinc-400">
              <span>Potongan Komisi Aplikasi</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Rp 0 (Bebas Komisi)</span>
            </div>
            <div className="flex justify-between items-center text-sm font-black text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-white/[0.06]">
              <span>Total Pembayaran</span>
              <span className="text-base text-emerald-600 dark:text-emerald-400">
                Rp {Number(order.price || 0).toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-1">
          <Button
            variant="outline"
            onClick={handleCopyReceipt}
            className="flex-1 h-11 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {isCopied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            <span>{isCopied ? "Tersalin!" : "Salin E-Struk"}</span>
          </Button>

          {order.status !== "completed" && order.status !== "cancelled" ? (
            <Button
              onClick={() => {
                onClose();
                router.push(`/order/${order.id}`);
              }}
              className="flex-1 h-11 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Buka Tracking</span>
            </Button>
          ) : currentRole === "customer" ? (
            <Button
              onClick={handleReorder}
              className="flex-1 h-11 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Pesan Lagi</span>
            </Button>
          ) : null}
        </div>
      </div>
    </BottomSheet>
  );
}
