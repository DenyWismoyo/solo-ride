"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { motion, AnimatePresence } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  HeartHandshake, 
  X, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  Loader2, 
  EyeOff, 
  Eye,
  Calendar,
  Sparkles,
  PhoneCall,
  UserCheck,
  MessageCircleHeart
} from "lucide-react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";
import { playSuccessChime } from "@/lib/sound";

interface Dp3aCivicModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId?: string;
}

export function Dp3aCivicModal({ isOpen, onClose, serviceId = "dp3a_hotline_sahabat_perempuan" }: Dp3aCivicModalProps) {
  const router = useRouter();
  const { user, userData } = useAuthContext();

  const isCounselingMode = serviceId === "dp3a_konseling_puspaga";
  const [activeTab, setActiveTab] = useState<"hotline" | "puspaga">(isCounselingMode ? "puspaga" : "hotline");

  // Synchronize when serviceId changes
  useEffect(() => {
    if (serviceId === "dp3a_konseling_puspaga") {
      setActiveTab("puspaga");
    } else {
      setActiveTab("hotline");
    }
  }, [serviceId]);

  // Privacy States - Hotline Mode
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [anonymousCode] = useState(() => `Sahabat-${Math.floor(1000 + Math.random() * 9000)}`);
  const [caseType, setCaseType] = useState<string>("Kekerasan Fisik / KDRT");
  const [safeLocation, setSafeLocation] = useState(userData?.address || "Jl. Slamet Riyadi No. 120, Surakarta");
  const [needOnsiteSupport, setNeedOnsiteSupport] = useState(true);
  const [safeContactPhone, setSafeContactPhone] = useState(userData?.phone || "081234567891");
  const [briefSituation, setBriefSituation] = useState("");

  // Counseling Puspaga States
  const [counselingName, setCounselingName] = useState(userData?.displayName || "Warga Surakarta");
  const [counselingCategory, setCounselingCategory] = useState<string>("Konseling Pernikahan & Keluarga");
  const [preferredDate, setPreferredDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [preferredTimeSlot, setPreferredTimeSlot] = useState("09.00 - 11.00 WIB (Pagi)");
  const [counselingNotes, setCounselingNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmitHotline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Silakan login terlebih dahulu.");
      router.push("/login");
      return;
    }

    setIsSubmitting(true);
    try {
      const displayName = isAnonymous ? anonymousCode : (userData?.displayName || "Pemohon Terlindungi");

      const docRef = await addDoc(collection(db, COLLECTIONS.ORDERS), {
        customerId: user.uid,
        customerName: displayName,
        customerPhone: isAnonymous ? "RAHASIA (TERENKRIPSI)" : safeContactPhone,
        serviceType: "dp3a_hotline_sahabat_perempuan",
        serviceTitle: `[HOTLINE DP3A] ${caseType}`,
        targetRole: "government",
        additionalRole: "gov_dp3a",
        agencyName: "DP3APM Kota Surakarta",
        price: 0, // 100% Free Public Safety & Protection Service
        status: "pending_verification",
        pickupLocation: {
          address: "Pusat Pelayanan Terpadu DP3APM Surakarta",
          lat: -7.5695,
          lng: 110.8285
        },
        dropoffLocation: {
          address: safeLocation,
          lat: -7.5621,
          lng: 110.8547
        },
        citizenDetails: {
          isAnonymous,
          anonymousCode: isAnonymous ? anonymousCode : null,
          caseType,
          safeLocation,
          needOnsiteSupport,
          safeContactPhone,
          notes: briefSituation || "Laporan perlindungan darurat perempuan dan anak.",
          submittedAt: new Date().toISOString()
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      playSuccessChime();
      setCreatedOrderId(docRef.id);
    } catch (err: any) {
      console.error("Gagal mengirim laporan DP3A:", err);
      alert(`Gagal mengirim laporan: ${err.message || err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitPuspaga = async (e: React.FormEvent) => {
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
        customerName: counselingName,
        customerPhone: safeContactPhone,
        serviceType: "dp3a_konseling_puspaga",
        serviceTitle: `Konseling Puspaga: ${counselingCategory}`,
        targetRole: "government",
        additionalRole: "gov_dp3a",
        agencyName: "DP3APM (Puspaga Surakarta)",
        price: 0, // Free Public Counseling
        status: "pending_verification",
        pickupLocation: {
          address: "Puspaga Surakarta — Jl. Veteran No. 18, Surakarta",
          lat: -7.5755,
          lng: 110.8243
        },
        dropoffLocation: {
          address: "Gedung Layanan Konseling Puspaga Surakarta",
          lat: -7.5755,
          lng: 110.8243
        },
        citizenDetails: {
          counselingCategory,
          preferredDate,
          preferredTimeSlot,
          notes: counselingNotes || "Permohonan sesi konseling psikolog keluarga.",
          submittedAt: new Date().toISOString()
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      playSuccessChime();
      setCreatedOrderId(docRef.id);
    } catch (err: any) {
      console.error("Gagal menjadwalkan konseling Puspaga:", err);
      alert(`Gagal menjadwalkan: ${err.message || err}`);
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
          className="w-full max-w-lg bg-white dark:bg-[#0c1220] rounded-[2rem] border border-pink-500/30 dark:border-pink-500/20 p-5 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-pink-500/20 text-pink-600 dark:text-pink-400 border border-pink-500/30 flex items-center justify-center shrink-0 shadow-sm">
                <HeartHandshake className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    DP3APM Kota Surakarta
                  </h3>
                  <Badge variant="teal" size="sm">RAHASIA & AMAN</Badge>
                </div>
                <p className="text-[11px] text-pink-600 dark:text-pink-400 font-semibold mt-0.5">
                  Layanan Sahabat Perempuan & Anak 24 Jam
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

          {/* Privacy Reassurance Banner */}
          <div className="p-3 bg-gradient-to-r from-purple-800 via-pink-700 to-rose-700 rounded-2xl text-white space-y-2 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-pink-200" />
                <span className="text-xs font-black tracking-wide">Privasi Anda Terjamin 100%</span>
              </div>
              <a
                href="tel:119"
                className="px-2.5 py-1 bg-white text-pink-800 font-black text-[11px] rounded-lg shadow-sm active:scale-95"
              >
                Hotline 119 Ext 8
              </a>
            </div>
            <p className="text-[11px] opacity-90 leading-relaxed">
              Anda berada di ruang aman. Identitas Anda dapat disamarkan secara anonim dan ditangani oleh tim konselor profesional.
            </p>
          </div>

          {/* Mode Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-white/[0.04] rounded-2xl border border-slate-200/80 dark:border-white/[0.06]">
            <button
              type="button"
              onClick={() => setActiveTab("hotline")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "hotline"
                  ? "bg-pink-600 text-white shadow-md shadow-pink-600/30"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>💜 Hotline Perlindungan</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("puspaga")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "puspaga"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <MessageCircleHeart className="h-3.5 w-3.5" />
              <span>🌱 Konseling Puspaga</span>
            </button>
          </div>

          {/* Success State */}
          {createdOrderId ? (
            <div className="p-5 bg-pink-500/10 border border-pink-500/30 rounded-3xl text-center space-y-3 animate-in fade-in">
              <CheckCircle2 className="h-12 w-12 text-pink-500 mx-auto" />
              <div className="space-y-1">
                <h4 className="text-sm font-black text-pink-700 dark:text-pink-400">
                  {activeTab === "hotline" ? "Laporan Terkirim Aman ke Tim Sahabat DP3APM" : "Jadwal Konseling Puspaga Berhasil Diajukan"}
                </h4>
                <p className="text-xs text-slate-600 dark:text-zinc-300 max-w-sm mx-auto">
                  {activeTab === "hotline"
                    ? `Kode Kasus Anda: ${anonymousCode}. Tim Sahabat DP3APM akan segera merespons via kontak aman yang Anda tentukan.`
                    : "Konselor Puspaga akan mengkonfirmasi jadwal sesi Anda melalui pesan WhatsApp."}
                </p>
              </div>

              <div className="pt-2 flex gap-2">
                <Button
                  onClick={() => router.push(`/order/${createdOrderId}`)}
                  className="flex-1 h-11 bg-pink-600 hover:bg-pink-500 text-white font-black text-xs rounded-xl shadow-lg shadow-pink-600/30 cursor-pointer"
                >
                  Lihat Status Pendampingan
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
          ) : activeTab === "hotline" ? (
            /* HOTLINE SAHABAT PEREMPUAN (PRIVACY FIRST) */
            <form onSubmit={handleSubmitHotline} className="space-y-3.5">
              {/* Anonymous Mode Toggle Box */}
              <div className="p-3.5 bg-pink-500/10 border border-pink-500/20 rounded-2xl flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    {isAnonymous ? <EyeOff className="h-4 w-4 text-pink-600" /> : <Eye className="h-4 w-4 text-slate-500" />}
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      Mode Pelaporan Anonim
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                    {isAnonymous ? `Identitas disamarkan sebagai kode [${anonymousCode}]` : "Nama Anda akan terdaftar resmi"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAnonymous(!isAnonymous)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                    isAnonymous 
                      ? "bg-pink-600 text-white border-pink-500" 
                      : "bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-300 dark:border-zinc-700"
                  }`}
                >
                  {isAnonymous ? "Anonim Aktif" : "Buka Identitas"}
                </button>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                  Kategori Perlindungan
                </label>
                <select
                  value={caseType}
                  onChange={(e) => setCaseType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:border-pink-500"
                >
                  <option value="Kekerasan Fisik / KDRT">💔 Kekerasan Fisik Dalam Rumah Tangga (KDRT)</option>
                  <option value="Kekerasan Seksual & Pelecehan">🛡️ Kekerasan Seksual / Pelecehan</option>
                  <option value="Penelantaran & Hak Anak">👶 Penelantaran Anak & Balita / Kekerasan Anak</option>
                  <option value="Kekerasan Psikis & Pengancaman">⚠️ Teror, Intimidasi & Kekerasan Psikis</option>
                  <option value="Pencegahan TPPO">🚨 Indikasi Perdagangan Orang (TPPO)</option>
                  <option value="Konsultasi Hak Hukum & Mediasi">⚖️ Pendampingan Hukum & Hak Asuh</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                  Lokasi Aman Anda Saat Ini (Bukan Rumah jika Berbahaya)
                </label>
                <textarea
                  value={safeLocation}
                  onChange={(e) => setSafeLocation(e.target.value)}
                  rows={2}
                  placeholder="Contoh: Rumah orang tua / Kantor / Titik aman terdekat..."
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-pink-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    Kebutuhan Petugas
                  </label>
                  <select
                    value={needOnsiteSupport ? "ya" : "tidak"}
                    onChange={(e) => setNeedOnsiteSupport(e.target.value === "ya")}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-pink-500"
                  >
                    <option value="ya">🚨 Butuh Tim Datang</option>
                    <option value="tidak">💬 Cukup Konsultasi WA</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    No. WA Kontak Aman
                  </label>
                  <input
                    type="tel"
                    value={safeContactPhone}
                    onChange={(e) => setSafeContactPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-pink-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                  Catatan Singkat Tambahan (Opsional)
                </label>
                <input
                  type="text"
                  value={briefSituation}
                  onChange={(e) => setBriefSituation(e.target.value)}
                  placeholder="Tidak perlu tulis detail jika tidak nyaman..."
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <motion.div whileTap={{ scale: 0.96 }}>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 bg-gradient-to-r from-pink-600 via-purple-600 to-rose-600 hover:from-pink-500 hover:to-purple-500 text-white font-black text-xs rounded-xl shadow-lg shadow-pink-600/30 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Menghubungkan ke Tim Sahabat...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" /> Kirim Laporan ke Tim Sahabat DP3APM
                    </>
                  )}
                </Button>
              </motion.div>
            </form>
          ) : (
            /* KONSELING PUSPAGA */
            <form onSubmit={handleSubmitPuspaga} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                  Nama Pemohon / Kepala Keluarga
                </label>
                <input
                  type="text"
                  value={counselingName}
                  onChange={(e) => setCounselingName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                  Bidang Konseling Puspaga
                </label>
                <select
                  value={counselingCategory}
                  onChange={(e) => setCounselingCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:border-purple-500"
                >
                  <option value="Konseling Pernikahan & Keluarga">💍 Konseling Pernikahan, Keluarga & Mediasi</option>
                  <option value="Pola Asuh & Tumbuh Kembang Anak">👶 Konseling Pola Asuh (Parenting) & Anak</option>
                  <option value="Konseling Remaja & Masalah Emosional">🌱 Konseling Remaja & Trauma Healing</option>
                  <option value="Pendampingan Lansia & Keluarga Rentan">👵 Pendampingan Psikologis Lansia</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    Pilihan Tanggal Sesi
                  </label>
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    Slot Waktu
                  </label>
                  <select
                    value={preferredTimeSlot}
                    onChange={(e) => setPreferredTimeSlot(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-purple-500"
                  >
                    <option value="09.00 - 11.00 WIB (Pagi)">09.00 - 11.00 WIB</option>
                    <option value="13.00 - 15.00 WIB (Siang)">13.00 - 15.00 WIB</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                  Nomor WhatsApp untuk Konfirmasi Jadwal
                </label>
                <input
                  type="tel"
                  value={safeContactPhone}
                  onChange={(e) => setSafeContactPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                  Catatan Ringkas Masalah yang Ingin Dikonsultasikan
                </label>
                <textarea
                  value={counselingNotes}
                  onChange={(e) => setCounselingNotes(e.target.value)}
                  rows={2}
                  placeholder="Contoh: Diskusi pola komunikasi dengan anak remaja / Konsultasi pra-nikah..."
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <motion.div whileTap={{ scale: 0.96 }}>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-lg shadow-purple-600/30 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Mengajukan Jadwal Sesi...
                    </>
                  ) : (
                    <>
                      <Calendar className="h-4 w-4" /> Booking Sesi Konseling Puspaga (Gratis)
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
