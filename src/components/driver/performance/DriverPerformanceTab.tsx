"use client";

import React from "react";
import { Star, Coins, History, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DriverPerformanceTabProps {
  driverRating: number;
  driverCompletionRate: string;
  completedTripsCount: number;
  driverPoints: number;
  estimatedSHU: number;
  driverTrips: any[];
  onOpenHistoryModal: () => void;
  onSelectTripReceipt: (trip: any) => void;
}

export function DriverPerformanceTab({
  driverRating,
  driverCompletionRate,
  completedTripsCount,
  driverPoints,
  estimatedSHU,
  driverTrips,
  onOpenHistoryModal,
  onSelectTripReceipt
}: DriverPerformanceTabProps) {
  return (
    <main className="pt-20 px-4 space-y-5 max-w-lg w-full mx-auto flex-1 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Performa & Dividen SHU
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">Pencapaian kerja & royalti komunitas koperasi</p>
        </div>
        <Badge variant="emerald" className="text-xs font-bold px-2.5 py-1">
          ⭐ {driverRating} Teruji
        </Badge>
      </div>

      {/* Performance Overview Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        <Card className="p-3.5 rounded-2xl bg-white dark:bg-[#0c1220] border-slate-200/80 dark:border-white/[0.08] text-center space-y-1 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase block">Rating Warga</span>
          <div className="text-base font-black text-amber-500 flex items-center justify-center gap-1">
            <Star className="h-4 w-4 fill-current" /> {driverRating}
          </div>
          <span className="text-[9px] text-slate-400 block">100% Positif</span>
        </Card>

        <Card className="sg-bento-card p-3.5 text-center space-y-1">
          <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase block">Penyelesaian</span>
          <div className="text-base font-black text-emerald-600 dark:text-emerald-400">
            {driverCompletionRate}
          </div>
          <span className="text-[9px] text-slate-400 block">Sangat Baik</span>
        </Card>

        <Card className="sg-bento-card p-3.5 text-center space-y-1">
          <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase block">Total Trip</span>
          <div className="text-base font-black text-slate-900 dark:text-white">
            {completedTripsCount}
          </div>
          <span className="text-[9px] text-slate-400 block">Selesai</span>
        </Card>
      </div>

      {/* Cooperative SHU Royalty Dividend Calculator */}
      <Card className="bg-gradient-to-r from-amber-500/15 via-white dark:via-[#0c1220] to-amber-500/15 border border-amber-500/30 p-5 rounded-[1.75rem] space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <Coins className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Poin Dividen SHU Koperasi</h3>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400">Dihitung dari loyalitas narik di Surakarta</p>
            </div>
          </div>
          <span className="text-xs font-black bg-amber-500/20 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-xl">
            {driverPoints} Poin
          </span>
        </div>

        <div className="p-3.5 bg-white/80 dark:bg-white/[0.03] rounded-2xl border border-amber-500/20 flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 block">
              Estimasi Bagian SHU Koperasi (Tahunan):
            </span>
            <span className="text-lg font-black text-amber-600 dark:text-amber-400">
              Rp {estimatedSHU.toLocaleString("id-ID")}
            </span>
          </div>
          <Badge variant="amber" size="sm">Bagi Hasil</Badge>
        </div>

        <p className="text-[11px] text-slate-600 dark:text-zinc-400">
          Setiap 1 order selesai menghasilkan +10 poin stamp. Poin dapat ditukar diskon di UMKM lokal atau dicairkan sebagai SHU Koperasi di akhir tahun buku.
        </p>
      </Card>

      {/* Trip History Feed */}
      <div className="space-y-3 pt-2 pb-6">
        <div className="flex items-center justify-between pl-1">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="h-4 w-4 text-emerald-500" /> Riwayat Perjalanan
          </h3>
          <button
            onClick={onOpenHistoryModal}
            className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer flex items-center gap-0.5"
          >
            <span>Buka Detail ({driverTrips.length})</span>
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        {driverTrips.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/[0.08] rounded-[1.75rem] space-y-2 mt-2 shadow-xs">
            <History className="h-8 w-8 text-slate-400 dark:text-zinc-500 mx-auto mb-1" />
            <p className="text-xs font-bold text-slate-700 dark:text-zinc-300">Belum Ada Riwayat Trip</p>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Setiap pesanan yang Anda selesaikan akan otomatis tersimpan di sini.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {driverTrips.map((trip) => (
              <div 
                key={trip.id} 
                onClick={() => onSelectTripReceipt(trip)}
                className="p-4 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0c1220] space-y-2 cursor-pointer hover:border-emerald-500/40 transition-all shadow-xs"
              >
                <div className="flex justify-between items-center">
                  <Badge variant={trip.status === "completed" ? "emerald" : trip.status === "cancelled" ? "rose" : "amber"} size="sm">
                    {trip.serviceType === "kuliner" ? "Kuliner" : trip.serviceType === "kirim" ? "Kirim" : "Ojek"} • {trip.status === "completed" ? "Selesai" : trip.status === "cancelled" ? "Dibatalkan" : trip.status}
                  </Badge>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                    + Rp {trip.price?.toLocaleString("id-ID")}
                  </span>
                </div>

                <div className="text-xs space-y-1 text-slate-600 dark:text-zinc-300 pt-1">
                  <p className="truncate text-slate-500 dark:text-zinc-400">🟢 <span className="text-slate-800 dark:text-zinc-200">{trip.pickupLocation?.address}</span></p>
                  <p className="truncate text-slate-500 dark:text-zinc-400">🔴 <span className="text-slate-800 dark:text-zinc-200">{trip.dropoffLocation?.address}</span></p>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-white/[0.04]">
                  <span>ID: #{trip.id?.slice(0, 8).toUpperCase()}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Buka E-Struk & Rincian →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
