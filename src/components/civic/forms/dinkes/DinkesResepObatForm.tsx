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
import { Stethoscope, User, Phone, MapPin } from "lucide-react";

export function DinkesResepObatForm({ agency, service, onSuccess, onCancel }: CivicSubServiceFormProps) {
  const { user, userData } = useAuthContext();
  const router = useRouter();
  const { isSubmitting, error, submitOrder } = useCivicOrder();

  const [patientName, setPatientName] = useState(userData?.displayName || "");
  const [nik, setNik] = useState("");
  const [selectedPuskesmas, setSelectedPuskesmas] = useState("Puskesmas Manahan (Jl. Menteri Supeno No. 1)");
  const [medRecordNo, setMedRecordNo] = useState("");
  const [bpjsNo, setBpjsNo] = useState("");
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
        customerName: patientName || userData?.displayName || "Pasien Puskesmas",
        customerPhone: phone,
        serviceType: service.id,
        serviceTitle: service.name,
        targetRole: "government",
        additionalRole: agency.id,
        agencyName: agency.agencyOrCompanyName,
        price: 8000, // Ongkir Koperasi Flat
        pickupLocation: {
          address: selectedPuskesmas,
          lat: -7.5695,
          lng: 110.8285
        },
        dropoffLocation: {
          address,
          lat: addressLat || -7.5615,
          lng: addressLng || 110.8256
        },
        citizenDetails: {
          serviceId: service.id,
          serviceName: service.name,
          patientName,
          nik,
          selectedPuskesmas,
          medRecordNo,
          bpjsNo,
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
      <div className="space-y-2.5 p-3.5 rounded-2xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200/70 dark:border-teal-900/40">
        <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 pb-1 border-b border-teal-200/60 dark:border-teal-900/40">
          <Stethoscope className="h-4 w-4" />
          <span className="text-xs font-bold">Layanan Antar Obat Resep Faskes & Puskesmas Solo</span>
        </div>

        <CivicSelectField
          label="Asal Puskesmas di Surakarta"
          value={selectedPuskesmas}
          onChange={setSelectedPuskesmas}
          options={[
            "Puskesmas Manahan (Jl. Menteri Supeno No. 1)",
            "Puskesmas Sibela Mojosongo",
            "Puskesmas Ngoresan Jebres",
            "Puskesmas Purwosari",
            "Puskesmas Gajahan Pasar Kliwon",
            "Puskesmas Sangkrah",
            "Puskesmas Jayengan Serengan",
            "Puskesmas Pajang Laweyan",
            "Puskesmas Gilingan",
            "Puskesmas Nusukan"
          ]}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <CivicTextField
            label="Nomor Rekam Medis (No. RM)"
            value={medRecordNo}
            onChange={setMedRecordNo}
            placeholder="RM-2026-XXXX..."
            mono
            required
          />
          <CivicTextField
            label="Nomor Kartu BPJS (Opsional)"
            value={bpjsNo}
            onChange={setBpjsNo}
            placeholder="13 digit No. BPJS..."
            mono
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <CivicTextField
          label="Nama Lengkap Pasien"
          value={patientName}
          onChange={setPatientName}
          placeholder="Sesuai KTP / Kartu Berobat..."
          icon={<User className="h-3.5 w-3.5 text-slate-400" />}
          required
        />
        <CivicTextField
          label="Nomor NIK Pasien"
          value={nik}
          onChange={(v) => setNik(v.replace(/\D/g, ""))}
          placeholder="16 digit NIK..."
          maxLength={16}
          mono
          required
        />
      </div>

      <CivicAddressSelector
        label="Alamat Pengantaran Obat ke Rumah"
        value={address}
        onChange={(val, lat, lng) => {
          setAddress(val);
          setAddressLat(lat);
          setAddressLng(lng);
        }}
        required
      />

      <CivicTextField
        label="Nomor WhatsApp Aktif (Konfirmasi Apotek)"
        type="tel"
        value={phone}
        onChange={setPhone}
        icon={<Phone className="h-3.5 w-3.5 text-slate-400" />}
        required
      />

      <CivicTextareaField
        label="Catatan Alergi / Aturan Pengantaran (Opsional)"
        value={notes}
        onChange={setNotes}
        placeholder="Contoh: Obat sirup anak, tolong jangan diguncang, titipkan ke Ibu..."
        rows={2}
      />

      <CivicPriceFooter
        label="Biaya Pengantaran Khusus:"
        sublabel="Standar ongkir flat kurir medis bersertifikat Dinkes"
        priceText="Rp 8.000"
        accentColor="text-teal-600 dark:text-teal-400"
        bgAccent="bg-teal-500/10 border-teal-500/20"
      />

      {error && (
        <p className="text-xs text-rose-500 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
          {error.message}
        </p>
      )}

      <CivicSubmitButton
        isSubmitting={isSubmitting}
        submitText="Pesan Kurir Obat Puskesmas"
        onCancel={onCancel}
        buttonBg="bg-teal-600 hover:bg-teal-700"
        shadowColor="shadow-teal-600/20"
      />
    </form>
  );
}
