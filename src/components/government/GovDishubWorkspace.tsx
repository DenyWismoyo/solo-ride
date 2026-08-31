"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrafficCone, 
  Bus, 
  Bike, 
  MapPin, 
  AlertTriangle, 
  ShieldCheck, 
  TrendingUp, 
  Users,
  Clock
} from "lucide-react";

export function GovDishubWorkspace() {
  const [shelters, setShelters] = useState([
    {
      id: "sh-1",
      name: "Shelter Sriwedari (Jl. Bhayangkara)",
      capacity: "25 Motor",
      activeDrivers: 18,
      status: "Siap CFD",
      location: "Samping Taman Sriwedari"
    },
    {
      id: "sh-2",
      name: "Shelter Gajah Mada (Jl. Gajah Mada)",
      capacity: "20 Motor",
      activeDrivers: 14,
      status: "Siap CFD",
      location: "Sirip Utara Slamet Riyadi"
    },
    {
      id: "sh-3",
      name: "Shelter Nonongan (Jl. Yos Sudarso)",
      capacity: "30 Motor",
      activeDrivers: 24,
      status: "Siap CFD",
      location: "Akses Pasar Klewer & Kauman"
    },
    {
      id: "sh-4",
      name: "Shelter Gladak (Bundaran PGS)",
      capacity: "35 Motor",
      activeDrivers: 28,
      status: "Siap CFD",
      location: "Pintu Masuk Keraton & PGS"
    }
  ]);

  return (
    <div className="space-y-5">
      {/* 1. METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-yellow-600 dark:text-yellow-400 font-bold uppercase tracking-wider">Status CFD Slamet Riyadi</span>
          <div className="text-sm font-black text-yellow-600 dark:text-yellow-400 mt-1">Steril 06.00-09.30</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Shelter Ojek Resmi</span>
          <div className="text-xl font-black text-slate-900 dark:text-white">5 Titik Sirip</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">Armada BST Beroperasi</span>
          <div className="text-xl font-black text-blue-600 dark:text-blue-400">45 Bus & Feeder</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-center space-y-0.5">
          <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold uppercase tracking-wider">Kondisi Lalin Kota</span>
          <div className="text-sm font-black text-teal-600 dark:text-teal-400 mt-1">Lancar Terkendali</div>
        </div>
      </div>

      {/* 2. CFD SHELTER MANAGEMENT */}
      <div className="sg-card p-4 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 space-y-3.5 shadow-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <TrafficCone className="h-5 w-5 text-yellow-500" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Manajemen Shelter Ojek Mitra Car Free Day (CFD)
            </h3>
          </div>
          <Badge variant="amber" size="sm">Minggu Pagi</Badge>
        </div>

        <div className="space-y-2.5">
          {shelters.map((sh) => (
            <div
              key={sh.id}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 space-y-1.5"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{sh.name}</h4>
                  <p className="text-[10px] text-slate-500">{sh.location}</p>
                </div>
                <Badge variant="emerald" size="sm">{sh.status}</Badge>
              </div>

              <div className="flex justify-between items-center pt-1 border-t border-slate-200 dark:border-zinc-700 text-[10px] text-slate-500">
                <span>Kapasitas: <strong>{sh.capacity}</strong></span>
                <span className="text-yellow-600 dark:text-yellow-400 font-bold">
                  {sh.activeDrivers} Driver Standby
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. BST FEEDER INTEGRATION */}
      <div className="sg-card p-4 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 space-y-3 shadow-sm">
        <div className="flex items-center gap-2">
          <Bus className="h-5 w-5 text-blue-500" />
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Integrasi Angkutan Massal Feeder Batik Solo Trans
          </h3>
        </div>

        <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
          Sistem Ride-Solo terhubung dengan simpul halte BST Solo untuk rute terintegrasi ojek antar-jemput *first-mile* dan *last-mile* ke stasiun dan terminal utama.
        </p>
      </div>
    </div>
  );
}
