"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
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
  ShieldAlert,
  Send,
  Loader2,
  CheckCircle2,
  FileCheck2
} from "lucide-react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";
import { playSuccessChime } from "@/lib/sound";

interface DishubCivicModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId?: string;
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

export function DishubCivicModal({ isOpen, onClose, serviceId = "dishub_cfd_shelter" }: DishubCivicModalProps) {
  const router = useRouter();
  const { user, userData } = useAuthContext();

  const [activeTab, setActiveTab] = useState<"cfd" | "lapor" | "bst">("cfd");

  // Sync tab with serviceId
  useEffect(() => {
    if (serviceId === "dishub_lapor_jalan" || serviceId === "dishub_kir_digital") {
      setActiveTab("lapor");
    } else {
      setActiveTab("cfd");
    }
  }, [serviceId]);

  // Form State - Lapor Lalin / Jalan Rusak
  const [reportType, setReportType] = useState("Lampu Lalu Lintas Padam / Eror");
  const [reportLocation, setReportLocation] = useState("Perempatan Gladak Slamet Riyadi, Surakarta");
  const [reportDescription, setReportDescription] = useState("");
  const [reporterPhone, setReporterPhone] = useState(userData?.phone || "081234567891");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  const handleOrderToShelter = (shelterName: string) => {
    onClose();
    router.push(`/services/ride?dropoff=${encodeURIComponent(shelterName)}`);
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Silakan login terlebih dahulu.");
      router.push("/login");
      return;
    }

    setIsSubmitting(true);
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.ORDERS), {
        customerId: user.uid,
        customerName: userData?.displayName || "Warga Surakarta",
        customerPhone: reporterPhone,
        serviceType: "dishub_lapor_jalan",
        serviceTitle: `[LAPOR DISHUB] ${reportType}`,
        targetRole: "government",
        additionalRole: "gov_dishub",
        agencyName: "Dinas Perhubungan Kota Surakarta",
        price: 0,
        status: "pending_verification",
        pickupLocation: {
          address: "Posko Dishub Kota Surakarta (Jl. Menteri Supeno No. 7)",
          lat: -7.5695,
          lng: 110.8285
        },
        dropoffLocation: {
          address: reportLocation,
          lat: -7.5621,
          lng: 110.8547
        },
        citizenDetails: {
          reportType,
          location: reportLocation,
          description: reportDescription || "Laporan kondisi jalan / lampu lalu lintas Dishub Solo.",
          submittedAt: new Date().toISOString()
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      playSuccessChime();
      setCreatedOrderId(docRef.id);
    } catch (err: any) {
      console.error("Gagal mengirim laporan Dishub:", err);
      alert(`Gagal: ${err.message || err}`);
    } finally {
      setIsSubmitting(false);
    }
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
                      Dishub Kota Surakarta
                    </h3>
                    <Badge variant="amber" size="sm">LALU LINTAS</Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Dinas Perhubungan Surakarta • Manajemen Lalu Lintas & Shelter
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
                type="button"
                onClick={() => setActiveTab("cfd")}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  activeTab === "cfd"
                    ? "bg-white dark:bg-white/[0.1] text-yellow-600 dark:text-yellow-400 shadow-sm"
                    : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <TrafficCone className="h-3.5 w-3.5" />
                <span>Shelter CFD</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("lapor")}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  activeTab === "lapor"
                    ? "bg-white dark:bg-white/[0.1] text-yellow-600 dark:text-yellow-400 shadow-sm"
                    : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Lapor Lalin</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("bst")}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  activeTab === "bst"
                    ? "bg-white dark:bg-white/[0.1] text-yellow-600 dark:text-yellow-400 shadow-sm"
                    : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Bus className="h-3.5 w-3.5" />
                <span>Feeder BST</span>
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

            {/* TAB 2: LAPOR LALIN / JALAN RUSAK */}
            {activeTab === "lapor" && (
              createdOrderId ? (
                <div className="p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-3xl text-center space-y-3 animate-in fade-in">
                  <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                      Laporan Lalu Lintas Berhasil Diterima Dishub!
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-zinc-300 max-w-sm mx-auto">
                      Petugas Patroli Lalu Lintas Dishub Surakarta akan segera mengecek dan menindaklanjuti titik lokasi yang Anda laporkan.
                    </p>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <Button
                      onClick={() => router.push(`/order/${createdOrderId}`)}
                      className="flex-1 h-10 bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-bold text-xs rounded-xl"
                    >
                      Lacak Status Laporan
                    </Button>
                    <Button
                      variant="outline"
                      onClick={onClose}
                      className="h-10 text-xs rounded-xl"
                    >
                      Tutup
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitReport} className="space-y-3.5">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                      Jenis Laporan / Gangguan Lalu Lintas
                    </label>
                    <select
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:border-yellow-500"
                    >
                      <option value="Lampu Lalu Lintas Padam / Eror">🚦 Lampu Lalu Lintas Padam / Eror / Berkedip Kuning</option>
                      <option value="Kemacetan Parah Tak Terurai">🚗 Kemacetan Parah Membutuhkan Pengaturan Petugas</option>
                      <option value="Rambu / Pembatas Jalan Rusak">🚏 Rambu / Traffic Cone / Water Barrier Rusak / Roboh</option>
                      <option value="Parkir Liar Menutup Lajur">⛔ Parkir Liar Menutup Sebagian Badan Jalan</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                      Lokasi Titik Persimpangan / Ruas Jalan
                    </label>
                    <input
                      type="text"
                      value={reportLocation}
                      onChange={(e) => setReportLocation(e.target.value)}
                      placeholder="Contoh: Perempatan Kerten, Jl. Slamet Riyadi..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-yellow-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                      Deskripsi Situasi Singkat
                    </label>
                    <textarea
                      value={reportDescription}
                      onChange={(e) => setReportDescription(e.target.value)}
                      rows={2}
                      placeholder="Contoh: Lampu merah dari arah timur mati total, arus kendaraan saling serobot..."
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-yellow-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                      Nomor WhatsApp Pelapor
                    </label>
                    <input
                      type="tel"
                      value={reporterPhone}
                      onChange={(e) => setReporterPhone(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-yellow-500"
                      required
                    />
                  </div>

                  <motion.div whileTap={{ scale: 0.96 }}>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-11 bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Mengirim Laporan...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" /> Kirim Laporan ke Petugas Dishub
                        </>
                      )}
                    </Button>
                  </motion.div>
                </form>
              )
            )}

            {/* TAB 3: INTEGRASI FEEDER BST */}
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
