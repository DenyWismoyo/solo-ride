"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { motion, AnimatePresence } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Home, 
  Building, 
  GraduationCap, 
  Plus, 
  X, 
  Check, 
  Trash2, 
  Edit3, 
  Star, 
  Bike, 
  Loader2, 
  CheckCircle2, 
  Phone, 
  Navigation,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { SavedAddress } from "@/types/user.types";
import { addressService, DEFAULT_SOLO_ADDRESSES } from "@/services/address.service";
import { POPULAR_SOLO_LANDMARKS } from "@/constants/merchants";

interface SavedAddressesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAddressForRide?: (address: SavedAddress) => void;
}

const PRESET_LABELS = [
  { label: "Rumah", icon: Home, color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  { label: "Kantor", icon: Building, color: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/30" },
  { label: "Kampus", icon: GraduationCap, color: "text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/30" },
  { label: "Lainnya", icon: MapPin, color: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30" }
];

export function SavedAddressesModal({ isOpen, onClose, onSelectAddressForRide }: SavedAddressesModalProps) {
  const router = useRouter();
  const { user, userData } = useAuthContext();

  const [addresses, setAddresses] = useState<SavedAddress[]>(DEFAULT_SOLO_ADDRESSES);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  // Form States
  const [label, setLabel] = useState("Rumah");
  const [customLabel, setCustomLabel] = useState("");
  const [addressText, setAddressText] = useState("");
  const [detailText, setDetailText] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch saved addresses from service on open
  useEffect(() => {
    if (!isOpen) return;
    if (user?.uid) {
      setLoading(true);
      addressService.getSavedAddresses(user.uid)
        .then((res) => {
          setAddresses(res);
        })
        .catch(() => {
          setAddresses(DEFAULT_SOLO_ADDRESSES);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setAddresses(DEFAULT_SOLO_ADDRESSES);
    }
  }, [isOpen, user]);

  const handleOpenAddForm = () => {
    setEditingAddressId(null);
    setLabel("Rumah");
    setCustomLabel("");
    setAddressText("");
    setDetailText("");
    setContactName(userData?.displayName || "");
    setContactPhone(userData?.phone || "081234567891");
    setIsDefault(addresses.length === 0);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (addr: SavedAddress) => {
    setEditingAddressId(addr.id);
    if (["Rumah", "Kantor", "Kampus"].includes(addr.label)) {
      setLabel(addr.label);
      setCustomLabel("");
    } else {
      setLabel("Lainnya");
      setCustomLabel(addr.label);
    }
    setAddressText(addr.address);
    setDetailText(addr.detail || "");
    setContactName(addr.contactName || userData?.displayName || "");
    setContactPhone(addr.contactPhone || userData?.phone || "");
    setIsDefault(addr.isDefault || false);
    setIsFormOpen(true);
  };

  const handleApplyPresetLandmark = (landmark: typeof POPULAR_SOLO_LANDMARKS[0]) => {
    setAddressText(landmark.address);
    setDetailText(`Patokan: ${landmark.name}`);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressText.trim()) {
      alert("Masukkan alamat lengkap terlebih dahulu.");
      return;
    }

    setIsSaving(true);
    const finalLabel = label === "Lainnya" && customLabel.trim() ? customLabel.trim() : label;
    const newAddress: SavedAddress = {
      id: editingAddressId || `addr-${Date.now()}`,
      label: finalLabel,
      address: addressText.trim(),
      detail: detailText.trim(),
      contactName: contactName.trim(),
      contactPhone: contactPhone.trim(),
      isDefault: isDefault,
      lat: -7.5621,
      lng: 110.8547
    };

    try {
      if (user?.uid) {
        const updated = await addressService.saveAddress(user.uid, newAddress);
        setAddresses(updated);
      } else {
        // Fallback local update
        const existingIndex = addresses.findIndex(a => a.id === newAddress.id);
        let updated: SavedAddress[];
        if (existingIndex >= 0) {
          updated = [...addresses];
          updated[existingIndex] = newAddress;
        } else {
          updated = [newAddress, ...addresses];
        }
        if (isDefault) {
          updated = updated.map(a => ({ ...a, isDefault: a.id === newAddress.id }));
        }
        setAddresses(updated);
      }
      setIsFormOpen(false);
    } catch (err: any) {
      alert(`Gagal menyimpan alamat: ${err.message || err}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAddress = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Hapus alamat ini dari daftar tersimpan?")) return;

    try {
      if (user?.uid) {
        const updated = await addressService.deleteAddress(user.uid, id);
        setAddresses(updated);
      } else {
        setAddresses(addresses.filter(a => a.id !== id));
      }
    } catch (err: any) {
      alert(`Gagal menghapus alamat: ${err.message || err}`);
    }
  };

  const handleSetDefault = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (user?.uid) {
        const updated = await addressService.setDefaultAddress(user.uid, id);
        setAddresses(updated);
      } else {
        setAddresses(addresses.map(a => ({ ...a, isDefault: a.id === id })));
      }
    } catch (err: any) {
      alert(`Gagal menetapkan alamat utama: ${err.message || err}`);
    }
  };

  const handleSelectAndRide = (addr: SavedAddress) => {
    if (onSelectAddressForRide) {
      onSelectAddressForRide(addr);
      onClose();
    } else {
      onClose();
      router.push(`/services/ride?dropoff=${encodeURIComponent(addr.address)}`);
    }
  };

  const getLabelIcon = (lbl: string) => {
    if (lbl.toLowerCase().includes("rumah")) return Home;
    if (lbl.toLowerCase().includes("kantor")) return Building;
    if (lbl.toLowerCase().includes("kampus") || lbl.toLowerCase().includes("sekolah")) return GraduationCap;
    return MapPin;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.92, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 450, damping: 28 }}
            className="w-full max-w-lg bg-white dark:bg-[#0c1220] rounded-[2.2rem] border border-slate-200/80 dark:border-white/[0.08] p-5 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Alamat Favorit Tersimpan
                    </h3>
                    <Badge variant="emerald" size="sm">Surakarta</Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Kelola titik jemput & antar favorit Anda (Rumah, Kantor, Kampus)
                  </p>
                </div>
              </div>

              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>

            {/* Mode Switch: Form Input vs Address List */}
            {isFormOpen ? (
              /* FORM TAMBAH / EDIT ALAMAT */
              <form onSubmit={handleSaveAddress} className="space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-white/[0.06]">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {editingAddressId ? "✏️ Edit Alamat Tersimpan" : "➕ Tambah Alamat Favorit Baru"}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                  >
                    Batal
                  </button>
                </div>

                {/* Label Category Chips */}
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1.5">
                    Pilih Label Tempat
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {PRESET_LABELS.map((p) => {
                      const Icon = p.icon;
                      const isSelected = label === p.label;
                      return (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => setLabel(p.label)}
                          className={`p-2.5 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer border ${
                            isSelected
                              ? "bg-emerald-600 text-white border-emerald-500 shadow-sm"
                              : "bg-slate-50 dark:bg-white/[0.03] text-slate-700 dark:text-zinc-300 border-slate-200/80 dark:border-white/[0.06]"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          <span className="text-[10px]">{p.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {label === "Lainnya" && (
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                      Nama Label Kustom
                    </label>
                    <input
                      type="text"
                      value={customLabel}
                      onChange={(e) => setCustomLabel(e.target.value)}
                      placeholder="Contoh: Toko Kopi / Rumah Nenek / Kos"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                )}

                {/* Quick Preset Landmarks Solo */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Atau Pilih Landmark Cepat Solo:
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {POPULAR_SOLO_LANDMARKS.slice(0, 5).map((lm, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleApplyPresetLandmark(lm)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.04] hover:bg-emerald-500/10 hover:text-emerald-600 border border-slate-200 dark:border-white/[0.06] text-[10px] font-medium text-slate-600 dark:text-zinc-300 whitespace-nowrap cursor-pointer transition-colors"
                      >
                        📍 {lm.name.replace("Surakarta", "").replace("Solo", "").trim()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Address Full Text */}
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    Alamat Lengkap (Nama Jalan, No. Rumah, RT/RW, Kelurahan)
                  </label>
                  <textarea
                    value={addressText}
                    onChange={(e) => setAddressText(e.target.value)}
                    rows={2}
                    placeholder="Contoh: Jl. Kolonel Sutarto No. 45, RT 02/RW 04, Jebres, Surakarta"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                {/* Detail / Patokan Driver */}
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    Detail Patokan Driver (Warna Pagar, Depan Warung, dll.)
                  </label>
                  <input
                    type="text"
                    value={detailText}
                    onChange={(e) => setDetailText(e.target.value)}
                    placeholder="Contoh: Pagar hitam, depan toko kelontong Bu Warno, ada pohon mangga"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Contact Name & Phone */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                      Nama Kontak
                    </label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Nama Anda"
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                      Nomor WhatsApp
                    </label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="0812..."
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Default Address Checkbox */}
                <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 focus:ring-0 cursor-pointer"
                  />
                  <div className="flex-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Jadikan Alamat Utama
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400">
                      Otomatis menjadi titik jemput default saat memesan ojek
                    </span>
                  </div>
                </label>

                {/* Action Buttons */}
                <div className="pt-2 flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsFormOpen(false)}
                    className="h-11 text-xs rounded-xl cursor-pointer"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Menyimpan...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" /> Simpan Alamat Favorit
                      </>
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              /* LIST ALAMAT TERSIMPAN */
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider pl-1">
                    Daftar Tempat Tersimpan ({addresses.length})
                  </span>

                  <motion.button
                    whileTap={{ scale: 0.94 }}
                    onClick={handleOpenAddForm}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Tambah Alamat</span>
                  </motion.button>
                </div>

                {loading ? (
                  <div className="p-8 text-center bg-slate-50 dark:bg-white/[0.02] rounded-3xl border border-slate-200 dark:border-white/[0.06]">
                    <Loader2 className="h-6 w-6 text-emerald-500 animate-spin mx-auto mb-2" />
                    <p className="text-xs text-slate-500">Memuat alamat tersimpan...</p>
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 dark:bg-white/[0.02] rounded-3xl border border-slate-200 dark:border-white/[0.06] space-y-2">
                    <MapPin className="h-8 w-8 text-slate-400 mx-auto" />
                    <p className="text-xs font-bold text-slate-700 dark:text-zinc-300">Belum ada alamat tersimpan</p>
                    <p className="text-[11px] text-slate-500">Simpan alamat rumah dan kantor untuk pemesanan cepat 1-klik.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {addresses.map((addr) => {
                      const Icon = getLabelIcon(addr.label);
                      return (
                        <div
                          key={addr.id}
                          className={`p-4 rounded-[1.6rem] border transition-all space-y-3 bg-white/95 dark:bg-[#0c1220]/95 ${
                            addr.isDefault 
                              ? "border-emerald-500/50 shadow-[0_4px_20px_-2px_rgba(16,185,129,0.15)] dark:shadow-[0_8px_24px_-4px_rgba(16,185,129,0.2)]" 
                              : "border-slate-200/80 dark:border-white/[0.07] hover:border-slate-300 dark:hover:border-white/[0.15]"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shrink-0 ${
                                addr.label === "Rumah" 
                                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                                  : addr.label === "Kantor"
                                  ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30"
                                  : addr.label === "Kampus"
                                  ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30"
                                  : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                              }`}>
                                <Icon className="h-5 w-5" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="text-xs font-black text-slate-900 dark:text-white">
                                    {addr.label}
                                  </h4>
                                  {addr.isDefault && (
                                    <Badge variant="emerald" size="sm" className="h-4 text-[9px] px-1.5 py-0">
                                      UTAMA
                                    </Badge>
                                  )}
                                </div>
                                {addr.contactName && (
                                  <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">
                                    Penerima: {addr.contactName} {addr.contactPhone && `(${addr.contactPhone})`}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Quick Actions (Edit & Delete) */}
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleOpenEditForm(addr)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] cursor-pointer"
                                title="Edit Alamat"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={(e) => handleDeleteAddress(addr.id, e)}
                                className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                                title="Hapus Alamat"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="p-2.5 bg-slate-50 dark:bg-white/[0.03] rounded-xl space-y-1 border border-slate-100 dark:border-white/[0.04]">
                            <p className="text-xs text-slate-800 dark:text-zinc-200 font-medium leading-snug">
                              {addr.address}
                            </p>
                            {addr.detail && (
                              <p className="text-[10px] text-slate-500 dark:text-zinc-400 italic">
                                📌 {addr.detail}
                              </p>
                            )}
                          </div>

                          {/* Footer Actions */}
                          <div className="flex items-center justify-between gap-2 pt-1">
                            {!addr.isDefault ? (
                              <button
                                onClick={(e) => handleSetDefault(addr.id, e)}
                                className="text-[10px] font-bold text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 cursor-pointer"
                              >
                                <Star className="h-3 w-3" />
                                <span>Jadikan Alamat Utama</span>
                              </button>
                            ) : (
                              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                <span>Alamat Utama Terpilih</span>
                              </span>
                            )}

                            <motion.button
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleSelectAndRide(addr)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600/10 hover:bg-emerald-600 text-emerald-600 hover:text-white border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Bike className="h-3 w-3" />
                              <span>Pesan ke Sini</span>
                              <ArrowRight className="h-3 w-3" />
                            </motion.button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
