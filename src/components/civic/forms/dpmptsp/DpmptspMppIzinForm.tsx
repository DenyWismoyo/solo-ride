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
import { FileCheck2, User, Phone, MapPin } from "lucide-react";

export function DpmptspMppIzinForm({ agency, service, onSuccess, onCancel }: CivicSubServiceFormProps) {
  const { user, userData } = useAuthContext();
  const router = useRouter();
  const { isSubmitting, error, submitOrder } = useCivicOrder();

  const [applicantName, setApplicantName] = useState(userData?.displayName || "");
  const [nik, setNik] = useState("");
  const [mppPermitType, setMppPermitType] = useState("Nomor Induk Berusaha (NIB OSS RBA)");
  const [mppRegistrationNo, setMppRegistrationNo] = useState("");
  const [address, setAddress] = useState(userData?.address || "Jl. Slamet Riyadi, Surakarta");
  const [phone, setPhone] = useState(userData?.phone || "081234567890");
  const [notes, setNotes] = useState("");

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
        customerName: applicantName || userData?.displayName || "Pemohon Izin MPP",
        customerPhone: phone,
        serviceType: service.id,
        serviceTitle: service.name,
        targetRole: "government",
        additionalRole: agency.id,
        agencyName: agency.agencyOrCompanyName,
        price: 10000,
        pickupLocation: {
          address: "Mal Pelayanan Publik (MPP) Jend. Sudirman Surakarta",
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
          applicantName,
          nik,
          mppPermitType,
          mppRegistrationNo,
          phone,
          address,
          notes,
          submittedAt: new Date().toISOString()
        }
      },
      { requiresOtp: true }
    );

    if (orderId) {
      onSuccess(orderId);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <div className="space-y-2.5 p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/70 dark:border-blue-900/40">
        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 pb-1 border-b border-blue-200/60 dark:border-blue-900/40">
          <FileCheck2 className="h-4 w-4" />
          <span className="text-xs font-bold">Layanan Antar Dokumen Perizinan Mal Pelayanan Publik (MPP)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <CivicSelectField
            label="Jenis Dokumen Perizinan"
            value={mppPermitType}
            onChange={setMppPermitType}
            options={[
              "Nomor Induk Berusaha (NIB OSS RBA)",
              "Persetujuan Bangunan Gedung (PBG)",
              "Sertifikat Laik Fungsi (SLF)",
              "Sertifikat Standar (SS)",
              "Izin Usaha Industri (IUI)",
              "Surat Izin Praktik (SIP) Tenaga Kesehatan",
              "Sertifikat PIRT Dinas Kesehatan",
              "Izin Usaha Reklame & Rekomendasi"
            ]}
          />
          <CivicTextField
            label="Nomor Registrasi MPP (Opsional)"
            value={mppRegistrationNo}
            onChange={setMppRegistrationNo}
            placeholder="Contoh: MPP-2026-XXXX..."
            mono
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <CivicTextField
          label="Nama Pemohon / Penanggung Jawab"
          value={applicantName}
          onChange={setApplicantName}
          placeholder="Sesuai KTP..."
          icon={<User className="h-3.5 w-3.5 text-slate-400" />}
          required
        />
        <CivicTextField
          label="Nomor NIK Pemohon"
          value={nik}
          onChange={(v) => setNik(v.replace(/\D/g, ""))}
          placeholder="16 digit NIK..."
          maxLength={16}
          mono
          required
        />
      </div>

      <CivicTextField
        label="Alamat Pengantaran Dokumen Izin"
        value={address}
        onChange={setAddress}
        placeholder="Nama jalan, nomor gedung/rumah, RT/RW, Kelurahan..."
        icon={<MapPin className="h-3.5 w-3.5 text-slate-400" />}
        required
      />

      <CivicTextField
        label="Nomor WhatsApp Aktif"
        type="tel"
        value={phone}
        onChange={setPhone}
        icon={<Phone className="h-3.5 w-3.5 text-slate-400" />}
        required
      />

      <CivicPriceFooter
        label="Biaya Pengantaran Khusus:"
        sublabel="Dokumen fisik diantar bersegel resmi dari loket MPP Sudirman"
        priceText="Rp 10.000"
        accentColor="text-blue-600 dark:text-blue-400"
        bgAccent="bg-blue-500/10 border-blue-500/20"
      />

      {error && (
        <p className="text-xs text-rose-500 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
          {error.message}
        </p>
      )}

      <CivicSubmitButton
        isSubmitting={isSubmitting}
        submitText="Ajukan Pengantaran Dokumen Izin"
        onCancel={onCancel}
        buttonBg="bg-blue-600 hover:bg-blue-700"
        shadowColor="shadow-blue-600/20"
      />
    </form>
  );
}
