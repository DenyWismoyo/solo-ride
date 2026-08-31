"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { useCivicOrder } from "@/hooks/useCivicOrder";
import { CivicSubServiceFormProps } from "../types";
import { 
  CivicTextField, 
  CivicSelectField, 
  CivicPriceFooter, 
  CivicSubmitButton 
} from "@/components/civic/shared/CivicFormControls";
import { Waves, User, Phone, MapPin, Info } from "lucide-react";

const EWS_STATUS_DATA = [
  { sungai: "Bengawan Solo", level: "Normal", siaga: "Siaga 4", color: "emerald" },
  { sungai: "Kali Pepe", level: "Waspada", siaga: "Siaga 3", color: "amber" },
  { sungai: "Kali Jenes", level: "Normal", siaga: "Siaga 4", color: "emerald" },
];

const BANTUAN_OPTIONS = [
  { id: "tenda_darurat", label: "Tenda Darurat", emoji: "⛺" },
  { id: "selimut", label: "Selimut", emoji: "🛏️" },
  { id: "sembako", label: "Sembako Darurat", emoji: "🛒" },
  { id: "perahu_karet", label: "Perahu Karet", emoji: "🚤" },
  { id: "evakuasi_medis", label: "Evakuasi Medis", emoji: "🏥" },
  { id: "air_bersih", label: "Air Bersih", emoji: "💧" },
];

