"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { motion, AnimatePresence } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Stethoscope, 
  X, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  Loader2, 
  ShieldCheck, 
  Pill, 
  AlertCircle,
  Clock
} from "lucide-react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";

interface DinkesCivicModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SOLO_PUSKESMAS_LIST = [
  "Puskesmas Manahan (Jl. Menteri Supeno No. 1)",
  "Puskesmas Sibela Mojosongo (Jl. Sibela Raya)",
  "Puskesmas Ngoresan Jebres (Jl. Ki Hajar Dewantara)",
  "Puskesmas Purwosari (Jl. Slamet Riyadi No. 370)",
  "Puskesmas Gajahan Pasar Kliwon (Jl. Veteran)",
  "Puskesmas Sangkrah (Jl. Demak Bintoro)",
  "Puskesmas Jayengan Serengan (Jl. W.R. Supratman)",
  "Puskesmas Pajang Laweyan (Jl. Joko Tingkir)",
  "Puskesmas Gilingan (Jl. D.I. Panjaitan)",
  "Puskesmas Banyuanyar (Jl. Bone Barat)",
  "Puskesmas Gambirsari (Jl. Brigjen Katamso)",
  "Puskesmas Nusukan (Jl. Piere Tendean)",
  "Puskesmas Setabelan (Jl. Abdul Muis)",
  "Puskesmas Kratonan (Jl. Gatot Subroto)",
  "Puskesmas Penumping (Jl. Panjaitan)",
  "Puskesmas Purwodiningratan (Jl. Suryo)"
];

export function DinkesCivicModal({ isOpen, onClose }: DinkesCivicModalProps) {
  const router = useRouter();
  const { user, userData } = useAuthContext();

  const [selectedPuskesmas, setSelectedPuskesmas] = useState(SOLO_PUSKESMAS_LIST[0]);
  const [patientName, setPatientName] = useState(userData?.displayName || "");
  const [medicalRecordNumber, setMedicalRecordNumber] = useState("");
  const [patientPhone, setPatientPhone] = useState(userData?.phone || "081234567891");
  const [deliveryAddress, setDeliveryAddress] = useState(userData?.address || "Jl. Kolonel Sutarto No. 45, Jebres, Surakarta");
  const [medicineType, setMedicineType] = useState<"Obat Kronis Rawat Jalan (Prolanis)" | "Resep Umum / Antibiotik" | "Vitamin & Suplemen Balita/Ibu Hamil">("Obat Kronis Rawat Jalan (Prolanis)");
  const [allergyNotes, setAllergyNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Silakan login terlebih dahulu.");
      router.push("/login");
      return;
    }

    if (!medicalRecordNumber.trim()) {
      alert("Masukkan No. Rekam Medis / No. Resep Puskesmas.");
      return;
    }

    setIsSubmitting(true);
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.ORDERS), {
        customerId: user.uid,
        customerName: patientName,
        customerPhone: patientPhone,
        serviceType: "dinkes_resep_puskesmas",
        serviceTitle: `Dinkes: Resep Obat ${selectedPuskesmas.split(" (")[0]}`,
        targetRole: "government",
        additionalRole: "gov_dinkes",
        agencyName: "Dinas Kesehatan Kota Surakarta",
        price: 8000,
        status: "pending_verification",
        pickupLocation: {
          address: selectedPuskesmas,
          lat: -7.5615,
          lng: 110.8124
        },
        dropoffLocation: {
          address: deliveryAddress,
          lat: -7.5621,
          lng: 110.8547
        },
        citizenDetails: {
          patientName,
          medicalRecordNumber,
          selectedPuskesmas,
          medicineType,
          allergyNotes,
          submittedAt: new Date().toISOString()
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setCreatedOrderId(docRef.id);
    } catch (err: any) {
      alert(`Gagal mengajukan: ${err.message || err}`);
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
                <div className="w-12 h-12 rounded-2xl bg-teal-500/15 border border-teal-500/30 text-teal-500 flex items-center justify-center shrink-0 shadow-sm">
                  <Stethoscope className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Antar Resep Obat 17 Puskesmas
                    </h3>
                    <Badge variant="teal" size="sm">Dinkes Solo</Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Dinas Kesehatan Kota Surakarta • Pengantaran Obat Steril Pasien
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
                    Resep Obat Pasien Sedang Dipersiapkan Farmasi!
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-zinc-300 max-w-sm mx-auto">
                    Petugas apoteker <strong>{selectedPuskesmas.split(" (")[0]}</strong> akan memverifikasi No. RM <strong>{medicalRecordNumber}</strong> dan menyegel paket obat sebelum diserahkan ke kurir medis.
                  </p>
                </div>

                <div className="pt-2 flex gap-2">
                  <Button
                    onClick={() => router.push(`/order/${createdOrderId}`)}
                    className="flex-1 h-10 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Lacak Kurir Obat
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
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div className="p-3.5 bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-500/30 rounded-2xl text-xs text-teal-900 dark:text-teal-300 flex items-start gap-2">
                  <Pill className="h-4 w-4 shrink-0 mt-0.5 text-teal-500" />
                  <span>
                    Obat akan dikemas dalam kantong tersegel steril resmi Dinkes Surakarta dan wajib diperiksa nama pasien saat serah terima.
                  </span>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    Pilih Puskesmas Asal Resep (17 Puskesmas Solo)
                  </label>
                  <select
                    value={selectedPuskesmas}
                    onChange={(e) => setSelectedPuskesmas(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-teal-500"
                  >
                    {SOLO_PUSKESMAS_LIST.map((p) => (
                      <option key={p} value={p}>🏥 {p}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                      Nomor Rekam Medis (No. RM) / No. Antrean Apotek
                    </label>
                    <input
                      type="text"
                      value={medicalRecordNumber}
                      onChange={(e) => setMedicalRecordNumber(e.target.value)}
                      placeholder="Contoh: RM-2024-88912"
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-teal-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                      Nama Pasien Penerima
                    </label>
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                      Kategori Resep Obat
                    </label>
                    <select
                      value={medicineType}
                      onChange={(e) => setMedicineType(e.target.value as any)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-teal-500"
                    >
                      <option value="Obat Kronis Rawat Jalan (Prolanis)">💊 Obat Kronis Rutin (Hipertensi/Diabetes/Prolanis)</option>
                      <option value="Resep Umum / Antibiotik">🩺 Resep Umum Rawat Jalan</option>
                      <option value="Vitamin & Suplemen Balita/Ibu Hamil">👶 Vitamin Balita & Suplemen Ibu Hamil</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                      WhatsApp Pasien / Keluarga
                    </label>
                    <input
                      type="tel"
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    Alamat Rumah Pengantaran Pasien
                  </label>
                  <textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    Catatan Alergi Obat Pasien (Wajib dicantumkan bila ada)
                  </label>
                  <input
                    type="text"
                    value={allergyNotes}
                    onChange={(e) => setAllergyNotes(e.target.value)}
                    placeholder="Contoh: Alergi Amoksisilin / Tidak ada alergi..."
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="p-3 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-slate-200 dark:border-white/[0.05] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 block font-medium">Ongkos Kurir Farmasi</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Tarif Flat Bersubsidi Koperasi</span>
                  </div>
                  <span className="text-sm font-black text-teal-600 dark:text-teal-400">
                    Rp 8.000
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
                        <Loader2 className="h-4 w-4 animate-spin" /> Memproses Pengajuan...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" /> Ajukan Pengantaran Resep Obat Puskesmas
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
