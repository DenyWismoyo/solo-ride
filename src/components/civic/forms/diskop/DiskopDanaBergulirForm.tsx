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
import { Coins, Store, User, Phone, MapPin } from "lucide-react";

export function DiskopDanaBergulirForm({ agency, service, onSuccess, onCancel }: CivicSubServiceFormProps) {
  const { user, userData } = useAuthContext();
  const router = useRouter();
  const { isSubmitting, error, submitOrder } = useCivicOrder();

  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState(userData?.displayName || "");
  const [nik, setNik] = useState("");
  const [loanPlafon, setLoanPlafon] = useState("Rp 10.000.000 (Usaha Mikro)");
  const [businessDuration, setBusinessDuration] = useState("1 - 3 Tahun");
  const [agunanYangDimiliki, setAgunanYangDimiliki] = useState("");
  const [address, setAddress] = useState(userData?.address || "Jl. Slamet Riyadi, Surakarta");
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
        customerName: ownerName || userData?.displayName || "Pelaku UMKM Solo",
        customerPhone: phone,
        serviceType: service.id,
        serviceTitle: service.name,
        targetRole: "government",
        additionalRole: agency.id,
        agencyName: agency.agencyOrCompanyName,
        price: 0,
        pickupLocation: {
          address: "PLUT Diskop Balai Kota Surakarta",
          lat: -7.5695,
          lng: 110.8285
        },
        dropoffLocation: {
          address,
          lat: -7.5621,
          lng: 110.8547
        },
        citizenDetails: {
          serviceId: service.id,
          serviceName: service.name,
          businessName,
          ownerName,
          nik,
          loanPlafon,
          businessDuration,
          agunanYangDimiliki,
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
          <Coins className="h-4 w-4" />
          <span className="text-xs font-bold">Fasilitasi Dana Bergulir & Modal Kerja Koperasi</span>
        </div>

        <CivicTextField
          label="Nama Usaha / Warung Pemohon"
          value={businessName}
          onChange={setBusinessName}
          placeholder="Contoh: Kios Sayur Segar Manahan..."
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <CivicSelectField
            label="Plafon Pengajuan Dana Bergulir"
            value={loanPlafon}
            onChange={setLoanPlafon}
            options={[
              "Rp 5.000.000 (Modal Awal)",
              "Rp 10.000.000 (Usaha Mikro)",
              "Rp 25.000.000 (Pengembangan Usaha)",
              "Rp 50.000.000 (Koperasi Produsen)"
            ]}
          />
          <CivicSelectField
            label="Lama Usaha Berjalan"
            value={businessDuration}
            onChange={setBusinessDuration}
            options={[
              "< 1 Tahun",
              "1 - 3 Tahun",
              "3 - 5 Tahun",
              "> 5 Tahun"
            ]}
          />
        </div>

        <CivicTextField
          label="Agunan Yang Dimiliki (Wajib untuk > 10 Juta)"
          value={agunanYangDimiliki}
          onChange={setAgunanYangDimiliki}
          placeholder="Contoh: BPKB Motor, Sertifikat Tanah, dll..."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <CivicTextField
          label="Nama Pemilik Usaha"
          value={ownerName}
          onChange={setOwnerName}
          placeholder="Sesuai KTP..."
          icon={<User className="h-3.5 w-3.5 text-slate-400" />}
          required
        />
        <CivicTextField
          label="Nomor NIK Pemilik"
          value={nik}
          onChange={(v) => setNik(v.replace(/\D/g, ""))}
          placeholder="16 digit NIK..."
          maxLength={16}
          mono
          required
        />
      </div>

      <CivicTextField
        label="Alamat Tempat Usaha di Surakarta"
        value={address}
        onChange={setAddress}
        placeholder="Nama jalan, nomor kios/rumah, Kelurahan..."
        icon={<MapPin className="h-3.5 w-3.5 text-slate-400" />}
        required
      />

      <CivicTextField
        label="Nomor WhatsApp Usaha"
        type="tel"
        value={phone}
        onChange={setPhone}
        icon={<Phone className="h-3.5 w-3.5 text-slate-400" />}
        required
      />

      <CivicPriceFooter
        label="Bunga & Biaya Administrasi:"
        sublabel="Bunga rendah 3% per tahun subsidi LPDB Pemkot Surakarta"
        priceText="Bunga 3% / Thn (Subsidi APBD)"
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
        submitText="Ajukan Permohonan Dana Bergulir"
        onCancel={onCancel}
        buttonBg="bg-emerald-600 hover:bg-emerald-700"
        shadowColor="shadow-emerald-600/20"
      />
    </form>
  );
}
