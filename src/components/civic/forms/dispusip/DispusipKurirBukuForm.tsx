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
  CivicRadioField,
  CivicPriceFooter, 
  CivicSubmitButton,
  CivicAddressSelector
} from "@/components/civic/shared/CivicFormControls";
import { BookOpen, User, Phone, MapPin } from "lucide-react";

export function DispusipKurirBukuForm({ agency, service, onSuccess, onCancel }: CivicSubServiceFormProps) {
  const { user, userData } = useAuthContext();
  const router = useRouter();
  const { isSubmitting, error, submitOrder } = useCivicOrder();

  const [memberName, setMemberName] = useState(userData?.displayName || "");
  const [bookMemberId, setBookMemberId] = useState("");
  const [bookTitle, setBookTitle] = useState("");
  const [bookCategory, setBookCategory] = useState("Sastra & Fiksi");
  const [loanDuration, setLoanDuration] = useState("14 Hari");
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
        customerName: memberName || userData?.displayName || "Anggota Perpustakaan",
        customerPhone: phone,
        serviceType: service.id,
        serviceTitle: service.name,
        targetRole: "government",
        additionalRole: agency.id,
        agencyName: agency.agencyOrCompanyName,
        price: 8000,
        pickupLocation: {
          address: "Dinas Kearsipan & Perpustakaan (Dispusip) Solo, Kerten",
          lat: -7.5582,
          lng: 110.7924
        },
        dropoffLocation: {
          address,
          lat: addressLat || -7.5615,
          lng: addressLng || 110.8256
        },
        citizenDetails: {
          serviceId: service.id,
          serviceName: service.name,
          memberName,
          bookMemberId,
          bookTitle,
          bookCategory,
          loanDuration,
          phone,
          address,
          notes,
          submittedAt: new Date().toISOString()
        }
      },
      { requiresOtp: true }
    );

    if (orderId) {
      onSuccess(orderId);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <div className="space-y-2.5 p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200/70 dark:border-indigo-900/40">
        <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 pb-1 border-b border-indigo-200/60 dark:border-indigo-900/40">
          <BookOpen className="h-4 w-4" />
          <span className="text-xs font-bold">Layanan Pinjam & Antar Buku Fisik Perpustakaan Kota Solo</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="sm:col-span-2">
            <CivicTextField
              label="Nomor Kartu Anggota Perpusda"
              value={bookMemberId}
              onChange={setBookMemberId}
              placeholder="PUS-2026-XXXX..."
              mono
              required
            />
          </div>
          <CivicSelectField
            label="Kategori Pustaka"
            value={bookCategory}
            onChange={setBookCategory}
            options={[
              "Sastra & Fiksi",
              "Sains & Teknologi",
              "Sejarah & Budaya",
              "Buku Anak / Komik",
              "Lainnya"
            ]}
          />
        </div>

        <CivicTextField
          label="Judul Buku / Pengarang yang Dipinjam"
          value={bookTitle}
          onChange={setBookTitle}
          placeholder="Contoh: Sejarah Kota Surakarta, Babad Tanah Jawi..."
          required
        />
        
        <CivicRadioField
          label="Durasi Pinjam"
          value={loanDuration}
          onChange={setLoanDuration}
          options={["3 Hari", "7 Hari", "14 Hari"]}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <CivicTextField
          label="Nama Lengkap Peminjam"
          value={memberName}
          onChange={setMemberName}
          placeholder="Sesuai kartu perpusda..."
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

      <CivicAddressSelector
        label="Alamat Rumah Pengantaran Buku"
        value={address}
        onChange={(val, lat, lng) => {
          setAddress(val);
          setAddressLat(lat);
          setAddressLng(lng);
        }}
        required
      />

      <CivicPriceFooter
        label="Biaya Antar Buku Pustaka:"
        sublabel="Sudah disubsidi program literasi Dispusip Pemkot Surakarta"
        priceText="Rp 8.000"
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
        submitText="Ajukan Peminjaman & Antar Buku"
        onCancel={onCancel}
        buttonBg="bg-indigo-600 hover:bg-indigo-700"
        shadowColor="shadow-indigo-600/20"
      />
    </form>
  );
}
