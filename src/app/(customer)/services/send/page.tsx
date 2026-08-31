"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { orderService } from "@/services/order.service";
import { functionsService } from "@/services/functions.service";
import { AppHeader } from "@/components/layout/AppHeader";
import { RouteMap } from "@/components/map/RouteMap";
import { PlaceAutocomplete } from "@/components/map/PlaceAutocomplete";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LocationPoint } from "@/types/order.types";
import { 
  Package, 
  MapPin, 
  Navigation, 
  ArrowLeft, 
  User, 
  Phone, 
  Box, 
  Weight, 
  Loader2, 
  ArrowRight
} from "lucide-react";

export default function SendPackagePage() {
  const router = useRouter();
  const { user, userData } = useAuthContext();

  const [pickup, setPickup] = useState<LocationPoint | null>(null);
  const [dropoff, setDropoff] = useState<LocationPoint | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  
  const [itemName, setItemName] = useState("");
  const [itemWeight, setItemWeight] = useState("Ringan (< 5kg)");
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);
  const [price, setPrice] = useState<number>(0);
  const [distanceKm, setDistanceKm] = useState<number>(0);

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

      // Call Cloud Function for dynamic pricing
      try {
        let weightVal = 1;
        if (itemWeight.includes("5-10kg")) weightVal = 8;
        if (itemWeight.includes("> 10kg")) weightVal = 15;

        const pricingResult = await functionsService.calculateFinalPrice({
          serviceType: "kirim",
          distanceKm: distVal,
          weightKg: weightVal
        });
        setPrice(pricingResult.finalPrice);
      } catch (priceErr) {
        console.warn("Gagal kalkulasi harga kirim server, fallback ke formula lokal:", priceErr);
        // Fallback local calculation
        setPrice(Math.max(12000, Math.round(distVal * 3000)));
      }
    } catch (err) {
      console.error("Gagal menghitung rute pengiriman:", err);
      alert("Gagal menghitung rute antara lokasi penjemputan dan tujuan.");
    } finally {
      setIsCalculatingPrice(false);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push("/login");
      return;
    }
    if (userData?.role === "driver") {
      router.push("/driver");
      return;
    }
    if (!pickup || !dropoff || !itemName || !recipientName || !recipientPhone || price === 0) {
      alert("Harap lengkapi semua data dan hitung tarif pengiriman!");
      return;
    }

    setIsSubmitting(true);
    try {
      const orderId = await orderService.createOrder({
        customerId: user.uid,
        serviceType: "kirim",
        pickupLocation: pickup,
        dropoffLocation: dropoff,
        price,
        paymentMethod: "cash",
        customerNote: `Barang: ${itemName} (${itemWeight}) | Penerima: ${recipientName} (${recipientPhone})`,
        items: [
          {
            id: "pkg-1",
            name: `${itemName} (${itemWeight})`,
            price: 0,
            qty: 1
          }
        ]
      });

      router.push(`/order/${orderId}`);
    } catch (err: any) {
      alert(err.message || "Gagal membuat pesanan pengiriman.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 flex flex-col pb-6">
      <AppHeader onOpenProfile={() => {}} />

      <main className="pt-20 px-4 max-w-lg w-full mx-auto space-y-4">
        {/* Header Back & Title */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.back()}
            className="p-2 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white cursor-pointer transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Package className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">Kirim Kilat</h1>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400">Pengiriman dokumen & barang instan</p>
            </div>
          </div>
        </div>

        {/* Mini Interactive Map Preview */}
        {(pickup || dropoff) && (
          <div className="h-44 rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 shadow-sm">
            <RouteMap
              pickup={pickup}
              dropoff={dropoff}
              directions={directions}
              polylineColor="#3b82f6"
              className="w-full h-full"
            />
          </div>
        )}

        <form onSubmit={handleCheckout} className="space-y-4">
          {/* Section 1: Route */}
          <div className="sg-card p-4 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 shadow-sm space-y-4">
            <h2 className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider pl-1">
              Rute Pengiriman
            </h2>
            <div className="space-y-3 relative">
              <div className="relative z-10 flex gap-3 items-center">
                <div className="w-7 h-7 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 mt-6">
                  <MapPin className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 block mb-1">Ambil Barang Dari</label>
                  <PlaceAutocomplete
                    placeholder="Masukkan lokasi penjemputan barang..."
                    onLocationSelect={(point) => {
                      setPickup(point);
                      setDirections(null);
                      setPrice(0);
                    }}
                  />
                </div>
              </div>

              <div className="relative z-10 flex gap-3 items-center">
                <div className="w-7 h-7 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 mt-6">
                  <Navigation className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 block mb-1">Antar Barang Ke</label>
                  <PlaceAutocomplete
                    placeholder="Masukkan tujuan pengiriman..."
                    onLocationSelect={(point) => {
                      setDropoff(point);
                      setDirections(null);
                      setPrice(0);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Package Detail */}
          <div className="sg-card p-4 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 shadow-sm space-y-4">
            <h2 className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider pl-1 flex justify-between items-center">
              Detail Barang
              <Badge variant="blue" size="sm">Aman</Badge>
            </h2>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Box className="h-3.5 w-3.5 text-blue-500" /> Nama Barang
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Dokumen Kontrak, Kue Ulang Tahun..."
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:border-blue-500 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none transition-colors"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Weight className="h-3.5 w-3.5 text-blue-500" /> Kategori Berat
                </label>
                <select
                  value={itemWeight}
                  onChange={(e) => {
                    setItemWeight(e.target.value);
                    setPrice(0);
                  }}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:border-blue-500 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none transition-colors appearance-none cursor-pointer"
                >
                  <option value="Ringan (< 5kg)">Ringan (&lt; 5kg) - Dokumen, Baju</option>
                  <option value="Sedang (5-10kg)">Sedang (5-10kg) - Makanan, Dus Kecil</option>
                  <option value="Berat (> 10kg)">Berat (&gt; 10kg) - Elektronik</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Recipient Detail */}
          <div className="sg-card p-4 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 shadow-sm space-y-4">
            <h2 className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider pl-1">
              Data Penerima
            </h2>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-blue-500" /> Nama Penerima
                </label>
                <input
                  type="text"
                  placeholder="Nama Lengkap"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:border-blue-500 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none transition-colors"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-blue-500" /> Nomor HP
                </label>
                <input
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:border-blue-500 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>
          </div>

          {/* Checkout Button */}
          <div className="pt-2">
            {price === 0 ? (
              <Button 
                type="button"
                onClick={calculateRoute}
                disabled={!pickup || !dropoff || isCalculatingPrice}
                className="w-full h-12 bg-slate-900 dark:bg-zinc-800 hover:bg-slate-800 dark:hover:bg-zinc-700 text-white dark:text-zinc-200 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                {isCalculatingPrice ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {isCalculatingPrice ? "Menghitung Tarif..." : "Hitung Tarif Pengiriman"}
              </Button>
            ) : (
              <>
                <div className="flex items-center justify-between px-2 mb-3 bg-blue-500/10 p-3 rounded-2xl border border-blue-500/20">
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Tarif Kirim Kilat ({distanceKm.toFixed(1)} KM)
                    </span>
                    <p className="text-[10px] text-slate-500 dark:text-zinc-400">100% Uang Tunai Diterima Kurir</p>
                  </div>
                  <span className="text-lg font-black text-blue-600 dark:text-blue-400">
                    Rp {price.toLocaleString("id-ID")}
                  </span>
                </div>
                <Button
                  type="submit"
                  disabled={!pickup || !dropoff || !itemName || !recipientName || !recipientPhone || isSubmitting}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-lg cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Pesan Kurir Sekarang
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}
