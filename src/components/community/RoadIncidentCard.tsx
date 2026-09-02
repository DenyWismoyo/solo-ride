"use client";

import React, { useState } from "react";
import { RoadIncident } from "@/types/traffic.types";
import { SOLO_DISTRICTS } from "@/constants/geofencing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  MapPin, 
  Clock, 
  ThumbsUp, 
  CheckCircle2, 
  Navigation, 
  ShieldCheck, 
  Sparkles, 
  ExternalLink,
  Flame,
  Waves,
  Cone,
  Car,
  Calendar
} from "lucide-react";

interface RoadIncidentCardProps {
  incident: RoadIncident;
  onVote: (incidentId: string, type: "still_active" | "resolved") => void;
}

export function RoadIncidentCard({ incident, onVote }: RoadIncidentCardProps) {
  const [hasVoted, setHasVoted] = useState<"still_active" | "resolved" | null>(null);

  const district = SOLO_DISTRICTS.find(d => d.id === incident.districtId);

  const getCategoryMeta = (cat: string) => {
    switch (cat) {
      case "flood":
        return { label: "Banjir / Genangan Air", icon: Waves, variant: "blue" as const, emoji: "🌊" };
      case "roadblock":
        return { label: "Penutupan Jalan / Hajatan", icon: Cone, variant: "rose" as const, emoji: "🎪" };
      case "event":
        return { label: "CFD & Event Publik", icon: Calendar, variant: "emerald" as const, emoji: "🏃" };
      case "roadwork":
        return { label: "Perbaikan Jalan / Pohon", icon: AlertTriangle, variant: "amber" as const, emoji: "🚧" };
      case "traffic":
      default:
        return { label: "Kemacetan Padat", icon: Car, variant: "orange" as const, emoji: "🚗" };
    }
  };

  const meta = getCategoryMeta(incident.category);
  const Icon = meta.icon;

  const handleVote = (type: "still_active" | "resolved") => {
    if (hasVoted) return;
    setHasVoted(type);
    onVote(incident.id, type);
  };

  const handleOpenMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${incident.location.lat},${incident.location.lng}`;
    window.open(url, "_blank");
  };

  // Relative time format
  const getRelativeTime = (ts: any) => {
    if (!ts) return "Baru saja";
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    const diffMin = Math.round((Date.now() - date.getTime()) / (60 * 1000));
    if (diffMin < 1) return "Baru saja";
    if (diffMin < 60) return `${diffMin} menit yang lalu`;
    const diffHours = Math.floor(diffMin / 60);
    return `${diffHours} jam yang lalu`;
  };

  return (
    <div className="sg-bento-card p-5 space-y-3.5 transition-all hover:border-slate-300 dark:hover:border-white/20">
      {/* Header Badges */}
      <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-white/[0.04] pb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant={meta.variant} size="sm" className="font-bold text-[10px] gap-1">
            <span>{meta.emoji}</span>
            <span>{meta.label}</span>
          </Badge>

          {incident.isVerifiedByDishub && (
            <Badge variant="blue" size="sm" className="font-bold text-[10px] gap-1 bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30">
              <ShieldCheck className="h-3 w-3 text-blue-600" />
              <span>Diverifikasi Dishub</span>
            </Badge>
          )}

          <span className="text-[10px] text-slate-400 font-bold">
            Kecamatan {district?.shortName || "Solo"}
          </span>
        </div>

        <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{getRelativeTime(incident.createdAt)}</span>
        </span>
      </div>

      {/* Title & Street Name */}
      <div className="space-y-1">
        <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-tight">
          {incident.title}
        </h3>
        <p className="text-xs font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span>{incident.streetName}</span>
        </p>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
        {incident.description}
      </p>

      {/* Reporter Info */}
      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] flex items-center justify-between text-[11px]">
        <span className="text-slate-500 dark:text-zinc-400">
          Dilaporkan oleh: <strong className="text-slate-800 dark:text-zinc-200">{incident.reporterName}</strong>
        </span>
        <button
          onClick={handleOpenMaps}
          className="text-emerald-600 dark:text-emerald-400 font-bold text-[10px] flex items-center gap-1 hover:underline cursor-pointer"
        >
          <span>Peta Lokasi</span>
          <ExternalLink className="h-3 w-3" />
        </button>
      </div>

      {/* Crowdsourced Verification & Upvote Bar */}
      <div className="pt-2 border-t border-slate-100 dark:border-white/[0.04] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={Boolean(hasVoted)}
            onClick={() => handleVote("still_active")}
            className={`flex-1 h-9 rounded-xl text-[11px] font-bold gap-1.5 cursor-pointer transition-all ${
              hasVoted === "still_active"
                ? "bg-rose-500 text-white border-rose-500 shadow-sm"
                : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-white/[0.06]"
            }`}
          >
            <span>⚠️ Masih Macet</span>
            <span className="px-1.5 py-0.2 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 font-black text-[10px]">
              {incident.stillActiveCount}
            </span>
          </Button>

          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={Boolean(hasVoted)}
            onClick={() => handleVote("resolved")}
            className={`flex-1 h-9 rounded-xl text-[11px] font-bold gap-1.5 cursor-pointer transition-all ${
              hasVoted === "resolved"
                ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-white/[0.06]"
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span>Sudah Lancar</span>
            <span className="px-1.5 py-0.2 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-[10px]">
              {incident.resolvedCount}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
