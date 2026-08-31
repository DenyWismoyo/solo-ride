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
import { ShieldCheck, User, Phone, MapPin } from "lucide-react";

export function SatpolppTrantibForm({ agency, service, onSuccess, onCancel }: CivicSubServiceFormProps) {
  const { user, userData } = useAuthContext();
  const router = useRouter();
  const { isSubmitting, error, submitOrder } = useCivicOrder();

  const [citizenName, setCitizenName] = useState(userData?.displayName || "");
  const [trantibCategory, setTrantibCategory] = useState("Kebisingan Suara Malam Hari (>22.00 WIB)");
  const [locationName, setLocationName] = useState("");
  const [rtRw, setRtRw] = useState("");
  const [phone, setPhone] = useState(userData?.phone || "081234567890");
  const [description, setDescription] = useState("");
  
  // Conditional fields for Izin Acara
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventParticipants, setEventParticipants] = useState("");

  const isEventPermit = trantibCategory === "Permohonan Pengamanan Acara Keramaian Warga";

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
        customerName: citizenName || userData?.displayName || "Warga Pelapor Trantib",
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
          address: "Mako Satpol PP Kota Surakarta, Balai Kota",
          lat: -7.5695,
          lng: 110.8285
        },
        citizenDetails: {
          serviceId: service.id,
          serviceName: service.name,
          citizenName,
          trantibCategory,
          locationName,
          rtRw,
          phone,
          description,
          ...(isEventPermit ? { eventName, eventDate, eventParticipants } : {}),
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
      <div className="space-y-2.5 p-3.5 rounded-2xl bg-slate-100/80 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-700">
        <div className="flex items-center gap-2 text-slate-800 dark:text-zinc-200 pb-1 border-b border-slate-200 dark:border-zinc-700">
          <ShieldCheck className="h-4 w-4 text-blue-600" />
          <span className="text-xs font-bold">Laporan Gangguan Ketertiban & Ketenteraman Umum</span>
        </div>

        <CivicSelectField
          label="Kategori Gangguan Trantibum"
          value={trantibCategory}
          onChange={setTrantibCategory}
          options={[
            "Kebisingan Suara Malam Hari (>22.00 WIB)",
            "PKL Berjualan di Atas Jalur Difabel / Trotoar",
            "Parkir Liar Menutup Akses Keluar Masuk Warga",
            "Penyakit Masyarakat (Pekat) & Miras Liar",
            "Permohonan Pengamanan Acara Keramaian Warga"
          ]}
        />

        {isEventPermit && (
          <div className="space-y-2.5 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-zinc-700">
            <CivicTextField
              label="Nama Acara / Kegiatan"
              value={eventName}
              onChange={setEventName}
              placeholder="Contoh: Jalan Sehat RT 01..."
              required={isEventPermit}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <CivicTextField
                label="Tanggal Pelaksanaan"
                type="date"
                value={eventDate}
                onChange={setEventDate}
                required={isEventPermit}
              />
              <CivicSelectField
                label="Perkiraan Jumlah Peserta"
                value={eventParticipants}
                onChange={setEventParticipants}
                options={[
                  "< 50 Orang",
                  "50 - 200 Orang",
                  "200 - 500 Orang",
                  "> 500 Orang"
                ]}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="sm:col-span-2">
            <CivicTextField
              label="Titik Lokasi (Gangguan / Acara)"
              value={locationName}
              onChange={setLocationName}
              placeholder="Nama jalan, gang, nomor rumah..."
              icon={<MapPin className="h-3.5 w-3.5 text-slate-500" />}
              required
            />
          </div>
          <CivicTextField
            label="RT / RW"
            value={rtRw}
            onChange={setRtRw}
            placeholder="Contoh: 01/05"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <CivicTextField
          label="Nama Pelapor"
          value={citizenName}
          onChange={setCitizenName}
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
        label="Deskripsi Situasi Lapangan"
        value={description}
        onChange={setDescription}
        placeholder="Informasi detail kejadian untuk persiapan regu patroli..."
        rows={2}
        required
      />

      <CivicPriceFooter
        label="Layanan Trantib Satpol PP:"
        sublabel="Regu reaksi cepat patroli Satpol PP Pemkot Surakarta"
        priceText="GRATIS (Layanan Publik)"
        accentColor="text-slate-700 dark:text-zinc-200"
        bgAccent="bg-slate-200/50 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700"
      />

      {error && (
        <p className="text-xs text-rose-500 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
          {error.message}
        </p>
      )}

      <CivicSubmitButton
        isSubmitting={isSubmitting}
        submitText="Kirim Laporan ke Satpol PP"
        onCancel={onCancel}
        buttonBg="bg-slate-800 hover:bg-slate-900 dark:bg-zinc-700 dark:hover:bg-zinc-600"
        shadowColor="shadow-slate-800/20"
      />
    </form>
  );
}
