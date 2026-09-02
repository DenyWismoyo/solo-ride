"use client";

import React, { useState, useEffect } from "react";
import { OpdServiceConfig } from "@/services/opdService.service";
import { CivicOutputMode } from "@/types/civic.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  X, 
  Settings2, 
  Save, 
  Plus, 
  Trash2, 
  FileText, 
  Clock, 
  Coins, 
  Truck, 
  FileCheck2, 
  Siren, 
  Ticket, 
  UserCheck, 
  Sparkles,
  Loader2
} from "lucide-react";

interface ServiceEditorModalProps {
  service: OpdServiceConfig | null;
  agencyId: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: OpdServiceConfig) => Promise<void>;
}

export function ServiceEditorModal({
  service,
  agencyId,
  isOpen,
  onClose,
  onSave
}: ServiceEditorModalProps) {
  const isEditing = Boolean(service && !service.isCustom);
  const isNew = !service;

  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [description, setDescription] = useState("");
  const [outputMode, setOutputMode] = useState<CivicOutputMode>("delivery");
  const [price, setPrice] = useState(0);
  const [feeLabel, setFeeLabel] = useState("Gratis Subsidi Pemkot");
  const [slaMinutes, setSlaMinutes] = useState(120);
  const [requiresDeliveryAddress, setRequiresDeliveryAddress] = useState(true);
  const [requiresAttachments, setRequiresAttachments] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (service) {
      setName(service.name || "");
      setShortName(service.shortName || "");
      setDescription(service.description || "");
      setOutputMode(service.outputMode || "delivery");
      setPrice(service.price || 0);
      setFeeLabel(service.feeLabel || "Gratis Subsidi Pemkot");
      setSlaMinutes(service.slaMinutes || 120);
      setRequiresDeliveryAddress(service.requiresDeliveryAddress || false);
      setRequiresAttachments(service.requiresAttachments || false);
      setIsEmergency(service.isEmergency || false);
      setIsActive(service.isActive !== undefined ? service.isActive : true);
    } else {
      setName("");
      setShortName("");
      setDescription("");
      setOutputMode("delivery");
      setPrice(0);
      setFeeLabel("Gratis Subsidi Pemkot");
      setSlaMinutes(120);
      setRequiresDeliveryAddress(true);
      setRequiresAttachments(false);
      setIsEmergency(false);
      setIsActive(true);
    }
  }, [service, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      const generatedId = service?.id || `${agencyId.replace("gov_", "")}_${name.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 20)}_${Date.now().toString().slice(-4)}`;
      
      const configData: OpdServiceConfig = {
        id: generatedId,
        agencyId,
        name: name.trim(),
        shortName: shortName.trim() || name.trim(),
        description: description.trim(),
        outputMode,
        price: Number(price) || 0,
        feeLabel: feeLabel.trim() || (price === 0 ? "Gratis Subsidi Pemkot" : `Rp ${price.toLocaleString("id-ID")}`),
        slaMinutes: Number(slaMinutes) || 60,
        requiresDeliveryAddress,
        requiresAttachments,
        isEmergency,
        isActive,
        isCustom: service?.isCustom !== undefined ? service.isCustom : isNew
      };

      await onSave(configData);
      onClose();
    } catch (err: any) {
      alert(`Gagal menyimpan template layanan: ${err.message || err}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#0c1220] rounded-[2rem] max-w-lg w-full p-6 shadow-2xl border border-slate-200/80 dark:border-white/10 space-y-4 max-h-[92vh] overflow-y-auto sg-custom-scrollbar">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center text-xl shrink-0">
              <Settings2 className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-600 dark:text-teal-400 block">
                {isNew ? "BUAT SUB-LAYANAN BARU" : "PENGATURAN TEMPLATE LAYANAN"}
              </span>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                {name || "Konfigurasi Layanan OPD"}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Service Name */}
          <div>
            <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
              Nama Lengkap Sub-Layanan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Layanan Cetak & Antar KIA Anak..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
              required
            />
          </div>

          {/* Short Name */}
          <div>
            <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
              Nama Pendek (Untuk Label Tombol / Badge)
            </label>
            <input
              type="text"
              value={shortName}
              onChange={(e) => setShortName(e.target.value)}
              placeholder="Contoh: Antar KIA"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
              Deskripsi & Panduan untuk Warga
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Jelaskan mekanisme dan manfaat layanan ini bagi masyarakat..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Output Mode Selector */}
          <div>
            <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
              Mekanisme Luaran Layanan (Civic Output Archetype) <span className="text-rose-500">*</span>
            </label>
            <select
              value={outputMode}
              onChange={(e) => setOutputMode(e.target.value as CivicOutputMode)}
              className="sg-select w-full text-xs font-semibold"
            >
              <option value="delivery">🛵 Pengantaran Fisik Berkas / Obat (Mitra Driver + PIN OTP)</option>
              <option value="digital_issuance">📄 Dokumen / E-Certificate Digital Resmi (Ber-QR Code & PDF)</option>
              <option value="emergency_dispatch">🚨 Siaga Satgas Reaksi Cepat 24 Jam (Sirene + Live SLA Countdown)</option>
              <option value="subsidy_voucher">🎟️ Voucher Subsidi / Bantuan Pangan (Barcode Belanja Pasar)</option>
              <option value="field_visit">🧑‍💼 Penugasan Petugas Lapangan / Home Visit (Surat Tugas Digital)</option>
              <option value="civic_ticket">🎫 Tiket Pengaduan Publik / Reservasi Wisata</option>
            </select>
          </div>

          {/* SLA & Price Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1 flex items-center gap-1">
                <Clock className="h-3 w-3 text-teal-500" />
                <span>Target SLA (Menit)</span>
              </label>
              <input
                type="number"
                value={slaMinutes}
                onChange={(e) => setSlaMinutes(Number(e.target.value))}
                min={5}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500 font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1 flex items-center gap-1">
                <Coins className="h-3 w-3 text-amber-500" />
                <span>Tarif Layanan (Rp)</span>
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                min={0}
                placeholder="0 jika gratis"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500 font-mono"
              />
            </div>
          </div>

          {/* Fee Label */}
          <div>
            <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
              Label Tarif / Subsidi di UI
            </label>
            <input
              type="text"
              value={feeLabel}
              onChange={(e) => setFeeLabel(e.target.value)}
              placeholder="Contoh: Gratis Subsidi Pemkot Surakarta"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Toggles Checklist */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] space-y-2.5">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={requiresDeliveryAddress}
                onChange={(e) => setRequiresDeliveryAddress(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
              />
              <span className="font-medium text-slate-800 dark:text-zinc-200">
                Wajibkan Alamat Pengiriman / Penjemputan di Peta
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={requiresAttachments}
                onChange={(e) => setRequiresAttachments(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
              />
              <span className="font-medium text-slate-800 dark:text-zinc-200">
                Wajibkan Unggah Foto Berkas / Dokumen Pendukung
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isEmergency}
                onChange={(e) => setIsEmergency(e.target.checked)}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
              />
              <span className="font-medium text-slate-800 dark:text-zinc-200">
                Layanan Kategori Darurat (Bypass Verifikasi Loket)
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer pt-1 border-t border-slate-200/60 dark:border-white/[0.04]">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="font-bold text-emerald-700 dark:text-emerald-400">
                Buka Layanan Ini untuk Warga Sekarang
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-10 rounded-xl text-xs"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="h-10 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs gap-1.5 shadow-md shadow-teal-500/20"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>Simpan Template Layanan</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
