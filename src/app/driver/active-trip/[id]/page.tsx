"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { useOrder } from "@/hooks/useOrder";
import { useLiveGPS } from "@/hooks/useLiveGPS";
import { orderService } from "@/services/order.service";
import { locationService } from "@/services/location.service";
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from "@react-google-maps/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  ArrowLeft, 
  MapPin, 
  Navigation, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  ExternalLink,
  Coins, 
  ShieldAlert,
  Package,
  Banknote
} from "lucide-react";
import { DEFAULT_CENTER, DEFAULT_ZOOM, MAP_LIBRARIES, MAP_DARK_STYLE } from "@/constants/maps";

const containerStyle = {
  width: "100%",
  height: "100%"
};

export default function DriverActiveTripPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;
  
  const router = useRouter();
  const { user, userData, loading: authLoading } = useAuthContext();
  const { order, loading: orderLoading, error } = useOrder(orderId);

  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { location } = useLiveGPS();

  // Update driver location to Firestore while on active trip
  useEffect(() => {
    if (!user || !location || !orderId || order?.status === "completed" || order?.status === "cancelled") return;
    
    // Broadcast location and tag it with currentOrderId
    locationService.updateDriverLocation(user.uid, location, true, orderId).catch(() => {});
  }, [user, location, orderId, order?.status]);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: MAP_LIBRARIES
  });

  // Calculate route between pickup and dropoff
  useEffect(() => {
    if (!isLoaded || !order?.pickupLocation || !order?.dropoffLocation) return;

    // @gmaps-interop
    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
      {
        origin: { lat: order.pickupLocation.lat, lng: order.pickupLocation.lng },
        destination: { lat: order.dropoffLocation.lat, lng: order.dropoffLocation.lng },
        // @gmaps-interop
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        // @gmaps-interop
        if (status === google.maps.DirectionsStatus.OK && result) {
          setDirections(result);
        }
      }
    );
  }, [isLoaded, order?.pickupLocation, order?.dropoffLocation]);

  const handleStartTrip = async () => {
    setIsUpdating(true);
    try {
      await orderService.updateOrderStatus(orderId, "in_progress", order?.customerId);
    } catch (err) {
      alert("Gagal memperbarui status perjalanan.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCompleteTrip = async () => {
    if (!user) return;
    if (!confirm(`Konfirmasi: Pastikan Anda telah menerima pembayaran tunai sebesar Rp ${order?.price.toLocaleString("id-ID")} dari pelanggan.`)) {
      return;
    }
    setIsUpdating(true);
    try {
      await orderService.completeOrder(orderId, user.uid, order?.customerId);
    } catch (err) {
      alert("Gagal menyelesaikan perjalanan.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Open native Google Maps app for GPS Navigation
  const openExternalMaps = (targetLat: number, targetLng: number) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${targetLat},${targetLng}`;
    window.open(url, "_blank");
  };

  if (authLoading || orderLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-950 text-emerald-500 space-y-3">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-sm text-slate-400">Memuat rute perjalanan mitra...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-950 p-6 text-center">
        <XCircle className="h-12 w-12 text-rose-500 mb-3" />
        <h2 className="text-xl font-bold text-white mb-2">Pesanan Tidak Ditemukan</h2>
        <Button onClick={() => router.push("/driver")} className="bg-slate-800 hover:bg-slate-700 text-white cursor-pointer">
          Kembali ke Dashboard
        </Button>
      </div>
    );
  }

  const mapCenter = order.pickupLocation 
    ? { lat: order.pickupLocation.lat, lng: order.pickupLocation.lng }
    : DEFAULT_CENTER;

  return (
    <div className="relative h-[100dvh] w-full bg-slate-950 overflow-hidden flex flex-col justify-between">
      {/* Floating Header */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
        <Button 
          variant="secondary" 
          size="icon" 
          className="rounded-full shadow-lg pointer-events-auto bg-white/90 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 backdrop-blur-md cursor-pointer text-slate-800 dark:text-zinc-200"
          onClick={() => router.push("/driver")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="bg-emerald-500/20 border border-emerald-500/40 px-3 py-1.5 rounded-full backdrop-blur-md text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 shadow-md">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          {order.status === "accepted" ? "Menuju Penjemputan" : order.status === "in_progress" ? "Mengantar Penumpang" : "Selesai"}
        </div>
      </div>

      {/* Map Display */}
      <div className="absolute inset-0 z-0">
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={mapCenter}
            zoom={DEFAULT_ZOOM}
            options={{ disableDefaultUI: true, styles: MAP_DARK_STYLE }}
          >
            {order.pickupLocation && !directions && (
              <Marker position={{ lat: order.pickupLocation.lat, lng: order.pickupLocation.lng }} />
            )}
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
          <div className="flex h-full items-center justify-center text-slate-500">Memuat Peta...</div>
        )}
      </div>

      {/* Driver Control Bottom Sheet */}
      <div className="z-10 mt-auto bg-white/95 dark:bg-zinc-900/95 border-t border-slate-200 dark:border-zinc-800 rounded-t-3xl shadow-2xl p-5 backdrop-blur-md max-w-lg w-full mx-auto">
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-zinc-700 rounded-full mx-auto mb-4" />

        {/* Phase 1: Driver Accepted -> Heading to Pickup */}
        {order.status === "accepted" && (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                  Tahap 1: Penjemputan
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">Jemput Penumpang</h3>
              </div>
              <Button 
                size="sm"
                variant="outline"
                className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 text-xs flex items-center gap-1.5 h-8 cursor-pointer"
                onClick={() => openExternalMaps(order.pickupLocation.lat, order.pickupLocation.lng)}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Navigasi GPS
              </Button>
            </div>

            <div className="bg-slate-50 dark:bg-zinc-800/60 rounded-2xl p-4 space-y-3 border border-slate-200 dark:border-zinc-700/50">
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <div className="text-xs">
                  <span className="text-slate-500 dark:text-zinc-500 block">Titik Jemput:</span>
                  <span className="text-slate-800 dark:text-zinc-200 font-medium">{order.pickupLocation.address}</span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Navigation className="h-4 w-4 text-rose-500 mt-0.5 shrink-0" />
                <div className="text-xs">
                  <span className="text-slate-500 dark:text-zinc-500 block">Tujuan Akhir:</span>
                  <span className="text-slate-800 dark:text-zinc-200 font-medium">{order.dropoffLocation.address}</span>
                </div>
              </div>

              {/* Menampilkan Items jika ada (Titip, Kuliner, dll) */}
              {order.items && order.items.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-zinc-700/50 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                    <Package className="h-4 w-4" /> Daftar Barang / Pesanan
                  </div>
                  <div className="space-y-1.5">
                    {order.items.map((item, idx) => (
                      <div key={item.id || idx} className="flex justify-between items-start text-xs text-slate-700 dark:text-zinc-300">
                        <span className="flex-1 pr-2">- {item.name} <span className="font-bold text-slate-500 ml-1">x{item.qty}</span></span>
                        {item.price > 0 && <span className="font-semibold whitespace-nowrap">Rp {(item.price * item.qty).toLocaleString("id-ID")}</span>}
                      </div>
                    ))}
                  </div>
                  {order.serviceType === "titip" && (
                    <div className="flex justify-between items-center text-xs mt-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                      <span className="text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1">
                        <Banknote className="h-3 w-3" /> Talangan Maksimal:
                      </span>
                      <span className="font-black text-amber-600 dark:text-amber-400">
                        Rp {order.items.reduce((acc, i) => acc + (i.price * i.qty), 0).toLocaleString("id-ID")}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Button 
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-14 text-base rounded-2xl shadow-lg cursor-pointer"
              onClick={handleStartTrip}
              disabled={isUpdating}
            >
              {isUpdating ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
              Saya Sudah Tiba & Mulai Perjalanan
            </Button>
          </div>
        )}

        {/* Phase 2: In Progress -> Heading to Dropoff */}
        {order.status === "in_progress" && (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  Tahap 2: Pengantaran
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">Antar Menuju Tujuan</h3>
              </div>
              <Button 
                size="sm"
                variant="outline"
                className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 text-xs flex items-center gap-1.5 h-8 cursor-pointer"
                onClick={() => openExternalMaps(order.dropoffLocation.lat, order.dropoffLocation.lng)}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Navigasi GPS
              </Button>
            </div>

            <div className="bg-slate-50 dark:bg-zinc-800/60 rounded-2xl p-4 space-y-2.5 border border-slate-200 dark:border-zinc-700/50">
              <div className="flex items-start space-x-3">
                <Navigation className="h-4 w-4 text-rose-500 mt-0.5 shrink-0" />
                <div className="text-xs">
                  <span className="text-slate-500 dark:text-zinc-500 block">Alamat Tujuan:</span>
                  <span className="text-slate-800 dark:text-zinc-200 font-medium">{order.dropoffLocation.address}</span>
                </div>
              </div>

              {/* Menampilkan Items saat dropoff */}
              {order.items && order.items.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-zinc-700/50 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <Package className="h-4 w-4" /> Barang yang Diantar
                  </div>
                  <div className="space-y-1.5">
                    {order.items.map((item, idx) => (
                      <div key={item.id || idx} className="flex justify-between items-start text-xs text-slate-700 dark:text-zinc-300">
                        <span className="flex-1 pr-2">- {item.name} <span className="font-bold text-slate-500 ml-1">x{item.qty}</span></span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 dark:border-zinc-700/50 flex justify-between items-center text-sm">
                <span className="text-slate-500 dark:text-zinc-400">
                  {order.serviceType === "titip" ? "Total Tagihan (Talangan + Jasa):" : "Tagihan Tunai ke Penumpang:"}
                </span>
                <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                  Rp {(order.price + (order.serviceType === "titip" ? (order.items?.reduce((acc, i) => acc + (i.price * i.qty), 0) || 0) : 0)).toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            <Button 
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-14 text-base rounded-2xl shadow-lg cursor-pointer"
              onClick={handleCompleteTrip}
              disabled={isUpdating}
            >
              {isUpdating ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
              Selesaikan Trip (Terima Rp {order.price.toLocaleString("id-ID")})
            </Button>
          </div>
        )}

        {/* Phase 3: Completed */}
        {order.status === "completed" && (
          <div className="space-y-4 text-center py-2">
            <div className="inline-flex p-3 bg-emerald-500/20 rounded-full mb-1">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Trip Berhasil Diselesaikan!</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Uang tunai 100% milik Anda tanpa potongan komisi.
            </p>

            <Card className="bg-slate-50 dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700/50 p-4 space-y-2 text-left">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 dark:text-zinc-400">Pendapatan Masuk:</span>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">Rp {order.price.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-semibold pt-2 border-t border-slate-200 dark:border-zinc-700/50">
                <Coins className="h-4 w-4" /> +10 Poin Reward Komunitas Ditambahkan!
              </div>
            </Card>

            <Button 
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-12 rounded-xl cursor-pointer"
              onClick={() => router.push("/driver")}
            >
              Kembali ke Radar Dashboard
            </Button>
          </div>
        )}

        {/* Cancelled */}
        {order.status === "cancelled" && (
          <div className="space-y-4 text-center py-2">
            <div className="inline-flex p-3 bg-rose-500/20 rounded-full mb-1">
              <ShieldAlert className="h-10 w-10 text-rose-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pesanan Dibatalkan Pelanggan</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Pelanggan telah membatalkan perjalanan ini.
            </p>
            <Button 
              className="w-full bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 text-slate-800 dark:text-white font-semibold h-12 rounded-xl cursor-pointer"
              onClick={() => router.push("/driver")}
            >
              Kembali ke Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
