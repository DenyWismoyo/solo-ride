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
import { GraduationCap, User, Phone, MapPin } from "lucide-react";

export function DisnakerPelatihanBlkForm({ agency, service, onSuccess, onCancel }: CivicSubServiceFormProps) {
  const { user, userData } = useAuthContext();
  const router = useRouter();
  const { isSubmitting, error, submitOrder } = useCivicOrder();

  const [applicantName, setApplicantName] = useState(userData?.displayName || "");
  const [nik, setNik] = useState("");
  const [blkCourse, setBlkCourse] = useState("Barista & Pengolahan Kopi");
  const [sessionBatch, setSessionBatch] = useState("Gelombang I (Pagi: 08.00 - 12.00 WIB)");
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
        customerName: applicantName || userData?.displayName || "Peserta Pelatihan BLK",
        customerPhone: phone,
        serviceType: service.id,
        serviceTitle: service.name,
        targetRole: "government",
        additionalRole: agency.id,
        agencyName: agency.agencyOrCompanyName,
        price: 0,
        pickupLocation: {
          address: "Balai Latihan Kerja (BLK) Surakarta, Jl. Ki Hajar Dewantara",
          lat: -7.5582,
          lng: 110.8521
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
          blkCourse,
          sessionBatch,
          phone,
          address,
          notes,
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
      <div className="space-y-2.5 p-3.5 rounded-2xl bg-orange-50/60 dark:bg-orange-950/20 border border-orange-200/70 dark:border-orange-900/40">
        <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400 pb-1 border-b border-orange-200/60 dark:border-orange-900/40">
          <GraduationCap className="h-4 w-4" />
          <span className="text-xs font-bold">Pendaftaran Pelatihan Vokasi Kerja BLK Surakarta</span>
        </div>

        <CivicSelectField
          label="Pilihan Kejuruan Pelatihan BLK (Gratis APBD)"
          value={blkCourse}
          onChange={setBlkCourse}
          options={[
            "Barista & Pengolahan Kopi",
            "Pengelasan Las Listrik 3G",
            "Teknik Otomotif Sepeda Motor",
            "Digital Marketing & Content Creator",
            "Tata Busana & Menjahit Profesional",
            "Desain Grafis & Multimedia"
          ]}
        />

        <CivicSelectField
          label="Pilihan Sesi Waktu Pelatihan"
          value={sessionBatch}
          onChange={setSessionBatch}
          options={[
            "Gelombang I (Pagi: 08.00 - 12.00 WIB)",
            "Gelombang II (Siang: 13.00 - 17.00 WIB)"
          ]}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <CivicTextField
          label="Nama Lengkap Pendaftar"
          value={applicantName}
          onChange={setApplicantName}
          placeholder="Sesuai KTP..."
          icon={<User className="h-3.5 w-3.5 text-slate-400" />}
          required
        />
        <CivicTextField
          label="Nomor NIK Pendaftar"
          value={nik}
          onChange={(v) => setNik(v.replace(/\D/g, ""))}
          placeholder="16 digit NIK..."
          maxLength={16}
          mono
          required
        />
      </div>

      <CivicTextField
        label="Alamat Rumah Domisili Surakarta"
        value={address}
        onChange={setAddress}
        placeholder="Nama jalan, nomor rumah, RT/RW, Kelurahan..."
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
        label="Biaya Pelatihan & Sertifikasi:"
        sublabel="100% Gratis Subsidi APBD Dinas Tenaga Kerja Kota Surakarta"
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
        submitText="Daftar Pelatihan BLK Gratis"
        onCancel={onCancel}
        buttonBg="bg-orange-600 hover:bg-orange-700"
        shadowColor="shadow-orange-600/20"
      />
    </form>
  );
}
