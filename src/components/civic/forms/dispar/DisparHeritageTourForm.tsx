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
import { Compass, User, Phone, MapPin, Calendar } from "lucide-react";

export function DisparHeritageTourForm({ agency, service, onSuccess, onCancel }: CivicSubServiceFormProps) {
  const { user, userData } = useAuthContext();
  const router = useRouter();
  const { isSubmitting, error, submitOrder } = useCivicOrder();

  const [touristName, setTouristName] = useState(userData?.displayName || "");
  const HERITAGE_DESTINATIONS = [
    "Keraton Kasunanan",
    "Kampung Batik Kauman",
    "Pura Mangkunegaran",
    "Pasar Triwindu",
    "Museum Radya Pustaka",
    "Benteng Vastenburg"
  ];
  const [destinasiDipilih, setDestinasiDipilih] = useState<string[]>([]);
  const [tourParticipants, setTourParticipants] = useState("2 Orang");
  const [tourDate, setTourDate] = useState("");
  const [pickupPoint, setPickupPoint] = useState("Stasiun Solo Balapan");
  const [phone, setPhone] = useState(userData?.phone || "081234567890");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Silakan login terlebih dahulu.");
      router.push("/login");
      return;
    }
    if (destinasiDipilih.length === 0) {
      alert("Silakan pilih minimal 1 destinasi wisata.");
      return;
    }

    const orderId = await submitOrder(
      {
        customerId: user.uid,
        customerName: touristName || userData?.displayName || "Wisatawan Heritage Solo",
        customerPhone: phone,
        serviceType: service.id,
        serviceTitle: service.name,
        targetRole: "government",
        additionalRole: agency.id,
        agencyName: agency.agencyOrCompanyName,
        price: 50000, // Paket Tur Ojek Heritage
        pickupLocation: {
          address: pickupPoint,
          lat: -7.5582,
          lng: 110.8214
        },
        dropoffLocation: {
          address: "Keraton Kasunanan Surakarta",
          lat: -7.5791,
          lng: 110.8278
        },
        citizenDetails: {
          serviceId: service.id,
          serviceName: service.name,
          citizenName: touristName,
          touristName,
          heritageRoutes: destinasiDipilih,
          tourParticipants,
          tourDate,
          pickupPoint,
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
      <div className="space-y-2.5 p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40">
        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 pb-1 border-b border-amber-200/60 dark:border-amber-900/40">
          <Compass className="h-4 w-4" />
          <span className="text-xs font-bold">Tur Wisata Budaya & Destinasi Heritage Surakarta</span>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Pilih Destinasi Wisata Heritage (Bisa &gt;1)</label>
          <div className="grid grid-cols-2 gap-1.5">
            {HERITAGE_DESTINATIONS.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setDestinasiDipilih(prev =>
                  prev.includes(item)
                    ? prev.filter(i => i !== item)
                    : [...prev, item]
                )}
                className={`p-2 rounded-xl text-left border text-[11px] transition-all cursor-pointer ${
                  destinasiDipilih.includes(item)
                    ? "bg-amber-500/15 border-amber-500/50 text-amber-800 dark:text-amber-300 font-bold shadow-xs"
                    : "bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:border-slate-300"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <CivicSelectField
            label="Jumlah Peserta Tur"
            value={tourParticipants}
            onChange={setTourParticipants}
            options={["1 Orang", "2 Orang", "3 - 5 Orang (Keluarga)", "Rombongan (> 5 Orang)"]}
          />
          <CivicTextField
            label="Tanggal Rencana Kunjungan Tur"
            type="date"
            value={tourDate}
            onChange={setTourDate}
            icon={<Calendar className="h-3.5 w-3.5 text-amber-600" />}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <CivicTextField
          label="Nama Pemesan / Wisatawan"
          value={touristName}
          onChange={setTouristName}
          placeholder="Nama Anda..."
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
        label="Titik Penjemputan Wisatawan"
        value={pickupPoint}
        onChange={setPickupPoint}
        placeholder="Contoh: Hotel Novotel Solo, Stasiun Balapan, Bandara Adi Soemarmo..."
        icon={<MapPin className="h-3.5 w-3.5 text-amber-600" />}
        required
      />

      <CivicPriceFooter
        label="Paket Tur Driver Mitra HPI:"
        sublabel="Driver mitra lokal bersertifikasi pemandu wisata budaya Dispar Solo"
        priceText="Rp 50.000 / Rute"
        accentColor="text-amber-700 dark:text-amber-400"
        bgAccent="bg-amber-500/10 border-amber-500/20"
      />

      {error && (
        <p className="text-xs text-rose-500 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
          {error.message}
        </p>
      )}

      <CivicSubmitButton
        isSubmitting={isSubmitting}
        submitText="Booking Tur Heritage Solo"
        onCancel={onCancel}
        buttonBg="bg-amber-600 hover:bg-amber-700"
        shadowColor="shadow-amber-600/20"
      />
    </form>
  );
}
