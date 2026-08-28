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
import { Card } from "@/components/ui/card";
import { 
  Store, 
  ShoppingBag, 
  Zap, 
  TrendingUp, 
  Clock, 
  Plus, 
  Tag, 
  Star, 
  Power, 
  CheckCircle2, 
  Radio,
  ArrowRight,
  Sparkles,
  Loader2,
  Megaphone,
  X,
  Trash2,
  Edit2
} from "lucide-react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";
import { OrderDocument } from "@/types/order.types";
import { MenuItemDocument } from "@/types/merchant.types";

export default function MerchantDashboard() {
  const router = useRouter();
  const { user, userData } = useAuthContext();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [isFlashSaleActive, setIsFlashSaleActive] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  
  // Custom Store ID
  const [storeSlug, setStoreSlug] = useState(userData?.storeSlug || "selat-mbak-lies");
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

  // Real-time menu items from Firestore
  const { menuItems, loading: loadingMenu } = useMerchantMenu(user?.uid);

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
      snapshot.forEach((d) => {
        docs.push({ id: d.id, ...d.data() } as OrderDocument);
      });
      setMerchantOrders(docs);
      setLoadingOrders(false);
    });

    return () => unsub();
  }, [user]);

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

  const handleUpdateOrderStatus = async (orderId: string, newStatus: "accepted" | "in_progress") => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
    } catch (err) {
      alert("Gagal mengupdate status pesanan.");
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
          title: `⚡ Flash Sale 30% — ${userData?.businessName || "Warung Selat Mbak Lies"}`,
          body: "Flash Sale stok kuliner lezat diskon spesial untuk warga radius 2 km. Pesan sekarang sebelum kehabisan!",
          target: "customer",
          geofence: {
            center: { lat: -7.5755, lng: 110.8243 },
            radiusKm: 2.0,
            areaName: "Pasar Gede & Sriwedari"
          }
        });
        setIsFlashSaleActive(true);
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

      <main className="pt-20 px-4 max-w-lg w-full mx-auto space-y-5 flex-1">
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

        {/* Store Profile Card */}
        <div className="sg-card p-5 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-gradient-to-tr dark:from-orange-950/30 dark:via-zinc-900 dark:to-zinc-900 space-y-4 shadow-sm">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-500/30 shrink-0">
                <Store className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                  {userData?.businessName || "Warung Selat Mbak Lies"}
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Pasar Gede, Surakarta</span>
                  <span>•</span>
                  <div className="flex items-center text-amber-500 dark:text-amber-400 font-bold">
                    <Star className="h-3 w-3 fill-amber-400 mr-0.5" /> 4.9
                  </div>
                </div>
                
                {/* Store Link Customization */}
                <div className="mt-2">
                  <label className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold">Store Link Anda:</label>
                  <div className="flex items-center gap-2 mt-1">
                    {isEditingSlug ? (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-slate-400 hidden md:inline">ridesolo.com/store/</span>
                        <input
                          type="text"
                          value={storeSlug}
                          onChange={(e) => setStoreSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                          className="px-2 py-1 bg-slate-100 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-md text-xs w-32 focus:outline-none focus:border-orange-500"
                        />
                        <button 
                          onClick={async () => {
                            if (!user) return;
                            try {
                              await authService.updateUserProfile(user.uid, { storeSlug });
                              setIsEditingSlug(false);
                              alert("Store ID berhasil diperbarui!");
                            } catch(err) {
                              alert("Gagal memperbarui Store ID.");
                            }
                          }}
                          className="bg-emerald-500 text-white px-2 py-1 rounded-md text-xs font-bold"
                        >
                          Simpan
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-zinc-800 px-2 py-1 rounded-md cursor-pointer hover:bg-slate-200 dark:hover:bg-zinc-700" onClick={() => {
                          navigator.clipboard.writeText("ridesolo.com/store/" + storeSlug);
                          alert("Link Toko Disalin!");
                        }}>
                          ridesolo.com/store/<span className="text-orange-500">{storeSlug}</span>
                        </span>
                        <button 
                          onClick={() => setIsEditingSlug(true)}
                          className="text-[10px] text-slate-500 hover:text-orange-500 underline"
                        >
                          Ubah ID
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
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
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800/80 text-center">
            <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-zinc-800/40">
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-medium">Omset Hari Ini</span>
              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">Rp 640.000</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-zinc-800/40">
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-medium">Pesanan Selesai</span>
              <span className="text-sm font-black text-slate-900 dark:text-white">28 Order</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-zinc-800/40">
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-medium">Potongan Komisi</span>
              <span className="text-sm font-black text-teal-600 dark:text-teal-400">Rp 0 (Bebas)</span>
            </div>
          </div>
        </div>

        {/* Pasar Warga Flash Sale Launcher */}
        <div className={`p-4 rounded-3xl border transition-all ${
          isFlashSaleActive 
            ? "bg-rose-500/10 dark:bg-gradient-to-r dark:from-rose-950/60 dark:via-zinc-900 dark:to-rose-950/60 border-rose-500/40 shadow-sm" 
            : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 shadow-sm"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl ${isFlashSaleActive ? "bg-rose-500 text-white" : "bg-rose-500/20 text-rose-500"}`}>
                <Zap className="h-5 w-5" />
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

        {/* Live Incoming Orders */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-emerald-500 dark:text-emerald-400 animate-pulse" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white sg-editorial-title">Pesanan Masuk (Live)</h3>
            </div>
            <Badge variant="emerald" size="sm" withDot>
              {merchantOrders.length} Pesanan Aktif
            </Badge>
          </div>

          {loadingOrders ? (
            <div className="p-6 text-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl">
              <Loader2 className="h-5 w-5 text-emerald-500 animate-spin mx-auto mb-1.5" />
              <p className="text-xs text-slate-500">Memeriksa pesanan kuliner...</p>
            </div>
          ) : merchantOrders.length === 0 ? (
            <div className="sg-card p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 text-center space-y-1 shadow-sm">
              <p className="text-xs font-bold text-slate-800 dark:text-zinc-200">Belum Ada Pesanan Masuk</p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Pesanan kuliner dari pelanggan warga Solo akan langsung tampil di sini secara real-time.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {merchantOrders.map((order) => (
                <div key={order.id} className="sg-card p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 space-y-3 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge variant="amber" size="sm">
                        Kuliner Warga #{order.id?.slice(0, 6)}
                      </Badge>
                      <p className="text-xs font-bold text-slate-900 dark:text-white mt-1.5">
                        Tujuan: {order.dropoffLocation?.address}
                      </p>
                    </div>
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                      Rp {order.price.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center justify-between border-t border-slate-200 dark:border-zinc-800 pt-2">
                    <span>Status: <b className="text-slate-800 dark:text-zinc-200 uppercase">{order.status}</b></span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      {order.driverId ? "Driver Ditugaskan" : "Menunggu Driver"}
                    </span>
                  </div>

                  {/* Order Items List */}
                  {order.items && order.items.length > 0 && (
                    <div className="bg-slate-50 dark:bg-zinc-800/50 rounded-xl p-3 mt-2 border border-slate-200 dark:border-zinc-700/50">
                      <p className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Daftar Pesanan:</p>
                      <ul className="space-y-1">
                        {order.items.map((item, idx) => (
                          <li key={idx} className="flex justify-between items-start text-xs text-slate-700 dark:text-zinc-300">
                            <span>- {item.name} <strong className="ml-1 text-slate-900 dark:text-white">x{item.qty}</strong></span>
                            {item.notes && <span className="text-[10px] text-amber-600 dark:text-amber-400 block w-full ml-2">Catatan: {item.notes}</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Order Status Actions */}
                  <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 flex gap-2">
                    {order.status === "pending" && (
                      <Button 
                        size="sm" 
                        onClick={() => handleUpdateOrderStatus(order.id!, "accepted")}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold h-9 cursor-pointer"
                      >
                        Terima & Siapkan Pesanan
                      </Button>
                    )}
                    {order.status === "accepted" && (
                      <Button 
                        size="sm" 
                        onClick={() => handleUpdateOrderStatus(order.id!, "in_progress")}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold h-9 cursor-pointer"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Makanan Siap Diambil Driver
                      </Button>
                    )}
                    {order.status === "in_progress" && (
                      <div className="w-full text-center p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-bold border border-emerald-500/20">
                        Menunggu Driver Tiba
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product & Catalog Management */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white sg-editorial-title">Kelola Menu & Stok</h3>
            <Button 
              size="sm" 
              onClick={() => setIsAddMenuOpen(true)}
              className="h-7 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg gap-1 cursor-pointer"
            >
              <Plus className="h-3 w-3" /> Tambah Menu
            </Button>
          </div>

          <div className="space-y-2">
            {displayedProducts.map((item) => (
              <div
                key={item.id}
                className="sg-card p-3 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/80 flex items-center justify-between shadow-sm"
              >
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{item.name}</p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-zinc-400">
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Rp {item.price.toLocaleString("id-ID")}</span>
                    <span>•</span>
                    <span>Terjual: {item.soldToday || 0}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
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
                    className="p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => item.id && handleDeleteMenu(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Modal Tambah Menu Baru */}
      {isAddMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="h-4 w-4 text-emerald-500" />
                Tambah Menu Makanan Baru
              </h3>
              <button 
                onClick={() => setIsAddMenuOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddMenu} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-zinc-300">Nama Menu:</label>
                <input
                  type="text"
                  placeholder="Misal: Selat Galantin Daging Segar"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-zinc-300">Harga (Rp):</label>
                <input
                  type="number"
                  step="1000"
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-zinc-300">Deskripsi Singkat:</label>
                <input
                  type="text"
                  placeholder="Porsi komplit dengan sayur dan kuah segar khas Solo"
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white"
                />
              </div>

              <Button
                type="submit"
                disabled={isSavingMenu}
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl mt-2 cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit2 className="h-4 w-4 text-emerald-500" />
                Edit Menu Makanan
              </h3>
              <button 
                onClick={() => setIsEditMenuOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleEditMenu} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-zinc-300">Nama Menu:</label>
                <input
                  type="text"
                  value={editItemName}
                  onChange={(e) => setEditItemName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-zinc-300">Harga (Rp):</label>
                <input
                  type="number"
                  step="1000"
                  value={editItemPrice}
                  onChange={(e) => setEditItemPrice(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-zinc-300">Deskripsi Singkat:</label>
                <input
                  type="text"
                  value={editItemDesc}
                  onChange={(e) => setEditItemDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white"
                />
              </div>

              <Button
                type="submit"
                disabled={isEditingMenu}
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl mt-2 cursor-pointer"
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
