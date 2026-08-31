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
import { MessageSquare, User, Phone, CalendarClock, Building } from "lucide-react";

export function BapendaKonsultasiPajakForm({ agency, service, onSuccess, onCancel }: CivicSubServiceFormProps) {
  const { user, userData } = useAuthContext();
  const router = useRouter();
  const { isSubmitting, error, submitOrder } = useCivicOrder();

  const [namaPemohon, setNamaPemohon] = useState(userData?.displayName || "");
  const [jenisKonsultasi, setJenisKonsultasi] = useState("Konsultasi NPWPD Baru");
  const [namaUsaha, setNamaUsaha] = useState("");
  const [pertanyaanKonsultasi, setPertanyaanKonsultasi] = useState("");
  const [jadwalKonsultasi, setJadwalKonsultasi] = useState("");
  const [phone, setPhone] = useState(userData?.phone || "081234567890");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Silakan login terlebih dahulu.");
      router.push("/login");
      return;
    }

    const orderId = await submitOrder(
      {
        customerId: user.uid,
        customerName: namaPemohon || userData?.displayName || "Warga Surakarta",
        customerPhone: phone,
        serviceType: service.id,
        serviceTitle: service.name,
        targetRole: "government",
        additionalRole: agency.id,
        agencyName: agency.agencyOrCompanyName,
        price: 0,
        pickupLocation: {
          address: "Layanan Konsultasi Online Bapenda Surakarta",
          lat: -7.5695,
          lng: 110.8285
        },
        dropoffLocation: {
          address: "Konsultasi Virtual / Telepon",
          lat: -7.5621,
          lng: 110.8547
        },
        citizenDetails: {
          serviceId: service.id,
          serviceName: service.name,
          namaPemohon,
          jenisKonsultasi,
          namaUsaha,
          pertanyaanKonsultasi,
          jadwalKonsultasi,
          phone,
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
      <div className="space-y-2.5 p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200/70 dark:border-indigo-900/40">
        <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 pb-1 border-b border-indigo-200/60 dark:border-indigo-900/40">
          <MessageSquare className="h-4 w-4" />
          <span className="text-xs font-bold">Layanan Konsultasi Pajak Daerah (Virtual/Telepon)</span>
        </div>

        <CivicSelectField
          label="Topik Konsultasi"
          value={jenisKonsultasi}
          onChange={setJenisKonsultasi}
          options={[
            "Konsultasi NPWPD Baru",
            "Pengajuan Keberatan Pajak",
            "Program Insentif Pajak UMKM",
            "Pemutihan Denda Pajak",
            "Konsultasi Pajak Reklame / Hiburan"
          ]}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <CivicTextField
            label="Nama Badan Usaha / Toko (Opsional)"
            value={namaUsaha}
            onChange={setNamaUsaha}
            placeholder="Contoh: CV. Solo Makmur"
            icon={<Building className="h-3.5 w-3.5 text-indigo-500" />}
          />
          <CivicTextField
            label="Rencana Waktu Konsultasi"
            type="datetime-local"
            value={jadwalKonsultasi}
            onChange={setJadwalKonsultasi}
            icon={<CalendarClock className="h-3.5 w-3.5 text-indigo-500" />}
            required
          />
        </div>
      </div>
      
      <CivicTextareaField
        label="Daftar Pertanyaan Utama"
        value={pertanyaanKonsultasi}
        onChange={setPertanyaanKonsultasi}
        placeholder="Tuliskan secara singkat masalah atau pertanyaan pajak Anda agar petugas kami dapat menyiapkan data yang relevan..."
        rows={3}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <CivicTextField
          label="Nama Pemohon Konsultasi"
          value={namaPemohon}
          onChange={setNamaPemohon}
          placeholder="Nama lengkap Anda..."
          icon={<User className="h-3.5 w-3.5 text-slate-400" />}
          required
        />
        <CivicTextField
          label="Nomor WhatsApp (Untuk Dihubungi)"
          type="tel"
          value={phone}
          onChange={setPhone}
          icon={<Phone className="h-3.5 w-3.5 text-slate-400" />}
          required
        />
      </div>

      <CivicPriceFooter
        label="Biaya Konsultasi Pajak:"
        sublabel="Konsultasi dilayani secara gratis pada jam kerja dinas."
        priceText="GRATIS"
        accentColor="text-indigo-600 dark:text-indigo-400"
        bgAccent="bg-indigo-500/10 border-indigo-500/20"
      />

      {error && (
        <p className="text-xs text-rose-500 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
          {error.message}
        </p>
      )}

      <CivicSubmitButton
        isSubmitting={isSubmitting}
        submitText="Jadwalkan Konsultasi Pajak"
        onCancel={onCancel}
        buttonBg="bg-indigo-600 hover:bg-indigo-700"
        shadowColor="shadow-indigo-600/20"
      />
    </form>
  );
}
