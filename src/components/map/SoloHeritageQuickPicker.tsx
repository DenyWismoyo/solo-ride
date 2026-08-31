"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  SURAKARTA_MASTER_PLACES, 
  SoloPlaceItem 
} from "@/constants/surakartaPlaces";
import { LocationPoint } from "@/types/order.types";
import { 
  Landmark, 
  Compass, 
  Train, 
  Store, 
  GraduationCap, 
  Stethoscope, 
  Building, 
  MapPin, 
  Navigation,
  Sparkles,
  ChevronDown,
  ChevronUp,
  X
} from "lucide-react";

interface SoloHeritageQuickPickerProps {
  onSelectPickup: (location: LocationPoint) => void;
  onSelectDropoff: (location: LocationPoint) => void;
  className?: string;
  defaultExpanded?: boolean;
}

const CATEGORY_TABS = [
  { id: "all", label: "🌟 Rekomendasi", icon: Sparkles },
  { id: "heritage", label: "🏛️ Heritage", icon: Landmark },
  { id: "transport", label: "🚆 Stasiun/Terminal", icon: Train },
  { id: "market", label: "🛒 Pasar & Mall", icon: Store },
  { id: "campus", label: "🎓 Kampus", icon: GraduationCap },
  { id: "health", label: "🏥 RS/Faskes", icon: Stethoscope },
  { id: "government", label: "🏢 Balaikota", icon: Building },
] as const;

export function SoloHeritageQuickPicker({
  onSelectPickup,
  onSelectDropoff,
  className = "",
  defaultExpanded = false
}: SoloHeritageQuickPickerProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedPlaceForAction, setSelectedPlaceForAction] = useState<SoloPlaceItem | null>(null);

  const filteredPlaces = useMemo(() => {
    return SURAKARTA_MASTER_PLACES.filter((p) => {
      if (p.category === "kelurahan") return false;
      return activeCategory === "all" ? (p.popularRank !== undefined && p.popularRank <= 8) : p.category === activeCategory;
    });
  }, [activeCategory]);

  const handlePick = (place: SoloPlaceItem, type: "pickup" | "dropoff") => {
    const point: LocationPoint = {
      lat: place.lat,
      lng: place.lng,
      address: `${place.name}, ${place.address}`
    };

    if (type === "pickup") {
      onSelectPickup(point);
    } else {
      onSelectDropoff(point);
    }
    setSelectedPlaceForAction(null);
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "heritage": return Landmark;
      case "transport": return Train;
      case "market": return Store;
      case "campus": return GraduationCap;
      case "health": return Stethoscope;
      case "government": return Building;
      default: return MapPin;
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Minimized / Toggle Bar */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full py-1.5 px-3 bg-white/90 dark:bg-[#0c1220]/90 hover:bg-white dark:hover:bg-[#11192e] border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-md backdrop-blur-md flex items-center justify-between transition-all cursor-pointer group"
      >
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
            <Compass className="h-3.5 w-3.5" />
          </div>
          <span className="text-[11px] font-bold text-slate-800 dark:text-zinc-200">
            {isExpanded ? "Pilih Titik Pengenal & Heritage Solo" : "🏛️ Rekomendasi Titik Heritage & Landmark Solo"}
          </span>
        </div>

        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
          <span>{isExpanded ? "Tutup" : "Buka (1-Click)"}</span>
          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </div>
      </button>

      {/* Expandable Content with smooth animation */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden space-y-2 pt-1"
          >
            {/* Category Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORY_TABS.map((tab) => {
                const isSelected = activeCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveCategory(tab.id);
                      setSelectedPlaceForAction(null);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer border ${
                      isSelected
                        ? "bg-emerald-600 text-white border-emerald-500 shadow-xs"
                        : "bg-white/90 dark:bg-zinc-900/90 text-slate-700 dark:text-zinc-300 border-slate-200/80 dark:border-zinc-800 hover:border-emerald-500/40"
                    }`}
                  >
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Compact Horizontal Carousel of Landmarks */}
            <div className="flex items-stretch gap-2 overflow-x-auto pb-1.5 scrollbar-none">
              {filteredPlaces.map((place) => {
                const Icon = getCategoryIcon(place.category);
                const isSelected = selectedPlaceForAction?.id === place.id;

                return (
                  <div
                    key={place.id}
                    className={`w-52 p-2.5 rounded-xl border transition-all shrink-0 flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? "bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500 shadow-sm"
                        : "bg-white/95 dark:bg-[#0c1220]/95 hover:bg-slate-50 dark:hover:bg-zinc-800/80 border-slate-200/80 dark:border-white/[0.08] shadow-xs"
                    }`}
                    onClick={() => setSelectedPlaceForAction(isSelected ? null : place)}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5">
                          <Icon className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-[9px] font-bold text-slate-400">
                            {place.district}
                          </span>
                        </div>

                        {place.popularRank && (
                          <span className="text-[8px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1 py-0.2 rounded">
                            ⭐ Top {place.popularRank}
                          </span>
                        )}
                      </div>

                      <h5 className="text-[11px] font-bold text-slate-900 dark:text-white leading-tight line-clamp-1">
                        {place.name}
                      </h5>
                    </div>

                    {/* Compact Action Buttons */}
                    <div className="grid grid-cols-2 gap-1 pt-2 mt-1 border-t border-slate-100 dark:border-white/[0.06]">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePick(place, "pickup");
                        }}
                        className="py-1 px-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500 text-emerald-700 dark:text-emerald-300 hover:text-white text-[9px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <MapPin className="h-2.5 w-2.5" />
                        <span>Jemput</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePick(place, "dropoff");
                        }}
                        className="py-1 px-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500 text-rose-700 dark:text-rose-300 hover:text-white text-[9px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <Navigation className="h-2.5 w-2.5" />
                        <span>Tujuan</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
