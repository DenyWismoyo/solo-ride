"use client";

import React, { useState } from "react";
import { LocationPoint } from "@/types/order.types";
import { Map, Compass, MapPin } from "lucide-react";

interface PlaceAutocompleteProps {
  onLocationSelect?: (location: LocationPoint) => void;
  onPlaceSelect?: (place: any) => void;
  onPickOnMapClick?: () => void;
  placeholder?: string;
  className?: string;
  initialValue?: string;
  value?: string;
}

export function PlaceAutocomplete({ 
  onLocationSelect, 
  onPickOnMapClick,
  placeholder = "Pilih lokasi dari peta atau GPS...", 
  className,
  initialValue = "",
  value
}: PlaceAutocompleteProps) {
  const [isLoadingGPS, setIsLoadingGPS] = useState(false);

  const displayValue = value !== undefined ? value : initialValue;

  const handleUseCurrentGPS = () => {
    if (!navigator.geolocation) {
      alert("GPS Geolocation tidak didukung oleh browser Anda.");
      return;
    }
    setIsLoadingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const address = "Lokasi Saya Saat Ini (GPS Terkini)";
        setIsLoadingGPS(false);
        if (onLocationSelect) {
          onLocationSelect({ lat, lng, address });
        }
      },
      (err) => {
        setIsLoadingGPS(false);
        alert("Gagal membaca koordinat GPS perangkat. Pastikan izin lokasi aktif.");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div className={`w-full flex flex-col gap-2 ${className || ""}`}>
      {/* Display Field */}
      <div 
        className="w-full relative cursor-pointer"
        onClick={onPickOnMapClick}
      >
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MapPin className="h-4 w-4 text-slate-400" />
        </div>
        <input
          type="text"
          readOnly
          value={displayValue}
          placeholder={placeholder}
          className="w-full bg-slate-50 dark:bg-zinc-800/90 border border-slate-200 dark:border-zinc-700/80 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-xs"
        />
      </div>

    </div>
  );
}
