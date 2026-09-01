"use client";

import React from "react";
import Link from "next/link";
import { useMerchantContext, MerchantTab } from "./MerchantContext";
import { Badge } from "@/components/ui/badge";
import { 
  ChefHat, 
  UtensilsCrossed, 
  Store, 
  Ticket, 
  Wallet, 
  ExternalLink, 
  Flame, 
  Sparkles,
  Power,
  Layers,
  ChevronRight
} from "lucide-react";
import { SoloAppLogoIcon } from "@/components/icons";

export function MerchantSidebar({ className = "" }: { className?: string }) {
  const { 
    merchant, 
    activeTab, 
    setActiveTab, 
    pendingOrdersCount, 
    isStoreOpen, 
    toggleStoreStatus 
  } = useMerchantContext();

  const navItems: {
    id: MerchantTab;
    label: string;
    icon: any;
    badge?: number;
    badgeVariant?: "rose" | "teal" | "amber" | "blue";
  }[] = [
    {
      id: "kitchen",
      label: "Dapur & Order Live POS",
      icon: ChefHat,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
      badgeVariant: "rose"
    },
    {
      id: "catalog",
      label: "Katalog Menu & Stok",
      icon: UtensilsCrossed,
    },
    {
      id: "voucher",
      label: "Scanner Voucher Pangan",
      icon: Ticket,
    },
    {
      id: "finance",
      label: "Laporan Omzet Bersih",
      icon: Wallet,
    }
  ];

  return (
    <aside className={`hidden lg:flex flex-col w-64 h-[calc(100vh-4rem)] sticky top-16 bg-white/80 dark:bg-[#0c1220]/80 backdrop-blur-2xl border-r border-slate-200/80 dark:border-white/[0.06] p-4 justify-between select-none ${className}`}>
      <div className="space-y-4">
        {/* Merchant Store Status Card */}
        <div className={`p-4 rounded-2xl border transition-all space-y-3 ${
          isStoreOpen 
            ? "bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-transparent border-orange-500/20" 
            : "bg-slate-100 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 opacity-80"
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400">
              WARUNG / TOKO AKTIF
            </span>
            <span className={`flex h-2 w-2 rounded-full ${isStoreOpen ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30 flex items-center justify-center text-xl shrink-0">
              🏪
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-black text-slate-900 dark:text-white truncate">
                {merchant?.name || "Warung Mitra Solo"}
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400 truncate">
                {merchant?.address || "Kota Surakarta"}
              </p>
            </div>
          </div>

          {/* Quick Toggle Store Button */}
          <button
            onClick={toggleStoreStatus}
            className={`w-full py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
              isStoreOpen
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-500/20"
            }`}
          >
            <Power className="h-3.5 w-3.5" />
            <span>{isStoreOpen ? "Status: Warung Buka" : "Status: Warung Tutup"}</span>
          </button>
        </div>

        {/* 4 Pillars Navigation */}
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 block mb-2">
            Pilar Manajemen Mitra
          </span>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-orange-600 text-white shadow-lg shadow-orange-600/25 scale-[1.02]"
                    : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100/80 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <Badge 
                    variant={isActive ? "neutral" : (item.badgeVariant || "rose")} 
                    size="sm"
                    className="font-black text-[10px] h-5 min-w-[20px] px-1.5 justify-center animate-bounce"
                  >
                    {item.badge}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Footer Section */}
      <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-white/[0.06]">
        <Link
          href={`/merchant/${merchant?.id || "demo"}`}
          target="_blank"
          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] text-[11px] font-bold text-slate-600 dark:text-zinc-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Lihat Toko Publik</span>
          </span>
          <ChevronRight className="h-3 w-3" />
        </Link>

        {/* Zero Commission Badge */}
        <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 text-center space-y-1">
          <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
            ⭐ 100% ZERO COMMISSION
          </span>
          <p className="text-[9px] text-slate-500 dark:text-zinc-400 leading-tight">
            Seluruh keuntungan pesanan adalah hak penuh mitra tanpa potongan komisi.
          </p>
        </div>
      </div>
    </aside>
  );
}
