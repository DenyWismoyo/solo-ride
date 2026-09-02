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
import { AppHeader } from "@/components/layout/AppHeader";
import { AdminImpersonationBar } from "@/components/admin/AdminImpersonationBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { ProfileDrawer } from "@/components/layout/ProfileDrawer";
import { DriverRadarTab } from "@/components/driver/radar/DriverRadarTab";
import { DriverIncomeTab } from "@/components/driver/income/DriverIncomeTab";
import { DriverPerformanceTab } from "@/components/driver/performance/DriverPerformanceTab";
import { DriverPartnerTab } from "@/components/driver/partner/DriverPartnerTab";
import { TopupWalletModal } from "@/components/driver/modals/TopupWalletModal";
import { KycUploadModal } from "@/components/driver/modals/KycUploadModal";
import { IncomingOrderModal } from "@/components/driver/IncomingOrderModal";
import { HistoryDetailReceiptModal } from "@/components/history/HistoryDetailReceiptModal";
import { UnifiedHistoryModal } from "@/components/history/UnifiedHistoryModal";
import { DemandHotspot } from "@/constants/geofencing";
import { DEFAULT_CENTER } from "@/constants/maps";
import { playOrderAlertSound, playSuccessChime } from "@/lib/sound";
import { OrderDocument, ServiceType } from "@/types/order.types";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";
import { Loader2 } from "lucide-react";

