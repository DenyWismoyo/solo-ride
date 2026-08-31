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
import { AlertTriangle, User, Phone, MapPin } from "lucide-react";

export function DishubLaporLalinForm({ agency, service, onSuccess, onCancel }: CivicSubServiceFormProps) {
  const { user, userData } = useAuthContext();
  const router = useRouter();
  const { isSubmitting, error, submitOrder } = useCivicOrder();

  const [reporterName, setReporterName] = useState(userData?.displayName || "");
  const [trafficIssueType, setTrafficIssueType] = useState("Kemacetan Parah / Traffic Light Mati");
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
        customerName: reporterName || userData?.displayName || "Warga / Driver Pelapor",
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
          address: "Command Center CCROOM Dishub Solo",
          lat: -7.5512,
          lng: 110.8124
        },
        citizenDetails: {
          serviceId: service.id,
          serviceName: service.name,
          reporterName,
          trafficIssueType,
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
      <div className="space-y-2.5 p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/70 dark:border-blue-900/40">
        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 pb-1 border-b border-blue-200/60 dark:border-blue-900/40">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-xs font-bold">Laporan Lalu Lintas CCROOM Command Center Dishub</span>
        </div>

        <CivicSelectField
          label="Kategori Kejadian Lalu Lintas"
          value={trafficIssueType}
          onChange={setTrafficIssueType}
          options={[
            "Kemacetan Parah / Traffic Light Mati",
            "Rambu Lalu Lintas Roboh / Rusak",
            "Jalan Berlubang Membahayakan Pengendara",
            "Pohon Tumbang Menutup Sebagian Ruas Jalan",
            "Parkir Liar Menutup Jalur Lambat / BST"
          ]}
        />

        <CivicTextField
          label="Lokasi Titik Kejadian"
          value={locationName}
          onChange={setLocationName}
          placeholder="Contoh: Perempatan Panggung Jebres, Jl. Urip Sumoharjo..."
          icon={<MapPin className="h-3.5 w-3.5 text-blue-500" />}
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
        label="Deskripsi Kondisi Lapangan"
        value={description}
        onChange={setDescription}
        placeholder="Jelaskan secara ringkas situasi kemacetan / bahaya..."
        rows={2}
        required
      />

      <CivicPriceFooter
        label="Layanan Pengaduan Lalin:"
        sublabel="Ditindaklanjuti langsung regu reaksi cepat CCROOM Dishub Solo"
        priceText="GRATIS (Layanan Publik)"
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
        submitText="Kirim Laporan ke CCROOM"
        onCancel={onCancel}
        buttonBg="bg-blue-600 hover:bg-blue-700"
        shadowColor="shadow-blue-600/20"
      />
    </form>
  );
}
