"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { orderService } from "@/services/order.service";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Store, 
  ArrowLeft, 
  Clock,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  Loader2,
  Minus,
  Plus
} from "lucide-react";

// Mock data for flash sale / subsidized products
const FLASH_SALE_ITEMS = [
  {
    id: "fs-1",
    name: "Beras Rojolele 5kg (Subsidi Pemkot)",
    merchant: "Koperasi Warga Jebres",
    originalPrice: 75000,
    price: 55000,
    stock: 12,
    image: "🍚"
  },
  {
    id: "fs-2",
    name: "Minyak Goreng 2L Sunco",
    merchant: "Toko Sembako Makmur",
    originalPrice: 38000,
    price: 29000,
    stock: 5,
    image: "🛢️"
  },
  {
    id: "fs-3",
    name: "Telur Ayam Ras 1kg",
    merchant: "Agen Telur Berkah",
    originalPrice: 28000,
    price: 24000,
    stock: 20,
    image: "🥚"
  }
];

export default function PasarWargaPage() {
  const router = useRouter();
  const { user } = useAuthContext();

  const [cart, setCart] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const deliveryFee = 8000; // Flat fee for Pasar Warga

  const handleUpdateCart = (itemId: string, delta: number) => {
    setCart(prev => {
      const current = prev[itemId] || 0;
      const next = Math.max(0, current + delta);
      
      const newCart = { ...prev };
      if (next === 0) {
        delete newCart[itemId];
      } else {
        newCart[itemId] = next;
      }
      return newCart;
    });
  };

  const getSubtotal = () => {
    return Object.entries(cart).reduce((total, [itemId, qty]) => {
      const item = FLASH_SALE_ITEMS.find(i => i.id === itemId);
      return total + (item?.price || 0) * qty;
    }, 0);
  };

  const subtotal = getSubtotal();
  const total = subtotal > 0 ? subtotal + deliveryFee : 0;
  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);

  const handleCheckout = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    setIsSubmitting(true);
    try {
      // Convert cart to items array
      const items = Object.entries(cart).map(([itemId, qty]) => {
        const item = FLASH_SALE_ITEMS.find(i => i.id === itemId)!;
        return {
          id: item.id,
          name: item.name,
          price: item.price,
          qty
        };
      });

      const orderId = await orderService.createOrder({
        customerId: user.uid,
        serviceType: "pasar",
        pickupLocation: { lat: -7.5755, lng: 110.8243, address: "Pasar Gede Solo (Titik Kumpul)" }, // Demo logic
        dropoffLocation: { lat: -7.56, lng: 110.83, address: "Rumah Customer" }, // Demo logic
        price: total,
        paymentMethod: "cash",
        items
      });

      router.push(`/order/${orderId}`);
    } catch (err) {
      alert("Gagal membuat pesanan Pasar Warga.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 flex flex-col pb-28">
      <AppHeader onOpenProfile={() => {}} />

      <main className="pt-20 px-4 max-w-lg w-full mx-auto space-y-4">
        {/* Header Back & Title */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.back()}
            className="p-2 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white cursor-pointer transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Store className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">Pasar Warga</h1>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400">Sembako subsidi & flash sale lokal</p>
            </div>
          </div>
        </div>

        {/* Flash Sale Banner */}
        <div className="sg-card p-5 rounded-3xl bg-gradient-to-br from-rose-500 to-pink-600 border-none text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <Sparkles className="w-24 h-24" />
          </div>
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-1.5">
              <Badge variant="outline" className="bg-white text-rose-600 border-none font-black px-2 shadow-sm">FLASH SALE</Badge>
              <div className="flex items-center gap-1 text-xs font-bold bg-black/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
                <Clock className="w-3 h-3" /> Berakhir 02:45:12
              </div>
            </div>
            <h2 className="text-xl font-black tracking-tight leading-tight">
              Program Pasar Murah<br/>Pemkot Surakarta
            </h2>
            <p className="text-xs text-rose-100 max-w-[200px]">
              Subsidi harga sembako untuk warga Solo. Kuota terbatas tiap harinya!
            </p>
          </div>
        </div>

        {/* Product List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pl-1">
            <h3 className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
              Katalog Subsidi Hari Ini
            </h3>
          </div>

          {FLASH_SALE_ITEMS.map((item) => {
            const qty = cart[item.id] || 0;
            return (
              <div key={item.id} className="sg-card p-3 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 shadow-sm flex gap-3">
                <div className="w-20 h-20 rounded-xl bg-slate-100 dark:bg-zinc-800/50 flex items-center justify-center text-4xl shrink-0">
                  {item.image}
                </div>
                
                <div className="flex-1 flex flex-col justify-between py-0.5">
                  <div className="space-y-0.5">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                        {item.name}
                      </h4>
                    </div>
                    <p className="text-[10px] font-medium text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                      <Store className="w-3 h-3" /> {item.merchant}
                    </p>
                  </div>

                  <div className="flex items-end justify-between mt-2">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 line-through font-medium">
                        Rp {item.originalPrice.toLocaleString('id-ID')}
                      </span>
                      <div className="text-sm font-black text-rose-600 dark:text-rose-400">
                        Rp {item.price.toLocaleString('id-ID')}
                      </div>
                    </div>
                    
                    {qty === 0 ? (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleUpdateCart(item.id, 1)}
                        className="h-8 rounded-xl text-xs font-bold border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white"
                      >
                        Tambah
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2 bg-slate-100 dark:bg-zinc-800 rounded-xl p-1 border border-slate-200 dark:border-zinc-700">
                        <button 
                          onClick={() => handleUpdateCart(item.id, -1)}
                          className="w-6 h-6 rounded-lg bg-white dark:bg-zinc-700 flex items-center justify-center text-slate-700 dark:text-zinc-300 shadow-sm"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold w-4 text-center text-slate-900 dark:text-white">{qty}</span>
                        <button 
                          onClick={() => handleUpdateCart(item.id, 1)}
                          disabled={qty >= item.stock}
                          className="w-6 h-6 rounded-lg bg-rose-500 text-white flex items-center justify-center shadow-sm disabled:opacity-50"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Floating Checkout Bar */}
      {subtotal > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-[#030712] border-t border-slate-200 dark:border-zinc-800 z-50">
          <div className="max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="text-slate-500 dark:text-zinc-400">Ongkir Flat: Rp {deliveryFee.toLocaleString('id-ID')}</span>
              <span className="font-bold text-slate-900 dark:text-white">Total: <span className="text-rose-600 dark:text-rose-400 text-sm font-black ml-1">Rp {total.toLocaleString('id-ID')}</span></span>
            </div>
            
            <Button
              onClick={handleCheckout}
              disabled={isSubmitting}
              className="w-full h-12 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-2xl shadow-lg shadow-rose-500/25 flex items-center justify-between px-5"
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                <span>Pesan {totalItems} Barang</span>
              </div>
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
