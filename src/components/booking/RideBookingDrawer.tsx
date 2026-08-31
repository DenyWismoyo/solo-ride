"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { orderService } from "@/services/order.service";
import { functionsService } from "@/services/functions.service";
import { RouteMap } from "@/components/map/RouteMap";
import { PlaceAutocomplete } from "@/components/map/PlaceAutocomplete";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Navigation, 
  Loader2, 
  ArrowLeft, 
  Bike,
  Car
} from "lucide-react";
import { LocationPoint, ServiceType } from "@/types/order.types";
import { AppService } from "@/constants/services";

interface RideBookingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialService?: AppService | null;
}

export function RideBookingDrawer({ isOpen, onClose, initialService }: RideBookingDrawerProps) {
  const { user, userData } = useAuthContext();
  const router = useRouter();

  const [pickup, setPickup] = useState<LocationPoint | null>(null);
  const [dropoff, setDropoff] = useState<LocationPoint | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [price, setPrice] = useState<number>(0);
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const [isOrdering, setIsOrdering] = useState(false);
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);

  const getServiceType = (): "ojek" | "mobil" | "kirim" | "kuliner" | "titip" | "pasar" | "mart" => {
    if (!initialService) return "ojek";
    const id = initialService.id;
    if (id === "car") return "mobil";
    if (id === "send") return "kirim";
    if (id === "food") return "kuliner";
    if (id === "titip") return "titip";
    if (id === "pasar") return "pasar";
    if (id === "mart") return "mart";
    return "ojek";
  };

  const calculateRoute = async () => {
    if (!pickup || !dropoff || typeof window === "undefined" || !window.google?.maps) return;
    setIsCalculatingPrice(true);

    // @gmaps-interop
    const directionsService = new window.google.maps.DirectionsService();
    try {
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

      const serviceType = getServiceType();
      // Dynamic pricing call
      try {
        const pricingResult = await functionsService.calculateFinalPrice({
          serviceType,
          distanceKm: distVal
        });
        setPrice(pricingResult.finalPrice);
      } catch (priceErr) {
        console.warn("Fallback tarif lokal:", priceErr);
        if (serviceType === "mobil") {
          setPrice(Math.max(15000, Math.round(distVal * 4500)));
        } else {
          setPrice(Math.max(10000, Math.round(distVal * 2500)));
        }
      }
    } catch (err) {
      console.error("Gagal menghitung rute:", err);
      alert("Gagal menghitung rute antara lokasi penjemputan dan tujuan.");
    } finally {
      setIsCalculatingPrice(false);
    }
  };

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
      const serviceType = getServiceType();
      const orderId = await orderService.createOrder({
        customerId: user.uid,
        serviceType,
        pickupLocation: pickup,
        dropoffLocation: dropoff,
        price: price,
        paymentMethod: "cash"
      });
      onClose();
      router.push(`/order/${orderId}`);
    } catch (err: any) {
      alert(err.message || "Gagal membuat pesanan.");
    } finally {
      setIsOrdering(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
      {/* Top Header */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        <Button
          variant="secondary"
          size="icon"
          className="rounded-full shadow-xl pointer-events-auto bg-white/90 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 backdrop-blur-md cursor-pointer text-slate-800 dark:text-zinc-200"
          onClick={onClose}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="bg-white/90 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 px-3.5 py-1.5 rounded-full backdrop-blur-md text-xs font-bold text-emerald-600 dark:text-emerald-400 pointer-events-auto flex items-center gap-1.5 shadow-md">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          {initialService?.name || "Pesan Perjalanan"} (Surakarta)
        </div>
      </div>

      {/* Map View */}
      <div className="flex-1 relative z-0">
        <RouteMap
          pickup={pickup}
          dropoff={dropoff}
          directions={directions}
          polylineColor={initialService?.id === "car" ? "#14b8a6" : "#10b981"}
          className="w-full h-full"
        />
      </div>

      {/* Floating Bottom Booking Form */}
      <div className="z-10 mt-auto bg-white/95 dark:bg-zinc-900/95 border-t border-slate-200 dark:border-zinc-800/90 rounded-t-3xl shadow-2xl p-5 backdrop-blur-2xl max-w-lg w-full mx-auto space-y-4">
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-zinc-700 rounded-full mx-auto mb-2" />

        {/* Place Inputs */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2.5 p-2 bg-slate-100 dark:bg-zinc-800/70 rounded-2xl border border-slate-200 dark:border-zinc-700/70">
            <div className="p-2 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0">
              <MapPin className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">Titik Jemput</span>
              <PlaceAutocomplete
                placeholder="Cari lokasi penjemputan di Solo..."
                onLocationSelect={(point) => {
                  setPickup(point);
                  setDirections(null);
                  setPrice(0);
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 bg-slate-100 dark:bg-zinc-800/70 rounded-2xl border border-slate-200 dark:border-zinc-700/70">
            <div className="p-2 bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl shrink-0">
              <Navigation className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">Lokasi Tujuan</span>
              <PlaceAutocomplete
                placeholder="Cari lokasi tujuan di Solo..."
                onLocationSelect={(point) => {
                  setDropoff(point);
                  setDirections(null);
                  setPrice(0);
                }}
              />
            </div>
          </div>
        </div>

        {/* Pricing / Action */}
        <div className="space-y-2.5">
          {price === 0 ? (
            <Button 
              onClick={calculateRoute}
              disabled={!pickup || !dropoff || isCalculatingPrice}
              className="w-full h-12 bg-slate-900 dark:bg-zinc-800 hover:bg-slate-800 dark:hover:bg-zinc-700 text-white dark:text-zinc-200 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              {isCalculatingPrice ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isCalculatingPrice ? "Menghitung Harga..." : "Hitung Jarak & Tarif Rute"}
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">Tarif Bebas Komisi</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md font-bold">
                      {distanceKm.toFixed(1)} KM
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">100% Uang Tunai Diterima Driver</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                    Rp {price.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <Button 
                className="w-full h-13 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl shadow-xl shadow-emerald-600/25 text-sm cursor-pointer"
                onClick={handleOrder}
                disabled={isOrdering}
              >
                {isOrdering ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Pesan {initialService?.name || "Ojek"} Sekarang
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
