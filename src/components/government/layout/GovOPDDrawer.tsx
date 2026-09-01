"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GOVERNMENT_SECTORS, SectorDefinition } from "@/constants/ecosystemSectors";
import { Badge } from "@/components/ui/badge";
import { Search, X, Check, Building2, ChevronRight, Shield } from "lucide-react";

interface GovOPDDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDinasId: string;
  onSelectDinas: (dinasId: string) => void;
}

export function GovOPDDrawer({
  isOpen,
  onClose,
  selectedDinasId,
  onSelectDinas
}: GovOPDDrawerProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSectors = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return GOVERNMENT_SECTORS;
    return GOVERNMENT_SECTORS.filter((sec) => 
      sec.name.toLowerCase().includes(q) ||
      sec.agencyOrCompanyName.toLowerCase().includes(q) ||
      sec.tagline.toLowerCase().includes(q) ||
      sec.services.some(s => s.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
          />

          {/* Drawer / Modal Container */}
          <motion.div
            initial={{ y: "100%", opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 350 }}
            className="relative w-full max-w-lg bg-white dark:bg-[#0c1220] rounded-t-[2.5rem] sm:rounded-[2rem] border border-slate-200/80 dark:border-white/10 shadow-2xl z-10 flex flex-col max-h-[85vh] overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/[0.06] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-600 dark:text-teal-400 flex items-center justify-center text-lg">
                    🏛️
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      Pilih Instansi / OPD Pemkot
                    </h3>
                    <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                      18 Gerbang Pelayanan Publik Kota Surakarta
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/[0.06] flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari dinas, instansi, atau nama layanan..."
                  className="w-full pl-9 pr-8 py-2 bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] rounded-xl text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-teal-500 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            {/* List of 18 OPDs */}
            <div className="flex-1 overflow-y-auto sg-custom-scrollbar p-3 space-y-2 overscroll-contain">
              {filteredSectors.map((sector) => {
                const isSelected = sector.id === selectedDinasId;
                return (
                  <button
                    key={sector.id}
                    type="button"
                    onClick={() => {
                      onSelectDinas(sector.id);
                      onClose();
                    }}
                    className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "bg-teal-500/10 dark:bg-teal-500/20 border-teal-500/40 shadow-xs"
                        : "bg-slate-50/70 dark:bg-white/[0.02] border-slate-200/60 dark:border-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.05]"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center text-xl shrink-0">
                        {sector.avatar}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                            {sector.name}
                          </h4>
                          {isSelected && (
                            <Badge variant="teal" size="sm" className="text-[8px] px-1.5 py-0 font-bold">
                              Aktif
                            </Badge>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-zinc-400 truncate">
                          {sector.agencyOrCompanyName}
                        </p>
                        <p className="text-[9px] text-teal-600 dark:text-teal-400 font-semibold truncate mt-0.5">
                          {sector.tagline}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 ml-2">
                      {isSelected ? (
                        <div className="w-6 h-6 rounded-full bg-teal-500 text-white flex items-center justify-center shadow-xs">
                          <Check className="h-3.5 w-3.5" />
                        </div>
                      ) : (
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                  </button>
                );
              })}

              {filteredSectors.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-400">
                  Dinas tidak ditemukan untuk &ldquo;{searchQuery}&rdquo;
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/[0.06] text-center text-[10px] text-slate-400 font-medium">
              Sistem Pelayanan Terpadu Satu Pintu • Pemkot Surakarta
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