export default function DriverDashboardPage() {
  const router = useRouter();
  const { user, userData, loading: authLoading } = useAuthContext();
  const activeDriverUid = user?.uid || "";
  const { activeKarcis } = useDriverWallet(activeDriverUid);
  const { location } = useLiveGPS();
  const { broadcasts } = useBroadcasts("driver");

  // Navigation State
  const [activeTab, setActiveTab] = useState<"radar" | "income" | "performance" | "partner">("radar");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>("all");
  const [focusedHotspot, setFocusedHotspot] = useState<DemandHotspot | null>(null);

  // Preference Toggles
  const [acceptRide, setAcceptRide] = useState(true);
  const [acceptSend, setAcceptSend] = useState(true);
  const [acceptFood, setAcceptFood] = useState(true);
  const [autoAccept, setAutoAccept] = useState(false);

  // Status & Orders
  const [isOnline, setIsOnline] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isBuyingKarcis, setIsBuyingKarcis] = useState(false);
  const [acceptingOrderId, setAcceptingOrderId] = useState<string | null>(null);
  const [activeIncomingOrder, setActiveIncomingOrder] = useState<PendingOrderWithDistance | null>(null);
  const [skippedOrderIds, setSkippedOrderIds] = useState<Set<string>>(new Set());

  // Modals
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [isProcessingTopUp, setIsProcessingTopUp] = useState(false);
  const [isKYCOpen, setIsKYCOpen] = useState(false);
  const [isSubmittingKYC, setIsSubmittingKYC] = useState(false);
  const [selectedTripForReceipt, setSelectedTripForReceipt] = useState<OrderDocument | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Filter allowed services
  const allowedServices = useMemo(() => {
    const list: ServiceType[] = [];
    if (acceptRide) { list.push("ojek"); list.push("mobil"); }
    if (acceptSend) { list.push("kirim"); list.push("titip"); }
    if (acceptFood) { list.push("kuliner"); }
    return list;
  }, [acceptRide, acceptSend, acceptFood]);

  const isKarcisExpired = !activeKarcis;

  const { orders: pendingOrders, loading: ordersLoading } = usePendingOrders(
    allowedServices,
    location
  );

  // Trips History for Driver
  const [driverTrips, setDriverTrips] = useState<OrderDocument[]>([]);
  useEffect(() => {
    if (!activeDriverUid) return;
    const q = query(
      collection(db, COLLECTIONS.ORDERS),
      where("driverId", "==", activeDriverUid)
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const trips = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as OrderDocument));
      setDriverTrips(trips);
    });
    return () => unsub();
  }, [activeDriverUid]);

  // Initial Sync from Profile
  useEffect(() => {
    if (userData) {
      if ((userData as any).isOnline !== undefined) {
        setIsOnline((userData as any).isOnline);
      }
    }
  }, [userData]);

  // Incoming Order Dispatch Loop
  useEffect(() => {
    if (!isOnline || isKarcisExpired) {
      setActiveIncomingOrder(null);
      return;
    }

    const available = pendingOrders.find(o => o.id && !skippedOrderIds.has(o.id));
    if (available && (!activeIncomingOrder || activeIncomingOrder.id !== available.id)) {
      setActiveIncomingOrder(available);
      playOrderAlertSound();

      if (autoAccept) {
        handleAcceptOrder(available);
      }
    } else if (!available) {
      setActiveIncomingOrder(null);
    }
  }, [pendingOrders, skippedOrderIds, isOnline, isKarcisExpired, autoAccept]);

  // Handlers
  const handleToggleOnline = async () => {
    if (!activeDriverUid) return;
    setIsUpdatingStatus(true);
    try {
      const nextStatus = !isOnline;
      await locationService.updateDriverLocation(
        activeDriverUid,
        location || DEFAULT_CENTER,
        nextStatus,
        null,
        true
      );
      setIsOnline(nextStatus);
    } catch (err: any) {
      alert(`Gagal mengubah status online: ${err.message}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAcceptOrder = async (order: PendingOrderWithDistance) => {
    if (!user || !userData || !order.id) return;
    setAcceptingOrderId(order.id);
    try {
      await orderService.acceptOrder(
        order.id, 
        user.uid, 
        userData.displayName || "Mitra Driver",
        (userData as any).vehiclePlate || "AD 4821 QA"
      );
      playSuccessChime();
      setActiveIncomingOrder(null);
      router.push(`/driver/active-trip/${order.id}`);
    } catch (err: any) {
      alert(err.message || "Gagal mengambil pesanan");
    } finally {
      setAcceptingOrderId(null);
    }
  };

  const handleSkipOrder = (orderId: string) => {
    setSkippedOrderIds(prev => new Set(prev).add(orderId));
    setActiveIncomingOrder(null);
  };

  const handleBuyKarcis = async (isTrial: boolean) => {
    if (!activeDriverUid) return;
    setIsBuyingKarcis(true);
    try {
      await walletService.buyKarcis(activeDriverUid, isTrial);
      playSuccessChime();
      alert(isTrial ? "Karcis uji coba 24 jam berhasil diklaim!" : "Karcis harian berhasil dibeli!");
    } catch (err: any) {
      alert(`Gagal mengaktifkan karcis: ${err.message}`);
    } finally {
      setIsBuyingKarcis(false);
    }
  };

  const handleTopUp = async (amount: number) => {
    if (!activeDriverUid) return;
    setIsProcessingTopUp(true);
    try {
      await walletService.topUpWallet(activeDriverUid, amount, "Top-up Saldo QRIS Koperasi");
      playSuccessChime();
      setIsTopUpOpen(false);
      alert(`Top-up saldo Rp ${amount.toLocaleString("id-ID")} berhasil!`);
    } catch (err: any) {
      alert(`Gagal top-up: ${err.message}`);
    } finally {
      setIsProcessingTopUp(false);
    }
  };

  const handleSubmitKYC = async (data: any) => {
    if (!user) return;
    setIsSubmittingKYC(true);
    try {
      let ktpUrl = "";
      let simUrl = "";
      if (data.ktpFile) {
        const ktpRef = ref(storage, `kyc/${user.uid}/ktp_${Date.now()}`);
        const snap = await uploadBytes(ktpRef, data.ktpFile);
        ktpUrl = await getDownloadURL(snap.ref);
      }
      if (data.simFile) {
        const simRef = ref(storage, `kyc/${user.uid}/sim_${Date.now()}`);
        const snap = await uploadBytes(simRef, data.simFile);
        simUrl = await getDownloadURL(snap.ref);
      }

      await kycService.submitKYCRequest({
        userId: user.uid,
        driverName: userData?.displayName || "Mitra Driver",
        driverEmail: user.email || "",
        phone: (userData as any)?.phoneNumber || (userData as any)?.phone || "-",
        nik: data.nik,
        simNumber: data.simNumber,
        vehiclePlate: data.vehiclePlate,
        vehicleModel: data.vehicleModel,
        ktpImageUrl: ktpUrl,
        simImageUrl: simUrl
      });

      playSuccessChime();
      setIsKYCOpen(false);
      alert("Dokumen KYC berhasil dikirim! Menunggu verifikasi admin.");
    } catch (err: any) {
      alert(`Gagal mengirim KYC: ${err.message}`);
    } finally {
      setIsSubmittingKYC(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  // Calculated Stats
  const completedTrips = driverTrips.filter(t => t.status === "completed");
  const driverRating = 4.95;
  const driverCompletionRate = "98.5%";
  const completedTripsCount = completedTrips.length;
  const driverPoints = (userData as any)?.points || completedTripsCount * 10;
  const estimatedSHU = driverPoints * 2500;
  const isKycVerified = Boolean((userData as any)?.isVerified);
  const kycPending = Boolean((userData as any)?.kycSubmitted && !isKycVerified);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-white flex flex-col selection:bg-emerald-500/20">
      <AdminImpersonationBar />
      <AppHeader onOpenProfile={() => setIsProfileOpen(true)} />

      {/* 1. RADAR TAB */}
      {activeTab === "radar" && (
        <DriverRadarTab
          isOnline={isOnline}
          onToggleOnline={handleToggleOnline}
          isUpdatingStatus={isUpdatingStatus}
          acceptRide={acceptRide}
          acceptSend={acceptSend}
          acceptFood={acceptFood}
          onToggleRide={() => setAcceptRide(!acceptRide)}
          onToggleSend={() => setAcceptSend(!acceptSend)}
          onToggleFood={() => setAcceptFood(!acceptFood)}
          autoAccept={autoAccept}
          onToggleAutoAccept={() => setAutoAccept(!autoAccept)}
          isKarcisExpired={isKarcisExpired}
          isBuyingKarcis={isBuyingKarcis}
          onBuyKarcis={handleBuyKarcis}
          location={location}
          selectedDistrictId={selectedDistrictId}
          onSelectDistrict={setSelectedDistrictId}
          focusedHotspot={focusedHotspot}
          onFocusHotspot={setFocusedHotspot}
          pendingOrders={pendingOrders}
          ordersLoading={ordersLoading}
          onAcceptOrder={handleAcceptOrder}
          acceptingOrderId={acceptingOrderId}
          broadcasts={broadcasts}
        />
      )}

      {/* 2. INCOME TAB */}
      {activeTab === "income" && (
        <DriverIncomeTab driverId={activeDriverUid} />
      )}

      {/* 3. PERFORMANCE TAB */}
      {activeTab === "performance" && (
        <DriverPerformanceTab
          driverRating={driverRating}
          driverCompletionRate={driverCompletionRate}
          completedTripsCount={completedTripsCount}
          driverPoints={driverPoints}
          estimatedSHU={estimatedSHU}
          driverTrips={driverTrips}
          onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
          onSelectTripReceipt={setSelectedTripForReceipt}
        />
      )}

      {/* 4. PARTNER TAB */}
      {activeTab === "partner" && (
        <DriverPartnerTab
          user={user}
          userData={userData}
          vehiclePlate={(userData as any)?.vehiclePlate || ""}
          isKycVerified={isKycVerified}
          kycPending={kycPending}
          onOpenKycModal={() => setIsKYCOpen(true)}
          onLogout={() => authService.logout().then(() => router.push("/login"))}
        />
      )}

      {/* Incoming Order Hero Modal */}
      <IncomingOrderModal 
        order={!autoAccept ? activeIncomingOrder : null}
        onAccept={handleAcceptOrder}
        onSkip={handleSkipOrder}
      />

      {/* Floating Bottom Nav */}
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

      {/* Profile Drawer */}
      <ProfileDrawer 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
      />

      {/* Modals */}
      <TopupWalletModal
        isOpen={isTopUpOpen}
        onClose={() => setIsTopUpOpen(false)}
        onTopup={handleTopUp}
        isProcessing={isProcessingTopUp}
      />

      <KycUploadModal
        isOpen={isKYCOpen}
        onClose={() => setIsKYCOpen(false)}
        onSubmit={handleSubmitKYC}
        isSubmitting={isSubmittingKYC}
      />

      <HistoryDetailReceiptModal
        isOpen={!!selectedTripForReceipt}
        onClose={() => setSelectedTripForReceipt(null)}
        order={selectedTripForReceipt}
        currentRole="driver"
      />

      <UnifiedHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        initialRole="driver"
      />
    </div>
  );
}
