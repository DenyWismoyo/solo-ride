"use client";

import React, { useState, useEffect } from "react";
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
import { Flame, Phone, MapPin, User, AlertOctagon, Navigation } from "lucide-react";

export function DamkarPanicDispatchForm({ agency, service, onSuccess, onCancel }: CivicSubServiceFormProps) {
  const { user, userData } = useAuthContext();
  const router = useRouter();
  const { isSubmitting, error, submitOrder } = useCivicOrder();

  const [reporterName, setReporterName] = useState(userData?.displayName || "");
  const [jenisDarurat, setJenisDarurat] = useState("kebakaran");
  const [tingkatKeparahan, setTingkatKeparahan] = useState("besar");
  const [emergencyAddress, setEmergencyAddress] = useState(userData?.address || "");
  const [phone, setPhone] = useState(userData?.phone || "081234567890");
  const [notes, setNotes] = useState("");

  const [gpsLat, setGpsLat] = useState<number | null>(null);
  const [gpsLng, setGpsLng] = useState<number | null>(null);
  const [gpsStatus, setGpsStatus] = useState<"idle" | "detecting" | "found" | "error">("idle");

  useEffect(() => {
    setGpsStatus("detecting");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsLat(pos.coords.latitude);
          setGpsLng(pos.coords.longitude);
          setGpsStatus("found");
        },
        () => setGpsStatus("error"),
        { timeout: 8000, enableHighAccuracy: true }
      );
    } else {
      setGpsStatus("error");
    }
  }, []);

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
        customerName: reporterName || userData?.displayName || "Pelapor Darurat Damkar",
        customerPhone: phone,
        serviceType: service.id,
        serviceTitle: service.name,
        targetRole: "government",
        additionalRole: agency.id,
        agencyName: agency.agencyOrCompanyName,
        price: 0,
        pickupLocation: {
          address: "Mako Damkar Kota Surakarta, Jl. Supomo No. 58",
          lat: -7.5614,
          lng: 110.8192
        },
        dropoffLocation: {
          address: emergencyAddress,
          lat: gpsLat || -7.5621,
          lng: gpsLng || 110.8547
        },
        citizenDetails: {
          serviceId: service.id,
          serviceName: service.name,
          reporterName,
          jenisDarurat,
          tingkatKeparahan,
          gpsLat,
          gpsLng,
          alamatManual: emergencyAddress,
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
      <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-2xl space-y-2">
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <Flame className="h-5 w-5 animate-pulse" />
          <span className="text-xs font-black uppercase tracking-wider">Alarm Siaga 1 Damkar Kota Surakarta</span>
        </div>
        <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed mb-3">
          Sistem otomatis mendeteksi lokasi GPS Anda. Armada terdekat akan segera meluncur.
        </p>
        
        {/* GPS Status Indicator */}
        <div className="flex items-center gap-2 p-2 rounded-xl bg-white/60 dark:bg-black/20 border border-red-100 dark:border-red-900/40">
          <Navigation className={`w-4 h-4 ${gpsStatus === 'detecting' ? 'animate-spin text-amber-500' : gpsStatus === 'found' ? 'text-emerald-500' : 'text-red-500'}`} />
          <span className="text-xs font-semibold">
            {gpsStatus === "detecting" && <span className="text-amber-600">Mendeteksi lokasi GPS...</span>}
            {gpsStatus === "found" && <span className="text-emerald-600">Lokasi GPS berhasil dideteksi ✅</span>}
            {gpsStatus === "error" && <span className="text-red-600">GPS gagal. Isi alamat manual! ⚠️</span>}
          </span>
        </div>

        <CivicSelectField
          label="Kategori Darurat"
          value={jenisDarurat}
          onChange={setJenisDarurat}
          options={[
            { label: "Kebakaran", value: "kebakaran" },
            { label: "Ledakan", value: "ledakan" },
            { label: "Gas Bocor Berbahaya", value: "gas_bocor" },
            { label: "Orang Terjebak", value: "orang_terjebak" }
          ]}
        />
        
        <CivicSelectField
          label="Tingkat Keparahan"
          value={tingkatKeparahan}
          onChange={setTingkatKeparahan}
          options={[
            { label: "Besar (Api terlihat membesar / menyebar)", value: "besar" },
            { label: "Sedang (Asap tebal / api di 1 titik)", value: "sedang" },
            { label: "Kecil (Baru mulai terbakar)", value: "kecil" }
          ]}
        />
      </div>

      <CivicTextField
        label="Alamat Detail / Patokan Titik Darurat"
        value={emergencyAddress}
        onChange={setEmergencyAddress}
        placeholder="Nama jalan, nomor rumah, RT/RW, dekat patokan apa..."
        icon={<MapPin className="h-3.5 w-3.5 text-red-500" />}
        required
      />

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
          label="Nomor Telepon Darurat"
          type="tel"
          value={phone}
          onChange={setPhone}
          icon={<Phone className="h-3.5 w-3.5 text-slate-400" />}
          required
        />
      </div>

      <CivicTextareaField
        label="Petunjuk Khusus Akses Armada (Opsional)"
        value={notes}
        onChange={setNotes}
        placeholder="Contoh: Jalan gang masuk sempit, mobil tangki tidak bisa masuk..."
        rows={2}
      />

      <CivicPriceFooter
        label="Layanan Pemadam & Rescue:"
        sublabel="100% Darurat Gratis Non-Stop Pemkot Surakarta"
        priceText="GRATIS NON-STOP"
        accentColor="text-red-600 dark:text-red-400"
        bgAccent="bg-red-500/10 border-red-500/20"
      />

      {error && (
        <p className="text-xs text-rose-500 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
          {error.message}
        </p>
      )}

      <a href="tel:02717630133" className="flex items-center justify-center gap-2 w-full p-2.5 rounded-xl border-2 border-red-600 text-red-600 dark:text-red-400 font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors mb-2">
        <Phone className="w-4 h-4" /> Hubungi Call Center 0271-7630133
      </a>

      <CivicSubmitButton
        isSubmitting={isSubmitting}
        submitText="🚨 DISPATCH DAMKAR SEKARANG"
        onCancel={onCancel}
        buttonBg="bg-red-600 hover:bg-red-700 font-black tracking-wide"
        shadowColor="shadow-red-600/30"
      />
    </form>
  );
}
