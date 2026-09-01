"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { useOrder } from "@/hooks/useOrder";
import { useDriverLocation } from "@/hooks/useLocation";
import { orderService } from "@/services/order.service";
import { reviewService } from "@/services/review.service";
import { RouteMap } from "@/components/map/RouteMap";
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
  Sparkles,
  UtensilsCrossed,
  Store,
  ChefHat,
  Receipt,
  FileText,
  Clock,
  Banknote,
  QrCode,
  Package,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { playSuccessChime } from "@/lib/sound";
import { motion, AnimatePresence } from "motion/react";
import { CivicOutputViewer } from "@/components/civic/output/CivicOutputViewer";

export default function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;
  
  const router = useRouter();
  const { user, userData, loading: authLoading } = useAuthContext();
  const { order, loading: orderLoading, error } = useOrder(orderId);
  const { driverLocation } = useDriverLocation(order?.driverId);

  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showReceiptDrawer, setShowReceiptDrawer] = useState(false);

  // Review & Rating State
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Dynamic 2-Phase Routing calculation
  useEffect(() => {
    if (!order?.pickupLocation || !order?.dropoffLocation || typeof window === "undefined" || !window.google?.maps) return;

    let origin = { lat: order.pickupLocation.lat, lng: order.pickupLocation.lng };
    let destination = { lat: order.dropoffLocation.lat, lng: order.dropoffLocation.lng };

    // Phase 1 (Accepted): Rute dari posisi driver menuju titik jemput / warung
    if (order.status === "accepted" && driverLocation?.location) {
      origin = { lat: driverLocation.location.lat, lng: driverLocation.location.lng };
      destination = { lat: order.pickupLocation.lat, lng: order.pickupLocation.lng };
    } 
    // Phase 2 (In Progress): Rute dari warung menuju titik tujuan
    else if (order.status === "in_progress" && driverLocation?.location) {
      origin = { lat: driverLocation.location.lat, lng: driverLocation.location.lng };
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
  }, [order?.status, order?.pickupLocation, order?.dropoffLocation, driverLocation?.location?.lat, driverLocation?.location?.lng]);

  const handleCancelOrder = async () => {
    if (!confirm("Apakah Anda yakin ingin membatalkan pesanan ini?")) return;
    setIsCancelling(true);
    try {
      await orderService.cancelOrder(orderId, user?.uid);
    } catch (err: any) {
      alert(err.message || "Gagal membatalkan pesanan.");
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
        comment: reviewComment || "Pelayanan pengantaran sangat baik dan ramah!"
      });
      setReviewSubmitted(true);
      playSuccessChime();
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
        <p className="text-sm text-slate-400">Memuat status pesanan...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-950 p-6 text-center">
        <XCircle className="h-12 w-12 text-rose-500 mb-3" />
        <h2 className="text-xl font-bold text-white mb-2">Pesanan Tidak Ditemukan</h2>
        <p className="text-sm text-slate-400 mb-6">Pesanan mungkin telah dibatalkan atau ID tidak valid.</p>
        <Button onClick={() => router.push("/")} className="bg-slate-800 hover:bg-slate-700 text-white cursor-pointer">
          Kembali ke Beranda
        </Button>
      </div>
    );
  }

  const isFood = order.serviceType === "kuliner";
  const itemsTotal = order.items?.reduce((acc, i) => acc + (i.price * i.qty), 0) || (order.price - 8000);

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
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => setShowReceiptDrawer(!showReceiptDrawer)}
            className="bg-white/90 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 px-3 py-1.5 rounded-full backdrop-blur-md text-xs font-bold text-slate-800 dark:text-zinc-200 shadow-md flex items-center gap-1.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-800"
          >
            <Receipt className="h-3.5 w-3.5 text-orange-500" />
            <span>Rincian Tagihan</span>
          </button>
        </div>
      </div>

      {/* Map Display */}
      <div className="absolute inset-0 z-0">
        <RouteMap
          pickup={order.pickupLocation}
          dropoff={order.dropoffLocation}
          driverLocation={driverLocation?.location}
          directions={directions}
          polylineColor={isFood ? "#f97316" : "#10b981"}
          className="w-full h-full"
        />
      </div>

      {/* Receipt Breakdown Drawer / Modal */}
      <AnimatePresence>
        {showReceiptDrawer && (
          <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#0c1220] border border-slate-200 dark:border-white/[0.1] rounded-3xl max-w-sm w-full p-4 shadow-2xl space-y-3"
            >
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/[0.06] pb-2">
                <div className="flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-orange-500" />
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">Rincian Pembayaran Kuliner</h3>
                </div>
                <button onClick={() => setShowReceiptDrawer(false)} className="text-slate-400 p-1">
                  <XCircle className="h-4 w-4" />
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-1.5 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Menu:</span>
                {order.items?.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-start text-slate-700 dark:text-zinc-300">
                    <div>
                      <span>{it.qty}x {it.name}</span>
                      {it.notes && <p className="text-[10px] text-amber-600 dark:text-amber-400">Catatan: {it.notes}</p>}
                    </div>
                    <span className="font-bold">Rp {(it.price * it.qty).toLocaleString("id-ID")}</span>
                  </div>
                ))}
              </div>

              {/* Cost Summary */}
              <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-white/[0.06] text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal Makanan</span>
                  <span>Rp {itemsTotal.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Ongkir Flat Solo</span>
                  <span>Rp 8.000</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Metode Pembayaran</span>
                  <span className="font-bold text-slate-900 dark:text-white uppercase">{order.paymentMethod || "Tunai"}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-1.5 border-t border-slate-200 dark:border-zinc-800">
                  <span>Total Tagihan</span>
                  <span className="text-orange-600 dark:text-orange-400">Rp {order.price.toLocaleString("id-ID")}</span>
                </div>
              </div>

              {order.customerNote && (
                <div className="p-2 bg-slate-50 dark:bg-white/[0.03] rounded-xl text-[10px] text-slate-600 dark:text-zinc-400">
                  <strong>Catatan Antar:</strong> "{order.customerNote}"
                </div>
              )}

              <Button onClick={() => setShowReceiptDrawer(false)} className="w-full h-9 text-xs rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold">
                Tutup
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Status Panel / Bottom Sheet */}
      <div className="z-10 mt-auto bg-white/95 dark:bg-zinc-900/95 border-t border-slate-200 dark:border-zinc-800 rounded-t-3xl shadow-2xl p-5 backdrop-blur-md max-w-lg w-full mx-auto">
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-zinc-700 rounded-full mx-auto mb-4" />

        {/* Dynamic 5-Step Culinary Progress Bar */}
        {isFood && order.status !== "cancelled" && (
          <div className="mb-4 bg-slate-50 dark:bg-zinc-800/60 p-2.5 rounded-2xl border border-slate-200/80 dark:border-zinc-700/50">
            <div className="grid grid-cols-5 gap-1 text-center">
              <div className="space-y-1">
                <div className="h-1.5 rounded-full bg-orange-500" />
                <span className="text-[8.5px] font-bold text-orange-600 dark:text-orange-400 block">Diterima</span>
              </div>
              <div className="space-y-1">
                <div className={`h-1.5 rounded-full ${["cooking", "ready_for_pickup", "accepted", "in_progress", "completed"].includes(order.status) ? "bg-orange-500" : "bg-slate-200 dark:bg-zinc-700"}`} />
                <span className={`text-[8.5px] font-bold block ${["cooking", "ready_for_pickup", "accepted", "in_progress", "completed"].includes(order.status) ? "text-orange-600 dark:text-orange-400" : "text-slate-400"}`}>
                  Dimasak
                </span>
              </div>
              <div className="space-y-1">
                <div className={`h-1.5 rounded-full ${["ready_for_pickup", "accepted", "in_progress", "completed"].includes(order.status) ? "bg-orange-500" : "bg-slate-200 dark:bg-zinc-700"}`} />
                <span className={`text-[8.5px] font-bold block ${["ready_for_pickup", "accepted", "in_progress", "completed"].includes(order.status) ? "text-orange-600 dark:text-orange-400" : "text-slate-400"}`}>
                  Siap
                </span>
              </div>
              <div className="space-y-1">
                <div className={`h-1.5 rounded-full ${["in_progress", "completed"].includes(order.status) ? "bg-orange-500" : "bg-slate-200 dark:bg-zinc-700"}`} />
                <span className={`text-[8.5px] font-bold block ${["in_progress", "completed"].includes(order.status) ? "text-orange-600 dark:text-orange-400" : "text-slate-400"}`}>
                  Diantar
                </span>
              </div>
              <div className="space-y-1">
                <div className={`h-1.5 rounded-full ${order.status === "completed" ? "bg-emerald-500" : "bg-slate-200 dark:bg-zinc-700"}`} />
                <span className={`text-[8.5px] font-bold block ${order.status === "completed" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`}>
                  Selesai
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Multi-Modal Output Viewer for Government Orders */}
        {(order.targetRole === "government" || (order.additionalRole && order.additionalRole.startsWith("gov_"))) && (
          <div className="mb-4">
            <CivicOutputViewer order={order} />
          </div>
        )}

        {/* OTP Display for Document Handover (Fallback) */}
        {!order.targetRole?.includes("government") && order.otpCode && order.status !== "completed" && order.status !== "cancelled" && (
          <div className="mb-4 bg-blue-50/90 dark:bg-blue-900/40 p-3.5 rounded-2xl border border-blue-200 dark:border-blue-800 backdrop-blur-md flex items-center justify-between shadow-xs">
            <div>
              <p className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-0.5">OTP Serah Terima</p>
              <p className="text-[10px] text-blue-600/80 dark:text-blue-300/80">Berikan ke kurir / petugas dinas</p>
            </div>
            <div className="font-mono text-xl font-black tracking-widest text-blue-700 dark:text-blue-300 bg-white dark:bg-zinc-900 px-3 py-1 rounded-xl shadow-xs">
              {order.otpCode}
            </div>
          </div>
        )}

        {/* Status: Pending (Waiting for Merchant) */}
        {order.status === "pending" && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 bg-orange-500/10 border border-orange-500/20 p-3.5 rounded-2xl">
              <Loader2 className="h-6 w-6 text-orange-500 animate-spin shrink-0" />
              <div>
                <p className="text-sm font-bold text-orange-600 dark:text-orange-400">
                  {isFood ? "Menunggu Konfirmasi Warung" : "Mencari Mitra Driver Terdekat"}
                </p>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  {isFood ? "Warung sedang memeriksa pesanan & kurir terdekat bersiap merapat..." : "Menghubungkan pesanan Anda ke mitra lokal di Surakarta..."}
                </p>
              </div>
            </div>
            
            <div className="bg-slate-50 dark:bg-zinc-800/60 rounded-2xl p-4 space-y-3 border border-slate-200 dark:border-zinc-700/50">
              <div className="flex items-start space-x-3">
                {isFood ? (
                  <Store className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                ) : (
                  <MapPin className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                )}
                <div className="text-xs">
                  <span className="text-slate-500 dark:text-zinc-500 block">
                    {isFood ? "Warung Kuliner:" : "Jemput:"}
                  </span>
                  <span className="text-slate-800 dark:text-zinc-200 font-medium line-clamp-1">{order.pickupLocation?.address}</span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Navigation className="h-4 w-4 text-rose-500 mt-0.5 shrink-0" />
                <div className="text-xs">
                  <span className="text-slate-500 dark:text-zinc-500 block">Alamat Pengantaran:</span>
                  <span className="text-slate-800 dark:text-zinc-200 font-medium line-clamp-1">{order.dropoffLocation?.address}</span>
                </div>
              </div>

              {/* Food Item Breakdown */}
              {order.items && order.items.length > 0 && (
                <div className="pt-2 border-t border-slate-200 dark:border-zinc-700/50 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Menu Dipesan:</span>
                  {order.items.map((it, i) => (
                    <div key={i} className="flex justify-between text-xs text-slate-700 dark:text-zinc-300">
                      <span>{it.qty}x {it.name}</span>
                      <span className="font-semibold">Rp {(it.price * it.qty).toLocaleString("id-ID")}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 dark:border-zinc-700/50 flex justify-between items-center text-sm">
                <span className="text-slate-500 dark:text-zinc-400">Total Tagihan ({order.paymentMethod === "cash" ? "Tunai" : "QRIS"})</span>
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

        {/* Status: Cooking (Merchant is preparing food) */}
        {order.status === "cooking" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-2xl">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-amber-500/20 rounded-xl text-amber-600 dark:text-amber-400 animate-pulse">
                  <ChefHat className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-amber-700 dark:text-amber-400">
                    Warung Sedang Memasak! 🍳
                  </p>
                  <p className="text-xs text-slate-600 dark:text-zinc-300">
                    Menu pesanan Anda sedang dimasak segar di dapur.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-amber-600 bg-amber-500/20 px-2 py-0.5 rounded-full">
                Estimasi 10-15 mnt
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-zinc-800/60 rounded-2xl p-3.5 space-y-2 border border-slate-200 dark:border-zinc-700/50 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-zinc-400">Status Kurir:</span>
                {order.driverId ? (
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Bike className="h-3.5 w-3.5" /> {order.driverName || "Driver"} sedang OTW ke warung
                  </span>
                ) : (
                  <span className="font-semibold text-amber-600 dark:text-amber-400">
                    Menghubungkan ke kurir terdekat...
                  </span>
                )}
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-zinc-700/50 flex justify-between">
                <span className="text-slate-500 dark:text-zinc-400">Total Pembayaran ({order.paymentMethod === "cash" ? "Tunai COD" : "QRIS"})</span>
                <span className="font-bold text-slate-900 dark:text-white">Rp {order.price.toLocaleString("id-ID")}</span>
              </div>
            </div>
          </div>
        )}

        {/* Status: Ready for Pickup */}
        {order.status === "ready_for_pickup" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-purple-500/10 border border-purple-500/30 p-3.5 rounded-2xl">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-purple-500/20 rounded-xl text-purple-600 dark:text-purple-400">
                  <Package className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-purple-700 dark:text-purple-400">
                    Makanan Sudah Matang! ✅
                  </p>
                  <p className="text-xs text-slate-600 dark:text-zinc-300">
                    Siap di kasir & kurir bersiap mengambil untuk diantar.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-zinc-800/60 rounded-2xl p-3.5 space-y-2 border border-slate-200 dark:border-zinc-700/50 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-zinc-400">Kurir Pengantar:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {order.driverName || "Mitra Driver Solo"}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-zinc-700/50 flex justify-between">
                <span className="text-slate-500 dark:text-zinc-400">Total Tagihan</span>
                <span className="font-bold text-slate-900 dark:text-white">Rp {order.price.toLocaleString("id-ID")}</span>
              </div>
            </div>
          </div>
        )}

        {/* Status: Accepted (Driver heading to stall / pickup) */}
        {order.status === "accepted" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-blue-500/10 border border-blue-500/20 p-3.5 rounded-2xl">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-blue-500/20 rounded-xl text-blue-600 dark:text-blue-400">
                  {isFood ? <Bike className="h-6 w-6" /> : <Bike className="h-6 w-6" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    {isFood ? "Kurir Menuju ke Warung 🛵" : "Mitra Ditemukan!"}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-zinc-300">
                    {isFood ? `Driver ${order.driverName || "Mitra"} sedang menuju ke warung` : "Driver sedang menuju titik penjemputan"}
                  </p>
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
              <span className="text-slate-500 dark:text-zinc-400">Total Tarif ({order.paymentMethod === "cash" ? "Tunai COD" : "QRIS"})</span>
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
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {isFood ? "Kurir Membawa Makanan Anda" : "Sedang Dalam Perjalanan"}
                </p>
                <p className="text-xs text-slate-600 dark:text-zinc-300">Menuju lokasi: {order.dropoffLocation?.address}</p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-zinc-800/60 rounded-2xl p-4 space-y-2 text-sm border border-slate-200 dark:border-zinc-700/50">
              <div className="flex justify-between items-center text-slate-500 dark:text-zinc-400 text-xs">
                <span>Status Pengantaran</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Kurir Sedang OTW</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-zinc-700/50">
                <span className="text-slate-700 dark:text-zinc-300">Tagihan Tunai ke Driver</span>
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
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              {isFood ? "Makanan Telah Diterima!" : "Perjalanan Selesai!"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Terima kasih telah mendukung warung UMKM dan driver lokal Surakarta tanpa potongan komisi.
            </p>

            {/* Rating Section */}
            {!reviewSubmitted && !order.customerRatingForDriver ? (
              <div className="bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700/60 rounded-2xl p-4 space-y-3 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Beri Nilai Pengantaran:</span>
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
                  placeholder="Tulis ulasan untuk mitra kurir & warung..."
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
              onClick={() => router.push("/services/food")}
            >
              Cari Kuliner Lain
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
