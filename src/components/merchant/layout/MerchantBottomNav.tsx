"use client";

import React from "react";
import { motion } from "motion/react";
import { useMerchantContext, MerchantTab } from "./MerchantContext";
import { 
  ChefHat, 
  UtensilsCrossed, 
  Ticket, 
  Wallet 
} from "lucide-react";

export function MerchantBottomNav({ className = "" }: { className?: string }) {
  const { activeTab, setActiveTab, pendingOrdersCount } = useMerchantContext();

  const tabs: {
    id: MerchantTab;
    label: string;
    icon: any;
    badge?: number;
  }[] = [
    {
      id: "kitchen",
      label: "Dapur POS",
      icon: ChefHat,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
    },
    {
      id: "catalog",
      label: "Katalog",
      icon: UtensilsCrossed,
    },
    {
      id: "voucher",
      label: "Voucher",
      icon: Ticket,
    },
    {
      id: "finance",
      label: "Omzet",
      icon: Wallet,
    }
  ];

  return (
    <nav className={`lg:hidden fixed bottom-3 inset-x-0 z-40 px-4 flex justify-center pointer-events-none ${className}`}>
      <div className="pointer-events-auto flex items-center justify-around gap-1 p-1.5 bg-white/90 dark:bg-[#0c1220]/90 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 rounded-full shadow-[0_12px_36px_-6px_rgba(0,0,0,0.15)] dark:shadow-[0_12px_36px_-6px_rgba(0,0,0,0.7)] max-w-sm w-full">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-2 px-3.5 rounded-full transition-all duration-200 cursor-pointer ${
                isActive
                  ? "text-orange-600 dark:text-orange-400 font-bold"
                  : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="merchant_mobile_nav_bubble"
                  className="absolute inset-0 bg-orange-500/15 dark:bg-orange-500/20 rounded-full"
                  transition={{ type: "spring", stiffness: 450, damping: 30 }}
                />
              )}

              <div className="relative z-10 flex items-center justify-center">
                <Icon className={`h-5 w-5 transition-transform ${isActive ? "scale-110" : ""}`} />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-white text-[9px] font-black animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </div>

              <span className="relative z-10 text-[10px] mt-0.5 tracking-tight">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
