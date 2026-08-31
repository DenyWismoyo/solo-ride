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
import { Droplet, User, Phone, MapPin, Hospital } from "lucide-react";

export function DinkesDonorDarahForm({ agency, service, onSuccess, onCancel }: CivicSubServiceFormProps) {
  const { user, userData } = useAuthContext();
  const router = useRouter();
  const { isSubmitting, error, submitOrder } = useCivicOrder();

  const [requesterName, setRequesterName] = useState(userData?.displayName || "");
  const [bloodHospital, setBloodHospital] = useState("RSUD Dr. Moewardi Surakarta");
  const [bloodType, setBloodType] = useState("O");
  const [bloodRhesus, setBloodRhesus] = useState("+");
  const [bloodBagsCount, setBloodBagsCount] = useState("2");
  const [urgencyNote, setUrgencyNote] = useState("Tindakan Operasi Darurat");
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
        customerName: requesterName || userData?.displayName || "Pemohon Darah PMI",
        customerPhone: phone,
        serviceType: service.id,
        serviceTitle: service.name,
        targetRole: "government",
        additionalRole: agency.id,
        agencyName: agency.agencyOrCompanyName,
        price: 0, // Prioritas Cepat Darurat
        pickupLocation: {
          address: "Unit Transfusi Darah (UTD) PMI Solo, Jl. Kolonel Sutarto",
          lat: -7.5582,
          lng: 110.8521
        },
        dropoffLocation: {
          address: bloodHospital,
          lat: -7.5621,
          lng: 110.8547
        },
        citizenDetails: {
          serviceId: service.id,
          serviceName: service.name,
          requesterName,
          bloodHospital,
          bloodType: `${bloodType}${bloodRhesus}`,
          bloodBagsCount,
          urgencyNote,
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
      <div className="space-y-2.5 p-3.5 rounded-2xl bg-red-50/60 dark:bg-red-950/20 border border-red-200/70 dark:border-red-900/40">
        <div className="flex items-center gap-2 text-red-700 dark:text-red-400 pb-1 border-b border-red-200/60 dark:border-red-900/40">
          <Droplet className="h-4 w-4" />
          <span className="text-xs font-bold">Mobilisasi Kantong Darah Siaga UTD PMI Solo</span>
        </div>

        <CivicSelectField
          label="Rumah Sakit Tujuan Pengantaran Darah"
          value={bloodHospital}
          onChange={setBloodHospital}
          options={[
            "RSUD Dr. Moewardi Surakarta (Jebres)",
            "RSUP Surakarta",
            "RSUD Kota Surakarta Bung Karno",
            "RS Kasih Ibu Surakarta",
            "RS PKU Muhammadiyah Surakarta",
            "RS DKT Slamet Riyadi",
            "RS Panti Waluyo"
          ]}
        />

        <div className="grid grid-cols-3 gap-2">
          <CivicSelectField
            label="Golongan Darah"
            value={bloodType}
            onChange={setBloodType}
            options={["A", "B", "AB", "O"]}
          />
          <CivicSelectField
            label="Rhesus"
            value={bloodRhesus}
            onChange={setBloodRhesus}
            options={["+", "-"]}
          />
          <CivicTextField
            label="Jumlah Kantong"
            type="number"
            value={bloodBagsCount}
            onChange={setBloodBagsCount}
            mono
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <CivicTextField
          label="Nama Pemohon / Keluarga Pasien"
          value={requesterName}
          onChange={setRequesterName}
          placeholder="Sesuai KTP..."
          icon={<User className="h-3.5 w-3.5 text-slate-400" />}
          required
        />
        <CivicTextField
          label="Nomor WhatsApp Pemohon"
          type="tel"
          value={phone}
          onChange={setPhone}
          icon={<Phone className="h-3.5 w-3.5 text-slate-400" />}
          required
        />
      </div>

      <CivicTextField
        label="Keperluan Darurat Medis"
        value={urgencyNote}
        onChange={setUrgencyNote}
        placeholder="Contoh: Operasi Caesar Cito, Pasien Anemia Akut..."
        required
      />

      <CivicPriceFooter
        label="Prioritas Pengantaran:"
        sublabel="Jalur cepat khusus spesimen darah steril berpendingin"
        priceText="PRIORITAS DARURAT (Rp 0)"
        accentColor="text-red-600 dark:text-red-400"
        bgAccent="bg-red-500/10 border-red-500/20"
      />

      {error && (
        <p className="text-xs text-rose-500 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
          {error.message}
        </p>
      )}

      <CivicSubmitButton
        isSubmitting={isSubmitting}
        submitText="🚨 Panggil Kurir Darah PMI Cito"
        onCancel={onCancel}
        buttonBg="bg-red-600 hover:bg-red-700"
        shadowColor="shadow-red-600/20"
      />
    </form>
  );
}
