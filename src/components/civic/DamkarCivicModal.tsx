"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { motion, AnimatePresence } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Flame, 
  X, 
  MapPin, 
  Phone, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2, 
  ShieldAlert, 
  Zap,
  PhoneCall,
  Sparkles,
  Bug,
  Compass,
  Radio
} from "lucide-react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";
import { playSuccessChime } from "@/lib/sound";

interface DamkarCivicModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId?: string;
}

export function DamkarCivicModal({ isOpen, onClose, serviceId = "damkar_panic_button" }: DamkarCivicModalProps) {
  const router = useRouter();
  const { user, userData } = useAuthContext();

  const isRescueMode = serviceId === "damkar_animal_rescue";
  const [activeTab, setActiveTab] = useState<"panic" | "rescue">(isRescueMode ? "rescue" : "panic");

  // Sync activeTab when serviceId prop changes
  useEffect(() => {
    if (serviceId === "damkar_animal_rescue") {
      setActiveTab("rescue");
    } else {
      setActiveTab("panic");
    }
  }, [serviceId]);

  // Form States - Panic Mode
  const [emergencyType, setEmergencyType] = useState<string>("Kebakaran Rumah / Gedung");
  const [emergencyLevel, setEmergencyLevel] = useState<"Kritis (Api Membesar)" | "Sedang" | "Asap Pekat">("Kritis (Api Membesar)");
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number; address: string }>({
    lat: -7.5695,
    lng: 110.8285,
    address: userData?.address || "Jl. Slamet Riyadi No. 445, Laweyan, Surakarta"
  });
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsDetected, setGpsDetected] = useState(false);
  const [citizenPhone, setCitizenPhone] = useState(userData?.phone || "081234567891");
  const [panicNotes, setPanicNotes] = useState("");

  // Form States - Rescue Mode
  const [rescueCategory, setRescueCategory] = useState<string>("Sarang Tawon Vespa");
  const [rescueLocation, setRescueLocation] = useState(userData?.address || "Jl. Kolonel Sutarto No. 45, Jebres, Surakarta");
  const [rescueNotes, setRescueNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  // Auto-detect GPS on open for panic mode
  useEffect(() => {
    if (isOpen && activeTab === "panic" && !gpsDetected && typeof navigator !== "undefined" && navigator.geolocation) {
      setIsDetectingGps(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsLocation(prev => ({
            ...prev,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          }));
          setIsDetectingGps(false);
          setGpsDetected(true);
        },
        (err) => {
          console.warn("GPS auto-detect failed:", err);
          setIsDetectingGps(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }, [isOpen, activeTab, gpsDetected]);

  if (!isOpen) return null;

  const handleManualGpsDetect = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      alert("Fitur Geolocation tidak didukung di perangkat Anda.");
      return;
    }
    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLocation(prev => ({
          ...prev,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        }));
        setIsDetectingGps(false);
        setGpsDetected(true);
      },
      (err) => {
        alert("Gagal mendeteksi lokasi GPS. Pastikan izin lokasi aktif.");
        setIsDetectingGps(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmitPanic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Silakan login terlebih dahulu untuk menyiagakan pos damkar.");
      router.push("/login");
      return;
    }

    setIsSubmitting(true);
    try {
      // Emergency mode directly sets status to 'pending' to bypass triage and immediately alert pos units
      const docRef = await addDoc(collection(db, COLLECTIONS.ORDERS), {
        customerId: user.uid,
        customerName: userData?.displayName || "Warga Surakarta (PANIC EMERGENCY)",
        customerPhone: citizenPhone,
        serviceType: "damkar_panic_button",
        serviceTitle: `[DARURAT DAMKAR] ${emergencyType}`,
        targetRole: "government",
        additionalRole: "gov_damkar",
        agencyName: "Dinas Pemadam Kebakaran Surakarta",
        price: 0, // 100% Free Public Safety Service
        status: "pending", // Direct dispatch radar
        pickupLocation: {
          address: "Pos Damkar Terdekat (Slamet Riyadi / Pedaringan)",
          lat: -7.5695,
          lng: 110.8285
        },
        dropoffLocation: {
          address: gpsLocation.address,
          lat: gpsLocation.lat,
          lng: gpsLocation.lng
        },
        citizenDetails: {
          emergencyType,
          urgencyLevel: emergencyLevel,
          locationDetail: gpsLocation.address,
          gpsCoords: { lat: gpsLocation.lat, lng: gpsLocation.lng },
          notes: panicNotes || "Permohonan armada siaga darurat kebakaran 24 jam.",
          isEmergency: true,
          submittedAt: new Date().toISOString()
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      playSuccessChime();
      setCreatedOrderId(docRef.id);
    } catch (err: any) {
      console.error("Gagal mengirim sinyal darurat Damkar:", err);
      alert(`Gagal mengirim sinyal darurat: ${err.message || err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitRescue = async (e: React.FormEvent) => {
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
        customerPhone: citizenPhone,
        serviceType: "damkar_animal_rescue",
        serviceTitle: `Damkar Rescue: ${rescueCategory}`,
        targetRole: "government",
        additionalRole: "gov_damkar",
        agencyName: "Dinas Pemadam Kebakaran Surakarta",
        price: 0, // Free Public Service
        status: "pending_verification",
        pickupLocation: {
          address: "Posko Animal Rescue & Evakuasi Damkar Kota Surakarta",
          lat: -7.5695,
          lng: 110.8285
        },
        dropoffLocation: {
          address: rescueLocation,
          lat: -7.5621,
          lng: 110.8547
        },
        citizenDetails: {
          emergencyType: rescueCategory,
          urgencyLevel: "Siaga Evakuasi Non-Api",
          locationDetail: rescueLocation,
          notes: rescueNotes || "Permohonan evakuasi non-api / animal rescue dinas damkar.",
          isEmergency: false,
          submittedAt: new Date().toISOString()
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      playSuccessChime();
      setCreatedOrderId(docRef.id);
    } catch (err: any) {
      console.error("Gagal mengirim permohonan Animal Rescue:", err);
      alert(`Gagal mengajukan: ${err.message || err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.92, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 15 }}
          transition={{ type: "spring", stiffness: 450, damping: 28 }}
          className="w-full max-w-lg bg-white dark:bg-[#0c1220] rounded-[2rem] border border-rose-500/30 dark:border-rose-500/20 p-5 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0 shadow-sm animate-pulse">
                <Flame className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Dinas Damkar & Penyelamatan
                  </h3>
                  <Badge variant="rose" size="sm">DARURAT 24 JAM</Badge>
                </div>
                <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold mt-0.5">
                  Posko Induk & 3 Pos Sektor Kota Surakarta
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

          {/* Quick Direct Hotline Banner */}
          <div className="p-3 bg-gradient-to-r from-rose-600 to-red-700 rounded-2xl text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <PhoneCall className="h-5 w-5 animate-bounce" />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider block opacity-90">Hotline Darurat Kebakaran</span>
                <span className="text-sm font-black tracking-wide">113 / (0271) 7630133</span>
              </div>
            </div>
            <a 
              href="tel:113"
              className="px-3 py-1.5 bg-white text-rose-700 hover:bg-rose-50 font-black text-xs rounded-xl shadow-sm transition-transform active:scale-95"
            >
              Panggil 113
            </a>
          </div>

          {/* Mode Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-white/[0.04] rounded-2xl border border-slate-200/80 dark:border-white/[0.06]">
            <button
              type="button"
              onClick={() => setActiveTab("panic")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "panic"
                  ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Flame className="h-3.5 w-3.5" />
              <span>🚨 Panic Kebakaran</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("rescue")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "rescue"
                  ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Bug className="h-3.5 w-3.5" />
              <span>🐝 Animal Rescue & Non-Api</span>
            </button>
          </div>

          {/* Success State */}
          {createdOrderId ? (
            <div className="p-5 bg-rose-500/10 border border-rose-500/30 rounded-3xl text-center space-y-3 animate-in fade-in">
              <div className="w-14 h-14 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto animate-pulse">
                <Radio className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-rose-700 dark:text-rose-400">
                  {activeTab === "panic" ? "🚨 SINYAL DARURAT DISIARKAN KE SELURUH POS DAMKAR!" : "✅ Permohonan Rescue Berhasil Diterima!"}
                </h4>
                <p className="text-xs text-slate-600 dark:text-zinc-300 max-w-sm mx-auto">
                  {activeTab === "panic"
                    ? "Pos Damkar terdekat sedang menyiapkan armada dan bergerak menuju koordinat GPS Anda. Tetap tenang dan amankan diri Anda."
                    : "Petugas posko Damkar Surakarta akan segera mengkonfirmasi dan menjadwalkan tim evakuasi ke lokasi Anda."}
                </p>
              </div>

              <div className="pt-2 flex gap-2">
                <Button
                  onClick={() => router.push(`/order/${createdOrderId}`)}
                  className="flex-1 h-11 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-lg shadow-rose-600/30 cursor-pointer"
                >
                  Lacak Status Respon Armada
                </Button>
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="h-11 text-xs rounded-xl cursor-pointer"
                >
                  Tutup
                </Button>
              </div>
            </div>
          ) : activeTab === "panic" ? (
            /* PANIC FORM - ULTRA RINGKAS */
            <form onSubmit={handleSubmitPanic} className="space-y-3.5">
              {/* GPS Live Status */}
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Compass className="h-4 w-4 text-rose-600 dark:text-rose-400 animate-spin" />
                    <span className="text-xs font-bold text-rose-700 dark:text-rose-300">
                      {gpsDetected ? "✅ Koordinat GPS Terkunci Presisi" : isDetectingGps ? "Mendeteksi Lokasi GPS..." : "Lokasi Titik Darurat"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleManualGpsDetect}
                    className="text-[10px] text-rose-600 dark:text-rose-400 font-bold hover:underline cursor-pointer"
                  >
                    Perbarui GPS
                  </button>
                </div>
                <div className="text-[11px] font-mono text-slate-700 dark:text-zinc-300 bg-white/60 dark:bg-black/40 p-2 rounded-xl border border-rose-500/20">
                  Lat: {gpsLocation.lat.toFixed(6)}, Lng: {gpsLocation.lng.toFixed(6)}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                  Kategori Insiden Darurat
                </label>
                <select
                  value={emergencyType}
                  onChange={(e) => setEmergencyType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:border-rose-500"
                >
                  <option value="Kebakaran Rumah / Gedung">🔥 Kebakaran Rumah / Ruko / Gedung</option>
                  <option value="Ledakan & Kebocoran Tabung Gas">💥 Ledakan & Kebocoran Gas LPG / Kimia</option>
                  <option value="Kebakaran Kendaraan Bermotor">🚗 Mobil / Motor Terbakar di Jalan</option>
                  <option value="Warga / Korban Terjebak Reruntuhan">⚠️ Korban Terjebak Reruntuhan / Bangunan Roboh</option>
                  <option value="Pohon / Tiang Listrik Terbakar">⚡ Tiang Listrik / Gardu PLN Meledak</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                  Alamat / Patokan Lokasi Terdekat
                </label>
                <input
                  type="text"
                  value={gpsLocation.address}
                  onChange={(e) => setGpsLocation(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Contoh: Jl. Slamet Riyadi No. 445 (Depan SPBU / Dekat Bank)..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    Tingkat Urgensi
                  </label>
                  <select
                    value={emergencyLevel}
                    onChange={(e) => setEmergencyLevel(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-rose-600 dark:text-rose-400 font-bold focus:outline-none focus:border-rose-500"
                  >
                    <option value="Kritis (Api Membesar)">🔴 Kritis (Api Membesar)</option>
                    <option value="Sedang">🟠 Sedang (Titik Api Terisolir)</option>
                    <option value="Asap Pekat">🟡 Asap Pekat Mencurigakan</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    Nomor WhatsApp Pelapor
                  </label>
                  <input
                    type="tel"
                    value={citizenPhone}
                    onChange={(e) => setCitizenPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-rose-500"
                    required
                  />
                </div>
              </div>

              {/* Big Haptic Tactile Emergency Button */}
              <motion.div whileTap={{ scale: 0.94 }}>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-14 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-rose-600/40 cursor-pointer flex items-center justify-center gap-2 border border-red-400/40"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" /> Menyiagakan Seluruh Armada Damkar...
                    </>
                  ) : (
                    <>
                      <Flame className="h-6 w-6 animate-pulse" /> SIAGAKAN DAMKAR SEKARANG (GRATIS)
                    </>
                  )}
                </Button>
              </motion.div>
            </form>
          ) : (
            /* RESCUE / NON-API FORM */
            <form onSubmit={handleSubmitRescue} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                  Kategori Penyelamatan Non-Api
                </label>
                <select
                  value={rescueCategory}
                  onChange={(e) => setRescueCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:border-amber-500"
                >
                  <option value="Sarang Tawon Vespa">🐝 Evakuasi Sarang Tawon Vespa / Lebah</option>
                  <option value="Ular Masuk Pemukiman">🐍 Tangkap Ular / Hewan Berbisa di Rumah</option>
                  <option value="Pelepasan Cincin Macet">💍 Pemotongan & Evakuasi Cincin Macet di Jari</option>
                  <option value="Hewan Terjebak di Sumur / Pohon">🐾 Penyelamatan Kucing / Hewan Terjebak di Sumur</option>
                  <option value="Inspeksi & Sertifikasi APAR UMKM">🧯 Permohonan Inspeksi Alat Pemadam APAR</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                  Alamat Lengkap Lokasi Evakuasi
                </label>
                <textarea
                  value={rescueLocation}
                  onChange={(e) => setRescueLocation(e.target.value)}
                  rows={2}
                  placeholder="Contoh: Jl. Kolonel Sutarto No. 45 RT 02 RW 05, Jebres (Dekat Balai Warga)..."
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                  Deskripsi Situasi / Karakteristik Objek
                </label>
                <textarea
                  value={rescueNotes}
                  onChange={(e) => setRescueNotes(e.target.value)}
                  rows={2}
                  placeholder="Contoh: Sarang tawon sebesar bola basket di atap teras genteng / Jari membengkak karena cincin perak..."
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                  Nomor Kontak WhatsApp Pemohon
                </label>
                <input
                  type="tel"
                  value={citizenPhone}
                  onChange={(e) => setCitizenPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-between">
                <span className="text-xs font-bold text-amber-700 dark:text-amber-300">Biaya Pelayanan</span>
                <span className="text-xs font-black text-amber-600 dark:text-amber-400">100% Gratis (Fasilitas Pemkot)</span>
              </div>

              <motion.div whileTap={{ scale: 0.96 }}>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Mengirimkan Permohonan...
                    </>
                  ) : (
                    <>
                      <Bug className="h-4 w-4" /> Ajukan Evakuasi Animal Rescue
                    </>
                  )}
                </Button>
              </motion.div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
