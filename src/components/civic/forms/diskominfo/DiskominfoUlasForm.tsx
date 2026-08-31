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
import { Megaphone, User, Phone, MapPin } from "lucide-react";

export function DiskominfoUlasForm({ agency, service, onSuccess, onCancel }: CivicSubServiceFormProps) {
  const { user, userData } = useAuthContext();
  const router = useRouter();
  const { isSubmitting, error, submitOrder } = useCivicOrder();

  const [citizenName, setCitizenName] = useState(userData?.displayName || "");
  const [nik, setNik] = useState("");
  const [ulasCategory, setUlasCategory] = useState("Jalan Rusak / Berlubang");
  const [ulasTitle, setUlasTitle] = useState("");
  const [kecamatan, setKecamatan] = useState("Laweyan");
  const [kelurahan, setKelurahan] = useState("");
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
        customerName: citizenName || userData?.displayName || "Warga Pelapor ULAS",
        customerPhone: phone,
        serviceType: service.id,
        serviceTitle: service.name,
        targetRole: "government",
        additionalRole: agency.id,
        agencyName: agency.agencyOrCompanyName,
        price: 0,
        pickupLocation: {
          address: `${kecamatan}, ${kelurahan}`,
          lat: -7.5695,
          lng: 110.8285
        },
        dropoffLocation: {
          address: "Pusat ULAS Diskominfo Balai Kota Surakarta",
          lat: -7.5695,
          lng: 110.8285
        },
        citizenDetails: {
          serviceId: service.id,
          serviceName: service.name,
          citizenName,
          nik,
          ulasCategory,
          ulasTitle,
          kecamatan,
          kelurahan,
          locationName: `${kelurahan}, Kec. ${kecamatan}`,
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
      <div className="space-y-2.5 p-3.5 rounded-2xl bg-cyan-50/60 dark:bg-cyan-950/20 border border-cyan-200/70 dark:border-cyan-900/40">
        <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-400 pb-1 border-b border-cyan-200/60 dark:border-cyan-900/40">
          <Megaphone className="h-4 w-4" />
          <span className="text-xs font-bold">Kanal Pengaduan Resmi ULAS (Unit Layanan Aduan Surakarta)</span>
        </div>

        <CivicSelectField
          label="Kategori Pengaduan ULAS Solo"
          value={ulasCategory}
          onChange={setUlasCategory}
          options={[
            "Jalan Rusak / Berlubang",
            "Sampah Liar Menumpuk",
            "Penerangan Jalan Umum (PJU) Mati",
            "Pelayanan Publik & Perizinan",
            "Pungli & Parkir Liar",
            "Banjir & Genangan Gorong-gorong"
          ]}
        />

        <CivicTextField
          label="Judul Ringkas Aduan"
          value={ulasTitle}
          onChange={setUlasTitle}
          placeholder="Contoh: Aspal berlubang di Jl. Kolonel Sutarto Jebres..."
          maxLength={60}
          required
        />
        <div className="text-right text-[10px] text-slate-500 -mt-2 pr-1">{ulasTitle.length}/60</div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <CivicSelectField
            label="Kecamatan Kejadian"
            value={kecamatan}
            onChange={setKecamatan}
            options={["Laweyan", "Serengan", "Pasar Kliwon", "Jebres", "Banjarsari"]}
            icon={<MapPin className="h-3.5 w-3.5 text-cyan-600" />}
          />
          <CivicTextField
            label="Kelurahan / Lokasi Rinci"
            value={kelurahan}
            onChange={setKelurahan}
            placeholder="Kelurahan, nama jalan, patokan..."
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <CivicTextField
          label="Nama Pelapor"
          value={citizenName}
          onChange={setCitizenName}
          placeholder="Sesuai KTP..."
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
        label="Nomor WhatsApp Aktif (Untuk Notifikasi Tindak Lanjut)"
        type="tel"
        value={phone}
        onChange={setPhone}
        icon={<Phone className="h-3.5 w-3.5 text-slate-400" />}
        required
      />

      <CivicTextareaField
        label="Deskripsi Lengkap Kejadian / Aduan"
        value={description}
        onChange={setDescription}
        placeholder="Jelaskan kronologi atau situasi secara detail..."
        rows={3}
        required
      />
      <div className="text-right text-[10px] text-slate-500 -mt-2 pr-1">{description.length}/500</div>

      <CivicPriceFooter
        label="Layanan Pengaduan Warga:"
        sublabel="Terintegrasi langsung dengan Dashboard Walikota Surakarta"
        priceText="GRATIS (Layanan Publik)"
        accentColor="text-cyan-600 dark:text-cyan-400"
        bgAccent="bg-cyan-500/10 border-cyan-500/20"
      />

      {error && (
        <p className="text-xs text-rose-500 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
          {error.message}
        </p>
      )}

      <CivicSubmitButton
        isSubmitting={isSubmitting}
        submitText="Kirim Aduan ke Portal ULAS"
        onCancel={onCancel}
        buttonBg="bg-cyan-600 hover:bg-cyan-700"
        shadowColor="shadow-cyan-600/20"
      />
    </form>
  );
}
