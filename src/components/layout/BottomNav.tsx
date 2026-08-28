"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { 
  Home, 
  Clock, 
  Gift, 
  User, 
  Radio, 
  Wallet, 
  History, 
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
    { id: "radar", label: "Radar Order", icon: Radio, onClick: () => { onTabChange("radar"); router.push("/driver"); } },
    { id: "history", label: "Riwayat", icon: History, onClick: () => onTabChange("history") },
    { id: "wallet", label: "Dompet", icon: Wallet, onClick: () => onTabChange("wallet") },
    { id: "profile", label: "Mitra", icon: User, onClick: () => onTabChange("profile") },
  ];

  const tabs = role === "driver" ? driverTabs : customerTabs;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 bg-white/90 dark:bg-[#030712]/90 backdrop-blur-xl border-t border-slate-200 dark:border-zinc-800/80 px-2 py-2 transition-colors">
      <div className="max-w-md mx-auto grid grid-cols-4 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={tab.onClick}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all cursor-pointer ${
                isActive 
                  ? "text-emerald-600 dark:text-emerald-400 font-bold" 
                  : "text-slate-500 hover:text-slate-800 dark:text-zinc-500 dark:hover:text-zinc-300 font-medium"
              }`}
            >
              <div className={`p-1 rounded-xl transition-all ${
                isActive ? "bg-emerald-500/10 scale-110" : ""
              }`}>
                <Icon className={`h-5 w-5 ${isActive ? "text-emerald-600 dark:text-emerald-400 stroke-[2.5]" : "text-slate-400 dark:text-zinc-500"}`} />
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
