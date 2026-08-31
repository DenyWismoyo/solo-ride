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
  CivicSubmitButton,
  CivicAddressSelector
} from "@/components/civic/shared/CivicFormControls";
import { Briefcase, User, Phone, MapPin } from "lucide-react";

export function DisnakerKartuKuningForm({ agency, service, onSuccess, onCancel }: CivicSubServiceFormProps) {
  const { user, userData } = useAuthContext();
  const router = useRouter();
  const { isSubmitting, error, submitOrder } = useCivicOrder();

  const [applicantName, setApplicantName] = useState(userData?.displayName || "");
  const [nik, setNik] = useState("");
  const [educationLevel, setEducationLevel] = useState("SMA / SMK Sederajat");
  const [educationMajor, setEducationMajor] = useState("");
  const [address, setAddress] = useState(userData?.address || "");
  const [addressLat, setAddressLat] = useState<number | undefined>();
  const [addressLng, setAddressLng] = useState<number | undefined>();
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
        customerName: applicantName || userData?.displayName || "Pencari Kerja Solo",
        customerPhone: phone,
        serviceType: service.id,
        serviceTitle: service.name,
        targetRole: "government",
        additionalRole: agency.id,
        agencyName: agency.agencyOrCompanyName,
        price: 10000,
        pickupLocation: {
          address: "Dinas Tenaga Kerja Kota Surakarta, Jebres",
          lat: -7.5582,
          lng: 110.8521
        },
        dropoffLocation: {
          address,
          lat: addressLat || -7.5615,
          lng: addressLng || 110.8256
        },
        citizenDetails: {
          serviceId: service.id,
          serviceName: service.name,
          applicantName,
          nik,
          educationLevel,
          educationMajor,
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
      <div className="space-y-2.5 p-3.5 rounded-2xl bg-orange-50/60 dark:bg-orange-950/20 border border-orange-200/70 dark:border-orange-900/40">
        <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400 pb-1 border-b border-orange-200/60 dark:border-orange-900/40">
          <Briefcase className="h-4 w-4" />
          <span className="text-xs font-bold">Layanan Antar Kartu Kuning AK-1 (Pencari Kerja)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <CivicSelectField
            label="Pendidikan Terakhir"
            value={educationLevel}
            onChange={setEducationLevel}
            options={[
              "SD / Sederajat",
              "SMP / Sederajat",
              "SMA / SMK Sederajat",
              "Diploma (D3 / D4)",
              "Sarjana (S1 / S2)",
              "Magister (S2 / S3)"
            ]}
          />
          <CivicTextField
            label="Jurusan / Bidang Keahlian"
            value={educationMajor}
            onChange={setEducationMajor}
            placeholder="Contoh: Teknik Informatika, Akuntansi..."
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <CivicTextField
          label="Nama Lengkap Pemohon"
          value={applicantName}
          onChange={setApplicantName}
          placeholder="Sesuai KTP / Ijazah..."
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

      <CivicAddressSelector
        label="Alamat Pengantaran Fisik Kartu AK-1"
        value={address}
        onChange={(val, lat, lng) => {
          setAddress(val);
          setAddressLat(lat);
          setAddressLng(lng);
        }}
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
        label="Biaya Pengantaran Fisik Dokumen:"
        sublabel="Sudah disubsidi program Disnaker Pemkot Surakarta"
        priceText="Rp 10.000"
        accentColor="text-orange-600 dark:text-orange-400"
        bgAccent="bg-orange-500/10 border-orange-500/20"
      />

      {error && (
        <p className="text-xs text-rose-500 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
          {error.message}
        </p>
      )}

      <CivicSubmitButton
        isSubmitting={isSubmitting}
        submitText="Ajukan Kartu Kuning AK-1"
        onCancel={onCancel}
        buttonBg="bg-orange-600 hover:bg-orange-700"
        shadowColor="shadow-orange-600/20"
      />
    </form>
  );
}
