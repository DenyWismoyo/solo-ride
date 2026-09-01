"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { merchantService } from "@/services/merchant.service";
import { MerchantDocument, MenuItemDocument } from "@/types/merchant.types";
import { CartCheckoutSheet } from "@/components/merchant/CartCheckoutSheet";
import { 
  Loader2, MapPin, Star, Clock, ChevronLeft, Plus, Minus, ShoppingBag, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface CartItem extends MenuItemDocument {
  qty: number;
}

export default function MerchantStorefront() {
  const params = useParams();
  const router = useRouter();
  const merchantId = params.id as string;
  const { user, loading: authLoading } = useAuthContext();

  const [merchant, setMerchant] = useState<MerchantDocument | null>(null);
  const [products, setProducts] = useState<MenuItemDocument[]>([]);
  const [loading, setLoading] = useState(true);

  // Cart State (In-Memory for performance, clears on refresh)
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    if (!merchantId) return;
    const fetchStore = async () => {
      // First try to fetch by slug or ID (we added getMerchantBySlugOrId previously)
      const data = await merchantService.getMerchantBySlugOrId(merchantId);
      if (data) {
        // Convert UserDocument mock to MerchantDocument shape for UI
        setMerchant({
          id: data.uid,
          name: data.displayName || data.businessName || "Merchant",
          category: "kuliner", // Default fallback
          address: data.address || "Surakarta",
          isOpen: true,
          rating: 4.8,
          totalReviews: 120,
          location: { lat: -7.5755, lng: 110.8243 },
        } as MerchantDocument);
        
        // Fetch products
        const items = await merchantService.getMerchantProducts(data.uid);
        if (items.length === 0) {
          // Provide mock products for testing if empty
          setProducts([
            { id: "p1", merchantId: data.uid, name: "Nasi Goreng Spesial", price: 25000, isAvailable: true },
            { id: "p2", merchantId: data.uid, name: "Es Teh Manis", price: 5000, isAvailable: true },
            { id: "p3", merchantId: data.uid, name: "Sate Ayam (10 Tusuk)", price: 30000, isAvailable: true },
          ] as MenuItemDocument[]);
        } else {
          setProducts(items);
        }
      }
      setLoading(false);
    };
    fetchStore();
  }, [merchantId]);

  const handleAddToCart = (product: MenuItemDocument) => {
    if (!product.isAvailable) return;
    setCart(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prev => {
      const exists = prev.find(item => item.id === productId);
      if (exists && exists.qty > 1) {
        return prev.map(item => item.id === productId ? { ...item, qty: item.qty - 1 } : item);
      }
      return prev.filter(item => item.id !== productId);
    });
  };

  const getQty = (productId: string) => {
    return cart.find(item => item.id === productId)?.qty || 0;
  };

  const cartTotalItems = useMemo(() => cart.reduce((acc, curr) => acc + curr.qty, 0), [cart]);
  const cartTotalPrice = useMemo(() => cart.reduce((acc, curr) => acc + (curr.price * curr.qty), 0), [cart]);

  if (loading || authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-zinc-950 flex-col space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!merchant) {
    return (
      <div className="flex h-screen items-center justify-center flex-col space-y-3 px-4 text-center">
        <Info className="h-12 w-12 text-slate-400" />
        <h2 className="text-lg font-bold">Toko Tidak Ditemukan</h2>
        <Button onClick={() => router.back()}>Kembali</Button>
      </div>
    );
  }

  return (
    <div className="relative min-h-[100dvh] bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 pb-28">
      
      {/* Immersive Store Header */}
      <div className="relative h-56 bg-slate-800 rounded-b-[2.5rem] overflow-hidden shadow-lg">
        {/* Placeholder Banner Image */}
        <div className="absolute inset-0 opacity-40 bg-gradient-to-tr from-orange-900 to-slate-900 mix-blend-multiply" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80')] bg-cover bg-center opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#030712]/90 via-[#030712]/40 to-transparent" />
        
        {/* Top Nav */}
        <div className="absolute top-0 inset-x-0 p-4 flex justify-between items-center z-10">
          <Button 
            size="icon" 
            variant="ghost" 
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 border border-white/10"
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>

        {/* Store Info Overlay */}
        <div className="absolute bottom-6 inset-x-6 z-10">
          <div className="flex gap-1.5 mb-2">
            <Badge variant="orange" className="bg-orange-500/90 text-white border-none shadow-md backdrop-blur-sm">
              {merchant.category === "kuliner" ? "Kuliner Solo" : "Pasar Tradisional"}
            </Badge>
            {merchant.isOpen ? (
              <Badge variant="emerald" className="bg-emerald-500/90 text-white border-none shadow-md backdrop-blur-sm">Buka</Badge>
            ) : (
              <Badge variant="rose" className="bg-rose-500/90 text-white border-none shadow-md backdrop-blur-sm">Tutup</Badge>
            )}
          </div>
          <h1 className="text-2xl font-black text-white leading-tight drop-shadow-md tracking-tight">
            {merchant.name}
          </h1>
          <p className="text-[11px] text-slate-300 font-medium mt-1 flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {merchant.address}
          </p>
          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center gap-1 text-[11px] font-bold text-white bg-white/20 px-2 py-1 rounded-full backdrop-blur-md">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {merchant.rating || "4.8"}
            </div>
            <div className="text-[10px] text-slate-300">
              Zero Commission Merchant 🤝
            </div>
          </div>
        </div>
      </div>

      {/* Catalog Grid */}
      <main className="px-4 pt-6 max-w-lg mx-auto space-y-4">
        <h3 className="text-lg font-black tracking-tight sg-editorial-title mb-2">Daftar Menu</h3>
        
        <div className="grid grid-cols-1 gap-3">
          {products.map((p) => {
            const qty = getQty(p.id!);
            return (
              <div 
                key={p.id} 
                className={`sg-card p-4 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 flex justify-between shadow-sm transition-all ${!p.isAvailable ? 'opacity-60 grayscale' : ''}`}
              >
                <div className="pr-3">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{p.name}</h4>
                  {p.description && <p className="text-[10px] text-slate-500 line-clamp-2 mt-1">{p.description}</p>}
                  <p className="text-[13px] font-black text-orange-600 dark:text-orange-400 mt-2">
                    Rp {p.price.toLocaleString('id-ID')}
                  </p>
                </div>
                
                <div className="flex flex-col justify-end shrink-0">
                  {!p.isAvailable ? (
                    <Badge variant="outline" className="text-[10px]">Habis</Badge>
                  ) : qty === 0 ? (
                    <Button 
                      size="sm" 
                      onClick={() => handleAddToCart(p)}
                      className="h-8 rounded-xl px-4 text-[11px] font-bold bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-zinc-700 shadow-sm"
                    >
                      Tambah
                    </Button>
                  ) : (
                    <div className="flex items-center gap-3 bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl border border-slate-200 dark:border-zinc-700">
                      <button onClick={() => handleRemoveFromCart(p.id!)} className="w-6 h-6 flex items-center justify-center rounded-lg bg-white dark:bg-zinc-900 text-rose-500 shadow-sm">
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="text-xs font-black w-3 text-center">{qty}</span>
                      <button onClick={() => handleAddToCart(p)} className="w-6 h-6 flex items-center justify-center rounded-lg bg-white dark:bg-zinc-900 text-emerald-500 shadow-sm">
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Floating Cart Pill */}
      {cartTotalItems > 0 && !isCheckoutOpen && (
        <div className="fixed bottom-6 inset-x-0 px-4 z-40 max-w-lg mx-auto">
          <button 
            onClick={() => setIsCheckoutOpen(true)}
            className="w-full bg-orange-600 hover:bg-orange-500 text-white rounded-[2rem] p-4 flex items-center justify-between shadow-xl shadow-orange-600/30 backdrop-blur-md transition-all active:scale-95"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center relative">
                <ShoppingBag className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-white text-orange-600 font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {cartTotalItems}
                </span>
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold text-orange-200 uppercase tracking-widest">Total Pesanan</p>
                <p className="text-base font-black">Rp {cartTotalPrice.toLocaleString('id-ID')}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 font-bold text-xs bg-white/20 px-4 py-2 rounded-full">
              Checkout <ChevronLeft className="h-4 w-4 rotate-180" />
            </div>
          </button>
        </div>
      )}

      {/* Checkout Bottom Sheet */}
      <CartCheckoutSheet 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)}
        merchant={merchant}
        cart={cart}
        total={cartTotalPrice}
      />
    </div>
  );
}
