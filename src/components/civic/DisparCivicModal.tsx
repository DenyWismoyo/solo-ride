"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { motion, AnimatePresence } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  X, 
  MapPin, 
  Sparkles, 
  Compass, 
  Bike, 
  Clock, 
  Camera, 
  Landmark, 
  ArrowRight,
  CheckCircle2
} from "lucide-react";

interface DisparCivicModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SOLO_CULTURAL_EVENTS = [
  {
    title: "Kirab Pusaka Malam 1 Suro",
    date: "19 Juli 2026",
    location: "Keraton Kasunanan Surakarta",
    badge: "Sakral",
    desc: "Prosesi kirab kerbau bule Kiai Slamet dan pusaka keraton mengelilingi benteng Baluwarti."
  },
  {
    title: "Solo Batik Carnival XV",
    date: "15 Agustus 2026",
    location: "Jl. Slamet Riyadi - Balai Kota",
    badge: "Karnaval",
    desc: "Parade kostum mahakarya batik kontemporer kreasi desainer muda Solo sepanjang 3,8 km."
  },
  {
    title: "Mangkunegaran Performing Arts & Jazz",
    date: "12 September 2026",
    location: "Pamedan Pura Mangkunegaran",
    badge: "Musik",
    desc: "Harmoni gamelan keraton berpadu musik jazz nusantara di pelataran istana adipati."
  },
  {
    title: "Solo Great Sale (Diskon UMKM Serentak)",
    date: "1 - 31 Oktober 2026",
    location: "Seluruh Pasar Tradisional & Mall Solo",
    badge: "Diskon",
    desc: "Festival belanja tahunan diskon hingga 70% di pasar tradisional, hotel, dan sentra batik."
  }
];

const HERITAGE_ROUTES = [
  {
    id: "route-keraton",
    name: "Rute 1: Mahakarya Dua Istana Mataram",
    stops: ["Keraton Kasunanan Solo", "Museum Radya Pustaka", "Pura Mangkunegaran"],
    duration: "2 - 3 Jam",
    fare: 25000,
    desc: "Jelajahi sejarah kembar Mataram Islam, museum tertua di Indonesia, dan arsitektur Jawa-Eropa."
  },
  {
    id: "route-batik-antik",
    name: "Rute 2: Pasar Antik Triwindu & Kampung Batik Laweyan",
    stops: ["Pasar Barang Antik Triwindu", "Sentra Batik Laweyan", "Masjid Laweyan (1546 M)"],
    duration: "2 Jam",
    fare: 22000,
    desc: "Berburu gramofon kuno, keramik antik, dan menyusuri gang sempit saudagar batik era kerajaan."
  },
  {
    id: "route-kuliner-subuh",
    name: "Rute 3: Surga Kuliner Pasar Gede & Timlo",
    stops: ["Pasar Gede Hardjonagoro (Dawet Telasih)", "Timlo Sastro", "Kawasan Pecinan Balong"],
    duration: "1.5 Jam",
    fare: 18000,
    desc: "Eksplorasi cita rasa kuliner legendaris dan keharmonisan akulturasi budaya Jawa-Tionghoa Solo."
  }
];

export function DisparCivicModal({ isOpen, onClose }: DisparCivicModalProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"calendar" | "heritage">("calendar");

  const handleBookHeritageTour = (route: typeof HERITAGE_ROUTES[0]) => {
    onClose();
    router.push(`/services/ride?pickup=${encodeURIComponent(route.stops[0])}&dropoff=${encodeURIComponent(route.stops[route.stops.length - 1])}`);
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
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center shrink-0 shadow-sm">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Pariwisata & Heritage Solo
                    </h3>
                    <Badge variant="amber" size="sm">Dispar Solo</Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Dinas Kebudayaan & Pariwisata Kota Surakarta
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
                onClick={() => setActiveTab("calendar")}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === "calendar"
                    ? "bg-white dark:bg-white/[0.1] text-amber-600 dark:text-amber-400 shadow-sm"
                    : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Calendar className="h-4 w-4" />
                <span>Kalender Event Budaya</span>
              </button>

              <button
                onClick={() => setActiveTab("heritage")}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === "heritage"
                    ? "bg-white dark:bg-white/[0.1] text-amber-600 dark:text-amber-400 shadow-sm"
                    : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Compass className="h-4 w-4" />
                <span>Paket Ojek Heritage 1-Click</span>
              </button>
            </div>

            {/* TAB 1: KALENDER EVENT */}
            {activeTab === "calendar" && (
              <div className="space-y-3">
                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-500/30 rounded-2xl text-xs text-amber-900 dark:text-amber-300">
                  Jadwal agenda budaya dan festival pariwisata resmi Kota Solo tahun 2026. Datang dan nikmati pesona kearifan lokal Surakarta!
                </div>

                <div className="space-y-2.5">
                  {SOLO_CULTURAL_EVENTS.map((evt, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.05] space-y-1.5 hover:border-amber-500/50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{evt.title}</h4>
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                          {evt.badge}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[10px] text-slate-500 dark:text-zinc-400">
                        <span className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                          <Clock className="h-3 w-3" /> {evt.date}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {evt.location}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 dark:text-zinc-300 leading-snug">
                        {evt.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: PAKET OJEK HERITAGE */}
            {activeTab === "heritage" && (
              <div className="space-y-3">
                <div className="p-3.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.05] rounded-2xl text-xs text-slate-600 dark:text-zinc-300">
                  Pilih rute wisata heritage terfavorit Solo. Driver mitra kami siap menjadi pemandu ramah yang mengantar Anda keliling destinasi bersejarah.
                </div>

                <div className="space-y-3">
                  {HERITAGE_ROUTES.map((r) => (
                    <div
                      key={r.id}
                      className="p-4 rounded-2xl bg-white dark:bg-[#11192e] border border-slate-200/80 dark:border-white/[0.08] space-y-2.5 shadow-sm hover:border-amber-500 transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">{r.name}</h4>
                          <p className="text-[10px] text-slate-500 dark:text-zinc-400">Estimasi Durasi: {r.duration}</p>
                        </div>
                        <span className="text-xs font-black text-amber-600 dark:text-amber-400">
                          Rp {r.fare.toLocaleString("id-ID")}
                        </span>
                      </div>

                      <div className="p-2.5 bg-slate-50 dark:bg-black/30 rounded-xl space-y-1 text-xs">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Destinasi yang Disinggahi:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {r.stops.map((stop, i) => (
                            <span key={i} className="text-[10px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-lg border border-amber-500/20">
                              {i + 1}. {stop}
                            </span>
                          ))}
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-600 dark:text-zinc-300">{r.desc}</p>

                      <motion.div whileTap={{ scale: 0.98 }}>
                        <Button
                          onClick={() => handleBookHeritageTour(r)}
                          className="w-full h-9 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Bike className="h-3.5 w-3.5" /> Pesan Ojek Rute Heritage Ini
                        </Button>
                      </motion.div>
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
