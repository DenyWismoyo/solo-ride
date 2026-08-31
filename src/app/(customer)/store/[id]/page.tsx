"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { merchantService } from "@/services/merchant.service";
import { orderService } from "@/services/order.service";
import { UserDocument } from "@/types/user.types";
import { MenuItemDocument } from "@/types/merchant.types";
import { DEFAULT_MERCHANT_MENUS } from "@/constants/merchants";
import { DeliveryAddressPickerModal } from "@/components/order/DeliveryAddressPickerModal";
import { LocationPoint, PaymentMethod } from "@/types/order.types";
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
  Loader2, 
  ShieldCheck, 
  Sparkles, 
  MessageSquarePlus, 
  Navigation, 
  X,
  Banknote,
  QrCode,
  Check,
  ChevronRight,
  Pencil,
  Map,
  Home
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { playSuccessChime } from "@/lib/sound";

interface CartEntry {
  item: MenuItemDocument;
  qty: number;
  notes?: string;
}

export default function StorePage() {
  const router = useRouter();
  const params = useParams();
  const { user, userData } = useAuthContext();
  const storeId = params.id as string;

  const [merchant, setMerchant] = useState<UserDocument | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItemDocument[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Cart & Delivery state
  const [cart, setCart] = useState<CartEntry[]>([]);
  const [dropoffPoint, setDropoffPoint] = useState<LocationPoint>({
    lat: -7.5621,
    lng: 110.8547,
    address: "Jl. Kolonel Sutarto No. 45, Jebres, Surakarta"
  });
  const [deliveryNote, setDeliveryNote] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [isOrdering, setIsOrdering] = useState(false);

  // Modals & Drawers
  const [isCheckoutDrawerOpen, setIsCheckoutDrawerOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [notesModalItem, setNotesModalItem] = useState<MenuItemDocument | null>(null);
  const [itemNoteInput, setItemNoteInput] = useState("");

  // Load default address from user profile if available
  useEffect(() => {
    if (userData?.savedAddresses && userData.savedAddresses.length > 0) {
      const defaultAddr = userData.savedAddresses.find(a => a.isDefault) || userData.savedAddresses[0];
      if (defaultAddr) {
        setDropoffPoint({
          lat: defaultAddr.lat || -7.5621,
          lng: defaultAddr.lng || 110.8547,
          address: defaultAddr.address,
        });
        if (defaultAddr.detail) {
          setDeliveryNote(defaultAddr.detail);
        }
      }
    }
  }, [userData]);

  useEffect(() => {
    if (!storeId) return;

    const fetchMerchant = async () => {
      try {
        const data = await merchantService.getMerchantBySlugOrId(storeId);
        if (data) {
          setMerchant(data);
          
          let menus: MenuItemDocument[] = [];
          try {
            const { collection, query, where, getDocs } = await import("firebase/firestore");
            const { db } = await import("@/lib/firebase");
            
            const q = query(
              collection(db, "menu_items"),
              where("merchantId", "==", data.uid)
            );
            const snap = await getDocs(q);
            snap.forEach((d) => {
              menus.push({ id: d.id, ...d.data() } as MenuItemDocument);
            });
          } catch (fireErr) {
            console.warn("Firestore query fallback:", fireErr);
          }

          // Fallback to curated local merchant menus
          if (menus.length === 0) {
            const fallbackKey = data.storeSlug || data.uid || storeId;
            const defaultCatalog = DEFAULT_MERCHANT_MENUS[fallbackKey] || 
                                   DEFAULT_MERCHANT_MENUS[data.uid] || 
                                   DEFAULT_MERCHANT_MENUS["m-1"];
            if (defaultCatalog) {
              menus = defaultCatalog;
            }
          }

          setMenuItems(menus);
        }
      } catch (err) {
        console.error("Error loading store:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMerchant();
  }, [storeId]);

  const updateCart = (item: MenuItemDocument, delta: number, customNotes?: string) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.item.id === item.id);
      if (existing) {
        const newQty = existing.qty + delta;
        if (newQty <= 0) {
          const updated = prev.filter((i) => i.item.id !== item.id);
          if (updated.length === 0) setIsCheckoutDrawerOpen(false);
          return updated;
        }
        return prev.map((i) => (i.item.id === item.id ? { ...i, qty: newQty, notes: customNotes !== undefined ? customNotes : i.notes } : i));
      }
      if (delta > 0) {
        return [...prev, { item, qty: delta, notes: customNotes || "" }];
      }
      return prev;
    });
  };

  const handleSaveNotes = () => {
    if (!notesModalItem) return;
    updateCart(notesModalItem, 0, itemNoteInput);
    setNotesModalItem(null);
    setItemNoteInput("");
  };

  const getQty = (itemId: string) => {
    return cart.find((i) => i.item.id === itemId)?.qty || 0;
  };

  const getNotes = (itemId: string) => {
    return cart.find((i) => i.item.id === itemId)?.notes || "";
  };

  const totalItems = cart.reduce((sum, i) => sum + i.qty, 0);
  const totalPrice = cart.reduce((sum, i) => sum + i.item.price * i.qty, 0);
  const ongkir = 8000; // Flat fee Surakarta
  const serviceFee = 0; // 0% komisi / bebas biaya layanan
  const finalTotal = totalPrice + ongkir + serviceFee;

  const handleConfirmOrder = async () => {
    if (!user) {
      alert("Silakan masuk (login) terlebih dahulu untuk memesan.");
      router.push("/login");
      return;
    }
    if (!merchant || cart.length === 0) return;

    setIsOrdering(true);
    try {
      const orderItems = cart.map((c) => {
        const itemObj: any = {
          id: c.item.id || "item-custom",
          name: c.item.name,
          price: Number(c.item.price),
          qty: Number(c.qty),
        };
        if (c.notes && c.notes.trim()) {
          itemObj.notes = c.notes.trim();
        }
        return itemObj;
      });

      const payload: any = {
        customerId: user.uid,
        customerName: userData?.displayName || user.displayName || "Warga Pemesan",
        customerPhone: userData?.phone || "",
        merchantId: merchant.uid || storeId,
        merchantName: merchant.businessName || merchant.displayName || "Warung UMKM",
        serviceType: "kuliner",
        items: orderItems,
        pickupLocation: {
          address: merchant.address || merchant.businessName || "Warung Mitra Solo",
          lat: merchant.location?.lat ?? -7.5755,
          lng: merchant.location?.lng ?? 110.8243,
        },
        dropoffLocation: {
          address: dropoffPoint.address || "Surakarta",
          lat: dropoffPoint.lat ?? -7.5621,
          lng: dropoffPoint.lng ?? 110.8547,
        },
        price: Number(finalTotal),
        paymentMethod: paymentMethod || "cash",
      };

      if (deliveryNote && deliveryNote.trim()) {
        payload.customerNote = deliveryNote.trim();
      }

      const orderId = await orderService.createOrder(payload);

      playSuccessChime();
      setCart([]);
      setIsCheckoutDrawerOpen(false);
      router.push(`/order/${orderId}`);
    } catch (err: any) {
      alert(err.message || "Gagal membuat pesanan.");
    } finally {
      setIsOrdering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#030712] space-y-3">
        <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
        <p className="text-xs text-slate-500">Menyiapkan katalog menu warung...</p>
      </div>
    );
  }

  if (!merchant) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-[#030712] text-center">
        <Store className="h-12 w-12 text-slate-300 dark:text-zinc-700 mb-4" />
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">Warung Tidak Ditemukan</h1>
        <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6">Mungkin tautan tidak sesuai atau warung sedang tutup.</p>
        <Button onClick={() => router.back()} className="rounded-xl">Kembali</Button>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 flex flex-col pb-36 transition-colors duration-200">
      {/* Top Header */}
      <div className="sticky top-0 z-20 bg-white/90 dark:bg-[#0c1220]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-white/[0.08]">
        <div className="max-w-lg mx-auto w-full px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.back()}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5 text-slate-700 dark:text-zinc-300" />
            </button>
            <span className="font-bold text-sm truncate max-w-[200px]">
              {merchant.businessName || merchant.displayName || "Warung UMKM"}
            </span>
          </div>
          <Badge variant="orange" size="sm" className="flex items-center gap-1 font-bold">
            <ShieldCheck className="h-3 w-3" /> 0% Komisi
          </Badge>
        </div>
      </div>

      <main className="flex-1 max-w-lg w-full mx-auto px-4 py-4 space-y-4">
        {/* Merchant Hero Card */}
        <div className="p-4 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white/95 dark:bg-[#0c1220]/95 shadow-sm space-y-3">
          <div className="flex gap-3.5 items-start">
            <div className="w-16 h-16 rounded-2xl bg-orange-500/15 text-orange-600 dark:text-orange-400 flex flex-col items-center justify-center border border-orange-500/20 shrink-0">
              <UtensilsCrossed className="h-7 w-7" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                {merchant.businessName || merchant.displayName || "Toko Mitra"}
              </h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5 truncate">
                <MapPin className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> {merchant.address || "Surakarta, Jawa Tengah"}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="inline-flex items-center text-[10px] font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                  <Star className="h-3 w-3 fill-amber-400 mr-1" /> 4.9 (Teruji)
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                  <Clock className="h-3 w-3" /> 15-20 mnt
                </span>
              </div>
            </div>
          </div>

          {/* Delivery Destination Selector Capsule */}
          <div 
            onClick={() => setIsAddressModalOpen(true)}
            className="p-3 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-slate-200/60 dark:border-white/[0.06] hover:border-orange-500/40 cursor-pointer transition-all space-y-1 group"
          >
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-zinc-400">
              <span className="flex items-center gap-1">
                <Navigation className="h-3 w-3 text-rose-500" /> Antar Makanan Ke:
              </span>
              <span className="text-orange-600 dark:text-orange-400 group-hover:underline flex items-center gap-0.5 font-bold">
                <Pencil className="h-2.5 w-2.5" /> Ubah / Pilih di Peta
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 pt-0.5">
              <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                {dropoffPoint.address}
              </p>
              <Badge variant="emerald" size="sm" className="text-[9px] shrink-0">
                Ongkir Rp 8.000
              </Badge>
            </div>
          </div>
        </div>

        {/* Menu Items List */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between pl-1">
            <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-orange-500" /> Pilihan Menu Spesial:
            </h2>
            <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-semibold">
              {menuItems.length} Menu
            </span>
          </div>

          {menuItems.length === 0 ? (
            <div className="text-center p-8 bg-white dark:bg-[#0c1220] rounded-3xl border border-slate-200 dark:border-zinc-800 space-y-2">
              <UtensilsCrossed className="h-8 w-8 text-slate-300 dark:text-zinc-700 mx-auto" />
              <p className="text-xs text-slate-500 font-medium">Belum ada menu yang ditambahkan.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {menuItems.map((item) => {
                const currentQty = getQty(item.id!);
                const currentNotes = getNotes(item.id!);

                return (
                  <div 
                    key={item.id} 
                    className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white/95 dark:bg-[#0c1220]/95 shadow-sm flex flex-col gap-2 hover:border-orange-500/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0 pr-2">
                        <h3 className={`text-xs font-bold leading-snug ${!item.isAvailable ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                          {item.name}
                        </h3>
                        {item.description && (
                          <p className="text-[10px] text-slate-500 dark:text-zinc-400 line-clamp-2 mt-0.5 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                        <p className={`text-xs font-black mt-1.5 ${!item.isAvailable ? 'text-slate-400' : 'text-orange-600 dark:text-orange-400'}`}>
                          Rp {item.price.toLocaleString("id-ID")}
                        </p>
                      </div>
                      
                      {item.isAvailable ? (
                        <div className="flex items-center gap-2 shrink-0">
                          {currentQty > 0 ? (
                            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-800 rounded-xl p-1 border border-slate-200 dark:border-zinc-700">
                              <button 
                                onClick={() => updateCart(item, -1)}
                                className="w-6 h-6 rounded-lg bg-white dark:bg-zinc-700 flex items-center justify-center text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-600 shadow-xs cursor-pointer"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="text-xs font-black w-4 text-center text-slate-900 dark:text-white">
                                {currentQty}
                              </span>
                              <button 
                                onClick={() => updateCart(item, 1)}
                                className="w-6 h-6 rounded-lg bg-orange-600 text-white flex items-center justify-center shadow-xs cursor-pointer hover:bg-orange-500"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <Button 
                              size="sm" 
                              onClick={() => updateCart(item, 1)}
                              className="h-8 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold px-3 cursor-pointer shadow-sm"
                            >
                              Tambah
                            </Button>
                          )}
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-[9px] text-slate-400 border-slate-300">Habis</Badge>
                      )}
                    </div>

                    {/* Optional Note Row if item in cart */}
                    {currentQty > 0 && (
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/[0.04] text-[10px]">
                        <button
                          type="button"
                          onClick={() => {
                            setNotesModalItem(item);
                            setItemNoteInput(currentNotes);
                          }}
                          className="text-orange-600 dark:text-orange-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <MessageSquarePlus className="h-3 w-3" />
                          <span>{currentNotes ? `Catatan: "${currentNotes}"` : "+ Tambah Catatan (Pedas/Kuah)"}</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Notes Input Modal */}
      {notesModalItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/[0.1] rounded-3xl p-4 max-w-xs w-full space-y-3 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/[0.06] pb-2">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                Catatan: {notesModalItem.name}
              </h3>
              <button 
                onClick={() => setNotesModalItem(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <textarea
              rows={3}
              value={itemNoteInput}
              onChange={(e) => setItemNoteInput(e.target.value)}
              placeholder="Misal: Sambal dipisah, tidak pakai micin, kuah banyak..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
            />
            <Button
              onClick={handleSaveNotes}
              className="w-full h-10 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl"
            >
              Simpan Catatan
            </Button>
          </div>
        </div>
      )}

      {/* Delivery Address Picker Modal (Saved Addresses, Search, GPS, Map Pin Drop) */}
      <DeliveryAddressPickerModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        currentAddress={dropoffPoint}
        userUid={user?.uid}
        savedAddresses={userData?.savedAddresses}
        onSelectAddress={(point, detailNotes) => {
          setDropoffPoint(point);
          if (detailNotes && !deliveryNote) {
            setDeliveryNote(detailNotes);
          }
        }}
      />

      {/* Floating Cart Bottom Bar (Opens Checkout Sheet) */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-3.5 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent pointer-events-none">
          <div className="max-w-lg mx-auto w-full pointer-events-auto">
            <div className="bg-white/95 dark:bg-[#0c1220]/95 p-3.5 rounded-2xl shadow-2xl flex flex-col gap-2.5 border border-orange-500/30 backdrop-blur-2xl">
              <div className="flex justify-between items-center text-slate-900 dark:text-white">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                    <ShoppingCart className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase">{totalItems} Menu Dipilih</p>
                    <p className="text-xs font-black text-slate-900 dark:text-white">Rp {totalPrice.toLocaleString("id-ID")}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-slate-400 font-semibold">+ Ongkir Rp {ongkir.toLocaleString("id-ID")}</p>
                  <p className="text-sm font-black text-orange-600 dark:text-orange-400">Total Rp {finalTotal.toLocaleString("id-ID")}</p>
                </div>
              </div>

              <Button 
                onClick={() => setIsCheckoutDrawerOpen(true)}
                className="w-full h-11 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black rounded-xl text-xs cursor-pointer shadow-lg shadow-orange-600/30 flex items-center justify-center gap-1.5"
              >
                <span>Lihat Ringkasan & Lanjut Pembayaran</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CHECKOUT / ORDER REVIEW DRAWER MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isCheckoutDrawerOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-xs">
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="bg-white dark:bg-[#0c1220] border-t border-slate-200 dark:border-white/[0.1] rounded-t-3xl max-w-lg w-full max-h-[85dvh] flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Sheet Header */}
              <div className="p-4 border-b border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    <ShoppingCart className="h-4 w-4 text-orange-500" />
                    Ringkasan Pesanan Kuliner
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Warung: <strong className="text-slate-700 dark:text-zinc-300">{merchant.businessName || merchant.displayName}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCheckoutDrawerOpen(false)}
                  className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Sheet Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* 1. Chosen Items Breakdown */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                    <span>Menu Dipilih ({totalItems})</span>
                    <span className="text-[10px] text-orange-600 dark:text-orange-400 lowercase font-normal">klik +/- untuk ubah</span>
                  </div>

                  <div className="bg-slate-50 dark:bg-white/[0.03] rounded-2xl p-3 border border-slate-200/60 dark:border-white/[0.06] space-y-2.5">
                    {cart.map(({ item, qty, notes }) => (
                      <div key={item.id} className="space-y-1 pb-2 border-b border-slate-100 dark:border-white/[0.04] last:border-none last:pb-0">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex-1 min-w-0 pr-2">
                            <p className="font-bold text-slate-900 dark:text-white truncate">{item.name}</p>
                            <p className="text-[10px] text-slate-400">Rp {item.price.toLocaleString("id-ID")} / porsi</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-900 dark:text-white">
                              Rp {(item.price * qty).toLocaleString("id-ID")}
                            </span>

                            <div className="flex items-center gap-1 bg-white dark:bg-zinc-800 rounded-lg p-0.5 border border-slate-200 dark:border-zinc-700">
                              <button
                                onClick={() => updateCart(item, -1)}
                                className="w-5 h-5 rounded flex items-center justify-center text-slate-600 dark:text-zinc-300 hover:bg-slate-100"
                              >
                                <Minus className="h-2.5 w-2.5" />
                              </button>
                              <span className="text-[10px] font-bold w-3.5 text-center">{qty}</span>
                              <button
                                onClick={() => updateCart(item, 1)}
                                className="w-5 h-5 rounded flex items-center justify-center text-orange-600 hover:bg-orange-50"
                              >
                                <Plus className="h-2.5 w-2.5" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {notes && (
                          <div className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded flex items-center gap-1">
                            <MessageSquarePlus className="h-3 w-3 shrink-0" />
                            <span>Catatan: "{notes}"</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Destination & Delivery Notes with interactive Change Button */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
                      Alamat Pengantaran
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAddressModalOpen(true)}
                      className="text-[11px] font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Pencil className="h-3 w-3" />
                      <span>Ubah Alamat</span>
                    </button>
                  </div>
                  
                  <div className="p-3 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-slate-200/60 dark:border-white/[0.06] space-y-2">
                    <div 
                      onClick={() => setIsAddressModalOpen(true)}
                      className="flex items-start gap-2.5 text-xs cursor-pointer group"
                    >
                      <div className="p-2 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 dark:text-white leading-tight group-hover:text-orange-600 transition-colors">
                          {dropoffPoint.address}
                        </p>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                          Surakarta • Ongkir Flat Rp 8.000
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsAddressModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-slate-200/70 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-[10px] font-bold shrink-0 hover:bg-orange-500 hover:text-white transition-colors"
                      >
                        Pilih Lain
                      </button>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-white/[0.04]">
                      <input
                        type="text"
                        placeholder="Tambahkan catatan untuk kurir (misal: pagar hijau / titip satpam)..."
                        value={deliveryNote}
                        onChange={(e) => setDeliveryNote(e.target.value)}
                        className="w-full text-xs p-2 rounded-xl bg-white dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Payment Method Choice */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
                    Metode Pembayaran
                  </span>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cash")}
                      className={`p-2.5 rounded-2xl border text-left flex items-center gap-2.5 cursor-pointer transition-all ${
                        paymentMethod === "cash"
                          ? "bg-orange-500/10 border-orange-500 text-orange-600 dark:text-orange-400"
                          : "bg-slate-50 dark:bg-white/[0.03] border-slate-200/60 dark:border-white/[0.06] text-slate-700 dark:text-zinc-300"
                      }`}
                    >
                      <div className={`p-1.5 rounded-xl ${paymentMethod === "cash" ? "bg-orange-500 text-white" : "bg-slate-200 dark:bg-zinc-800"}`}>
                        <Banknote className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold leading-tight">Tunai (COD)</p>
                        <p className="text-[9px] opacity-70">Bayar ke kurir</p>
                      </div>
                      {paymentMethod === "cash" && <Check className="h-3.5 w-3.5" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("qris")}
                      className={`p-2.5 rounded-2xl border text-left flex items-center gap-2.5 cursor-pointer transition-all ${
                        paymentMethod === "qris"
                          ? "bg-orange-500/10 border-orange-500 text-orange-600 dark:text-orange-400"
                          : "bg-slate-50 dark:bg-white/[0.03] border-slate-200/60 dark:border-white/[0.06] text-slate-700 dark:text-zinc-300"
                      }`}
                    >
                      <div className={`p-1.5 rounded-xl ${paymentMethod === "qris" ? "bg-orange-500 text-white" : "bg-slate-200 dark:bg-zinc-800"}`}>
                        <QrCode className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold leading-tight">QRIS Instan</p>
                        <p className="text-[9px] opacity-70">Bebas biaya admin</p>
                      </div>
                      {paymentMethod === "qris" && <Check className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                {/* 4. Detailed Cost Breakdown */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-white/[0.06] text-xs">
                  <div className="flex justify-between text-slate-500 dark:text-zinc-400">
                    <span>Subtotal Makanan ({totalItems} item)</span>
                    <span>Rp {totalPrice.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 dark:text-zinc-400">
                    <span>Ongkir Pengantaran Flat Solo</span>
                    <span>Rp {ongkir.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 dark:text-zinc-400">
                    <span>Biaya Layanan Koperasi</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">Rp 0 (Gratis)</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-zinc-800 text-sm font-black">
                    <span>Total Tagihan</span>
                    <span className="text-orange-600 dark:text-orange-400 text-base">
                      Rp {finalTotal.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                {/* 5. Estimated Arrival Notice */}
                <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center gap-2.5 text-xs text-orange-800 dark:text-orange-300">
                  <Clock className="h-4 w-4 shrink-0 text-orange-600" />
                  <p className="text-[11px] leading-tight">
                    Estimasi tiba: <strong>20-30 Menit</strong> (10 mnt masak warung + 15 mnt pengantaran kurir).
                  </p>
                </div>
              </div>

              {/* Sheet Bottom Confirm Button */}
              <div className="p-4 border-t border-slate-100 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.02]">
                <Button
                  onClick={handleConfirmOrder}
                  disabled={isOrdering}
                  className="w-full h-12 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black rounded-2xl text-xs cursor-pointer shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2"
                >
                  {isOrdering ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Konfirmasi & Pesan Makanan (Rp {finalTotal.toLocaleString("id-ID")})</span>
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
