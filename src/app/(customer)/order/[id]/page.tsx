"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { useOrder } from "@/hooks/useOrder";
import { useDriverLocation } from "@/hooks/useLocation";
import { orderService } from "@/services/order.service";
import { reviewService } from "@/services/review.service";
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from "@react-google-maps/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  ArrowLeft, 
  MapPin, 
  Navigation, 
  Loader2, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  PhoneCall, 
  MessageSquare,
  Bike,
  Star,
  Send,
  Sparkles
} from "lucide-react";
import { DEFAULT_CENTER, DEFAULT_ZOOM, MAP_LIBRARIES, MAP_DARK_STYLE } from "@/constants/maps";

const containerStyle = {
  width: "100%",
  height: "100%"
};

export default function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;
  
  const router = useRouter();
  const { user, userData, loading: authLoading } = useAuthContext();
  const { order, loading: orderLoading, error } = useOrder(orderId);
  const { driverLocation } = useDriverLocation(order?.driverId);

  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Review & Rating State
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

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

  const handleCancelOrder = async () => {
    if (!confirm("Apakah Anda yakin ingin membatalkan pesanan ini?")) return;
    setIsCancelling(true);
    try {
      await orderService.cancelOrder(orderId, user?.uid);
    } catch (err) {
      alert("Gagal membatalkan pesanan.");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!user || !order?.driverId) return;
    setIsSubmittingReview(true);
    try {
      await reviewService.createReview({
        orderId,
        reviewerId: user.uid,
        reviewerName: userData?.displayName || "Warga Pengguna",
        targetId: order.driverId,
        targetType: "driver",
        rating,
        comment: reviewComment || "Pelayanan driver sangat baik dan ramah!"
      });
      setReviewSubmitted(true);
      alert("⭐ Terima kasih atas penilaian bintang Anda!");
    } catch (err) {
      alert("Gagal mengirim ulasan.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (authLoading || orderLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-950 text-emerald-500 space-y-3">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-sm text-slate-400">Memuat status perjalanan...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-950 p-6 text-center">
        <XCircle className="h-12 w-12 text-rose-500 mb-3" />
        <h2 className="text-xl font-bold text-white mb-2">Pesanan Tidak Ditemukan</h2>
        <p className="text-sm text-slate-400 mb-6">Pesanan mungkin telah dihapus atau ID tidak valid.</p>
        <Button onClick={() => router.push("/")} className="bg-slate-800 hover:bg-slate-700 text-white cursor-pointer">
          Kembali ke Beranda
        </Button>
      </div>
    );
  }

  const mapCenter = driverLocation?.location || (order.pickupLocation 
    ? { lat: order.pickupLocation.lat, lng: order.pickupLocation.lng }
    : DEFAULT_CENTER);

  return (
    <div className="relative h-[100dvh] w-full bg-slate-950 overflow-hidden flex flex-col justify-between">
      {/* Floating Header */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
        <Button 
          variant="secondary" 
          size="icon" 
          className="rounded-full shadow-lg pointer-events-auto bg-white/90 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 backdrop-blur-md cursor-pointer text-slate-800 dark:text-zinc-200"
          onClick={() => router.push("/")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="bg-white/90 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 px-3.5 py-1.5 rounded-full backdrop-blur-md text-xs font-semibold text-slate-800 dark:text-zinc-200 shadow-md">
          {order.serviceType === "kuliner" ? "Order Kuliner" : "Perjalanan"} #{orderId.slice(0, 6)}
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
            {/* Live Driver GPS Position if active */}
            {driverLocation?.location && (
              <Marker 
                position={{ lat: driverLocation.location.lat, lng: driverLocation.location.lng }} 
                label={{ text: "🛵", fontSize: "24px" }}
                zIndex={999}
              />
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

      {/* Status Panel / Bottom Sheet */}
      <div className="z-10 mt-auto bg-white/95 dark:bg-zinc-900/95 border-t border-slate-200 dark:border-zinc-800 rounded-t-3xl shadow-2xl p-5 backdrop-blur-md max-w-lg w-full mx-auto">
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-zinc-700 rounded-full mx-auto mb-4" />

        {/* Status: Pending */}
        {order.status === "pending" && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-2xl">
              <Loader2 className="h-6 w-6 text-amber-500 animate-spin shrink-0" />
              <div>
                <p className="text-sm font-bold text-amber-600 dark:text-amber-400">Mencari Mitra Driver Terdekat</p>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Menghubungkan pesanan Anda ke mitra lokal di Surakarta...</p>
              </div>
            </div>
            
            <div className="bg-slate-50 dark:bg-zinc-800/60 rounded-2xl p-4 space-y-3 border border-slate-200 dark:border-zinc-700/50">
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <div className="text-xs">
                  <span className="text-slate-500 dark:text-zinc-500 block">Jemput:</span>
                  <span className="text-slate-800 dark:text-zinc-200 font-medium line-clamp-1">{order.pickupLocation.address}</span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Navigation className="h-4 w-4 text-rose-500 mt-0.5 shrink-0" />
                <div className="text-xs">
                  <span className="text-slate-500 dark:text-zinc-500 block">Tujuan:</span>
                  <span className="text-slate-800 dark:text-zinc-200 font-medium line-clamp-1">{order.dropoffLocation.address}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-zinc-700/50 flex justify-between items-center text-sm">
                <span className="text-slate-500 dark:text-zinc-400">Tarif Tunai</span>
                <span className="font-bold text-slate-900 dark:text-white">Rp {order.price.toLocaleString("id-ID")}</span>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 h-12 cursor-pointer"
              onClick={handleCancelOrder}
              disabled={isCancelling}
            >
              {isCancelling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Batalkan Pesanan
            </Button>
          </div>
        )}

        {/* Status: Accepted */}
        {order.status === "accepted" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-2xl">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400">
                  <Bike className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Mitra Ditemukan!</p>
                  <p className="text-xs text-slate-600 dark:text-zinc-300">Driver sedang menuju titik penjemputan</p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="h-3 w-3" /> Mitra Resmi
                </span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="secondary" 
                className="w-full h-11 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 flex items-center justify-center gap-2 cursor-pointer"
                onClick={() => alert("Fitur telepon aman (Masking Kontak) sedang diproses.")}
              >
                <PhoneCall className="h-4 w-4 text-emerald-500" />
                Hubungi
              </Button>
              <Button 
                variant="secondary" 
                className="w-full h-11 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 flex items-center justify-center gap-2 cursor-pointer"
                onClick={() => alert("Fitur chat in-app terenkripsi sedang disiapkan.")}
              >
                <MessageSquare className="h-4 w-4 text-emerald-500" />
                Chat
              </Button>
            </div>

            <div className="bg-slate-50 dark:bg-zinc-800/60 rounded-2xl p-4 flex justify-between items-center text-sm border border-slate-200 dark:border-zinc-700/50">
              <span className="text-slate-500 dark:text-zinc-400">Total Tarif (Siapkan Uang Pas)</span>
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">Rp {order.price.toLocaleString("id-ID")}</span>
            </div>
          </div>
        )}

        {/* Status: In Progress */}
        {order.status === "in_progress" && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-2xl">
              <Navigation className="h-6 w-6 text-emerald-500 animate-pulse" />
              <div>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Sedang Dalam Perjalanan</p>
                <p className="text-xs text-slate-600 dark:text-zinc-300">Menuju lokasi: {order.dropoffLocation.address}</p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-zinc-800/60 rounded-2xl p-4 space-y-2 text-sm border border-slate-200 dark:border-zinc-700/50">
              <div className="flex justify-between items-center text-slate-500 dark:text-zinc-400 text-xs">
                <span>Status Pengantaran</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Aktif Berjalan</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-zinc-700/50">
                <span className="text-slate-700 dark:text-zinc-300">Tarif Tunai</span>
                <span className="font-bold text-slate-900 dark:text-white text-base">Rp {order.price.toLocaleString("id-ID")}</span>
              </div>
            </div>
          </div>
        )}

        {/* Status: Completed with 5-Star Rating Feedback */}
        {order.status === "completed" && (
          <div className="space-y-4 text-center py-1">
            <div className="inline-flex p-3 bg-emerald-500/20 rounded-full mb-0.5">
              <CheckCircle2 className="h-9 w-9 text-emerald-500" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Perjalanan Selesai!</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Terima kasih telah mendukung ekosistem ojek lokal tanpa potongan komisi.
            </p>

            {/* Rating Section */}
            {!reviewSubmitted && !order.customerRatingForDriver ? (
              <div className="bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700/60 rounded-2xl p-4 space-y-3 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Beri Nilai Mitra Driver:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="cursor-pointer p-0.5 focus:outline-none"
                      >
                        <Star
                          className={`h-5 w-5 ${
                            star <= rating
                              ? "fill-amber-400 text-amber-400 scale-110 transition-transform"
                              : "text-slate-300 dark:text-zinc-600"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Tulis ulasan untuk mitra driver..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white"
                />

                <Button
                  size="sm"
                  onClick={handleSubmitReview}
                  disabled={isSubmittingReview}
                  className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs h-9 rounded-xl cursor-pointer"
                >
                  {isSubmittingReview ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Send className="h-3.5 w-3.5 mr-1" />}
                  Kirim Penilaian ({rating} Bintang)
                </Button>
              </div>
            ) : (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4" /> Ulasan Anda telah berhasil disimpan. Terima kasih!
              </div>
            )}

            <Button 
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-12 rounded-xl cursor-pointer"
              onClick={() => router.push("/")}
            >
              Kembali ke Beranda
            </Button>
          </div>
        )}

        {/* Status: Cancelled */}
        {order.status === "cancelled" && (
          <div className="space-y-4 text-center py-2">
            <div className="inline-flex p-3 bg-rose-500/20 rounded-full mb-1">
              <XCircle className="h-10 w-10 text-rose-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pesanan Dibatalkan</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Pesanan ini telah dibatalkan. Anda dapat membuat pesanan baru kapan saja.
            </p>
            <Button 
              className="w-full bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 text-slate-800 dark:text-white font-semibold h-12 rounded-xl cursor-pointer"
              onClick={() => router.push("/")}
            >
              Buat Pesanan Baru
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
