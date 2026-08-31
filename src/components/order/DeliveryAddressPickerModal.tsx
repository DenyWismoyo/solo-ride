"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { SavedAddress, UserDocument } from "@/types/user.types";
import { LocationPoint } from "@/types/order.types";
import { addressService, DEFAULT_SOLO_ADDRESSES } from "@/services/address.service";
import { PlaceAutocomplete } from "@/components/map/PlaceAutocomplete";
import { RouteMap } from "@/components/map/RouteMap";
import { DEFAULT_CENTER } from "@/constants/maps";
import { reverseGeocodeSurakarta, getLocalNearestAddress } from "@/lib/geoResolver";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Home, 
  Building2, 
  GraduationCap, 
  Map, 
  LocateFixed, 
  Search, 
  Check, 
  X, 
  ArrowLeft,
  Loader2,
  Navigation,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface DeliveryAddressPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAddress: LocationPoint;
  onSelectAddress: (point: LocationPoint, detailNotes?: string) => void;
  userUid?: string;
  savedAddresses?: SavedAddress[];
}

export function DeliveryAddressPickerModal({
  isOpen,
  onClose,
  currentAddress,
  onSelectAddress,
  userUid,
  savedAddresses: propSavedAddresses,
}: DeliveryAddressPickerModalProps) {
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>(
    propSavedAddresses && propSavedAddresses.length > 0 ? propSavedAddresses : DEFAULT_SOLO_ADDRESSES
  );
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"saved" | "search">("saved");

  // Manual Map Pin Drop Modal State
  const [isMapPinMode, setIsMapPinMode] = useState(false);
  const [mapCoords, setMapCoords] = useState<{ lat: number; lng: number }>({
    lat: currentAddress.lat || DEFAULT_CENTER.lat,
    lng: currentAddress.lng || DEFAULT_CENTER.lng,
  });
  const [resolvedMapAddress, setResolvedMapAddress] = useState<string>(
    currentAddress.address || "Memuat alamat titik..."
  );
  const [isResolvingMap, setIsResolvingMap] = useState(false);
  const geocodeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch latest saved addresses
  useEffect(() => {
    if (!isOpen) return;

    if (userUid) {
      setLoadingSaved(true);
      addressService
        .getSavedAddresses(userUid)
        .then((res) => {
          if (res && res.length > 0) setSavedAddresses(res);
        })
        .finally(() => setLoadingSaved(false));
    }
  }, [isOpen, userUid]);

  // Handle map center drag in manual pin drop mode
  const handleMapCenterChange = useCallback((coords: { lat: number; lng: number }) => {
    setMapCoords(coords);
    setResolvedMapAddress(getLocalNearestAddress(coords.lat, coords.lng));
    setIsResolvingMap(true);

    if (geocodeTimeoutRef.current) {
      clearTimeout(geocodeTimeoutRef.current);
    }

    geocodeTimeoutRef.current = setTimeout(async () => {
      try {
        const addr = await reverseGeocodeSurakarta(coords.lat, coords.lng);
        setResolvedMapAddress(addr);
      } finally {
        setIsResolvingMap(false);
      }
    }, 300);
  }, []);

  const handleConfirmMapPin = () => {
    const point: LocationPoint = {
      lat: mapCoords.lat,
      lng: mapCoords.lng,
      address: resolvedMapAddress || `Titik Peta (${mapCoords.lat.toFixed(4)}, ${mapCoords.lng.toFixed(4)})`,
    };
    onSelectAddress(point);
    setIsMapPinMode(false);
    onClose();
  };

  const handleSelectSaved = (saved: SavedAddress) => {
    const point: LocationPoint = {
      lat: saved.lat || -7.5621,
      lng: saved.lng || 110.8547,
      address: saved.address,
    };
    onSelectAddress(point, saved.detail);
    onClose();
  };

  const handleUseCurrentGPS = () => {
    if (!navigator.geolocation) {
      alert("GPS Geolocation tidak didukung di browser ini.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const addr = await reverseGeocodeSurakarta(lat, lng);
        onSelectAddress({ lat, lng, address: addr });
        onClose();
      },
      () => {
        alert("Gagal membaca koordinat GPS. Pastikan izin lokasi diaktifkan.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const getIconForLabel = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes("rumah")) return <Home className="h-4 w-4 text-emerald-500" />;
    if (l.includes("kantor") || l.includes("kerja")) return <Building2 className="h-4 w-4 text-blue-500" />;
    if (l.includes("kampus") || l.includes("uns") || l.includes("ums")) return <GraduationCap className="h-4 w-4 text-purple-500" />;
    return <MapPin className="h-4 w-4 text-rose-500" />;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/75 backdrop-blur-xs p-0 md:p-4">
        {/* Fullscreen Map Pin Drop Sub-View */}
        {isMapPinMode ? (
          <div className="relative w-full h-[100dvh] md:h-[90vh] md:max-w-xl bg-slate-950 md:rounded-3xl overflow-hidden flex flex-col justify-between">
            {/* Map Layer */}
            <div className="absolute inset-0 z-0">
              <RouteMap
                pickup={null}
                dropoff={null}
                manualPinMode="dropoff"
                onCenterChange={handleMapCenterChange}
                className="w-full h-full"
              />
            </div>

            {/* Top Floating Helper */}
            <div className="relative z-20 p-4 flex items-center justify-between pointer-events-none">
              <button
                type="button"
                onClick={() => setIsMapPinMode(false)}
                className="pointer-events-auto bg-white/95 dark:bg-[#0c1220]/95 border border-slate-200 dark:border-white/[0.1] px-3.5 py-2 rounded-full shadow-2xl backdrop-blur-xl text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Kembali</span>
              </button>

              <div className="px-3.5 py-1.5 rounded-full bg-rose-600 text-white text-xs font-bold shadow-2xl backdrop-blur-xl flex items-center gap-1.5">
                <Navigation className="h-3.5 w-3.5" />
                <span>Geser Peta ke Rumah Anda</span>
              </div>
            </div>

            {/* Bottom Address Confirmation Sheet */}
            <div className="relative z-20 p-4 mt-auto">
              <div className="bg-white/95 dark:bg-[#0c1220]/95 border border-slate-200 dark:border-white/[0.1] rounded-3xl shadow-2xl p-4 backdrop-blur-2xl space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Titik Antar Terpilih:
                    </span>
                    {isResolvingMap && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" /> Membaca jalan...
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-black text-slate-900 dark:text-white line-clamp-2">
                    {resolvedMapAddress}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {mapCoords.lat.toFixed(5)}, {mapCoords.lng.toFixed(5)}
                  </p>
                </div>

                <Button
                  onClick={handleConfirmMapPin}
                  className="w-full h-12 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-2xl shadow-xl shadow-rose-600/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check className="h-4 w-4" />
                  <span>Pasang Sebagai Alamat Pengantaran</span>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Main Address Selector Modal */
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="bg-white dark:bg-[#0c1220] border-t md:border border-slate-200 dark:border-white/[0.1] rounded-t-3xl md:rounded-3xl max-w-lg w-full max-h-[85dvh] flex flex-col shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-orange-500/15 text-orange-600 dark:text-orange-400">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Pilih Alamat Pengantaran
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Kirim makanan langsung ke lokasi presisi Anda di Solo
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Map & GPS Action Buttons */}
            <div className="p-3 bg-slate-50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/[0.04] grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsMapPinMode(true)}
                className="p-2.5 rounded-2xl bg-white dark:bg-zinc-800/80 border border-slate-200/80 dark:border-white/[0.08] hover:border-orange-500/40 text-left flex items-center gap-2.5 cursor-pointer shadow-xs transition-all group"
              >
                <div className="p-2 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
                  <Map className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">
                    Pilih di Peta
                  </span>
                  <span className="text-[9px] text-slate-400">Geser pin manual</span>
                </div>
              </button>

              <button
                type="button"
                onClick={handleUseCurrentGPS}
                className="p-2.5 rounded-2xl bg-white dark:bg-zinc-800/80 border border-slate-200/80 dark:border-white/[0.08] hover:border-emerald-500/40 text-left flex items-center gap-2.5 cursor-pointer shadow-xs transition-all group"
              >
                <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                  <LocateFixed className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">
                    Lokasi GPS Saya
                  </span>
                  <span className="text-[9px] text-slate-400">Otomatis deteksi</span>
                </div>
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-100 dark:border-white/[0.06] px-4 pt-2">
              <button
                onClick={() => setActiveTab("saved")}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 cursor-pointer transition-colors ${
                  activeTab === "saved"
                    ? "border-orange-500 text-orange-600 dark:text-orange-400"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                Alamat Tersimpan ({savedAddresses.length})
              </button>
              <button
                onClick={() => setActiveTab("search")}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 cursor-pointer transition-colors ${
                  activeTab === "search"
                    ? "border-orange-500 text-orange-600 dark:text-orange-400"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                Cari Alamat Baru
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {activeTab === "saved" ? (
                <div className="space-y-2">
                  {loadingSaved ? (
                    <div className="p-6 text-center text-slate-400 text-xs">
                      <Loader2 className="h-4 w-4 animate-spin mx-auto mb-1" />
                      Memuat alamat tersimpan...
                    </div>
                  ) : savedAddresses.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs space-y-2">
                      <p>Belum ada alamat yang tersimpan di profil Anda.</p>
                      <Button
                        size="sm"
                        onClick={() => setActiveTab("search")}
                        className="rounded-xl text-xs bg-orange-600 text-white"
                      >
                        Cari Alamat
                      </Button>
                    </div>
                  ) : (
                    savedAddresses.map((addr) => {
                      const isCurrent = currentAddress.address === addr.address;
                      return (
                        <div
                          key={addr.id}
                          onClick={() => handleSelectSaved(addr)}
                          className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all flex items-start gap-3 ${
                            isCurrent
                              ? "bg-orange-500/10 border-orange-500 shadow-xs"
                              : "bg-slate-50 dark:bg-white/[0.03] border-slate-200/60 dark:border-white/[0.06] hover:border-orange-500/40"
                          }`}
                        >
                          <div className="p-2 rounded-xl bg-white dark:bg-zinc-800 shrink-0 border border-slate-200/60 dark:border-white/[0.06]">
                            {getIconForLabel(addr.label)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-black text-slate-900 dark:text-white">
                                {addr.label}
                              </span>
                              {addr.isDefault && (
                                <Badge variant="emerald" size="sm" className="text-[9px] py-0 px-1.5">
                                  Utama
                                </Badge>
                              )}
                              {isCurrent && (
                                <Badge variant="orange" size="sm" className="text-[9px] py-0 px-1.5">
                                  Terpilih
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs font-semibold text-slate-700 dark:text-zinc-200 mt-0.5 line-clamp-2">
                              {addr.address}
                            </p>
                            {addr.detail && (
                              <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                                Catatan: {addr.detail}
                              </p>
                            )}
                          </div>

                          {isCurrent ? (
                            <Check className="h-4 w-4 text-orange-500 shrink-0 mt-1" />
                          ) : null}
                        </div>
                      );
                    })
                  )}
                </div>
              ) : (
                /* Search Tab */
                <div className="space-y-3 pt-1">
                  <p className="text-[11px] text-slate-400 font-semibold">
                    Ketik nama jalan, kelurahan, atau perumahan di Surakarta:
                  </p>
                  <PlaceAutocomplete
                    value={currentAddress.address}
                    placeholder="Cari jalan atau kelurahan di Solo..."
                    onPickOnMapClick={() => setIsMapPinMode(true)}
                    onLocationSelect={(point) => {
                      onSelectAddress(point);
                      onClose();
                    }}
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
}
