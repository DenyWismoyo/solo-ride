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
import { FileCheck2, User, Phone, MapPin, Building } from "lucide-react";

export function DukcapilAntarKtpForm({ agency, service, onSuccess, onCancel }: CivicSubServiceFormProps) {
  const { user, userData } = useAuthContext();
  const router = useRouter();
  const { isSubmitting, error, submitOrder } = useCivicOrder();

  const [fullName, setFullName] = useState(userData?.displayName || "");
  const [nik, setNik] = useState("");
  const [docType, setDocType] = useState("KTP-el (Cetak Baru / Penggantian)");
  const [selectedOffice, setSelectedOffice] = useState("Disdukcapil Balai Kota Surakarta");
  const [kecamatanAsal, setKecamatanAsal] = useState("Laweyan");
  const [address, setAddress] = useState(userData?.address || "");
  const [addressLat, setAddressLat] = useState<number | undefined>();
  const [addressLng, setAddressLng] = useState<number | undefined>();
  const [phone, setPhone] = useState(userData?.phone || "081234567890");
  const [notes, setNotes] = useState("");

  const KECAMATAN_SOLO = ["Laweyan", "Serengan", "Pasar Kliwon", "Jebres", "Banjarsari"];

  const isValidNIKSolo = (nik: string) =>
    nik.length === 16 && nik.startsWith("3372") && /^\d+$/.test(nik);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Silakan login terlebih dahulu.");
      router.push("/login");
      return;
    }
    
    if (!isValidNIKSolo(nik)) {
      alert("NIK tidak valid. Harus 16 digit dan berawalan 3372 (Surakarta).");
      return;
    }

    const orderId = await submitOrder(
      {
        customerId: user.uid,
        customerName: fullName || userData?.displayName || "Warga Surakarta",
        customerPhone: phone,
        serviceType: service.id,
        serviceTitle: service.name,
        targetRole: "government",
        additionalRole: agency.id,
        agencyName: agency.agencyOrCompanyName,
        price: 10000,
        pickupLocation: {
          address: selectedOffice,
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
          fullName,
          nik,
          phone,
          address,
          kecamatanAsal,
          notes,
          docType,
          selectedOffice,
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
          <span className="text-xs font-bold">Layanan Antar Dokumen Kependudukan Bersegel Resmi</span>
        </div>

        <CivicSelectField
          label="Jenis Dokumen Kependudukan"
          value={docType}
          onChange={setDocType}
          options={[
            "KTP-el (Cetak Baru / Penggantian)",
            "Kartu Keluarga (KK Barcode Resmi)",
            "Surat Keterangan Pindah (SKPWNI)",
            "Biodata Kependudukan WNI"
          ]}
        />

        <CivicSelectField
          label="Loket Pengambilan Dokumen Disdukcapil"
          value={selectedOffice}
          onChange={setSelectedOffice}
          options={[
            "Disdukcapil Balai Kota Surakarta (Jl. Jend. Sudirman No. 2)",
            "Kantor Pelayanan Terpadu Kec. Jebres",
            "Kantor Pelayanan Terpadu Kec. Banjarsari",
            "Kantor Pelayanan Terpadu Kec. Laweyan",
            "Kantor Pelayanan Terpadu Kec. Serengan",
            "Kantor Pelayanan Terpadu Kec. Pasar Kliwon"
          ]}
          icon={<Building className="h-3.5 w-3.5 text-blue-500" />}
        />
        
        <CivicSelectField
          label="Kecamatan Domisili"
          value={kecamatanAsal}
          onChange={setKecamatanAsal}
          options={KECAMATAN_SOLO}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <CivicTextField
          label="Nama Lengkap Pemohon"
          value={fullName}
          onChange={setFullName}
          placeholder="Sesuai KTP..."
          icon={<User className="h-3.5 w-3.5 text-slate-400" />}
          required
        />
        <div>
          <CivicTextField
            label="Nomor NIK Pemohon"
            value={nik}
            onChange={(v) => setNik(v.replace(/\D/g, ""))}
            placeholder="16 digit NIK..."
            maxLength={16}
            mono
            required
          />
          {nik.length === 16 && !isValidNIKSolo(nik) && (
            <p className="text-xs text-rose-500 mt-1 ml-1 font-medium">NIK tidak sesuai wilayah Kota Surakarta (3372...)</p>
          )}
        </div>
      </div>

      <CivicAddressSelector
        label="Alamat Pengantaran Dokumen"
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
        label="Catatan Tambahan (Opsional)"
        value={notes}
        onChange={setNotes}
        placeholder="Petunjuk khusus lokasi rumah atau penerima..."
        rows={2}
      />

      <CivicPriceFooter
        label="Biaya Pengantaran Khusus:"
        sublabel="Sudah disubsidi program Antar Dokumen Pemkot Surakarta"
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
        submitText="Ajukan Pengantaran Dokumen"
        onCancel={onCancel}
        buttonBg="bg-blue-600 hover:bg-blue-700"
        shadowColor="shadow-blue-600/20"
      />
    </form>
  );
}
