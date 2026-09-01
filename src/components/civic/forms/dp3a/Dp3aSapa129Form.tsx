"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { useCivicOrder } from "@/hooks/useCivicOrder";
import { CivicSubServiceFormProps } from "../types";
import { 
  CivicTextField, 
  CivicSelectField, 
  CivicTextareaField, 
  CivicPriceFooter, 
  CivicSubmitButton 
} from "@/components/civic/shared/CivicFormControls";
import { Lock, User, Phone, MapPin } from "lucide-react";
import { generateAnonCode } from "@/lib/privacy";

export function Dp3aSapa129Form({ agency, service, onSuccess, onCancel }: CivicSubServiceFormProps) {
  const { user, userData } = useAuthContext();
  const router = useRouter();
  const { isSubmitting, error, submitOrder } = useCivicOrder();

  const [isAnonymous, setIsAnonymous] = useState(true); // Phase 2: Default ANONIM!
  const [reporterName, setReporterName] = useState(userData?.displayName || "");
  const [jenisKasus, setJenisKasus] = useState("Kekerasan Dalam Rumah Tangga (KDRT)");
  const [butuhPendampingan, setButuhPendampingan] = useState(false);
  const [safeContact, setSafeContact] = useState(userData?.phone || "081234567890");
  const [address, setAddress] = useState(userData?.address || "Jl. Slamet Riyadi, Surakarta");
  const [confidentialNotes, setConfidentialNotes] = useState("");
  const [anonCode, setAnonCode] = useState<string>("");

  useEffect(() => {
    setAnonCode(generateAnonCode());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Silakan login terlebih dahulu.");
      router.push("/login");
      return;
    }

    const effectiveName = isAnonymous
      ? anonCode
      : (reporterName || anonCode);

    const orderId = await submitOrder(
      {
        customerId: user.uid,
        customerName: effectiveName,
        customerPhone: safeContact,
        serviceType: service.id,
        serviceTitle: service.name,
        targetRole: "government",
        additionalRole: agency.id,
        agencyName: agency.agencyOrCompanyName,
        price: 0,
        pickupLocation: {
          address: "PUSPAGA DP3A Balai Kota Surakarta",
          lat: -7.5695,
          lng: 110.8285
        },
        dropoffLocation: {
          address,
          lat: -7.5621,
          lng: 110.8547
        },
        citizenDetails: {
          serviceId: service.id,
          serviceName: service.name,
          isAnonymous,
          namaAtauKode: effectiveName,
          jenisKasus,
          lokasiAman: address,
          butuhPendampingan,
          safeContact,
          confidentialNotes,
          submittedAt: new Date().toISOString()
        }
      },
      { requiresOtp: false }
    );

    if (orderId) {
      onSuccess(orderId);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <div className="space-y-2.5 p-3.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/70 dark:border-purple-900/40">
        <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400 pb-1 border-b border-purple-200/60 dark:border-purple-900/40">
          <Lock className="h-4 w-4" />
          <span className="text-xs font-bold">Layanan Kerahasiaan Penuh Terproteksi SAPA 129 Solo</span>
        </div>

        {/* Phase 2: Mode Anonim Toggle */}
        <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-2xl border border-purple-200/60 dark:border-purple-800/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-purple-700 dark:text-purple-300">🛡️ Mode Anonim</p>
              <p className="text-[11px] text-purple-600 dark:text-purple-400">
                Identitas Anda terlindungi sepenuhnya. Hanya kode kasus yang tersimpan.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
              />
              <div className="w-9 h-5 bg-purple-200 peer-focus:outline-none rounded-full peer dark:bg-purple-900 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-purple-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
          {isAnonymous && anonCode && (
            <p className="text-[10px] font-medium text-purple-500 mt-2 p-1.5 bg-white/50 dark:bg-black/20 rounded-lg inline-block">
              Kode Laporan Anda: <b>{anonCode}</b>
            </p>
          )}
        </div>

        <CivicSelectField
          label="Jenis Kasus / Kekerasan"
          value={jenisKasus}
          onChange={setJenisKasus}
          options={[
            "Kekerasan Dalam Rumah Tangga (KDRT)",
            "Kekerasan Seksual",
            "Perdagangan Orang (Trafficking)",
            "Kekerasan terhadap Anak",
            "Penelantaran",
            "Butuh Perlindungan Fisik Segera"
          ]}
        />

        <div className="flex items-center justify-between mt-2 px-1">
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Butuh Pendampingan Langsung?</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={butuhPendampingan}
              onChange={(e) => setButuhPendampingan(e.target.checked)}
            />
            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {!isAnonymous && (
          <CivicTextField
            label="Nama Lengkap (Opsional)"
            value={reporterName}
            onChange={setReporterName}
            placeholder="Nama Anda atau inisial..."
            icon={<User className="h-3.5 w-3.5 text-slate-400" />}
          />
        )}
        <CivicTextField
          label="Nomor Kontak WhatsApp yang Aman"
          type="tel"
          value={safeContact}
          onChange={setSafeContact}
          icon={<Phone className="h-3.5 w-3.5 text-slate-400" />}
          required
        />
      </div>

      <CivicTextField
        label="Alamat Aman / Lokasi Saat Ini"
        value={address}
        onChange={setAddress}
        placeholder="Alamat rumah atau lokasi yang aman..."
        icon={<MapPin className="h-3.5 w-3.5 text-slate-400" />}
        required
      />

      <CivicTextareaField
        label="Uraian Masalah / Permohonan (Kerahasiaan Dijamin)"
        value={confidentialNotes}
        onChange={setConfidentialNotes}
        placeholder="Tuliskan secara singkat kronologi / masalah yang dihadapi..."
        rows={3}
      />

      <CivicPriceFooter
        label="Layanan Perlindungan:"
        sublabel="100% Gratis Tanpa Biaya di bawah pengawasan DP3A Surakarta"
        priceText="GRATIS & TERPROTEKSI"
        accentColor="text-purple-600 dark:text-purple-400"
        bgAccent="bg-purple-500/10 border-purple-500/20"
      />

      {error && (
        <p className="text-xs text-rose-500 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
          {error.message}
        </p>
      )}

      <CivicSubmitButton
        isSubmitting={isSubmitting}
        submitText={isAnonymous ? "Kirim Laporan Secara Anonim" : "Kirim Laporan SAPA 129"}
        onCancel={onCancel}
        buttonBg="bg-purple-600 hover:bg-purple-700"
        shadowColor="shadow-purple-600/20"
      />
    </form>
  );
}
