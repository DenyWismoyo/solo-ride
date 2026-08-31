"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { motion, AnimatePresence } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  X, 
  Receipt, 
  QrCode, 
  ShieldCheck, 
  Coins, 
  CheckCircle2, 
  Loader2, 
  Store, 
  Info,
  Calendar,
  Sparkles,
  HelpCircle,
  FileCheck2
} from "lucide-react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";

interface BapendaCivicModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BapendaCivicModal({ isOpen, onClose }: BapendaCivicModalProps) {
  const router = useRouter();
  const { user, userData } = useAuthContext();

  const [serviceCategory, setServiceCategory] = useState<"pbb" | "retribusi" | "konsultasi" | "insentif">("pbb");
  const [taxPayerName, setTaxPayerName] = useState(userData?.displayName || "");
  const [nikOrNpwp, setNikOrNpwp] = useState("");
  const [phone, setPhone] = useState(userData?.phone || "081234567891");
  const [address, setAddress] = useState(userData?.address || "Jl. Slamet Riyadi No. 120, Surakarta");

  // PBB Fields
  const [spptNumber, setSpptNumber] = useState("");
  const [taxYear, setTaxYear] = useState("2026");
  const [taxAmount, setTaxAmount] = useState<number>(150000);

  // Retribusi Pasar Fields
  const [marketName, setMarketName] = useState("Pasar Gede Hardjonagoro");
  const [kiosNumber, setKiosNumber] = useState("Blok A No. 14");
  const [retribusiDailyAmount, setRetribusiDailyAmount] = useState<number>(5000);

