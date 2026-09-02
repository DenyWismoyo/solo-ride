"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { useCivicOrder } from "@/hooks/useCivicOrder";
import { CivicSubServiceFormProps } from "../types";
import { 
  CivicTextField, 
  CivicTextareaField, 
  CivicPriceFooter, 
  CivicSubmitButton,
  CivicAddressSelector
} from "@/components/civic/shared/CivicFormControls";
import { FileCheck2, User, Phone } from "lucide-react";
import { isEmergencyService } from "@/constants/emergencyServices";

export function DynamicCivicServiceForm({ 
  agency, 
  service, 
  onSuccess, 
  onCancel 
}: CivicSubServiceFormProps) {
  const { user, userData } = useAuthContext();
  const router = useRouter();
  const { isSubmitting, error, submitOrder } = useCivicOrder();

  const [fullName, setFullName] = useState(userData?.displayName || "");
  const [nik, setNik] = useState("");
  const [phone, setPhone] = useState(userData?.phone || "081234567890");
  const [address, setAddress] = useState(userData?.address || "");
  const [addressLat, setAddressLat] = useState<number | undefined>();
  const [addressLng, setAddressLng] = useState<number | undefined>();
  const [notes, setNotes] = useState("");

  const isEmergency = isEmergencyService(service.id);
  const isSubsidized = service.feeLabel?.toLowerCase().includes("gratis") || 
                       service.feeLabel?.toLowerCase().includes("subsidi");
  const finalPrice = isSubsidized ? 0 : 12000;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Silakan login terlebih dahulu untuk mengajukan layanan ini.");
      router.push("/login");
      return;
    }

    const orderId = await submitOrder({
      customerId: user.uid,
      customerName: fullName || userData?.displayName || "Warga Surakarta",
      customerPhone: phone,
      serviceType: service.id,
      serviceTitle: service.name,
      targetRole: "government",
      additionalRole: agency.id,
      agencyName: agency.agencyOrCompanyName || agency.name,
      price: finalPrice,
      pickupLocation: {
        address: agency.agencyOrCompanyName || "Kantor Pelayanan Pemkot Surakarta",
        lat: -7.5695,
        lng: 110.8285
      },
      dropoffLocation: {
        address: address || "Kantor Dinas / Sesuai Titik Lokasi Warga",
        lat: addressLat || -7.5621,
        lng: addressLng || 110.8547
      },
      citizenDetails: {
        nikOrRef: nik || "-",
        applicantName: fullName,
        serviceCategory: service.name,
        urgencyLevel: isEmergency ? "Darurat Kritis" : "Normal",
        notes: notes || "-",
        submittedAt: new Date().toISOString()
      }
    });

    if (orderId) {
      onSuccess(orderId);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Service Info Banner */}
      <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 space-y-1.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-bold text-blue-700 dark:text-blue-300">
            {agency.agencyOrCompanyName}
          </span>
          <span className="font-bold text-[11px] bg-blue-500/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
            {isEmergency ? "🚨 Layanan Darurat 24 Jam" : "Resmi Pemkot Solo"}
          </span>
        </div>
        <p className="text-slate-600 dark:text-zinc-300 leading-relaxed text-[11px]">
          {service.description || "Layanan administrasi dan program publik terintegrasi bagi seluruh warga Kota Surakarta."}
        </p>
      </div>

      {/* 1. Identity Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <CivicTextField
          label="Nama Lengkap Pemohon:"
          value={fullName}
          onChange={setFullName}
          placeholder="Nama sesuai KTP..."
          required
          icon={<User className="h-3.5 w-3.5 text-blue-500" />}
        />
        <CivicTextField
          label="NIK KTP (Surakarta):"
          value={nik}
          onChange={(v) => setNik(v.replace(/\D/g, ""))}
          placeholder="16 digit NIK..."
          maxLength={16}
          mono
          required={!isEmergency}
          icon={<FileCheck2 className="h-3.5 w-3.5 text-blue-500" />}
        />
      </div>

      <CivicTextField
        label="Nomor WhatsApp Aktif:"
        value={phone}
        onChange={setPhone}
        placeholder="08xxxxxxxxxx"
        required
        icon={<Phone className="h-3.5 w-3.5 text-blue-500" />}
      />

      {/* 2. Address Picker with Saved Address First */}
      <CivicAddressSelector
        label="Alamat Pengantaran / Domisili Layanan"
        value={address}
        onChange={(val: string, lat?: number, lng?: number) => {
          setAddress(val);
          setAddressLat(lat);
          setAddressLng(lng);
        }}
        required={!isEmergency}
      />

      {/* 3. Notes Field */}
      <CivicTextareaField
        label="Catatan & Keperluan Khusus:"
        value={notes}
        onChange={setNotes}
        placeholder="Tuliskan rincian dokumen atau keterangan pendukung untuk petugas dinas..."
        rows={3}
      />

      {/* Price Footer */}
      <CivicPriceFooter
        label="Biaya Layanan & Pengantaran:"
        sublabel="Terintegrasi sistem layanan resmi dinas Kota Surakarta"
        priceText={isSubsidized ? "Gratis (Subsidi Pemkot)" : `Rp ${finalPrice.toLocaleString("id-ID")}`}
        accentColor="text-blue-600 dark:text-blue-400"
        bgAccent="bg-blue-500/10 border-blue-500/20"
      />

      {error && (
        <p className="text-xs text-rose-500 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
          {error.message}
        </p>
      )}

      {/* Submit Button */}
      <CivicSubmitButton
        submitText={isEmergency ? "🚨 Kirim Panggilan Darurat Sekarang" : "Kirim Permohonan ke Dinas"}
        isSubmitting={isSubmitting}
        onCancel={onCancel}
        buttonBg="bg-blue-600 hover:bg-blue-700"
        shadowColor="shadow-blue-600/20"
      />
    </form>
  );
}
