"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { CivicSubServiceFormProps } from "../types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, ChevronRight, Bike, Compass } from "lucide-react";

const CFD_SHELTERS = [
  { id: "sriwedari", name: "Shelter 1: Sriwedari (Taman Sriwedari)", desc: "Akses Museum Radya Pustaka & Stadion Sriwedari", tag: "Paling Ramai" },
  { id: "gajahmada", name: "Shelter 2: Gajah Mada (Novotel)", desc: "Sirip Utara Slamet Riyadi dekat Sentra Kuliner", tag: "Feeder BST" },
  { id: "nonongan", name: "Shelter 3: Nonongan (Yos Sudarso)", desc: "Akses Pasar Klewer, Kauman & Kampung Batik", tag: "Pusat Batik" },
  { id: "gladak", name: "Shelter 4: Gladak (Balai Kota)", desc: "Pintu Masuk Keraton Kasunanan & Benteng Vastenburg", tag: "Pusat Heritage" }
];

export function DishubCfdShelterView({ agency, service, onCancel }: CivicSubServiceFormProps) {
  const router = useRouter();

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
          <Compass className="h-4 w-4" />
          <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
            Titik Shelter Ojek Resmi CFD Slamet Riyadi
          </span>
        </div>
        <Badge variant="blue" size="sm" className="text-[9px]">Minggu 06:00 - 09:30</Badge>
      </div>

      <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
        Pilih shelter penurunan di luar batas garis steril CFD untuk diantar langsung oleh driver mitra Ride-Solo:
      </p>

      <div className="space-y-2.5">
        {CFD_SHELTERS.map((s) => (
          <div 
            key={s.id} 
            className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.06] flex items-center justify-between gap-3 hover:border-blue-500/50 transition-all"
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{s.name}</h4>
                <span className="text-[9px] font-semibold px-1.5 py-0.2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-md">
                  {s.tag}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400">{s.desc}</p>
            </div>

            <Button
              size="sm"
              onClick={() => router.push(`/services/ride?dropoff=${encodeURIComponent(s.name)}`)}
              className="text-[11px] font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-8 px-3 cursor-pointer shrink-0 shadow-xs"
            >
              <span>Pesan Ojek</span>
              <ChevronRight className="h-3 w-3 ml-0.5" />
            </Button>
          </div>
        ))}
      </div>

      <div className="pt-2">
        <Button
          variant="outline"
          onClick={onCancel}
          className="w-full rounded-xl text-xs font-bold border-slate-200 dark:border-zinc-700 cursor-pointer"
        >
          Kembali ke Portal Dishub
        </Button>
      </div>
    </div>
  );
}
