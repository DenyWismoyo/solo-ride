"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { useGoogleMaps } from "@/components/map/GoogleMapsProvider";
import { LocationPoint } from "@/types/order.types";
import { X, MapPin, Check, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isWithinGeofence } from "@/lib/geo";

interface MapLocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (location: LocationPoint) => void;
  initialLocation?: LocationPoint;
}

const DEFAULT_CENTER = { lat: -7.5666, lng: 110.8283 }; // Surakarta

export function MapLocationPickerModal({ isOpen, onClose, onSelect, initialLocation }: MapLocationPickerModalProps) {
  const { isLoaded } = useGoogleMaps();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [center, setCenter] = useState(initialLocation || DEFAULT_CENTER);
  const [markerPos, setMarkerPos] = useState(initialLocation || DEFAULT_CENTER);
  const [address, setAddress] = useState(initialLocation?.address || "");
  const [isGeocoding, setIsGeocoding] = useState(false);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  useEffect(() => {
    if (isOpen && initialLocation) {
      setCenter({ lat: initialLocation.lat, lng: initialLocation.lng });
      setMarkerPos({ lat: initialLocation.lat, lng: initialLocation.lng });
      setAddress(initialLocation.address || "");
    }
  }, [isOpen, initialLocation]);

  useEffect(() => {
    if (isLoaded && !geocoderRef.current && window.google?.maps) {
      geocoderRef.current = new window.google.maps.Geocoder();
    }
  }, [isLoaded]);

  const onMapLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const onMapUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const geocodeLocation = async (lat: number, lng: number) => {
    if (!geocoderRef.current) return;
    setIsGeocoding(true);
    try {
      const result = await geocoderRef.current.geocode({ location: { lat, lng } });
      if (result.results && result.results.length > 0) {
        setAddress(result.results[0].formatted_address);
      } else {
        setAddress("Lokasi tidak dikenali");
      }
    } catch (err) {
      setAddress("Gagal mendapatkan alamat");
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setMarkerPos({ lat, lng });
    geocodeLocation(lat, lng);
  };

  const handleConfirm = () => {
    if (!isWithinGeofence(markerPos.lat, markerPos.lng)) {
      alert("Maaf, layanan Ride-Solo saat ini hanya tersedia untuk titik lokasi di area Solo Raya (Maksimal 25 KM dari Pusat Kota).");
      return;
    }

    onSelect({
      lat: markerPos.lat,
      lng: markerPos.lng,
      address: address || `${markerPos.lat.toFixed(5)}, ${markerPos.lng.toFixed(5)}`
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white dark:bg-[#0f172a] rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-white/[0.08] flex flex-col h-[80vh] max-h-[800px]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-white/[0.04]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                  Pilih Titik Lokasi
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Geser pin atau tap pada peta
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Map Container */}
          <div className="flex-1 relative bg-slate-100 dark:bg-slate-800">
            {!isLoaded || typeof window === "undefined" || typeof window.google?.maps?.Map !== "function" ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
                <span className="text-xs font-medium text-slate-500">Memuat Peta...</span>
              </div>
            ) : (
              <GoogleMap
                mapContainerStyle={{ width: "100%", height: "100%" }}
                center={center}
                zoom={16}
                options={{
                  disableDefaultUI: false,
                  zoomControl: true,
                  mapTypeControl: false,
                  streetViewControl: false,
                  fullscreenControl: false,
                  gestureHandling: "greedy",
                  styles: [
                    {
                      featureType: "poi.business",
                      stylers: [{ visibility: "off" }],
                    }
                  ]
                }}
                onLoad={onMapLoad}
                onUnmount={onMapUnmount}
                onClick={handleMapClick}
              >
                <Marker
                  position={markerPos}
                  draggable={true}
                  onDragEnd={handleMapClick}
                  animation={window.google.maps.Animation.DROP}
                />
              </GoogleMap>
            )}
          </div>

          {/* Footer Address Info */}
          <div className="p-4 sm:p-5 bg-white dark:bg-[#0f172a] border-t border-slate-100 dark:border-white/[0.04]">
            <div className="p-3 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-slate-200 dark:border-white/[0.06] mb-4">
              <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 block mb-1 uppercase tracking-wider">
                Alamat Terpilih
              </span>
              <div className="flex items-center gap-2">
                {isGeocoding ? (
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                ) : (
                  <p className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2">
                    {address || "Menunggu lokasi..."}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="h-11 rounded-xl text-xs"
              >
                Batal
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={isGeocoding || !address}
                className="h-11 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md text-xs font-bold px-6 flex items-center gap-2"
              >
                <Check className="h-4 w-4" />
                Konfirmasi Lokasi
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
