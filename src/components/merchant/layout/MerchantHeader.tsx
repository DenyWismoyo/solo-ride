"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMerchantContext } from "./MerchantContext";
import { useAuthContext } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Store, 
  Power, 
  ExternalLink, 
  Volume2, 
  User, 
  Sparkles,
  ArrowLeft
} from "lucide-react";
import { SoloAppLogoIcon } from "@/components/icons";

export function MerchantHeader() {
  const router = useRouter();
  const { user, userData } = useAuthContext();
  const { 
    merchant, 
    isStoreOpen, 
    toggleStoreStatus, 
    pendingOrdersCount 
  } = useMerchantContext();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/85 dark:bg-[#0c1220]/85 backdrop-blur-2xl border-b border-slate-200/80 dark:border-white/[0.06] px-4 lg:px-6 flex items-center justify-between">
      {/* Brand & Store Capsule */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2">
          <SoloAppLogoIcon size={32} />
          <div className="hidden sm:block">
            <span className="font-black text-sm text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
              <span>Ride-Solo</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold border border-orange-500/20">
                MERCHANT HUB
              </span>
            </span>
          </div>
        </Link>
      </div>

      {/* Store Quick Status & Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Instant Open / Close Store Switch */}
        <button
          onClick={toggleStoreStatus}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs border ${
            isStoreOpen
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
              : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 hover:bg-rose-500/20"
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${isStoreOpen ? "bg-emerald-500 animate-ping" : "bg-rose-500"}`} />
          <span className="hidden sm:inline">{isStoreOpen ? "Warung Buka" : "Warung Tutup"}</span>
        </button>

        {/* Audio Alert Status */}
        <div className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-slate-100 dark:bg-white/[0.04] text-[11px] font-semibold text-slate-600 dark:text-zinc-400">
          <Volume2 className="h-3.5 w-3.5 text-orange-500" />
          <span>Audio Alert Aktif</span>
        </div>

        {/* User / Merchant Profile Avatar */}
        <div className="flex items-center gap-2 p-1 pl-2 pr-3 rounded-full bg-slate-100 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.04]">
          <div className="w-7 h-7 rounded-full bg-orange-500/20 text-orange-600 dark:text-orange-400 font-bold text-xs flex items-center justify-center">
            🏪
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 hidden sm:inline max-w-[120px] truncate">
            {merchant?.name || userData?.displayName || "Mitra UMKM"}
          </span>
        </div>
      </div>
    </header>
  );
}
