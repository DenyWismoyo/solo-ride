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
import { GraduationCap, User, Phone, MapPin, Clock } from "lucide-react";

export function DisdikAntarSekolahForm({ agency, service, onSuccess, onCancel }: CivicSubServiceFormProps) {
  const { user, userData } = useAuthContext();
  const router = useRouter();
  const { isSubmitting, error, submitOrder } = useCivicOrder();

  const [studentName, setStudentName] = useState("");
  const [studentNisn, setStudentNisn] = useState("");
  const [schoolName, setSchoolName] = useState("SD Negeri Mangkubumen Surakarta");
  const [schoolGrade, setSchoolGrade] = useState("Kelas 4");
  const [schoolTripType, setSchoolTripType] = useState("Antar & Jemput (Pulang Pergi)");
  const [parentName, setParentName] = useState(userData?.displayName || "");
  const [address, setAddress] = useState(userData?.address || "");
  const [addressLat, setAddressLat] = useState<number | undefined>();
  const [addressLng, setAddressLng] = useState<number | undefined>();
  const [phone, setPhone] = useState(userData?.phone || "081234567890");
  const [notes, setNotes] = useState("");
  const [catatanKhusus, setCatatanKhusus] = useState("");

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
        customerName: parentName || userData?.displayName || "Orang Tua Siswa",
        customerPhone: phone,
        serviceType: service.id,
        serviceTitle: service.name,
        targetRole: "government",
        additionalRole: agency.id,
        agencyName: agency.agencyOrCompanyName,
        price: 8000, // Ongkir Khusus Pelajar Bersubsidi
        pickupLocation: {
          address,
          lat: addressLat || -7.5615,
          lng: addressLng || 110.8256
        },
        dropoffLocation: {
          address: schoolName,
          lat: -7.5583,
          lng: 110.8569
        },
        citizenDetails: {
          serviceId: service.id,
          serviceName: service.name,
          studentName,
          studentNisn,
          schoolName,
          schoolGrade,
          schoolTripType,
          parentName,
          phone,
          address,
          notes,
          catatanKhusus,
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
      <div className="space-y-2.5 p-3.5 rounded-2xl bg-sky-50/60 dark:bg-sky-950/20 border border-sky-200/70 dark:border-sky-900/40">
        <div className="flex items-center gap-2 text-sky-700 dark:text-sky-400 pb-1 border-b border-sky-200/60 dark:border-sky-900/40">
          <GraduationCap className="h-4 w-4" />
          <span className="text-xs font-bold">Layanan Antar Jemput Aman Siswa Sekolah Surakarta</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <CivicTextField
            label="Nama Lengkap Siswa"
            value={studentName}
            onChange={setStudentName}
            placeholder="Nama putra/putri..."
            required
          />
          <CivicTextField
            label="Nomor NISN Siswa"
            value={studentNisn}
            onChange={(v) => setStudentNisn(v.replace(/\D/g, ""))}
            placeholder="10 digit NISN..."
            maxLength={10}
            mono
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="sm:col-span-2">
            <CivicTextField
              label="Nama Sekolah di Surakarta"
              value={schoolName}
              onChange={setSchoolName}
              placeholder="Contoh: SMP Negeri 1 Surakarta..."
              required
            />
          </div>
          <CivicSelectField
            label="Layanan Perjalanan"
            value={schoolTripType}
            onChange={setSchoolTripType}
            options={[
              "Antar & Jemput (Pulang Pergi)",
              "Hanya Antar Pagi (Berangkat)",
              "Hanya Jemput Sore (Pulang)"
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <CivicTextField
          label="Nama Orang Tua / Wali"
          value={parentName}
          onChange={setParentName}
          placeholder="Nama ayah/ibu..."
          icon={<User className="h-3.5 w-3.5 text-slate-400" />}
          required
        />
        <CivicTextField
          label="Nomor WhatsApp Orang Tua"
          type="tel"
          value={phone}
          onChange={setPhone}
          icon={<Phone className="h-3.5 w-3.5 text-slate-400" />}
          required
        />
      </div>

      <CivicAddressSelector
        label="Alamat Rumah Titik Penjemputan"
        value={address}
        onChange={(val, lat, lng) => {
          setAddress(val);
          setAddressLat(lat);
          setAddressLng(lng);
        }}
        required
      />

      <CivicTextareaField
        label="Catatan Khusus (Opsional)"
        value={catatanKhusus}
        onChange={setCatatanKhusus}
        placeholder="Contoh: Jemput di gerbang timur, bawa helm anak kecil, dll..."
        rows={2}
      />

      <CivicPriceFooter
        label="Tarif Khusus Pelajar Bersubsidi:"
        sublabel="Driver mitra resmi tervalidasi SKCK & perlengkapan helm SNI anak"
        priceText="Rp 8.000 / Trip"
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
        submitText="Daftarkan Antar Jemput Sekolah"
        onCancel={onCancel}
        buttonBg="bg-sky-600 hover:bg-sky-700"
        shadowColor="shadow-sky-600/20"
      />
    </form>
  );
}
