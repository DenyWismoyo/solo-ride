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
    <nav className="fixed bottom-4 inset-x-0 z-30 pb-[env(safe-area-inset-bottom,0px)] px-4 pointer-events-none flex justify-center">
      <div className="w-full max-w-sm pointer-events-auto">
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="bg-white/80 dark:bg-[#0c1220]/80 backdrop-blur-2xl shadow-[0_8px_32px_-8px_rgba(0,0,0,0.12),inset_0_1px_1px_rgba(255,255,255,0.8)] dark:shadow-[0_12px_40px_-10px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.1)] border border-white/50 dark:border-white/10 rounded-full p-2 grid grid-cols-4 gap-1 relative overflow-hidden"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <motion.button
                key={tab.id}
                onClick={tab.onClick}
                whileTap={{ scale: 0.88 }}
                className={`relative flex flex-col items-center justify-center h-14 px-1 rounded-full transition-colors cursor-pointer z-10 select-none ${
                  isActive 
                    ? "text-emerald-600 dark:text-emerald-400 font-black" 
                    : "text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200 font-medium"
                }`}
              >
                {/* Active Sliding Capsule Indicator with Spring Physics */}
                {isActive && (
                  <motion.div
                    layoutId="activeBottomTabPill"
                    transition={{ type: "spring", stiffness: 450, damping: 30 }}
                    className="absolute inset-0 bg-emerald-500/15 dark:bg-emerald-500/20 rounded-full -z-10 shadow-xs border border-emerald-500/10"
                  />
                )}

                <motion.div 
                  animate={{ scale: isActive ? 1.08 : 1, y: isActive ? -1 : 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <Icon className={`h-5 w-5 ${isActive ? "text-emerald-600 dark:text-emerald-400 stroke-[2.5]" : "text-slate-400 dark:text-zinc-500"}`} />
                </motion.div>
                
                <span className="text-[11px] mt-0.5 tracking-tight font-semibold">
                  {tab.label}
                </span>
              </motion.button>
            );
          })}
        </motion.div>
      </div>
    </nav>
  );
}
