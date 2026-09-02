"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Navigation2, 
  Clock, 
  MapPin, 
  Phone, 
  MessageCircle, 
  ShieldAlert, 
  Sparkles, 
  Play, 
  Pause, 
  RotateCcw,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface LiveTrackingSimulatorProps {
  directions: google.maps.DirectionsResult | null;
  status?: string;
  driverName?: string;
  driverPhone?: string;
  vehiclePlate?: string;
  vehicleModel?: string;
  onPositionChange?: (pos: { lat: number; lng: number }, etaText: string, distanceText: string) => void;
}

export function LiveTrackingSimulator({
  directions,
  status = "accepted",
  driverName = "Slamet Raharjo",
  driverPhone = "081234567890",
  vehiclePlate = "AD 4821 QA",
  vehicleModel = "Honda Vario 160 Hitam",
  onPositionChange
}: LiveTrackingSimulatorProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [etaMinutes, setEtaMinutes] = useState(3);
  const [distanceMeters, setDistanceMeters] = useState(850);
  const pathPointsRef = useRef<{ lat: number; lng: number }[]>([]);

  // Extract path from directions
  useEffect(() => {
    if (!directions?.routes?.[0]?.overview_path) return;
    const path = directions.routes[0].overview_path.map((p) => ({
      lat: typeof p.lat === "function" ? p.lat() : (p as any).lat,
      lng: typeof p.lng === "function" ? p.lng() : (p as any).lng
    }));
    pathPointsRef.current = path;
    setCurrentIndex(0);
  }, [directions]);

  // Simulation timer tick
  useEffect(() => {
    if (!isPlaying || pathPointsRef.current.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const total = pathPointsRef.current.length;
        if (prev >= total - 1) {
          return prev; // Arrived
        }
        const next = prev + 1;
        const currentPos = pathPointsRef.current[next];
        
        // Calculate remaining ratio
        const remainingRatio = (total - next) / total;
        const newDist = Math.max(Math.round(remainingRatio * 1200), 50);
        const newEta = Math.max(Math.ceil(remainingRatio * 6), 1);

        setDistanceMeters(newDist);
        setEtaMinutes(newEta);

        if (onPositionChange && currentPos) {
          onPositionChange(
            currentPos, 
            `${newEta} mnt`, 
            newDist < 1000 ? `${newDist} m` : `${(newDist / 1000).toFixed(1)} km`
          );
        }

        return next;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isPlaying, onPositionChange]);

  const handleReset = () => {
    setCurrentIndex(0);
    setIsPlaying(true);
    if (pathPointsRef.current.length > 0 && onPositionChange) {
      onPositionChange(pathPointsRef.current[0], "4 mnt", "1.2 km");
    }
  };

  const isArrived = pathPointsRef.current.length > 0 && currentIndex >= pathPointsRef.current.length - 1;

  const isPhasePickup = status === "accepted";
  const phaseLabel = isPhasePickup ? "Driver Menuju Titik Jemput" : "Driver Mengantar ke Tujuan";

  return (
    <div className="space-y-3">
      {/* Live Driver Floating Banner */}
      <div className="sg-bento-card p-4 space-y-3 bg-white/95 dark:bg-[#0c1220]/95 backdrop-blur-xl border border-emerald-500/30 shadow-xl">
        {/* Status & ETA Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <Navigation2 className="h-4 w-4 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-slate-900 dark:text-white">
                  {phaseLabel}
                </span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <p className="text-[10px] text-slate-500 font-semibold">
                {isArrived 
                  ? "🎉 Driver telah tiba di lokasi!" 
                  : `Berjarak ${distanceMeters < 1000 ? `${distanceMeters}m` : `${(distanceMeters/1000).toFixed(1)}km`} · Tiba dalam ~${etaMinutes} menit`}
              </p>
            </div>
          </div>

          <Badge variant={isArrived ? "emerald" : "teal"} size="sm">
            {isArrived ? "Tiba" : `~${etaMinutes} mnt`}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-1000 ease-out"
            style={{
              width: `${pathPointsRef.current.length > 0 
                ? ((currentIndex + 1) / pathPointsRef.current.length) * 100 
                : 20}%`
            }}
          />
        </div>

        {/* Driver Profile & Action Row */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black flex items-center justify-center text-sm shadow-md">
              {driverName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-1">
                <p className="text-xs font-black text-slate-900 dark:text-white">
                  {driverName}
                </p>
                <span className="text-[9px] font-black text-amber-500 bg-amber-500/15 px-1 py-0.2 rounded-sm">
                  ⭐ 4.9
                </span>
              </div>
              <p className="text-[10px] font-mono font-bold text-slate-500">
                {vehiclePlate} · {vehicleModel}
              </p>
            </div>
          </div>

          {/* Quick Contact Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => window.open(`https://wa.me/62${driverPhone.replace(/^0/, "")}?text=Halo%20Mas%20${encodeURIComponent(driverName)},%20posisi%20jemput%20sudah%20sesuai%20titik%20ya`, "_blank")}
              className="p-2.5 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 transition-all cursor-pointer"
              title="Hubungi WhatsApp"
            >
              <MessageCircle className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => window.open(`tel:${driverPhone}`, "_self")}
              className="p-2.5 rounded-2xl bg-blue-500/15 hover:bg-blue-500/25 text-blue-600 dark:text-blue-400 border border-blue-500/30 transition-all cursor-pointer"
              title="Telepon Driver"
            >
              <Phone className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Simulation Controls (Dev & Interactive Preview) */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/[0.04] text-[10px] text-slate-400">
          <div className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-emerald-500" />
            <span>Simulasi GPS Presisi Solo</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 text-slate-600 dark:text-zinc-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              {isPlaying ? <Pause className="h-2.5 w-2.5" /> : <Play className="h-2.5 w-2.5" />}
              <span>{isPlaying ? "Jeda" : "Jalan"}</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="p-1 rounded-lg bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 text-slate-500 cursor-pointer"
              title="Ulangi Simulasi Rute"
            >
              <RotateCcw className="h-2.5 w-2.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
