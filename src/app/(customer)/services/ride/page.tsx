"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { useTheme } from "@/components/theme/ThemeProvider";
import { orderService } from "@/services/order.service";
import { functionsService } from "@/services/functions.service";
import { RouteMap } from "@/components/map/RouteMap";
import { PlaceAutocomplete } from "@/components/map/PlaceAutocomplete";
import { SoloHeritageQuickPicker } from "@/components/map/SoloHeritageQuickPicker";
import { SavedAddressQuickPick } from "@/components/map/SavedAddressQuickPick";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Navigation,
  Loader2,
  Bike,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Sun,
  Moon,
  Pencil,
  Map,
  Check,
  ArrowLeft,
} from "lucide-react";
import { LocationPoint } from "@/types/order.types";
import { DEFAULT_CENTER } from "@/constants/maps";
import {
  reverseGeocodeSurakarta,
  getLocalNearestAddress,
} from "@/lib/geoResolver";
import { SoloAppLogoIcon } from "@/components/icons/SoloAppLogoIcon";
import { useRecentDestinations } from "@/hooks/useRecentDestinations";
import { RecentDestinationsList } from "@/components/map/RecentDestinationsList";
import { motion } from "motion/react";

export default function RideBookingPage() {
  const { user, userData } = useAuthContext();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const [pickup, setPickup] = useState<LocationPoint | null>(null);
  const [dropoff, setDropoff] = useState<LocationPoint | null>(null);
  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);
  const [price, setPrice] = useState<number>(0);
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const [isOrdering, setIsOrdering] = useState(false);
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);

  const { addRecentDestination } = useRecentDestinations();

  // Manual Map Pin Picker State
  const [manualPickType, setManualPickType] = useState<
    "pickup" | "dropoff" | null
  >(null);
  const [manualCoords, setManualCoords] = useState<{
    lat: number;
    lng: number;
  }>(DEFAULT_CENTER);
  const [manualAddress, setManualAddress] = useState<string>(
    "Memuat alamat titik...",
  );
  const [isResolvingAddress, setIsResolvingAddress] = useState<boolean>(false);
  const geocodeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Resilient Reverse Geocoding when map center moves during manual pin mode
  const handleMapCenterChange = useCallback(
    (coords: { lat: number; lng: number }) => {
      setManualCoords(coords);
      // Instant local estimate
      setManualAddress(getLocalNearestAddress(coords.lat, coords.lng));
      setIsResolvingAddress(true);

      if (geocodeTimeoutRef.current) {
        clearTimeout(geocodeTimeoutRef.current);
      }

      geocodeTimeoutRef.current = setTimeout(async () => {
        try {
          const resolved = await reverseGeocodeSurakarta(
            coords.lat,
            coords.lng,
          );
          setManualAddress(resolved);
        } finally {
          setIsResolvingAddress(false);
        }
      }, 300);
    },
    [],
  );

  const handleConfirmManualPin = () => {
    const point: LocationPoint = {
      lat: manualCoords.lat,
      lng: manualCoords.lng,
      address:
        manualAddress ||
        `Titik Peta (${manualCoords.lat.toFixed(4)}, ${manualCoords.lng.toFixed(4)})`,
    };

    if (manualPickType === "pickup") {
      setPickup(point);
    } else if (manualPickType === "dropoff") {
      setDropoff(point);
    }

    setManualPickType(null);
    setDirections(null);
    setPrice(0);
  };

  const calculateRoute = useCallback(async () => {
    if (!pickup || !dropoff) {
      alert("Harap tentukan titik jemput dan lokasi tujuan terlebih dahulu.");
      return;
    }

    setIsCalculatingPrice(true);

    try {
      if (typeof window !== "undefined" && window.google?.maps) {
        // @gmaps-interop
        const directionsService = new window.google.maps.DirectionsService();
        const results = await directionsService.route({
          origin: { lat: pickup.lat, lng: pickup.lng },
          destination: { lat: dropoff.lat, lng: dropoff.lng },
          // @gmaps-interop
          travelMode: window.google.maps.TravelMode.DRIVING,
        });
        setDirections(results);

        const distText = results.routes[0].legs[0].distance?.text || "0 km";
        const distVal = parseFloat(distText.replace(/[^0-9.]/g, "")) || 1;
        setDistanceKm(distVal);

        // Call Cloud Function for dynamic pricing
        try {
          const pricingResult = await functionsService.calculateFinalPrice({
            serviceType: "ojek",
            distanceKm: distVal,
          });
          setPrice(pricingResult.finalPrice);
        } catch (priceErr) {
          // Fallback local calculation (Rp 2.500/km, Min Rp 10.000)
          setPrice(Math.max(10000, Math.round(distVal * 2500)));
        }
      } else {
        // Approximate distance fallback if offline
        const rad = Math.PI / 180;
        const dLat = (dropoff.lat - pickup.lat) * rad;
        const dLon = (dropoff.lng - pickup.lng) * rad;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(pickup.lat * rad) *
            Math.cos(dropoff.lat * rad) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const estDist = Math.max(1, parseFloat((6371 * c * 1.3).toFixed(1)));
        setDistanceKm(estDist);
        setPrice(Math.max(10000, Math.round(estDist * 2500)));
      }
    } catch (err) {
      console.warn("Directions routing fallback:", err);
      const estDist = 2.5;
      setDistanceKm(estDist);
      setPrice(10000);
    } finally {
      setIsCalculatingPrice(false);
    }
  }, [pickup, dropoff]);

  const prevPickup = useRef(pickup);
  const prevDropoff = useRef(dropoff);

  // Auto calculate ONLY when pickup or dropoff actually changes
  useEffect(() => {
    if (pickup !== prevPickup.current || dropoff !== prevDropoff.current) {
      if (pickup && dropoff) {
        calculateRoute();
      }
      prevPickup.current = pickup;
      prevDropoff.current = dropoff;
    }
  }, [pickup, dropoff, calculateRoute]);

  const handleOrder = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (userData?.role === "driver") {
      router.push("/driver");
      return;
    }
    if (!pickup || !dropoff || price === 0) return;

    setIsOrdering(true);
    try {
      const orderId = await orderService.createOrder({
        customerId: user.uid,
        serviceType: "ojek",
        pickupLocation: pickup,
        dropoffLocation: dropoff,
        price: price,
        paymentMethod: "cash",
      });
      addRecentDestination(dropoff);
      router.push(`/order/${orderId}`);
    } catch (err: any) {
      alert(err.message || "Gagal membuat pesanan.");
    } finally {
      setIsOrdering(false);
    }
  };

  const handleResetRoute = () => {
    setPrice(0);
    setDirections(null);
  };

  const handleSetDropoff = (point: LocationPoint) => {
    setDropoff(point);
    setDirections(null);
    setPrice(0);
  };

  return (
    <div className="relative h-[100dvh] w-full bg-slate-100 dark:bg-slate-950 overflow-hidden flex flex-col justify-between transition-colors duration-200">
      {/* 1. FULLSCREEN DUAL-THEME MAP BACKGROUND LAYER */}
      <div className="absolute inset-0 z-0">
        <RouteMap
          pickup={pickup}
          dropoff={dropoff}
          directions={directions}
          polylineColor="#10b981"
          className="w-full h-full"
          manualPinMode={manualPickType}
          onCenterChange={handleMapCenterChange}
        />
      </div>

      {/* ========================================================================= */}
      {/* 2. MODE: MANUAL MAP PIN PICKER (LAYAR LEGA 100% TANPA FORM) */}
      {/* ========================================================================= */}
      {manualPickType !== null ? (
        <>
          {/* Top Floating Helper Capsule */}
          <div className="relative z-30 max-w-lg w-full mx-auto px-4 pt-4 pointer-events-none">
            <div className="flex items-center justify-between pointer-events-auto">
              <button
                type="button"
                onClick={() => setManualPickType(null)}
                className="bg-white/95 dark:bg-[#0c1220]/95 border border-slate-200/80 dark:border-white/[0.1] px-3.5 py-2 rounded-full shadow-2xl backdrop-blur-xl text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Batal</span>
              </button>

              <div
                className={`px-3.5 py-1.5 rounded-full text-white text-xs font-bold shadow-2xl backdrop-blur-xl flex items-center gap-1.5 ${
                  manualPickType === "pickup" ? "bg-emerald-600" : "bg-rose-600"
                }`}
              >
                {manualPickType === "pickup" ? (
                  <MapPin className="h-3.5 w-3.5" />
                ) : (
                  <Navigation className="h-3.5 w-3.5" />
                )}
                <span>
                  Geser Peta ke Titik{" "}
                  {manualPickType === "pickup" ? "Jemput" : "Tujuan"}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Floating Address Preview & Confirmation Sheet */}
          <div className="relative z-30 max-w-lg w-full mx-auto px-4 pb-6 mt-auto">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white/95 dark:bg-[#0c1220]/95 border border-slate-200/80 dark:border-white/[0.1] rounded-3xl shadow-2xl p-4 backdrop-blur-2xl space-y-3"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    Titik{" "}
                    {manualPickType === "pickup"
                      ? "Penjemputan"
                      : "Lokasi Tujuan"}{" "}
                    Terpilih:
                  </span>
                  {isResolvingAddress && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" /> Membaca
                      jalan...
                    </span>
                  )}
                </div>

                <div className="flex items-start gap-2.5">
                  <div
                    className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                      manualPickType === "pickup"
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {manualPickType === "pickup" ? (
                      <MapPin className="h-4 w-4" />
                    ) : (
                      <Navigation className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight">
                      {manualAddress}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {manualCoords.lat.toFixed(5)},{" "}
                      {manualCoords.lng.toFixed(5)}
                    </p>
                  </div>
                </div>
              </div>

              <Button
                type="button"
                onClick={handleConfirmManualPin}
                className={`w-full h-12 text-white font-black rounded-2xl shadow-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  manualPickType === "pickup"
                    ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30"
                    : "bg-rose-600 hover:bg-rose-500 shadow-rose-600/30"
                }`}
              >
                <Check className="h-4 w-4" />
                <span>
                  Pasang Sebagai Titik{" "}
                  {manualPickType === "pickup" ? "Jemput" : "Tujuan"}
                </span>
              </Button>
            </motion.div>
          </div>
        </>
      ) : (
        /* ========================================================================= */
        /* 3. NORMAL MODE: ROUTE SELECTION & ORDERING */
        /* ========================================================================= */
        <>
          {/* Top Floating Navigation & Inputs / Route Summary */}
          <div className="relative z-20 max-w-lg w-full mx-auto px-3.5 pt-3 space-y-2 pointer-events-none">
            {/* Header Bar */}
            <div className="flex items-center justify-between pointer-events-auto">
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full shadow-lg bg-white/95 dark:bg-[#0c1220]/95 border border-slate-200/80 dark:border-white/[0.08] backdrop-blur-md cursor-pointer text-slate-800 dark:text-zinc-200 h-9 w-9 hover:scale-105 transition-transform"
                onClick={() => {
                  if (price > 0) {
                    handleResetRoute();
                  } else {
                    router.back();
                  }
                }}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="bg-white/95 dark:bg-[#0c1220]/95 border border-slate-200/80 dark:border-white/[0.08] p-2 rounded-full backdrop-blur-md text-slate-700 dark:text-zinc-300 shadow-md cursor-pointer hover:scale-105 transition-transform"
                  title="Ganti Tema Peta"
                >
                  {theme === "dark" ? (
                    <Sun className="h-3.5 w-3.5 text-amber-400" />
                  ) : (
                    <Moon className="h-3.5 w-3.5 text-slate-700" />
                  )}
                </button>

                <div className="bg-white/95 dark:bg-[#0c1220]/95 border border-slate-200/80 dark:border-white/[0.08] px-3 py-1 rounded-full backdrop-blur-md text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 shadow-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <Bike className="h-3.5 w-3.5 text-emerald-500" /> Ojek Solo
                </div>
              </div>
            </div>

            {/* CONDITION A: When route is already calculated -> Show ultra-minimalist Route Capsule */}
            {price > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/95 dark:bg-[#0c1220]/95 border border-slate-200/80 dark:border-white/[0.08] rounded-2xl shadow-xl p-2.5 backdrop-blur-xl pointer-events-auto flex items-center justify-between gap-2"
              >
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-slate-900 dark:text-white truncate">
                    <span className="text-emerald-500">📍</span>
                    <span className="truncate">
                      {pickup?.address.split(",")[0]}
                    </span>
                    <span className="text-slate-400">➔</span>
                    <span className="text-rose-500">🎯</span>
                    <span className="truncate">
                      {dropoff?.address.split(",")[0]}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                    Jarak Tempuh:{" "}
                    <strong className="text-emerald-600 dark:text-emerald-400">
                      {distanceKm.toFixed(1)} KM
                    </strong>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleResetRoute}
                  className="py-1 px-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-[10px] font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1 shrink-0 cursor-pointer border border-slate-200/60 dark:border-white/[0.06] transition-colors"
                >
                  <Pencil className="h-3 w-3" />
                  <span>Ubah</span>
                </button>
              </motion.div>
            ) : (
              /* CONDITION B: Input Mode -> Compact Floating Pickup & Dropoff Inputs */
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-2 pointer-events-auto"
              >
                <div className="bg-white/95 dark:bg-[#0c1220]/95 border border-slate-200/80 dark:border-white/[0.08] rounded-2xl shadow-xl p-2.5 backdrop-blur-xl space-y-2">
                  {/* Pickup Input - ONLY visible if dropoff is set */}
                  {dropoff && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="flex items-center gap-2 p-1.5 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-slate-200/60 dark:border-white/[0.06] overflow-hidden"
                    >
                      <div className="p-1.5 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-lg shrink-0">
                        <MapPin className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between pr-1">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                            Titik Jemput
                          </span>
                          <button
                            type="button"
                            onClick={() => setManualPickType("pickup")}
                            className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                          >
                            <Map className="h-2.5 w-2.5" />
                            <span>Pilih di Peta</span>
                          </button>
                        </div>
                        <PlaceAutocomplete
                          value={pickup?.address}
                          placeholder="Lokasi penjemputan dari peta atau GPS..."
                          onPickOnMapClick={() => setManualPickType("pickup")}
                          onLocationSelect={(point) => {
                            setPickup(point);
                            setDirections(null);
                            setPrice(0);
                          }}
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Dropoff Input */}
                  <div className="flex items-center gap-2 p-1.5 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-slate-200/60 dark:border-white/[0.06]">
                    <div className="p-1.5 bg-rose-500/15 text-rose-600 dark:text-rose-400 rounded-lg shrink-0">
                      <Navigation className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between pr-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                          Lokasi Tujuan
                        </span>
                        <button
                          type="button"
                          onClick={() => setManualPickType("dropoff")}
                          className="text-[9px] font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <Map className="h-2.5 w-2.5" />
                          <span>Pilih di Peta</span>
                        </button>
                      </div>
                      <PlaceAutocomplete
                        value={dropoff?.address}
                        placeholder="Mau ke mana?"
                        onPickOnMapClick={() => setManualPickType("dropoff")}
                        onLocationSelect={handleSetDropoff}
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Pickers - ONLY show if dropoff is not set */}
                {!dropoff && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3 mt-2"
                  >
                    <SavedAddressQuickPick
                      onSelect={handleSetDropoff}
                      className="px-1"
                    />
                    <RecentDestinationsList 
                      onSelect={handleSetDropoff} 
                    />
                    <SoloHeritageQuickPicker
                      onSelectDropoff={handleSetDropoff}
                      onSelectPickup={(point) => {
                        setPickup(point);
                      }}
                    />
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>

          {/* Bottom Floating Action & Pricing Drawer */}
          <div className="relative z-20 max-w-lg w-full mx-auto px-3.5 pb-5 mt-auto">
            <div className="bg-white/95 dark:bg-[#0c1220]/95 border border-slate-200/80 dark:border-white/[0.08] rounded-2xl shadow-2xl p-3.5 backdrop-blur-2xl space-y-2.5">
              {price === 0 ? (
                <Button
                  onClick={calculateRoute}
                  disabled={!pickup || !dropoff || isCalculatingPrice}
                  className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all"
                >
                  {isCalculatingPrice ? (
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                  ) : (
                    <Sparkles className="h-4 w-4 text-emerald-200" />
                  )}
                  {isCalculatingPrice
                    ? "Menghitung Rute..."
                    : "Hitung Jarak & Tarif Rute"}
                </Button>
              ) : (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between p-2.5 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-xl border border-emerald-500/20">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          Tarif Bersih
                        </span>
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.2 rounded font-bold">
                          {distanceKm.toFixed(1)} KM
                        </span>
                      </div>
                      <p className="text-[9px] text-slate-500 dark:text-zinc-400">
                        100% Tunai Bebas Komisi
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                        Rp {price.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  <Button
                    className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-xl shadow-lg shadow-emerald-600/30 text-xs cursor-pointer flex items-center justify-center gap-2"
                    onClick={handleOrder}
                    disabled={isOrdering}
                  >
                    {isOrdering ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        Pesan Ojek Sekarang
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
