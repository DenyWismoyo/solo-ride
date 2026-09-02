"use client";

import React from "react";
import { X, Send, CheckCircle2, Loader2, FileCheck2, MapPin, Phone, User, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppService } from "@/constants/services";

interface CivicServiceRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: AppService | null;
  citizenNikOrRef: string;
  setCitizenNikOrRef: (val: string) => void;
  citizenPhone: string;
  setCitizenPhone: (val: string) => void;
  deliveryAddress: string;
  setDeliveryAddress: (val: string) => void;
  citizenNotes: string;
  setCitizenNotes: (val: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isSubmitting: boolean;
  successOrderId: string | null;
}

export function CivicServiceRequestModal({
  isOpen,
  onClose,
  service,
  citizenNikOrRef,
  setCitizenNikOrRef,
  citizenPhone,
  setCitizenPhone,
  deliveryAddress,
  setDeliveryAddress,
  citizenNotes,
  setCitizenNotes,
  onSubmit,
  isSubmitting,
  successOrderId
}: CivicServiceRequestModalProps) {
  if (!isOpen || !service) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="sg-bento-card p-6 max-w-lg w-full space-y-4 shadow-2xl my-8">
        <div className="flex justify-between items-start border-b border-slate-100 dark:border-white/[0.06] pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500/20 via-teal-500/15 to-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-xs">
              {typeof service.icon === "function" || (typeof service.icon === "object" && service.icon !== null && !React.isValidElement(service.icon)) ? (
                <service.icon size={24} variant="duotone" className="h-6 w-6" />
              ) : React.isValidElement(service.icon) ? (
                service.icon
              ) : (
                <span className="text-2xl">{service.icon}</span>
              )}
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                {service.name}
              </h3>
              <p className="text-xs text-slate-400">
                Instansi: {service.agencyName || "Pemkot Surakarta / Mitra"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 p-1 cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        {successOrderId ? (
          <div className="py-6 text-center space-y-3">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
            <h4 className="text-base font-black text-slate-900 dark:text-white">
              Permohonan Berhasil Dikirim!
            </h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Nomor Berkas: <strong className="font-mono text-emerald-600">#{successOrderId.slice(0, 8).toUpperCase()}</strong>. Anda dapat memantau status secara langsung di tab Aktivitas.
            </p>
            <Button onClick={onClose} className="w-full h-10 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs cursor-pointer">
              Tutup
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                NIK / No. Identitas Pemohon:
              </label>
              <input
                type="text"
                value={citizenNikOrRef}
                onChange={(e) => setCitizenNikOrRef(e.target.value)}
                placeholder="16 digit NIK KTP..."
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl font-mono text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                Nomor WhatsApp Aktif:
              </label>
              <input
                type="tel"
                value={citizenPhone}
                onChange={(e) => setCitizenPhone(e.target.value)}
                placeholder="08xxxxxxxxxx"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                Alamat Pengantaran / Lokasi Layanan:
              </label>
              <textarea
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                rows={2}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                Catatan Tambahan:
              </label>
              <textarea
                value={citizenNotes}
                onChange={(e) => setCitizenNotes(e.target.value)}
                rows={2}
                placeholder="Tuliskan keterangan detail keperluan Anda..."
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Kirim Permohonan Layanan</span>
                </>
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
