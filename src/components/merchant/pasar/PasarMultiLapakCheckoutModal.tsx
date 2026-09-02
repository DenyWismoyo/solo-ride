"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShoppingBag, 
  Store, 
  MapPin, 
  Clock, 
  Scale, 
  CheckCircle2, 
  X, 
  Coins, 
  ShieldCheck, 
  CreditCard, 
  Banknote, 
  Sparkles,
  ArrowRight,
  Loader2
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CartItemDetail {
  id: string;
  name: string;
  price: number;
  qty: number;
  unit: string;
  kiosName: string;
  note?: string;
  customOption?: string;
}

interface PasarMultiLapakCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  marketName: string;
  marketDistrict: string;
  groupedCartByKios: Record<string, CartItemDetail[]>;
  deliverySlot: "instant" | "subuh";
  deliveryFee: number;
  onConfirmOrder: (paymentMethod: "cash" | "qris") => Promise<void>;
  isSubmitting: boolean;
}

export function PasarMultiLapakCheckoutModal({
  isOpen,
  onClose,
  marketName,
  marketDistrict,
  groupedCartByKios,
  deliverySlot,
  deliveryFee,
  onConfirmOrder,
  isSubmitting
}: PasarMultiLapakCheckoutModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "qris">("cash");

  if (!isOpen) return null;

  const totalKiosCount = Object.keys(groupedCartByKios).length;
  
  const subtotal = Object.values(groupedCartByKios)
    .flat()
    .reduce((sum, item) => sum + item.price * item.qty, 0);

  const total = subtotal + deliveryFee;
  const earnedCoins = Math.floor(subtotal / 2000);

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="sg-bento-card max-w-lg w-full max-h-[92vh] flex flex-col rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border-rose-500/20 bg-white dark:bg-[#0c1220]"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-white/[0.06] flex items-center justify-between bg-gradient-to-r from-rose-500/15 via-orange-500/10 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-600 dark:text-rose-400">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Rincian Belanja Multi-Lapak
                </h3>
                <Badge variant="rose" size="sm">1 Kurir Flat</Badge>
              </div>
              <p className="text-[11px] text-slate-500">
                {marketName} ({totalKiosCount} Los / Pedagang)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="sg-icon-btn h-8 w-8 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Order Details */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* Market & Courier Pickup Sequence Banner */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.05] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Store className="h-3.5 w-3.5 text-rose-500" />
                Rute Pengambilan Kurir di {marketName}:
              </span>
              <span className="text-[10px] text-rose-600 dark:text-rose-400 font-black">
                {totalKiosCount} Titik Los
              </span>
            </div>

            {/* Stops Timeline */}
            <div className="space-y-1.5 pl-2 border-l-2 border-rose-500/30 ml-2 py-0.5">
              {Object.keys(groupedCartByKios).map((kiosName, idx) => (
                <div key={kiosName} className="text-[11px] flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center -ml-[13px]">
                    {idx + 1}
                  </span>
                  <span className="font-bold text-slate-800 dark:text-zinc-200">{kiosName}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Grouped Products Breakdown */}
          <div className="space-y-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block px-1">
              Daftar Komoditas per Lapak:
            </span>

            {Object.entries(groupedCartByKios).map(([kiosName, items]) => (
              <div
                key={kiosName}
                className="p-3.5 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] shadow-xs space-y-2.5"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.04] pb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">🏪</span>
                    <strong className="text-xs text-slate-900 dark:text-white">{kiosName}</strong>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold">{items.length} Barang</span>
                </div>

                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between items-start text-xs">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-800 dark:text-zinc-200">{item.name}</span>
                          <span className="text-[10px] text-slate-400">x{item.qty} {item.unit}</span>
                        </div>
                        {item.customOption && (
                          <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                            ✨ Kustomisasi: {item.customOption}
                          </p>
                        )}
                        {item.note && (
                          <p className="text-[10px] text-slate-400 italic">
                            Catatan: "{item.note}"
                          </p>
                        )}
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formatRupiah(item.price * item.qty)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Delivery Slot & Address */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.05] space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Waktu Pengantaran:</span>
              <strong className="text-rose-600 dark:text-rose-400">
                {deliverySlot === "subuh" ? "🌅 Pengantaran Subuh (05.30 - 08.00 WIB)" : "⚡ Langsung Diantar (Instant)"}
              </strong>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Jaminan Timbangan:</span>
              <strong className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Scale className="h-3 w-3" /> E-Tera Disdag Surakarta
              </strong>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block px-1">
              Metode Pembayaran:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("cash")}
                className={`p-3 rounded-2xl border text-left cursor-pointer transition-all flex items-center gap-2.5 ${
                  paymentMethod === "cash"
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold"
                    : "border-slate-200 dark:border-white/10 text-slate-600 dark:text-zinc-400"
                }`}
              >
                <Banknote className="h-4 w-4 shrink-0" />
                <div>
                  <div className="text-xs font-black">Tunai ke Kurir</div>
                  <div className="text-[9px] opacity-80">Bayar saat barang tiba</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("qris")}
                className={`p-3 rounded-2xl border text-left cursor-pointer transition-all flex items-center gap-2.5 ${
                  paymentMethod === "qris"
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold"
                    : "border-slate-200 dark:border-white/10 text-slate-600 dark:text-zinc-400"
                }`}
              >
                <CreditCard className="h-4 w-4 shrink-0" />
                <div>
                  <div className="text-xs font-black">QRIS Koperasi</div>
                  <div className="text-[9px] opacity-80">Scan instan bebas biaya</div>
                </div>
              </button>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-500/10 to-orange-500/5 border border-rose-500/20 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-zinc-300">
              <span>Subtotal Produk Pasar:</span>
              <span className="font-bold">{formatRupiah(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-zinc-300">
              <span>Ongkir Flat 1 Kurir ({totalKiosCount} Los):</span>
              <span className="font-bold text-emerald-600">{formatRupiah(deliveryFee)}</span>
            </div>
            <div className="flex justify-between text-amber-600 dark:text-amber-400 text-[11px] pt-1 border-t border-rose-500/20">
              <span className="flex items-center gap-1">
                <Coins className="h-3 w-3" /> Reward Koin Pasar:
              </span>
              <span className="font-bold">+{earnedCoins} Koin</span>
            </div>
            <div className="flex justify-between items-baseline pt-2 border-t border-rose-500/30 text-sm">
              <span className="font-black text-slate-900 dark:text-white">Total Tagihan:</span>
              <span className="text-base font-black text-rose-600 dark:text-rose-400">
                {formatRupiah(total)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Confirm Button */}
        <div className="p-4 border-t border-slate-100 dark:border-white/[0.06]">
          <Button
            onClick={() => onConfirmOrder(paymentMethod)}
            disabled={isSubmitting}
            className="w-full h-12 text-xs font-black rounded-2xl bg-rose-600 hover:bg-rose-500 text-white cursor-pointer shadow-lg gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Menerbitkan Pesanan Pasar...</span>
              </>
            ) : (
              <>
                <span>Pesan Sekarang ({formatRupiah(total)})</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
