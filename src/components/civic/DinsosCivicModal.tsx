"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { motion, AnimatePresence } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  HeartHandshake, 
  X, 
  QrCode, 
  Accessibility, 
  CheckCircle2, 
  Loader2, 
  MapPin, 
  Phone, 
  Sparkles, 
  Store, 
  ShieldCheck,
  Calendar
} from "lucide-react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";

interface DinsosCivicModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DinsosCivicModal({ isOpen, onClose }: DinsosCivicModalProps) {
  const router = useRouter();
  const { user, userData } = useAuthContext();

  const [activeTab, setActiveTab] = useState<"voucher" | "difabel">("voucher");

  // Voucher Form State
  const [dtksNumber, setDtksNumber] = useState("");
  const [targetMarket, setTargetMarket] = useState("Pasar Gede Surakarta");
  const [voucherClaimed, setVoucherClaimed] = useState(false);
  const [voucherCode] = useState(() => `BANSOS-SOLO-${Math.floor(100000 + Math.random() * 900000)}`);

  // Difabel Booking Form State
  const [passengerType, setPassengerType] = useState<"Lansia" | "Disabilitas Fisik (Kursi Roda)" | "Disabilitas Netra / Rungu">("Lansia");
  const [pickupAddress, setPickupAddress] = useState(userData?.address || "Jl. Slamet Riyadi No. 120, Surakarta");
  const [destinationAddress, setDestinationAddress] = useState("RSUD Dr. Moewardi Solo (Poli Rawat Jalan)");
  const [companionName, setCompanionName] = useState(userData?.displayName || "Warga Solo");
  const [companionPhone, setCompanionPhone] = useState(userData?.phone || "081234567891");
  const [needWheelchairSupport, setNeedWheelchairSupport] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  const handleClaimVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dtksNumber.trim()) {
      alert("Masukkan No. Kartu Keluarga / DTKS / KIS yang terdaftar.");
      return;
    }
    setVoucherClaimed(true);
  };

  const handleOrderDifabelRide = async (e: React.FormEvent) => {
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
        customerName: companionName,
        customerPhone: companionPhone,
        serviceType: "dinsos_ojek_difabel",
        serviceTitle: `Ojek Siaga Dinsos: ${passengerType}`,
        targetRole: "government",
        additionalRole: "gov_dinsos",
        agencyName: "Dinas Sosial Kota Surakarta",
        price: 0, // Fully subsidized by Dinsos!
        status: "pending_verification",
        pickupLocation: {
          address: pickupAddress,
          lat: -7.5621,
          lng: 110.8547
        },
        dropoffLocation: {
          address: destinationAddress,
          lat: -7.5583,
          lng: 110.8415
        },
        citizenDetails: {
          passengerType,
          needWheelchairSupport,
          companionName,
          companionPhone,
          notes: `Permohonan armada siaga ramah difabel/lansia rute faskes.`,
          submittedAt: new Date().toISOString()
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setCreatedOrderId(docRef.id);
    } catch (err: any) {
      alert(`Gagal memesan: ${err.message || err}`);
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
                <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-500 flex items-center justify-center shrink-0 shadow-sm">
                  <HeartHandshake className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Pelayanan Sosial & Inklusi Warga
                    </h3>
                    <Badge variant="rose" size="sm">Dinsos Solo</Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Dinas Sosial Kota Surakarta • Jaring Pengaman Sosial & Difabel
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
                onClick={() => setActiveTab("voucher")}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === "voucher"
                    ? "bg-white dark:bg-white/[0.1] text-rose-600 dark:text-rose-400 shadow-sm"
                    : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Store className="h-4 w-4" />
                <span>Kupon Sembako Pasar</span>
              </button>

              <button
                onClick={() => setActiveTab("difabel")}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === "difabel"
                    ? "bg-white dark:bg-white/[0.1] text-rose-600 dark:text-rose-400 shadow-sm"
                    : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Accessibility className="h-4 w-4" />
                <span>Ojek Siaga Lansia / Difabel</span>
              </button>
            </div>

            {/* TAB 1: KLAIM VOUCHER SEMBAKO */}
            {activeTab === "voucher" && (
              <div className="space-y-3.5">
                {voucherClaimed ? (
                  <div className="p-5 bg-gradient-to-br from-rose-500/10 via-amber-500/10 to-emerald-500/10 border border-rose-500/30 rounded-3xl text-center space-y-3.5 animate-in fade-in">
                    <QrCode className="h-24 w-24 text-rose-600 dark:text-rose-400 mx-auto bg-white p-2 rounded-2xl shadow-md" />
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Kupon Sah Bantuan Pangan Pemkot:</span>
                      <div className="text-lg font-mono font-black text-rose-600 dark:text-rose-400">{voucherCode}</div>
                      <Badge variant="emerald" size="sm">Nilai Kupon: Rp 100.000 (Subsidi 100%)</Badge>
                    </div>

                    <div className="p-3 bg-white/90 dark:bg-zinc-800/90 rounded-2xl text-xs text-slate-700 dark:text-zinc-300 text-left space-y-1 border border-slate-200 dark:border-zinc-700">
                      <div className="flex justify-between">
                        <span className="text-[10px] text-slate-400">Lokasi Penukaran:</span>
                        <span className="font-bold">{targetMarket}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[10px] text-slate-400">Komoditas:</span>
                        <span className="font-bold text-emerald-600">Beras 5kg, Telur 1kg, Minyak 2L</span>
                      </div>
                    </div>

                    <Button
                      onClick={() => setVoucherClaimed(false)}
                      className="w-full h-9 bg-slate-200 dark:bg-zinc-800 text-slate-800 dark:text-white font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Tutup / Gunakan Kupon Lain
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleClaimVoucher} className="space-y-3">
                    <div className="p-3.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-500/30 rounded-2xl text-xs text-rose-900 dark:text-rose-300 leading-relaxed">
                      Program Bansos Pangan Mandiri Pemkot Surakarta. Kupon elektronik dapat ditukarkan langsung di kios pedagang pasar tradisional mitra binaan Dinsos Solo.
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                        Nomor KK / NIK / Kartu DTKS / KIS Warga
                      </label>
                      <input
                        type="text"
                        value={dtksNumber}
                        onChange={(e) => setDtksNumber(e.target.value)}
                        placeholder="Contoh: 3372012345670002"
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-rose-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                        Pilih Pasar Tradisional Penukaran
                      </label>
                      <select
                        value={targetMarket}
                        onChange={(e) => setTargetMarket(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-rose-500"
                      >
                        <option value="Pasar Gede Surakarta">🏛️ Pasar Gede Surakarta (Kios Sembako Blok A)</option>
                        <option value="Pasar Legi Surakarta">🏛️ Pasar Legi Surakarta (Kios Beras Paguyuban)</option>
                        <option value="Pasar Kliwon Solo">🏛️ Pasar Nusukan / Kliwon (Kios Bahan Pokok)</option>
                        <option value="Pasar Harjodaksino (Gemblegan)">🏛️ Pasar Harjodaksino Gemblegan</option>
                      </select>
                    </div>

                    <motion.div whileTap={{ scale: 0.98 }}>
                      <Button
                        type="submit"
                        className="w-full h-11 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Sparkles className="h-4 w-4" /> Klaim QR Kupon Sembako Gratis
                      </Button>
                    </motion.div>
                  </form>
                )}
              </div>
            )}

            {/* TAB 2: OJEK SIAGA DIFABEL / LANSIA */}
            {activeTab === "difabel" && (
              <div className="space-y-3.5">
                {createdOrderId ? (
                  <div className="p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-3xl text-center space-y-3 animate-in fade-in">
                    <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
                    <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                      Armada Ojek Siaga Berhasil Dipesan!
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-zinc-300">
                      Dinas Sosial telah menerima permohonan armada ramah difabel/lansia Anda. Driver mitra terlatih akan segera menjemput ke lokasi.
                    </p>
                    <div className="pt-2 flex gap-2">
                      <Button
                        onClick={() => router.push(`/order/${createdOrderId}`)}
                        className="flex-1 h-10 bg-emerald-600 text-white font-bold text-xs rounded-xl"
                      >
                        Lacak Armada
                      </Button>
                      <Button
                        variant="outline"
                        onClick={onClose}
                        className="h-10 text-xs rounded-xl"
                      >
                        Selesai
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleOrderDifabelRide} className="space-y-3">
                    <div className="p-3.5 bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-500/30 rounded-2xl text-xs text-teal-900 dark:text-teal-300">
                      Armada difabel didukung mitra driver bersertifikasi ramah lansia & disabilitas dengan tarif <strong>100% Subsidi Pemkot Solo</strong> untuk keperluan kontrol medis / faskes.
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                        Kategori Penumpang
                      </label>
                      <select
                        value={passengerType}
                        onChange={(e) => setPassengerType(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-rose-500"
                      >
                        <option value="Lansia">👴 Warga Lansia (Usia 60+ Tahun)</option>
                        <option value="Disabilitas Fisik (Kursi Roda)">♿ Disabilitas Fisik (Membawa Kursi Roda Lipat)</option>
                        <option value="Disabilitas Netra / Rungu">👁️ Disabilitas Netra / Rungu (Butuh Pendampingan)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                          Nama Pendamping / Pasien
                        </label>
                        <input
                          type="text"
                          value={companionName}
                          onChange={(e) => setCompanionName(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                          WhatsApp Pendamping
                        </label>
                        <input
                          type="tel"
                          value={companionPhone}
                          onChange={(e) => setCompanionPhone(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                        Alamat Penjemputan Rumah
                      </label>
                      <input
                        type="text"
                        value={pickupAddress}
                        onChange={(e) => setPickupAddress(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                        Tujuan Faskes / Rumah Sakit / Posyandu
                      </label>
                      <input
                        type="text"
                        value={destinationAddress}
                        onChange={(e) => setDestinationAddress(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                        required
                      />
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-slate-200 dark:border-white/[0.05] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-500 block font-medium">Tarif Layanan Siaga</span>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">100% Ditanggung Dinsos</span>
                      </div>
                      <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                        GRATIS (Rp 0)
                      </span>
                    </div>

                    <motion.div whileTap={{ scale: 0.98 }}>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-11 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" /> Menghubungi Armada Siaga...
                          </>
                        ) : (
                          <>
                            <Accessibility className="h-4 w-4" /> Pesan Armada Siaga Difabel / Lansia
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </form>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
