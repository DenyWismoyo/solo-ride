"use client";

import React, { useState } from "react";
import { FileCheck, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface KycUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    nik: string;
    simNumber: string;
    vehiclePlate: string;
    vehicleModel: string;
    ktpFile: File | null;
    simFile: File | null;
  }) => Promise<void>;
  isSubmitting: boolean;
}

export function KycUploadModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting
}: KycUploadModalProps) {
  const [nik, setNik] = useState("");
  const [simNumber, setSimNumber] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [ktpFile, setKtpFile] = useState<File | null>(null);
  const [simFile, setSimFile] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      nik,
      simNumber,
      vehiclePlate,
      vehicleModel,
      ktpFile,
      simFile
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="sg-bento-card p-6 max-w-sm w-full space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/[0.06] pb-3">
          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-amber-500" />
            <span>Verifikasi KYC Mitra Driver</span>
          </h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-full cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-zinc-300">Nomor Induk Kependudukan (NIK KTP):</label>
            <input
              type="text"
              placeholder="337201xxxxxxxxxx"
              value={nik}
              onChange={(e) => setNik(e.target.value)}
              className="sg-input text-xs font-mono font-bold tracking-wider"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-zinc-300">Nomor SIM C/A:</label>
            <input
              type="text"
              placeholder="1234-5678-910111"
              value={simNumber}
              onChange={(e) => setSimNumber(e.target.value)}
              className="sg-input text-xs font-mono font-bold"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-zinc-300">Plat Nomor:</label>
              <input
                type="text"
                value={vehiclePlate}
                onChange={(e) => setVehiclePlate(e.target.value)}
                className="sg-input text-xs font-mono font-bold"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-zinc-300">Tipe Motor/Mobil:</label>
              <input
                type="text"
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                className="sg-input text-xs font-semibold"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-zinc-300">Foto KTP:</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setKtpFile(e.target.files?.[0] || null)}
                className="w-full p-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] text-[10px] text-slate-900 dark:text-white file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-amber-100 file:text-amber-700 hover:file:bg-amber-200"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-zinc-300">Foto SIM:</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSimFile(e.target.files?.[0] || null)}
                className="w-full p-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] text-[10px] text-slate-900 dark:text-white file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-amber-100 file:text-amber-700 hover:file:bg-amber-200"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl mt-2 cursor-pointer shadow-md shadow-amber-600/20"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
            <span>Kirim Dokumen Verifikasi</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
