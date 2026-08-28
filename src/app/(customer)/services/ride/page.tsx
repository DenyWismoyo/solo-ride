"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { orderService } from "@/services/order.service";
import { functionsService } from "@/services/functions.service";
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from "@react-google-maps/api";
import { PlaceAutocomplete } from "@/components/map/PlaceAutocomplete";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/layout/AppHeader";
import { 
  MapPin, 
  Navigation, 
  Loader2, 
  ArrowLeft
} from "lucide-react";
import { DEFAULT_CENTER, DEFAULT_ZOOM, MAP_LIBRARIES, MAP_DARK_STYLE } from "@/constants/maps";
import { LocationPoint } from "@/types/order.types";

const containerStyle = {
  width: "100%",
  height: "100%"
};

export default function RideBookingPage() {
  const { user, userData } = useAuthContext();
  const router = useRouter();

  const [pickup, setPickup] = useState<LocationPoint | null>(null);
  const [dropoff, setDropoff] = useState<LocationPoint | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [price, setPrice] = useState<number>(0);
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const [isOrdering, setIsOrdering] = useState(false);
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: MAP_LIBRARIES
  });

  const calculateRoute = async () => {
    if (!pickup || !dropoff) return;
    // @gmaps-interop
    const directionsService = new google.maps.DirectionsService();
    try {
      const results = await directionsService.route({
        origin: { lat: pickup.lat, lng: pickup.lng },
        destination: { lat: dropoff.lat, lng: dropoff.lng },
        // @gmaps-interop
        travelMode: google.maps.TravelMode.DRIVING,
      });
      setDirections(results);
      
      const distText = results.routes[0].legs[0].distance?.text || "0 km";
      const distVal = parseFloat(distText.replace(/[^0-9.]/g, "")) || 1;
      setDistanceKm(distVal);

      // Call Cloud Function for dynamic pricing
      setIsCalculatingPrice(true);
      try {
        const pricingResult = await functionsService.calculateFinalPrice({
          serviceType: "ojek",
          distanceKm: distVal
        });
        setPrice(pricingResult.finalPrice);
      } catch (priceErr) {
        console.error("Gagal menghitung harga server", priceErr);
        // Fallback local calculation
        setPrice(Math.max(10000, Math.round(distVal * 2500)));
      } finally {
        setIsCalculatingPrice(false);
      }
    } catch (err) {
      console.error("Gagal menghitung rute", err);
      alert("Gagal menghitung rute antara lokasi penjemputan dan tujuan.");
    }
  };

  const parseLocation = (place: any, addressBackup: string): LocationPoint | null => {
    if (!place?.location) return null;
    const lat = typeof place.location.lat === "function" ? place.location.lat() : place.location.lat;
    const lng = typeof place.location.lng === "function" ? place.location.lng() : place.location.lng;
    return {
      lat,
      lng,
      address: place.formattedAddress || place.displayName || addressBackup
    };
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
      const orderId = await orderService.createOrder({
        customerId: user.uid,
        serviceType: "ojek",
        pickupLocation: pickup,
        dropoffLocation: dropoff,
        price: price,
        paymentMethod: "cash"
      });
      router.push(`/order/${orderId}`);
    } catch (err) {
      alert("Gagal membuat pesanan.");
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-slate-50 dark:bg-zinc-950">
      <AppHeader onOpenProfile={() => {}} />
      
      <div className="flex-1 flex flex-col pt-16 relative">
        {/* Top Floating Header */}
        <div className="absolute top-20 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full shadow-xl pointer-events-auto bg-white/90 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 backdrop-blur-md cursor-pointer text-slate-800 dark:text-zinc-200"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="bg-white/90 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 px-3.5 py-1.5 rounded-full backdrop-blur-md text-xs font-bold text-emerald-600 dark:text-emerald-400 pointer-events-auto flex items-center gap-1.5 shadow-md">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Ojek Motor (Surakarta)
          </div>
        </div>

        {/* Map View */}
        <div className="flex-1 relative z-0 min-h-[40vh]">
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={pickup ? { lat: pickup.lat, lng: pickup.lng } : DEFAULT_CENTER}
              zoom={DEFAULT_ZOOM}
              options={{ disableDefaultUI: true, styles: MAP_DARK_STYLE }}
            >
              {pickup && !directions && <Marker position={{ lat: pickup.lat, lng: pickup.lng }} />}
              {directions && (
                <DirectionsRenderer 
                  directions={directions} 
                  options={{ 
                    polylineOptions: { strokeColor: "#10b981", strokeWeight: 5 } 
                  }} 
                />
              )}
            </GoogleMap>
          ) : (
            <div className="flex h-full items-center justify-center text-slate-500 dark:text-zinc-500 text-sm">
              Memuat Peta Surakarta...
            </div>
          )}
        </div>

        {/* Bottom Booking Form */}
        <div className="z-10 bg-white dark:bg-[#030712] border-t border-slate-200 dark:border-zinc-800 shadow-2xl p-5 w-full space-y-4">
          <div className="max-w-lg mx-auto space-y-4">
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
                    onPlaceSelect={(p) => setPickup(parseLocation(p, "Lokasi Jemput") || pickup)}
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
                    onPlaceSelect={(p) => setDropoff(parseLocation(p, "Lokasi Tujuan") || dropoff)}
                  />
                </div>
              </div>
            </div>

            {/* Pricing / Action */}
            <div className="space-y-2.5 pb-4">
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
                    Pesan Ojek Sekarang
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
