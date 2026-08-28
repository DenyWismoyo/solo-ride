"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { useDriverWallet } from "@/hooks/useDriverWallet";
import { usePendingOrders } from "@/hooks/usePendingOrders";
import { useLiveGPS } from "@/hooks/useLiveGPS";
import { authService } from "@/services/auth.service";
import { walletService } from "@/services/wallet.service";
import { orderService } from "@/services/order.service";
import { locationService } from "@/services/location.service";
import { kycService } from "@/services/kyc.service";
import { AppHeader } from "@/components/layout/AppHeader";
import { AdminImpersonationBar } from "@/components/admin/AdminImpersonationBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { ProfileDrawer } from "@/components/layout/ProfileDrawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Loader2, 
  Power, 
  Wallet, 
  Ticket, 
  MapPin, 
  Navigation, 
  Radio, 
  ArrowRight, 
  Sparkles, 
  Coins, 
  History, 
  TrendingUp, 
  ShieldCheck, 
  CheckCircle2, 
  Bike, 
  Package, 
  UtensilsCrossed, 
  Flame, 
  Star,
  PlusCircle,
  FileCheck,
  X,
  CreditCard
} from "lucide-react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";
import { OrderDocument, ServiceType } from "@/types/order.types";
import { DEMAND_HOTSPOTS_SURAKARTA } from "@/constants/merchants";

