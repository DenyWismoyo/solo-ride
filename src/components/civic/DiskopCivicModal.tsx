"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { motion, AnimatePresence } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Coins, 
  X, 
  Sparkles, 
  Calculator, 
  FileText, 
  CheckCircle2, 
  Loader2, 
  Store, 
  Award,
  ArrowRight
} from "lucide-react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";

interface DiskopCivicModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DiskopCivicModal({ isOpen, onClose }: DiskopCivicModalProps) {
  const router = useRouter();
  const { user, userData } = useAuthContext();

  const [activeTab, setActiveTab] = useState<"stamps" | "shu" | "nib">("stamps");

  // NIB Form States
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("Kuliner / Warung Makan");
  const [businessAddress, setBusinessAddress] = useState(userData?.address || "Jl. Surya No. 12, Jebres, Surakarta");
  const [ownerPhone, setOwnerPhone] = useState(userData?.phone || "081234567891");
  const [isSubmittingNIB, setIsSubmittingNIB] = useState(false);
  const [nibSuccessOrder, setNibSuccessOrder] = useState<string | null>(null);

  // SHU Simulator State
  const [monthlySpend, setMonthlySpend] = useState(500000);
  const estimatedAnnualSHU = Math.round((monthlySpend * 12) * 0.035); // 3.5% dividend estimation

