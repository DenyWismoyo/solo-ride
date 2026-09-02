"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { 
  Megaphone, 
  AlertTriangle, 
  AlertOctagon, 
  Sparkles, 
  Search, 
  X, 
  ExternalLink, 
  MapPin, 
  Clock, 
  Building2,
  ChevronRight
} from "lucide-react";
import { BroadcastDocument, BroadcastCategory } from "@/types/notification.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CivicBroadcastHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  broadcasts: BroadcastDocument[];
}

export function CivicBroadcastHubModal({
  isOpen,
  onClose,
  broadcasts
}: CivicBroadcastHubModalProps) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDetail, setSelectedDetail] = useState<BroadcastDocument | null>(null);

  // Filter broadcasts
  const filteredBroadcasts = useMemo(() => {
    return broadcasts.filter((b) => {
      const matchCat = selectedCategory === "all" || b.category === selectedCategory;
      const matchQuery = 
        searchQuery.trim() === "" ||
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.institutionName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [broadcasts, selectedCategory, searchQuery]);

  if (!isOpen) return null;

  const getCategoryConfig = (category?: BroadcastCategory) => {
    switch (category) {
      case "warning":
        return {
          icon: AlertTriangle,
          badgeBg: "bg-amber-500/20 text-amber-700 dark:text-amber-300",
          badgeLabel: "Peringatan",
          iconColor: "text-amber-500",
          border: "border-amber-500/20"
        };
      case "emergency":
        return {
          icon: AlertOctagon,
          badgeBg: "bg-rose-500 text-white animate-pulse",
          badgeLabel: "SIAGA DARURAT",
          iconColor: "text-rose-500",
          border: "border-rose-500/30"
        };
      case "program":
        return {
          icon: Sparkles,
          badgeBg: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
          badgeLabel: "Program Pemkot",
          iconColor: "text-emerald-500",
          border: "border-emerald-500/20"
        };
      default:
        return {
          icon: Megaphone,
          badgeBg: "bg-blue-500/20 text-blue-700 dark:text-blue-300",
          badgeLabel: "Warta Kota",
          iconColor: "text-blue-500",
          border: "border-blue-500/20"
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="sg-bento-card max-w-lg w-full h-[85vh] sm:h-auto sm:max-h-[85vh] flex flex-col rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border-emerald-500/20 bg-white dark:bg-[#0c1220]"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-white/[0.06] flex items-center justify-between bg-gradient-to-r from-emerald-600/10 via-teal-600/5 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Pusat Warta & Siaran Resmi
                </h3>
                <span className="px-2 py-0.2 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-black">
                  Pemkot Solo
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Informasi & pengumuman terkini 19 Dinas Pemerintah Kota Surakarta
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="sg-icon-btn h-8 w-8 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-slate-100 dark:border-white/[0.06] space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari pengumuman, dinas, atau kata kunci..."
              className="sg-input pl-9 pr-3 py-2 w-full text-xs font-semibold"
            />
          </div>

          {/* Category Chips */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {[
              { id: "all", label: "Semua Warta" },
              { id: "info", label: "📢 Warta Kota" },
              { id: "warning", label: "⚠️ Peringatan Lalin" },
              { id: "emergency", label: "🚨 Siaga Darurat" },
              { id: "program", label: "🌾 Pangan & Subsidi" }
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold shrink-0 transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-white/10"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Broadcast List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredBroadcasts.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Megaphone className="h-10 w-10 mx-auto opacity-30" />
              <p className="text-xs font-semibold">Tidak ada warta siaran pada kategori ini.</p>
            </div>
          ) : (
            filteredBroadcasts.map((b) => {
              const cfg = getCategoryConfig(b.category);
              const CatIcon = cfg.icon;

              return (
                <motion.div
                  key={b.id || Math.random().toString()}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setSelectedDetail(b)}
                  className={`p-3.5 rounded-2xl border ${cfg.border} bg-slate-50/70 dark:bg-white/[0.02] hover:bg-slate-100/80 dark:hover:bg-white/[0.05] transition-all cursor-pointer space-y-1.5`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <CatIcon className={`h-3.5 w-3.5 ${cfg.iconColor}`} />
                      <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-md ${cfg.badgeBg}`}>
                        {cfg.badgeLabel}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 truncate max-w-[180px]">
                        {b.institutionName}
                      </span>
                    </div>

                    <span className="text-[9px] text-slate-400">
                      {b.createdAt?.toDate 
                        ? b.createdAt.toDate().toLocaleDateString("id-ID", { day: "numeric", month: "short" }) 
                        : "Hari ini"}
                    </span>
                  </div>

                  <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                    {b.title}
                  </h4>

                  <p className="text-[11px] text-slate-600 dark:text-zinc-300 line-clamp-2 leading-relaxed">
                    {b.body}
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold border-t border-slate-200/50 dark:border-white/[0.04]">
                    <span>Baca Arahan Lengkap</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </motion.div>

      {/* Reader Modal for Selected Item */}
      <AnimatePresence>
        {selectedDetail && (
          <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="sg-bento-card p-6 max-w-md w-full space-y-4 rounded-t-3xl sm:rounded-2xl shadow-2xl relative border-emerald-500/20 bg-white dark:bg-[#0c1220]"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-white/[0.06] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-600 shrink-0">
                    <Megaphone className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[9px] font-black px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                      Warta Resmi Terverifikasi
                    </span>
                    <h3 className="text-xs font-black text-slate-900 dark:text-white mt-0.5">
                      {selectedDetail.institutionName || "Pemerintah Kota Surakarta"}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedDetail(null)}
                  className="sg-icon-btn h-8 w-8 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Title & Body */}
              <div className="space-y-2">
                <h2 className="text-sm font-black text-slate-900 dark:text-white leading-snug">
                  {selectedDetail.title}
                </h2>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06] text-xs text-slate-700 dark:text-zinc-200 leading-relaxed whitespace-pre-line font-medium max-h-56 overflow-y-auto">
                  {selectedDetail.body}
                </div>
              </div>

              {/* Meta */}
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-emerald-500" />
                  <span>{selectedDetail.geofence?.areaName || "Kota Surakarta"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>
                    {selectedDetail.createdAt?.toDate 
                      ? selectedDetail.createdAt.toDate().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
                      : "Hari ini"}
                  </span>
                </div>
              </div>

              {/* Action */}
              <div className="pt-2 flex gap-2">
                {selectedDetail.actionUrl && (
                  <Button
                    className="flex-1 h-11 text-xs font-bold flex items-center justify-center gap-1.5"
                    onClick={() => {
                      setSelectedDetail(null);
                      onClose();
                      router.push(selectedDetail.actionUrl!);
                    }}
                  >
                    <span>{selectedDetail.actionLabel || "Buka Layanan Terkait"}</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="h-11 px-6 text-xs font-bold"
                  onClick={() => setSelectedDetail(null)}
                >
                  Tutup
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
