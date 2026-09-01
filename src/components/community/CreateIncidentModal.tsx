"use client";

import React, { useState } from "react";
import { useAuthContext } from "@/components/AuthProvider";
import { IncidentCategory, CreateIncidentDTO } from "@/types/traffic.types";
import { SOLO_DISTRICTS } from "@/constants/geofencing";
import { DEFAULT_CENTER } from "@/constants/maps";
import { Button } from "@/components/ui/button";
import { 
  X, 
  MapPin, 
  AlertTriangle, 
  Send, 
  Loader2, 
  Waves, 
  Cone, 
  Calendar, 
  Car, 
  Sparkles,
  Camera
} from "lucide-react";

interface CreateIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateIncidentDTO) => Promise<string>;
}

export function CreateIncidentModal({
  isOpen,
  onClose,
  onSubmit
}: CreateIncidentModalProps) {
  const { user, userData } = useAuthContext();

  const [category, setCategory] = useState<IncidentCategory>("roadblock");
  const [title, setTitle] = useState("");
  const [streetName, setStreetName] = useState("");
  const [districtId, setDistrictId] = useState<"banjarsari" | "jebres" | "laweyan" | "pasar_kliwon" | "serengan">("banjarsari");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const categories: { id: IncidentCategory; label: string; icon: string; desc: string }[] = [
    { id: "roadblock", label: "Hajatan / Penutupan Jalan", icon: "🎪", desc: "Tenda mantenan, pawai, gang ditutup" },
    { id: "flood", label: "Banjir / Genangan Air", icon: "🌊", desc: "Genangan air hujan > 15 cm" },
    { id: "event", label: "CFD & Event Publik", icon: "🏃", desc: "Car Free Day, panggung hiburan" },
    { id: "roadwork", label: "Perbaikan Jalan / Proyek", icon: "🚧", desc: "Galian aspal, pohon tumbang" },
    { id: "traffic", label: "Kemacetan Padat", icon: "🚗", desc: "Antrean kereta api, pasar tumpah" }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !streetName.trim()) return;

    setIsSubmitting(true);
    try {
      const selectedDistrict = SOLO_DISTRICTS.find(d => d.id === districtId);
      const coords = selectedDistrict ? selectedDistrict.center : DEFAULT_CENTER;

      await onSubmit({
        category,
        title: title.trim(),
        streetName: streetName.trim(),
        districtId,
        description: description.trim() || "Kondisi jalanan sedang mengalami kendala/pengalihan arus.",
        location: {
          lat: coords.lat,
          lng: coords.lng,
          address: `${streetName.trim()}, Kecamatan ${selectedDistrict?.shortName || "Solo"}, Surakarta`
        },
        reporterId: user?.uid || "guest",
        reporterName: userData?.displayName || user?.displayName || "Warga Solo",
        reporterRole: (userData?.role as any) || "customer"
      });

      onClose();
    } catch (err: any) {
      alert(`Gagal membuat laporan: ${err.message || err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#0c1220] rounded-[2rem] max-w-lg w-full p-6 shadow-2xl border border-slate-200/80 dark:border-white/10 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-orange-500/15 text-orange-600 dark:text-orange-400 flex items-center justify-center text-2xl shrink-0">
              📢
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400 block">
                POJOK REMBUG SURAKARTA
              </span>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Laporkan Kondisi Jalanan Live
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Category Selector */}
          <div>
            <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-2">
              Pilih Jenis Kondisi Jalan <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`p-3 rounded-2xl border text-left transition-all flex items-start gap-2.5 cursor-pointer ${
                    category === cat.id
                      ? "bg-orange-500/10 border-orange-500 text-slate-900 dark:text-white shadow-xs"
                      : "bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 text-slate-600 dark:text-zinc-400 hover:border-slate-300"
                  }`}
                >
                  <span className="text-lg">{cat.icon}</span>
                  <div>
                    <span className="font-bold block text-xs">{cat.label}</span>
                    <span className="text-[10px] text-slate-400 block leading-tight">{cat.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* District & Street Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                Kecamatan <span className="text-rose-500">*</span>
              </label>
              <select
                value={districtId}
                onChange={(e) => setDistrictId(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
              >
                {SOLO_DISTRICTS.map((d) => (
                  <option key={d.id} value={d.id}>
                    Kecamatan {d.shortName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                Nama Jalan / Titik Lokasi <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={streetName}
                onChange={(e) => setStreetName(e.target.value)}
                placeholder="Contoh: Jl. Slamet Riyadi (Depan Sriwedari)..."
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                required
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
              Judul Laporan Singkat <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Penutupan Jalan Hajatan Mantenan Warga Gang II"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
              Keterangan Tambahan / Rute Alternatif
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Jelaskan kondisi detail, jalur pengalihan, atau perkiraan durasi..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-11 rounded-xl text-xs cursor-pointer"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs gap-1.5 shadow-md shadow-orange-500/20 cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span>Kirim Laporan Warga</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
