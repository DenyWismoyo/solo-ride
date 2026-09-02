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
    <nav className={`lg:hidden fixed bottom-0 inset-x-0 z-40 pb-[max(env(safe-area-inset-bottom,0px),0.5rem)] pt-1 px-2 bg-white/95 dark:bg-[#0c1220]/95 backdrop-blur-2xl border-t border-slate-200/80 dark:border-white/[0.08] shadow-[0_-4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.7)] ${className}`}>
      <div className="max-w-lg mx-auto w-full flex items-center justify-around gap-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center flex-1 h-12 py-1 px-1 rounded-md transition-all duration-200 cursor-pointer ${
                isActive
                  ? "text-orange-600 dark:text-orange-400 font-bold"
                  : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="merchant_mobile_nav_bubble"
                  className="absolute inset-0 bg-orange-500/12 dark:bg-orange-500/20 rounded-md border border-orange-500/20"
                  transition={{ type: "spring", stiffness: 450, damping: 30 }}
                />
              )}

              <div className="relative z-10 flex items-center justify-center">
                <Icon className={`h-4.5 w-4.5 transition-transform ${isActive ? "scale-110" : ""}`} />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-white text-[9px] font-black animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </div>

              <span className="relative z-10 text-[10px] mt-0.5 tracking-tight font-semibold">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
