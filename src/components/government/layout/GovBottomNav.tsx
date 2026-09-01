"use client";

import React from "react";
import { motion } from "motion/react";
import { 
  LayoutDashboard, 
  Inbox, 
  Settings2,
  Megaphone, 
  History 
} from "lucide-react";
import { GovTab } from "./GovWorkspaceContext";

interface GovBottomNavProps {
  activeTab: GovTab;
  onTabChange: (tab: GovTab) => void;
  pendingCount?: number;
  className?: string;
}

export function GovBottomNav({
  activeTab,
  onTabChange,
  pendingCount = 0,
  className = ""
}: GovBottomNavProps) {
  const tabs: {
    id: GovTab;
    label: string;
    icon: any;
    badge?: number;
  }[] = [
    {
      id: "workspace",
      label: "Workspace",
      icon: LayoutDashboard,
    },
    {
      id: "orders",
      label: "Antrean",
      icon: Inbox,
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    {
      id: "catalog",
      label: "Katalog",
      icon: Settings2,
    },
    {
      id: "broadcast",
      label: "Siaran",
      icon: Megaphone,
    },
    {
      id: "audit",
      label: "Audit",
      icon: History,
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
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center flex-1 py-1.5 px-2 rounded-full transition-all cursor-pointer ${
                isActive ? "text-white" : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="govActiveBottomPill"
                  className="absolute inset-0 bg-teal-600 rounded-full shadow-md shadow-teal-600/30 -z-10"
                  transition={{ type: "spring", stiffness: 450, damping: 30 }}
                />
              )}

              <div className="relative">
                <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-500 dark:text-zinc-400"}`} />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 w-3.5 h-3.5 bg-rose-500 text-white rounded-full text-[8px] font-black flex items-center justify-center animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </div>

              <span className={`text-[10px] font-bold mt-0.5 ${isActive ? "text-white" : "text-slate-500 dark:text-zinc-400"}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
