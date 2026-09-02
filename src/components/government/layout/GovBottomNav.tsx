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
    <nav className={`lg:hidden fixed bottom-0 inset-x-0 z-40 pb-[max(env(safe-area-inset-bottom,0px),0.5rem)] pt-1 px-2 bg-white/95 dark:bg-[#0c1220]/95 backdrop-blur-2xl border-t border-slate-200/80 dark:border-white/[0.08] shadow-[0_-4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.7)] ${className}`}>
      <div className="max-w-lg mx-auto w-full flex items-center justify-around gap-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center flex-1 h-12 py-1 px-1 rounded-md transition-all cursor-pointer ${
                isActive ? "text-teal-600 dark:text-teal-400 font-bold" : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="govActiveBottomPill"
                  className="absolute inset-0 bg-teal-500/12 dark:bg-teal-500/20 rounded-md border border-teal-500/20 -z-10"
                  transition={{ type: "spring", stiffness: 450, damping: 30 }}
                />
              )}

              <div className="relative">
                <Icon className={`h-4.5 w-4.5 ${isActive ? "text-teal-600 dark:text-teal-400 stroke-[2.4]" : "text-slate-500 dark:text-zinc-400"}`} />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 w-3.5 h-3.5 bg-rose-500 text-white rounded-full text-[8px] font-black flex items-center justify-center animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </div>

              <span className={`text-[10px] font-semibold mt-0.5 ${isActive ? "text-teal-600 dark:text-teal-400" : "text-slate-500 dark:text-zinc-400"}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
