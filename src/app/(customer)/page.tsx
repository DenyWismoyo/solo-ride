"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { useTheme } from "@/components/theme/ThemeProvider";
import { authService } from "@/services/auth.service";
import { motion, AnimatePresence } from "motion/react";
import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { ProfileDrawer } from "@/components/layout/ProfileDrawer";
import { SavedAddressesModal } from "@/components/profile/SavedAddressesModal";
import { ServicesGrid } from "@/components/home/ServicesGrid";
import { PromoBanner } from "@/components/home/PromoBanner";
import { MerchantSpotlight } from "@/components/home/MerchantSpotlight";
import { WalletQuickCard } from "@/components/home/WalletQuickCard";
import { AdminImpersonationBar } from "@/components/admin/AdminImpersonationBar";
import { useBroadcasts } from "@/hooks/useBroadcasts";
import { 
  Search, 
  MapPin, 
  Store, 
  ArrowRight, 
  Megaphone,
  Gift, 
  CheckCircle2, 
  Sparkles, 
  QrCode, 
  Coins, 
  Clock, 
  Layers, 
  ChevronRight,
  TrendingUp,
  Loader2,
  Package,
  User,
  Wallet,
  Bike,
  HelpCircle,
  LogOut,
  Sun,
  Moon,
  Laptop,
  ExternalLink,
  ShieldCheck,
  History,
  XCircle,
  Car,
  UtensilsCrossed,
  FileText
} from "lucide-react";
import { AppService } from "@/constants/services";
import { Merchant } from "@/types/merchant.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";
import { OrderDocument } from "@/types/order.types";
import { HistoryDetailReceiptModal } from "@/components/history/HistoryDetailReceiptModal";

