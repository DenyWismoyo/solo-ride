"use client";

import React from "react";
import { ShieldCheck, FileCheck, PhoneCall, LogOut, CheckCircle2, AlertTriangle, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface DriverPartnerTabProps {
  user: any;
  userData: any;
  vehiclePlate: string;
  isKycVerified: boolean;
  kycPending: boolean;
  onOpenKycModal: () => void;
  onLogout: () => void;
}

export function DriverPartnerTab({
  user,
  userData,
  vehiclePlate,
  isKycVerified,
  kycPending,
  onOpenKycModal,
  onLogout
}: DriverPartnerTabProps) {
  return (
    <main className="pt-20 px-4 space-y-5 max-w-lg w-full mx-auto flex-1 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Akun & Legalitas Mitra
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">Identitas resmi & bantuan darurat di jalan</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onLogout}
          className="h-8 text-xs text-rose-500 hover:bg-rose-500/10 border-rose-500/30 rounded-xl gap-1 cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" /> Keluar
        </Button>
      </div>

      {/* Digital Member Card (KTA Digital Koperasi) */}
      <div className="relative rounded-[2rem] overflow-hidden p-6 bg-gradient-to-tr from-slate-900 via-zinc-900 to-emerald-950 text-white shadow-2xl border border-emerald-500/30 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[9px] font-extrabold text-emerald-400 uppercase tracking-widest bg-emerald-500/20 px-2.5 py-1 rounded-md">
              KTA DIGITAL MITRA RIDE-SOLO
            </span>
            <h3 className="text-base font-black mt-2 text-white">
              {userData?.displayName || "Mitra Pengemudi"}
            </h3>
            <p className="text-xs text-slate-400 font-mono">ID: {user?.uid?.slice(0, 8).toUpperCase()}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-black text-xl">
            🛵
          </div>
        </div>

        <div className="pt-3 border-t border-slate-700/60 grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block">Plat Kendaraan:</span>
            <span className="font-bold text-white font-mono">{userData?.vehiclePlate || vehiclePlate || "AD 4821 QA"}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Status Anggota:</span>
            <span className="font-bold text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> Aktif Koperasi
            </span>
          </div>
        </div>
      </div>

      {/* KYC Legal Verification Status Card */}
      <div className="sg-bento-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <FileCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Dokumen Legalitas (KYC)</h3>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400">Verifikasi KTP & SIM Resmi</p>
            </div>
          </div>

          <Badge 
            variant={isKycVerified ? "emerald" : kycPending ? "amber" : "rose"} 
            size="sm"
          >
            {isKycVerified ? "Terverifikasi" : kycPending ? "Menunggu Verifikasi" : "Belum Lengkap"}
          </Badge>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] text-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-600 dark:text-zinc-300">
            <span>KTP Elektronik</span>
            <span className="font-bold">{isKycVerified ? "✅ Terdaftar" : kycPending ? "⏳ Diperiksa" : "❌ Belum Diupload"}</span>
          </div>
          <div className="flex items-center justify-between text-slate-600 dark:text-zinc-300">
            <span>SIM C/A Aktif</span>
            <span className="font-bold">{isKycVerified ? "✅ Terdaftar" : kycPending ? "⏳ Diperiksa" : "❌ Belum Diupload"}</span>
          </div>
        </div>

        {!isKycVerified && (
          <Button
            variant="outline"
            onClick={onOpenKycModal}
            className="w-full h-11 border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <FileCheck className="h-4 w-4" /> 
            <span>{kycPending ? "Update Berkas KYC" : "Upload KTP & SIM Sekarang"}</span>
          </Button>
        )}
      </div>

      {/* Emergency Contact & Safety Protocol */}
      <Card className="p-5 rounded-[1.75rem] bg-rose-500/10 border-rose-500/25 space-y-3 shadow-xs">
        <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400">
          <AlertTriangle className="h-5 w-5" />
          <h3 className="text-sm font-bold">Tombol Darurat & Bantuan Satgas 24 Jam</h3>
        </div>
        <p className="text-[11px] text-slate-600 dark:text-zinc-300 leading-relaxed">
          Gunakan tombol darurat ini jika Anda mengalami insiden kecelakaan, gangguan keamanan di jalan, atau kendala mogok saat membawa penumpang di wilayah Surakarta.
        </p>
        <Button 
          variant="outline"
          onClick={() => window.open("tel:081234567890", "_self")}
          className="w-full h-11 border-rose-500/50 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer"
        >
          <PhoneCall className="h-4 w-4" /> Hubungi Satgas Darurat (0812-3456-7890)
        </Button>
      </Card>

      {/* Basecamp & Posko Mitra Surakarta */}
      <div className="space-y-2.5 pt-1">
        <h4 className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider pl-1">
          Posko & Titik Kumpul Mitra Surakarta:
        </h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/[0.08] space-y-1 shadow-xs">
            <span className="font-bold text-slate-900 dark:text-white block">📍 Posko Manahan</span>
            <span className="text-[10px] text-slate-500 dark:text-zinc-400">Shelter Barat Stadion Manahan</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/[0.08] space-y-1 shadow-xs">
            <span className="font-bold text-slate-900 dark:text-white block">📍 Posko Balapan</span>
            <span className="text-[10px] text-slate-500 dark:text-zinc-400">Jl. Wolter Monginsidi</span>
          </div>
        </div>
      </div>
    </main>
  );
}
