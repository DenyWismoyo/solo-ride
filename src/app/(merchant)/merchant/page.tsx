"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { broadcastService } from "@/services/broadcast.service";
import { merchantService } from "@/services/merchant.service";
import { orderService } from "@/services/order.service";
import { useMerchantMenu } from "@/hooks/useMerchantMenu";
import { useBroadcasts } from "@/hooks/useBroadcasts";
import { AppHeader } from "@/components/layout/AppHeader";
import { AdminImpersonationBar } from "@/components/admin/AdminImpersonationBar";
import { authService } from "@/services/auth.service";
import { ProfileDrawer } from "@/components/layout/ProfileDrawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Store, 
  ShoppingBag, 
  Zap, 
  Clock, 
  Plus, 
  Star, 
  Power, 
  CheckCircle2, 
  Radio,
  Sparkles,
  Loader2,
  Megaphone,
  X,
  Trash2,
  Edit2,
  ChefHat,
  Bike,
  PackageCheck,
  MessageSquare
} from "lucide-react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";
import { OrderDocument } from "@/types/order.types";
import { MenuItemDocument } from "@/types/merchant.types";
import { playOrderAlertSound, playSuccessChime } from "@/lib/sound";
import { motion, AnimatePresence } from "motion/react";

export default function MerchantDashboard() {
  const router = useRouter();
  const { user, userData, effectiveUid, impersonatedPersona, isImpersonating } = useAuthContext();
  const activeMerchantId = effectiveUid || user?.uid;

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [isFlashSaleActive, setIsFlashSaleActive] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  
  // Custom Store ID
  const [storeSlug, setStoreSlug] = useState(impersonatedPersona?.attributes?.storeSlug || userData?.storeSlug || "pak-manto");
  const [isEditingSlug, setIsEditingSlug] = useState(false);

  // Modal Add Menu
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState(20000);
  const [newItemDesc, setNewItemDesc] = useState("");
  const [isSavingMenu, setIsSavingMenu] = useState(false);

  // Modal Edit Menu
  const [isEditMenuOpen, setIsEditMenuOpen] = useState(false);
  const [editItemId, setEditItemId] = useState("");
  const [editItemName, setEditItemName] = useState("");
  const [editItemPrice, setEditItemPrice] = useState(0);
  const [editItemDesc, setEditItemDesc] = useState("");
  const [isEditingMenu, setIsEditingMenu] = useState(false);

  // Live incoming culinary orders
  const [merchantOrders, setMerchantOrders] = useState<OrderDocument[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Real-time menu items from Firestore
  const { menuItems, loading: loadingMenu } = useMerchantMenu(activeMerchantId);

  // Civic Broadcasts from Government
  const { broadcasts } = useBroadcasts("merchant");

  // Fallback initial products if Firestore has no menu yet
  const defaultProducts: MenuItemDocument[] = [
    { id: "p1", merchantId: user?.uid || "m1", name: "Selat Galantin Daging Spesial", price: 22000, isAvailable: true, soldToday: 18 },
    { id: "p2", merchantId: user?.uid || "m1", name: "Selat Bistik Daging Segar", price: 25000, isAvailable: true, soldToday: 12 },
    { id: "p3", merchantId: user?.uid || "m1", name: "Sop Matahari Khas Solo", price: 18000, isAvailable: true, soldToday: 9 },
    { id: "p4", merchantId: user?.uid || "m1", name: "Es Dawet Telasih Gula Aren", price: 8000, isAvailable: false, soldToday: 25 },
  ];

  const displayedProducts = menuItems.length > 0 ? menuItems : defaultProducts;

  // Real-time listener for incoming orders
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, COLLECTIONS.ORDERS),
      where("serviceType", "==", "kuliner")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const docs: OrderDocument[] = [];
      let hasNewPending = false;

      snapshot.forEach((d) => {
        const orderData = { id: d.id, ...d.data() } as OrderDocument;
        // Filter by active status and matching merchant if defined
        const isMatchingMerchant = 
          !orderData.merchantId || 
          orderData.merchantId === activeMerchantId || 
          orderData.merchantId === storeSlug ||
          orderData.merchantId === "m-1" ||
          orderData.merchantId === "sandbox-merchant-manto" ||
          orderData.merchantId === "pak-manto";

        if (isMatchingMerchant && orderData.status !== "completed" && orderData.status !== "cancelled") {
          docs.push(orderData);
          if (orderData.status === "pending") {
            hasNewPending = true;
          }
        }
      });

      if (hasNewPending && docs.length > merchantOrders.length) {
        playOrderAlertSound();
      }

      setMerchantOrders(docs);
      setLoadingOrders(false);
    });

    return () => unsub();
  }, [user, activeMerchantId, storeSlug]);

  const handleToggleProduct = async (item: MenuItemDocument) => {
    if (item.id && menuItems.some(m => m.id === item.id)) {
      await merchantService.toggleAvailability(item.id, !item.isAvailable).catch(() => {});
    }
  };

  const handleAddMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newItemName.trim()) return;

    setIsSavingMenu(true);
    try {
      await merchantService.addMenuItem({
        merchantId: user.uid,
        name: newItemName,
        price: Number(newItemPrice),
        description: newItemDesc,
        isAvailable: true,
      });

      setIsAddMenuOpen(false);
      setNewItemName("");
      setNewItemDesc("");
      setNewItemPrice(20000);
      playSuccessChime();
      alert("✅ Menu baru berhasil ditambahkan ke katalog warung Anda!");
    } catch (err) {
      alert("Gagal menambahkan menu.");
    } finally {
      setIsSavingMenu(false);
    }
  };

  const handleOpenEditMenu = (item: MenuItemDocument) => {
    setEditItemId(item.id || "");
    setEditItemName(item.name);
    setEditItemPrice(item.price);
    setEditItemDesc(item.description || "");
    setIsEditMenuOpen(true);
  };

  const handleEditMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItemId) return;
    setIsEditingMenu(true);
    try {
      await merchantService.updateMenuItem(editItemId, {
        name: editItemName,
        price: editItemPrice,
        description: editItemDesc,
      });
      setIsEditMenuOpen(false);
      alert("✅ Menu berhasil diperbarui!");
    } catch (err) {
      alert("Gagal memperbarui menu.");
    } finally {
      setIsEditingMenu(false);
    }
  };

  const handleDeleteMenu = async (itemId: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus menu ini dari katalog?")) {
      try {
        await merchantService.deleteMenuItem(itemId);
        alert("✅ Menu berhasil dihapus!");
      } catch (err) {
        alert("Gagal menghapus menu.");
      }
    }
  };

  const handleStartCooking = async (order: OrderDocument) => {
    if (!order.id || !user) return;
    setUpdatingOrderId(order.id);
    try {
      await orderService.merchantStartCooking(order.id, activeMerchantId || user.uid, order.customerId, order.driverId || undefined);
      playSuccessChime();
    } catch (err) {
      alert("Gagal mengupdate status memasak.");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleMarkReady = async (order: OrderDocument) => {
    if (!order.id || !user) return;
    setUpdatingOrderId(order.id);
    try {
      await orderService.merchantMarkFoodReady(order.id, activeMerchantId || user.uid, order.customerId, order.driverId || undefined);
      playSuccessChime();
    } catch (err) {
      alert("Gagal menandai makanan siap.");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleToggleFlashSale = async () => {
    if (!user) return;
    setIsBroadcasting(true);
    try {
      if (!isFlashSaleActive) {
        await broadcastService.createBroadcast({
          authorId: user.uid,
          institutionName: userData?.businessName || "Warung Mitra UMKM Solo",
          title: `⚡ Flash Sale 30% — ${userData?.businessName || "Warung Selat Solo"}`,
          body: "Flash Sale stok kuliner lezat diskon spesial untuk warga radius 2 km. Pesan sekarang sebelum kehabisan!",
          target: "customer",
          geofence: {
            center: { lat: -7.5755, lng: 110.8243 },
            radiusKm: 2.0,
            areaName: "Pasar Gede & Sriwedari"
          }
        });
        setIsFlashSaleActive(true);
        playSuccessChime();
        alert("⚡ Flash Sale Pasar Warga AKTIF! Notifikasi siaran diskon 30% sedang dibroadcast ke warga radius 2 km di Surakarta.");
      } else {
        setIsFlashSaleActive(false);
        alert("Flash Sale Pasar Warga telah dinonaktifkan.");
      }
    } catch (err) {
      alert("Gagal mempublikasikan siaran Flash Sale.");
    } finally {
      setIsBroadcasting(false);
    }
  };

  return (
    <div className="relative min-h-[100dvh] bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 flex flex-col justify-between pb-16 transition-colors duration-200">
      <AdminImpersonationBar />
      <AppHeader onOpenProfile={() => setIsProfileOpen(true)} />

      <main className="pt-20 px-4 max-w-lg w-full mx-auto space-y-4 flex-1">
        {/* Active Civic Broadcast Ticker if available */}
        {broadcasts.length > 0 && (
          <div className="p-3 rounded-2xl bg-teal-500/10 dark:bg-teal-950/30 border border-teal-500/30 flex items-start gap-2.5 shadow-xs">
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

        {/* Store Profile Card */}
        <div className="p-4 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white/95 dark:bg-[#0c1220]/95 space-y-3 shadow-sm">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-500/30 shrink-0">
                <Store className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900 dark:text-white leading-snug">
                  {userData?.businessName || "Warung Selat Mbak Lies"}
                </h2>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Pasar Gede, Solo</span>
                  <span>•</span>
                  <div className="flex items-center text-amber-500 dark:text-amber-400 font-bold">
                    <Star className="h-3 w-3 fill-amber-400 mr-0.5" /> 4.9
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                isOpen 
                  ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40"
                  : "bg-slate-200 dark:bg-zinc-800 text-slate-500 dark:text-zinc-500 border border-slate-300 dark:border-zinc-700"
              }`}
            >
              <Power className="h-3 w-3" />
              {isOpen ? "BUKA" : "TUTUP"}
            </button>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-white/[0.04] text-center">
            <div className="p-2 rounded-2xl bg-slate-50 dark:bg-white/[0.03]">
              <span className="text-[9px] text-slate-400 block font-bold uppercase">Omset Hari Ini</span>
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">Rp 640.000</span>
            </div>
            <div className="p-2 rounded-2xl bg-slate-50 dark:bg-white/[0.03]">
              <span className="text-[9px] text-slate-400 block font-bold uppercase">Pesanan Selesai</span>
              <span className="text-xs font-black text-slate-900 dark:text-white">28 Order</span>
            </div>
            <div className="p-2 rounded-2xl bg-slate-50 dark:bg-white/[0.03]">
              <span className="text-[9px] text-slate-400 block font-bold uppercase">Potongan Komisi</span>
              <span className="text-xs font-black text-orange-600 dark:text-orange-400">Rp 0 (100% Utuh)</span>
            </div>
          </div>
        </div>

        {/* Pasar Warga Flash Sale Launcher */}
        <div className={`p-3.5 rounded-2xl border transition-all ${
          isFlashSaleActive 
            ? "bg-rose-500/10 border-rose-500/40 shadow-xs" 
            : "bg-white/95 dark:bg-[#0c1220]/95 border-slate-200/80 dark:border-white/[0.08] shadow-xs"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl ${isFlashSaleActive ? "bg-rose-500 text-white" : "bg-rose-500/20 text-rose-500"}`}>
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Pasar Warga Flash Sale</h4>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400">Broadcast diskon stok makanan ke warga sekitar</p>
              </div>
            </div>

            <Button
              size="sm"
              onClick={handleToggleFlashSale}
              disabled={isBroadcasting}
              className={`h-8 px-3 rounded-xl text-xs font-bold cursor-pointer ${
                isFlashSaleActive 
                  ? "bg-rose-600 hover:bg-rose-500 text-white" 
                  : "bg-slate-200 dark:bg-zinc-800 text-slate-800 dark:text-zinc-300 hover:bg-slate-300 dark:hover:bg-zinc-700"
              }`}
            >
              {isBroadcasting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : isFlashSaleActive ? "Hentikan Promo" : "Aktifkan Flash Sale"}
            </Button>
          </div>
        </div>

        {/* Live Incoming Orders Section */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between pl-1">
            <div className="flex items-center gap-2">
              <Radio className="h-3.5 w-3.5 text-orange-500 animate-pulse" />
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Pesanan Kuliner Masuk ({merchantOrders.length})
              </h3>
            </div>
            <Badge variant="orange" size="sm" withDot>
              Live Radar
            </Badge>
          </div>

          {loadingOrders ? (
            <div className="p-6 text-center bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl">
              <Loader2 className="h-5 w-5 text-orange-500 animate-spin mx-auto mb-1.5" />
              <p className="text-xs text-slate-500">Memeriksa pesanan kuliner...</p>
            </div>
          ) : merchantOrders.length === 0 ? (
            <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white/95 dark:bg-[#0c1220]/95 text-center space-y-1 shadow-xs">
              <ChefHat className="h-6 w-6 text-slate-400 mx-auto" />
              <p className="text-xs font-bold text-slate-800 dark:text-zinc-200">Belum Ada Pesanan Kuliner Aktif</p>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                Pesanan kuliner dari pelanggan warga Solo akan langsung tampil di sini secara real-time.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {merchantOrders.map((order) => (
                <div key={order.id} className="p-4 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white/95 dark:bg-[#0c1220]/95 space-y-3 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="orange" size="sm">
                          Kuliner #{order.id?.slice(0, 6)}
                        </Badge>
                        <span className="text-[10px] font-bold text-slate-400">
                          {order.paymentMethod === "cash" ? "💵 Tunai" : "📱 QRIS"}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                        Tujuan: {order.dropoffLocation?.address}
                      </p>
                    </div>
                    <span className="text-sm font-black text-orange-600 dark:text-orange-400">
                      Rp {order.price.toLocaleString("id-ID")}
                    </span>
                  </div>

                  {/* Order Items List with Customer Cooking Notes */}
                  {order.items && order.items.length > 0 && (
                    <div className="bg-slate-50 dark:bg-white/[0.03] rounded-xl p-3 border border-slate-200/60 dark:border-white/[0.06] space-y-1.5">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                        Menu yang Harus Dimasak:
                      </p>
                      <ul className="space-y-1.5">
                        {order.items.map((item, idx) => (
                          <li key={idx} className="text-xs text-slate-700 dark:text-zinc-300">
                            <div className="flex justify-between items-center">
                              <span><strong>{item.qty}x</strong> {item.name}</span>
                              <span className="text-[10px] font-semibold text-slate-500">Rp {(item.price * item.qty).toLocaleString("id-ID")}</span>
                            </div>
                            {item.notes && (
                              <div className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded mt-0.5 flex items-center gap-1">
                                <MessageSquare className="h-2.5 w-2.5 shrink-0" />
                                <span>Catatan: "{item.notes}"</span>
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Driver Status Info */}
                  <div className="bg-slate-50 dark:bg-white/[0.03] rounded-xl p-2.5 border border-slate-200/60 dark:border-white/[0.06] text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`p-1.5 rounded-lg shrink-0 ${order.driverId ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/20 text-amber-600 dark:text-amber-400"}`}>
                        <Bike className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        {order.driverId ? (
                          <>
                            <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate">
                              Kurir: {order.driverName || "Mitra Driver Solo"}
                            </p>
                            <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold">
                              {order.status === "in_progress" ? "Sedang Mengantar ke Pelanggan" : "Sedang Menuju ke Warung"}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                              Mencari Kurir Terdekat...
                            </p>
                            <p className="text-[9px] text-slate-400">
                              Kurir akan langsung merapat ke warung
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    <Badge 
                      variant={
                        order.status === "cooking" ? "amber" :
                        order.status === "ready_for_pickup" ? "purple" :
                        order.status === "accepted" ? "blue" :
                        order.status === "in_progress" ? "emerald" :
                        "orange"
                      }
                      size="sm"
                      className="text-[9px] capitalize shrink-0"
                    >
                      {order.status === "cooking" ? "🍳 Dimasak" :
                       order.status === "ready_for_pickup" ? "🔔 Siap Diambil" :
                       order.status === "accepted" ? "🛵 Kurir OTW" :
                       order.status === "in_progress" ? "🚀 Diantar" :
                       "Menunggu"}
                    </Badge>
                  </div>

                  {/* Multi-Stage Order Action Buttons */}
                  <div className="pt-1">
                    {order.status === "pending" && (
                      <Button 
                        size="sm" 
                        disabled={updatingOrderId === order.id}
                        onClick={() => handleStartCooking(order)}
                        className="w-full bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold h-10 rounded-xl cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                      >
                        {updatingOrderId === order.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ChefHat className="h-4 w-4" />}
                        <span>Terima & Mulai Memasak 🍳</span>
                      </Button>
                    )}

                    {(order.status === "cooking" || (order.status === "accepted" && !order.completedAt)) && (
                      <Button 
                        size="sm" 
                        disabled={updatingOrderId === order.id}
                        onClick={() => handleMarkReady(order)}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold h-10 rounded-xl cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                      >
                        {updatingOrderId === order.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PackageCheck className="h-4 w-4" />}
                        <span>Makanan Siap / Ready to Pickup ✅</span>
                      </Button>
                    )}

                    {order.status === "ready_for_pickup" && (
                      <div className="w-full text-center p-2.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl text-xs font-bold border border-purple-500/20 flex items-center justify-center gap-2">
                        <PackageCheck className="h-4 w-4" />
                        <span>Makanan Siap di Kasir! Menunggu Driver Mengambil</span>
                      </div>
                    )}

                    {order.status === "in_progress" && (
                      <div className="w-full text-center p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold border border-emerald-500/20 flex items-center justify-center gap-2">
                        <Bike className="h-4 w-4" />
                        <span>Driver Sedang Mengantar ke Rumah Pelanggan</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product & Catalog Management */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between pl-1">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Kelola Menu & Stok Warung
            </h3>
            <Button 
              size="sm" 
              onClick={() => setIsAddMenuOpen(true)}
              className="h-7 text-xs bg-orange-600 hover:bg-orange-500 text-white rounded-xl gap-1 cursor-pointer"
            >
              <Plus className="h-3 w-3" /> Tambah Menu
            </Button>
          </div>

          <div className="space-y-2">
            {displayedProducts.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white/95 dark:bg-[#0c1220]/95 flex items-center justify-between shadow-xs"
              >
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{item.name}</p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-zinc-400">
                    <span className="text-orange-600 dark:text-orange-400 font-bold">Rp {item.price.toLocaleString("id-ID")}</span>
                    <span>•</span>
                    <span>Terjual: {item.soldToday || 0}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleToggleProduct(item)}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-colors cursor-pointer ${
                      item.isAvailable 
                        ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                        : "bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                    }`}
                  >
                    {item.isAvailable ? "Stok Ada" : "Habis"}
                  </button>
                  <button 
                    onClick={() => handleOpenEditMenu(item)}
                    className="p-1.5 text-slate-400 hover:text-orange-500 hover:bg-orange-500/10 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    onClick={() => item.id && handleDeleteMenu(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Modal Tambah Menu Baru */}
      {isAddMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/[0.1] rounded-3xl p-4 max-w-sm w-full space-y-3 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/[0.06] pb-2">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Plus className="h-4 w-4 text-orange-500" />
                Tambah Menu Makanan Baru
              </h3>
              <button 
                onClick={() => setIsAddMenuOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddMenu} className="space-y-2.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-zinc-300 text-[11px]">Nama Menu:</label>
                <input
                  type="text"
                  placeholder="Misal: Selat Galantin Daging Segar"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-zinc-300 text-[11px]">Harga (Rp):</label>
                <input
                  type="number"
                  step="1000"
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(Number(e.target.value))}
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-zinc-300 text-[11px]">Deskripsi Singkat:</label>
                <input
                  type="text"
                  placeholder="Porsi komplit dengan sayur dan kuah segar khas Solo"
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white"
                />
              </div>

              <Button
                type="submit"
                disabled={isSavingMenu}
                className="w-full h-10 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl mt-2 cursor-pointer text-xs"
              >
                {isSavingMenu ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                Simpan Menu ke Warung
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Menu */}
      {isEditMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/[0.1] rounded-3xl p-4 max-w-sm w-full space-y-3 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/[0.06] pb-2">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Edit2 className="h-4 w-4 text-orange-500" />
                Edit Menu Makanan
              </h3>
              <button 
                onClick={() => setIsEditMenuOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleEditMenu} className="space-y-2.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-zinc-300 text-[11px]">Nama Menu:</label>
                <input
                  type="text"
                  value={editItemName}
                  onChange={(e) => setEditItemName(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-zinc-300 text-[11px]">Harga (Rp):</label>
                <input
                  type="number"
                  step="1000"
                  value={editItemPrice}
                  onChange={(e) => setEditItemPrice(Number(e.target.value))}
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-zinc-300 text-[11px]">Deskripsi Singkat:</label>
                <input
                  type="text"
                  value={editItemDesc}
                  onChange={(e) => setEditItemDesc(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white"
                />
              </div>

              <Button
                type="submit"
                disabled={isEditingMenu}
                className="w-full h-10 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl mt-2 cursor-pointer text-xs"
              >
                {isEditingMenu ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                Simpan Perubahan
              </Button>
            </form>
          </div>
        </div>
      )}

      <ProfileDrawer isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
}
