"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { motion, AnimatePresence } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileCheck2, 
  X, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Key, 
  CheckCircle2, 
  Loader2, 
  Building, 
  Info,
  Clock
} from "lucide-react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";

interface DukcapilCivicModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DukcapilCivicModal({ isOpen, onClose }: DukcapilCivicModalProps) {
  const router = useRouter();
  const { user, userData } = useAuthContext();

  const [documentType, setDocumentType] = useState("KTP-el Penggantian / Baru");
  const [nikNumber, setNikNumber] = useState("");
  const [registrantName, setRegistrantName] = useState(userData?.displayName || "");
  const [originOffice, setOriginOffice] = useState("Disdukcapil Kantor Pusat (Balaikota Solo)");
  const [recipientPhone, setRecipientPhone] = useState(userData?.phone || "081234567891");
  const [deliveryAddress, setDeliveryAddress] = useState(userData?.address || "Jl. Kolonel Sutarto No. 45, Jebres, Surakarta");
  const [otpCode] = useState(() => Math.floor(1000 + Math.random() * 9000).toString());
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Silakan login terlebih dahulu.");
      router.push("/login");
      return;
    }

    if (!nikNumber.trim() || nikNumber.length < 10) {
      alert("Masukkan NIK atau Nomor Registrasi Berkas yang valid.");
      return;
    }

    setIsSubmitting(true);
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.ORDERS), {
        customerId: user.uid,
        customerName: registrantName,
        customerPhone: recipientPhone,
        serviceType: "dukcapil_antar_ktp",
        serviceTitle: `Dukcapil: Antar ${documentType}`,
        targetRole: "government",
        additionalRole: "gov_dukcapil",
        agencyName: "Disdukcapil Kota Surakarta",
        price: 10000,
        status: "pending_verification",
        pickupLocation: {
          address: originOffice,
          lat: -7.5695,
          lng: 110.8285
        },
        dropoffLocation: {
          address: deliveryAddress,
          lat: -7.5621,
          lng: 110.8547
        },
        citizenDetails: {
          documentType,
          nikOrRef: nikNumber,
          registrantName,
          originOffice,
          otpCode,
          notes,
          submittedAt: new Date().toISOString()
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setCreatedOrderId(docRef.id);
    } catch (err: any) {
      console.error("Gagal mengajukan layanan Dukcapil:", err);
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
                <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-500 flex items-center justify-center shrink-0 shadow-sm">
                  <FileCheck2 className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Dukcapil Antar Dokumen ke Rumah
                    </h3>
                    <Badge variant="blue" size="sm">Resmi Pemkot</Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Disdukcapil Kota Surakarta • Pelayanan Kependudukan Warga
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
                    Permohonan Antar Berkas Berhasil Diterbitkan!
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-zinc-300 max-w-sm mx-auto">
                    Petugas Disdukcapil akan memeriksa berkas Anda di <strong>{originOffice}</strong> dan menyerahkannya ke driver mitra untuk diantar ke rumah.
                  </p>
                </div>

                {/* OTP Box */}
                <div className="p-3 bg-white dark:bg-zinc-800 rounded-2xl border border-emerald-500/30 max-w-xs mx-auto space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Kode OTP Serah Terima Fisik:</span>
                  <div className="text-xl font-mono font-black text-emerald-600 dark:text-emerald-400 tracking-widest">
                    {otpCode}
                  </div>
                  <p className="text-[10px] text-slate-500">Cocokkan kode ini saat driver menyerahkan dokumen ke rumah Anda.</p>
                </div>

                <div className="pt-2 flex gap-2">
                  <Button
                    onClick={() => router.push(`/order/${createdOrderId}`)}
                    className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Lacak Status Pengantaran
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
                <div className="p-3.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-500/30 rounded-2xl text-xs text-blue-900 dark:text-blue-300 flex items-start gap-2">
                  <Info className="h-4 w-4 shrink-0 mt-0.5 text-blue-500" />
                  <span>
                    Layanan ini khusus untuk dokumen kependudukan yang sudah selesai dicetak di Disdukcapil Solo. Berkas fisik akan diantar bersegel resmi ke alamat rumah Anda.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                      Jenis Dokumen Kependudukan
                    </label>
                    <select
                      value={documentType}
                      onChange={(e) => setDocumentType(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-blue-500"
                    >
                      <option value="KTP-el Penggantian / Baru">🪪 KTP-el (Cetak Baru / Rusak / Hilang)</option>
                      <option value="Kartu Keluarga (KK)">📄 Kartu Keluarga (KK Barcode)</option>
                      <option value="Kartu Identitas Anak (KIA)">🧒 Kartu Identitas Anak (KIA)</option>
                      <option value="Akta Kelahiran / Kematian">📜 Akta Kelahiran / Akta Kematian</option>
                      <option value="Surat Pindah (SKPWNI)">📦 Surat Pindah Datang (SKPWNI)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                      Nomor NIK / No. Registrasi Berkas
                    </label>
                    <input
                      type="text"
                      value={nikNumber}
                      onChange={(e) => setNikNumber(e.target.value)}
                      placeholder="Contoh: 3372010101900001"
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono font-bold"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                      Nama Lengkap Pemohon
                    </label>
                    <input
                      type="text"
                      value={registrantName}
                      onChange={(e) => setRegistrantName(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                      Nomor WhatsApp Penerima
                    </label>
                    <input
                      type="tel"
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    Lokasi Pengambilan Berkas (Kantor Dinas / Kecamatan)
                  </label>
                  <select
                    value={originOffice}
                    onChange={(e) => setOriginOffice(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-blue-500"
                  >
                    <option value="Disdukcapil Kantor Pusat (Balaikota Solo)">🏛️ Disdukcapil Balai Kota Surakarta (Jl. Jend. Sudirman)</option>
                    <option value="Kantor Kecamatan Jebres">📍 Kantor Kecamatan Jebres (Jl. Kol. Sutarto)</option>
                    <option value="Kantor Kecamatan Banjarsari">📍 Kantor Kecamatan Banjarsari (Jl. Adi Sumarmo)</option>
                    <option value="Kantor Kecamatan Laweyan">📍 Kantor Kecamatan Laweyan (Jl. Dr. Radjiman)</option>
                    <option value="Kantor Kecamatan Serengan">📍 Kantor Kecamatan Serengan (Jl. Veteran)</option>
                    <option value="Kantor Kecamatan Pasar Kliwon">📍 Kantor Kecamatan Pasar Kliwon (Jl. Kapten Mulyadi)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    Alamat Lengkap Pengantaran ke Rumah
                  </label>
                  <textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    rows={2}
                    placeholder="Tulis nama jalan, nomor rumah, RT/RW, dan kelurahan..."
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div className="p-3 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-slate-200/80 dark:border-white/[0.05] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-medium">Ongkos Kirim Driver Mitra</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Tarif Bersubsidi Flat Koperasi</span>
                  </div>
                  <span className="text-sm font-black text-blue-600 dark:text-blue-400">
                    Rp 10.000
                  </span>
                </div>

                <motion.div whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Memproses Pengajuan...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" /> Ajukan Pengantaran Dokumen Resmi
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
