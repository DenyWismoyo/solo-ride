"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Zap, 
  X, 
  Sun, 
  Moon, 
  Percent, 
  Flame, 
  Clock, 
  PackageCheck, 
  Sparkles,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMerchantContext } from "@/components/merchant/layout/MerchantContext";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";
import { toast } from "@/components/ui/toast";

interface FlashSaleLauncherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FlashSaleLauncherModal({ isOpen, onClose }: FlashSaleLauncherModalProps) {
  const { merchant } = useMerchantContext();
  const [shift, setShift] = useState<"subuh" | "sore">("subuh");
  const [discountPercent, setDiscountPercent] = useState<number>(25);
  const [quotaPortions, setQuotaPortions] = useState<number>(20);
  const [targetItemName, setTargetItemName] = useState<string>("Menu Andalan Pilihan");
  const [isLaunching, setIsLaunching] = useState<boolean>(false);

  const handleLaunch = async () => {
    if (!merchant?.id) {
      toast.error("Data toko merchant tidak ditemukan.");
      return;
    }

    setIsLaunching(true);
    try {
      const now = new Date();
      const endTime = new Date(now.getTime() + (shift === "subuh" ? 2.5 : 3) * 60 * 60 * 1000);

      await updateDoc(doc(db, COLLECTIONS.MERCHANTS, merchant.id), {
        activeFlashSale: {
          shift,
          shiftTitle: shift === "subuh" ? "Flash Sale Subuh-Pagi (05.30 - 08.00)" : "Flash Sale Senja-Malam (16.30 - 19.30)",
          discountPercent,
          totalQuota: quotaPortions,
          remainingQuota: quotaPortions,
          targetItemName: targetItemName.trim() || "Menu Andalan",
          startTime: serverTimestamp(),
          endTime: endTime.toISOString(),
          isActive: true
        },
        updatedAt: serverTimestamp()
      });

      toast.success("⚡ Flash Sale Berhasil Diaktifkan!", {
        description: `Promo diskon ${discountPercent}% (${quotaPortions} porsi) kini tayang di beranda warga Solo.`
      });

      onClose();
    } catch (err: any) {
      toast.error("Gagal Mengaktifkan Flash Sale", {
        description: err.message || "Terjadi kesalahan jaringan."
      });
    } finally {
      setIsLaunching(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="w-full max-w-md bg-white dark:bg-[#0c1220] rounded-[2rem] shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-rose-500/15 border-b border-amber-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
                  <Flame className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>Peluncur Flash Sale Subuh & Sore</span>
                    <Badge variant="amber" size="sm" className="text-[9px] py-0">LIVE PROMO</Badge>
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400">Dongkrak omzet pada jam sibuk kuliner Solo</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* 1. Pilih Shift Operasional */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block">
                  1. Pilih Jam Geofence Flash Sale:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setShift("subuh")}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                      shift === "subuh"
                        ? "border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-200 font-bold shadow-xs"
                        : "border-slate-200 dark:border-white/10 text-slate-600 dark:text-zinc-400 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-black mb-0.5">
                      <Sun className="w-4 h-4 text-amber-500" />
                      <span>Shift Subuh-Pagi</span>
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-zinc-400">
                      Pukul 05.30 - 08.00 WIB
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShift("sore")}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                      shift === "sore"
                        ? "border-orange-500 bg-orange-500/10 text-orange-900 dark:text-orange-200 font-bold shadow-xs"
                        : "border-slate-200 dark:border-white/10 text-slate-600 dark:text-zinc-400 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-black mb-0.5">
                      <Moon className="w-4 h-4 text-indigo-500" />
                      <span>Shift Senja-Malam</span>
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-zinc-400">
                      Pukul 16.30 - 19.30 WIB
                    </div>
                  </button>
                </div>
              </div>

              {/* 2. Persentase Diskon */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">
                    2. Besaran Diskon Flash Sale:
                  </label>
                  <span className="text-xs font-black text-amber-600 dark:text-amber-400">
                    Potongan {discountPercent}%
                  </span>
                </div>
                <div className="flex gap-1.5">
                  {[15, 20, 25, 30, 40].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setDiscountPercent(pct)}
                      className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        discountPercent === pct
                          ? "bg-amber-500 text-white shadow-xs"
                          : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200"
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Kuota Porsi Flash Sale */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">
                    3. Batas Kuota Porsi Diskon:
                  </label>
                  <span className="text-xs font-black text-teal-600 dark:text-teal-400">
                    {quotaPortions} Porsi
                  </span>
                </div>
                <div className="flex gap-1.5">
                  {[10, 20, 30, 50].map((qty) => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => setQuotaPortions(qty)}
                      className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        quotaPortions === qty
                          ? "bg-teal-600 text-white shadow-xs"
                          : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200"
                      }`}
                    >
                      {qty} Porsi
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Nama Menu Target */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block">
                  4. Nama Menu Pilihan Promo:
                </label>
                <input
                  type="text"
                  value={targetItemName}
                  onChange={(e) => setTargetItemName(e.target.value)}
                  placeholder="Contoh: Paket Nasi Liwet Komplit + Teh Hangat"
                  className="sg-input w-full text-xs p-3 rounded-xl font-bold"
                />
              </div>

              {/* Banner Rangkuman Manfaat */}
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  Flash Sale akan otomatis tampil di banner halaman beranda customer dalam radius kecamatan warung Anda dan berakhir saat kuota porsi habis.
                </p>
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleLaunch}
                disabled={isLaunching}
                className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-black text-xs py-3 rounded-xl shadow-md cursor-pointer"
              >
                {isLaunching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                    <span>Mengaktifkan Flash Sale...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-1.5 fill-white" />
                    <span>Aktifkan Flash Sale Sekarang</span>
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
