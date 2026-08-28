"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { useBroadcasts } from "@/hooks/useBroadcasts";
import { AppHeader } from "@/components/layout/AppHeader";
import { AdminImpersonationBar } from "@/components/admin/AdminImpersonationBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { ProfileDrawer } from "@/components/layout/ProfileDrawer";
import { ServicesGrid } from "@/components/home/ServicesGrid";
import { WalletQuickCard } from "@/components/home/WalletQuickCard";
import { PromoBanner } from "@/components/home/PromoBanner";
import { MerchantSpotlight } from "@/components/home/MerchantSpotlight";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  MapPin, 
  Search, 
  Loader2, 
  Coins, 
  Clock, 
  Sparkles, 
  ShoppingBag, 
  ArrowRight,
  ShieldCheck,
  Megaphone,
  Zap,
  Store
} from "lucide-react";
import { AppService, SUPER_APP_SERVICES } from "@/constants/services";
import { LOCAL_MERCHANTS_SURAKARTA } from "@/constants/merchants";
import { Merchant } from "@/types/merchant.types";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";
import { OrderDocument } from "@/types/order.types";

export default function CustomerHome() {
  const { user, userData, loading: authLoading } = useAuthContext();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("home");
  const [isProfileOpen, setIsProfileOpen] = useState(false);


  // Civic Broadcasts from Government / Flash Sale
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
      
      // Sort client-side
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

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-zinc-950 text-emerald-500">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-[100dvh] bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 flex flex-col justify-between pb-24 transition-colors duration-200">
      {/* Impersonation Bar if Active */}
      <AdminImpersonationBar />

      {/* Top App Header */}
      <AppHeader onOpenProfile={() => setIsProfileOpen(true)} />

      {/* Tab: Super-App Home */}
      {activeTab === "home" && (
        <main className="pt-20 px-4 max-w-lg w-full mx-auto space-y-5 flex-1">
          {/* Location & Search Bar Pill */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 pl-1">
              <MapPin className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
              <span className="font-semibold text-slate-700 dark:text-zinc-300">Lokasi Anda:</span>
              <span className="text-slate-500 dark:text-zinc-400 truncate">Kecamatan Jebres, Surakarta</span>
            </div>

            <div 
              onClick={() => router.push(`/services/ride`)}
              className="flex items-center gap-3 p-3.5 bg-white/90 dark:bg-zinc-900/90 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-2xl cursor-pointer transition-all shadow-sm group"
            >
              <Search className="h-4 w-4 text-emerald-500 dark:text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />
              <span className="text-xs text-slate-500 dark:text-zinc-400 flex-1">
                Mau ojek, makan apa, atau kirim barang hari ini?
              </span>
              <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                Cari
              </span>
            </div>
          </div>

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
                <p className="text-[10px] text-slate-600 dark:text-zinc-300 line-clamp-1">
                  {broadcasts[0].body}
                </p>
              </div>
            </div>
          )}

          {/* Quick Wallet & Membership Card */}
          <WalletQuickCard onOpenRewards={() => setActiveTab("rewards")} />

          {/* Super-App Services Grid */}
          <ServicesGrid onSelectService={handleSelectService} />

          {/* Pasar Murah / Sinergi Pemkot Widget */}
          <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-400/5 to-white dark:via-emerald-900/10 dark:to-zinc-900 border border-emerald-500/30 rounded-3xl p-4 shadow-sm flex items-center justify-between cursor-pointer hover:bg-emerald-500/5 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
                <Store className="h-6 w-6" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  Program Pasar Murah
                  <Badge variant="emerald" className="h-4 text-[9px] px-1.5 py-0 bg-emerald-500 hover:bg-emerald-500 text-white border-0">Pemkot</Badge>
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400 leading-tight">
                  Sembako & bahan pokok subsidi khusus warga Solo terdaftar.
                </p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-emerald-500 shrink-0 opacity-50" />
          </div>

          {/* Promo & News Carousel */}
          <PromoBanner />

          {/* Local Surakarta UMKM Spotlight */}
          <MerchantSpotlight onSelectMerchant={handleOpenMerchant} />
        </main>
      )}

      {/* Tab: Orders History */}
      {activeTab === "orders" && (
        <main className="pt-20 px-4 max-w-lg w-full mx-auto flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight sg-editorial-title">
              Pesanan & Aktivitas
            </h2>
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-semibold bg-slate-200/80 dark:bg-zinc-800 px-2.5 py-1 rounded-full">
              {customerOrders.length} Riwayat
            </span>
          </div>

          {customerOrders.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl space-y-2 mt-4 shadow-sm">
              <Clock className="h-8 w-8 text-slate-400 dark:text-zinc-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-900 dark:text-white">Belum Ada Pesanan</p>
              <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-xs mx-auto">
                Pesanan ojek atau titip belanja Anda akan tercatat secara otomatis di sini.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {customerOrders.map((order) => (
                <div 
                  key={order.id}
                  onClick={() => router.push(`/order/${order.id}`)}
                  className="sg-card sg-hover-lift p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 space-y-3 cursor-pointer transition-all shadow-sm"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      <Badge 
                        variant={
                          order.status === "completed" ? "emerald" :
                          order.status === "cancelled" ? "rose" :
                          "amber"
                        } 
                        size="sm"
                      >
                        {order.status}
                      </Badge>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase">
                        {order.serviceType || "ojek"}
                      </span>
                    </div>
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      Rp {order.price.toLocaleString("id-ID")}
                    </span>
                  </div>

                  <div className="text-xs space-y-1.5 text-slate-600 dark:text-zinc-300">
                    <p className="truncate text-slate-500 dark:text-zinc-400">Jemput: <span className="text-slate-800 dark:text-zinc-200 font-medium">{order.pickupLocation?.address}</span></p>
                    <p className="truncate text-slate-500 dark:text-zinc-400">Tujuan: <span className="text-slate-800 dark:text-zinc-200 font-medium">{order.dropoffLocation?.address}</span></p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      {/* Tab: Rewards & UMKM Vouchers */}
      {activeTab === "rewards" && (
        <main className="pt-20 px-4 max-w-lg w-full mx-auto flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight sg-editorial-title">
              Poin Stamp & Diskon UMKM
            </h2>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-xs font-bold text-amber-600 dark:text-amber-400">
              <Coins className="h-3.5 w-3.5" />
              {userData?.points || 0} Poin
            </div>
          </div>

          <Card className="bg-gradient-to-tr from-emerald-500/10 via-white to-white dark:from-emerald-950/40 dark:via-zinc-900 dark:to-zinc-900 border-emerald-500/30 p-5 rounded-3xl space-y-1.5 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Ekosistem UMKM Warga Solo</h3>
            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
              Setiap kali naik ojek atau kirim barang, Anda mendapatkan poin stamp untuk ditukarkan dengan diskon makanan di warung binaan koperasi.
            </p>
          </Card>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider pl-1">
              Kupon Diskon Mitra Tersedia di Solo:
            </h3>
            
            <div className="sg-card p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Sate Kambing Pak Manto</span>
                  <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.2 rounded">Sriwedari</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Potongan Harga Rp 5.000</p>
              </div>
              <Button size="sm" className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl h-8 cursor-pointer">
                Tukar 20 Poin
              </Button>
            </div>

            <div className="sg-card p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Es Dawet Telasih Bu Dermi</span>
                  <span className="text-[9px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 px-1.5 py-0.2 rounded">Pasar Gede</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Gratis 1 Gelas Es Dawet Telasih</p>
              </div>
              <Button size="sm" className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl h-8 cursor-pointer">
                Tukar 15 Poin
              </Button>
            </div>
          </div>
        </main>
      )}



      {/* Bottom Navigation Bar */}
      <BottomNav
        role="customer"
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === "profile") {
            setIsProfileOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
      />

      {/* Profile & Settings Drawer */}
      <ProfileDrawer 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
      />
    </div>
  );
}