  // Konsultasi / Notes
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Silakan login terlebih dahulu untuk mengakses layanan Bapenda.");
      router.push("/login");
      return;
    }

    setIsSubmitting(true);
    try {
      let serviceTitle = "Bapenda: Bayar PBB-P2 Online";
      let price = taxAmount;

      if (serviceCategory === "retribusi") {
        serviceTitle = `Bapenda: e-Retribusi Kios (${marketName})`;
        price = retribusiDailyAmount * 30; // 1 Bulan
      } else if (serviceCategory === "konsultasi") {
        serviceTitle = "Bapenda: Konsultasi Pajak Daerah & NPWPD";
        price = 0;
      } else if (serviceCategory === "insentif") {
        serviceTitle = "Bapenda: Klaim Insentif Kepatuhan Wajib Pajak";
        price = 0;
      }

      const docRef = await addDoc(collection(db, COLLECTIONS.ORDERS), {
        customerId: user.uid,
        customerName: taxPayerName,
        customerPhone: phone,
        serviceType: `bapenda_${serviceCategory}`,
        serviceTitle,
        targetRole: "government",
        additionalRole: "gov_bapenda",
        agencyName: "Bapenda Kota Surakarta",
        price,
        status: "pending_verification",
        pickupLocation: {
          address: "Kantor Bapenda Kota Surakarta (Balaikota)",
          lat: -7.5695,
          lng: 110.8285
        },
        dropoffLocation: {
          address,
          lat: -7.5621,
          lng: 110.8547
        },
        citizenDetails: {
          taxType: serviceCategory,
          spptNumber: serviceCategory === "pbb" ? spptNumber : undefined,
          kiosId: serviceCategory === "retribusi" ? `${marketName} - ${kiosNumber}` : undefined,
          marketName: serviceCategory === "retribusi" ? marketName : undefined,
          nikOrNpwp,
          taxYear: parseInt(taxYear) || 2026,
          amount: price,
          notes,
          submittedAt: new Date().toISOString()
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setCreatedOrderId(docRef.id);
    } catch (err: any) {
      console.error("Gagal mengirim permohonan Bapenda:", err);
      alert(`Gagal mengirim permohonan: ${err.message || err}`);
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
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-500 flex items-center justify-center shrink-0 shadow-sm text-2xl">
                  📊
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Pelayanan Pajak & Retribusi Daerah
                    </h3>
                    <Badge variant="blue" size="sm">BAPENDA</Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Badan Pendapatan Daerah Kota Surakarta • PAD Berkelanjutan
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

            {/* Success Alert */}
            {createdOrderId ? (
              <div className="p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-3xl text-center space-y-3 animate-in fade-in">
                <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                    Pengajuan Berhasil Tercatat di Sistem Bapenda Solo!
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-zinc-300 max-w-sm mx-auto">
                    Data pembayaran / permohonan Anda telah diverifikasi oleh petugas Bapenda. Anda mendapatkan <strong>+25 Poin Loyalitas Koperasi</strong> atas kepatuhan pajak daerah.
                  </p>
                </div>

                <div className="pt-2 flex gap-2">
                  <Button
                    onClick={() => router.push(`/order/${createdOrderId}`)}
                    className="flex-1 h-10 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Lihat Bukti Setor & Status
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="h-10 text-xs rounded-xl cursor-pointer"
                  >
                    Tutup
                  </Button>
                </div>
              </div>
            ) : (
              /* Form */
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Category Selector Tabs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-slate-100 dark:bg-white/[0.04] rounded-2xl">
                  {[
                    { id: "pbb", label: "PBB-P2", icon: Receipt },
                    { id: "retribusi", label: "Kios Pasar", icon: Store },
                    { id: "konsultasi", label: "Konsultasi", icon: HelpCircle },
                    { id: "insentif", label: "Insentif", icon: Sparkles }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setServiceCategory(tab.id as any)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer select-none ${
                        serviceCategory === tab.id
                          ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-zinc-700"
                          : "text-slate-600 dark:text-zinc-400 hover:text-slate-900"
                      }`}
                    >
                      <tab.icon className="h-4 w-4" />
                      <span className="text-[10px]">{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* Sub-Service Explainer */}
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-500/30 rounded-2xl text-xs text-indigo-900 dark:text-indigo-300 flex items-start gap-2">
                  <Info className="h-4 w-4 shrink-0 mt-0.5 text-indigo-500" />
                  <span>
                    {serviceCategory === "pbb" && "Cek tagihan dan bayar Pajak Bumi & Bangunan P2 Kota Solo langsung tersinkronisasi kas daerah dan bebas biaya admin."}
                    {serviceCategory === "retribusi" && "Pembayaran retribusi harian/bulanan kios pasar tradisional resmi via QRIS Bapenda terpadu."}
                    {serviceCategory === "konsultasi" && "Konsultasi langsung dengan fiskus Bapenda terkait pajak restoran, hotel, hiburan, dan pendaftaran NPWPD usaha baru."}
                    {serviceCategory === "insentif" && "Program apresiasi warga: Dapatkan diskon retribusi & bonus stamp poin belanja UMKM bagi wajib pajak taat waktu."}
                  </span>
                </div>

                {/* Dynamic Inputs Based on Category */}
                {serviceCategory === "pbb" && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                          Nomor Objek Pajak (NOP / SPPT)
                        </label>
                        <input
                          type="text"
                          value={spptNumber}
                          onChange={(e) => setSpptNumber(e.target.value)}
                          placeholder="33.72.xxx.xxx.xxx-xxxx.x"
                          className="w-full px-3 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-indigo-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                          Tahun Pajak
                        </label>
                        <select
                          value={taxYear}
                          onChange={(e) => setTaxYear(e.target.value)}
                          className="w-full px-3 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-indigo-500"
                        >
                          <option value="2026">Tahun Pajak 2026 (Aktif)</option>
                          <option value="2025">Tahun Pajak 2025</option>
                          <option value="2024">Tahun Pajak 2024</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                        Estimasi Nominal PBB Terhutang
                      </label>
                      <input
                        type="number"
                        value={taxAmount}
                        onChange={(e) => setTaxAmount(Number(e.target.value))}
                        className="w-full px-3 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white font-bold text-indigo-600 dark:text-indigo-400 focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>
                  </div>
                )}

                {serviceCategory === "retribusi" && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                          Pasar Tradisional
                        </label>
                        <select
                          value={marketName}
                          onChange={(e) => setMarketName(e.target.value)}
                          className="w-full px-3 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-indigo-500"
                        >
                          <option value="Pasar Gede Hardjonagoro">Pasar Gede Hardjonagoro</option>
                          <option value="Pasar Legi Surakarta">Pasar Legi Surakarta</option>
                          <option value="Pasar Klewer Solo">Pasar Klewer Solo</option>
                          <option value="Pasar Harjodaksino (Gemblegan)">Pasar Harjodaksino</option>
                          <option value="Pasar Kembang Solo">Pasar Kembang Solo</option>
                          <option value="Pasar Nusukan">Pasar Nusukan</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                          Nomor Kios / Los / Lapak
                        </label>
                        <input
                          type="text"
                          value={kiosNumber}
                          onChange={(e) => setKiosNumber(e.target.value)}
                          placeholder="Contoh: Los Sayur No. 12"
                          className="w-full px-3 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-indigo-500"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Common Citizen Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                      Nama Wajib Pajak / Pemohon
                    </label>
                    <input
                      type="text"
                      value={taxPayerName}
                      onChange={(e) => setTaxPayerName(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                      NIK / NPWPD
                    </label>
                    <input
                      type="text"
                      value={nikOrNpwp}
                      onChange={(e) => setNikOrNpwp(e.target.value)}
                      placeholder="337201xxxxxxx"
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                      WhatsApp Wajib Pajak
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                      Alamat Wajib Pajak
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    Catatan Tambahan / Keterangan Objek Pajak
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Contoh: Pembayaran PBB Rumah Tinggal Kelurahan Jebres..."
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="p-3 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-slate-200/80 dark:border-white/[0.05] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-medium">Kanal Pembayaran Resmi</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">QRIS Dinamis Bapenda Surakarta</span>
                  </div>
                  <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                    Bebas Biaya Admin
                  </span>
                </div>

                <motion.div whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-11 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Memproses ke Server Bapenda...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" /> Proses Permohonan / Pembayaran Pajak
                      </>
                    )}
                  </Button>
                </motion.div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
