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
import { Heart, User, Phone, MapPin, Calendar } from "lucide-react";

export function DinkesProlanisForm({ agency, service, onSuccess, onCancel }: CivicSubServiceFormProps) {
  const { user, userData } = useAuthContext();
  const router = useRouter();
  const { isSubmitting, error, submitOrder } = useCivicOrder();

  const [patientName, setPatientName] = useState(userData?.displayName || "");
  const [nik, setNik] = useState("");
  const [prolanisCategory, setProlanisCategory] = useState("Diabetes Melitus Tipe 2");
  const [faskesBpjs, setFaskesBpjs] = useState("Puskesmas Manahan Surakarta");
  const [bpjsNo, setBpjsNo] = useState("");
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
        customerName: patientName || userData?.displayName || "Pasien Prolanis",
        customerPhone: phone,
        serviceType: service.id,
        serviceTitle: service.name,
        targetRole: "government",
        additionalRole: agency.id,
        agencyName: agency.agencyOrCompanyName,
        price: 8000,
        pickupLocation: {
          address: faskesBpjs,
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
          patientName,
          nik,
          prolanisCategory,
          faskesBpjs,
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
          <Heart className="h-4 w-4" />
          <span className="text-xs font-bold">Distribusi Obat Rutin Pasien Prolanis BPJS</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <CivicSelectField
            label="Kategori Penyakit Kronis Prolanis"
            value={prolanisCategory}
            onChange={setProlanisCategory}
            options={[
              "Diabetes Melitus Tipe 2",
              "Hipertensi Primer / Esensial",
              "Penyakit Jantung Koroner",
              "Kombinasi Diabetes & Hipertensi"
            ]}
          />
          <CivicTextField
            label="Nomor Kartu BPJS Kesehatan"
            value={bpjsNo}
            onChange={setBpjsNo}
            placeholder="13 digit No. BPJS..."
            mono
            required
          />
        </div>

        <CivicSelectField
          label="Faskes Tingkat I (FKTP) Terdaftar"
          value={faskesBpjs}
          onChange={setFaskesBpjs}
          options={[
            "Puskesmas Manahan Surakarta",
            "Puskesmas Sibela Mojosongo",
            "Puskesmas Ngoresan Jebres",
            "Puskesmas Purwosari",
            "Klinik Pratama Rawat Jalan Solo"
          ]}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <CivicTextField
          label="Nama Pasien Prolanis"
          value={patientName}
          onChange={setPatientName}
          placeholder="Sesuai kartu BPJS..."
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

      <CivicTextField
        label="Alamat Rumah Pengantaran Obat"
        value={address}
        onChange={setAddress}
        placeholder="Nama jalan, nomor rumah, RT/RW, Kelurahan..."
        icon={<MapPin className="h-3.5 w-3.5 text-slate-400" />}
        required
      />

      <CivicTextField
        label="Nomor WhatsApp Pasien / Keluarga"
        type="tel"
        value={phone}
        onChange={setPhone}
        icon={<Phone className="h-3.5 w-3.5 text-slate-400" />}
        required
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
        submitText="Jadwalkan Antar Obat Prolanis"
        onCancel={onCancel}
        buttonBg="bg-teal-600 hover:bg-teal-700"
        shadowColor="shadow-teal-600/20"
      />
    </form>
  );
}
