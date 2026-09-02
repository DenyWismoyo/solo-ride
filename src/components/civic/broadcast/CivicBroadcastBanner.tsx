"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { 
  Megaphone, 
  AlertTriangle, 
  AlertOctagon, 
  Sparkles, 
  ChevronRight, 
  X, 
  ExternalLink, 
  Clock, 
  MapPin,
  ListFilter
} from "lucide-react";
import { BroadcastDocument, BroadcastCategory } from "@/types/notification.types";
import { Button } from "@/components/ui/button";
import { CivicBroadcastHubModal } from "./CivicBroadcastHubModal";

interface CivicBroadcastBannerProps {
  broadcasts: BroadcastDocument[];
  role?: "customer" | "driver" | "merchant";
  className?: string;
}

export function CivicBroadcastBanner({
  broadcasts,
  role = "customer",
  className = ""
}: CivicBroadcastBannerProps) {
  const router = useRouter();
  const [selectedBroadcast, setSelectedBroadcast] = useState<BroadcastDocument | null>(null);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [isHubOpen, setIsHubOpen] = useState(false);

  // Filter out dismissed
  const activeBroadcasts = broadcasts.filter(b => b.id && !dismissedIds.has(b.id));

  // If all are dismissed, show persistent mini pill to reopen
  if (activeBroadcasts.length === 0) {
    if (broadcasts.length > 0) {
      return (
        <>
          <div className="flex items-center justify-center py-0.5">
            <button
              type="button"
              onClick={() => setIsHubOpen(true)}
              className="px-3 py-1 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-[10px] font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Megaphone className="h-3 w-3 animate-pulse text-emerald-500" />
              <span>Arsip Warta Resmi Pemkot ({broadcasts.length})</span>
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          <CivicBroadcastHubModal
            isOpen={isHubOpen}
            onClose={() => setIsHubOpen(false)}
            broadcasts={broadcasts}
          />
        </>
      );
    }
    return null;
  }

  const current = activeBroadcasts[0]; // Active top broadcast
  const category: BroadcastCategory = current.category || "info";

  // Category Configuration
  const categoryConfig: Record<BroadcastCategory, {
    bg: string;
    border: string;
    text: string;
    badgeBg: string;
    badgeText: string;
    badgeLabel: string;
    iconBg: string;
    iconColor: string;
    Icon: React.ElementType;
  }> = {
    info: {
      bg: "bg-gradient-to-r from-blue-500/15 via-teal-500/10 to-blue-500/5 dark:from-blue-950/40 dark:via-teal-950/20 dark:to-transparent",
      border: "border-blue-500/20",
      text: "text-blue-900 dark:text-blue-200",
      badgeBg: "bg-blue-500/20",
      badgeText: "text-blue-700 dark:text-blue-300",
      badgeLabel: "Warta Kota",
      iconBg: "bg-blue-500/20",
      iconColor: "text-blue-600 dark:text-blue-400",
      Icon: Megaphone
    },
    warning: {
      bg: "bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-amber-500/5 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-transparent",
      border: "border-amber-500/30",
      text: "text-amber-950 dark:text-amber-200",
      badgeBg: "bg-amber-500/25",
      badgeText: "text-amber-800 dark:text-amber-300",
      badgeLabel: "Peringatan",
      iconBg: "bg-amber-500/20",
      iconColor: "text-amber-600 dark:text-amber-400",
      Icon: AlertTriangle
    },
    emergency: {
      bg: "bg-gradient-to-r from-rose-500/20 via-red-500/15 to-rose-500/5 dark:from-rose-950/50 dark:via-red-950/30 dark:to-transparent",
      border: "border-rose-500/30",
      text: "text-rose-950 dark:text-rose-200",
      badgeBg: "bg-rose-500 text-white animate-pulse",
      badgeText: "text-white",
      badgeLabel: "SIAGA DARURAT",
      iconBg: "bg-rose-500/20",
      iconColor: "text-rose-600 dark:text-rose-400",
      Icon: AlertOctagon
    },
    program: {
      bg: "bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/5 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-transparent",
      border: "border-emerald-500/20",
      text: "text-emerald-950 dark:text-emerald-200",
      badgeBg: "bg-emerald-500/20",
      badgeText: "text-emerald-700 dark:text-emerald-300",
      badgeLabel: "Program Pemkot",
      iconBg: "bg-emerald-500/20",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      Icon: Sparkles
    }
  };

  const cfg = categoryConfig[category] || categoryConfig.info;
  const CategoryIcon = cfg.Icon;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => setSelectedBroadcast(current)}
        className={`p-3.5 rounded-[1.6rem] border ${cfg.border} ${cfg.bg} flex items-center justify-between gap-3 shadow-sm backdrop-blur-xl cursor-pointer ${className}`}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className={`p-2.5 rounded-2xl ${cfg.iconBg} ${cfg.iconColor} shrink-0 shadow-xs`}>
            <CategoryIcon className="h-4.5 w-4.5" />
          </div>

          <div className="min-w-0 space-y-0.5 flex-1">
            <div className="flex items-center gap-1.5">
              <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-md ${cfg.badgeBg} ${cfg.badgeText}`}>
                {cfg.badgeLabel}
              </span>
              <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 truncate">
                {current.institutionName || "Pemkot Surakarta"}
              </span>
            </div>

            <h4 className={`text-xs font-black truncate leading-tight ${cfg.text}`}>
              {current.title}
            </h4>

            <p className="text-[10px] text-slate-600 dark:text-zinc-300 line-clamp-1">
              {current.body}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
          {broadcasts.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsHubOpen(true);
              }}
              className="p-1 rounded-lg hover:bg-slate-200/50 dark:hover:bg-white/10 text-slate-500 text-[10px] font-bold hidden sm:flex items-center gap-1 cursor-pointer"
              title="Lihat Semua Warta"
            >
              <ListFilter className="w-3 h-3" />
              <span>+{broadcasts.length - 1} Lainnya</span>
            </button>
          )}

          <div className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
            <span>Baca</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </div>
      </motion.div>

      {/* Broadcast Detail Reader Modal */}
      <AnimatePresence>
        {selectedBroadcast && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="sg-bento-card p-6 max-w-md w-full space-y-4 rounded-t-3xl sm:rounded-2xl shadow-2xl relative border-emerald-500/20 bg-white dark:bg-[#0c1220]"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-white/[0.06] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2.5 rounded-2xl ${cfg.iconBg} ${cfg.iconColor} shrink-0`}>
                    <CategoryIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-md ${cfg.badgeBg} ${cfg.badgeText}`}>
                        {cfg.badgeLabel}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400">
                        Siaran Resmi Terverifikasi
                      </span>
                    </div>
                    <h3 className="text-xs font-black text-slate-900 dark:text-white mt-0.5">
                      {selectedBroadcast.institutionName || "Pemerintah Kota Surakarta"}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedBroadcast(null)}
                  className="sg-icon-btn h-8 w-8 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Title & Body */}
              <div className="space-y-2">
                <h2 className="text-sm font-black text-slate-900 dark:text-white leading-snug">
                  {selectedBroadcast.title}
                </h2>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06] text-xs text-slate-700 dark:text-zinc-200 leading-relaxed whitespace-pre-line font-medium max-h-56 overflow-y-auto">
                  {selectedBroadcast.body}
                </div>
              </div>

              {/* Geofence & Meta Info */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-emerald-500" />
                  <span>{selectedBroadcast.geofence?.areaName || "Kota Surakarta"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>
                    {selectedBroadcast.createdAt?.toDate 
                      ? selectedBroadcast.createdAt.toDate().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
                      : "Hari ini"}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex gap-2">
                {selectedBroadcast.actionUrl && (
                  <Button
                    className="flex-1 h-11 text-xs font-bold flex items-center justify-center gap-1.5"
                    onClick={() => {
                      setSelectedBroadcast(null);
                      router.push(selectedBroadcast.actionUrl!);
                    }}
                  >
                    <span>{selectedBroadcast.actionLabel || "Buka Layanan Terkait"}</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                )}

                <Button
                  variant="outline"
                  className="h-11 px-4 text-xs font-bold"
                  onClick={() => {
                    if (selectedBroadcast.id) {
                      setDismissedIds(prev => new Set(prev).add(selectedBroadcast.id!));
                    }
                    setSelectedBroadcast(null);
                  }}
                >
                  Tutup
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Full Hub Archive Modal */}
      <CivicBroadcastHubModal
        isOpen={isHubOpen}
        onClose={() => setIsHubOpen(false)}
        broadcasts={broadcasts}
      />
    </>
  );
}
