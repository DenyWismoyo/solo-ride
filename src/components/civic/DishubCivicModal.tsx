"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrafficCone, 
  X, 
  MapPin, 
  Bus, 
  Bike, 
  Clock, 
  AlertTriangle, 
  Navigation, 
  ArrowRight,
  ShieldAlert
} from "lucide-react";

interface DishubCivicModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CFD_SHELTERS = [
  {
    id: "shelter-sriwedari",
    name: "Shelter 1: Sriwedari (Jl. Bhayangkara)",
    location: "Samping Taman Sriwedari & Museum Radya Pustaka",
    capacity: "25 Motor Mitra",
    status: "Buka Minggu 06.00 - 09.30"
  },
  {
    id: "shelter-gajahmada",
    name: "Shelter 2: Gajah Mada (Jl. Gajah Mada)",
    location: "Sirip Utara Slamet Riyadi dekat Hotel Novotel",
    capacity: "20 Motor Mitra",
    status: "Buka Minggu 06.00 - 09.30"
  },
  {
    id: "shelter-nonongan",
    name: "Shelter 3: Nonongan (Jl. Yos Sudarso)",
    location: "Akses Menuju Pasar Klewer & Kampung Kauman",
    capacity: "30 Motor Mitra",
    status: "Buka Minggu 06.00 - 09.30"
  },
  {
    id: "shelter-gendengan",
    name: "Shelter 4: Gendengan (Jl. Dr. Wahidin)",
    location: "Depan RS DKT Slamet Riyadi Purwosari",
    capacity: "15 Motor Mitra",
    status: "Buka Minggu 06.00 - 09.30"
  },
  {
    id: "shelter-gladak",
    name: "Shelter 5: Gladak (Bundaran Balai Kota)",
    location: "Pintu Masuk Keraton Kasunanan & PGS",
    capacity: "35 Motor Mitra",
    status: "Buka Minggu 06.00 - 09.30"
  }
];

const BST_FEEDERS = [
  {
    koridor: "Koridor 1",
    rute: "Bandara Adi Soemarmo - Terminal Tirtonadi - Palur",
    tarif: "Gratis Pelajar / Rp 3.700 Umum"
  },
  {
    koridor: "Koridor 2",
    rute: "Sub Terminal Kerten - UNS Solo - Palur",
    tarif: "Gratis Pelajar / Rp 3.700 Umum"
  },
  {
    koridor: "Feeder 7",
    rute: "Pasar Klewer - Ngipang - RSUD Dr. Moewardi",
    tarif: "Integrasi BST"
  }
];

export function DishubCivicModal({ isOpen, onClose }: DishubCivicModalProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"cfd" | "bst">("cfd");

  const handleOrderToShelter = (shelterName: string) => {
    onClose();
    router.push(`/services/ride?dropoff=${encodeURIComponent(shelterName)}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.92, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 450, damping: 28 }}
            className="w-full max-w-lg bg-white dark:bg-[#0c1220] rounded-[2rem] border border-slate-200/80 dark:border-white/[0.08] p-5 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-yellow-500/15 border border-yellow-500/30 text-yellow-600 dark:text-yellow-400 flex items-center justify-center shrink-0 shadow-sm">
                  <TrafficCone className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Shelter CFD & Integrasi BST Solo
                    </h3>
                    <Badge variant="amber" size="sm">Dishub Solo</Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Dinas Perhubungan Kota Surakarta • Manajemen Lalu Lintas
                  </p>
                </div>
              </div>

              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>

            {/* Tab Selector */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-white/[0.04] rounded-2xl">
              <button
                onClick={() => setActiveTab("cfd")}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === "cfd"
                    ? "bg-white dark:bg-white/[0.1] text-yellow-600 dark:text-yellow-400 shadow-sm"
                    : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <TrafficCone className="h-4 w-4" />
                <span>Peta Shelter CFD Solo</span>
              </button>

              <button
                onClick={() => setActiveTab("bst")}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === "bst"
                    ? "bg-white dark:bg-white/[0.1] text-yellow-600 dark:text-yellow-400 shadow-sm"
                    : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Bus className="h-4 w-4" />
                <span>Feeder & Halte BST</span>
              </button>
            </div>

            {/* TAB 1: SHELTER CFD SLAMET RIYADI */}
            {activeTab === "cfd" && (
              <div className="space-y-3">
                <div className="p-3.5 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-500/30 rounded-2xl text-xs text-yellow-900 dark:text-yellow-300 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-yellow-600" />
                  <span>
                    Saat Car Free Day (Minggu 06.00 - 09.30 WIB), Jl. Slamet Riyadi steril dari kendaraan bermotor. Ojek hanya dapat menjemput dan mengantar di 5 titik shelter sirip resmi Dishub Solo di bawah ini.
                  </span>
                </div>

                <div className="space-y-2.5">
                  {CFD_SHELTERS.map((s) => (
                    <div
                      key={s.id}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.05] space-y-2"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">{s.name}</h4>
                          <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">{s.location}</p>
                        </div>
                        <Badge variant="amber" size="sm">{s.capacity}</Badge>
                      </div>

                      <div className="pt-2 border-t border-slate-200/80 dark:border-white/[0.05] flex items-center justify-between">
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">{s.status}</span>
                        <motion.div whileTap={{ scale: 0.94 }}>
                          <Button
                            size="sm"
                            onClick={() => handleOrderToShelter(s.name)}
                            className="h-7 text-[10px] bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-bold rounded-lg cursor-pointer flex items-center gap-1"
                          >
                            <Bike className="h-3 w-3" /> Antar Saya ke Sini
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: INTEGRASI FEEDER BST */}
            {activeTab === "bst" && (
              <div className="space-y-3">
                <div className="p-3.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.05] rounded-2xl text-xs text-slate-600 dark:text-zinc-300">
                  Integrasikan perjalanan ojek lokal Anda dengan koridor utama Bus Batik Solo Trans (BST) dan Feeder untuk perjalanan lintas kota yang hemat dan teratur.
                </div>

                <div className="space-y-2.5">
                  {BST_FEEDERS.map((b, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.05] space-y-1"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{b.koridor}</span>
                        <Badge variant="blue" size="sm">{b.tarif}</Badge>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-zinc-300">{b.rute}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
