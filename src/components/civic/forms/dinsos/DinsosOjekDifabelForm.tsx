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
import { Accessibility, Stethoscope, User, Phone, MapPin, Clock } from "lucide-react";

export function DinsosOjekDifabelForm({ agency, service, onSuccess, onCancel }: CivicSubServiceFormProps) {
  const { user, userData } = useAuthContext();
  const router = useRouter();
  const { isSubmitting, error, submitOrder } = useCivicOrder();

  const [citizenName, setCitizenName] = useState(userData?.displayName || "");
  const [nik, setNik] = useState("");
  const [disabilityType, setDisabilityType] = useState("Disabilitas Fisik (Pengguna Kursi Roda)");
  const [assistiveDevice, setAssistiveDevice] = useState("Kursi Roda Lipat");
  const [destinationFaskes, setDestinationFaskes] = useState("RSUD Dr. Moewardi Surakarta (Jebres)");
  const [pickupTime, setPickupTime] = useState("08:30 WIB");
  const [companionName, setCompanionName] = useState("");
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
        customerName: citizenName || userData?.displayName || "Warga Difabel/Lansia Solo",
        customerPhone: phone,
        serviceType: service.id,
        serviceTitle: service.name,
        targetRole: "government",
        additionalRole: agency.id,
        agencyName: agency.agencyOrCompanyName,
        price: 0, // 100% Subsidi APBD
        pickupLocation: {
          address,
          lat: addressLat || -7.5615,
          lng: addressLng || 110.8256
        },
        dropoffLocation: {
          address: destinationFaskes,
          lat: -7.5583,
          lng: 110.8569
        },
        citizenDetails: {
          serviceId: service.id,
          serviceName: service.name,
          citizenName,
          nik,
          disabilityType,
          assistiveDevice,
          destinationFaskes,
          pickupTime,
          companionName,
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
      <div className="space-y-2.5 p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/70 dark:border-rose-900/40">
        <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 pb-1 border-b border-rose-200/60 dark:border-rose-900/40">
          <Accessibility className="h-4 w-4" />
          <span className="text-xs font-bold">Armada Khusus Ramah Difabel & Lansia (Subsidi 100%)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <CivicSelectField
            label="Kategori Kondisi Pemohon"
            value={disabilityType}
            onChange={setDisabilityType}
            options={[
              "Disabilitas Fisik (Pengguna Kursi Roda)",
              "Disabilitas Netra / Low Vision",
              "Disabilitas Tuli / Wicara",
              "Lansia Usia >75 Tahun",
              "Pasien Pasca Operasi / Stroke"
            ]}
          />
          <CivicSelectField
            label="Alat Bantu yang Dibawa"
            value={assistiveDevice}
            onChange={setAssistiveDevice}
            options={[
              "Kursi Roda Lipat",
              "Kruk / Tongkat",
              "Tongkat Tunanetra",
              "Tidak Membawa Alat Bantu"
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <CivicSelectField
            label="Fasilitas Kesehatan Tujuan"
            value={destinationFaskes}
            onChange={setDestinationFaskes}
            options={[
              "RSUD Dr. Moewardi Surakarta (Jebres)",
              "RSUD Bung Karno Surakarta (Semanggi)",
              "Puskesmas Manahan Surakarta",
              "RS Kasih Ibu (Slamet Riyadi)",
              "RS PKU Muhammadiyah Surakarta",
              "RS DKT Slamet Riyadi"
            ]}
            icon={<Stethoscope className="h-3.5 w-3.5 text-rose-500" />}
          />
          <CivicTextField
            label="Jam Penjemputan Armada"
            value={pickupTime}
            onChange={setPickupTime}
            placeholder="Contoh: 08:30 WIB..."
            icon={<Clock className="h-3.5 w-3.5 text-slate-400" />}
            required
          />
        </div>

        <CivicTextField
          label="Nama Pendamping / Keluarga (Opsional)"
          value={companionName}
          onChange={setCompanionName}
          placeholder="Nama anggota keluarga yang ikut menemani..."
          icon={<User className="h-3.5 w-3.5 text-slate-400" />}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <CivicTextField
          label="Nama Lengkap Warga"
          value={citizenName}
          onChange={setCitizenName}
          placeholder="Sesuai KTP..."
          icon={<User className="h-3.5 w-3.5 text-slate-400" />}
          required
        />
        <CivicTextField
          label="Nomor NIK Warga"
          value={nik}
          onChange={(v) => setNik(v.replace(/\D/g, ""))}
          placeholder="16 digit NIK..."
          maxLength={16}
          mono
          required
        />
      </div>

      <CivicAddressSelector
        label="Alamat Titik Penjemputan"
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

      <CivicTextareaField
        label="Catatan Kondisi Fisik untuk Driver (Opsional)"
        value={notes}
        onChange={setNotes}
        placeholder="Contoh: Perlu bantuan saat naik mobil/motor, mohon siapkan ruang bagasi kursi roda..."
        rows={2}
      />

      <CivicPriceFooter
        label="Biaya Transportasi Siaga:"
        sublabel="100% Subsidi APBD Kota Surakarta (Gratis Warga)"
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
        submitText="Pesan Armada Siaga Difabel"
        onCancel={onCancel}
        buttonBg="bg-rose-600 hover:bg-rose-700"
        shadowColor="shadow-rose-600/20"
      />
    </form>
  );
}
