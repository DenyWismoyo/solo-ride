"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { useCivicOrder } from "@/hooks/useCivicOrder";
import { CivicSubServiceFormProps } from "../types";
import { 
  CivicTextField, 
  CivicPriceFooter, 
  CivicSubmitButton 
} from "@/components/civic/shared/CivicFormControls";
import { Store, User, Phone, MapPin, Calendar, CreditCard } from "lucide-react";

export function BapendaRetribusiPasarForm({ agency, service, onSuccess, onCancel }: CivicSubServiceFormProps) {
  const { user, userData } = useAuthContext();
  const router = useRouter();
  const { isSubmitting, error, submitOrder } = useCivicOrder();

  const [namaPemilik, setNamaPemilik] = useState(userData?.displayName || "");
  const [idKiosPasar, setIdKiosPasar] = useState("");
  const [namaKios, setNamaKios] = useState("");
  const [tanggalRetribusi, setTanggalRetribusi] = useState("");
  const [nominalRetribusi, setNominalRetribusi] = useState(5000);
  const [phone, setPhone] = useState(userData?.phone || "081234567890");

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
        customerName: namaPemilik || userData?.displayName || "Wajib Retribusi",
        customerPhone: phone,
        serviceType: service.id,
        serviceTitle: service.name,
        targetRole: "government",
        additionalRole: agency.id,
        agencyName: agency.agencyOrCompanyName,
        price: nominalRetribusi,
        pickupLocation: {
          address: "Kantor Bapenda Balai Kota Surakarta",
          lat: -7.5695,
          lng: 110.8285
        },
        dropoffLocation: {
          address: `Pasar Tradisional - ${namaKios}`,
          lat: -7.5621,
          lng: 110.8547
        },
        citizenDetails: {
          serviceId: service.id,
          serviceName: service.name,
          namaPemilik,
          idKiosPasar,
          namaKios,
          tanggalRetribusi,
          nominalRetribusi,
          phone,
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
      <div className="space-y-2.5 p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200/70 dark:border-indigo-900/40">
        <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 pb-1 border-b border-indigo-200/60 dark:border-indigo-900/40">
          <Store className="h-4 w-4" />
          <span className="text-xs font-bold">Pembayaran Retribusi Pasar Tradisional</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <CivicTextField
            label="ID Kios / Los Pasar"
            value={idKiosPasar}
            onChange={setIdKiosPasar}
            placeholder="Contoh: PS.G-124"
            mono
            required
          />
          <CivicTextField
            label="Nama Kios / Toko"
            value={namaKios}
            onChange={setNamaKios}
            placeholder="Contoh: Kios Sembako Bu Tarmi"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <CivicTextField
            label="Tanggal Retribusi (Hari / Bulan)"
            type="date"
            value={tanggalRetribusi}
            onChange={setTanggalRetribusi}
            icon={<Calendar className="h-3.5 w-3.5 text-indigo-500" />}
            required
          />
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              Nominal Retribusi (Rp)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-sm text-slate-400 font-medium">Rp</span>
              </div>
              <input
                type="number"
                value={nominalRetribusi}
                onChange={(e) => setNominalRetribusi(Number(e.target.value))}
                className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl h-11 pl-9 pr-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                min={1000}
                step={1000}
                required
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <CivicTextField
          label="Nama Pemilik Kios"
          value={namaPemilik}
          onChange={setNamaPemilik}
          placeholder="Sesuai kartu identitas pasar..."
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

      <CivicPriceFooter
        label="Total Pembayaran Retribusi:"
        sublabel="Dilengkapi e-Kuitansi resmi QRIS Bapenda Surakarta"
        priceText={`Rp ${nominalRetribusi.toLocaleString("id-ID")}`}
        accentColor="text-indigo-600 dark:text-indigo-400"
        bgAccent="bg-indigo-500/10 border-indigo-500/20"
      />

      {error && (
        <p className="text-xs text-rose-500 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
          {error.message}
        </p>
      )}

      <CivicSubmitButton
        isSubmitting={isSubmitting}
        submitText="Proses Bayar Retribusi Pasar"
        onCancel={onCancel}
        buttonBg="bg-indigo-600 hover:bg-indigo-700"
        shadowColor="shadow-indigo-600/20"
      />
    </form>
  );
}