export default function DriverDashboard() {
  const { user, userData, loading: authLoading } = useAuthContext();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState("radar");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [acceptingOrderId, setAcceptingOrderId] = useState<string | null>(null);

  // Top-Up Wallet Modal State
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState(50000);
  const [isProcessingTopUp, setIsProcessingTopUp] = useState(false);

  // KYC Modal State
  const [isKYCOpen, setIsKYCOpen] = useState(false);
  const [nik, setNik] = useState("");
  const [simNumber, setSimNumber] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("AD ");
  const [vehicleModel, setVehicleModel] = useState("Honda Vario 125cc");
  const [isSubmittingKYC, setIsSubmittingKYC] = useState(false);

  // Service Preferences Filters
  const [acceptRide, setAcceptRide] = useState(true);
  const [acceptSend, setAcceptSend] = useState(true);
  const [acceptFood, setAcceptFood] = useState(true);

  // Compute active filtered service types
  const activeServiceTypes = useMemo<ServiceType[]>(() => {
    const types: ServiceType[] = [];
    if (acceptRide) types.push("ojek", "mobil");
    if (acceptSend) types.push("kirim", "titip");
    if (acceptFood) types.push("kuliner", "pasar", "mart");
    return types;
  }, [acceptRide, acceptSend, acceptFood]);

  // Hook wallet & pending orders with filter
  const { activeKarcis, walletBalance, ledger, loading: walletLoading } = useDriverWallet(user?.uid);
  const { orders: pendingOrders, loading: ordersLoading } = usePendingOrders(activeServiceTypes);

  // Completed driver trips
  const [driverTrips, setDriverTrips] = useState<OrderDocument[]>([]);

  // Auth Protection
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else if (userData?.role !== "driver") {
        router.push("/");
      }
    }
  }, [user, userData, authLoading, router]);

  // Listen to completed driver trips
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, COLLECTIONS.ORDERS),
      where("driverId", "==", user.uid)
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const docs: OrderDocument[] = [];
      snapshot.forEach((d) => docs.push({ id: d.id, ...d.data() } as OrderDocument));
      setDriverTrips(docs);
    });
    return () => unsub();
  }, [user]);

  // Real-time GPS Location Updater
  const { location, error: gpsError, isWithinGeofence, distanceFromCenter } = useLiveGPS();

  useEffect(() => {
    if (!user || !isOnline || !location) return;

    locationService.updateDriverLocation(user.uid, location, true).catch(() => {});
  }, [user, isOnline, location]);

  const handleBuyKarcis = async (isFreeTrial: boolean) => {
    if (!user) return;
    setIsBuying(true);
    try {
      await walletService.buyKarcis(user.uid, isFreeTrial);
      alert(isFreeTrial ? "Karcis Promo Gratis berhasil diaktifkan 24 Jam!" : "Karcis Harian Reguler berhasil dibeli (Rp 5.000 dipotong dari saldo dompet)!");
    } catch (err: any) {
      alert(err.message || "Gagal mengaktifkan karcis.");
    } finally {
      setIsBuying(false);
    }
  };

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsProcessingTopUp(true);
    try {
      const result = await walletService.topUpWallet(user.uid, topUpAmount, `Top-Up Dompet QRIS Koperasi (Rp ${topUpAmount.toLocaleString("id-ID")})`);
      setIsTopUpOpen(false);
      if (result.paymentLink) {
        window.location.href = result.paymentLink; // Redirect ke Mayar Payment Page
      } else {
        alert("Gagal mendapatkan link pembayaran.");
      }
    } catch (err: any) {
      alert(err.message || "Gagal melakukan top-up.");
    } finally {
      setIsProcessingTopUp(false);
    }
  };

  const handleSubmitKYC = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !nik || !simNumber) return;
    setIsSubmittingKYC(true);
    try {
      await kycService.submitKYCRequest({
        userId: user.uid,
        driverName: userData?.displayName || "Mitra Driver",
        driverEmail: user.email || "",
        phone: userData?.phone || "081234567890",
        nik,
        simNumber,
        vehiclePlate,
        vehicleModel,
      });
      setIsKYCOpen(false);
      alert("✅ Dokumen KYC berhasil dikirim! Super Admin / Pengurus Koperasi akan segera memverifikasi akun Anda.");
    } catch (err) {
      alert("Gagal mengirim data KYC.");
    } finally {
      setIsSubmittingKYC(false);
    }
  };

  const handleToggleOnline = () => {
    if (!activeKarcis) {
      alert("Anda harus mengaktifkan Karcis Digital untuk bisa Online.");
      return;
    }
    
    // Geofencing Check
    if (!isOnline) {
      if (gpsError) {
        alert("Gagal mendapatkan lokasi GPS: " + gpsError);
        return;
      }
      if (!location) {
        alert("Menunggu sinyal GPS. Pastikan GPS aktif dan browser diizinkan.");
        return;
      }
      if (!isWithinGeofence) {
        alert(`Anda berada di luar jangkauan operasional Surakarta (Jarak: ${distanceFromCenter?.toFixed(1)} km). Anda harus berada di radius 15 km dari pusat kota.`);
        return;
      }
    }
    
    setIsOnline(!isOnline);
  };

  const handleAcceptOrder = async (order: OrderDocument) => {
    if (!order.id || !user) return;
    setAcceptingOrderId(order.id);
    try {
      await orderService.acceptOrder(order.id, user.uid, order.customerId);
      router.push(`/driver/active-trip/${order.id}`);
    } catch (err) {
      alert("Gagal menerima pesanan. Mungkin pesanan sudah diambil driver lain.");
    } finally {
      setAcceptingOrderId(null);
    }
  };

  if (authLoading || walletLoading || !userData) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-zinc-950 flex-col space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
        <p className="text-sm text-slate-500 dark:text-zinc-400">Memuat Dashboard Mitra...</p>
      </div>
    );
  }

  const isKarcisExpired = !activeKarcis;
  const completedTripsCount = driverTrips.filter((t) => t.status === "completed").length;

  return (
    <div className="relative min-h-[100dvh] bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 flex flex-col justify-between pb-24 transition-colors duration-200">
      {/* Impersonation Bar if Active */}
      <AdminImpersonationBar />

      {/* Header */}
      <AppHeader onOpenProfile={() => setIsProfileOpen(true)} />

      {/* Main Tab: Radar Order */}
      {activeTab === "radar" && (
        <main className="pt-20 px-4 space-y-5 max-w-lg w-full mx-auto flex-1">
          {/* KYC Status Verification Banner */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl ${userData?.isVerified ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/20 text-amber-600 dark:text-amber-400"}`}>
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {userData?.isVerified ? "Mitra Terverifikasi Koperasi" : "Akun Belum Verifikasi KYC"}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                  {userData?.isVerified ? "Status resmi legalitas KTP & SIM aktif" : "Upload KTP & SIM untuk badge resmi"}
                </p>
              </div>
            </div>

            {!userData?.isVerified && (
              <Button
                size="sm"
                onClick={() => setIsKYCOpen(true)}
                className="h-7 text-[11px] bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl cursor-pointer"
              >
                Verifikasi
              </Button>
            )}
          </div>

          {/* Toggle Online/Offline Widget */}
          <div className="flex flex-col items-center justify-center p-7 bg-white/90 dark:bg-zinc-900/90 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm dark:shadow-xl relative overflow-hidden backdrop-blur-xl">
            {isOnline && (
              <div className="absolute inset-0 bg-emerald-500/5 animate-pulse pointer-events-none" />
            )}
            <Button
              size="icon"
              onClick={handleToggleOnline}
              className={`w-28 h-28 rounded-full shadow-2xl transition-all duration-300 relative z-10 cursor-pointer ${
                isOnline 
                  ? "bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 ring-8 ring-emerald-500/20" 
                  : "bg-slate-200 dark:bg-zinc-800 border-4 border-slate-300 dark:border-zinc-700 hover:bg-slate-300 dark:hover:bg-zinc-750"
              }`}
            >
              <Power className={`h-10 w-10 ${isOnline ? "text-white" : "text-slate-400 dark:text-zinc-500"}`} />
            </Button>

            <div className="mt-4 text-center">
              <span className={`text-base font-extrabold tracking-wide ${isOnline ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-zinc-500"}`}>
                {isOnline ? "STATUS: SIAP TERIMA ORDER" : "STATUS: OFFLINE"}
              </span>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                {isOnline 
                  ? "Radar aktif & GPS live memindai order di Surakarta" 
                  : "Tekan tombol power untuk mulai menarik"}
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-white/90 dark:bg-zinc-900/80 border-slate-200 dark:border-zinc-800 p-3.5 rounded-2xl shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">Trip Selesai</p>
                  <p className="text-base font-extrabold text-slate-900 dark:text-white">{completedTripsCount} Trip</p>
                </div>
              </div>
            </Card>

            <Card className={`border p-3.5 rounded-2xl shadow-sm ${
              isKarcisExpired ? 'bg-rose-500/5 border-rose-500/20' : 'bg-emerald-500/5 border-emerald-500/20'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${isKarcisExpired ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}`}>
                  <Ticket className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">Karcis Harian</p>
                  <p className={`text-xs font-bold ${isKarcisExpired ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {isKarcisExpired ? "Non-Aktif" : "Aktif (24 Jam)"}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Service Preference Toggles */}
          <div className="sg-card p-4 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 space-y-2.5 shadow-sm">
            <h4 className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider pl-1">
              Preferensi Layanan Aktif:
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAcceptRide(!acceptRide)}
                className={`p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  acceptRide
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-300"
                    : "bg-slate-100 dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700/60 text-slate-400 dark:text-zinc-500"
                }`}
              >
                <Bike className="h-4 w-4" />
                <span>Ojek Motor</span>
              </button>

              <button
                type="button"
                onClick={() => setAcceptSend(!acceptSend)}
                className={`p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  acceptSend
                    ? "bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-300"
                    : "bg-slate-100 dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700/60 text-slate-400 dark:text-zinc-500"
                }`}
              >
                <Package className="h-4 w-4" />
                <span>Titip/Kirim</span>
              </button>

              <button
                type="button"
                onClick={() => setAcceptFood(!acceptFood)}
                className={`p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  acceptFood
                    ? "bg-orange-500/10 border-orange-500/30 text-orange-600 dark:text-orange-300"
                    : "bg-slate-100 dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700/60 text-slate-400 dark:text-zinc-500"
                }`}
              >
                <UtensilsCrossed className="h-4 w-4" />
                <span>Makanan</span>
              </button>
            </div>
          </div>

          {/* Karcis Promo Activation Banner if expired */}
          {isKarcisExpired && (
            <div className="bg-gradient-to-r from-amber-500/10 via-white dark:via-zinc-900 to-white dark:to-zinc-900 border border-amber-500/30 rounded-3xl p-5 text-center space-y-3 shadow-sm">
              <div className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
                <Sparkles className="h-4 w-4" />
                Karcis Bebas Komisi Belum Aktif
              </div>
              <p className="text-xs text-slate-600 dark:text-zinc-300 max-w-sm mx-auto">
                Aktifkan Karcis sekarang untuk mulai menarik dan menerima order tanpa potongan persentase.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold h-11 rounded-2xl text-[11px] shadow-md cursor-pointer" 
                  onClick={() => handleBuyKarcis(true)}
                  disabled={isBuying}
                >
                  Klaim Trial (Gratis)
                </Button>
                <Button 
                  variant="outline"
                  className="w-full border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 font-bold h-11 rounded-2xl text-[11px] cursor-pointer" 
                  onClick={() => handleBuyKarcis(false)}
                  disabled={isBuying}
                >
                  Beli Karcis (Rp 5.000)
                </Button>
              </div>
            </div>
          )}

          {/* Real-time Incoming Orders Feed */}
          {isOnline && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Radio className="h-4 w-4 text-emerald-500 dark:text-emerald-400 animate-pulse" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white sg-editorial-title">Radar Pesanan Masuk</h3>
                </div>
                <span className="text-[11px] font-semibold text-slate-600 dark:text-zinc-400 bg-slate-200 dark:bg-zinc-800 px-2 py-0.5 rounded-full border border-slate-300 dark:border-zinc-700">
                  {pendingOrders.length} Siap
                </span>
              </div>

              {ordersLoading ? (
                <div className="p-8 text-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl">
                  <Loader2 className="h-6 w-6 text-emerald-500 animate-spin mx-auto mb-2" />
                  <p className="text-xs text-slate-500">Memeriksa radar order...</p>
                </div>
              ) : pendingOrders.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl space-y-2 shadow-sm">
                  <Radio className="h-6 w-6 text-slate-400 dark:text-zinc-600 animate-pulse mx-auto" />
                  <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Menunggu Order Pelanggan</p>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-500 max-w-xs mx-auto">
                    Radar aktif di Surakarta (Solo). Pesanan sesuai preferensi Anda akan muncul di sini secara instan.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingOrders.map((order) => (
                    <div 
                      key={order.id} 
                      className="sg-card sg-hover-lift p-5 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 space-y-3.5 shadow-sm dark:shadow-xl"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <Badge 
                            variant={
                              order.serviceType === "kuliner" ? "orange" :
                              order.serviceType === "kirim" || order.serviceType === "titip" ? "blue" :
                              "emerald"
                            } 
                            size="sm"
                          >
                            {order.serviceType === "kuliner" ? "Kuliner UMKM" :
                             order.serviceType === "kirim" ? "Kirim Kilat" :
                             order.serviceType === "titip" ? "Titip Tetangga" :
                             order.serviceType === "mobil" ? "Mobil Warga" :
                             "Ojek Motor Lokal"}
                          </Badge>
                          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                            Rp {order.price.toLocaleString("id-ID")}
                          </div>
                          {order.items && order.items.length > 0 && (
                            <div className="mt-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                              📦 {order.items.reduce((acc, curr) => acc + curr.qty, 0)} Barang / Menu
                            </div>
                          )}
                        </div>
                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-xl">
                          100% Tunai
                        </span>
                      </div>

                      <div className="space-y-2 border-t border-slate-200 dark:border-zinc-800/80 pt-3">
                        <div className="flex items-start space-x-2.5">
                          <MapPin className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                          <div className="text-xs">
                            <span className="text-slate-400 dark:text-zinc-500 block text-[10px]">Titik Jemput:</span>
                            <span className="text-slate-800 dark:text-zinc-200 font-medium">{order.pickupLocation?.address}</span>
                          </div>
                        </div>
                        <div className="flex items-start space-x-2.5">
                          <Navigation className="h-4 w-4 text-rose-500 mt-0.5 shrink-0" />
                          <div className="text-xs">
                            <span className="text-slate-400 dark:text-zinc-500 block text-[10px]">Tujuan Antar:</span>
                            <span className="text-slate-800 dark:text-zinc-200 font-medium">{order.dropoffLocation?.address}</span>
                          </div>
                        </div>
                      </div>

                      <Button 
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold h-12 rounded-2xl flex items-center justify-center gap-2 text-xs shadow-md cursor-pointer"
                        onClick={() => handleAcceptOrder(order)}
                        disabled={acceptingOrderId === order.id}
                      >
                        {acceptingOrderId === order.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            Terima Pesanan Sekarang
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Surakarta Demand Hotspots Recommendation */}
          <div className="space-y-3 pt-3">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white sg-editorial-title">
                Rekomendasi Area Ramai di Solo
              </h3>
            </div>

            <div className="space-y-2">
              {DEMAND_HOTSPOTS_SURAKARTA.map((spot, idx) => (
                <div 
                  key={idx}
                  className="sg-card p-3 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/80 flex items-center justify-between shadow-sm"
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{spot.name}</p>
                    <p className="text-[10px] text-slate-500 dark:text-zinc-400">Kecamatan: {spot.area}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                      Ramai: {spot.demand}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      {/* Tab: Riwayat Trip */}
      {activeTab === "history" && (
        <main className="pt-20 px-4 space-y-4 max-w-lg w-full mx-auto flex-1">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight sg-editorial-title">
              Riwayat Perjalanan
            </h2>
            <span className="text-xs text-slate-500 dark:text-zinc-400">{driverTrips.length} Total</span>
          </div>

          {driverTrips.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl space-y-2 mt-4 shadow-sm">
              <History className="h-8 w-8 text-slate-400 dark:text-zinc-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Belum Ada Riwayat Trip</p>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Semua pesanan yang telah Anda selesaikan akan otomatis tercatat di buku besar ini.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {driverTrips.map((trip) => (
                <div 
                  key={trip.id}
                  onClick={() => router.push(`/driver/active-trip/${trip.id}`)}
                  className="sg-card sg-hover-lift p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 space-y-2.5 cursor-pointer transition-all shadow-sm"
                >
                  <div className="flex justify-between items-center">
                    <Badge variant={trip.status === "completed" ? "emerald" : "amber"} size="sm">
                      {trip.status}
                    </Badge>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      + Rp {trip.price.toLocaleString("id-ID")}
                    </span>
                  </div>

                  <div className="text-xs space-y-1 text-slate-600 dark:text-zinc-300">
                    <p className="truncate text-slate-500 dark:text-zinc-400">Jemput: <span className="text-slate-800 dark:text-zinc-200">{trip.pickupLocation?.address}</span></p>
                    <p className="truncate text-slate-500 dark:text-zinc-400">Tujuan: <span className="text-slate-800 dark:text-zinc-200">{trip.dropoffLocation?.address}</span></p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      {/* Tab: Dompet & Karcis */}
      {activeTab === "wallet" && (
        <main className="pt-20 px-4 space-y-4 max-w-lg w-full mx-auto flex-1">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight sg-editorial-title">
              Dompet Koperasi & Karcis
            </h2>
            <Button
              size="sm"
              onClick={() => setIsTopUpOpen(true)}
              className="h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl gap-1 cursor-pointer"
            >
              <PlusCircle className="h-3.5 w-3.5" /> Top-Up
            </Button>
          </div>

          <Card className="bg-gradient-to-tr from-emerald-500/10 via-white to-white dark:from-emerald-950/40 dark:via-zinc-900 dark:to-zinc-900 border-emerald-500/20 p-5 rounded-3xl space-y-3 shadow-sm">
            <p className="text-xs text-slate-500 dark:text-zinc-400">Saldo Dompet Koperasi</p>
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              Rp {walletBalance.toLocaleString("id-ID")}
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
              ✓ Semua pendapatan tunai 100% milik Anda tanpa potongan komisi.
            </p>
          </Card>

          <Card className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 p-5 rounded-3xl space-y-3 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Ticket className="h-4 w-4 text-amber-500" />
              Sistem Karcis Harian Flat Fee
            </h3>
            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
              Ride-Solo mengganti sistem potongan per-trip dengan karcis harian flat fee. Anda bebas mengambil sebanyak mungkin order selama masa berlaku karcis aktif.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button
                variant="outline"
                className="w-full border-amber-500/40 text-amber-600 dark:text-amber-400 font-bold text-xs h-11 rounded-xl cursor-pointer"
                onClick={() => handleBuyKarcis(true)}
              >
                Klaim Trial (Gratis)
              </Button>
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-11 rounded-xl cursor-pointer"
                onClick={() => handleBuyKarcis(false)}
              >
                Beli Karcis (Rp 5.000)
              </Button>
            </div>
          </Card>

          {/* Ledger History */}
          <div className="space-y-3 pt-2 pb-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white sg-editorial-title">
              Buku Besar (Riwayat Saldo)
            </h3>
            
            {(!ledger || ledger.length === 0) ? (
              <div className="text-center p-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-sm">
                <History className="h-6 w-6 text-slate-400 dark:text-zinc-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500 dark:text-zinc-400">Belum ada riwayat transaksi dompet.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {ledger.map((tx) => {
                  const isIncome = tx.amount > 0;
                  // Handle optional timestamp safely
                  const date = tx.createdAt?.toDate 
                    ? tx.createdAt.toDate() 
                    : tx.createdAt instanceof Date 
                      ? tx.createdAt 
                      : new Date();

                  return (
                    <div 
                      key={tx.id} 
                      className="sg-card p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 flex justify-between items-center shadow-sm"
                    >
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{tx.description}</p>
                        <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                          {date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <div className={`text-sm font-bold shrink-0 pl-3 ${isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-slate-600 dark:text-slate-300"}`}>
                        {isIncome ? "+" : ""} Rp {Math.abs(tx.amount).toLocaleString("id-ID")}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      )}

      {/* Modal Top-Up Saldo Dompet */}
      {isTopUpOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-emerald-500" />
                Isi Saldo Dompet Koperasi
              </h3>
              <button 
                onClick={() => setIsTopUpOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleTopUp} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-zinc-300">Pilih Nominal Top-Up:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[20000, 50000, 100000].map((nominal) => (
                    <button
                      key={nominal}
                      type="button"
                      onClick={() => setTopUpAmount(nominal)}
                      className={`p-2.5 rounded-xl border font-bold text-center transition-all cursor-pointer ${
                        topUpAmount === nominal
                          ? "bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400"
                          : "bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300"
                      }`}
                    >
                      Rp {nominal.toLocaleString("id-ID")}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-[11px] text-slate-600 dark:text-zinc-300">
                Simulasi pembayaran instan via QRIS Koperasi Surakarta. Saldo dapat dipakai membeli karcis flat harian.
              </div>

              <Button
                type="submit"
                disabled={isProcessingTopUp}
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl cursor-pointer"
              >
                {isProcessingTopUp ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                Konfirmasi Top-Up Rp {topUpAmount.toLocaleString("id-ID")}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Verifikasi KYC Driver */}
      {isKYCOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-amber-500" />
                Verifikasi KYC Mitra Driver
              </h3>
              <button 
                onClick={() => setIsKYCOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitKYC} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-zinc-300">Nomor Induk Kependudukan (NIK KTP):</label>
                <input
                  type="text"
                  placeholder="337201xxxxxxxxxx"
                  value={nik}
                  onChange={(e) => setNik(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-zinc-300">Nomor SIM C:</label>
                <input
                  type="text"
                  placeholder="1234-5678-910111"
                  value={simNumber}
                  onChange={(e) => setSimNumber(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-zinc-300">Plat Nomor:</label>
                  <input
                    type="text"
                    value={vehiclePlate}
                    onChange={(e) => setVehiclePlate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-zinc-300">Tipe Motor:</label>
                  <input
                    type="text"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmittingKYC}
                className="w-full h-11 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl mt-2 cursor-pointer"
              >
                {isSubmittingKYC ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                Kirim Dokumen Verifikasi
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <BottomNav
        role="driver"
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === "profile") {
            setIsProfileOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
      />

      {/* Profile & Account Drawer */}
      <ProfileDrawer 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
      />
    </div>
  );
}
