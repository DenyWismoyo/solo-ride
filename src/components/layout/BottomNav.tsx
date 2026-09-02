"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { 
  Home, 
  Clock, 
  Gift, 
  User, 
  Radio, 
  Wallet, 
  TrendingUp, 
  ShieldCheck 
} from "lucide-react";

interface BottomNavProps {
  role?: "customer" | "driver" | "admin" | "merchant" | "industry" | "government";
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNav({ role = "customer", activeTab, onTabChange }: BottomNavProps) {
  const router = useRouter();

  const customerTabs = [
    { id: "home", label: "Beranda", icon: Home, onClick: () => { onTabChange("home"); router.push("/"); } },
    { id: "orders", label: "Pesanan", icon: Clock, onClick: () => onTabChange("orders") },
    { id: "rewards", label: "Poin UMKM", icon: Gift, onClick: () => onTabChange("rewards") },
    { id: "profile", label: "Akun", icon: User, onClick: () => onTabChange("profile") },
  ];

  const driverTabs = [
    { id: "radar", label: "Radar", icon: Radio, onClick: () => onTabChange("radar") },
    { id: "income", label: "Pendapatan", icon: Wallet, onClick: () => onTabChange("income") },
    { id: "performance", label: "Performa", icon: TrendingUp, onClick: () => onTabChange("performance") },
    { id: "partner", label: "Mitra", icon: ShieldCheck, onClick: () => onTabChange("partner") },
  ];

  const tabs = role === "driver" ? driverTabs : customerTabs;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 pb-[max(env(safe-area-inset-bottom,0px),0.5rem)] pt-1 px-2 bg-white/95 dark:bg-[#0c1220]/95 backdrop-blur-2xl border-t border-slate-200/80 dark:border-white/[0.08] shadow-[0_-4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.7)]">
      <div className="max-w-lg mx-auto w-full">
        <div className="grid grid-cols-4 gap-1.5 relative">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <motion.button
                key={tab.id}
                onClick={tab.onClick}
                whileTap={{ scale: 0.92 }}
                className={`relative flex flex-col items-center justify-center h-13 py-1 px-1 rounded-md transition-all cursor-pointer select-none ${
                  isActive 
                    ? "text-emerald-600 dark:text-emerald-400 font-bold" 
                    : "text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200 font-medium"
                }`}
              >
                {/* Solid Elegant Active Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeBottomTabPill"
                    transition={{ type: "spring", stiffness: 450, damping: 30 }}
                    className="absolute inset-0 bg-emerald-500/12 dark:bg-emerald-500/20 rounded-md -z-10 border border-emerald-500/20 shadow-xs"
                  />
                )}

                <motion.div 
                  animate={{ scale: isActive ? 1.08 : 1, y: isActive ? -1 : 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <Icon className={`h-5 w-5 ${isActive ? "text-emerald-600 dark:text-emerald-400 stroke-[2.4]" : "text-slate-400 dark:text-zinc-500"}`} />
                </motion.div>
                
                <span className="text-[11px] mt-0.5 tracking-tight font-semibold">
                  {tab.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
