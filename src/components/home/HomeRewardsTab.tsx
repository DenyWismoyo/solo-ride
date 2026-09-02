"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { Sparkles, Gift, Store, Coins, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface HomeRewardsTabProps {
  userPoints: number;
}

export function HomeRewardsTab({ userPoints }: HomeRewardsTabProps) {
  const [claimedReward, setClaimedReward] = useState<string | null>(null);

  const rewards = [
    { id: "r1", title: "Diskon Rp 5.000 Selat Solo Tenda", cost: 50, merchant: "Selat Solo Mbak Lies", icon: "🍲" },
    { id: "r2", title: "Gratis Es Dawet Telasih Pasar Gede", cost: 30, merchant: "Dawet Telasih Bu Dermi", icon: "🍧" },
    { id: "r3", title: "Voucher Belanja Rp 10.000 Sembako", cost: 100, merchant: "Pasar Legi Surakarta", icon: "🌾" },
  ];

  const handleClaimReward = (id: string, cost: number) => {
    if (userPoints < cost) {
      alert("Poin Stamp Anda belum mencukupi untuk menukar reward ini.");
      return;
    }
    setClaimedReward(id);
    alert("Voucher berhasil ditukar! Tunjukkan kode voucher di warung mitra.");
  };

  return (
    <motion.main
      key="rewards"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="pt-20 px-4 max-w-lg w-full mx-auto flex-1 space-y-4 relative z-10 pb-24"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Poin & Loyalitas Warga
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">Tukar poin transaksi di ratusan warung mitra Solo</p>
        </div>
      </div>

      {/* Points Balance Bento Card */}
      <div className="p-6 rounded-[2rem] bg-gradient-to-tr from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/30 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl shrink-0">
              🪙
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                TOTAL POIN ANDA
              </span>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {userPoints.toLocaleString("id-ID")} <span className="text-xs text-amber-500">Poin</span>
              </div>
            </div>
          </div>

          <Badge variant="amber" size="sm" className="font-bold">
            Aktif
          </Badge>
        </div>

        <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
          Setiap transaksi ojek, kuliner, dan kurir menghasilkan stamp poin yang dapat ditukar dengan voucher belanja di warung UMKM lokal Surakarta.
        </p>
      </div>

      {/* Reward Catalog */}
      <div className="space-y-3 pt-2">
        <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
          <Gift className="h-4 w-4 text-amber-500" />
          <span>Katalog Voucher Diskon UMKM</span>
        </h3>

        <div className="space-y-2.5">
          {rewards.map((reward) => (
            <div
              key={reward.id}
              className="sg-bento-card p-4 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-white/[0.04] flex items-center justify-center text-xl shrink-0">
                  {reward.icon}
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {reward.title}
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    Mitra: <strong className="text-slate-700 dark:text-zinc-300">{reward.merchant}</strong>
                  </p>
                </div>
              </div>

              <Button
                size="sm"
                onClick={() => handleClaimReward(reward.id, reward.cost)}
                disabled={claimedReward === reward.id || userPoints < reward.cost}
                className="h-9 rounded-xl text-[11px] font-bold bg-amber-600 hover:bg-amber-500 text-white shrink-0 cursor-pointer"
              >
                {claimedReward === reward.id ? "Ditukar" : `${reward.cost} Poin`}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </motion.main>
  );
}
