"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LocationPoint } from "@/types/order.types";
import { 
  SURAKARTA_MASTER_PLACES, 
  SoloPlaceItem 
} from "@/constants/surakartaPlaces";
import { useRecentDestinations } from "@/hooks/useRecentDestinations";
import { useAuthContext } from "@/components/AuthProvider";
import {
  Search,
  MapPin,
  Navigation,
  Compass,
  Map,
  X,
  History,
  Sparkles,
  Train,
  Store,
  GraduationCap,
  Stethoscope,
  Building,
  Landmark,
  Home,
  Briefcase,
  ChevronRight,
  Loader2,
  Check
} from "lucide-react";

interface LocationSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (location: LocationPoint) => void;
  onPickOnMap: () => void;
  type: "pickup" | "dropoff";
  currentValue?: string;
}

const CATEGORY_FILTERS = [
  { id: "all", label: "🌟 Rekomendasi", icon: Sparkles },
  { id: "transport", label: "🚆 Stasiun & Terminal", icon: Train },
  { id: "market", label: "🛒 Mall & Pasar", icon: Store },
  { id: "health", label: "🏥 Rumah Sakit", icon: Stethoscope },
  { id: "campus", label: "🎓 Kampus", icon: GraduationCap },
  { id: "heritage", label: "🏛️ Wisata & Budaya", icon: Landmark },
  { id: "government", label: "🏢 Balaikota & Dinas", icon: Building },
] as const;

