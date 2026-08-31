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
  CivicSubmitButton,
  CivicAddressSelector
} from "@/components/civic/shared/CivicFormControls";
import { ShoppingBag, Store, User, Phone, MapPin } from "lucide-react";

export function DinsosBansosSembakoForm({ agency, service, onSuccess, onCancel }: CivicSubServiceFormProps) {
  const { user, userData } = useAuthContext();
  const router = useRouter();
  const { isSubmitting, error, submitOrder } = useCivicOrder();

  const [headOfFamilyName, setHeadOfFamilyName] = useState(userData?.displayName || "");
  const [nik, setNik] = useState("");
  const [pkhCardNumber, setPkhCardNumber] = useState("");
  const [sembakoPackage, setSembakoPackage] = useState("Paket A (Beras Rojolele 5kg, Minyak 2L, Gula 1kg)");
  const [sourceMarket, setSourceMarket] = useState("Pasar Gede Surakarta");
  const [address, setAddress] = useState(userData?.address || "");
  const [addressLat, setAddressLat] = useState<number | undefined>();
  const [addressLng, setAddressLng] = useState<number | undefined>();
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
        customerName: headOfFamilyName || userData?.displayName || "Warga Surakarta",
        customerPhone: phone,
        serviceType: service.id,
        serviceTitle: service.name,
        targetRole: "government",
        additionalRole: agency.id,
        agencyName: agency.agencyOrCompanyName,
        price: 0, // 100% Subsidi APBD
        pickupLocation: {
          address: sourceMarket,
          lat: -7.5695,
          lng: 110.8285
        },
        dropoffLocation: {
          address,
          lat: addressLat || -7.5615,
          lng: addressLng || 110.8256
        },
        citizenDetails: {
          serviceId: service.id,
          serviceName: service.name,
          headOfFamilyName,
          nik,
          pkhCardNumber,
          sembakoPackage,
          sourceMarket,
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
      <div className="space-y-2.5 p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/70 dark:border-rose-900/40">
        <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 pb-1 border-b border-rose-200/60 dark:border-rose-900/40">
          <ShoppingBag className="h-4 w-4" />
          <span className="text-xs font-bold">Klaim Voucher Sembako Pasar Tradisional Solo (DTKS/PKH)</span>
        </div>

        <CivicTextField
          label="Nomor Kartu PKH / KKS / DTKS"
          value={pkhCardNumber}
          onChange={setPkhCardNumber}
          placeholder="16 digit nomor kartu bantuan sosial..."
          mono
          required
        />

        <CivicSelectField
          label="Pilihan Paket Komoditas Sembako"
          value={sembakoPackage}
          onChange={setSembakoPackage}
          options={[
            "Paket A (Beras Rojolele 5kg, Minyak Goreng 2L, Gula Pasir 1kg)",
            "Paket B (Telur Ayam 1kg, Daging Ayam Segar 1kg, Sayur Mayur Sop)",
            "Paket C Nutrisi (Susu Balita/Lansia, Biskuit Protein, Kacang Hijau 1kg)"
          ]}
        />

        <CivicSelectField
          label="Pasar Tradisional Sumber Komoditas"
          value={sourceMarket}
          onChange={setSourceMarket}
          options={[
            "Pasar Gede Surakarta (Jl. Urip Sumoharjo)",
            "Pasar Legi Surakarta (Sentra Grosir)",
            "Pasar Nusukan Banjarsari",
            "Pasar Harjodaksino (Pasar Gemblegan Serengan)",
            "Pasar Jongke Laweyan"
          ]}
          icon={<Store className="h-3.5 w-3.5 text-rose-500" />}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <CivicTextField
          label="Nama Kepala Keluarga (KPM)"
          value={headOfFamilyName}
          onChange={setHeadOfFamilyName}
          placeholder="Sesuai Kartu Keluarga..."
          icon={<User className="h-3.5 w-3.5 text-slate-400" />}
          required
        />
        <CivicTextField
          label="Nomor NIK Kepala Keluarga"
          value={nik}
          onChange={(v) => setNik(v.replace(/\D/g, ""))}
          placeholder="16 digit NIK..."
          maxLength={16}
          mono
          required
        />
      </div>

      <CivicAddressSelector
        label="Alamat Rumah Penerima Manfaat (KPM)"
        value={address}
        onChange={(val, lat, lng) => {
          setAddress(val);
          setAddressLat(lat);
          setAddressLng(lng);
        }}
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

      <CivicTextareaField
        label="Catatan Tambahan (Opsional)"
        value={notes}
        onChange={setNotes}
        placeholder="Keterangan tambahan untuk kurir pengantar sembako..."
        rows={2}
      />

      <CivicPriceFooter
        label="Biaya Layanan & Ongkir:"
        sublabel="100% Subsidi APBD Dinas Sosial Kota Surakarta"
        priceText="GRATIS (Subsidi APBD)"
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
        submitText="Ajukan Klaim Sembako Bansos"
        onCancel={onCancel}
        buttonBg="bg-rose-600 hover:bg-rose-700"
        shadowColor="shadow-rose-600/20"
      />
    </form>
  );
}
