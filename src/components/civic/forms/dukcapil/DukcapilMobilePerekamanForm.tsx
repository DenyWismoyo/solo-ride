"use client";

import React, { useState } from "react";
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
import { Accessibility, User, Phone, MapPin, Calendar, Clock } from "lucide-react";

export function DukcapilMobilePerekamanForm({ agency, service, onSuccess, onCancel }: CivicSubServiceFormProps) {
  const { user, userData } = useAuthContext();
  const router = useRouter();
  const { isSubmitting, error, submitOrder } = useCivicOrder();

  const [citizenName, setCitizenName] = useState("");
  const [nik, setNik] = useState("");
  const [reason, setReason] = useState("Lansia Usia >75 Tahun (Tirah Baring)");
  const [kecamatanAsal, setKecamatanAsal] = useState("Laweyan");
  const [address, setAddress] = useState(userData?.address || "Jl. Slamet Riyadi, Surakarta");
  const [phone, setPhone] = useState(userData?.phone || "081234567890");
  const [preferredDate, setPreferredDate] = useState("");
  const [notes, setNotes] = useState("");

  const KECAMATAN_SOLO = ["Laweyan", "Serengan", "Pasar Kliwon", "Jebres", "Banjarsari"];

  const isValidNIKSolo = (nik: string) =>
    nik.length === 16 && nik.startsWith("3372") && /^\d+$/.test(nik);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Silakan login terlebih dahulu.");
      router.push("/login");
      return;
    }

    if (!isValidNIKSolo(nik)) {
      alert("NIK tidak valid. Harus 16 digit dan berawalan 3372 (Surakarta).");
      return;
    }

    const orderId = await submitOrder(
      {
        customerId: user.uid,
        customerName: citizenName || userData?.displayName || "Warga Surakarta",
        customerPhone: phone,
        serviceType: service.id,
        serviceTitle: service.name,
        targetRole: "government",
        additionalRole: agency.id,
        agencyName: agency.agencyOrCompanyName,
        price: 0,
        pickupLocation: {
          address: "Disdukcapil Balai Kota Surakarta",
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
          citizenName,
          nik,
          phone,
          address,
          kecamatanAsal,
          notes,
          reason,
          preferredDate,
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
      <div className="space-y-2.5 p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/70 dark:border-blue-900/40">
        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 pb-1 border-b border-blue-200/60 dark:border-blue-900/40">
          <Accessibility className="h-4 w-4" />
          <span className="text-xs font-bold">Layanan Jemput Bola Perekaman KTP Lansia / Difabel</span>
        </div>

        <CivicSelectField
          label="Kategori Kondisi Pemohon"
          value={reason}
          onChange={setReason}
          options={[
            "Lansia Usia >75 Tahun (Tirah Baring)",
            "Warga Difabel dengan Keterbatasan Mobilitas",
            "Pasien Sakit Menahun di Rumah",
            "ODGJ dalam Pendampingan Sosial"
          ]}
        />

        <CivicTextField
          label="Jadwal Pilihan Kunjungan Tim Mobile"
          type="date"
          value={preferredDate}
          onChange={setPreferredDate}
          icon={<Calendar className="h-3.5 w-3.5 text-blue-500" />}
          required
        />
        
        <CivicSelectField
          label="Kecamatan Domisili"
          value={kecamatanAsal}
          onChange={setKecamatanAsal}
          options={KECAMATAN_SOLO}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <CivicTextField
          label="Nama Lengkap Warga yang Direkam"
          value={citizenName}
          onChange={setCitizenName}
          placeholder="Nama sesuai KK..."
          icon={<User className="h-3.5 w-3.5 text-slate-400" />}
          required
        />
        <div>
          <CivicTextField
            label="Nomor NIK Warga"
            value={nik}
            onChange={(v) => setNik(v.replace(/\D/g, ""))}
            placeholder="16 digit NIK..."
            maxLength={16}
            mono
            required
          />
          {nik.length === 16 && !isValidNIKSolo(nik) && (
            <p className="text-xs text-rose-500 mt-1 ml-1 font-medium">NIK tidak sesuai wilayah Kota Surakarta (3372...)</p>
          )}
        </div>
      </div>

      <CivicTextField
        label="Alamat Rumah Lokasi Perekaman"
        value={address}
        onChange={setAddress}
        placeholder="Nama jalan, nomor rumah, RT/RW, Kelurahan..."
        icon={<MapPin className="h-3.5 w-3.5 text-slate-400" />}
        required
      />

      <CivicTextField
        label="Nomor WhatsApp Keluarga / Pendamping"
        type="tel"
        value={phone}
        onChange={setPhone}
        icon={<Phone className="h-3.5 w-3.5 text-slate-400" />}
        required
      />

      <CivicTextareaField
        label="Keterangan Kondisi Khusus (Opsional)"
        value={notes}
        onChange={setNotes}
        placeholder="Informasi kondisi fisik warga untuk persiapan peralatan biometrik..."
        rows={2}
      />

      <CivicPriceFooter
        label="Biaya Layanan Jemput Bola:"
        sublabel="100% Gratis Subsidi APBD Pemerintah Kota Surakarta"
        priceText="GRATIS (Subsidi APBD)"
        accentColor="text-emerald-600 dark:text-emerald-400"
        bgAccent="bg-emerald-500/10 border-emerald-500/20"
      />

      {error && (
        <p className="text-xs text-rose-500 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
          {error.message}
        </p>
      )}

      <CivicSubmitButton
        isSubmitting={isSubmitting}
        submitText="Ajukan Perekaman Mobile KTP"
        onCancel={onCancel}
        buttonBg="bg-blue-600 hover:bg-blue-700"
        shadowColor="shadow-blue-600/20"
      />
    </form>
  );
}
