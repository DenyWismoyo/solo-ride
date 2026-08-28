"use client";

import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ElementType;
  badgeCount?: number;
}

interface SegmentedTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function SegmentedTabs({ tabs, activeTab, onChange, className }: SegmentedTabsProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 p-1 bg-zinc-200/70 dark:bg-[#0b0f19]/90 border border-zinc-300/80 dark:border-white/[0.08] rounded-2xl backdrop-blur-xl shadow-inner",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-colors z-10 select-none cursor-pointer",
              isActive 
                ? "text-zinc-950 dark:text-white" 
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="active-segmented-tab"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
                className="absolute inset-0 bg-white dark:bg-zinc-800 rounded-xl shadow-md border border-zinc-300/60 dark:border-white/[0.12] z-[-1]"
              />
            )}

            {Icon && <Icon className="h-4 w-4 shrink-0" />}
            <span className="truncate">{tab.label}</span>

            {tab.badgeCount !== undefined && tab.badgeCount > 0 && (
              <span
                className={cn(
                  "text-[9px] font-extrabold px-1.5 py-0.2 rounded-full",
                  isActive
                    ? "bg-emerald-500 text-white"
                    : "bg-zinc-300 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                )}
              >
                {tab.badgeCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
