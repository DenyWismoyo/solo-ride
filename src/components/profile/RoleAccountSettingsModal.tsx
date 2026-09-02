"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, 
  Bike, 
  Store, 
  Building2, 
  ShieldCheck, 
  Lock, 
  Save, 
  X, 
  Loader2, 
  CheckCircle2, 
  CreditCard, 
  MapPin, 
  Clock, 
  Scale, 
  Phone, 
  FileText,
  Sparkles,
  Shield
} from "lucide-react";
import { useAuthContext } from "@/components/AuthProvider";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface RoleAccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RoleAccountSettingsModal({
  isOpen,
  onClose
}: RoleAccountSettingsModalProps) {
  const { user, userData, activeRole } = useAuthContext();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Common Fields
  const [displayName, setDisplayName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Customer Specific
  const [nik, setNik] = useState("");
  const [privacyMasking, setPrivacyMasking] = useState(false);

  // Driver Specific
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [bankAccount, setBankAccount] = useState("");

  // Merchant Specific
  const [storeName, setStoreName] = useState("");
  const [marketLocation, setMarketLocation] = useState("");
  const [stallNumber, setStallNumber] = useState("");
  const [operatingHours, setOperatingHours] = useState("");
  const [teraSerialNumber, setTeraSerialNumber] = useState("");
  const [qrisAccount, setQrisAccount] = useState("");

  // Government Specific
  const [nip, setNip] = useState("");
  const [departmentSection, setDepartmentSection] = useState("");

  // Industry Specific
  const [companyNib, setCompanyNib] = useState("");
  const [picLogistics, setPicLogistics] = useState("");

  // Initialize form with existing userData
  useEffect(() => {
    if (userData) {
      setDisplayName(userData.displayName || "");
      setPhoneNumber(userData.phone || (userData as any).phoneNumber || "");
      setNik((userData as any).nik || "");
      setPrivacyMasking(Boolean((userData as any).privacyMasking));

      // Driver
      setVehiclePlate((userData as any).vehiclePlate || "AD 4821 QA");
      setVehicleModel((userData as any).vehicleModel || "Honda Vario 160 (2024)");
      setBankAccount((userData as any).bankAccount || "BSI 7182938192 (Koperasi)");

      // Merchant
      setStoreName((userData as any).storeName || "Warung Mbok Darmi Pasar Gede");
      setMarketLocation((userData as any).marketLocation || "Pasar Gede Surakarta");
      setStallNumber((userData as any).stallNumber || "Los D-14 Lantai 1");
      setOperatingHours((userData as any).operatingHours || "05.00 - 15.00 WIB");
      setTeraSerialNumber((userData as any).teraSerialNumber || "TERA-PAS-DISDAG-2026-88");
      setQrisAccount((userData as any).qrisAccount || "QRIS-SOLO-991204");

      // Gov
      setNip((userData as any).nip || "19880412 201201 1 004");
      setDepartmentSection((userData as any).departmentSection || "Seksi Pengawasan & Distribusi");

      // Industry
      setCompanyNib((userData as any).companyNib || "0128918291029");
      setPicLogistics((userData as any).picLogistics || "Budi Santoso (0812-3344-5566)");
    }
  }, [userData, isOpen]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const payload: any = {
        displayName,
        phone: phoneNumber,
        updatedAt: serverTimestamp()
      };

      if (activeRole === "customer") {
        payload.nik = nik.trim();
        payload.privacyMasking = privacyMasking;
      } else if (activeRole === "driver") {
        payload.vehiclePlate = vehiclePlate.trim();
        payload.vehicleModel = vehicleModel.trim();
        payload.bankAccount = bankAccount.trim();
      } else if (activeRole === "merchant") {
        payload.storeName = storeName.trim();
        payload.marketLocation = marketLocation.trim();
        payload.stallNumber = stallNumber.trim();
        payload.operatingHours = operatingHours.trim();
        payload.teraSerialNumber = teraSerialNumber.trim();
        payload.qrisAccount = qrisAccount.trim();
      } else if (activeRole === "government") {
        payload.nip = nip.trim();
        payload.departmentSection = departmentSection.trim();
      } else if (activeRole === "industry") {
        payload.companyNib = companyNib.trim();
        payload.picLogistics = picLogistics.trim();
      }

      await updateDoc(doc(db, COLLECTIONS.USERS, user.uid), payload);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      alert(`Gagal menyimpan pengaturan: ${err.message || err}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="sg-bento-card max-w-lg w-full max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border-emerald-500/20 bg-white dark:bg-[#0c1220]"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-white/[0.06] flex items-center justify-between bg-gradient-to-r from-emerald-600/10 via-teal-600/5 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Pengaturan & Kelola Akun
                </h3>
                <Badge 
                  variant={
                    activeRole === "driver" ? "amber" :
                    activeRole === "merchant" ? "orange" :
                    activeRole === "government" ? "teal" :
                    activeRole === "industry" ? "blue" : "emerald"
                  }
                  size="sm"
                >
                  {activeRole.toUpperCase()}
                </Badge>
              </div>
              <p className="text-[11px] text-slate-500">
                Pengelolaan data identitas & preferensi kewenangan role
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="sg-icon-btn h-8 w-8 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSaveSettings} className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* 1. BASIC IDENTITY */}
          <div className="space-y-3 bg-slate-50 dark:bg-white/[0.02] p-3.5 rounded-2xl border border-slate-200/60 dark:border-white/[0.05]">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
              <User className="h-3.5 w-3.5 text-emerald-500" /> Identitas Akun Pengguna
            </h4>

            <div className="space-y-2">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">
                  Nama Lengkap / Tampilan:
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Nama Lengkap Sesuai KTP..."
                  className="sg-input w-full font-semibold"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">
                  Nomor WhatsApp / HP:
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="0812-XXXX-XXXX"
                  className="sg-input w-full font-semibold"
                />
              </div>
            </div>
          </div>

          {/* 2. ROLE-SPECIFIC FORM FIELDS */}

          {/* CUSTOMER FIELDS */}
          {activeRole === "customer" && (
            <div className="space-y-3 bg-emerald-500/5 dark:bg-emerald-950/20 p-3.5 rounded-2xl border border-emerald-500/20">
              <h4 className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 text-xs">
                <Sparkles className="h-3.5 w-3.5 text-emerald-500" /> Pengaturan Warga Surakarta & Subsidi
              </h4>

              <div className="space-y-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 dark:text-zinc-300 block mb-1">
                    Nomor Induk Kependudukan (NIK 16 Digit Solo):
                  </label>
                  <input
                    type="text"
                    maxLength={16}
                    value={nik}
                    onChange={(e) => setNik(e.target.value)}
                    placeholder="3372XXXXXXXXXXXX (Untuk Kuota Pasar Murah SPHP Bulog)"
                    className="sg-input w-full font-mono font-bold"
                  />
                  <span className="text-[9px] text-slate-400 block mt-0.5">
                    * Digunakan untuk validasi kuota 2 pack beras SPHP/KK di 5 posko kecamatan.
                  </span>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-emerald-500/10">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-zinc-200 block text-xs">
                      Mode Privasi Aduan (Anonim DP3A)
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Samarkan nama dan nomor telepon saat melapor ke dinas
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacyMasking}
                    onChange={(e) => setPrivacyMasking(e.target.checked)}
                    className="h-4 w-4 accent-emerald-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* DRIVER FIELDS */}
          {activeRole === "driver" && (
            <div className="space-y-3 bg-amber-500/5 dark:bg-amber-950/20 p-3.5 rounded-2xl border border-amber-500/20">
              <h4 className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5 text-xs">
                <Bike className="h-3.5 w-3.5 text-amber-500" /> Data Kendaraan & Koperasi Mitra
              </h4>

              <div className="space-y-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 dark:text-zinc-300 block mb-1">
                    Nomor Polisi (Plat Kendaraan):
                  </label>
                  <input
                    type="text"
                    value={vehiclePlate}
                    onChange={(e) => setVehiclePlate(e.target.value)}
                    placeholder="AD XXXX QA"
                    className="sg-input w-full font-mono font-bold uppercase"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-600 dark:text-zinc-300 block mb-1">
                    Merk & Tipe Kendaraan:
                  </label>
                  <input
                    type="text"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    placeholder="Honda Vario 160 / Toyota Calya"
                    className="sg-input w-full font-semibold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-600 dark:text-zinc-300 block mb-1">
                    Rekening Bank / E-Wallet SHU Koperasi:
                  </label>
                  <input
                    type="text"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    placeholder="BSI / BCA / GoPay / OVO..."
                    className="sg-input w-full font-semibold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* MERCHANT FIELDS */}
          {activeRole === "merchant" && (
            <div className="space-y-3 bg-orange-500/5 dark:bg-orange-950/20 p-3.5 rounded-2xl border border-orange-500/20">
              <h4 className="font-bold text-orange-800 dark:text-orange-300 flex items-center gap-1.5 text-xs">
                <Store className="h-3.5 w-3.5 text-orange-500" /> Profil Lapak Pasar & Legalitas Tera
              </h4>

              <div className="space-y-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 dark:text-zinc-300 block mb-1">
                    Nama Toko / Kios Kuliner:
                  </label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="Warung Mbok Darmi"
                    className="sg-input w-full font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 dark:text-zinc-300 block mb-1">
                      Pasar Tradisional:
                    </label>
                    <input
                      type="text"
                      value={marketLocation}
                      onChange={(e) => setMarketLocation(e.target.value)}
                      placeholder="Pasar Gede"
                      className="sg-input w-full font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 dark:text-zinc-300 block mb-1">
                      Nomor Kios / Los:
                    </label>
                    <input
                      type="text"
                      value={stallNumber}
                      onChange={(e) => setStallNumber(e.target.value)}
                      placeholder="Los D-14"
                      className="sg-input w-full font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 dark:text-zinc-300 block mb-1">
                      Jam Buka Operasional:
                    </label>
                    <input
                      type="text"
                      value={operatingHours}
                      onChange={(e) => setOperatingHours(e.target.value)}
                      placeholder="05.00 - 15.00 WIB"
                      className="sg-input w-full font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 dark:text-zinc-300 block mb-1">
                      Nomor Seri Tera Timbangan:
                    </label>
                    <input
                      type="text"
                      value={teraSerialNumber}
                      onChange={(e) => setTeraSerialNumber(e.target.value)}
                      placeholder="TERA-PAS-2026"
                      className="sg-input w-full font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* GOVERNMENT FIELDS */}
          {activeRole === "government" && (
            <div className="space-y-3 bg-teal-500/5 dark:bg-teal-950/20 p-3.5 rounded-2xl border border-teal-500/20">
              <h4 className="font-bold text-teal-800 dark:text-teal-300 flex items-center gap-1.5 text-xs">
                <Building2 className="h-3.5 w-3.5 text-teal-500" /> Profil Aparatur & Instansi OPD
              </h4>

              <div className="space-y-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 dark:text-zinc-300 block mb-1">
                    Nomor Induk Pegawai (NIP):
                  </label>
                  <input
                    type="text"
                    value={nip}
                    onChange={(e) => setNip(e.target.value)}
                    placeholder="19880412 201201 1 004"
                    className="sg-input w-full font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-600 dark:text-zinc-300 block mb-1">
                    Seksi / Bidang Operasional:
                  </label>
                  <input
                    type="text"
                    value={departmentSection}
                    onChange={(e) => setDepartmentSection(e.target.value)}
                    placeholder="Bidang Pengelolaan Pasar & Distribusi"
                    className="sg-input w-full font-semibold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* INDUSTRY FIELDS */}
          {activeRole === "industry" && (
            <div className="space-y-3 bg-blue-500/5 dark:bg-blue-950/20 p-3.5 rounded-2xl border border-blue-500/20">
              <h4 className="font-bold text-blue-800 dark:text-blue-300 flex items-center gap-1.5 text-xs">
                <Building2 className="h-3.5 w-3.5 text-blue-500" /> Profil Entitas B2B & Logistik Kargo
              </h4>

              <div className="space-y-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 dark:text-zinc-300 block mb-1">
                    Nomor Induk Berusaha (NIB):
                  </label>
                  <input
                    type="text"
                    value={companyNib}
                    onChange={(e) => setCompanyNib(e.target.value)}
                    placeholder="0128918291029"
                    className="sg-input w-full font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-600 dark:text-zinc-300 block mb-1">
                    Kontak PIC Logistik:
                  </label>
                  <input
                    type="text"
                    value={picLogistics}
                    onChange={(e) => setPicLogistics(e.target.value)}
                    placeholder="Nama PIC (No. Telp)"
                    className="sg-input w-full font-semibold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              disabled={isSaving}
              className="w-full h-11 text-xs font-black rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : saveSuccess ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-white" />
                  <span>Pengaturan Berhasil Disimpan!</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Simpan Perubahan Akun</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
