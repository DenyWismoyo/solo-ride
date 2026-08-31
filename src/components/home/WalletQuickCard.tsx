"use client";

import React from "react";
import { motion } from "motion/react";
import { useAuthContext } from "@/components/AuthProvider";
import { 
  Wallet, 
  Coins, 
  PlusCircle, 
  QrCode, 
  Gift, 
  ArrowUpRight,
  Sparkles
} from "lucide-react";

interface WalletQuickCardProps {
  onOpenRewards: () => void;
}

export function WalletQuickCard({ onOpenRewards }: WalletQuickCardProps) {
  const { user, userData } = useAuthContext();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="p-4 rounded-[1.6rem] bg-white/95 dark:bg-[#0c1220]/95 border border-slate-200/80 dark:border-white/[0.08] shadow-[0_8px_30px_-4px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_36px_-6px_rgba(0,0,0,0.6)] backdrop-blur-2xl transition-colors relative overflow-hidden group"
    >
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-white/[0.06]">
        {/* Saldo Dompet Warga */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 block uppercase tracking-wider">
              Dompet Warga Solo
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Rp 25.000
              </span>
              <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded-full">
                Koperasi
              </span>
            </div>
          </div>
        </div>

        {/* Poin Stamp UMKM */}
        <motion.button
          onClick={onOpenRewards}
          whileTap={{ scale: 0.94 }}
          className="flex items-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 px-3 py-1.5 rounded-2xl transition-all text-left cursor-pointer"
        >
          <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Coins className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[9px] font-bold text-amber-600 dark:text-amber-300 block uppercase">Poin Stamp</span>
            <span className="text-xs font-black text-slate-900 dark:text-white">{userData?.points || 120} Poin</span>
          </div>
        </motion.button>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-4 gap-2 pt-3">
        <motion.button
          whileTap={{ scale: 0.91 }}
          onClick={() => alert("Fitur Isi Saldo Dompet Koperasi via Bank Jateng / QRIS.")}
          className="flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.06] border border-slate-100 dark:border-white/[0.04] transition-colors group cursor-pointer"
        >
          <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-1 group-hover:scale-110 transition-transform">
            <PlusCircle className="h-4 w-4" />
          </div>
          <span className="text-[10px] font-bold text-slate-700 dark:text-zinc-300">Isi Saldo</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.91 }}
          onClick={() => alert("Fitur Scan QRIS Standar Koperasi Lokal.")}
          className="flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.06] border border-slate-100 dark:border-white/[0.04] transition-colors group cursor-pointer"
        >
          <div className="p-1.5 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-1 group-hover:scale-110 transition-transform">
            <QrCode className="h-4 w-4" />
          </div>
          <span className="text-[10px] font-bold text-slate-700 dark:text-zinc-300">Bayar QRIS</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.91 }}
          onClick={onOpenRewards}
          className="flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.06] border border-slate-100 dark:border-white/[0.04] transition-colors group cursor-pointer"
        >
          <div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-1 group-hover:scale-110 transition-transform">
            <Gift className="h-4 w-4" />
          </div>
          <span className="text-[10px] font-bold text-slate-700 dark:text-zinc-300">Kupon UMKM</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.91 }}
          onClick={() => alert("Fitur Transfer Sesama Warga Bebas Biaya Admin.")}
          className="flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.06] border border-slate-100 dark:border-white/[0.04] transition-colors group cursor-pointer"
        >
          <div className="p-1.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-1 group-hover:scale-110 transition-transform">
            <ArrowUpRight className="h-4 w-4" />
          </div>
          <span className="text-[10px] font-bold text-slate-700 dark:text-zinc-300">Transfer</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
