"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "emerald" | "amber" | "rose" | "blue" | "purple" | "orange" | "teal" | "neutral" | "outline";
  size?: "sm" | "md" | "lg";
  withDot?: boolean;
}

export function Badge({
  className,
  variant = "neutral",
  size = "md",
  withDot = false,
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    emerald: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 shadow-xs",
    amber: "bg-amber-500/15 text-amber-800 dark:text-amber-300 shadow-xs",
    orange: "bg-orange-500/15 text-orange-800 dark:text-orange-300 shadow-xs",
    teal: "bg-teal-500/15 text-teal-800 dark:text-teal-300 shadow-xs",
    rose: "bg-rose-500/15 text-rose-700 dark:text-rose-300 shadow-xs",
    blue: "bg-blue-500/15 text-blue-800 dark:text-blue-300 shadow-xs",
    purple: "bg-purple-500/15 text-purple-800 dark:text-purple-300 shadow-xs",
    neutral: "bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-zinc-300 shadow-xs",
    outline: "bg-white/60 dark:bg-white/[0.03] text-slate-700 dark:text-zinc-300 shadow-xs",
  };

  const dotColors = {
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    orange: "bg-orange-500",
    teal: "bg-teal-500",
    rose: "bg-rose-500",
    blue: "bg-blue-500",
    purple: "bg-purple-500",
    neutral: "bg-zinc-400",
    outline: "bg-zinc-400",
  };

  const sizeStyles = {
    sm: "text-[9px] px-2 py-0.5 font-bold tracking-wider",
    md: "text-[10px] px-2.5 py-0.5 font-extrabold tracking-wider",
    lg: "text-xs px-3 py-1 font-extrabold tracking-normal",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border transition-colors select-none uppercase",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {withDot && (
        <span className="relative flex h-1.5 w-1.5">
          <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", dotColors[variant])} />
          <span className={cn("relative inline-flex rounded-full h-1.5 w-1.5", dotColors[variant])} />
        </span>
      )}
      {children}
    </div>
  );
}
