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
import { User, Phone, MapPin, FileText } from "lucide-react";

export function DisdikAntarIjazahForm({ agency, service, onSuccess, onCancel }: CivicSubServiceFormProps) {
  const { user, userData } = useAuthContext();
  const router = useRouter();
  const { isSubmitting, error, submitOrder } = useCivicOrder();

  const [namaAlumnus, setNamaAlumnus] = useState("");
  const [studentNisn, setStudentNisn] = useState("");
  const [schoolName, setSchoolName] = useState("SMA Negeri 1 Surakarta");
  const [jenisLegalisir, setJenisLegalisir] = useState("Legalisir Ijazah");
  const [jumlahDokumen, setJumlahDokumen] = useState("1 - 5 Lembar");
  
  const [pemohonName, setPemohonName] = useState(userData?.displayName || "");
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
        customerName: pemohonName || userData?.displayName || "Pemohon Dokumen",
        customerPhone: phone,
        serviceType: service.id,
        serviceTitle: service.name,
        targetRole: "government",
        additionalRole: agency.id,
        agencyName: agency.agencyOrCompanyName,
        price: 15000, 
        pickupLocation: {
          address: schoolName,
          lat: -7.5583,
          lng: 110.8569
        },
        dropoffLocation: {
          address,
          lat: -7.5621,
          lng: 110.8547
        },
        citizenDetails: {
          serviceId: service.id,
          serviceName: service.name,
          namaAlumnus,
          studentNisn,
          schoolName,
          jenisLegalisir,
          jumlahDokumen,
          pemohonName,
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
      <div className="space-y-2.5 p-3.5 rounded-2xl bg-sky-50/60 dark:bg-sky-950/20 border border-sky-200/70 dark:border-sky-900/40">
        <div className="flex items-center gap-2 text-sky-700 dark:text-sky-400 pb-1 border-b border-sky-200/60 dark:border-sky-900/40">
          <FileText className="h-4 w-4" />
          <span className="text-xs font-bold">Layanan Kurir Dokumen Legalisir Ijazah & Transkrip</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <CivicTextField
            label="Nama Lengkap Alumnus"
            value={namaAlumnus}
            onChange={setNamaAlumnus}
            placeholder="Nama sesuai ijazah..."
            required
          />
          <CivicTextField
            label="Nomor NISN Alumnus"
            value={studentNisn}
            onChange={(v) => setStudentNisn(v.replace(/\D/g, ""))}
            placeholder="10 digit NISN..."
            maxLength={10}
            mono
            required
          />
        </div>

        <CivicTextField
          label="Sekolah / Instansi Asal"
          value={schoolName}
          onChange={setSchoolName}
          placeholder="Contoh: SMA Negeri 1 Surakarta..."
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <CivicSelectField
            label="Jenis Dokumen Legalisir"
            value={jenisLegalisir}
            onChange={setJenisLegalisir}
            options={[
              "Legalisir Ijazah",
              "Legalisir Transkrip Nilai / SKHUN",
              "Surat Keterangan Lulus",
              "Mutasi Siswa"
            ]}
          />
          <CivicSelectField
            label="Jumlah Dokumen (Lembar)"
            value={jumlahDokumen}
            onChange={setJumlahDokumen}
            options={[
              "1 - 5 Lembar",
              "6 - 10 Lembar",
              "Lebih dari 10 Lembar"
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <CivicTextField
          label="Nama Pemohon / Penerima"
          value={pemohonName}
          onChange={setPemohonName}
          placeholder="Nama Anda..."
          icon={<User className="h-3.5 w-3.5 text-slate-400" />}
          required
        />
        <CivicTextField
          label="Nomor WhatsApp Penerima"
          type="tel"
          value={phone}
          onChange={setPhone}
          icon={<Phone className="h-3.5 w-3.5 text-slate-400" />}
          required
        />
      </div>

      <CivicTextField
        label="Alamat Pengiriman Dokumen"
        value={address}
        onChange={setAddress}
        placeholder="Nama jalan, nomor rumah, RT/RW, Kelurahan..."
        icon={<MapPin className="h-3.5 w-3.5 text-slate-400" />}
        required
      />

      <CivicTextareaField
        label="Catatan Tambahan (Opsional)"
        value={notes}
        onChange={setNotes}
        placeholder="Contoh: Titipkan di satpam, dll..."
        rows={2}
      />

      <CivicPriceFooter
        label="Tarif Kurir Dokumen Resmi:"
        sublabel="Dilengkapi verifikasi OTP Serah Terima & Asuransi Kehilangan"
        priceText="Rp 15.000 / Pengiriman"
        accentColor="text-sky-600 dark:text-sky-400"
        bgAccent="bg-sky-500/10 border-sky-500/20"
      />

      {error && (
        <p className="text-xs text-rose-500 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
          {error.message}
        </p>
      )}

      <CivicSubmitButton
        isSubmitting={isSubmitting}
        submitText="Order Kurir Dokumen"
        onCancel={onCancel}
        buttonBg="bg-sky-600 hover:bg-sky-700"
        shadowColor="shadow-sky-600/20"
      />
    </form>
  );
}
