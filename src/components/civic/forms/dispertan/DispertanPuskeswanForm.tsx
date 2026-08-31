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
import { Dog, User, Phone, MapPin } from "lucide-react";

export function DispertanPuskeswanForm({ agency, service, onSuccess, onCancel }: CivicSubServiceFormProps) {
  const { user, userData } = useAuthContext();
  const router = useRouter();
  const { isSubmitting, error, submitOrder } = useCivicOrder();

  const [ownerName, setOwnerName] = useState(userData?.displayName || "");
  const [petType, setPetType] = useState("Kucing Domestik / Ras");
  const [puskeswanService, setPuskeswanService] = useState("Pemeriksaan Umum");
  const [riwayatVaksin, setRiwayatVaksin] = useState("");
  const [riwayatObat, setRiwayatObat] = useState("");
  const [petCount, setPetCount] = useState("1");
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
        customerName: ownerName || userData?.displayName || "Pemilik Hewan Solo",
        customerPhone: phone,
        serviceType: service.id,
        serviceTitle: service.name,
        targetRole: "government",
        additionalRole: agency.id,
        agencyName: agency.agencyOrCompanyName,
        price: 0,
        pickupLocation: {
          address: "Puskeswan Solo, Jl. Tentara Pelajar No. 1",
          lat: -7.5512,
          lng: 110.8124
        },
        dropoffLocation: {
          address,
          lat: -7.5621,
          lng: 110.8547
        },
        citizenDetails: {
          serviceId: service.id,
          serviceName: service.name,
          ownerName,
          petType,
          puskeswanService,
          riwayatVaksin,
          riwayatObat,
          petCount,
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
      <div className="space-y-2.5 p-3.5 rounded-2xl bg-lime-50/60 dark:bg-lime-950/20 border border-lime-200/70 dark:border-lime-900/40">
        <div className="flex items-center gap-2 text-lime-800 dark:text-lime-300 pb-1 border-b border-lime-200/60 dark:border-lime-900/40">
          <Dog className="h-4 w-4" />
          <span className="text-xs font-bold">Layanan Dokter Hewan & Puskeswan Keliling Surakarta</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <CivicSelectField
            label="Jenis Hewan Peliharaan / Ternak"
            value={petType}
            onChange={setPetType}
            options={[
              "Kucing Domestik / Ras",
              "Anjing Peliharaan",
              "Unggas / Burung Kicau",
              "Kambing / Domba Ternak",
              "Sapi / Kerbau"
            ]}
          />
          <CivicSelectField
            label="Layanan Medis Veteriner"
            value={puskeswanService}
            onChange={setPuskeswanService}
            options={[
              "Pemeriksaan Umum",
              "Vaksin Rabies",
              "Sterilisasi",
              "Konsultasi",
              "Grooming Medis"
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <CivicTextField
            label="Riwayat Vaksin Terakhir (Opsional)"
            value={riwayatVaksin}
            onChange={setRiwayatVaksin}
            placeholder="Contoh: Rabies Nov 2025"
          />
          <CivicTextField
            label="Riwayat Obat/Alergi (Opsional)"
            value={riwayatObat}
            onChange={setRiwayatObat}
            placeholder="Contoh: Alergi Amoxicillin"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <CivicTextField
          label="Nama Pemilik Hewan"
          value={ownerName}
          onChange={setOwnerName}
          placeholder="Sesuai KTP..."
          icon={<User className="h-3.5 w-3.5 text-slate-400" />}
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
      </div>

      <CivicTextField
        label="Alamat Lokasi Kunjungan Dokter Hewan"
        value={address}
        onChange={setAddress}
        placeholder="Nama jalan, nomor rumah, RT/RW, Kelurahan..."
        icon={<MapPin className="h-3.5 w-3.5 text-slate-400" />}
        required
      />

      <CivicTextareaField
        label="Gejala / Keluhan Kondisi Hewan (Opsional)"
        value={notes}
        onChange={setNotes}
        placeholder="Jelaskan kondisi hewan (lemas, tidak nafsu makan, dll)..."
        rows={2}
      />

      <CivicPriceFooter
        label="Layanan Medis Puskeswan:"
        sublabel="100% Gratis Program Kesehatan Hewan Dispertan Surakarta"
        priceText="GRATIS (Program Dispertan)"
        accentColor="text-lime-700 dark:text-lime-400"
        bgAccent="bg-lime-500/10 border-lime-500/20"
      />

      {error && (
        <p className="text-xs text-rose-500 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
          {error.message}
        </p>
      )}

      <CivicSubmitButton
        isSubmitting={isSubmitting}
        submitText="Jadwalkan Kunjungan Dokter Hewan"
        onCancel={onCancel}
        buttonBg="bg-lime-600 hover:bg-lime-700 text-white"
        shadowColor="shadow-lime-600/20"
      />
    </form>
  );
}
