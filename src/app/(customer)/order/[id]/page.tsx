"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { useOrder } from "@/hooks/useOrder";
import { useDriverLocation } from "@/hooks/useLocation";
import { orderService } from "@/services/order.service";
import { reviewService } from "@/services/review.service";
import { RouteMap } from "@/components/map/RouteMap";
import { LiveTrackingSimulator } from "@/components/map/LiveTrackingSimulator";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Receipt, Loader2, XCircle } from "lucide-react";
import { playSuccessChime } from "@/lib/sound";
import { CivicOutputViewer } from "@/components/civic/output/CivicOutputViewer";
import { OrderReceiptDrawerModal } from "@/components/order/OrderReceiptDrawerModal";
import { OrderStatusLiveCard } from "@/components/order/OrderStatusLiveCard";
import { MultiRatingReviewModal } from "@/components/history/MultiRatingReviewModal";
import { toast } from "@/components/ui/toast";


export default function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;
  
  const router = useRouter();
  const { user, userData, loading: authLoading } = useAuthContext();
  const { order, loading: orderLoading, error } = useOrder(orderId);
  const { driverLocation } = useDriverLocation(order?.driverId);

  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [simulatedLocation, setSimulatedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showReceiptDrawer, setShowReceiptDrawer] = useState(false);

  // Review & Rating State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Dynamic 2-Phase Routing calculation
  useEffect(() => {
    if (!order?.pickupLocation || !order?.dropoffLocation || typeof window === "undefined" || !window.google?.maps) return;

    let origin = { lat: order.pickupLocation.lat, lng: order.pickupLocation.lng };
    let destination = { lat: order.dropoffLocation.lat, lng: order.dropoffLocation.lng };

    // Phase 1 (Accepted): Rute dari posisi driver menuju titik jemput
    if (order.status === "accepted" && driverLocation?.location) {
      origin = { lat: driverLocation.location.lat, lng: driverLocation.location.lng };
      destination = { lat: order.pickupLocation.lat, lng: order.pickupLocation.lng };
    } 
    // Phase 2 (In Progress): Rute menuju titik dropoff
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
    setIsCancelling(true);
    try {
      await orderService.cancelOrder(orderId, user?.uid);
      toast.info("Pesanan Dibatalkan", {
        description: "Pesanan telah berhasil dibatalkan."
      });
    } catch (err: any) {
      toast.error("Gagal Membatalkan Pesanan", {
        description: err.message || "Terjadi kesalahan sistem."
      });
    } finally {
      setIsCancelling(false);
    }
  };


  const handleSubmitReview = async (rating: number, comment: string) => {
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
        comment: comment || "Pelayanan pengantaran sangat baik dan ramah!"
      });
      setReviewSubmitted(true);
      setIsReviewModalOpen(false);
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

  return (
    <div className="relative h-[100dvh] w-full bg-slate-950 overflow-hidden flex flex-col justify-between">
      {/* Floating Header Actions */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
        <button 
          type="button"
          className="sg-floating-btn h-10 w-10 shadow-lg pointer-events-auto"
          onClick={() => router.push("/")}
          title="Kembali ke Beranda"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        
        <button
          onClick={() => setShowReceiptDrawer(true)}
          className="bg-white/90 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 px-3 py-1.5 rounded-full backdrop-blur-md text-xs font-bold text-slate-800 dark:text-zinc-200 shadow-md flex items-center gap-1.5 pointer-events-auto cursor-pointer"
        >
          <Receipt className="h-3.5 w-3.5 text-orange-500" />
          <span>Rincian Tagihan</span>
        </button>
      </div>

      {/* Live Route Map */}
      <div className="absolute inset-0 z-0">
        <RouteMap
          pickup={order.pickupLocation}
          dropoff={order.dropoffLocation}
          driverLocation={simulatedLocation || driverLocation?.location}
          directions={directions}
          polylineColor={isFood ? "#f97316" : "#10b981"}
          className="w-full h-full"
        />
      </div>

      {/* Bottom Sheet Control Panel */}
      <div className="z-10 mt-auto bg-white/95 dark:bg-[#0c1220]/95 border-t border-slate-200 dark:border-white/[0.08] rounded-t-3xl shadow-2xl p-5 backdrop-blur-md max-w-lg w-full mx-auto space-y-4">
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-zinc-700 rounded-full mx-auto" />

        {/* Live Route Tracking Simulator during Accepted / In-Progress */}
        {(order.status === "accepted" || order.status === "in_progress") && (
          <LiveTrackingSimulator
            directions={directions}
            status={order.status}
            driverName={order.driverName || "Mitra Driver Solo"}
            driverPhone={order.driverPhone || "081234567890"}
            vehiclePlate={order.vehiclePlate || "AD 4821 QA"}
            vehicleModel={order.vehicleModel || "Honda Vario 160 Hitam"}
            onPositionChange={(pos) => setSimulatedLocation(pos)}
          />
        )}

        {/* Multi-Modal Output Viewer for Government Orders */}
        {(order.targetRole === "government" || (order.additionalRole && order.additionalRole.startsWith("gov_"))) && (
          <div>
            <CivicOutputViewer order={order} />
          </div>
        )}

        {/* OTP Display for Document Handover */}
        {!order.targetRole?.includes("government") && order.otpCode && order.status !== "completed" && order.status !== "cancelled" && (
          <div className="bg-blue-50/90 dark:bg-blue-900/40 p-3.5 rounded-2xl border border-blue-200 dark:border-blue-800 backdrop-blur-md flex items-center justify-between shadow-xs">
            <div>
              <p className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-0.5">OTP Serah Terima</p>
              <p className="text-[10px] text-blue-600/80 dark:text-blue-300/80">Berikan ke kurir / petugas dinas</p>
            </div>
            <div className="font-mono text-xl font-black tracking-widest text-blue-700 dark:text-blue-300 bg-white dark:bg-zinc-900 px-3 py-1 rounded-xl shadow-xs">
              {order.otpCode}
            </div>
          </div>
        )}

        {/* Order Status Live Component */}
        <OrderStatusLiveCard
          order={order}
          isFood={isFood}
          onCancelOrder={handleCancelOrder}
          isCancelling={isCancelling}
          onOpenReviewModal={() => setIsReviewModalOpen(true)}
          reviewSubmitted={reviewSubmitted}
        />
      </div>

      {/* Digital Receipt Breakdown Drawer */}
      <OrderReceiptDrawerModal
        isOpen={showReceiptDrawer}
        onClose={() => setShowReceiptDrawer(false)}
        order={order}
      />

      {/* Review & Rating Modal */}
      {order && (
        <MultiRatingReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          order={order}
          onReviewSubmitted={() => setReviewSubmitted(true)}
        />
      )}
    </div>
  );
}
