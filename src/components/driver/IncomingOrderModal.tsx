"use client";

import React, { useState, useEffect } from "react";
import { OrderDocument } from "@/types/order.types";
import { playOrderAlertSound, stopOrderAlertSound, playSuccessChime } from "@/lib/sound";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Navigation, 
  Loader2, 
  Bike, 
  Car, 
  Package, 
  UtensilsCrossed, 
  ShoppingBag, 
  X, 
  ArrowRight, 
  ShieldCheck, 
  Coins,
  Clock,
  Banknote
} from "lucide-react";

interface IncomingOrderModalProps {
  order: OrderDocument | null;
  onAccept: (order: OrderDocument) => Promise<void>;
  onSkip: (orderId: string) => void;
}

const TOTAL_COUNTDOWN_SECONDS = 30;

export function IncomingOrderModal({ order, onAccept, onSkip }: IncomingOrderModalProps) {
  const [timeLeft, setTimeLeft] = useState(TOTAL_COUNTDOWN_SECONDS);
  const [isAccepting, setIsAccepting] = useState(false);

  // Trigger sound alert on mount while order modal is visible
  useEffect(() => {
    if (order) {
      setTimeLeft(TOTAL_COUNTDOWN_SECONDS);
      playOrderAlertSound(true);
    }
    return () => {
      stopOrderAlertSound();
    };
  }, [order?.id]);

  // Countdown timer
  useEffect(() => {
    if (!order) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          stopOrderAlertSound();
          if (order.id) onSkip(order.id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [order, onSkip]);

  if (!order) return null;

  const handleAcceptClick = async () => {
    stopOrderAlertSound();
    setIsAccepting(true);
    try {
      await onAccept(order);
      playSuccessChime();
    } catch (err) {
      console.error(err);
    } finally {
      setIsAccepting(false);
    }
  };

  const handleSkipClick = () => {
    stopOrderAlertSound();
    if (order.id) {
      onSkip(order.id);
    }
  };

  const progressPercentage = (timeLeft / TOTAL_COUNTDOWN_SECONDS) * 100;
  const timerColor = 
    timeLeft > 15 
      ? "bg-emerald-500" 
      : timeLeft > 7 
        ? "bg-amber-500" 
        : "bg-rose-500";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white/95 dark:bg-[#0c1220]/95 rounded-t-[2.5rem] sm:rounded-[2.2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-3xl overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300">
        {/* Countdown Timer Progress Bar */}
        <div className="w-full bg-slate-200/80 dark:bg-white/[0.06] h-2 overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ease-linear ${timerColor}`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Modal Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] bg-slate-50/70 dark:bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center animate-pulse">
              {order.serviceType === "mobil" ? (
                <Car className="h-5 w-5" />
              ) : order.serviceType === "kirim" ? (
                <Package className="h-5 w-5" />
              ) : order.serviceType === "kuliner" ? (
                <UtensilsCrossed className="h-5 w-5" />
              ) : order.serviceType === "titip" ? (
                <ShoppingBag className="h-5 w-5" />
              ) : (
                <Bike className="h-5 w-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={
                    order.serviceType === "kuliner" ? "orange" :
                    order.serviceType === "kirim" || order.serviceType === "titip" ? "blue" :
                    "emerald"
                  } 
                  size="sm"
                >
                  {order.serviceType === "kuliner" ? "Pesanan Kuliner UMKM" :
                   order.serviceType === "kirim" ? "Pengiriman Kilat" :
                   order.serviceType === "titip" ? "Titip Belanja Warga" :
                   order.serviceType === "mobil" ? "Mobil Warga" :
                   "Ojek Motor Solo"}
                </Badge>
                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                  <Clock className="h-3 w-3 text-amber-500" /> {timeLeft}s
                </span>
              </div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                Pesanan Baru Masuk!
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSkipClick}
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Price & Earning Highlight */}
          <div className="bg-emerald-500/15 dark:bg-emerald-500/20 rounded-[1.6rem] p-4 flex items-center justify-between shadow-xs">
            <div>
              <span className="text-[11px] font-extrabold text-slate-600 dark:text-zinc-300 uppercase tracking-wider block">
                Pendapatan Tunai Bersih
              </span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                Rp {order.price.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-500/25 px-2.5 py-1 rounded-xl">
                <ShieldCheck className="h-3.5 w-3.5" /> 100% Tanpa Komisi
              </span>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1 font-semibold">+10 Poin Reward</p>
            </div>
          </div>

          {/* Route Details */}
          <div className="bg-slate-50/90 dark:bg-white/[0.03] rounded-[1.6rem] p-4 space-y-3.5 shadow-xs">
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 bg-emerald-500/20 text-emerald-500 rounded-lg shrink-0 mt-0.5">
                <MapPin className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase block">Titik Jemput:</span>
                  {(order as any).distanceToPickupKm !== undefined && (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      ~{((order as any).distanceToPickupKm < 1 ? Math.round((order as any).distanceToPickupKm * 1000) + " m" : (order as any).distanceToPickupKm.toFixed(1) + " km")} dari posisi Anda
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold text-slate-900 dark:text-white leading-snug line-clamp-2">
                  {order.pickupLocation?.address || "Surakarta, Jawa Tengah"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="p-1.5 bg-rose-500/20 text-rose-500 rounded-lg shrink-0 mt-0.5">
                <Navigation className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase block">Lokasi Tujuan:</span>
                <p className="text-xs font-semibold text-slate-900 dark:text-white leading-snug line-clamp-2">
                  {order.dropoffLocation?.address || "Surakarta, Jawa Tengah"}
                </p>
              </div>
            </div>
          </div>

          {/* Item Breakdown (For Kuliner/Titip/Kirim) */}
          {order.items && order.items.length > 0 && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-amber-700 dark:text-amber-400">
                <span className="flex items-center gap-1.5">
                  <Package className="h-3.5 w-3.5" /> Rincian Belanja ({order.items.length} Item)
                </span>
                {order.serviceType === "titip" && (
                  <span className="text-[10px] font-black">
                    Talangan: Rp {order.items.reduce((sum, i) => sum + (i.price * i.qty), 0).toLocaleString("id-ID")}
                  </span>
                )}
              </div>
              <div className="space-y-1">
                {order.items.map((item, idx) => (
                  <div key={item.id || idx} className="flex justify-between text-[11px] text-slate-700 dark:text-zinc-300">
                    <span>• {item.name} <span className="font-bold text-slate-500">x{item.qty}</span></span>
                    {item.price > 0 && <span>Rp {(item.price * item.qty).toLocaleString("id-ID")}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customer Note if any */}
          {order.customerNote && (
            <div className="text-[11px] p-2.5 bg-slate-100 dark:bg-zinc-800/70 rounded-xl text-slate-600 dark:text-zinc-300 italic border border-slate-200 dark:border-zinc-700">
              💬 "{order.customerNote}"
            </div>
          )}
        </div>

        {/* Modal Action Buttons */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/40 grid grid-cols-3 gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={handleSkipClick}
            disabled={isAccepting}
            className="col-span-1 h-13 border-slate-300 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 font-bold rounded-2xl text-xs cursor-pointer"
          >
            Lewati
          </Button>

          <Button
            type="button"
            onClick={handleAcceptClick}
            disabled={isAccepting}
            className="col-span-2 h-13 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-600/30 text-xs sm:text-sm cursor-pointer flex items-center justify-center gap-2"
          >
            {isAccepting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                TERIMA ORDER SEKARANG
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