export function BpbdLaporBanjirForm({ agency, service, onSuccess, onCancel }: CivicSubServiceFormProps) {
  const { user, userData } = useAuthContext();
  const router = useRouter();
  const { isSubmitting, error, submitOrder } = useCivicOrder();

  const [mode, setMode] = useState<"ews" | "bantuan">("ews");
  const [levelSiaga, setLevelSiaga] = useState("Siaga 3 (Waspada)");
  const [bantuanDipilih, setBantuanDipilih] = useState<string[]>([]);

  const [reporterName, setReporterName] = useState(userData?.displayName || "");
  const [address, setAddress] = useState(userData?.address || "Jl. Slamet Riyadi, Surakarta");
  const [phone, setPhone] = useState(userData?.phone || "081234567890");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Silakan login terlebih dahulu.");
      router.push("/login");
      return;
    }

    if (mode === "bantuan" && bantuanDipilih.length === 0) {
      alert("Pilih minimal 1 jenis bantuan yang diminta.");
      return;
    }

    const orderId = await submitOrder(
      {
        customerId: user.uid,
        customerName: reporterName || userData?.displayName || "Pelapor BPBD",
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
          address: "Posko Induk BPBD Surakarta",
          lat: -7.5695,
          lng: 110.8285
        },
        citizenDetails: {
          serviceId: service.id,
          serviceName: service.name,
          reporterName,
          mode,
          levelSiaga,
          bantuanDipilih,
          phone,
          address,
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
    <form onSubmit={mode === "bantuan" ? handleSubmit : (e) => e.preventDefault()} className="space-y-3.5">
      
      {/* Mode Toggle */}
      <div className="flex p-1 gap-1 bg-slate-100 dark:bg-zinc-800 rounded-2xl">
        <button 
          type="button"
          onClick={() => setMode("ews")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            mode === "ews" 
              ? "bg-blue-600 text-white shadow-sm" 
              : "text-slate-500 hover:bg-slate-200 dark:hover:bg-zinc-700"
          }`}
        >
          📊 Cek Status Siaga
        </button>
        <button 
          type="button"
          onClick={() => setMode("bantuan")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            mode === "bantuan" 
              ? "bg-orange-600 text-white shadow-sm" 
              : "text-slate-500 hover:bg-slate-200 dark:hover:bg-zinc-700"
          }`}
        >
          🆘 Minta Bantuan Darurat
        </button>
      </div>

      {mode === "ews" ? (
        <div className="space-y-2 p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/40 rounded-2xl">
          <div className="flex items-center gap-2 mb-3 text-blue-700 dark:text-blue-400">
            <Info className="h-4 w-4" />
            <span className="text-xs font-bold">Pemantauan Debit Air Real-Time</span>
          </div>
          {EWS_STATUS_DATA.map(({ sungai, level, siaga, color }) => (
            <div key={sungai} className={`p-3 rounded-xl bg-${color}-500/10 border border-${color}-500/30`}>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold">{sungai}</span>
                <span className={`text-xs font-black text-${color}-600`}>{siaga} ({level})</span>
              </div>
            </div>
          ))}
          <p className="text-[10px] text-slate-500 text-center pt-2">
            Data diperbarui dari BBWS Bengawan Solo
          </p>
          <div className="pt-2 flex justify-center">
             <button
               type="button"
               onClick={onCancel}
               className="text-xs font-medium text-slate-500 underline"
             >
               Kembali
             </button>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-2.5 p-3.5 rounded-2xl bg-orange-50/60 dark:bg-orange-950/20 border border-orange-200/70 dark:border-orange-900/40">
            <div className="flex items-center gap-2 text-orange-800 dark:text-orange-300 pb-1 border-b border-orange-200/60 dark:border-orange-900/40">
              <Waves className="h-4 w-4" />
              <span className="text-xs font-bold">Permohonan Bantuan Darurat BPBD</span>
            </div>

            <CivicSelectField
              label="Level Siaga Lokasi Anda"
              value={levelSiaga}
              onChange={setLevelSiaga}
              options={[
                "Siaga 1 (Sangat Berbahaya, Air Masuk Rumah)",
                "Siaga 2 (Bahaya, Tanggul Rembes/Kritis)",
                "Siaga 3 (Waspada, Genangan Jalan)",
                "Siaga 4 (Normal/Aman)"
              ]}
            />

            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Bantuan yang Diminta (pilih semua yang dibutuhkan)
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {BANTUAN_OPTIONS.map(b => (
                  <button 
                    key={b.id} 
                    type="button"
                    onClick={() => setBantuanDipilih(prev =>
                      prev.includes(b.id) ? prev.filter(x => x !== b.id) : [...prev, b.id]
                    )}
                    className={`p-2 rounded-xl text-xs font-medium border transition-all ${
                      bantuanDipilih.includes(b.id)
                        ? "bg-blue-500/15 border-blue-500/50 text-blue-700 dark:text-blue-300"
                        : "bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400"
                    }`}
                  >
                    {b.emoji} {b.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <CivicTextField
              label="Nama Pelapor / Ketua RT"
              value={reporterName}
              onChange={setReporterName}
              placeholder="Nama Anda..."
              icon={<User className="h-3.5 w-3.5 text-slate-400" />}
              required
            />
            <CivicTextField
              label="Nomor WhatsApp Darurat"
              type="tel"
              value={phone}
              onChange={setPhone}
              icon={<Phone className="h-3.5 w-3.5 text-slate-400" />}
              required
            />
          </div>

          <CivicTextField
            label="Alamat Titik Darurat Bencana"
            value={address}
            onChange={setAddress}
            placeholder="Nama jalan, RT/RW, Kelurahan..."
            icon={<MapPin className="h-3.5 w-3.5 text-orange-500" />}
            required
          />

          <CivicPriceFooter
            label="Layanan Bantuan Logistik BPBD:"
            sublabel="100% Tanggap Bencana Gratis Pemkot Surakarta"
            priceText="GRATIS (Logistik BPBD)"
            accentColor="text-orange-600 dark:text-orange-400"
            bgAccent="bg-orange-500/10 border-orange-500/20"
          />

          {error && (
            <p className="text-xs text-rose-500 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
              {error.message}
            </p>
          )}

          <CivicSubmitButton
            isSubmitting={isSubmitting}
            submitText="🚨 Minta Bantuan Darurat BPBD"
            onCancel={onCancel}
            buttonBg="bg-orange-600 hover:bg-orange-700 font-bold"
            shadowColor="shadow-orange-600/20"
          />
        </>
      )}
    </form>
  );
}
