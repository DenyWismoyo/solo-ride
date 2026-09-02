"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { MapPin, Search, Megaphone, Store, ArrowRight } from "lucide-react";
import { WalletQuickCard } from "./WalletQuickCard";
import { ServicesGrid } from "./ServicesGrid";
import { PromoBanner } from "./PromoBanner";
import { MerchantSpotlight } from "./MerchantSpotlight";
import { AppService } from "@/constants/services";
import { Merchant } from "@/types/merchant.types";
import { BroadcastDocument } from "@/types/notification.types";
import { CivicBroadcastBanner } from "@/components/civic/broadcast/CivicBroadcastBanner";

interface HomeExploreTabProps {
  broadcasts: BroadcastDocument[];
  onOpenRewards: () => void;
  onSelectService: (service: AppService) => void;
  onSelectMerchant: (merchant: Merchant) => void;
}

export function HomeExploreTab({
  broadcasts,
  onOpenRewards,
  onSelectService,
  onSelectMerchant
}: HomeExploreTabProps) {
  const router = useRouter();

  return (
    <motion.main
      key="home"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="pt-20 px-4 max-w-lg w-full mx-auto space-y-5 flex-1 relative z-10 pb-24"
    >
      {/* Location & Search Bar Pill */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 pl-1">
          <MapPin className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
          <span className="font-semibold text-slate-700 dark:text-zinc-300">Lokasi Anda:</span>
          <span className="text-slate-500 dark:text-zinc-400 truncate">Kecamatan Jebres, Surakarta</span>
        </div>

        <motion.div 
          whileTap={{ scale: 0.98 }}
          whileHover={{ y: -2 }}
          onClick={() => router.push(`/services/ride`)}
          className="flex items-center gap-3 p-3 bg-white/70 dark:bg-[#0c1220]/70 hover:bg-white/90 dark:hover:bg-[#11192e]/90 rounded-[2rem] cursor-pointer transition-all shadow-[0_8px_30px_-4px_rgba(15,23,42,0.06),inset_0_1px_1px_rgba(255,255,255,0.8)] dark:shadow-[0_14px_36px_-8px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.1)] border border-white/50 dark:border-white/10 backdrop-blur-2xl group"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-emerald-500/30 group-hover:bg-emerald-500/30 transition-all">
            <Search className="h-4 w-4 stroke-[2.5]" />
          </div>
          <span className="text-xs font-medium text-slate-500 dark:text-zinc-400 flex-1 truncate">
            Ojek, makan, atau kirim barang?
          </span>
          <span className="text-[10px] font-black bg-emerald-500 text-white px-3.5 py-2 rounded-full shadow-md shadow-emerald-500/20">
            CARI
          </span>
        </motion.div>
      </div>

      {/* Active Civic Broadcast Banner */}
      <CivicBroadcastBanner broadcasts={broadcasts} role="customer" />

      {/* Quick Wallet & Membership Card */}
      <WalletQuickCard onOpenRewards={onOpenRewards} />

      {/* Super-App Services Grid */}
      <ServicesGrid onSelectService={onSelectService} />

      {/* Pasar Murah / Sinergi Pemkot Widget */}
      <motion.div 
        whileTap={{ scale: 0.97 }}
        whileHover={{ y: -2 }}
        onClick={() => router.push("/services/pasar-murah")}
        className="bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-white/95 dark:via-emerald-950/40 dark:to-[#0c1220] rounded-[1.8rem] p-4 shadow-[0_8px_25px_-4px_rgba(16,185,129,0.1)] flex items-center justify-between cursor-pointer backdrop-blur-xl"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-emerald-500/25 to-teal-500/15 text-emerald-600 dark:text-emerald-400 shrink-0 shadow-xs">
            <Store className="h-6 w-6 stroke-[2.2]" />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              Program Pasar Murah
              <span className="text-[9px] font-black px-1.5 py-0.2 bg-emerald-500 text-white rounded-md">Pemkot</span>
            </h3>
            <p className="text-[10px] font-medium text-slate-500 dark:text-zinc-400 leading-tight">
              Sembako & bahan pokok subsidi khusus warga Solo terdaftar.
            </p>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 text-emerald-500 shrink-0 opacity-80" />
      </motion.div>

      {/* Promo & News Carousel */}
      <PromoBanner />

      {/* Local Surakarta UMKM Spotlight */}
      <MerchantSpotlight onSelectMerchant={onSelectMerchant} />
    </motion.main>
  );
}
