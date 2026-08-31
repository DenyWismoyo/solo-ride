"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { motion, AnimatePresence } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Waves, 
  X, 
  MapPin, 
  Phone, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2, 
  ShieldAlert, 
  Activity,
  Radio,
  Tent,
  Package,
  Ship,
  PhoneCall,
  Compass,
  Sparkles
} from "lucide-react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";
import { playSuccessChime } from "@/lib/sound";

interface BpbdCivicModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId?: string;
}

export function BpbdCivicModal({ isOpen, onClose, serviceId = "bpbd_peringatan_dini_banjir" }: BpbdCivicModalProps) {
  const router = useRouter();
  const { user, userData } = useAuthContext();

  const [activeTab, setActiveTab] = useState<"ews" | "relief">("ews");

  // Form State - Emergency Relief Request
  const [disasterType, setDisasterType] = useState("Banjir Luapan Sungai");
  const [affectedLocation, setAffectedLocation] = useState(userData?.address || "Kel. Semanggi, Pasar Kliwon, Surakarta");
  const [affectedKK, setAffectedKK] = useState("15");
  const [selectedReliefItems, setSelectedReliefItems] = useState<string[]>([
    "Terpal & Tenda Darurat",
    "Makanan Siap Saji & Air Bersih"
  ]);
  const [contactPersonPhone, setContactPersonPhone] = useState(userData?.phone || "081234567891");
  const [emergencyNotes, setEmergencyNotes] = useState("");
  
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number }>({
    lat: -7.5833,
    lng: 110.8456
  });
  const [isDetectingGps, setIsDetectingGps] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleReliefItem = (item: string) => {
    setSelectedReliefItems(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const handleGpsDetect = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
        setIsDetectingGps(false);
      },
      () => setIsDetectingGps(false),
      { enableHighAccuracy: true }
    );
  };

  const handleSubmitRelief = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Silakan login terlebih dahulu.");
      router.push("/login");
      return;
    }

    if (selectedReliefItems.length === 0) {
      alert("Pilih minimal satu jenis logistik bantuan yang dibutuhkan.");
      return;
    }

    setIsSubmitting(true);
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.ORDERS), {
        customerId: user.uid,
        customerName: userData?.displayName || "Warga Terdampak Bencana",
        customerPhone: contactPersonPhone,
        serviceType: "bpbd_peringatan_dini_banjir",
        serviceTitle: `[BANTUAN BPBD] ${disasterType} (${affectedKK} KK)`,
        targetRole: "government",
        additionalRole: "gov_bpbd",
        agencyName: "BPBD Kota Surakarta",
        price: 0, // 100% Free Public Safety Relief
        status: "pending_verification",
        pickupLocation: {
          address: "Gudang Logistik & Posko Induk BPBD Surakarta",
          lat: -7.5695,
          lng: 110.8285
        },
        dropoffLocation: {
          address: affectedLocation,
          lat: gpsLocation.lat,
          lng: gpsLocation.lng
        },
        citizenDetails: {
          disasterType,
          affectedLocation,
          affectedResidentsCount: parseInt(affectedKK) || 1,
          reliefItemNeeded: selectedReliefItems.join(", "),
          selectedReliefItems,
          notes: emergencyNotes || `Permohonan logistik bencana untuk ${affectedKK} KK di ${affectedLocation}.`,
          submittedAt: new Date().toISOString()
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      playSuccessChime();
      setCreatedOrderId(docRef.id);
    } catch (err: any) {
      console.error("Gagal mengirim permohonan bantuan BPBD:", err);
      alert(`Gagal mengirim permohonan: ${err.message || err}`);
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
          className="w-full max-w-lg bg-white dark:bg-[#0c1220] rounded-[2rem] border border-teal-500/30 dark:border-teal-500/20 p-5 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-500/30 flex items-center justify-center shrink-0 shadow-sm">
                <Waves className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    BPBD Kota Surakarta
                  </h3>
                  <Badge variant="teal" size="sm">SIAGA BENCANA</Badge>
                </div>
                <p className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold mt-0.5">
                  Pusdalops Penanggulangan Bencana 24 Jam
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

          {/* Quick Hotline BPBD Banner */}
          <div className="p-3 bg-gradient-to-r from-teal-700 via-emerald-700 to-teal-800 rounded-2xl text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <PhoneCall className="h-5 w-5 animate-pulse" />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider block opacity-90">Hotline Posko Induk BPBD</span>
                <span className="text-sm font-black tracking-wide">(0271) 711091 / 0812-2591-1199</span>
              </div>
            </div>
            <a 
              href="tel:0271711091"
              className="px-3 py-1.5 bg-white text-teal-800 hover:bg-teal-50 font-black text-xs rounded-xl shadow-sm transition-transform active:scale-95"
            >
              Telepon
            </a>
          </div>

          {/* Mode Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-white/[0.04] rounded-2xl border border-slate-200/80 dark:border-white/[0.06]">
            <button
              type="button"
              onClick={() => setActiveTab("ews")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "ews"
                  ? "bg-teal-600 text-white shadow-md shadow-teal-600/30"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Activity className="h-3.5 w-3.5" />
              <span>🌊 Radar EWS Banjir</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("relief")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "relief"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Tent className="h-3.5 w-3.5" />
              <span>📦 Bantuan Darurat Bencana</span>
            </button>
          </div>

          {/* Success State */}
          {createdOrderId ? (
            <div className="p-5 bg-teal-500/10 border border-teal-500/30 rounded-3xl text-center space-y-3 animate-in fade-in">
              <CheckCircle2 className="h-12 w-12 text-teal-500 mx-auto" />
              <div className="space-y-1">
                <h4 className="text-sm font-black text-teal-700 dark:text-teal-400">
                  Permohonan Bantuan Darurat Diterima BPBD!
                </h4>
                <p className="text-xs text-slate-600 dark:text-zinc-300 max-w-sm mx-auto">
                  Petugas Pusdalops BPBD Surakarta sedang memverifikasi titik lokasi dan menyiapkan armada distribusi logistik darurat ke lokasi Anda.
                </p>
              </div>

              <div className="pt-2 flex gap-2">
                <Button
                  onClick={() => router.push(`/order/${createdOrderId}`)}
                  className="flex-1 h-11 bg-teal-600 hover:bg-teal-500 text-white font-black text-xs rounded-xl shadow-lg shadow-teal-600/30 cursor-pointer"
                >
                  Lacak Distribusi Logistik
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
          ) : activeTab === "ews" ? (
            /* EWS RADAR MONITOR TAB */
            <div className="space-y-4">
              <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Radio className="h-4 w-4 text-teal-600 dark:text-teal-400 animate-pulse" />
                  <span className="text-xs font-bold text-teal-800 dark:text-teal-300">
                    Status Telemetri EWS Bengawan Solo Realtime
                  </span>
                </div>
                <Badge variant="emerald" size="sm">NORMAL (SIAGA HIJAU)</Badge>
              </div>

              {/* River Telemetry Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] rounded-2xl space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Sungai Bengawan Solo (Jurug)
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">7.42 m</span>
                    <span className="text-[10px] text-slate-500">(Batas Siaga: 9.00 m)</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold block">🟢 Level Aman</span>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] rounded-2xl space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Kali Pepe (Tirtonadi)
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">2.10 m</span>
                    <span className="text-[10px] text-slate-500">(Batas Siaga: 3.50 m)</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold block">🟢 Aliran Terkendali</span>
                </div>
              </div>

              {/* Flood Hazard Alert Zones */}
              <div className="p-4 bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-teal-600" />
                    Peta Zona Rawan Genangan Surakarta
                  </h4>
                  <span className="text-[10px] text-slate-500">Pembaruan: Hari Ini</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-black/20 border border-slate-200/60 dark:border-white/[0.04]">
                    <span className="font-semibold text-slate-700 dark:text-zinc-300">Semanggi & Sangkrah (Pasar Kliwon)</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600">Siaga Normal</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-black/20 border border-slate-200/60 dark:border-white/[0.04]">
                    <span className="font-semibold text-slate-700 dark:text-zinc-300">Gandekan & Sewu (Jebres)</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600">Siaga Normal</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-black/20 border border-slate-200/60 dark:border-white/[0.04]">
                    <span className="font-semibold text-slate-700 dark:text-zinc-300">Banyuanyar & Nusukan (Banjarsari)</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600">Siaga Normal</span>
                  </div>
                </div>
              </div>

              <Button
                type="button"
                onClick={() => setActiveTab("relief")}
                className="w-full h-11 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <Tent className="h-4 w-4" />
                Ajukan Permohonan Bantuan Darurat Logistik
              </Button>
            </div>
          ) : (
            /* RELIEF REQUEST FORM */
            <form onSubmit={handleSubmitRelief} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                  Jenis Bencana / Kondisi Darurat
                </label>
                <select
                  value={disasterType}
                  onChange={(e) => setDisasterType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:border-teal-500"
                >
                  <option value="Banjir Luapan Sungai">🌊 Banjir Luapan Sungai / Genangan Pemukiman</option>
                  <option value="Angin Puting Beliung">🌪️ Angin Puting Beliung & Atap Roboh</option>
                  <option value="Tanggul Sungai Kritis">⚠️ Tanggul Sungai Kritis / Rembes</option>
                  <option value="Pohon Tumbang Menutup Jalan">🌳 Pohon Tumbang Menutup Akses Evakuasi</option>
                  <option value="Tanah Longsor Bantaran">⛰️ Longsor Bantaran Sungai</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">
                    Alamat / Titik Wilayah Terdampak
                  </label>
                  <button
                    type="button"
                    onClick={handleGpsDetect}
                    className="text-[10px] text-teal-600 dark:text-teal-400 font-bold hover:underline cursor-pointer"
                  >
                    {isDetectingGps ? "Mendeteksi GPS..." : "📍 Kunci GPS"}
                  </button>
                </div>
                <textarea
                  value={affectedLocation}
                  onChange={(e) => setAffectedLocation(e.target.value)}
                  rows={2}
                  placeholder="Contoh: RT 03 RW 08 Kelurahan Semanggi, Pasar Kliwon (Dekat Tanggul)..."
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    Estimasi Jumlah KK Terdampak
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={affectedKK}
                    onChange={(e) => setAffectedKK(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    No. WhatsApp Kontak Siaga
                  </label>
                  <input
                    type="tel"
                    value={contactPersonPhone}
                    onChange={(e) => setContactPersonPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>
              </div>

              {/* Relief Item Checklist */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1.5">
                  Pilih Kebutuhan Bantuan Mendesak:
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    "Terpal & Tenda Darurat",
                    "Makanan Siap Saji & Air Bersih",
                    "Selimut & Pakaian Kering",
                    "Perahu Karet & Pelampung",
                    "Obat-obatan P3K & Sanitasi",
                    "Penyedot Pompa Alkon"
                  ].map((item) => {
                    const isSelected = selectedReliefItems.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleReliefItem(item)}
                        className={`p-2 rounded-xl text-[11px] font-semibold text-left border transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? "bg-teal-500/15 text-teal-800 dark:text-teal-300 border-teal-500"
                            : "bg-slate-50 dark:bg-white/[0.02] text-slate-600 dark:text-zinc-400 border-slate-200/80 dark:border-white/[0.06]"
                        }`}
                      >
                        <span className="text-xs">{isSelected ? "✅" : "⚪"}</span>
                        <span className="truncate">{item}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                  Catatan Kebutuhan Tambahan
                </label>
                <input
                  type="text"
                  value={emergencyNotes}
                  onChange={(e) => setEmergencyNotes(e.target.value)}
                  placeholder="Contoh: Ada 3 lansia butuh evakuasi / Listrik padam total..."
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <motion.div whileTap={{ scale: 0.96 }}>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-black text-xs rounded-xl shadow-lg shadow-teal-600/30 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Mengirimkan ke Pusdalops BPBD...
                    </>
                  ) : (
                    <>
                      <Waves className="h-4 w-4" /> Kirim Permohonan Logistik Bencana (Gratis)
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
