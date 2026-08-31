"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { useDriverWallet } from "@/hooks/useDriverWallet";
import { usePendingOrders, PendingOrderWithDistance } from "@/hooks/usePendingOrders";
import { useLiveGPS } from "@/hooks/useLiveGPS";
import { useBroadcasts } from "@/hooks/useBroadcasts";
import { authService } from "@/services/auth.service";
import { walletService } from "@/services/wallet.service";
import { orderService } from "@/services/order.service";
import { locationService } from "@/services/location.service";
import { kycService } from "@/services/kyc.service";
import { formatDistance } from "@/lib/geo";
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
  Bike, 
  Package, 
  UtensilsCrossed, 
  Flame, 
  Star, 
  PlusCircle, 
  FileCheck, 
  X, 
  CreditCard, 
  Megaphone, 
  Zap,
  PhoneCall,
  AlertTriangle,
  LogOut,
  Clock,
  Car
} from "lucide-react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";
import { OrderDocument, ServiceType } from "@/types/order.types";
import { DEMAND_HOTSPOTS_SURAKARTA } from "@/constants/merchants";
import { IncomingOrderModal } from "@/components/driver/IncomingOrderModal";
import { playSuccessChime } from "@/lib/sound";

export default function DriverDashboard() {
  const { user, userData, loading: authLoading, effectiveUid, isImpersonating } = useAuthContext();
  const router = useRouter();
  
  const activeDriverUid = effectiveUid || user?.uid;

  const [activeTab, setActiveTab] = useState<"radar" | "income" | "performance" | "partner">("radar");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [hasInitializedOnline, setHasInitializedOnline] = useState(false);
  const [acceptingOrderId, setAcceptingOrderId] = useState<string | null>(null);
  const [autoAccept, setAutoAccept] = useState(false);

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

  // Income Period Filter
  const [incomePeriod, setIncomePeriod] = useState<"today" | "week" | "all">("today");

  // Real-time GPS Location
  const { location, error: gpsError, isWithinGeofence, distanceFromCenter } = useLiveGPS();

  // Skipped orders persistent in sessionStorage
  const [skippedOrderIds, setSkippedOrderIds] = useState<string[]>(() => {
    if (typeof window !== "undefined" && activeDriverUid) {
      try {
        const stored = sessionStorage.getItem("ridesolo_skipped_orders_" + activeDriverUid);
        return stored ? JSON.parse(stored) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  // Service Preferences Filters with localStorage persistence
  const [acceptRide, setAcceptRide] = useState<boolean>(() => {
    if (typeof window !== "undefined" && activeDriverUid) {
      const saved = localStorage.getItem("ridesolo_pref_ride_" + activeDriverUid);
      return saved !== null ? saved === "true" : true;
    }
    return true;
  });
  const [acceptSend, setAcceptSend] = useState<boolean>(() => {
    if (typeof window !== "undefined" && activeDriverUid) {
      const saved = localStorage.getItem("ridesolo_pref_send_" + activeDriverUid);
      return saved !== null ? saved === "true" : true;
    }
    return true;
  });
  const [acceptFood, setAcceptFood] = useState<boolean>(() => {
    if (typeof window !== "undefined" && activeDriverUid) {
      const saved = localStorage.getItem("ridesolo_pref_food_" + activeDriverUid);
      return saved !== null ? saved === "true" : true;
    }
    return true;
  });

  // Toggle Preferences Handlers
  const handleToggleRide = () => {
    setAcceptRide((prev) => {
      const next = !prev;
      if (typeof window !== "undefined" && activeDriverUid) {
        localStorage.setItem("ridesolo_pref_ride_" + activeDriverUid, String(next));
      }
      return next;
    });
  };
  const handleToggleSend = () => {
    setAcceptSend((prev) => {
      const next = !prev;
      if (typeof window !== "undefined" && activeDriverUid) {
        localStorage.setItem("ridesolo_pref_send_" + activeDriverUid, String(next));
      }
      return next;
    });
  };
  const handleToggleFood = () => {
    setAcceptFood((prev) => {
      const next = !prev;
      if (typeof window !== "undefined" && activeDriverUid) {
        localStorage.setItem("ridesolo_pref_food_" + activeDriverUid, String(next));
      }
      return next;
    });
  };

  // Compute active filtered service types
  const activeServiceTypes = useMemo<ServiceType[]>(() => {
    const types: ServiceType[] = [];
    if (acceptRide) types.push("ojek", "mobil", "ride", "car");
    if (acceptSend) types.push("kirim", "titip", "send");
    if (acceptFood) types.push("kuliner", "food", "pasar", "mart");
    return types;
  }, [acceptRide, acceptSend, acceptFood]);

  // Hook wallet & pending orders with filter and proximity support (12 km Solo area)
  const { activeKarcis, walletBalance, ledger, loading: walletLoading } = useDriverWallet(activeDriverUid);
  const { orders: pendingOrders, loading: ordersLoading } = usePendingOrders(activeServiceTypes, location, 12);

  // Civic Broadcasts from Government
  const { broadcasts } = useBroadcasts("driver");

  // Completed driver trips
  const [driverTrips, setDriverTrips] = useState<OrderDocument[]>([]);

  // Restore persistent Online State if driver has active 24-hour karcis
  useEffect(() => {
    if (activeDriverUid && !hasInitializedOnline && !walletLoading) {
      const cached = typeof window !== "undefined" ? localStorage.getItem("ridesolo_driver_online_" + activeDriverUid) : null;
      if (cached !== null) {
        setIsOnline(cached === "true" && !!activeKarcis);
      } else if (activeKarcis) {
        setIsOnline(true);
        if (typeof window !== "undefined") {
          localStorage.setItem("ridesolo_driver_online_" + activeDriverUid, "true");
        }
      }
      setHasInitializedOnline(true);
    }
  }, [activeDriverUid, activeKarcis, hasInitializedOnline, walletLoading]);

  // Auto-activate online whenever a new active ticket is detected
  useEffect(() => {
    if (activeKarcis && activeDriverUid) {
      const cached = typeof window !== "undefined" ? localStorage.getItem("ridesolo_driver_online_" + activeDriverUid) : null;
      if (cached !== "false") {
        setIsOnline(true);
      }
    }
  }, [activeKarcis?.id, activeDriverUid]);

  // Auth & Impersonation Guard
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else if (userData?.role !== "driver" && !isImpersonating) {
        router.push("/");
      }
    }
  }, [user, userData, authLoading, isImpersonating, router]);

  // Listen to driver trips
  useEffect(() => {
    if (!activeDriverUid) return;
    const q = query(
      collection(db, COLLECTIONS.ORDERS),
      where("driverId", "==", activeDriverUid)
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const docs: OrderDocument[] = [];
      snapshot.forEach((d) => docs.push({ id: d.id, ...d.data() } as OrderDocument));
      // Sort newest first
      docs.sort((a, b) => {
        const tA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0);
        const tB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0);
        return tB - tA;
      });
      setDriverTrips(docs);
    });
    return () => unsub();
  }, [activeDriverUid]);

  // Compute active incoming order to show in modal
  const activeIncomingOrder = useMemo(() => {
    if (!isOnline || !activeKarcis) return null;
    return pendingOrders.find((o) => o.id && !skippedOrderIds.includes(o.id)) || null;
  }, [isOnline, activeKarcis, pendingOrders, skippedOrderIds]);

  const handleSkipOrder = (orderId: string) => {
    setSkippedOrderIds((prev) => {
      const updated = [...prev, orderId];
      if (typeof window !== "undefined" && activeDriverUid) {
        sessionStorage.setItem("ridesolo_skipped_orders_" + activeDriverUid, JSON.stringify(updated));
      }
      return updated;
    });
  };

  const handleAcceptOrder = async (order: OrderDocument) => {
    if (!order.id || !user) return;
    setAcceptingOrderId(order.id);
    try {
      await orderService.acceptOrder(
        order.id, 
        user.uid, 
        order.customerId,
        {
          driverName: userData?.displayName || user.displayName || "Mitra Driver Solo",
          driverPhone: userData?.phone || "08123456789"
        }
      );
      playSuccessChime();
      if (activeDriverUid && typeof window !== "undefined") {
        localStorage.setItem("ridesolo_driver_online_" + activeDriverUid, "true");
      }
      router.push(`/driver/active-trip/${order.id}`);
    } catch (err: any) {
      alert(err.message || "Gagal menerima pesanan. Mungkin pesanan sudah diambil driver lain.");
    } finally {
      setAcceptingOrderId(null);
    }
  };

  // Auto-Accept Trigger Effect
  useEffect(() => {
    if (isOnline && autoAccept && activeIncomingOrder && !acceptingOrderId) {
      handleAcceptOrder(activeIncomingOrder);
    }
  }, [isOnline, autoAccept, activeIncomingOrder, acceptingOrderId]);

  // Update Live GPS in background
  useEffect(() => {
    if (!user || !isOnline || !location) return;
    locationService.updateDriverLocation(user.uid, location, true).catch(() => {});
  }, [user, isOnline, location]);

  const handleBuyKarcis = async (isFreeTrial: boolean) => {
    const targetUid = activeDriverUid || user?.uid;
    if (!targetUid) return;
    setIsBuying(true);
    try {
      await walletService.buyKarcis(targetUid, isFreeTrial);
      playSuccessChime();
      setIsOnline(true);
      if (typeof window !== "undefined") {
        localStorage.setItem("ridesolo_driver_online_" + targetUid, "true");
      }
      alert(
        isFreeTrial
          ? "🎉 Karcis Promo Trial Gratis berhasil diaktifkan 24 Jam! Status Anda otomatis ONLINE dan radar pencarian pesanan aktif."
          : "🎉 Karcis Harian Reguler 24 Jam berhasil diaktifkan (Rp 5.000)! Status Anda otomatis ONLINE."
      );
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
      await walletService.devTopUpWallet(topUpAmount);
      setIsTopUpOpen(false);
      alert(`Top-Up Rp ${topUpAmount.toLocaleString("id-ID")} berhasil ditambahkan ke saldo Anda!`);
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
      alert("Anda harus mengaktifkan Karcis Digital untuk bisa Online. Silakan klik 'Klaim Trial (Gratis)' atau 'Beli Karcis'.");
      return;
    }
    
    // Geofencing Check
    if (!isOnline) {
      if (gpsError) {
        console.warn("GPS Warning:", gpsError);
      }
      if (location && !isWithinGeofence) {
        alert(`Anda berada di luar jangkauan operasional Surakarta (Jarak: ${distanceFromCenter?.toFixed(1)} km). Anda harus berada di radius 15 km dari pusat kota.`);
        return;
      }
    }
    
    const nextState = !isOnline;
    setIsOnline(nextState);
    if (activeDriverUid && typeof window !== "undefined") {
      localStorage.setItem("ridesolo_driver_online_" + activeDriverUid, String(nextState));
    }
    if (user && location) {
      locationService.updateDriverLocation(user.uid, location, nextState, null, true).catch(() => {});
    }
  };

  // Remaining Karcis Time Text
  const karcisRemainingText = useMemo(() => {
    if (!activeKarcis || !activeKarcis.expiresAt) return null;
    let expMs = 0;
    if (activeKarcis.expiresAt?.toMillis) {
      expMs = activeKarcis.expiresAt.toMillis();
    } else if (activeKarcis.expiresAt?.seconds) {
      expMs = activeKarcis.expiresAt.seconds * 1000;
    } else if (activeKarcis.expiresAt?.toDate) {
      expMs = activeKarcis.expiresAt.toDate().getTime();
    } else if (activeKarcis.expiresAt instanceof Date) {
      expMs = activeKarcis.expiresAt.getTime();
    } else if (typeof activeKarcis.expiresAt === "string" || typeof activeKarcis.expiresAt === "number") {
      expMs = new Date(activeKarcis.expiresAt).getTime();
    }
    const diffMs = expMs - Date.now();
    if (diffMs <= 0) return "Segera berakhir";
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) {
      return `Sisa ${hours}j ${minutes}m`;
    }
    return `Sisa ${minutes}m`;
  }, [activeKarcis]);

  if (authLoading || walletLoading || !userData) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-zinc-950 flex-col space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
        <p className="text-sm text-slate-500 dark:text-zinc-400">Memuat Dashboard Mitra...</p>
      </div>
    );
  }

  const isKarcisExpired = !activeKarcis;
  const completedTrips = driverTrips.filter((t) => t.status === "completed");
  const completedTripsCount = completedTrips.length;
  
  // Calculate financial metrics based on selected period
  const filteredCompletedTrips = completedTrips.filter((t) => {
    if (incomePeriod === "all") return true;
    const now = new Date();
    const created = t.createdAt?.toMillis ? t.createdAt.toMillis() : (t.createdAt?.toDate ? t.createdAt.toDate().getTime() : 0);
    if (incomePeriod === "today") {
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      return created >= startOfToday;
    }
    if (incomePeriod === "week") {
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      return created >= sevenDaysAgo;
    }
    return true;
  });

  const periodGrossIncome = filteredCompletedTrips.reduce((acc, t) => acc + (t.price || 0), 0);
  const totalGrossIncome = completedTrips.reduce((acc, t) => acc + (t.price || 0), 0);
  const driverPoints = userData?.points || (completedTripsCount * 10);
  const estimatedSHU = Math.round(driverPoints * 250); // Estimasi Dividen SHU Koperasi Solo
  const driverRating = (userData as any)?.rating || 4.9;
  const driverCompletionRate = (userData as any)?.completionRate || (
    driverTrips.length > 0 
      ? ((completedTrips.length / driverTrips.length) * 100).toFixed(1) + "%"
      : "100%"
  );

  return (
    <div className="relative min-h-[100dvh] bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 flex flex-col justify-between pb-24 transition-colors duration-200">
      {/* Impersonation Bar if Active */}
      <AdminImpersonationBar />

      {/* Header */}
      <AppHeader onOpenProfile={() => setIsProfileOpen(true)} />

      {/* ========================================================================= */}
      {/* TAB 1: 📡 RADAR (OPERASIONAL & TARIKAN) */}
      {/* ========================================================================= */}
      {activeTab === "radar" && (
        <main className="pt-20 px-4 space-y-5 max-w-lg w-full mx-auto flex-1">
          {/* Active Civic Broadcast Ticker if available */}
          {broadcasts.length > 0 && (
            <div className="p-3 rounded-2xl bg-teal-500/10 dark:bg-teal-950/30 border border-teal-500/30 flex items-start gap-2.5 shadow-sm">
              <Megaphone className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5 animate-bounce" />
              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-teal-700 dark:text-teal-300 leading-tight">
                    {broadcasts[0].title}
                  </span>
                  <span className="text-[9px] font-bold text-teal-600 dark:text-teal-400 bg-teal-500/20 px-1.5 py-0.2 rounded">
                    Pemda
                  </span>
                </div>
                <p className="text-[10px] text-slate-600 dark:text-zinc-300 line-clamp-2">
                  {broadcasts[0].body}
                </p>
              </div>
            </div>
          )}

          {/* GPS Warning Banner if Online but GPS Issue */}
          {isOnline && (gpsError || !location) && (
            <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center gap-2.5 shadow-sm text-amber-800 dark:text-amber-300">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
              <p className="text-xs">
                {gpsError 
                  ? "Sinyal GPS belum optimal. Aktifkan izin lokasi agar radar jarak akurat."
                  : "Mendeteksi posisi GPS Anda..."}
              </p>
            </div>
          )}

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
                  {userData?.isVerified ? "Status legalitas KTP & SIM aktif" : "Upload KTP & SIM untuk verifikasi"}
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
                    {isKarcisExpired ? "Non-Aktif" : (karcisRemainingText ? `Aktif (${karcisRemainingText})` : "Aktif (24 Jam)")}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Service Preference Toggles */}
          <div className="sg-card p-4 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 space-y-3 shadow-sm">
            <h4 className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider pl-1">
              Preferensi Layanan Aktif:
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={handleToggleRide}
                className={`p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  acceptRide
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-300"
                    : "bg-slate-100 dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700/60 text-slate-400 dark:text-zinc-500"
                }`}
              >
                <Bike className="h-4 w-4" />
                <span>Ojek/Mobil</span>
              </button>

              <button
                type="button"
                onClick={handleToggleSend}
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
                onClick={handleToggleFood}
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

            {/* Auto-Accept Toggle Switch */}
            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-xl ${autoAccept ? "bg-emerald-500/20 text-emerald-500 animate-pulse" : "bg-slate-100 dark:bg-zinc-800 text-slate-400"}`}>
                  <Zap className="h-3.5 w-3.5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Mode Auto-Accept (Terima Instan)
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400">
                    {autoAccept ? "Otomatis mengambil order pertama yang cocok" : "Tampilkan konfirmasi pop-up 30 detik"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAutoAccept(!autoAccept)}
                className={`w-11 h-6 rounded-full transition-colors cursor-pointer p-0.5 relative shrink-0 ${
                  autoAccept ? "bg-emerald-500 shadow-md shadow-emerald-500/30" : "bg-slate-300 dark:bg-zinc-700"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    autoAccept ? "translate-x-5" : "translate-x-0"
                  }`}
                />
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
                  {pendingOrders.map((order: PendingOrderWithDistance) => (
                    <div 
                      key={order.id} 
                      className="sg-card sg-hover-lift p-5 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 space-y-3.5 shadow-sm dark:shadow-xl"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
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

                            {order.distanceToPickupKm !== undefined && (
                              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                ~{formatDistance(order.distanceToPickupKm)}
                              </span>
                            )}
                          </div>
                          
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

      {/* ========================================================================= */}
      {/* TAB 2: 💰 PENDAPATAN (DOMPET & KARCIS FLAT FEE) */}
      {/* ========================================================================= */}
      {activeTab === "income" && (
        <main className="pt-20 px-4 space-y-5 max-w-lg w-full mx-auto flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight sg-editorial-title">
                Dompet & Karcis Mitra
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Transparansi 100% tunai tanpa potongan per-trip</p>
            </div>
            <Button
              size="sm"
              onClick={() => setIsTopUpOpen(true)}
              className="h-9 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl gap-1.5 shadow-md cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" /> Isi Saldo
            </Button>
          </div>

          {/* Period Filter Toggle */}
          <div className="flex bg-slate-200/80 dark:bg-zinc-800/80 p-1 rounded-2xl border border-slate-300/60 dark:border-zinc-700/60 text-xs font-bold">
            <button
              type="button"
              onClick={() => setIncomePeriod("today")}
              className={`flex-1 py-1.5 rounded-xl transition-all cursor-pointer ${
                incomePeriod === "today" 
                  ? "bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-sm" 
                  : "text-slate-500 dark:text-zinc-400"
              }`}
            >
              Hari Ini
            </button>
            <button
              type="button"
              onClick={() => setIncomePeriod("week")}
              className={`flex-1 py-1.5 rounded-xl transition-all cursor-pointer ${
                incomePeriod === "week" 
                  ? "bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-sm" 
                  : "text-slate-500 dark:text-zinc-400"
              }`}
            >
              7 Hari
            </button>
            <button
              type="button"
              onClick={() => setIncomePeriod("all")}
              className={`flex-1 py-1.5 rounded-xl transition-all cursor-pointer ${
                incomePeriod === "all" 
                  ? "bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-sm" 
                  : "text-slate-500 dark:text-zinc-400"
              }`}
            >
              Semua
            </button>
          </div>

          {/* Income Highlights Cards */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-gradient-to-tr from-emerald-500/10 via-white to-white dark:from-emerald-950/40 dark:via-zinc-900 dark:to-zinc-900 border-emerald-500/20 p-4 rounded-3xl space-y-1 shadow-sm">
              <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                {incomePeriod === "today" ? "Omzet Hari Ini" : incomePeriod === "week" ? "Omzet 7 Hari" : "Total Omzet Tunai"}
              </span>
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                Rp {periodGrossIncome.toLocaleString("id-ID")}
              </div>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400">Dari {filteredCompletedTrips.length} trip selesai</p>
            </Card>

            <Card className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 p-4 rounded-3xl space-y-1 shadow-sm">
              <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                Saldo Dompet Koperasi
              </span>
              <div className="text-xl font-black text-slate-900 dark:text-white">
                Rp {walletBalance.toLocaleString("id-ID")}
              </div>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Bebas penarikan tunai</p>
            </Card>
          </div>

          {/* Karcis Harian Flat Status Card */}
          <Card className="bg-white/95 dark:bg-zinc-900/95 border-slate-200 dark:border-zinc-800 p-5 rounded-3xl space-y-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                  <Ticket className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Karcis Harian Flat Rp 5.000</h3>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                    {karcisRemainingText ? `Aktif (${karcisRemainingText})` : "1 Karcis aktif = bebas narik 24 jam"}
                  </p>
                </div>
              </div>
              <Badge variant={isKarcisExpired ? "rose" : "emerald"} size="sm">
                {isKarcisExpired ? "Kadaluarsa" : "Aktif 24 Jam"}
              </Badge>
            </div>

            <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
              Anda tidak dipotong komisi 20-30% per order. Cukup dengan karcis flat harian, 100% uang tunai dari pelanggan masuk langsung ke kantong Anda.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button
                variant="outline"
                className="w-full border-amber-500/40 text-amber-600 dark:text-amber-400 font-bold text-xs h-11 rounded-2xl cursor-pointer"
                onClick={() => handleBuyKarcis(true)}
              >
                Klaim Promo Trial (Gratis)
              </Button>
              <Button
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs h-11 rounded-2xl cursor-pointer shadow-md"
                onClick={() => handleBuyKarcis(false)}
              >
                Beli Karcis (Rp 5.000)
              </Button>
            </div>
          </Card>

          {/* Ledger History */}
          <div className="space-y-3 pt-2 pb-6">
            <div className="flex items-center justify-between pl-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white sg-editorial-title flex items-center gap-2">
                <History className="h-4 w-4 text-emerald-500" /> Buku Besar (Mutasi Saldo)
              </h3>
              <span className="text-[11px] text-slate-400">{ledger?.length || 0} Catatan</span>
            </div>
            
            {(!ledger || ledger.length === 0) ? (
              <div className="text-center p-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-sm">
                <History className="h-6 w-6 text-slate-400 dark:text-zinc-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500 dark:text-zinc-400">Belum ada riwayat transaksi dompet.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {ledger.map((tx) => {
                  const isIncome = tx.amount > 0;
                  const date = tx.createdAt?.toDate 
                    ? tx.createdAt.toDate() 
                    : tx.createdAt instanceof Date 
                      ? tx.createdAt 
                      : new Date();

                  return (
                    <div 
                      key={tx.id} 
                      className="sg-card p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 flex justify-between items-center shadow-sm"
                    >
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{tx.description}</p>
                        <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                          {date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <div className={`text-xs font-black shrink-0 pl-3 ${isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
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

      {/* ========================================================================= */}
      {/* TAB 3: 📊 PERFORMA (STATISTIK, RATING & SHU KOPERASI) */}
      {/* ========================================================================= */}
      {activeTab === "performance" && (
        <main className="pt-20 px-4 space-y-5 max-w-lg w-full mx-auto flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight sg-editorial-title">
                Performa & Dividen SHU
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Pencapaian kerja & royalti komunitas koperasi</p>
            </div>
            <Badge variant="emerald" className="text-xs font-bold px-2.5 py-1">
              ⭐ {driverRating} Teruji
            </Badge>
          </div>

          {/* Performance Overview Cards */}
          <div className="grid grid-cols-3 gap-2.5">
            <Card className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-center space-y-1 shadow-sm">
              <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase block">Rating Warga</span>
              <div className="text-base font-black text-amber-500 flex items-center justify-center gap-1">
                <Star className="h-4 w-4 fill-current" /> {driverRating}
              </div>
              <span className="text-[9px] text-slate-400 block">100% Positif</span>
            </Card>

            <Card className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-center space-y-1 shadow-sm">
              <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase block">Penyelesaian</span>
              <div className="text-base font-black text-emerald-600 dark:text-emerald-400">
                {driverCompletionRate}
              </div>
              <span className="text-[9px] text-slate-400 block">Sangat Baik</span>
            </Card>

            <Card className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-center space-y-1 shadow-sm">
              <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase block">Total Trip</span>
              <div className="text-base font-black text-slate-900 dark:text-white">
                {completedTripsCount}
              </div>
              <span className="text-[9px] text-slate-400 block">Selesai</span>
            </Card>
          </div>

          {/* Cooperative SHU Royalty Dividend Calculator */}
          <Card className="bg-gradient-to-r from-amber-500/10 via-white dark:via-zinc-900 to-amber-500/10 border border-amber-500/30 p-5 rounded-3xl space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
                  <Coins className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Poin Dividen SHU Koperasi</h3>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400">Dihitung dari loyalitas narik di Surakarta</p>
                </div>
              </div>
              <span className="text-xs font-black bg-amber-500/20 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-xl">
                {driverPoints} Poin
              </span>
            </div>

            <div className="p-3.5 bg-white/80 dark:bg-zinc-800/80 rounded-2xl border border-amber-500/20 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 block">
                  Estimasi Bagian SHU Koperasi (Tahunan):
                </span>
                <span className="text-lg font-black text-amber-600 dark:text-amber-400">
                  Rp {estimatedSHU.toLocaleString("id-ID")}
                </span>
              </div>
              <Badge variant="amber" size="sm">Bagi Hasil</Badge>
            </div>

            <p className="text-[11px] text-slate-600 dark:text-zinc-400">
              Setiap 1 order selesai menghasilkan +10 poin stamp. Poin dapat ditukar diskon di UMKM lokal atau dicairkan sebagai SHU Koperasi di akhir tahun buku.
            </p>
          </Card>

          {/* Trip History Feed */}
          <div className="space-y-3 pt-2 pb-6">
            <div className="flex items-center justify-between pl-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white sg-editorial-title flex items-center gap-2">
                <History className="h-4 w-4 text-emerald-500" /> Riwayat Perjalanan
              </h3>
              <span className="text-[11px] text-slate-400">{driverTrips.length} Total</span>
            </div>

            {driverTrips.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl space-y-2 mt-2 shadow-sm">
                <History className="h-8 w-8 text-slate-400 dark:text-zinc-500 mx-auto mb-1" />
                <p className="text-xs font-bold text-slate-700 dark:text-zinc-300">Belum Ada Riwayat Trip</p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Setiap pesanan yang Anda selesaikan akan otomatis tersimpan di sini.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {driverTrips.map((trip) => (
                  <div 
                    key={trip.id} 
                    onClick={() => router.push(`/driver/active-trip/${trip.id}`)}
                    className="sg-card p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 space-y-2 cursor-pointer hover:border-emerald-500/40 transition-colors shadow-sm"
                  >
                    <div className="flex justify-between items-center">
                      <Badge variant={trip.status === "completed" ? "emerald" : trip.status === "cancelled" ? "rose" : "amber"} size="sm">
                        {trip.serviceType === "kuliner" ? "Kuliner" : trip.serviceType === "kirim" ? "Kirim" : "Ojek"} • {trip.status === "completed" ? "Selesai" : trip.status === "cancelled" ? "Dibatalkan" : trip.status}
                      </Badge>
                      <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                        + Rp {trip.price.toLocaleString("id-ID")}
                      </span>
                    </div>

                    <div className="text-xs space-y-1 text-slate-600 dark:text-zinc-300 pt-1">
                      <p className="truncate text-slate-500 dark:text-zinc-400">🟢 <span className="text-slate-800 dark:text-zinc-200">{trip.pickupLocation?.address}</span></p>
                      <p className="truncate text-slate-500 dark:text-zinc-400">🔴 <span className="text-slate-800 dark:text-zinc-200">{trip.dropoffLocation?.address}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: 🛡️ MITRA (PROFIL, LEGALITAS KYC & BANTUAN DARURAT) */}
      {/* ========================================================================= */}
      {activeTab === "partner" && (
        <main className="pt-20 px-4 space-y-5 max-w-lg w-full mx-auto flex-1 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight sg-editorial-title">
                Akun & Legalitas Mitra
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Identitas resmi & bantuan darurat di jalan</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => authService.logout().then(() => router.push("/login"))}
              className="h-8 text-xs text-rose-500 hover:bg-rose-500/10 border-rose-500/30 rounded-xl gap-1 cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" /> Keluar
            </Button>
          </div>

          {/* Digital Member Card (KTA Digital Koperasi) */}
          <div className="relative rounded-3xl overflow-hidden p-5 bg-gradient-to-tr from-slate-900 via-zinc-900 to-emerald-950 text-white shadow-2xl border border-emerald-500/30 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] font-extrabold text-emerald-400 uppercase tracking-widest bg-emerald-500/20 px-2 py-0.5 rounded-md">
                  KTA DIGITAL MITRA RIDE-SOLO
                </span>
                <h3 className="text-base font-black mt-2 text-white">
                  {userData.displayName || "Mitra Pengemudi"}
                </h3>
                <p className="text-xs text-slate-400 font-mono">ID: {user?.uid.slice(0, 8).toUpperCase()}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-black text-xl">
                🛵
              </div>
            </div>

            <div className="pt-3 border-t border-slate-700/60 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Plat Kendaraan:</span>
                <span className="font-bold text-white font-mono">{(userData as any).vehiclePlate || vehiclePlate || "AD 4821 QA"}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Status Anggota:</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" /> Aktif Koperasi
                </span>
              </div>
            </div>
          </div>

          {/* KYC Legal Verification Status Card */}
          <Card className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                  <FileCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Dokumen Legalitas (KYC)</h3>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400">Verifikasi KTP & SIM Resmi</p>
                </div>
              </div>
              <Badge variant={userData.isVerified ? "emerald" : "amber"} size="sm">
                {userData.isVerified ? "Terverifikasi" : "Pending Verifikasi"}
              </Badge>
            </div>

            <div className="space-y-2 text-xs text-slate-600 dark:text-zinc-300 pt-1">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-zinc-800">
                <span className="text-slate-500">Kartu Tanda Penduduk (KTP)</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">✓ Sesuai Domisili Solo</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-500">Surat Izin Mengemudi (SIM)</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">✓ SIM C Aktif</span>
              </div>
            </div>

            {!userData.isVerified && (
              <Button
                onClick={() => setIsKYCOpen(true)}
                className="w-full h-11 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-2xl text-xs cursor-pointer shadow-md"
              >
                Upload / Lengkapi Dokumen KYC
              </Button>
            )}
          </Card>

          {/* Emergency Safety & Satgas Assistance */}
          <Card className="p-5 rounded-3xl bg-rose-500/5 dark:bg-rose-950/20 border-rose-500/30 space-y-3 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-rose-700 dark:text-rose-300">Bantuan Darurat Satgas Solo</h3>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400">Mogok mesin, kecelakaan, atau kendala di jalan</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-zinc-300">
              Tim Satgas Koperasi siap mendampingi mitra driver 24 jam di seluruh wilayah Solo Raya.
            </p>

            <Button
              variant="outline"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.location.href = "tel:081234567890";
                }
              }}
              className="w-full h-11 border-rose-500/50 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <PhoneCall className="h-4 w-4" /> Hubungi Satgas Darurat (0812-3456-7890)
            </Button>
          </Card>

          {/* Basecamp & Posko Mitra Surakarta */}
          <div className="space-y-2.5 pt-1">
            <h4 className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider pl-1">
              Posko & Titik Kumpul Mitra Surakarta:
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">📍 Posko Manahan</span>
                <span className="text-[10px] text-slate-500 dark:text-zinc-400">Shelter Barat Stadion Manahan</span>
              </div>
              <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">📍 Posko Balapan</span>
                <span className="text-[10px] text-slate-500 dark:text-zinc-400">Jl. Wolter Monginsidi</span>
              </div>
            </div>
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
                <label className="font-bold text-slate-700 dark:text-zinc-300">Nomor SIM C/A:</label>
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
                  <label className="font-bold text-slate-700 dark:text-zinc-300">Tipe Motor/Mobil:</label>
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

      {/* Real-time Incoming Order Hero Modal */}
      <IncomingOrderModal 
        order={!autoAccept ? activeIncomingOrder : null}
        onAccept={handleAcceptOrder}
        onSkip={handleSkipOrder}
      />

      {/* Bottom Nav */}
      <BottomNav
        role="driver"
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === "profile") {
            setIsProfileOpen(true);
          } else {
            setActiveTab(tab as any);
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
