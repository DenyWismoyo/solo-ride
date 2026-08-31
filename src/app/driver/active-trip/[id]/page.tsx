"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { useOrder } from "@/hooks/useOrder";
import { useLiveGPS } from "@/hooks/useLiveGPS";
import { orderService } from "@/services/order.service";
import { locationService } from "@/services/location.service";
import { RouteMap } from "@/components/map/RouteMap";
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
  Banknote,
  UtensilsCrossed,
  Store,
  MessageSquare,
  PhoneCall
} from "lucide-react";
import { playSuccessChime } from "@/lib/sound";

export default function DriverActiveTripPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;
  
  const router = useRouter();
  const { user, userData, loading: authLoading } = useAuthContext();
  const { order, loading: orderLoading, error } = useOrder(orderId);

  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { location } = useLiveGPS();

  // Update driver location to Firestore while on active trip (with throttling)
  useEffect(() => {
    if (!user || !location || !orderId || order?.status === "completed" || order?.status === "cancelled") return;
    
    locationService.updateDriverLocation(user.uid, location, true, orderId).catch(() => {});
  }, [user, location, orderId, order?.status]);

  // Dynamic 2-Phase Routing for Driver Navigation
  useEffect(() => {
    if (!order?.pickupLocation || !order?.dropoffLocation || typeof window === "undefined" || !window.google?.maps) return;

    let origin = { lat: order.pickupLocation.lat, lng: order.pickupLocation.lng };
    let destination = { lat: order.dropoffLocation.lat, lng: order.dropoffLocation.lng };

    // Phase 1 (Accepted): Rute dari posisi driver menuju titik penjemputan / warung
    if (order.status === "accepted") {
      if (location) {
        origin = { lat: location.lat, lng: location.lng };
      }
      destination = { lat: order.pickupLocation.lat, lng: order.pickupLocation.lng };
    } 
    // Phase 2 (In Progress): Rute dari warung menuju titik tujuan
    else if (order.status === "in_progress") {
      if (location) {
        origin = { lat: location.lat, lng: location.lng };
      } else {
        origin = { lat: order.pickupLocation.lat, lng: order.pickupLocation.lng };
      }
      destination = { lat: order.dropoffLocation.lat, lng: order.dropoffLocation.lng };
    }

    // @gmaps-interop
    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin,
        destination,
        // @gmaps-interop
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        // @gmaps-interop
        if (status === window.google.maps.DirectionsStatus.OK && result) {
          setDirections(result);
        }
      }
    );
  }, [order?.status, order?.pickupLocation, order?.dropoffLocation, location?.lat, location?.lng]);

  const handleStartTrip = async () => {
    setIsUpdating(true);
    try {
      await orderService.updateOrderStatus(orderId, "in_progress", order?.customerId);
      playSuccessChime();
    } catch (err: any) {
      alert(err.message || "Gagal memperbarui status perjalanan.");
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
      playSuccessChime();
    } catch (err: any) {
      alert(err.message || "Gagal menyelesaikan perjalanan.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Open native Google Maps app for GPS Turn-by-Turn Navigation
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

  const isFood = order.serviceType === "kuliner";

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
          {order.status === "accepted" 
            ? (isFood ? "Menuju Warung Mitra" : "Menuju Penjemputan") 
            : order.status === "in_progress" 
              ? (isFood ? "Mengantar Makanan" : "Mengantar Penumpang") 
              : "Selesai"}
        </div>
      </div>

      {/* Map Display */}
      <div className="absolute inset-0 z-0">
        <RouteMap
          pickup={order.pickupLocation}
          dropoff={order.dropoffLocation}
          driverLocation={location}
          directions={directions}
          polylineColor={isFood ? "#f97316" : "#10b981"}
          className="w-full h-full"
        />
      </div>

      {/* Driver Control Bottom Sheet */}
      <div className="z-10 mt-auto bg-white/95 dark:bg-zinc-900/95 border-t border-slate-200 dark:border-zinc-800 rounded-t-3xl shadow-2xl p-5 backdrop-blur-md max-w-lg w-full mx-auto">
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-zinc-700 rounded-full mx-auto mb-4" />

        {/* Phase 1: Driver Accepted -> Heading to Pickup / Stalls */}
        {order.status === "accepted" && (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                  {isFood ? "Tahap 1: Ambil Makanan di Warung" : "Tahap 1: Penjemputan"}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {isFood ? "Ambil Pesanan Kuliner" : "Jemput Penumpang"}
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                {order.customerPhone && (
                  <Button 
                    size="sm"
                    variant="outline"
                    className="border-blue-500/40 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 text-xs flex items-center gap-1.5 h-8 cursor-pointer"
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        window.location.href = `tel:${order.customerPhone}`;
                      }
                    }}
                  >
                    <PhoneCall className="h-3.5 w-3.5" />
                    Telepon
                  </Button>
                )}
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
            </div>

            {/* Warung Cooking Status Live Banner */}
            {isFood && (
              <div className="p-3 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center gap-2.5 text-xs text-orange-800 dark:text-orange-300">
                <UtensilsCrossed className="h-4 w-4 text-orange-600 shrink-0" />
                <p className="text-[11px] leading-tight">
                  Warung sedang menyiapkan pesanan. Silakan menuju ke lokasi warung & periksa pesanan di kasir saat tiba.
                </p>
              </div>
            )}

            <div className="bg-slate-50 dark:bg-zinc-800/60 rounded-2xl p-4 space-y-3 border border-slate-200 dark:border-zinc-700/50">
              <div className="flex items-start space-x-3">
                {isFood ? (
                  <Store className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                ) : (
                  <MapPin className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                )}
                <div className="text-xs">
                  <span className="text-slate-500 dark:text-zinc-500 block">
                    {isFood ? "Lokasi Warung UMKM:" : "Titik Jemput:"}
                  </span>
                  <span className="text-slate-800 dark:text-zinc-200 font-medium">{order.pickupLocation?.address}</span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Navigation className="h-4 w-4 text-rose-500 mt-0.5 shrink-0" />
                <div className="text-xs">
                  <span className="text-slate-500 dark:text-zinc-500 block">Tujuan Pengantaran:</span>
                  <span className="text-slate-800 dark:text-zinc-200 font-medium">{order.dropoffLocation?.address}</span>
                </div>
              </div>

              {/* Items Verification Checklist for Food */}
              {order.items && order.items.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-zinc-700/50 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-orange-600 dark:text-orange-400">
                    <UtensilsCrossed className="h-4 w-4" /> Periksa Pesanan di Kasir:
                  </div>
                  <div className="space-y-1.5">
                    {order.items.map((item, idx) => (
                      <div key={item.id || idx} className="text-xs text-slate-700 dark:text-zinc-300">
                        <div className="flex justify-between items-start">
                          <span className="flex-1 pr-2">- {item.name} <strong className="text-slate-900 dark:text-white">x{item.qty}</strong></span>
                          {item.price > 0 && <span className="font-semibold whitespace-nowrap">Rp {(item.price * item.qty).toLocaleString("id-ID")}</span>}
                        </div>
                        {item.notes && (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 block bg-amber-500/10 px-2 py-0.5 rounded mt-0.5">
                            Catatan: {item.notes}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button 
              className={`w-full text-white font-bold h-14 text-base rounded-2xl shadow-lg cursor-pointer ${
                isFood ? "bg-orange-600 hover:bg-orange-500" : "bg-emerald-600 hover:bg-emerald-500"
              }`}
              onClick={handleStartTrip}
              disabled={isUpdating}
            >
              {isUpdating ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
              {isFood ? "Saya Sudah Ambil Makanan & Mulai Antar" : "Saya Sudah Tiba & Mulai Perjalanan"}
            </Button>
          </div>
        )}

        {/* Phase 2: In Progress -> Heading to Customer Dropoff */}
        {order.status === "in_progress" && (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  Tahap 2: Pengantaran
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {isFood ? "Antar Makanan ke Pelanggan" : "Antar Menuju Tujuan"}
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                {order.customerPhone && (
                  <Button 
                    size="sm"
                    variant="outline"
                    className="border-blue-500/40 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 text-xs flex items-center gap-1.5 h-8 cursor-pointer"
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        window.location.href = `tel:${order.customerPhone}`;
                      }
                    }}
                  >
                    <PhoneCall className="h-3.5 w-3.5" />
                    Telepon
                  </Button>
                )}
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
            </div>

            <div className="bg-slate-50 dark:bg-zinc-800/60 rounded-2xl p-4 space-y-2.5 border border-slate-200 dark:border-zinc-700/50">
              <div className="flex items-start space-x-3">
                <Navigation className="h-4 w-4 text-rose-500 mt-0.5 shrink-0" />
                <div className="text-xs">
                  <span className="text-slate-500 dark:text-zinc-500 block">Alamat Rumah Pelanggan:</span>
                  <span className="text-slate-800 dark:text-zinc-200 font-medium">{order.dropoffLocation?.address}</span>
                </div>
              </div>

              {/* Customer Courier Note Highlight */}
              {order.customerNote && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-800 dark:text-amber-300">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-0.5">
                    Catatan Khusus Pelanggan:
                  </span>
                  <p className="font-semibold italic">"{order.customerNote}"</p>
                </div>
              )}

              {/* Menampilkan Items saat dropoff */}
              {order.items && order.items.length > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-200 dark:border-zinc-700/50 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <Package className="h-3.5 w-3.5" /> Makanan yang Diantar:
                  </div>
                  <div className="space-y-1">
                    {order.items.map((item, idx) => (
                      <div key={item.id || idx} className="text-xs text-slate-700 dark:text-zinc-300">
                        <span>- {item.qty}x {item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment Method Details */}
              <div className="pt-2 border-t border-slate-200 dark:border-zinc-700/50 space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 dark:text-zinc-400">Metode Pembayaran:</span>
                  <span className={`font-bold px-2 py-0.5 rounded-md ${
                    order.paymentMethod === "cash" 
                      ? "bg-amber-500/20 text-amber-700 dark:text-amber-400" 
                      : "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                  }`}>
                    {order.paymentMethod === "cash" ? "💵 Tunai (COD)" : "📱 QRIS (Sudah Lunas)"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm pt-1">
                  <span className="text-slate-700 dark:text-zinc-300 font-semibold">
                    {order.paymentMethod === "cash" ? "Tagih Tunai ke Pelanggan:" : "Total Tagihan (Non-Tunai):"}
                  </span>
                  <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                    Rp {order.price.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>

            <Button 
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-14 text-base rounded-2xl shadow-lg cursor-pointer"
              onClick={handleCompleteTrip}
              disabled={isUpdating}
            >
              {isUpdating ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
              {isFood 
                ? (order.paymentMethod === "cash" ? `Makanan Diserahkan (Terima Tunai Rp ${order.price.toLocaleString("id-ID")})` : `Makanan Diserahkan (QRIS Lunas)`) 
                : `Selesaikan Trip (Terima Rp ${order.price.toLocaleString("id-ID")})`}
            </Button>
          </div>
        )}

        {/* Phase 3: Completed */}
        {order.status === "completed" && (
          <div className="space-y-4 text-center py-2">
            <div className="inline-flex p-3 bg-emerald-500/20 rounded-full mb-1">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pengantaran Berhasil Selesai!</h3>
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
              Pelanggan telah membatalkan pesanan ini.
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
