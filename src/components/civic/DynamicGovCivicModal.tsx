"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { motion, AnimatePresence } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppService } from "@/constants/services";
import { 
  Building2, 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  Loader2, 
  MapPin, 
  Phone, 
  Info,
  Calendar,
  Sparkles,
  FileCheck2,
  AlertCircle
} from "lucide-react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";

interface DynamicGovCivicModalProps {
  service: AppService | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DynamicGovCivicModal({ service, isOpen, onClose }: DynamicGovCivicModalProps) {
  const router = useRouter();
  const { user, userData } = useAuthContext();

  const [citizenName, setCitizenName] = useState(userData?.displayName || "");
  const [citizenPhone, setCitizenPhone] = useState(userData?.phone || "081234567891");
  const [citizenNik, setCitizenNik] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState(userData?.address || "Jl. Slamet Riyadi No. 120, Surakarta");
  const [serviceDetailNotes, setServiceDetailNotes] = useState("");
  const [selectedSubOption, setSelectedSubOption] = useState("Layanan Reguler");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (service) {
      setCreatedOrderId(null);
      setServiceDetailNotes("");
    }
  }, [service]);

  if (!service) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Silakan login terlebih dahulu untuk mengajukan permohonan layanan ini.");
      router.push("/login");
      return;
    }

    setIsSubmitting(true);
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.ORDERS), {
        customerId: user.uid,
        customerName: citizenName,
        customerPhone: citizenPhone,
        serviceType: service.id,
        serviceTitle: service.name,
        targetRole: "government",
        additionalRole: service.additionalRole || "gov_disdik",
        agencyName: service.agencyName || "Pemerintah Kota Surakarta",
        price: service.estimatedFee || 0,
        status: "pending_verification",
        pickupLocation: {
          address: service.agencyName || "Kantor Dinas Surakarta",
          lat: -7.5695,
          lng: 110.8285
        },
        dropoffLocation: {
          address: deliveryAddress,
          lat: -7.5621,
          lng: 110.8547
        },
        citizenDetails: {
          nikOrRef: citizenNik,
          subOption: selectedSubOption,
          notes: serviceDetailNotes,
          submittedAt: new Date().toISOString()
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setCreatedOrderId(docRef.id);
    } catch (err: any) {
      console.error("Gagal mengirim permohonan dinas:", err);
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
                <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-sm ${service.bgColor} ${service.borderColor}`}>
                  {React.createElement(service.icon, { className: `h-6 w-6 ${service.color}` })}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                      {service.name}
                    </h3>
                    <Badge variant="teal" size="sm">PEMKOT SOLO</Badge>
                  </div>
                  <p className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold mt-0.5">
                    {service.agencyName || "Pemerintah Kota Surakarta"}
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
                    Permohonan Berhasil Dikirim ke {service.agencyName}!
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-zinc-300 max-w-sm mx-auto">
                    Petugas dinas terkait akan memvalidasi data Anda dan segera mengalokasikan armada/petugas menuju alamat Anda.
                  </p>
                </div>

                <div className="pt-2 flex gap-2">
                  <Button
                    onClick={() => router.push(`/order/${createdOrderId}`)}
                    className="flex-1 h-10 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Lacak Status Permohonan
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
                <div className="p-3.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] rounded-2xl text-xs text-slate-600 dark:text-zinc-300 flex items-start gap-2">
                  <Info className="h-4 w-4 shrink-0 mt-0.5 text-teal-500" />
                  <span>{service.description}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                      Nama Pemohon / Penanggung Jawab
                    </label>
                    <input
                      type="text"
                      value={citizenName}
                      onChange={(e) => setCitizenName(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                      Nomor NIK KTP Warga
                    </label>
                    <input
                      type="text"
                      value={citizenNik}
                      onChange={(e) => setCitizenNik(e.target.value)}
                      placeholder="337201xxxxxxx"
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-teal-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                      Nomor WhatsApp Aktif
                    </label>
                    <input
                      type="tel"
                      value={citizenPhone}
                      onChange={(e) => setCitizenPhone(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                      Alamat Penjemputan / Lokasi
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    Detail Catatan / Kebutuhan Permohonan
                  </label>
                  <textarea
                    value={serviceDetailNotes}
                    onChange={(e) => setServiceDetailNotes(e.target.value)}
                    rows={2}
                    placeholder="Contoh: Jemput sampah kardus 15kg di RW 03 / Lapor pohon ruan di Jl. Honggowongso / Antar jemput SD Negeri Mangkubumen..."
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>

                <div className="p-3 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-slate-200/80 dark:border-white/[0.05] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-medium">Status Pembiayaan</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{service.feeLabel || "Program Pelayanan Warga"}</span>
                  </div>
                  <span className="text-sm font-black text-teal-600 dark:text-teal-400">
                    {service.estimatedFee ? `Rp ${service.estimatedFee.toLocaleString("id-ID")}` : "Fasilitasi Pemkot"}
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
                        <Loader2 className="h-4 w-4 animate-spin" /> Mengirimkan Permohonan...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" /> Ajukan Layanan ke {service.agencyName?.split(" ")[0] || "Dinas"}
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