export function LocationSearchModal({
  isOpen,
  onClose,
  onSelectLocation,
  onPickOnMap,
  type,
  currentValue = "",
}: LocationSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [isLocatingGPS, setIsLocatingGPS] = useState(false);
  const { recentDestinations, addRecentDestination } = useRecentDestinations();
  const { userData } = useAuthContext();
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      setSearchQuery("");
      setActiveCategory("all");
    }
  }, [isOpen]);

  // Filter master places based on active category & query
  const filteredPlaces = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return SURAKARTA_MASTER_PLACES.filter((place) => {
      if (place.category === "kelurahan") return false;

      // Category matching
      const matchesCategory =
        activeCategory === "all"
          ? true
          : place.category === activeCategory;

      if (!matchesCategory) return false;

      // Query matching
      if (!q) {
        // If query is empty and category is all, show top 12 popular places
        return activeCategory === "all" ? (place.popularRank !== undefined && place.popularRank <= 12) : true;
      }

      return (
        place.name.toLowerCase().includes(q) ||
        place.address.toLowerCase().includes(q) ||
        place.district.toLowerCase().includes(q) ||
        (place.description && place.description.toLowerCase().includes(q))
      );
    });
  }, [searchQuery, activeCategory]);

  const handleSelect = (point: LocationPoint) => {
    addRecentDestination(point);
    onSelectLocation(point);
    onClose();
  };

  const handleGPSLocation = () => {
    if (!navigator.geolocation) {
      alert("GPS tidak didukung oleh perangkat atau browser Anda.");
      return;
    }

    setIsLocatingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocatingGPS(false);
        const point: LocationPoint = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          address: "Lokasi Saya Saat Ini (GPS Terkini)",
        };
        handleSelect(point);
      },
      (err) => {
        setIsLocatingGPS(false);
        alert("Gagal membaca GPS. Pastikan izin lokasi perangkat sudah diaktifkan.");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "transport":
        return <Train className="h-4 w-4 text-blue-500" />;
      case "market":
        return <Store className="h-4 w-4 text-amber-500" />;
      case "campus":
        return <GraduationCap className="h-4 w-4 text-purple-500" />;
      case "health":
        return <Stethoscope className="h-4 w-4 text-rose-500" />;
      case "government":
        return <Building className="h-4 w-4 text-indigo-500" />;
      case "heritage":
        return <Landmark className="h-4 w-4 text-emerald-500" />;
      default:
        return <MapPin className="h-4 w-4 text-slate-400" />;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex flex-col justify-end sm:justify-center sm:items-center sm:p-4 bg-slate-950/70 backdrop-blur-md">
        {/* Backdrop Tap to Close */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />

        {/* Modal Container / Bottom Sheet */}
        <motion.div
          initial={{ y: "100%", opacity: 0.5 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="relative w-full max-w-xl bg-white dark:bg-[#0c1220] rounded-t-[2.5rem] sm:rounded-[2rem] shadow-2xl border border-slate-200/80 dark:border-white/[0.08] flex flex-col h-[90vh] sm:h-[85vh] max-h-[820px] overflow-hidden z-10"
        >
          {/* Mobile Drag Indicator */}
          <div className="w-12 h-1.5 bg-slate-300 dark:bg-white/20 rounded-full mx-auto mt-3 mb-1 sm:hidden" />

          {/* Search Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/[0.04] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                    type === "pickup"
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {type === "pickup" ? (
                    <MapPin className="h-4 w-4" />
                  ) : (
                    <Navigation className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    {type === "pickup" ? "Pilih Titik Penjemputan" : "Pilih Lokasi Tujuan"}
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                    Cari stasiun, mall, kampus, RS, atau tempat populer Solo
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Input Search Box */}
            <div className="relative flex items-center">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-emerald-500" />
              </div>
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  type === "pickup"
                    ? "Ketik nama tempat penjemputan..."
                    : "Mau ke mana? (contoh: Balapan, Paragon, UNS)"
                }
                className="w-full bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-2xl pl-10 pr-9 py-3 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Quick Action Buttons (GPS & Manual Map) */}
            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <button
                type="button"
                onClick={handleGPSLocation}
                disabled={isLocatingGPS}
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-xs"
              >
                {isLocatingGPS ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Compass className="h-3.5 w-3.5" />
                )}
                <span>{isLocatingGPS ? "Mencari GPS..." : "GPS Saya"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onPickOnMap();
                }}
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200 dark:hover:bg-white/[0.08] text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-white/[0.06] text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-xs"
              >
                <Map className="h-3.5 w-3.5 text-rose-500" />
                <span>Pilih di Peta</span>
              </button>
            </div>
          </div>

          {/* Saved Addresses Chips (If Available) */}
          {userData?.savedAddresses && userData.savedAddresses.length > 0 && !searchQuery && (
            <div className="px-4 py-2.5 bg-slate-50/70 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/[0.04] flex items-center gap-2 overflow-x-auto scrollbar-hide no-scrollbar touch-pan-x">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
                Tersimpan:
              </span>
              {userData.savedAddresses.map((addr) => (
                <button
                  key={addr.id}
                  type="button"
                  onClick={() =>
                    handleSelect({
                      lat: addr.lat || -7.5666,
                      lng: addr.lng || 110.8283,
                      address: addr.address,
                    })
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-zinc-300 hover:border-emerald-500 text-xs font-bold shrink-0 transition-all shadow-xs"
                >
                  {addr.label.toLowerCase() === "rumah" ? (
                    <Home className="h-3.5 w-3.5 text-emerald-500" />
                  ) : addr.label.toLowerCase() === "kantor" ? (
                    <Briefcase className="h-3.5 w-3.5 text-blue-500" />
                  ) : (
                    <GraduationCap className="h-3.5 w-3.5 text-purple-500" />
                  )}
                  <span>{addr.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Category Filter Pills */}
          <div className="px-4 py-2.5 border-b border-slate-100 dark:border-white/[0.04] flex items-center gap-1.5 overflow-x-auto scrollbar-hide no-scrollbar touch-pan-x">
            {CATEGORY_FILTERS.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20 scale-102"
                      : "bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-white/[0.08]"
                  }`}
                >
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Places List (Scrollable Area) */}
          <div className="flex-1 overflow-y-auto sg-custom-scrollbar p-4 space-y-2.5 overscroll-contain">
            {/* Recent Searches (Shown if query is empty and on 'all' category) */}
            {!searchQuery && activeCategory === "all" && recentDestinations.length > 0 && (
              <div className="mb-4 space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-wider px-1">
                  <History className="h-3.5 w-3.5" />
                  <span>Pencarian Terkini</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {recentDestinations.map((recent, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelect(recent)}
                      className="w-full text-left p-3 rounded-2xl bg-slate-50/90 dark:bg-white/[0.02] hover:bg-emerald-50/60 dark:hover:bg-emerald-950/20 border border-slate-200/60 dark:border-white/[0.04] hover:border-emerald-500/30 transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-slate-200/70 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-zinc-400 shrink-0 group-hover:text-emerald-500">
                          <History className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {recent.address}
                          </p>
                          <p className="text-[10px] text-slate-400">Riwayat Terakhir</p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-500 transition-colors shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Master Places Results */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  {searchQuery
                    ? `Hasil Pencarian (${filteredPlaces.length})`
                    : activeCategory === "all"
                    ? "Lokasi & Tempat Populer Solo"
                    : `Kategori: ${CATEGORY_FILTERS.find((c) => c.id === activeCategory)?.label}`}
                </span>
              </div>

              {filteredPlaces.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center px-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 mb-3">
                    <Search className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-700 dark:text-zinc-300">
                    Lokasi tidak ditemukan
                  </p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    Coba kata kunci lain atau gunakan tombol "Pilih di Peta" untuk menentukan lokasi secara visual.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onPickOnMap();
                    }}
                    className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
                  >
                    Buka Peta Solo
                  </button>
                </div>
              ) : (
                filteredPlaces.map((place) => (
                  <button
                    key={place.id}
                    type="button"
                    onClick={() =>
                      handleSelect({
                        lat: place.lat,
                        lng: place.lng,
                        address: `${place.name}, ${place.address}`,
                      })
                    }
                    className="w-full text-left p-3.5 rounded-2xl bg-white dark:bg-[#111827]/70 hover:bg-emerald-50/80 dark:hover:bg-emerald-950/20 border border-slate-200/80 dark:border-white/[0.06] hover:border-emerald-500/40 transition-all flex items-center justify-between group cursor-pointer shadow-xs active:scale-[0.99]"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200/50 dark:border-white/[0.08] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform shadow-xs">
                        {getCategoryIcon(place.category)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {place.name}
                          </h4>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-zinc-400">
                            {place.district}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                          {place.address}
                        </p>
                        {place.description && (
                          <p className="text-[10px] text-slate-400 dark:text-zinc-500 line-clamp-1 mt-0.5 italic">
                            "{place.description}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 ml-2 pl-2 border-l border-slate-100 dark:border-white/[0.04]">
                      <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-white/5 group-hover:bg-emerald-500 group-hover:text-white flex items-center justify-center text-slate-400 transition-colors">
                        <ChevronRight className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
