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
  ShoppingBag, 
  MapPin, 
  Home, 
  ArrowLeft, 
  Store, 
  Banknote, 
  MessageSquare, 
  Loader2, 
  ArrowRight
} from "lucide-react";

export default function TitipTetanggaPage() {
  const router = useRouter();
  const { user, userData } = useAuthContext();

  const [pickup, setPickup] = useState<LocationPoint | null>(null);
  const [dropoff, setDropoff] = useState<LocationPoint | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  
  const [errandNotes, setErrandNotes] = useState("");
  const [estimatedPrice, setEstimatedPrice] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);
  const [serviceFee, setServiceFee] = useState<number>(0);
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
        const pricingResult = await functionsService.calculateFinalPrice({
          serviceType: "titip",
          distanceKm: distVal
        });
        setServiceFee(pricingResult.finalPrice);
      } catch (priceErr) {
        console.warn("Gagal kalkulasi harga titip server, fallback ke formula lokal:", priceErr);
        // Fallback local calculation
        setServiceFee(Math.max(12000, Math.round(distVal * 3000)));
      }
    } catch (err) {
      console.error("Gagal menghitung rute titip beli:", err);
      alert("Gagal menghitung rute antara toko dan alamat Anda.");
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
    if (!pickup || !dropoff || !errandNotes || !estimatedPrice || serviceFee === 0) {
      alert("Harap lengkapi catatan belanjaan dan hitung biaya jasa titip!");
      return;
    }

    setIsSubmitting(true);
    try {
      const talanganVal = parseInt(estimatedPrice.replace(/\D/g, "")) || 0;
      const orderId = await orderService.createOrder({
        customerId: user.uid,
        serviceType: "titip",
        pickupLocation: pickup,
        dropoffLocation: dropoff,
        price: serviceFee,
        paymentMethod: "cash",
        customerNote: `Titip: ${errandNotes} (Estimasi Talangan: Rp ${talanganVal.toLocaleString("id-ID")})`,
        items: [
          {
            id: "errand-1",
            name: errandNotes,
            price: talanganVal,
            qty: 1
          }
        ]
      });

      router.push(`/order/${orderId}`);
    } catch (err: any) {
      alert(err.message || "Gagal membuat pesanan titip beli.");
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
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <ShoppingBag className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">Titip Tetangga</h1>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400">Titip belikan barang/makanan bebas</p>
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
              polylineColor="#f59e0b"
              className="w-full h-full"
            />
          </div>
        )}

        <form onSubmit={handleCheckout} className="space-y-4">
          {/* Section 1: Route */}
          <div className="sg-card p-4 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 shadow-sm space-y-4">
            <h2 className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider pl-1">
              Rute Titipan
            </h2>
            <div className="space-y-3 relative">
              <div className="relative z-10 flex gap-3 items-center">
                <div className="w-7 h-7 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 mt-6">
                  <Store className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 block mb-1">Titip Beli Di (Toko / Warung)</label>
                  <PlaceAutocomplete
                    placeholder="Contoh: Toko Sembako, Indomaret..."
                    onLocationSelect={(point) => {
                      setPickup(point);
                      setDirections(null);
                      setServiceFee(0);
                    }}
                  />
                </div>
              </div>

              <div className="relative z-10 flex gap-3 items-center">
                <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 mt-6">
                  <Home className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 block mb-1">Antar Ke (Rumah / Kantor)</label>
                  <PlaceAutocomplete
                    placeholder="Masukkan lokasi pengantaran..."
                    onLocationSelect={(point) => {
                      setDropoff(point);
                      setDirections(null);
                      setServiceFee(0);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Errand Detail */}
          <div className="sg-card p-4 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 shadow-sm space-y-4">
            <h2 className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider pl-1 flex justify-between items-center">
              Daftar Belanjaan
              <Badge variant="amber" size="sm">Talangan Driver</Badge>
            </h2>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-amber-500" /> Catatan Titipan (Detail)
                </label>
                <textarea
                  placeholder="Contoh: Tolong belikan beras 5kg cap lele, sama telor 1 kg. Jika kosong silakan konfirmasi via telepon."
                  value={errandNotes}
                  onChange={(e) => setErrandNotes(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none transition-colors min-h-[80px]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Banknote className="h-3.5 w-3.5 text-amber-500" /> Perkiraan Total Harga Barang Talangan (Rp)
                </label>
                <input
                  type="number"
                  placeholder="Estimasi dana talangan (contoh: 50000)"
                  value={estimatedPrice}
                  onChange={(e) => {
                    setEstimatedPrice(e.target.value);
                  }}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>
          </div>

          {/* Checkout Button */}
          <div className="pt-2">
            {serviceFee === 0 ? (
              <Button 
                type="button"
                onClick={calculateRoute}
                disabled={!pickup || !dropoff || !errandNotes || !estimatedPrice || isCalculatingPrice}
                className="w-full h-12 bg-slate-900 dark:bg-zinc-800 hover:bg-slate-800 dark:hover:bg-zinc-700 text-white dark:text-zinc-200 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                {isCalculatingPrice ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {isCalculatingPrice ? "Menghitung Biaya Jasa..." : "Hitung Biaya Jasa Titip"}
              </Button>
            ) : (
              <>
                <div className="flex items-center justify-between px-2 mb-3 bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20">
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Jasa Titip Driver ({distanceKm.toFixed(1)} KM)
                    </span>
                    <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                      + Talangan Barang: Rp {parseInt(estimatedPrice || "0").toLocaleString("id-ID")}
                    </p>
                  </div>
                  <span className="text-lg font-black text-amber-600 dark:text-amber-400">
                    Rp {serviceFee.toLocaleString("id-ID")}
                  </span>
                </div>
                <Button
                  type="submit"
                  disabled={!pickup || !dropoff || !errandNotes || !estimatedPrice || isSubmitting}
                  className="w-full h-12 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold rounded-2xl shadow-lg cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Pesan Jasa Titip Sekarang
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </>
            )}
            <p className="text-[10px] text-center text-slate-500 dark:text-zinc-400 mt-3 px-4">
              Driver akan menalangi belanjaan Anda terlebih dahulu sesuai estimasi harga. Pembayaran total (barang + jasa titip) diserahkan tunai ke driver saat pesanan tiba.
            </p>
          </div>
        </form>
      </main>
    </div>
  );
}
