"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { merchantService } from "@/services/merchant.service";
import { orderService } from "@/services/order.service";
import { UserDocument } from "@/types/user.types";
import { MenuItemDocument } from "@/types/merchant.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Store, 
  Star, 
  Clock,
  MapPin,
  UtensilsCrossed,
  ShoppingCart,
  Plus,
  Minus,
  Loader2
} from "lucide-react";

export default function StorePage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthContext();
  const storeId = params.id as string;

  const [merchant, setMerchant] = useState<UserDocument | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItemDocument[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Cart state
  const [cart, setCart] = useState<{item: MenuItemDocument, qty: number}[]>([]);
  const [isOrdering, setIsOrdering] = useState(false);

  useEffect(() => {
    if (!storeId) return;

    const fetchMerchant = async () => {
      try {
        const data = await merchantService.getMerchantBySlugOrId(storeId);
        if (data) {
          setMerchant(data);
          // Now fetch the menu items using the real uid
          const { collection, query, where, getDocs } = await import("firebase/firestore");
          const { db } = await import("@/lib/firebase");
          
          const q = query(
            collection(db, "menu_items"),
            where("merchantId", "==", data.uid)
          );
          const snap = await getDocs(q);
          const menus: MenuItemDocument[] = [];
          snap.forEach(d => {
            menus.push({ id: d.id, ...d.data() } as MenuItemDocument);
          });

          // Mock fallback jika tidak ada menu dan ini adalah mock data
          if (menus.length === 0 && data.uid.startsWith("m-")) {
            menus.push(
              { id: "menu-1", merchantId: data.uid, name: "Menu Spesial 1", description: "Menu andalan kami.", price: 15000, isAvailable: true, soldToday: 5 },
              { id: "menu-2", merchantId: data.uid, name: "Minuman Segar", description: "Sangat segar di siang hari.", price: 5000, isAvailable: true, soldToday: 10 }
            );
          }

          setMenuItems(menus);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMerchant();
  }, [storeId]);

  const updateCart = (item: MenuItemDocument, delta: number) => {
    setCart(prev => {
      const existing = prev.find(i => i.item.id === item.id);
      if (existing) {
        const newQty = existing.qty + delta;
        if (newQty <= 0) return prev.filter(i => i.item.id !== item.id);
        return prev.map(i => i.item.id === item.id ? { ...i, qty: newQty } : i);
      }
      if (delta > 0) {
        return [...prev, { item, qty: delta }];
      }
      return prev;
    });
  };

  const getQty = (itemId: string) => {
    return cart.find(i => i.item.id === itemId)?.qty || 0;
  };

  const totalItems = cart.reduce((sum, i) => sum + i.qty, 0);
  const totalPrice = cart.reduce((sum, i) => sum + (i.item.price * i.qty), 0);
  // Default ongkir untuk prototype
  const ongkir = 8000;
  const finalTotal = totalPrice + ongkir;

  const handleCheckout = async () => {
    if (!user) {
      alert("Silakan login terlebih dahulu untuk memesan.");
      return;
    }
    if (!merchant) return;

    setIsOrdering(true);
    try {
      const orderItems = cart.map(c => ({
        id: c.item.id!,
        name: c.item.name,
        price: c.item.price,
        qty: c.qty
      }));

      // Create Order
      const orderId = await orderService.createOrder({
        customerId: user.uid,
        merchantId: merchant.uid,
        serviceType: "kuliner",
        items: orderItems,
        // Untuk saat ini hardcode lokasi. Pada production, gunakan useLocation() atau place picker.
        pickupLocation: {
          address: merchant.address || "Lokasi Merchant",
          lat: -7.5755,
          lng: 110.8243
        },
        dropoffLocation: {
          address: "Lokasi Saya (Default)",
          lat: -7.58,
          lng: 110.83
        },
        price: finalTotal,
        paymentMethod: "cash",
      });

      // Clear cart & redirect
      setCart([]);
      router.push(`/order/${orderId}`);
    } catch (err: any) {
      alert(err.message || "Gagal membuat pesanan.");
      setIsOrdering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#030712]">
        <Loader2 className="h-6 w-6 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!merchant) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-[#030712] text-center">
        <Store className="h-12 w-12 text-slate-300 mb-4" />
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">Toko Tidak Ditemukan</h1>
        <p className="text-sm text-slate-500 mb-6">Mungkin URL salah atau toko telah ditutup.</p>
        <Button onClick={() => router.back()}>Kembali</Button>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 flex flex-col pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-[#030712]/80 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800">
        <div className="max-w-lg mx-auto w-full px-4 h-14 flex items-center gap-3">
          <button 
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex-1 font-bold text-sm truncate">
            {merchant.businessName || "Warung UMKM"}
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-lg w-full mx-auto px-4 py-4 space-y-6">
        {/* Merchant Info Card */}
        <div className="sg-card p-4 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 shadow-sm">
          <div className="flex gap-4 items-start">
            <div className="w-16 h-16 rounded-2xl bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 flex flex-col items-center justify-center border border-orange-200 dark:border-orange-900/50 shrink-0">
              <UtensilsCrossed className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                {merchant.businessName || merchant.displayName || "Toko Mitra"}
              </h1>
              <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3" /> {merchant.address || "Surakarta, Jawa Tengah"}
              </p>
              <div className="flex items-center gap-3 mt-2">
                <Badge variant="emerald" className="px-2 py-0.5 text-[10px]"><Star className="h-3 w-3 mr-1 fill-current" /> 4.9</Badge>
                <span className="text-[10px] text-slate-400 flex items-center gap-1"><Clock className="h-3 w-3" /> Buka</span>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold sg-editorial-title">Daftar Menu</h2>
          {menuItems.length === 0 ? (
            <div className="text-center p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-slate-300 dark:border-zinc-700">
              <p className="text-xs text-slate-500">Belum ada menu yang ditambahkan.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {menuItems.map(item => (
                <div key={item.id} className="sg-card p-3 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 shadow-sm flex items-center justify-between">
                  <div className="pr-3">
                    <h3 className={`text-sm font-bold ${!item.isAvailable ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                      {item.name}
                    </h3>
                    {item.description && (
                      <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">{item.description}</p>
                    )}
                    <p className={`text-xs font-black mt-1 ${!item.isAvailable ? 'text-slate-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      Rp {item.price.toLocaleString("id-ID")}
                    </p>
                  </div>
                  
                  {item.isAvailable ? (
                    <div className="flex items-center gap-3 shrink-0">
                      {getQty(item.id!) > 0 ? (
                        <>
                          <button 
                            onClick={() => updateCart(item, -1)}
                            className="w-7 h-7 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-xs font-bold w-3 text-center">{getQty(item.id!)}</span>
                          <button 
                            onClick={() => updateCart(item, 1)}
                            className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </>
                      ) : (
                        <Button 
                          size="sm" 
                          onClick={() => updateCart(item, 1)}
                          className="h-8 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3"
                        >
                          Tambah
                        </Button>
                      )}
                    </div>
                  ) : (
                    <Badge variant="outline" className="text-[10px] text-slate-400 border-slate-200">Habis</Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Cart Bottom Sheet (Visible only if cart has items) */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-white via-white to-transparent dark:from-[#030712] dark:via-[#030712] pointer-events-none">
          <div className="max-w-lg mx-auto w-full pointer-events-auto">
            <div className="sg-card bg-slate-900 dark:bg-zinc-900 p-4 rounded-3xl shadow-2xl flex flex-col gap-3 border border-slate-800">
              <div className="flex justify-between items-center text-white">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                    <ShoppingCart className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">Total {totalItems} item</p>
                    <p className="text-sm font-bold">Rp {totalPrice.toLocaleString("id-ID")}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400">+ Ongkir Rp {ongkir.toLocaleString("id-ID")}</p>
                  <p className="text-sm font-black text-emerald-400">Total Rp {finalTotal.toLocaleString("id-ID")}</p>
                </div>
              </div>
              <Button 
                onClick={handleCheckout}
                disabled={isOrdering}
                className="w-full h-11 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold rounded-2xl text-sm"
              >
                {isOrdering ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Pesan Sekarang
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
