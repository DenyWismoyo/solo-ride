"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ElementType;
  trend?: {
    value: string;
    isPositive?: boolean;
    isNeutral?: boolean;
  };
  accentColor?: "emerald" | "amber" | "rose" | "blue" | "teal" | "purple";
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentColor = "emerald",
  className,
}: StatCardProps) {
  const colorMap = {
    emerald: "from-emerald-500/20 to-teal-500/5 text-emerald-500 border-emerald-500/25",
    amber: "from-amber-500/20 to-orange-500/5 text-amber-500 border-amber-500/25",
    rose: "from-rose-500/20 to-red-500/5 text-rose-500 border-rose-500/25",
    blue: "from-blue-500/20 to-indigo-500/5 text-blue-500 border-blue-500/25",
    teal: "from-teal-500/20 to-emerald-500/5 text-teal-500 border-teal-500/25",
    purple: "from-purple-500/20 to-pink-500/5 text-purple-500 border-purple-500/25",
  };

  return (
    <div
      className={cn(
        "sg-bento-card p-4 space-y-3 relative overflow-hidden group",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          {title}
        </span>
        {Icon && (
          <div
            className={cn(
              "p-2 rounded-xl bg-gradient-to-tr border shadow-sm group-hover:scale-110 transition-transform",
              colorMap[accentColor]
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">
          {value}
        </div>

        {(subtitle || trend) && (
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
            {trend && (
              <span
                className={cn(
                  "font-bold flex items-center gap-0.5 px-1.5 py-0.2 rounded-md",
                  trend.isNeutral
                    ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                    : trend.isPositive
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                )}
              >
                {trend.isNeutral ? (
                  <Minus className="h-3 w-3" />
                ) : trend.isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {trend.value}
              </span>
            )}
            {subtitle && <span className="truncate">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
