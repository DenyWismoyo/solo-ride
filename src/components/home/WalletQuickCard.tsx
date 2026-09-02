"use client";

import React from "react";
import { motion } from "motion/react";
import { useAuthContext } from "@/components/AuthProvider";
import { 
  SoloWalletIcon, 
  SoloCoinStampIcon, 
  SoloTopupIcon, 
  SoloQrisIcon, 
  SoloTransferIcon,
  SoloMarketIcon
} from "@/components/icons";

interface WalletQuickCardProps {
  onOpenRewards: () => void;
}

export function WalletQuickCard({ onOpenRewards }: WalletQuickCardProps) {
  const { user, userData } = useAuthContext();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 350, damping: 26 }}
      className="sg-bento-card p-4.5 transition-all relative overflow-hidden group"
    >
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100/90 dark:border-white/[0.05] relative z-10">
        {/* Saldo Dompet Warga */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-[1.2rem] bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 text-white flex items-center justify-center shadow-[0_8px_20px_-4px_rgba(16,185,129,0.35)] shrink-0">
            <SoloWalletIcon size={24} className="text-white" variant="duotone" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                Dompet Warga Solo
              </span>
              <span className="text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded-full">
                Koperasi
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Rp 25.000
              </span>
            </div>
          </div>
        </div>

        {/* Poin Stamp UMKM */}
        <motion.button
          onClick={onOpenRewards}
          whileTap={{ scale: 0.92 }}
          whileHover={{ y: -1 }}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-500/15 to-orange-500/10 hover:from-amber-500/25 hover:to-orange-500/20 px-3.5 py-2 rounded-[1.2rem] transition-all text-left cursor-pointer shadow-xs relative overflow-hidden"
        >
          <div className="w-7 h-7 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
            <SoloCoinStampIcon size={16} className="text-white" variant="duotone" />
          </div>
          <div>
            <span className="text-[9px] font-bold text-amber-700 dark:text-amber-300 block uppercase">Poin Stamp</span>
            <span className="text-xs font-black text-slate-900 dark:text-white">{userData?.points || 120} Poin</span>
          </div>
        </motion.button>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-4 gap-2 pt-3.5 relative z-10">
        <motion.button
          whileTap={{ scale: 0.90 }}
          whileHover={{ y: -2 }}
          onClick={() => alert("Fitur Isi Saldo Dompet Koperasi via Bank Jateng / QRIS.")}
          className="flex flex-col items-center justify-center p-2 rounded-xl bg-transparent hover:bg-slate-100/70 dark:hover:bg-white/[0.04] transition-all group cursor-pointer"
        >
          <div className="p-2.5 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mb-1.5 group-hover:scale-110 transition-transform shadow-xs">
            <SoloTopupIcon size={20} variant="duotone" />
          </div>
          <span className="text-[10px] font-extrabold text-slate-700 dark:text-zinc-200">Isi Saldo</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.90 }}
          whileHover={{ y: -2 }}
          onClick={() => alert("Fitur Scan QRIS Standar Koperasi Lokal.")}
          className="flex flex-col items-center justify-center p-2 rounded-xl bg-transparent hover:bg-slate-100/70 dark:hover:bg-white/[0.04] transition-all group cursor-pointer"
        >
          <div className="p-2.5 rounded-2xl bg-teal-500/15 text-teal-600 dark:text-teal-400 mb-1.5 group-hover:scale-110 transition-transform shadow-xs">
            <SoloQrisIcon size={20} variant="duotone" />
          </div>
          <span className="text-[10px] font-extrabold text-slate-700 dark:text-zinc-200">Bayar QRIS</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.90 }}
          whileHover={{ y: -2 }}
          onClick={onOpenRewards}
          className="flex flex-col items-center justify-center p-2 rounded-xl bg-transparent hover:bg-slate-100/70 dark:hover:bg-white/[0.04] transition-all group cursor-pointer"
        >
          <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 mb-1.5 group-hover:scale-110 transition-transform shadow-xs">
            <SoloMarketIcon size={20} variant="duotone" />
          </div>
          <span className="text-[10px] font-extrabold text-slate-700 dark:text-zinc-200">Kupon UMKM</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.90 }}
          whileHover={{ y: -2 }}
          onClick={() => alert("Fitur Transfer Sesama Warga Bebas Biaya Admin.")}
          className="flex flex-col items-center justify-center p-2 rounded-xl bg-transparent hover:bg-slate-100/70 dark:hover:bg-white/[0.04] transition-all group cursor-pointer"
        >
          <div className="p-2.5 rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400 mb-1.5 group-hover:scale-110 transition-transform shadow-xs">
            <SoloTransferIcon size={20} variant="duotone" />
          </div>
          <span className="text-[10px] font-extrabold text-slate-700 dark:text-zinc-200">Transfer</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
