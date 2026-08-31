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
import { Trash2, User, Phone, MapPin, Sparkles } from "lucide-react";

const WASTE_CATEGORIES = [
  { id: "kardus", label: "Kardus / Karton", rate: 200, emoji: "📦" },
  { id: "plastik", label: "Plastik (Botol, Ember)", rate: 150, emoji: "♻️" },
  { id: "besi", label: "Besi / Logam", rate: 500, emoji: "⚙️" },
  { id: "kaca", label: "Kaca / Botol Beling", rate: 100, emoji: "🍶" },
  { id: "jelantah", label: "Minyak Jelantah", rate: 300, emoji: "🛢️" },
  { id: "kertas", label: "Kertas / Koran", rate: 150, emoji: "📰" },
];

export function DlhBankSampahForm({ agency, service, onSuccess, onCancel }: CivicSubServiceFormProps) {
  const { user, userData } = useAuthContext();
  const router = useRouter();
  const { isSubmitting, error, submitOrder } = useCivicOrder();

  const [citizenName, setCitizenName] = useState(userData?.displayName || "");
  const [jenisSampahDipilih, setJenisSampahDipilih] = useState<string[]>([]);
  const [wasteWeight, setWasteWeight] = useState(5);
  const [address, setAddress] = useState(userData?.address || "Jl. Slamet Riyadi, Surakarta");
  const [phone, setPhone] = useState(userData?.phone || "081234567890");
  const [notes, setNotes] = useState("");

  const estimatedEcoPoints = jenisSampahDipilih.length > 0
    ? Math.floor(wasteWeight * (WASTE_CATEGORIES.find(w => w.id === jenisSampahDipilih[0])?.rate || 150))
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Silakan login terlebih dahulu.");
      router.push("/login");
      return;
    }
    if (jenisSampahDipilih.length === 0) {
      alert("Silakan pilih minimal 1 jenis sampah yang akan dijemput.");
      return;
    }

    const orderId = await submitOrder(
      {
        customerId: user.uid,
        customerName: citizenName || userData?.displayName || "Nasabah Bank Sampah",
        customerPhone: phone,
        serviceType: service.id,
        serviceTitle: service.name,
        targetRole: "government",
        additionalRole: agency.id,
        agencyName: agency.agencyOrCompanyName,
        price: 0,
        pickupLocation: {
          address,
          lat: -7.5621,
          lng: 110.8547
        },
        dropoffLocation: {
          address: "Pusat Daur Ulang DLH Surakarta, Manahan",
          lat: -7.5512,
          lng: 110.8124
        },
        citizenDetails: {
          serviceId: service.id,
          serviceName: service.name,
          citizenName,
          jenisSampah: jenisSampahDipilih,
          estimasiBeratKg: wasteWeight,
          estimatedEcoPoints,
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
      <div className="space-y-2.5 p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/40">
        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 pb-1 border-b border-emerald-200/60 dark:border-emerald-900/40">
          <Trash2 className="h-4 w-4" />
          <span className="text-xs font-bold">Penjemputan Sampah Daur Ulang & Reward Poin Stamp</span>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Pilih Jenis Sampah Daur Ulang (bisa lebih dari 1)</label>
          <div className="grid grid-cols-2 gap-1.5">
            {WASTE_CATEGORIES.map(w => (
              <button
                key={w.id}
                type="button"
                onClick={() => setJenisSampahDipilih(prev =>
                  prev.includes(w.id)
                    ? prev.filter(j => j !== w.id)
                    : [...prev, w.id]
                )}
                className={`p-2 rounded-xl text-left border text-xs transition-all cursor-pointer flex justify-between items-center ${
                  jenisSampahDipilih.includes(w.id)
                    ? "bg-teal-500/15 border-teal-500/50 text-teal-800 dark:text-teal-300 font-bold shadow-xs"
                    : "bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span className="text-base">{w.emoji}</span>
                  <span className="truncate">{w.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1 pt-2 border-t border-emerald-200/60 dark:border-emerald-900/40">
          <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
            Estimasi Total Berat (kg)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="500"
              value={wasteWeight}
              onChange={(e) => setWasteWeight(Number(e.target.value))}
              className="w-24 h-9 px-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-bold focus:outline-none focus:border-emerald-500"
            />
            <span className="text-xs text-slate-500">kg (estimasi, min 1kg)</span>
          </div>
          {estimatedEcoPoints > 0 && (
            <div className="mt-2 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <p className="text-xs text-amber-700 dark:text-amber-300 font-semibold flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" />
                Estimasi Eco Points: ~{estimatedEcoPoints.toLocaleString()} poin (dikonfirmasi setelah ditimbang)
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <CivicTextField
          label="Nama Pemohon / Nasabah"
          value={citizenName}
          onChange={setCitizenName}
          placeholder="Sesuai KTP..."
          icon={<User className="h-3.5 w-3.5 text-slate-400" />}
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
      </div>

      <CivicTextField
        label="Alamat Rumah Lokasi Penjemputan"
        value={address}
        onChange={setAddress}
        placeholder="Nama jalan, nomor rumah, RT/RW, Kelurahan..."
        icon={<MapPin className="h-3.5 w-3.5 text-slate-400" />}
        required
      />

      <CivicTextareaField
        label="Catatan Lokasi Sampah (Opsional)"
        value={notes}
        onChange={setNotes}
        placeholder="Contoh: Sampah sudah dipacking dalam 2 karung di depan teras..."
        rows={2}
      />

      <CivicPriceFooter
        label="Hasil Reward Tabungan:"
        sublabel="Poin otomatis masuk ke dompet dan bisa ditukar voucher sembako/UMKM"
        priceText={`+${estimatedEcoPoints} POIN STAMP`}
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
        submitText="Jadwalkan Jemput Sampah Daur Ulang"
        onCancel={onCancel}
        buttonBg="bg-emerald-600 hover:bg-emerald-700"
        shadowColor="shadow-emerald-600/20"
      />
    </form>
  );
}