  const handleSubmitNIB = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Silakan login terlebih dahulu.");
      router.push("/login");
      return;
    }

    setIsSubmittingNIB(true);
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.ORDERS), {
        customerId: user.uid,
        customerName: userData?.displayName || "Pelaku Usaha Solo",
        customerPhone: ownerPhone,
        serviceType: "diskop_pendampingan_nib",
        serviceTitle: `Diskop: Pendampingan NIB (${businessName})`,
        targetRole: "government",
        additionalRole: "gov_diskop",
        agencyName: "Dinas Koperasi & UMKM Surakarta",
        price: 0,
        status: "pending_verification",
        pickupLocation: {
          address: "Dinas Koperasi & UKM (Gedung Balaikota)",
          lat: -7.5695,
          lng: 110.8285
        },
        dropoffLocation: {
          address: businessAddress,
          lat: -7.5621,
          lng: 110.8547
        },
        citizenDetails: {
          businessName,
          businessType,
          ownerPhone,
          businessAddress,
          submittedAt: new Date().toISOString()
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setNibSuccessOrder(docRef.id);
    } catch (err: any) {
      alert(`Gagal mengajukan NIB: ${err.message || err}`);
    } finally {
      setIsSubmittingNIB(false);
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
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center shrink-0 shadow-sm">
                  <Coins className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Koperasi & Pemberdayaan UMKM
                    </h3>
                    <Badge variant="emerald" size="sm">Diskop Solo</Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Dinas Koperasi & UMKM Kota Surakarta • Ekonomi Berkeadilan
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
                onClick={() => setActiveTab("stamps")}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === "stamps"
                    ? "bg-white dark:bg-white/[0.1] text-emerald-600 dark:text-emerald-400 shadow-sm"
                    : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Award className="h-4 w-4" />
                <span>Stamp Belanja</span>
              </button>

              <button
                onClick={() => setActiveTab("shu")}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === "shu"
                    ? "bg-white dark:bg-white/[0.1] text-emerald-600 dark:text-emerald-400 shadow-sm"
                    : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Calculator className="h-4 w-4" />
                <span>Kalkulator SHU</span>
              </button>

              <button
                onClick={() => setActiveTab("nib")}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === "nib"
                    ? "bg-white dark:bg-white/[0.1] text-emerald-600 dark:text-emerald-400 shadow-sm"
                    : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>Izin NIB UMKM</span>
              </button>
            </div>

            {/* TAB 1: STAMP BELANJA */}
            {activeTab === "stamps" && (
              <div className="space-y-3.5">
                <div className="p-4 bg-gradient-to-br from-emerald-500/15 to-teal-500/10 border border-emerald-500/30 rounded-3xl space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider">Tabungan Stamp Komunitas:</span>
                      <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-0.5">
                        <span>🪙 {userData?.points || 120}</span>
                        <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">Stamp Aktif</span>
                      </div>
                    </div>
                    <Badge variant="emerald" size="sm">Setara Rp {((userData?.points || 120) * 100).toLocaleString("id-ID")}</Badge>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-zinc-300 leading-snug">
                    Setiap Anda belanja di warung UMKM lokal atau memesan ojek, Anda mengumpulkan stamp yang dapat ditukarkan voucher sembako di pasar tradisional.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider pl-1">
                    Tukar Stamp Anda:
                  </h4>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.05] flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white">Voucher Diskon Ojek Rp 5.000</h5>
                      <p className="text-[10px] text-slate-500">Tukar 50 Stamp Poin</p>
                    </div>
                    <Button size="sm" className="h-8 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl">
                      Tukar
                    </Button>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.05] flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white">Kupon Beras Pasar Gede Rp 10.000</h5>
                      <p className="text-[10px] text-slate-500">Tukar 100 Stamp Poin</p>
                    </div>
                    <Button size="sm" className="h-8 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl">
                      Tukar
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: KALKULATOR SHU */}
            {activeTab === "shu" && (
              <div className="space-y-3.5">
                <div className="p-3.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.05] rounded-2xl text-xs text-slate-600 dark:text-zinc-300">
                  Simulasi dividen Sisa Hasil Usaha (SHU) tahunan yang dikembalikan kepada pelanggan dan mitra koperasi aktif Surakarta.
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block">
                    Estimasi Belanja / Transaksi Bulanan Anda di Ride-Solo:
                  </label>
                  <input
                    type="range"
                    min={100000}
                    max={3000000}
                    step={50000}
                    value={monthlySpend}
                    onChange={(e) => setMonthlySpend(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-500">Rp 100.000</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono">Rp {monthlySpend.toLocaleString("id-ID")} / bulan</span>
                    <span className="text-slate-500">Rp 3.000.000</span>
                  </div>
                </div>

                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Estimasi Dividen SHU Tahunan Anda:</span>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    Rp {estimatedAnnualSHU.toLocaleString("id-ID")}
                  </div>
                  <p className="text-[10px] text-slate-500">Dicairkan setiap Rapat Anggota Tahunan (RAT) Koperasi Mitra Solo.</p>
                </div>
              </div>
            )}

            {/* TAB 3: PENDAFTARAN NIB UMKM */}
            {activeTab === "nib" && (
              <div className="space-y-3.5">
                {nibSuccessOrder ? (
                  <div className="p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-3xl text-center space-y-3 animate-in fade-in">
                    <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
                    <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                      Permohonan Pendampingan NIB Diterima!
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-zinc-300">
                      Petugas pendamping UMKM Diskop Surakarta akan menghubungi Anda melalui WhatsApp untuk asistensi penerbitan NIB OSS secara gratis.
                    </p>
                    <Button
                      onClick={onClose}
                      className="w-full h-9 bg-emerald-600 text-white font-bold text-xs rounded-xl"
                    >
                      Selesai
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitNIB} className="space-y-3">
                    <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl text-xs text-emerald-900 dark:text-emerald-300">
                      Diskop Surakarta memfasilitasi pembuatan Nomor Induk Berusaha (NIB) dan sertifikasi halal secara gratis 100% tanpa calo bagi pelaku usaha mikro warga Solo.
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                        Nama Usaha / Merk Dagang
                      </label>
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="Contoh: Warung Selat Bu Warno / Kios Sayur Berkah"
                        className="w-full px-3 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                          Kategori Usaha
                        </label>
                        <select
                          value={businessType}
                          onChange={(e) => setBusinessType(e.target.value)}
                          className="w-full px-3 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-emerald-500"
                        >
                          <option value="Kuliner / Warung Makan">🍲 Kuliner & Minuman</option>
                          <option value="Pedagang Pasar Tradisional">🛒 Kios Pasar</option>
                          <option value="Kerajinan / Batik">🎨 Batik & Seni</option>
                          <option value="Jasa / Kelontong">🏪 Toko Kelontong</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                          WhatsApp Pemilik
                        </label>
                        <input
                          type="tel"
                          value={ownerPhone}
                          onChange={(e) => setOwnerPhone(e.target.value)}
                          className="w-full px-3 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                        Alamat Kios / Lokasi Usaha
                      </label>
                      <textarea
                        value={businessAddress}
                        onChange={(e) => setBusinessAddress(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>

                    <motion.div whileTap={{ scale: 0.98 }}>
                      <Button
                        type="submit"
                        disabled={isSubmittingNIB}
                        className="w-full h-11 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2"
                      >
                        {isSubmittingNIB ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" /> Mengirim Permohonan...
                          </>
                        ) : (
                          <>
                            <FileText className="h-4 w-4" /> Ajukan Pendampingan Izin NIB Gratis
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
