"use client";

import React from "react";
import { Power, Sparkles, Bike, Package, UtensilsCrossed, Zap, Radio, Loader2, MapPin, Navigation, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KecamatanFilterPill } from "./KecamatanFilterPill";
import { DriverRadarMap } from "@/components/map/DriverRadarMap";
import { DriverHeatmapControls } from "./DriverHeatmapControls";
import { HotspotDemandLeaderboard } from "./HotspotDemandLeaderboard";
import { HotspotDetailDrawer } from "./HotspotDetailDrawer";
import { DEMAND_HOTSPOTS_SOLO, DemandHotspot } from "@/constants/geofencing";
import { PendingOrderWithDistance } from "@/hooks/usePendingOrders";
import { formatDistance } from "@/lib/geo";
import { BroadcastDocument } from "@/types/notification.types";
import { CivicBroadcastBanner } from "@/components/civic/broadcast/CivicBroadcastBanner";

interface DriverRadarTabProps {
  isOnline: boolean;
  onToggleOnline: () => void;
  isUpdatingStatus: boolean;
  acceptRide: boolean;
  acceptSend: boolean;
  acceptFood: boolean;
  onToggleRide: () => void;
  onToggleSend: () => void;
  onToggleFood: () => void;
  autoAccept: boolean;
  onToggleAutoAccept: () => void;
  isKarcisExpired: boolean;
  isBuyingKarcis: boolean;
  onBuyKarcis: (isTrial: boolean) => void;
  location: { lat: number; lng: number } | null;
  selectedDistrictId: string;
  onSelectDistrict: (id: string) => void;
  focusedHotspot: DemandHotspot | null;
  onFocusHotspot: (hotspot: DemandHotspot | null) => void;
  pendingOrders: PendingOrderWithDistance[];
  ordersLoading: boolean;
  onAcceptOrder: (order: PendingOrderWithDistance) => void;
  acceptingOrderId: string | null;
  broadcasts?: BroadcastDocument[];
}

