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
import { LifeBuoy, Phone, MapPin, User } from "lucide-react";

export function DinsosTanggapBencanaForm({ agency, service, onSuccess, onCancel }: CivicSubServiceFormProps) {
  const { user, userData } = useAuthContext();
  const router = useRouter();
  const { isSubmitting, error, submitOrder } = useCivicOrder();

  const [reporterName, setReporterName] = useState(userData?.displayName || "");
  const [nik, setNik] = useState("");
  const [disasterType, setDisasterType] = useState("Banjir Luapan Kali Pepe / Bengawan Solo");
  const [affectedKkCount, setAffectedKkCount] = useState("25");
  const [shelterLocation, setShelterLocation] = useState("Balai RW 04 Sangkrah, Pasar Kliwon");
  const [kebutuhanLogistikDipilih, setKebutuhanLogistikDipilih] = useState<string[]>([]);
  const [taganaContact, setTaganaContact] = useState(userData?.phone || "081234567890");
  const [address, setAddress] = useState(userData?.address || "Jl. Slamet Riyadi, Surakarta");
  const [phone, setPhone] = useState(userData?.phone || "081234567890");
  const [notes, setNotes] = useState("");

  const LOGISTICS_OPTIONS = [
    "Makanan Siap Saji",
    "Tenda & Matras",
    "Selimut & Pakaian",
    "Obat-obatan Darurat",
    "Popok & Susu Bayi",
    "Air Bersih"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Silakan login terlebih dahulu.");
      router.push("/login");
      return;
    }
    if (kebutuhanLogistikDipilih.length === 0) {
      alert("Silakan pilih minimal 1 kebutuhan logistik.");
      return;
    }

    const orderId = await submitOrder(
      {
        customerId: user.uid,
        customerName: reporterName || userData?.displayName || "Koordinator Posko Lapangan",
        customerPhone: phone,
        serviceType: service.id,
        serviceTitle: service.name,
        targetRole: "government",
        additionalRole: agency.id,
        agencyName: agency.agencyOrCompanyName,
        price: 0, // 100% Subsidi APBD
        pickupLocation: {
          address: "Gudang Logistik Tagana Dinsos Surakarta",
          lat: -7.5695,
          lng: 110.8285
        },
        dropoffLocation: {
          address: shelterLocation,
          lat: -7.5621,
          lng: 110.8547
        },
        citizenDetails: {
          serviceId: service.id,
          serviceName: service.name,
          reporterName,
          nik,
          disasterType,
          affectedKkCount,
          shelterLocation,
          urgentLogistics: kebutuhanLogistikDipilih.join(", "),
          taganaContact,
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
      <div className="space-y-2.5 p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40">
        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 pb-1 border-b border-amber-200/60 dark:border-amber-900/40">
          <LifeBuoy className="h-4 w-4" />
          <span className="text-xs font-bold">Mobilisasi Logistik Dapur Umum & Tagana</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <CivicSelectField
            label="Jenis Kejadian Bencana"
            value={disasterType}
            onChange={setDisasterType}
            options={[
              "Banjir Luapan Kali Pepe / Bengawan Solo",
              "Kebakaran Pemukiman Padat",
              "Angin Puting Beliung / Pohon Tumbang Masif",
              "Tanah Longsor Tanggul Sungai"
            ]}
          />
          <CivicTextField
            label="Estimasi Jumlah KK Terdampak"
            type="number"
            value={affectedKkCount}
            onChange={setAffectedKkCount}
            placeholder="Jumlah keluarga..."
            mono
            required
          />
        </div>

        <CivicTextField
          label="Titik Posko Pengungsian / Dapur Umum"
          value={shelterLocation}
          onChange={setShelterLocation}
          placeholder="Nama gedung, Balai RW, atau Masjid pengungsian..."
          icon={<MapPin className="h-3.5 w-3.5 text-amber-500" />}
          required
        />

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Kebutuhan Logistik Mendesak (Pilih &gt;1)</label>
          <div className="grid grid-cols-2 gap-1.5">
            {LOGISTICS_OPTIONS.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setKebutuhanLogistikDipilih(prev =>
                  prev.includes(item)
                    ? prev.filter(i => i !== item)
                    : [...prev, item]
                )}
                className={`p-2 rounded-xl text-left border text-[11px] transition-all cursor-pointer ${
                  kebutuhanLogistikDipilih.includes(item)
                    ? "bg-amber-500/15 border-amber-500/50 text-amber-800 dark:text-amber-300 font-bold shadow-xs"
                    : "bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:border-slate-300"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <CivicTextField
          label="Nama Pelapor / Koordinator Posko"
          value={reporterName}
          onChange={setReporterName}
          placeholder="Nama relawan/warga..."
          icon={<User className="h-3.5 w-3.5 text-slate-400" />}
          required
        />
        <CivicTextField
          label="Nomor NIK Pelapor"
          value={nik}
          onChange={(v) => setNik(v.replace(/\D/g, ""))}
          placeholder="16 digit NIK..."
          maxLength={16}
          mono
          required
        />
      </div>

      <CivicTextField
        label="Nomor Telepon / WhatsApp Koordinator"
        type="tel"
        value={phone}
        onChange={setPhone}
        icon={<Phone className="h-3.5 w-3.5 text-slate-400" />}
        required
      />

      <CivicTextareaField
        label="Catatan Kondisi Akses Jalan Menuju Posko (Opsional)"
        value={notes}
        onChange={setNotes}
        placeholder="Contoh: Akses dari jalan raya tergenang 20cm, armada mobil pikap/kargo bisa masuk..."
        rows={2}
      />

      <CivicPriceFooter
        label="Biaya Logistik & Penyaluran:"
        sublabel="100% Tanggap Darurat APBD Dinas Sosial Surakarta"
        priceText="GRATIS (Tanggap Darurat APBD)"
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
        submitText="Mobilisasi Logistik Dapur Umum"
        onCancel={onCancel}
        buttonBg="bg-amber-600 hover:bg-amber-700"
        shadowColor="shadow-amber-600/20"
      />
    </form>
  );
}
