"use client";

import React, { useState, useMemo } from "react";
import { useRoadIncidents } from "@/hooks/useRoadIncidents";
import { RoadIncidentCard } from "./RoadIncidentCard";
import { CreateIncidentModal } from "./CreateIncidentModal";
import { SOLO_DISTRICTS } from "@/constants/geofencing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Megaphone, 
  Plus, 
  Search, 
  Waves, 
  Cone, 
  Calendar, 
  AlertTriangle, 
  Car, 
  Sparkles,
  Compass,
  Loader2,
  ShieldCheck
} from "lucide-react";

export function RoadIncidentFeed() {
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { incidents, loading, voteIncident, createIncident } = useRoadIncidents(selectedDistrict, selectedCategory);

  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return incidents;
    return incidents.filter(i => 
      i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.streetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [incidents, searchQuery]);

  const categories = [
    { id: "all", label: "Semua Kondisi", emoji: "📢" },
    { id: "flood", label: "Banjir / Genangan", emoji: "🌊" },
    { id: "roadblock", label: "Hajatan / Penutupan", emoji: "🎪" },
    { id: "event", label: "CFD & Event", emoji: "🏃" },
    { id: "roadwork", label: "Perbaikan Jalan", emoji: "🚧" },
    { id: "traffic", label: "Kemacetan", emoji: "🚗" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Call-to-Action */}
      <div className="p-6 rounded-[2rem] bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-transparent border border-orange-500/20 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30 flex items-center justify-center text-2xl shrink-0">
            📢
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Pojok Rembug & Pantauan Jalan Live
              </h2>
              <Badge variant="orange" size="sm" className="font-black text-[9px]">SOLO REALTIME</Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Info penutupan jalan hajatan warga, genangan air hujan, CFD Slamet Riyadi, dan rute pengalihan arus
            </p>
          </div>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          className="h-11 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs gap-2 shadow-md shadow-orange-500/20 shrink-0 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Laporkan Kondisi Jalan</span>
        </Button>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all duration-200 whitespace-nowrap flex items-center gap-1.5 cursor-pointer shadow-xs border ${
                isSelected
                  ? "bg-orange-600 text-white border-orange-600 shadow-md shadow-orange-600/20 scale-105"
                  : "bg-white dark:bg-[#0c1220] text-slate-600 dark:text-zinc-400 border-slate-200/80 dark:border-white/10 hover:border-slate-300"
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* District Selector & Search Input */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#0c1220] p-3.5 rounded-2xl border border-slate-200/80 dark:border-white/[0.06]">
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama jalan, lokasi, atau kata kunci..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedDistrict("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedDistrict === "all"
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                : "bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-zinc-400"
            }`}
          >
            Semua Kecamatan
          </button>

          {SOLO_DISTRICTS.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedDistrict(d.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedDistrict === d.id
                  ? "bg-orange-600 text-white"
                  : "bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-zinc-400"
              }`}
            >
              {d.shortName}
            </button>
          ))}
        </div>
      </div>

      {/* Incidents Feed List */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto" />
          <p className="text-xs text-slate-400">Memuat laporan pantauan jalan...</p>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white dark:bg-[#0c1220] rounded-[2rem] border border-dashed border-slate-200 dark:border-white/10 p-8">
          <span className="text-3xl">🛣️</span>
          <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200">
            Lalu lintas lancar & tidak ada laporan kendala
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery 
              ? `Tidak ada hasil laporan untuk "${searchQuery}".`
              : "Jalanan di wilayah yang Anda pilih terpantau lancar tanpa penutupan atau genangan."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredList.map((incident) => (
            <RoadIncidentCard
              key={incident.id}
              incident={incident}
              onVote={(id, type) => voteIncident(id, type, "current_user")}
            />
          ))}
        </div>
      )}

      {/* Create Incident Modal */}
      {isModalOpen && (
        <CreateIncidentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={createIncident}
        />
      )}
    </div>
  );
}
