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
import { TreePine, User, Phone, MapPin } from "lucide-react";

export function DlhLaporPohonForm({ agency, service, onSuccess, onCancel }: CivicSubServiceFormProps) {
  const { user, userData } = useAuthContext();
  const router = useRouter();
  const { isSubmitting, error, submitOrder } = useCivicOrder();

  const [reporterName, setReporterName] = useState(userData?.displayName || "");
  const [treeHazardCondition, setTreeHazardCondition] = useState("Pohon Miring Membahayakan Kabel PLN / Rumah");
  const [locationName, setLocationName] = useState("");
  const [phone, setPhone] = useState(userData?.phone || "081234567890");
  const [description, setDescription] = useState("");

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
        customerName: reporterName || userData?.displayName || "Pelapor Pohon Rawan",
        customerPhone: phone,
        serviceType: service.id,
        serviceTitle: service.name,
        targetRole: "government",
        additionalRole: agency.id,
        agencyName: agency.agencyOrCompanyName,
        price: 0,
        pickupLocation: {
          address: locationName || "Surakarta",
          lat: -7.5695,
          lng: 110.8285
        },
        dropoffLocation: {
          address: "Posko Perantingan & Kebersihan DLH Solo, Manahan",
          lat: -7.5512,
          lng: 110.8124
        },
        citizenDetails: {
          serviceId: service.id,
          serviceName: service.name,
          reporterName,
          treeHazardCondition,
          locationName,
          phone,
          description,
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
      <div className="space-y-2.5 p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/40">
        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 pb-1 border-b border-emerald-200/60 dark:border-emerald-900/40">
          <TreePine className="h-4 w-4" />
          <span className="text-xs font-bold">Laporan Pohon Rawan Tumbang & Perantingan DLH</span>
        </div>

        <CivicSelectField
          label="Kondisi Bahaya Pohon / Dahan"
          value={treeHazardCondition}
          onChange={setTreeHazardCondition}
          options={[
            "Pohon Miring Membahayakan Kabel PLN / Rumah",
            "Pohon Sudah Tumbang Menutup Sebagian Badan Jalan",
            "Dahan Kering Rawan Patah Butuh Perantingan",
            "Akar Pohon Merusak Saluran Air / Trotoar"
          ]}
        />

        <CivicTextField
          label="Titik Lokasi Pohon"
          value={locationName}
          onChange={setLocationName}
          placeholder="Contoh: Depan Taman Balekambang, Jl. Ahmad Yani..."
          icon={<MapPin className="h-3.5 w-3.5 text-emerald-600" />}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <CivicTextField
          label="Nama Pelapor"
          value={reporterName}
          onChange={setReporterName}
          placeholder="Nama Anda..."
          icon={<User className="h-3.5 w-3.5 text-slate-400" />}
          required
        />
        <CivicTextField
          label="Nomor WhatsApp Pelapor"
          type="tel"
          value={phone}
          onChange={setPhone}
          icon={<Phone className="h-3.5 w-3.5 text-slate-400" />}
          required
        />
      </div>

      <CivicTextareaField
        label="Keterangan Detail Lokasi / Akses Truk Crane"
        value={description}
        onChange={setDescription}
        placeholder="Informasi kondisi sekitar pohon untuk persiapan armada pemotong pohon..."
        rows={2}
      />

      <CivicPriceFooter
        label="Biaya Penanganan Perantingan:"
        sublabel="100% Layanan Kebersihan & Keselamatan Lingkungan Pemkot Surakarta"
        priceText="GRATIS (Layanan Publik)"
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
        submitText="Kirim Laporan Pohon ke DLH"
        onCancel={onCancel}
        buttonBg="bg-emerald-600 hover:bg-emerald-700"
        shadowColor="shadow-emerald-600/20"
      />
    </form>
  );
}
