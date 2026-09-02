"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { orderService } from "@/services/order.service";
import { functionsService } from "@/services/functions.service";
import { RouteMap } from "@/components/map/RouteMap";
import { MapLocationPickerModal } from "@/components/map/MapLocationPickerModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LocationPoint } from "@/types/order.types";
import { 
  ShoppingBag, 
  MapPin, 
  Home, 
  Building2, 
  ArrowLeft, 
  Store, 
  Banknote, 
  MessageSquare, 
  Loader2, 
  ArrowRight,
  Users,
  Sparkles,
  Percent,
  CheckCircle2,
  Navigation
} from "lucide-react";
import { toast } from "@/components/ui/toast";

// Sample active neighbor errand pools in Surakarta for shared batching
const NEIGHBOR_ERRAND_POOLS = [
  {
    id: "pool-1",
    storeName: "Pasar Gede (Los Bumbu & Jajanan)",
    neighborDistrict: "Jebres (Radius 1.2 km dari Anda)",
    scheduledDeparture: "15 Menit Lagi",
    joinedNeighbors: 2,
    discountPercent: 40,
    storeLocation: { lat: -7.5694, lng: 110.8322, address: "Pasar Gede Hardjonagoro, Jebres, Solo" }
  },
  {
    id: "pool-2",
    storeName: "Apotek Kimia Farma Slamet Riyadi",
    neighborDistrict: "Laweyan (Radius 800 m dari Anda)",
    scheduledDeparture: "25 Menit Lagi",
    joinedNeighbors: 3,
    discountPercent: 40,
    storeLocation: { lat: -7.5642, lng: 110.8091, address: "Jl. Slamet Riyadi No. 340, Laweyan, Solo" }
  }
];

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
  const [isPoolingJoined, setIsPoolingJoined] = useState(false);
  const [activePoolName, setActivePoolName] = useState<string | null>(null);

  // Map Picker Modal States
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<"pickup" | "dropoff">("pickup");

  // Auto-fill Dropoff from Saved Address if available
  useEffect(() => {
    if (userData?.savedAddresses && userData.savedAddresses.length > 0 && !dropoff) {
      const defaultAddr = userData.savedAddresses.find(a => a.isDefault) || userData.savedAddresses[0];
      setDropoff({
        lat: defaultAddr.lat ?? -7.5666,
        lng: defaultAddr.lng ?? 110.8283,
        address: defaultAddr.address
      });
    }
  }, [userData, dropoff]);

  const openMapPicker = (target: "pickup" | "dropoff") => {
    setPickerTarget(target);
    setIsMapPickerOpen(true);
  };

  const handleLocationPicked = (loc: LocationPoint) => {
    if (pickerTarget === "pickup") {
      setPickup(loc);
      setIsPoolingJoined(false);
      setActivePoolName(null);
    } else {
      setDropoff(loc);
    }
    setIsMapPickerOpen(false);
  };

  const handleJoinPool = (pool: typeof NEIGHBOR_ERRAND_POOLS[0]) => {
    setPickup(pool.storeLocation);
    setIsPoolingJoined(true);
    setActivePoolName(pool.storeName);
    toast.success("Bergabung ke Titip Pooling Tetangga!", {
      description: `Hemat ongkir 40% untuk belanjaan searah dari ${pool.storeName}.`
    });
  };

  // Recalculate route whenever pickup or dropoff changes
  useEffect(() => {
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
          const basePrice = pricingResult.finalPrice;
          setServiceFee(isPoolingJoined ? Math.round(basePrice * 0.6) : basePrice);
        } catch (priceErr) {
          // Fallback local calculation
          const localBase = Math.max(12000, Math.round(distVal * 3000));
          setServiceFee(isPoolingJoined ? Math.round(localBase * 0.6) : localBase);
        }
      } catch (err) {
        console.error("Gagal menghitung rute titip beli:", err);
        toast.error("Gagal Menghitung Rute", {
          description: "Pastikan titik toko dan alamat pengantaran valid."
        });
      } finally {
        setIsCalculatingPrice(false);
      }
    };

    calculateRoute();
  }, [pickup, dropoff, isPoolingJoined]);

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
    if (!pickup || !dropoff) {
      toast.warning("Lengkapi Lokasi", {
        description: "Tentukan lokasi toko dan alamat pengantaran."
      });
      return;
    }
    if (!errandNotes.trim() || !estimatedPrice.trim() || serviceFee === 0) {
      toast.warning("Lengkapi Rincian Titipan", {
        description: "Harap isi daftar belanjaan dan estimasi uang talangan."
      });
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
        customerNote: `Titip: ${errandNotes} (Estimasi Talangan: Rp ${talanganVal.toLocaleString("id-ID")})${isPoolingJoined ? " [SHARED BATCH POOL]" : ""}`,
        items: [
          {
            id: "errand-1",
            name: errandNotes,
            price: talanganVal,
            qty: 1
          }
        ]
      });

      toast.success("Pesanan Titip Dibuat!", {
        description: "Driver terdekat sedang dialokasikan untuk membelikan titipan Anda."
      });

      router.push(`/order/${orderId}`);
    } catch (err: any) {
      toast.error("Gagal Membuat Pesanan Titip", {
        description: err.message || "Silakan coba lagi."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#070b14]/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-sm font-black text-slate-900 dark:text-white">Titip Tetangga</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-4 space-y-4">
        {/* Banner Titip Tetangga */}
        <div className="p-4 rounded-3xl bg-gradient-to-br from-teal-600 via-teal-700 to-cyan-800 text-white shadow-lg space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-teal-100" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-200">
                HYPERLOCAL COMMUNITY ERRAND
              </span>
              <h2 className="text-base font-black tracking-tight leading-none">
                Titip Beli & Antar Tetangga
              </h2>
            </div>
          </div>
          <p className="text-xs text-teal-100/90 leading-relaxed">
            Titipkan belanjaan, obat, atau keperluan warung ke driver mitra. Uang belanja ditalangi tunai saat kurir sampai di rumah Anda.
          </p>
        </div>

        {/* Shared Pooling Tetangga Searah (Diskon 40%) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-amber-500" />
              <span>Titip Bareng Tetangga Searah</span>
            </h3>
            <Badge variant="amber" size="sm" className="text-[10px] font-bold">
              HEMAT 40%
            </Badge>
          </div>

          <div className="space-y-2">
            {NEIGHBOR_ERRAND_POOLS.map((pool) => {
              const isSelected = isPoolingJoined && activePoolName === pool.storeName;
              return (
                <div
                  key={pool.id}
                  onClick={() => handleJoinPool(pool)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 shadow-xs ${
                    isSelected
                      ? "bg-teal-500/15 border-teal-500 text-teal-900 dark:text-teal-200"
                      : "bg-white dark:bg-[#0c1220] border-slate-200/80 dark:border-white/10 hover:border-teal-500/40"
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        {pool.storeName}
                      </span>
                      {isSelected && (
                        <Badge variant="teal" size="sm" className="text-[9px] py-0">
                          TERPILIH
                        </Badge>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-zinc-400">
                      {pool.neighborDistrict} • Berangkat: {pool.scheduledDeparture}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant={isSelected ? "default" : "outline"}
                    className="rounded-xl text-[10px] font-bold h-7 px-2.5 shrink-0"
                  >
                    {isSelected ? "Bergabung" : "Ikut Titip"}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lokasi Toko & Alamat Pengantaran (Visual Map Modal Mandate) */}
        <div className="p-4 rounded-3xl bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/10 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-200">Titik Toko & Pengantaran</h3>

          {/* Pickup (Toko / Warung) */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              1. Lokasi Toko / Warung Yang Dituju
            </label>
            <div 
              onClick={() => openMapPicker("pickup")}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 flex items-center justify-between gap-2 cursor-pointer hover:border-teal-500 transition-all"
            >
              <div className="flex items-center gap-2.5 truncate">
                <Store className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                <span className="text-xs font-medium text-slate-800 dark:text-zinc-200 truncate">
                  {pickup ? pickup.address : "Klik untuk pilih titik toko di peta"}
                </span>
              </div>
              <Badge variant="teal" size="sm" className="text-[10px] shrink-0">
                Peta
              </Badge>
            </div>
          </div>

          {/* Dropoff (Rumah / Alamat Antar) */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              2. Alamat Rumah / Pengantaran
            </label>
            
            {/* Quick Saved Address Badges */}
            {userData?.savedAddresses && userData.savedAddresses.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {userData.savedAddresses.map((addr) => {
                  const isSelected = dropoff?.address === addr.address;
                  return (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => setDropoff({ lat: addr.lat ?? -7.5666, lng: addr.lng ?? 110.8283, address: addr.address })}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1 ${
                        isSelected
                          ? "bg-teal-600 text-white shadow-xs"
                          : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200"
                      }`}
                    >
                      {addr.label === "Rumah" ? <Home className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
                      <span>{addr.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            <div 
              onClick={() => openMapPicker("dropoff")}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 flex items-center justify-between gap-2 cursor-pointer hover:border-teal-500 transition-all"
            >
              <div className="flex items-center gap-2.5 truncate">
                <Home className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="text-xs font-medium text-slate-800 dark:text-zinc-200 truncate">
                  {dropoff ? dropoff.address : "Klik untuk pilih titik antar di peta"}
                </span>
              </div>
              <Badge variant="emerald" size="sm" className="text-[10px] shrink-0">
                Peta
              </Badge>
            </div>
          </div>
        </div>

        {/* Route Preview Map */}
        {pickup && dropoff && (
          <div className="h-44 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-white/10 shadow-xs relative">
            <RouteMap
              pickup={pickup}
              dropoff={dropoff}
              directions={directions}
            />
            <div className="absolute bottom-2 left-2 right-2 p-2 rounded-xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-slate-200 dark:border-white/10 flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-zinc-300 font-medium">Jarak: {distanceKm.toFixed(1)} km</span>
              {isPoolingJoined && (
                <Badge variant="amber" size="sm" className="text-[9px] font-bold">
                  Diskon Pooling 40%
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Form Detail Belanjaan & Talangan */}
        <form onSubmit={handleCheckout} className="space-y-4">
          <div className="p-4 rounded-3xl bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/10 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-200">Rincian Belanjaan</h3>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Daftar Barang Titipan:
              </label>
              <textarea
                value={errandNotes}
                onChange={(e) => setErrandNotes(e.target.value)}
                placeholder="Contoh: 1 Kotak Paracetamol 500mg, 1 Botol Minyak Kayu Putih 60ml di Apotek Kimia Farma..."
                rows={3}
                className="sg-input w-full text-xs p-3 rounded-xl resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Estimasi Total Belanja (Talangan Tunai Driver):
              </label>
              <div className="relative">
                <Banknote className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={estimatedPrice}
                  onChange={(e) => setEstimatedPrice(e.target.value)}
                  placeholder="Rp 45.000"
                  className="sg-input pl-10 pr-4 py-2.5 w-full text-xs font-bold"
                />
              </div>
              <p className="text-[10px] text-slate-400">
                *Driver akan membelikan barang terlebih dahulu dan Anda menggantinya tunai saat serah terima.
              </p>
            </div>
          </div>

          {/* Breakdown & Submit Button */}
          <div className="p-4 rounded-3xl bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/10 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100 dark:border-white/[0.06]">
              <span className="text-slate-500 dark:text-zinc-400">Ongkir Jasa Titip:</span>
              <span className="font-black text-slate-900 dark:text-white">
                {isCalculatingPrice ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin inline" />
                ) : (
                  `Rp ${serviceFee.toLocaleString("id-ID")}`
                )}
              </span>
            </div>

            {isPoolingJoined && (
              <div className="flex items-center justify-between text-xs text-amber-600 dark:text-amber-400">
                <span>Potongan Titip Pooling Tetangga (40%):</span>
                <span className="font-bold">-Rp {Math.round(serviceFee * 0.67 * 0.4).toLocaleString("id-ID")}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting || isCalculatingPrice || serviceFee === 0}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-black text-xs py-3 rounded-xl shadow-md cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                  <span>Memproses Pesanan Titip...</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4 mr-1.5" />
                  <span>Pesan Titip Tetangga (Rp {serviceFee.toLocaleString("id-ID")})</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </main>

      {/* Map Location Picker Modal */}
      <MapLocationPickerModal
        isOpen={isMapPickerOpen}
        onClose={() => setIsMapPickerOpen(false)}
        onSelect={handleLocationPicked}
        initialLocation={pickerTarget === "pickup" ? (pickup || undefined) : (dropoff || undefined)}
      />
    </div>
  );
}