export default function CustomerHome() {
  const router = useRouter();
  const { user, userData, loading, isImpersonating, impersonatedRole, setImpersonatedRole } = useAuthContext();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("home");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAddressesModalOpen, setIsAddressesModalOpen] = useState(false);
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState<OrderDocument | null>(null);
  const [orderStatusFilter, setOrderStatusFilter] = useState<"all" | "active" | "completed" | "cancelled">("all");

  // Real-time broadcasts for customers
  const { broadcasts } = useBroadcasts("customer");

  // Customer recent/active orders
  const [customerOrders, setCustomerOrders] = useState<OrderDocument[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, COLLECTIONS.ORDERS),
      where("customerId", "==", user.uid)
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const docs: OrderDocument[] = [];
      snapshot.forEach((d) => docs.push({ id: d.id, ...d.data() } as OrderDocument));
      
      docs.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      });

      setCustomerOrders(docs);
    });
    return () => unsub();
  }, [user]);

  const handleSelectService = (service: AppService) => {
    router.push(`/services/${service.id}`);
  };

  const handleOpenMerchant = (merchant: Merchant) => {
    router.push(`/services/food`);
  };

  const handleLogout = async () => {
    await authService.logout();
    setImpersonatedRole(null);
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-[#030712] text-emerald-500">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const effectiveRole = impersonatedRole || userData?.role || "customer";

  return (
    <div className="relative min-h-[100dvh] bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 flex flex-col justify-between pb-24 transition-colors duration-200">

      {/* Impersonation Bar if Active */}
      <AdminImpersonationBar />

      {/* Top App Header */}
      <AppHeader onOpenProfile={() => setIsProfileOpen(true)} />

      {/* Tab Switcher with AnimatePresence */}
      <AnimatePresence mode="wait">
        {/* Tab 1: Super-App Home */}
        {activeTab === "home" && (
          <motion.main
            key="home"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="pt-20 px-4 max-w-lg w-full mx-auto space-y-5 flex-1 relative z-10"
          >
            {/* Location & Search Bar Pill */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 pl-1">
                <MapPin className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                <span className="font-semibold text-slate-700 dark:text-zinc-300">Lokasi Anda:</span>
                <span className="text-slate-500 dark:text-zinc-400 truncate">Kecamatan Jebres, Surakarta</span>
              </div>

              <motion.div 
                whileTap={{ scale: 0.98 }}
                whileHover={{ y: -2 }}
                onClick={() => router.push(`/services/ride`)}
                className="flex items-center gap-3 p-3.5 bg-white/95 dark:bg-[#0c1220]/95 hover:bg-slate-50/90 dark:hover:bg-[#11192e] rounded-[1.8rem] cursor-pointer transition-all shadow-[0_8px_30px_-4px_rgba(15,23,42,0.05)] dark:shadow-[0_14px_36px_-8px_rgba(0,0,0,0.7)] backdrop-blur-2xl group"
              >
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                  <Search className="h-4 w-4 stroke-[2.2]" />
                </div>
                <span className="text-xs font-medium text-slate-500 dark:text-zinc-400 flex-1">
                  Mau ojek, makan apa, atau kirim barang hari ini?
                </span>
                <span className="text-[10px] font-black bg-gradient-to-r from-emerald-600 to-teal-500 text-white px-3 py-1.5 rounded-full shadow-xs">
                  Cari
                </span>
              </motion.div>
            </div>

            {/* Active Civic Broadcast Ticker if available */}
            {broadcasts.length > 0 && (
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-3.5 rounded-[1.6rem] bg-gradient-to-r from-teal-500/15 via-emerald-500/10 to-teal-500/5 dark:from-teal-950/50 dark:via-emerald-950/30 dark:to-transparent flex items-start gap-3 shadow-[0_6px_20px_-4px_rgba(13,148,136,0.1)] backdrop-blur-xl"
              >
                <div className="p-2 rounded-xl bg-teal-500/20 text-teal-600 dark:text-teal-400 shrink-0 shadow-xs">
                  <Megaphone className="h-4 w-4 animate-bounce" />
                </div>
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-teal-800 dark:text-teal-300 leading-tight">
                      {broadcasts[0].title}
                    </span>
                    <span className="text-[9px] font-extrabold text-teal-600 dark:text-teal-400 bg-teal-500/20 px-2 py-0.5 rounded-full">
                      Pemda
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-600 dark:text-zinc-300 line-clamp-1">
                    {broadcasts[0].body}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Quick Wallet & Membership Card */}
            <WalletQuickCard onOpenRewards={() => setActiveTab("rewards")} />

            {/* Super-App Services Grid */}
            <ServicesGrid onSelectService={handleSelectService} />

            {/* Pasar Murah / Sinergi Pemkot Widget */}
            <motion.div 
              whileTap={{ scale: 0.97 }}
              whileHover={{ y: -2 }}
              onClick={() => router.push("/services/pasar")}
              className="bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-white/95 dark:via-emerald-950/40 dark:to-[#0c1220] rounded-[1.8rem] p-4 shadow-[0_8px_25px_-4px_rgba(16,185,129,0.1)] flex items-center justify-between cursor-pointer backdrop-blur-xl"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-gradient-to-tr from-emerald-500/25 to-teal-500/15 text-emerald-600 dark:text-emerald-400 shrink-0 shadow-xs">
                  <Store className="h-6 w-6 stroke-[2.2]" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    Program Pasar Murah
                    <span className="text-[9px] font-black px-1.5 py-0.2 bg-emerald-500 text-white rounded-md">Pemkot</span>
                  </h3>
                  <p className="text-[10px] font-medium text-slate-500 dark:text-zinc-400 leading-tight">
                    Sembako & bahan pokok subsidi khusus warga Solo terdaftar.
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-emerald-500 shrink-0 opacity-80" />
            </motion.div>

            {/* Promo & News Carousel */}
            <PromoBanner />

            {/* Local Surakarta UMKM Spotlight */}
            <MerchantSpotlight onSelectMerchant={handleOpenMerchant} />
          </motion.main>
        )}

        {/* Tab 2: Orders History */}
        {activeTab === "orders" && (
          <motion.main
            key="orders"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="pt-20 px-4 max-w-lg w-full mx-auto flex-1 space-y-4 relative z-10 pb-24"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight sg-editorial-title">
                  Pesanan & Aktivitas
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Riwayat mobilitas, kuliner & pengantaran</p>
              </div>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                {customerOrders.length} Total
              </span>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setOrderStatusFilter("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  orderStatusFilter === "all"
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                    : "bg-white dark:bg-white/[0.04] text-slate-600 dark:text-zinc-400 border border-slate-200/80 dark:border-white/[0.06]"
                }`}
              >
                Semua ({customerOrders.length})
              </button>

              <button
                onClick={() => setOrderStatusFilter("active")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                  orderStatusFilter === "active"
                    ? "bg-amber-600 text-white shadow-sm"
                    : "bg-white dark:bg-white/[0.04] text-slate-600 dark:text-zinc-400 border border-slate-200/80 dark:border-white/[0.06]"
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                Dalam Proses ({customerOrders.filter(o => o.status !== "completed" && o.status !== "cancelled").length})
              </button>

              <button
                onClick={() => setOrderStatusFilter("completed")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                  orderStatusFilter === "completed"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-white dark:bg-white/[0.04] text-slate-600 dark:text-zinc-400 border border-slate-200/80 dark:border-white/[0.06]"
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Selesai ({customerOrders.filter(o => o.status === "completed").length})
              </button>

              <button
                onClick={() => setOrderStatusFilter("cancelled")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                  orderStatusFilter === "cancelled"
                    ? "bg-rose-600 text-white shadow-sm"
                    : "bg-white dark:bg-white/[0.04] text-slate-600 dark:text-zinc-400 border border-slate-200/80 dark:border-white/[0.06]"
                }`}
              >
                <XCircle className="h-3.5 w-3.5" />
                Dibatalkan ({customerOrders.filter(o => o.status === "cancelled").length})
              </button>
            </div>

            {/* Filtered Order Feed */}
            {(() => {
              const filtered = customerOrders.filter((order) => {
                if (orderStatusFilter === "completed") return order.status === "completed";
                if (orderStatusFilter === "cancelled") return order.status === "cancelled";
                if (orderStatusFilter === "active") return order.status !== "completed" && order.status !== "cancelled";
                return true;
              });

              if (filtered.length === 0) {
                return (
                  <div className="sg-card p-8 rounded-3xl border border-slate-200 dark:border-zinc-800 text-center space-y-3 shadow-sm bg-white/95 dark:bg-zinc-900/95">
                    <Clock className="h-10 w-10 text-slate-400 dark:text-zinc-500 mx-auto" />
                    <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200">Tidak Ada Riwayat</h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-xs mx-auto">
                      {orderStatusFilter === "active" 
                        ? "Tidak ada pesanan yang sedang berlangsung." 
                        : "Pesan ojek, makanan, atau kebutuhan harian Anda untuk melihat riwayat aktivitas di sini."}
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-3">
                  {filtered.map((order) => (
                    <motion.div
                      key={order.id}
                      whileTap={{ scale: 0.97 }}
                      whileHover={{ y: -2 }}
                      onClick={() => setSelectedOrderForReceipt(order)}
                      className="p-4.5 rounded-[1.8rem] bg-white/95 dark:bg-[#0c1220]/95 space-y-3.5 shadow-[0_8px_24px_-4px_rgba(15,23,42,0.04)] dark:shadow-[0_14px_32px_-6px_rgba(0,0,0,0.65)] hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                              {(order as any).serviceTitle || order.serviceType}
                            </span>
                            <Badge 
                              variant={
                                order.status === "completed" ? "emerald" :
                                order.status === "cancelled" ? "rose" :
                                order.status === "in_progress" ? "blue" : "amber"
                              }
                              size="sm"
                            >
                              {order.status === "completed" ? "Selesai" : order.status === "cancelled" ? "Batal" : order.status}
                            </Badge>
                          </div>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            ID: #{order.id?.slice(0, 8).toUpperCase()}
                          </p>
                        </div>

                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          Rp {Number(order.price || 0).toLocaleString("id-ID")}
                        </span>
                      </div>

                      <div className="p-3 bg-slate-50/90 dark:bg-white/[0.03] rounded-2xl space-y-1.5 text-xs text-slate-600 dark:text-zinc-300">
                        <div className="flex items-start gap-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mt-0.5">Jemput:</span>
                          <span className="font-semibold text-slate-800 dark:text-zinc-200 truncate">{order.pickupLocation?.address}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mt-0.5">Tujuan:</span>
                          <span className="font-semibold text-slate-800 dark:text-zinc-200 truncate">{order.dropoffLocation?.address}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                        <span className="font-medium">
                          {order.driverName ? `Mitra: ${order.driverName}` : "Pesanan Langsung"}
                        </span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-0.5">
                          Buka E-Struk <ChevronRight className="h-3 w-3" />
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              );
            })()}
          </motion.main>
        )}

        {/* Tab 3: Rewards & Poin UMKM */}
        {activeTab === "rewards" && (
          <motion.main
            key="rewards"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="pt-20 px-4 max-w-lg w-full mx-auto flex-1 space-y-4 relative z-10"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight sg-editorial-title">
                Tabungan Poin Stamp UMKM
              </h2>
            </div>

            <div className="p-5.5 rounded-[2rem] bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-transparent shadow-[0_10px_30px_-6px_rgba(245,158,11,0.12)] space-y-3.5 relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-extrabold uppercase tracking-wider">Total Stamp Anda:</span>
                  <div className="text-3xl font-black text-amber-500 flex items-center gap-2 mt-0.5">
                    <span>🪙 {userData?.points || 120}</span>
                    <span className="text-xs font-bold text-slate-500">Poin</span>
                  </div>
                </div>
                <Badge variant="amber" size="sm">Level Warga Aktif</Badge>
              </div>

              <p className="text-xs text-slate-600 dark:text-zinc-300 leading-snug">
                Kumpulkan stamp dari setiap pesanan ojek dan belanja kuliner UMKM lokal untuk ditukarkan sembako gratis di Pasar Gede.
              </p>
            </div>
          </motion.main>
        )}

        {/* Tab 4: Profile / Akun Khusus Warga */}
        {activeTab === "profile" && (
          <motion.main
            key="profile"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="pt-20 px-4 max-w-lg w-full mx-auto flex-1 space-y-4 relative z-10 pb-24"
          >
            {/* Identity Card */}
            <div className="p-5.5 rounded-[2rem] bg-white/95 dark:bg-[#0c1220]/95 shadow-[0_10px_30px_-6px_rgba(15,23,42,0.05)] dark:shadow-[0_16px_40px_-8px_rgba(0,0,0,0.7)] space-y-4 relative overflow-hidden">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-[1.4rem] bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-xl flex items-center justify-center shadow-md shrink-0">
                  {userData?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "W"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                      {userData?.displayName || "Warga Surakarta"}
                    </h3>
                    <Badge variant="emerald" size="sm">WARGA SOLO</Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 truncate mt-0.5">{user?.email}</p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                    📍 Kecamatan Jebres, Surakarta
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-white/[0.06]">
                <div className="p-3 bg-slate-50/90 dark:bg-white/[0.03] rounded-2xl shadow-xs">
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase block">Dompet Warga</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">Rp 25.000</span>
                </div>
                <div className="p-3 bg-slate-50/90 dark:bg-white/[0.03] rounded-2xl shadow-xs">
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase block">Stamp Komunitas</span>
                  <span className="text-sm font-black text-amber-500">{userData?.points || 120} Poin</span>
                </div>
              </div>
            </div>

            {/* Menu List Khusus Customer */}
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold text-slate-500 dark:text-zinc-400 uppercase tracking-wider pl-1">
                Layanan & Pengaturan Akun:
              </h4>

              <div className="space-y-1.5">
                <button
                  onClick={() => router.push("/services/more")}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white/95 dark:bg-[#0c1220]/95 hover:bg-slate-50/90 dark:hover:bg-white/[0.05] shadow-xs transition-all text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <Layers className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Katalog 16 Layanan Ekosistem</p>
                      <p className="text-[10px] text-slate-500">Mobilitas, Pasar, Dinas & Industri</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </button>

                <button
                  onClick={() => setIsAddressesModalOpen(true)}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white/95 dark:bg-[#0c1220]/95 hover:bg-slate-50/90 dark:hover:bg-white/[0.05] shadow-xs transition-all text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Alamat Favorit Saya</p>
                      <p className="text-[10px] text-slate-500">Simpan alamat rumah, kantor, kampus</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </button>

                <button
                  onClick={() => alert("Pendaftaran Mitra Driver Koperasi Solo. Hubungi Koperasi di Balai Kota.")}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/15 shadow-xs transition-all text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
                      <Bike className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-amber-800 dark:text-amber-300">Daftar Jadi Mitra Driver Solo</p>
                      <p className="text-[10px] text-slate-500">Pendapatan 100% tunai tanpa potongan komisi</p>
                    </div>
                  </div>
                  <Badge variant="amber" size="sm">Buka</Badge>
                </button>

                <button
                  onClick={() => alert("Pendaftaran Kios Pedagang UMKM Pasar Tradisional Solo.")}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-orange-500/10 hover:bg-orange-500/15 shadow-xs transition-all text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-orange-500/20 text-orange-600 dark:text-orange-400">
                      <Store className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-orange-800 dark:text-orange-300">Buka Kios UMKM / Pedagang Pasar</p>
                      <p className="text-[10px] text-slate-500">Jual kuliner & bahan pokok ke seluruh warga</p>
                    </div>
                  </div>
                  <Badge variant="orange" size="sm">Buka</Badge>
                </button>
              </div>
            </div>

            {/* Tema Tampilan */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider pl-1">
                Tema Tampilan:
              </h4>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-white/95 dark:bg-[#0c1220]/95 border border-slate-200/80 dark:border-white/[0.06] rounded-2xl">
                <button
                  onClick={() => setTheme("light")}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    theme === "light"
                      ? "bg-slate-100 text-slate-900 shadow-sm border border-slate-200/80"
                      : "text-slate-500 hover:text-slate-900 dark:text-zinc-400"
                  }`}
                >
                  <Sun className="h-3.5 w-3.5 text-amber-500" />
                  <span>Terang</span>
                </button>

                <button
                  onClick={() => setTheme("dark")}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    theme === "dark"
                      ? "bg-white dark:bg-white/[0.14] text-slate-900 dark:text-white shadow-sm border border-slate-200/80 dark:border-white/[0.15]"
                      : "text-slate-500 hover:text-slate-900 dark:text-zinc-400"
                  }`}
                >
                  <Moon className="h-3.5 w-3.5 text-amber-400" />
                  <span>Gelap</span>
                </button>

                <button
                  onClick={() => setTheme("system")}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    theme === "system"
                      ? "bg-white dark:bg-white/[0.14] text-slate-900 dark:text-white shadow-sm border border-slate-200/80 dark:border-white/[0.15]"
                      : "text-slate-500 hover:text-slate-900 dark:text-zinc-400"
                  }`}
                >
                  <Laptop className="h-3.5 w-3.5 text-blue-500" />
                  <span>Sistem</span>
                </button>
              </div>
            </div>

            {/* WhatsApp Bantuan & Logout */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => window.open("https://wa.me/6281234567890?text=Halo%20Admin%20Ride-Solo%20Surakarta", "_blank")}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/95 dark:bg-[#0c1220]/95 hover:bg-slate-50 dark:hover:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.06] transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                    <HelpCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Pusat Bantuan Komunitas</p>
                    <p className="text-[10px] text-slate-500">WhatsApp pengurus koperasi Solo</p>
                  </div>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
              </button>

              <Button
                variant="danger"
                className="w-full h-11 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Keluar dari Akun
              </Button>
            </div>
          </motion.main>
        )}
      </AnimatePresence>

      {/* Floating Bottom Navigation */}
      <BottomNav role="customer" activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Profile Drawer */}
      <ProfileDrawer isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

      {/* Dedicated Saved Addresses Modal */}
      <SavedAddressesModal 
        isOpen={isAddressesModalOpen} 
        onClose={() => setIsAddressesModalOpen(false)} 
      />

      {/* History Detail Digital Receipt Modal */}
      <HistoryDetailReceiptModal
        isOpen={!!selectedOrderForReceipt}
        onClose={() => setSelectedOrderForReceipt(null)}
        order={selectedOrderForReceipt}
        currentRole="customer"
      />
    </div>
  );
}