export function DriverRadarTab({
  isOnline,
  onToggleOnline,
  isUpdatingStatus,
  acceptRide,
  acceptSend,
  acceptFood,
  onToggleRide,
  onToggleSend,
  onToggleFood,
  autoAccept,
  onToggleAutoAccept,
  isKarcisExpired,
  isBuyingKarcis,
  onBuyKarcis,
  location,
  selectedDistrictId,
  onSelectDistrict,
  focusedHotspot,
  onFocusHotspot,
  pendingOrders,
  ordersLoading,
  onAcceptOrder,
  acceptingOrderId,
  broadcasts = []
}: DriverRadarTabProps) {
  return (
    <main className="pt-20 px-4 space-y-5 max-w-lg w-full mx-auto flex-1 pb-24">
      {/* Official Civic Broadcast Alert for Drivers */}
      {broadcasts.length > 0 && (
        <CivicBroadcastBanner broadcasts={broadcasts} role="driver" />
      )}

      {/* Power Button & Online Status */}
      <div className="relative">
        <div className="sg-bento-card p-6 text-center space-y-4">
          <div className="flex flex-col items-center justify-center space-y-3">
            <button
              onClick={onToggleOnline}
              disabled={isUpdatingStatus}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 transform active:scale-95 shadow-xl cursor-pointer ${
                isOnline
                  ? "bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-emerald-500/30 ring-8 ring-emerald-500/20"
                  : "bg-gradient-to-tr from-slate-200 to-slate-300 dark:from-zinc-800 dark:to-zinc-700 text-slate-500 dark:text-zinc-400 ring-8 ring-slate-200/50 dark:ring-zinc-800/50"
              }`}
            >
              {isUpdatingStatus ? (
                <Loader2 className="h-10 w-10 animate-spin" />
              ) : (
                <Power className="h-10 w-10" />
              )}
            </button>

            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center justify-center gap-2">
                {isOnline ? (
                  <>
                    <span className="h-3 w-3 rounded-full bg-emerald-500 animate-ping" />
                    Radar Aktif: Siap Narik
                  </>
                ) : (
                  "Status: Istirahat (Offline)"
                )}
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                {isOnline
                  ? "Sistem siap mencocokkan pesanan di Kota Surakarta"
                  : "Tekan tombol daya untuk mulai menerima pesanan"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Service Preference Toggles */}
      <div className="sg-bento-card p-4 space-y-3">
        <h4 className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider pl-1">
          Preferensi Layanan Aktif:
        </h4>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={onToggleRide}
            className={`p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
              acceptRide
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shadow-xs"
                : "bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.06] text-slate-400"
            }`}
          >
            <Bike className="h-4 w-4" />
            <span>Ojek/Mobil</span>
          </button>

          <button
            type="button"
            onClick={onToggleSend}
            className={`p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
              acceptSend
                ? "bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400 shadow-xs"
                : "bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.06] text-slate-400"
            }`}
          >
            <Package className="h-4 w-4" />
            <span>Titip/Kirim</span>
          </button>

          <button
            type="button"
            onClick={onToggleFood}
            className={`p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
              acceptFood
                ? "bg-orange-500/10 border-orange-500/30 text-orange-600 dark:text-orange-400 shadow-xs"
                : "bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.06] text-slate-400"
            }`}
          >
            <UtensilsCrossed className="h-4 w-4" />
            <span>Makanan</span>
          </button>
        </div>

        {/* Auto-Accept Toggle Switch */}
        <div className="pt-2 border-t border-slate-100 dark:border-white/[0.04] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-xl ${autoAccept ? "bg-emerald-500/20 text-emerald-500 animate-pulse" : "bg-slate-100 dark:bg-white/[0.04] text-slate-400"}`}>
              <Zap className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Mode Auto-Accept (Terima Instan)
              </span>
              <span className="text-[10px] text-slate-500 dark:text-zinc-400">
                {autoAccept ? "Otomatis mengambil order pertama yang cocok" : "Tampilkan konfirmasi pop-up 30 detik"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onToggleAutoAccept}
            className={`w-11 h-6 rounded-full transition-colors cursor-pointer p-0.5 relative shrink-0 ${
              autoAccept ? "bg-emerald-500 shadow-md shadow-emerald-500/30" : "bg-slate-300 dark:bg-zinc-700"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                autoAccept ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Karcis Promo Activation Banner if expired */}
      {isKarcisExpired && (
        <div className="sg-card p-5 text-center space-y-3 border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-white dark:via-[#0c1220] to-emerald-500/10">
          <div className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
            <Sparkles className="h-4 w-4" />
            <span>Karcis Bebas Komisi Belum Aktif</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-zinc-300 max-w-sm mx-auto">
            Aktifkan Karcis sekarang untuk mulai menarik dan menerima order tanpa potongan persentase.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold h-11 rounded-2xl text-[11px] shadow-md cursor-pointer" 
              onClick={() => onBuyKarcis(true)}
              disabled={isBuyingKarcis}
            >
              Klaim Trial (Gratis)
            </Button>
            <Button 
              variant="outline"
              className="w-full border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 font-bold h-11 rounded-2xl text-[11px] cursor-pointer" 
              onClick={() => onBuyKarcis(false)}
              disabled={isBuyingKarcis}
            >
              Beli Karcis (Rp 5.000)
            </Button>
          </div>
        </div>
      )}

      {/* Dynamic Hotspot Demand Heatmap Surge Controls */}
      <DriverHeatmapControls
        onSelectHotspotLocation={(lat, lng) => {
          const matched = DEMAND_HOTSPOTS_SOLO.find(
            (spot) => Math.abs(spot.lat - lat) < 0.005 && Math.abs(spot.lng - lng) < 0.005
          );
          if (matched) {
            onFocusHotspot(matched);
          } else {
            onFocusHotspot({
              id: "surge-focus",
              districtId: "banjarsari",
              name: "Hotspot Surge Demand",
              category: "transport",
              lat,
              lng,
              weight: 3,
              demandLevel: "Sangat Tinggi",
              ordersPerHour: 35,
              avgPickupWaitMinutes: 2,
              recommendedBasecamp: "Solo Hub",
              description: "Area lonjakan pesanan Solo"
            });
          }
        }}
      />

      {/* Kecamatan Filter Capsule & Radar Map */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
            Pilih Wilayah Kecamatan
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
            Kota Surakarta
          </span>
        </div>

        <KecamatanFilterPill
          selectedDistrictId={selectedDistrictId}
          onSelectDistrict={(districtId) => {
            onSelectDistrict(districtId);
            onFocusHotspot(null);
          }}
        />

        <div className="h-[360px] w-full rounded-[2rem] overflow-hidden shadow-xs border border-slate-200/80 dark:border-white/[0.08]">
          <DriverRadarMap
            isOnline={isOnline}
            driverLocation={location}
            selectedDistrictId={selectedDistrictId}
            focusedHotspot={focusedHotspot}
            onSelectHotspot={(hotspot) => onFocusHotspot(hotspot)}
          />
        </div>
      </div>

      {/* Real-time Incoming Orders Feed */}
      {isOnline && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-emerald-500 dark:text-emerald-400 animate-pulse" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Radar Pesanan Masuk</h3>
            </div>
            <span className="text-[11px] font-bold text-slate-600 dark:text-zinc-400 bg-slate-200 dark:bg-white/[0.06] px-2 py-0.5 rounded-full">
              {pendingOrders.length} Siap
            </span>
          </div>

          {ordersLoading ? (
            <div className="sg-bento-card p-8 text-center">
              <Loader2 className="h-6 w-6 text-emerald-500 animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500">Memeriksa radar order...</p>
            </div>
          ) : pendingOrders.length === 0 ? (
            <div className="sg-bento-card p-8 text-center space-y-2">
              <Radio className="h-6 w-6 text-slate-400 dark:text-zinc-600 animate-pulse mx-auto" />
              <p className="text-xs font-bold text-slate-700 dark:text-zinc-300">Menunggu Order Pelanggan</p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-500 max-w-xs mx-auto">
                Radar aktif di Surakarta (Solo). Pesanan sesuai preferensi Anda akan muncul di sini secara instan.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingOrders.map((order: PendingOrderWithDistance) => (
                <div 
                  key={order.id} 
                  className="sg-bento-card p-5 space-y-3.5 transition-all hover:scale-[1.01]"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={
                            order.serviceType === "kuliner" ? "orange" :
                            order.serviceType === "kirim" || order.serviceType === "titip" ? "blue" :
                            "emerald"
                          } 
                          size="sm"
                          className="font-bold text-[10px]"
                        >
                          {order.serviceType === "kuliner" ? "Kuliner UMKM" :
                           order.serviceType === "kirim" ? "Kirim Kilat" :
                           order.serviceType === "titip" ? "Titip Tetangga" :
                           order.serviceType === "mobil" ? "Mobil Warga" :
                           "Ojek Motor Lokal"}
                        </Badge>

                        {order.distanceToPickupKm !== undefined && (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            ~{formatDistance(order.distanceToPickupKm)}
                          </span>
                        )}
                      </div>
                      
                      <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                        Rp {order.price.toLocaleString("id-ID")}
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl">
                      100% Tunai
                    </span>
                  </div>

                  <div className="space-y-2 border-t border-slate-100 dark:border-white/[0.04] pt-3">
                    <div className="flex items-start space-x-2.5">
                      <MapPin className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                      <div className="text-xs">
                        <span className="text-slate-400 dark:text-zinc-500 block text-[10px]">Titik Jemput:</span>
                        <span className="text-slate-800 dark:text-zinc-200 font-medium">{order.pickupLocation?.address}</span>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2.5">
                      <Navigation className="h-4 w-4 text-rose-500 mt-0.5 shrink-0" />
                      <div className="text-xs">
                        <span className="text-slate-400 dark:text-zinc-500 block text-[10px]">Tujuan Antar:</span>
                        <span className="text-slate-800 dark:text-zinc-200 font-medium">{order.dropoffLocation?.address}</span>
                      </div>
                    </div>
                  </div>

                  <Button 
                    className="w-full h-12 rounded-2xl flex items-center justify-center gap-2 text-xs shadow-md cursor-pointer"
                    onClick={() => onAcceptOrder(order)}
                    disabled={acceptingOrderId === order.id}
                  >
                    {acceptingOrderId === order.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <span>Terima Pesanan Sekarang</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Demand Hotspots Leaderboard */}
      <div className="pt-2">
        <HotspotDemandLeaderboard
          driverLocation={location}
          selectedDistrictId={selectedDistrictId}
          onFocusHotspot={(hotspot) => onFocusHotspot(hotspot)}
        />
      </div>

      {/* Hotspot Detail Drawer */}
      {focusedHotspot && (
        <HotspotDetailDrawer
          hotspot={focusedHotspot}
          driverLocation={location}
          onClose={() => onFocusHotspot(null)}
        />
      )}
    </main>
  );
}
