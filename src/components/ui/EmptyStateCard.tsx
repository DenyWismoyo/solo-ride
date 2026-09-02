"use client";

import React from "react";
import { motion } from "motion/react";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateCardProps {
  icon?: string | React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyStateCard({
  icon = "🧺",
  title,
  description,
  actionLabel,
  onAction,
  className = ""
}: EmptyStateCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-8 rounded-[2rem] bg-white/70 dark:bg-[#0c1220]/70 border border-slate-200/80 dark:border-white/[0.06] backdrop-blur-xl shadow-xs text-center space-y-4 max-w-md mx-auto ${className}`}
    >
      <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.06] flex items-center justify-center text-3xl mx-auto shadow-inner">
        {typeof icon === "string" ? <span>{icon}</span> : icon}
      </div>

      <div className="space-y-1.5">
        <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
          {title}
        </h3>
        <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed max-w-xs mx-auto">
          {description}
        </p>
      </div>

      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="h-10 px-5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black gap-1.5 cursor-pointer shadow-md hover:scale-105 transition-all"
        >
          <span>{actionLabel}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      )}
    </motion.div>
  );
}
