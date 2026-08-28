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
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25 shadow-[0_0_12px_rgba(16,185,129,0.12)]",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25 shadow-[0_0_12px_rgba(245,158,11,0.12)]",
    orange: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/25 shadow-[0_0_12px_rgba(249,115,22,0.12)]",
    teal: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/25 shadow-[0_0_12px_rgba(20,184,166,0.12)]",
    rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25 shadow-[0_0_12px_rgba(244,63,94,0.12)]",
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25 shadow-[0_0_12px_rgba(59,130,246,0.12)]",
    purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25 shadow-[0_0_12px_rgba(168,85,247,0.12)]",
    neutral: "bg-slate-100 dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 border-slate-300/80 dark:border-zinc-700/80",
    outline: "bg-transparent text-slate-700 dark:text-zinc-300 border-slate-300 dark:border-zinc-700",
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
