"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { orderService } from "@/services/order.service";
import { MerchantDocument } from "@/types/merchant.types";
import { CartItem } from "@/app/(customer)/merchant/[id]/page";
import { MapLocationPickerModal } from "@/components/map/MapLocationPickerModal";
import { LocationPoint } from "@/types/order.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, MapPin, Loader2, ArrowRight, Navigation, Clock, MessageSquare, Utensils } from "lucide-react";
import { calculateFare } from "@/lib/pricing";
import { calculateDistanceKm } from "@/lib/geo";
import { merchantService } from "@/services/merchant.service";

interface CartCheckoutSheetProps {
  isOpen: boolean;
  onClose: () => void;
  merchant: MerchantDocument;
  cart: CartItem[];
  total: number;
}

export function CartCheckoutSheet({ isOpen, onClose, merchant, cart, total }: CartCheckoutSheetProps) {
  const { user, userData } = useAuthContext();
  const router = useRouter();

  const [isMapOpen, setIsMapOpen] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState<LocationPoint | null>(null);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<"reguler" | "titip">("reguler");

  // Calculate distance & fare
  const distance = useMemo(() => {
    if (!merchant.location || !deliveryLocation) return 0;
    return calculateDistanceKm(
      merchant.location.lat, merchant.location.lng,
      deliveryLocation.lat, deliveryLocation.lng
    );
  }, [merchant.location, deliveryLocation]);

  const deliveryFee = useMemo(() => {
    if (distance === 0) return 0;
    // Base formula from pricing config
    const service = deliveryMethod === "titip" ? "titip" : "kuliner";
    return calculateFare(service, distance).total;
  }, [distance, deliveryMethod]);

  const finalTotal = total + deliveryFee;

  const handleCheckout = async () => {
    if (!user || !deliveryLocation || !merchant.location) return;
    
    setIsSubmitting(true);
    try {
      // 1. Create the order
      const orderId = await orderService.createOrder({
        customerId: user.uid,
        customerName: userData?.displayName || user.displayName || "Pelanggan",
        customerPhone: userData?.phone || "081234567890",
        merchantId: merchant.id || "",
        merchantName: merchant.name,
        serviceType: deliveryMethod === "titip" ? "titip" : (merchant.category === "pasar" ? "pasar" : "kuliner"),
        pickupLocation: {
          lat: merchant.location.lat,
          lng: merchant.location.lng,
          address: merchant.address || ""
        },
        dropoffLocation: deliveryLocation,
        price: finalTotal, // Includes delivery fee + food total
        subtotal: total,
        deliveryFee,
        items: cart.map(c => ({
          id: c.id!,
          name: c.name,
          price: c.price,
          qty: c.qty
        })),
        customerNote: notes,
      }, "pending_merchant");

      // Titip and kuliner/pasar orders start as pending_merchant so the merchant can prepare first
      // We pass "pending_merchant" to the initialStatus of createOrder
      // So no need to update status separately!

      onClose();
      router.push(`/order/${orderId}`);
    } catch (err: any) {
      alert("Gagal membuat pesanan: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />
      
      <div className="fixed inset-x-0 bottom-0 z-50 bg-white dark:bg-zinc-950 rounded-t-[2.5rem] shadow-2xl transform transition-transform border-t border-slate-200 dark:border-zinc-800 flex flex-col max-h-[90vh]">
        
        {/* Handle Bar */}
        <div className="w-full flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-12 h-1.5 bg-slate-300 dark:bg-zinc-700 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-zinc-800/80 shrink-0">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Checkout Pesanan</h2>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5 flex items-center gap-1">
              <Utensils className="h-3 w-3" /> {merchant.name}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-900 text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Scrollable */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* Delivery Location Selector */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider pl-1">
              Lokasi Pengiriman
            </h3>
            
            <button 
              onClick={() => setIsMapOpen(true)}
              className="w-full sg-card p-4 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 hover:bg-slate-50 dark:hover:bg-zinc-900 flex items-center justify-between transition-colors shadow-sm text-left"
            >
              <div className="flex items-center gap-3 overflow-hidden pr-2">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${deliveryLocation ? "bg-emerald-500/10 text-emerald-600" : "bg-orange-500/10 text-orange-600"}`}>
                  <Navigation className="h-5 w-5" />
                </div>
                <div className="truncate">
                  {deliveryLocation ? (
                    <>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Alamat Pengiriman</p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{deliveryLocation.address}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Pilih Lokasi Tujuan</p>
                      <p className="text-[11px] text-slate-500">Tentukan titik antar di peta</p>
                    </>
                  )}
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 shrink-0" />
            </button>
          </div>

          {/* Delivery Method Selector */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider pl-1">
              Metode Pengiriman
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setDeliveryMethod("reguler")}
                className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-colors ${
                  deliveryMethod === "reguler" 
                  ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500 text-emerald-900 dark:text-emerald-300" 
                  : "bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-400"
                }`}
              >
                <span className="text-xs font-bold">Reguler (Langsung)</span>
                <span className="text-[10px] opacity-80">Driver antar langsung</span>
              </button>
              
              <button
                onClick={() => setDeliveryMethod("titip")}
                className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-colors relative overflow-hidden ${
                  deliveryMethod === "titip" 
                  ? "bg-orange-50 dark:bg-orange-500/10 border-orange-500 text-orange-900 dark:text-orange-300" 
                  : "bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-400"
                }`}
              >
                <div className="absolute -right-4 top-0 bg-orange-500 text-white text-[9px] font-bold px-5 py-0.5 rotate-45 shadow-sm">HEMAT</div>
                <span className="text-xs font-bold">Titip Tetangga</span>
                <span className="text-[10px] opacity-80">Batching rute</span>
              </button>
            </div>
          </div>

          {/* Notes Input */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 pl-1">
              <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
                Catatan Pesanan
              </label>
            </div>
            <input
              type="text"
              placeholder="Contoh: Pedas sedang, jangan pakai bawang"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-orange-500/50 placeholder:text-slate-400 shadow-sm"
            />
          </div>

          {/* Order Summary */}
          <div className="sg-card rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                Rincian Pesanan
              </h3>
              <Badge variant="outline" className="text-[10px] bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700">
                {cart.reduce((a,c) => a + c.qty, 0)} Item
              </Badge>
            </div>
            
            <div className="p-4 space-y-3 text-xs">
              {cart.map((item, i) => (
                <div key={i} className="flex justify-between items-start font-medium text-slate-700 dark:text-zinc-300">
                  <div className="flex items-start gap-2">
                    <span className="font-black text-orange-600 dark:text-orange-400">{item.qty}x</span>
                    <span>{item.name}</span>
                  </div>
                  <span>Rp {(item.price * item.qty).toLocaleString('id-ID')}</span>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-zinc-800/80 space-y-2 bg-slate-50/50 dark:bg-zinc-900/50">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Subtotal Makanan</span>
                <span>Rp {total.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Ongkir Driver (100% Untuk Driver)</span>
                <span>{deliveryFee > 0 ? `Rp ${deliveryFee.toLocaleString('id-ID')}` : '-'}</span>
              </div>
              {distance > 0 && (
                <div className="flex justify-between text-[10px] text-emerald-600 dark:text-emerald-400 font-medium pt-1">
                  <span>Jarak Pengiriman</span>
                  <span>{distance.toFixed(1)} km</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Sticky */}
        <div className="p-4 border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shrink-0 pb-safe">
          <div className="flex justify-between items-end mb-3 px-2">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Pembayaran</p>
              <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5 flex items-center gap-2">
                Rp {finalTotal.toLocaleString('id-ID')}
              </div>
            </div>
            <Badge variant="emerald" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-2.5 py-1">
              Tunai
            </Badge>
          </div>
          
          <Button
            onClick={handleCheckout}
            disabled={!deliveryLocation || isSubmitting}
            className="w-full h-12 bg-gradient-to-r from-orange-600 to-rose-600 hover:from-orange-500 hover:to-rose-500 text-white rounded-2xl font-bold shadow-lg shadow-orange-600/20 text-sm flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : !deliveryLocation ? (
              "Pilih Lokasi Tujuan Dulu"
            ) : (
              <>Pesan Sekarang <ArrowRight className="h-4 w-4" /></>
            )}
          </Button>
        </div>
      </div>

      {isMapOpen && (
        <MapLocationPickerModal
          isOpen={isMapOpen}
          onClose={() => setIsMapOpen(false)}
          onSelect={(loc) => {
            setDeliveryLocation(loc);
            setIsMapOpen(false);
          }}
          initialLocation={deliveryLocation || (merchant.location ? { ...merchant.location, address: merchant.address || "" } : undefined)}
        />
      )}
    </>
  );
}
