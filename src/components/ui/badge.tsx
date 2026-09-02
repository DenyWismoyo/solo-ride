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
    emerald: "sg-badge-emerald shadow-xs",
    amber: "sg-badge-amber shadow-xs",
    orange: "sg-badge-amber shadow-xs",
    teal: "sg-badge-teal shadow-xs",
    rose: "sg-badge-rose shadow-xs",
    blue: "sg-badge-blue shadow-xs",
    purple: "bg-purple-500/15 text-purple-800 dark:text-purple-300 border-purple-500/25 shadow-xs",
    neutral: "sg-badge-neutral shadow-xs",
    outline: "bg-white/60 dark:bg-white/[0.03] text-slate-700 dark:text-zinc-300 border-border shadow-xs",
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
        "sg-badge",
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
