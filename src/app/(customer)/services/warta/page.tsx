"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, 
  Megaphone, 
  AlertTriangle, 
  AlertOctagon, 
  Sparkles, 
  Search, 
  MapPin, 
  Clock, 
  ExternalLink, 
  X, 
  Loader2, 
  ShieldCheck,
  Building2,
  ChevronRight
} from "lucide-react";
import { useBroadcasts } from "@/hooks/useBroadcasts";
import { BroadcastDocument, BroadcastCategory } from "@/types/notification.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function CivicWartaPage() {
  const router = useRouter();
  const { broadcasts, loading } = useBroadcasts("customer");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBroadcast, setSelectedBroadcast] = useState<BroadcastDocument | null>(null);

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

  const getCategoryConfig = (category?: BroadcastCategory) => {
    switch (category) {
      case "warning":
        return {
          icon: AlertTriangle,
          badgeBg: "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30",
          badgeLabel: "Peringatan Lalin / Cuaca",
          iconColor: "text-amber-500",
          border: "border-amber-500/20",
          cardBg: "from-amber-500/10 via-transparent to-transparent"
        };
      case "emergency":
        return {
          icon: AlertOctagon,
          badgeBg: "bg-rose-500 text-white animate-pulse",
          badgeLabel: "SIAGA DARURAT",
          iconColor: "text-rose-500",
          border: "border-rose-500/30",
          cardBg: "from-rose-500/10 via-transparent to-transparent"
        };
      case "program":
        return {
          icon: Sparkles,
          badgeBg: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
          badgeLabel: "Program Pangan & Subsidi",
          iconColor: "text-emerald-500",
          border: "border-emerald-500/20",
          cardBg: "from-emerald-500/10 via-transparent to-transparent"
        };
      default:
        return {
          icon: Megaphone,
          badgeBg: "bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30",
          badgeLabel: "Warta Kota Resmi",
          iconColor: "text-blue-500",
          border: "border-blue-500/20",
          cardBg: "from-blue-500/10 via-transparent to-transparent"
        };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-white pb-20">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-[#030712]/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/[0.06] px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="sg-icon-btn h-9 w-9 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-black tracking-tight">Pusat Warta & Siaran Resmi</h1>
                <span className="px-2 py-0.2 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[9px] font-black uppercase">
                  Solo
                </span>
              </div>
              <p className="text-[10px] text-slate-500">
                Kanal komunikasi langsung 19 Dinas Pemkot Surakarta
              </p>
            </div>
          </div>

          <div className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Building2 className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-lg mx-auto p-4 space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kata kunci, info rekayasa lalin, beras SPHP..."
            className="sg-input pl-9 pr-3 py-2.5 w-full text-xs font-semibold"
          />
        </div>

        {/* Category Chips */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
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
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white dark:bg-white/[0.04] text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-white/10 hover:bg-slate-100"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Broadcast Feed */}
        {loading ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-emerald-500" />
            <p className="text-xs">Memuat warta siaran resmi Pemkot...</p>
          </div>
        ) : filteredBroadcasts.length === 0 ? (
          <div className="sg-bento-card p-12 text-center text-slate-400 space-y-2">
            <Megaphone className="h-10 w-10 mx-auto opacity-30" />
            <p className="text-xs font-semibold">Tidak ada warta siaran yang cocok.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBroadcasts.map((b) => {
              const cfg = getCategoryConfig(b.category);
              const CatIcon = cfg.icon;

              return (
                <motion.div
                  key={b.id || Math.random().toString()}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setSelectedBroadcast(b)}
                  className={`sg-bento-card p-4 space-y-2.5 border ${cfg.border} bg-gradient-to-br ${cfg.cardBg} cursor-pointer transition-all`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.05]">
                        <CatIcon className={`h-4 w-4 ${cfg.iconColor}`} />
                      </div>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border ${cfg.badgeBg}`}>
                        {cfg.badgeLabel}
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {b.createdAt?.toDate 
                        ? b.createdAt.toDate().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) 
                        : "Hari ini"}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xs font-black text-slate-900 dark:text-white leading-snug">
                      {b.title}
                    </h3>
                    <p className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 mt-0.5">
                      Instansi: {b.institutionName || "Pemerintah Kota Surakarta"}
                    </p>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-zinc-300 line-clamp-2 leading-relaxed">
                    {b.body}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/[0.04] text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-normal">
                      <MapPin className="h-3 w-3 text-emerald-500" />
                      <span>{b.geofence?.areaName || "Kota Surakarta"}</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <span>Baca Lengkap</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

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
                  <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-600 shrink-0">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[9px] font-black px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                      Warta Resmi Terverifikasi
                    </span>
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
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06] text-xs text-slate-700 dark:text-zinc-200 leading-relaxed whitespace-pre-line font-medium max-h-60 overflow-y-auto">
                  {selectedBroadcast.body}
                </div>
              </div>

              {/* Meta */}
              <div className="flex items-center justify-between text-[10px] text-slate-400">
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

              {/* Action */}
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
                  className="h-11 px-6 text-xs font-bold"
                  onClick={() => setSelectedBroadcast(null)}
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
