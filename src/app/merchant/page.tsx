"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { useMerchant } from "@/hooks/useMerchant";
import { useMerchantOrders } from "@/hooks/useMerchantOrders";
import { merchantService } from "@/services/merchant.service";
import { OrderDocument } from "@/types/order.types";
import { AppHeader } from "@/components/layout/AppHeader";
import { AdminImpersonationBar } from "@/components/admin/AdminImpersonationBar";
import { RejectionModal } from "@/components/government/shared/RejectionModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Loader2, Store, PackageOpen, LayoutGrid, CheckCircle2, 
  Clock, ArrowRight, XCircle, Plus, MapPin, Flame, ChefHat, Bike, Activity
} from "lucide-react";

export default function MerchantWorkspace() {
  const { user, userData, loading: authLoading, effectiveUid } = useAuthContext();
  const router = useRouter();
  
  const activeOwnerUid = effectiveUid || user?.uid;
  
  // We'll query merchant by ownerId (mock or real)
  const [merchantId, setMerchantId] = useState<string | null>(null);

  const { merchant, products, loading: merchantLoading } = useMerchant(merchantId || undefined);
  const { orders, loading: ordersLoading } = useMerchantOrders(merchantId || undefined);

  const [activeTab, setActiveTab] = useState<"pesanan" | "katalog" | "finansial">("pesanan");
  const [isRejecting, setIsRejecting] = useState<string | null>(null); // Order ID
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else if (userData?.role !== "merchant") {
        router.push("/");
      }
    }
  }, [user, userData, authLoading, router]);

  // Find merchant profile by owner UID (e.g. sandbox-merchant-manto)
  useEffect(() => {
    if (activeOwnerUid) {
      merchantService.getMerchantProfileByOwner(activeOwnerUid).then((profile) => {
        if (profile) {
          setMerchantId(profile.id);
        } else {
          // If no profile found but user is 'sandbox-merchant-manto', we can set a dummy or use uid as merchant id
          if (activeOwnerUid.includes("merchant")) {
            setMerchantId(activeOwnerUid);
          }
        }
      });
    }
  }, [activeOwnerUid]);

  const newOrders = useMemo(() => orders.filter(o => o.status === "pending_merchant"), [orders]);
  const preparingOrders = useMemo(() => orders.filter(o => o.status === "preparing" || o.status === "ready_for_pickup"), [orders]);
  const deliveryOrders = useMemo(() => orders.filter(o => o.status === "pending" || o.status === "accepted" || o.status === "in_progress"), [orders]);
  const historyOrders = useMemo(() => orders.filter(o => o.status === "completed" || o.status === "cancelled" || o.status === "rejected"), [orders]);

  const handleUpdateStatus = async (orderId: string, status: any, reason?: string) => {
    if (!user || !activeOwnerUid) return;
    setIsProcessing(orderId);
    try {
      await merchantService.updateMerchantOrderStatus(
        orderId, 
        status, 
        activeOwnerUid, 
        "merchant", 
        merchant?.name || userData?.displayName || "Merchant", 
        reason
      );
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(null);
      setIsRejecting(null);
    }
  };

  const handleToggleStore = async () => {
    if (!merchant) return;
    try {
      await merchantService.toggleStoreStatus(merchant.id, !merchant.isOpen);
    } catch (err: any) {
      alert("Gagal merubah status toko.");
    }
  };

  if (authLoading || merchantLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-zinc-950 flex-col space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
        <p className="text-sm text-slate-500 dark:text-zinc-400">Memuat Dashboard Merchant...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-[100dvh] bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 flex flex-col pb-24 transition-colors duration-200">
      <AdminImpersonationBar />
      <AppHeader onOpenProfile={() => {}} />

      <main className="pt-20 px-4 space-y-5 max-w-lg w-full mx-auto flex-1">
        
        {/* Merchant Header */}
        <div className="sg-card p-5 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded-2xl flex items-center justify-center text-xl font-bold">
              {merchant?.category === "kuliner" ? "🍲" : "🛒"}
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                {merchant?.name || "Toko Saya"}
              </h2>
              <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3" /> {merchant?.address || "Solo, Surakarta"}
              </p>
            </div>
          </div>
          <button 
            onClick={handleToggleStore}
            className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
              merchant?.isOpen 
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20" 
                : "bg-slate-200 dark:bg-zinc-800 text-slate-500 border-slate-300 dark:border-zinc-700 hover:bg-slate-300"
            }`}
          >
            {merchant?.isOpen ? "🟢 BUKA" : "🔴 TUTUP"}
          </button>
        </div>

        {/* Custom Modern Tabs */}
        <div className="flex bg-slate-200/80 dark:bg-zinc-800/80 p-1.5 rounded-2xl border border-slate-300/60 dark:border-zinc-700/60 text-[11px] font-bold shadow-inner">
          <button
            onClick={() => setActiveTab("pesanan")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === "pesanan" 
                ? "bg-white dark:bg-zinc-900 text-orange-600 dark:text-orange-400 shadow-sm" 
                : "text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-300"
            }`}
          >
            <Activity className="h-3.5 w-3.5" /> 
            Pesanan
            {newOrders.length > 0 && (
              <span className="bg-rose-500 text-white text-[9px] px-1.5 py-0.5 rounded-full leading-none">
                {newOrders.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("katalog")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === "katalog" 
                ? "bg-white dark:bg-zinc-900 text-orange-600 dark:text-orange-400 shadow-sm" 
                : "text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-300"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" /> Katalog
          </button>
          <button
            onClick={() => setActiveTab("finansial")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === "finansial" 
                ? "bg-white dark:bg-zinc-900 text-orange-600 dark:text-orange-400 shadow-sm" 
                : "text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-300"
            }`}
          >
            <Store className="h-3.5 w-3.5" /> Info Toko
          </button>
        </div>

        {/* TAB: PESANAN */}
        {activeTab === "pesanan" && (
          <div className="space-y-6">
            
            {/* New Orders Section */}
            {newOrders.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-black flex items-center gap-2 text-rose-600 dark:text-rose-400">
                  <Flame className="h-4 w-4 animate-pulse" /> Pesanan Baru Masuk ({newOrders.length})
                </h3>
                {newOrders.map((order) => (
                  <Card key={order.id} className="p-4 rounded-3xl border-rose-500/30 bg-rose-500/5 shadow-sm space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-bold">{order.customerName || "Pelanggan"}</p>
                        <p className="text-[10px] text-slate-500">#{order.id?.slice(0,6).toUpperCase()}</p>
                      </div>
                      <Badge variant="rose">Baru Masuk</Badge>
                    </div>
                    
                    <div className="bg-white/60 dark:bg-zinc-900/60 p-3 rounded-2xl text-xs space-y-1.5 border border-slate-200/50 dark:border-zinc-800/50">
                      {order.items?.map((item, i) => (
                        <div key={i} className="flex justify-between font-medium">
                          <span>{item.qty}x {item.name}</span>
                          <span>Rp {(item.qty * item.price).toLocaleString('id-ID')}</span>
                        </div>
                      ))}
                      <div className="border-t border-slate-200 dark:border-zinc-800 pt-1.5 mt-1.5 flex justify-between font-black text-rose-600 dark:text-rose-400">
                        <span>Total Makanan:</span>
                        <span>Rp {(order.subtotal || order.price).toLocaleString('id-ID')}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Button 
                        variant="outline" 
                        className="text-xs h-10 rounded-xl border-rose-500/40 text-rose-600 hover:bg-rose-500/10"
                        onClick={() => setIsRejecting(order.id!)}
                      >
                        Tolak
                      </Button>
                      <Button 
                        className="text-xs h-10 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 font-bold"
                        onClick={() => handleUpdateStatus(order.id!, "preparing")}
                        disabled={isProcessing === order.id}
                      >
                        {isProcessing === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Terima & Siapkan"}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Preparing Orders Section */}
            {preparingOrders.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-black flex items-center gap-2 text-orange-600 dark:text-orange-400">
                  <ChefHat className="h-4 w-4" /> Sedang Disiapkan ({preparingOrders.length})
                </h3>
                {preparingOrders.map((order) => (
                  <Card key={order.id} className="p-4 rounded-3xl border-orange-500/30 bg-orange-500/5 shadow-sm space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-bold">{order.customerName || "Pelanggan"}</p>
                        <p className="text-[10px] text-slate-500">{order.items?.length || 0} items</p>
                      </div>
                      <Badge variant="orange">Dimasak</Badge>
                    </div>
                    
                    <Button 
                      className="w-full text-xs h-11 rounded-xl bg-orange-600 hover:bg-orange-700 font-bold shadow-md"
                      onClick={() => handleUpdateStatus(order.id!, "pending")}
                      disabled={isProcessing === order.id}
                    >
                      {isProcessing === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Selesai Masak & Panggil Driver"}
                    </Button>
                  </Card>
                ))}
              </div>
            )}

            {/* In Delivery / Waiting Driver Section */}
            {deliveryOrders.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-black flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <Bike className="h-4 w-4" /> Proses Driver ({deliveryOrders.length})
                </h3>
                {deliveryOrders.map((order) => (
                  <Card key={order.id} className="p-4 rounded-3xl border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold">{order.customerName}</p>
                      <p className="text-[10px] text-slate-500">Driver: {order.driverName || "Mencari Driver..."}</p>
                    </div>
                    <Badge variant={order.status === "pending" ? "amber" : "emerald"}>
                      {order.status === "pending" ? "Mencari" : "Menjemput"}
                    </Badge>
                  </Card>
                ))}
              </div>
            )}

            {orders.length === 0 && !ordersLoading && (
              <div className="p-8 text-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl space-y-2 mt-2 shadow-sm">
                <Store className="h-8 w-8 text-slate-400 dark:text-zinc-500 mx-auto mb-1" />
                <p className="text-xs font-bold text-slate-700 dark:text-zinc-300">Belum Ada Pesanan Aktif</p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 max-w-[200px] mx-auto">
                  Pastikan toko Anda dalam keadaan BUKA agar pelanggan bisa memesan.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB: KATALOG */}
        {activeTab === "katalog" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold sg-editorial-title">Daftar Menu / Produk</h3>
              <Button size="sm" variant="outline" className="h-8 text-xs rounded-xl border-orange-500/30 text-orange-600 hover:bg-orange-500/10 gap-1">
                <Plus className="h-3.5 w-3.5" /> Tambah
              </Button>
            </div>
            
            {products.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">Belum ada produk.</div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {products.map((p) => (
                  <div key={p.id} className="sg-card p-3 rounded-2xl flex items-center justify-between border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 shadow-sm">
                    <div>
                      <p className="text-xs font-bold">{p.name}</p>
                      <p className="text-[11px] text-orange-600 font-semibold">Rp {p.price.toLocaleString('id-ID')}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant={p.isAvailable ? "emerald" : "rose"} size="sm">
                        {p.isAvailable ? "Tersedia" : "Habis"}
                      </Badge>
                      <button 
                        className="text-[10px] text-slate-400 hover:text-slate-600 underline cursor-pointer"
                        onClick={() => merchantService.toggleAvailability(p.id!, !p.isAvailable)}
                      >
                        Ubah Stok
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: FINANSIAL */}
        {activeTab === "finansial" && (
          <div className="space-y-3">
            <Card className="bg-gradient-to-tr from-orange-500/10 to-orange-500/5 border-orange-500/20 p-5 rounded-3xl space-y-2">
              <h3 className="text-sm font-bold text-orange-600 dark:text-orange-400">Zero Commission Model</h3>
              <p className="text-xs text-slate-600 dark:text-zinc-300">
                Aplikasi Ride-Solo tidak memotong komisi 20% dari harga menu Anda. Pelanggan membayar sesuai harga asli warung Anda, menjadikan harga lebih murah dan UMKM lebih sejahtera.
              </p>
              <div className="pt-2">
                <Badge variant="orange">Status Keanggotaan: TIER 1 (Gratis)</Badge>
              </div>
            </Card>
          </div>
        )}

      </main>

      {/* Rejection Modal Reused from OPD standards */}
      {isRejecting && (
        <RejectionModal
          isOpen={true}
          orderInfo={{ orderId: isRejecting, serviceName: "Pesanan Kuliner/Pasar" }}
          onClose={() => setIsRejecting(null)}
          onConfirm={(reason: string) => handleUpdateStatus(isRejecting, "rejected", reason)}
        />
      )}
    </div>
  );
}
