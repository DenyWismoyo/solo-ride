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
import { Receipt, User, Phone, MapPin } from "lucide-react";

export function BapendaPbbForm({ agency, service, onSuccess, onCancel }: CivicSubServiceFormProps) {
  const { user, userData } = useAuthContext();
  const router = useRouter();
  const { isSubmitting, error, submitOrder } = useCivicOrder();

  const [taxpayerName, setTaxpayerName] = useState(userData?.displayName || "");
  const [nopPbb, setNopPbb] = useState("33.71.010.");
  const [taxYear, setTaxYear] = useState("2026");
  const [address, setAddress] = useState(userData?.address || "Jl. Slamet Riyadi, Surakarta");
  const [phone, setPhone] = useState(userData?.phone || "081234567890");

  const isValidNop = (nop: string) => {
    return /^33\.71\.\d{3}\.\d{3}\.\d{3}-\d{4}\.\d{1}$/.test(nop);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Silakan login terlebih dahulu.");
      router.push("/login");
      return;
    }

    if (!isValidNop(nopPbb)) {
      alert("Format NOP tidak valid. Gunakan format: 33.71.XXX.XXX.XXX-XXXX.X");
      return;
    }

    const orderId = await submitOrder(
      {
        customerId: user.uid,
        customerName: taxpayerName || userData?.displayName || "Wajib Pajak Surakarta",
        customerPhone: phone,
        serviceType: service.id,
        serviceTitle: service.name,
        targetRole: "government",
        additionalRole: agency.id,
        agencyName: agency.agencyOrCompanyName,
        price: 175000, // Nominal tagihan PBB contoh
        pickupLocation: {
          address: "Kantor Bapenda Balai Kota Surakarta",
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
          taxpayerName,
          nopPbb,
          taxYear,
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
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <div className="space-y-2.5 p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200/70 dark:border-indigo-900/40">
        <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 pb-1 border-b border-indigo-200/60 dark:border-indigo-900/40">
          <Receipt className="h-4 w-4" />
          <span className="text-xs font-bold">Inquiry & Pembayaran PBB-P2 Kota Surakarta</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="sm:col-span-2">
            <CivicTextField
              label="Nomor Objek Pajak (NOP SPPT)"
              value={nopPbb}
              onChange={setNopPbb}
              placeholder="33.71.XXX.XXX.XXX-XXXX.X"
              mono
              required
            />
            {nopPbb.length > 10 && !isValidNop(nopPbb) && (
              <p className="text-xs text-rose-500 mt-1 ml-1 font-medium">Format NOP harus 33.71.XXX.XXX.XXX-XXXX.X</p>
            )}
          </div>
          <CivicSelectField
            label="Tahun Pajak"
            value={taxYear}
            onChange={setTaxYear}
            options={["2026", "2025", "2024", "2023"]}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <CivicTextField
          label="Nama Wajib Pajak Sesuai SPPT"
          value={taxpayerName}
          onChange={setTaxpayerName}
          placeholder="Sesuai SPPT PBB..."
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
        label="Alamat Objek Pajak / Rumah"
        value={address}
        onChange={setAddress}
        placeholder="Nama jalan, nomor rumah, RT/RW, Kelurahan..."
        icon={<MapPin className="h-3.5 w-3.5 text-slate-400" />}
        required
      />

      <CivicPriceFooter
        label="Estimasi Tagihan SPPT & Biaya:"
        sublabel="Dilengkapi e-Kuitansi resmi QRIS Bapenda Surakarta"
        priceText="Rp 175.000"
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
        submitText="Proses Bayar PBB-P2"
        onCancel={onCancel}
        buttonBg="bg-indigo-600 hover:bg-indigo-700"
        shadowColor="shadow-indigo-600/20"
      />
    </form>
  );
}
