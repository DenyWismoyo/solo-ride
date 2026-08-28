"use client";

import React from "react";
import { useAuthContext } from "@/components/AuthProvider";
import { 
  Wallet, 
  Coins, 
  PlusCircle, 
  QrCode, 
  Gift, 
  ArrowUpRight 
} from "lucide-react";

interface WalletQuickCardProps {
  onOpenRewards: () => void;
}

export function WalletQuickCard({ onOpenRewards }: WalletQuickCardProps) {
  const { user, userData } = useAuthContext();

  return (
    <div className="sg-card p-4 rounded-3xl border border-slate-200 dark:border-zinc-800/90 shadow-sm dark:shadow-xl bg-white/90 dark:bg-gradient-to-r dark:from-zinc-900/95 dark:via-zinc-900/90 dark:to-zinc-950/95 transition-colors">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800/80">
        {/* Saldo Dompet Warga */}
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 block uppercase tracking-wider">
              Dompet Warga Solo
            </span>
            <span className="text-base font-extrabold text-slate-900 dark:text-white">
              Rp 25.000
            </span>
          </div>
        </div>

        {/* Poin Stamp UMKM */}
        <button
          onClick={onOpenRewards}
          className="flex items-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-3 py-1.5 rounded-2xl transition-all text-left group cursor-pointer"
        >
          <div className="p-1 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
            <Coins className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[9px] font-bold text-amber-600 dark:text-amber-300 block uppercase">Poin Stamp</span>
            <span className="text-xs font-black text-slate-900 dark:text-white">{userData?.points || 0} Poin</span>
          </div>
        </button>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-4 gap-1.5 pt-3">
        <button
          onClick={() => alert("Fitur Isi Saldo Dompet Koperasi via Virtual Account / Bank Solo.")}
          className="flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-100/80 dark:bg-zinc-800/40 hover:bg-slate-200 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800/60 transition-colors group cursor-pointer"
        >
          <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-1 group-hover:scale-110 transition-transform">
            <PlusCircle className="h-4 w-4" />
          </div>
          <span className="text-[10px] font-bold text-slate-700 dark:text-zinc-300">Isi Saldo</span>
        </button>

        <button
          onClick={() => alert("Fitur Scan QRIS Standar Koperasi Lokal.")}
          className="flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-100/80 dark:bg-zinc-800/40 hover:bg-slate-200 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800/60 transition-colors group cursor-pointer"
        >
          <div className="p-1.5 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-1 group-hover:scale-110 transition-transform">
            <QrCode className="h-4 w-4" />
          </div>
          <span className="text-[10px] font-bold text-slate-700 dark:text-zinc-300">Bayar QRIS</span>
        </button>

        <button
          onClick={onOpenRewards}
          className="flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-100/80 dark:bg-zinc-800/40 hover:bg-slate-200 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800/60 transition-colors group cursor-pointer"
        >
          <div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-1 group-hover:scale-110 transition-transform">
            <Gift className="h-4 w-4" />
          </div>
          <span className="text-[10px] font-bold text-slate-700 dark:text-zinc-300">Kupon UMKM</span>
        </button>

        <button
          onClick={() => alert("Fitur Transfer Sesama Warga Tanpa Biaya Admin.")}
          className="flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-100/80 dark:bg-zinc-800/40 hover:bg-slate-200 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800/60 transition-colors group cursor-pointer"
        >
          <div className="p-1.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-1 group-hover:scale-110 transition-transform">
            <ArrowUpRight className="h-4 w-4" />
          </div>
          <span className="text-[10px] font-bold text-slate-700 dark:text-zinc-300">Transfer</span>
        </button>
      </div>
    </div>
  );
}
