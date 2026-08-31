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
import { Truck, User, Phone, MapPin, Calendar } from "lucide-react";

export function DishubBookingKirForm({ agency, service, onSuccess, onCancel }: CivicSubServiceFormProps) {
  const { user, userData } = useAuthContext();
  const router = useRouter();
  const { isSubmitting, error, submitOrder } = useCivicOrder();

  const [ownerName, setOwnerName] = useState(userData?.displayName || "");
  const [nik, setNik] = useState("");
  const [vehicleType, setVehicleType] = useState("Mobil Angkutan Barang / Pikap");
  const [licensePlate, setLicensePlate] = useState("AD ");
  const [bookingDate, setBookingDate] = useState("");
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
        customerName: ownerName || userData?.displayName || "Pemilik Kendaraan",
        customerPhone: phone,
        serviceType: service.id,
        serviceTitle: service.name,
        targetRole: "government",
        additionalRole: agency.id,
        agencyName: agency.agencyOrCompanyName,
        price: 0, // Retribusi dibayar di loket Dishub
        pickupLocation: {
          address: "Gedung Uji Berkala Kendaraan (KIR) Dishub Solo, Manahan",
          lat: -7.5512,
          lng: 110.8124
        },
        dropoffLocation: {
          address: "Gedung Uji Berkala Kendaraan (KIR) Dishub Solo, Manahan",
          lat: -7.5512,
          lng: 110.8124
        },
        citizenDetails: {
          serviceId: service.id,
          serviceName: service.name,
          ownerName,
          nik,
          vehicleType,
          licensePlate,
          bookingDate,
          phone,
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
      <div className="space-y-2.5 p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/70 dark:border-blue-900/40">
        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 pb-1 border-b border-blue-200/60 dark:border-blue-900/40">
          <Truck className="h-4 w-4" />
          <span className="text-xs font-bold">Booking Online Antrean Uji KIR Kendaraan Bermotor</span>
        </div>

        <CivicSelectField
          label="Jenis Kendaraan yang Diuji"
          value={vehicleType}
          onChange={setVehicleType}
          options={[
            "Mobil Angkutan Barang / Pikap",
            "Truk Ringan (Light Truck / Box)",
            "Truk Berat / Tronton",
            "Mobil Penumpang Umum (Angkot / Taksi)",
            "Bus Besar / Medium"
          ]}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <CivicTextField
            label="Nomor Polisi (Plat Nomor AD)"
            value={licensePlate}
            onChange={(v) => setLicensePlate(v.toUpperCase())}
            placeholder="Contoh: AD 8124 OA..."
            mono
            required
          />
          <CivicTextField
            label="Tanggal Rencana Uji KIR"
            type="date"
            value={bookingDate}
            onChange={setBookingDate}
            icon={<Calendar className="h-3.5 w-3.5 text-blue-500" />}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <CivicTextField
          label="Nama Pemilik / Pengemudi"
          value={ownerName}
          onChange={setOwnerName}
          placeholder="Sesuai STNK / KTP..."
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

      <CivicPriceFooter
        label="Tiket Antrean Booking:"
        sublabel="Bebas Biaya Booking (Biaya Retribusi Pengujian Dibayar di Loket Dishub)"
        priceText="GRATIS BOOKING"
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
        submitText="Konfirmasi Booking Uji KIR"
        onCancel={onCancel}
        buttonBg="bg-blue-600 hover:bg-blue-700"
        shadowColor="shadow-blue-600/20"
      />
    </form>
  );
}
