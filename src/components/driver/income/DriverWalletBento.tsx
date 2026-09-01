"use client";

import React, { useEffect, useState } from "react";
import { driverWalletService } from "@/services/driverWallet.service";
import { driverLedgerService } from "@/services/driverLedger.service";
import { DriverWalletDocument, DriverDailyLedger } from "@/types/wallet.types";
import { Wallet, ArrowDownToLine, Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function DriverWalletBento({ driverId }: { driverId: string }) {
  const [wallet, setWallet] = useState<DriverWalletDocument | null>(null);
  const [ledger, setLedger] = useState<DriverDailyLedger | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);

  const fetchWalletAndLedger = async () => {
    try {
      const w = await driverWalletService.getWallet(driverId);
      setWallet(w);

      const dateStr = new Date().toISOString().split("T")[0];
      const l = await driverLedgerService.getTodayLedger(driverId, dateStr);
      setLedger(l);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletAndLedger();
  }, [driverId]);

  const handleSimulateOnline = async () => {
    if (!ledger) return;
    setSimulating(true);
    try {
      const dateStr = new Date().toISOString().split("T")[0];
      // Simulate adding 1 hour (60 mins) per click
      const updated = await driverLedgerService.addOnlineMinutes(driverId, dateStr, 60);
      setLedger(updated);
    } catch (err) {
      alert("Gagal update menit: " + err);
    } finally {
      setSimulating(false);
    }
  };

  const handleSimulateEndDay = async () => {
    if (!wallet || !ledger) return;
    setSimulating(true);
    try {
      const dateStr = new Date().toISOString().split("T")[0];
      await driverWalletService.simulateManualKarcisDeduction(driverId, ledger.karcisAmount, dateStr);
      await fetchWalletAndLedger();
      alert(`Berhasil memotong karcis sebesar ${formatRupiah(ledger.karcisAmount)}`);
    } catch (err) {
      alert("Gagal memotong karcis: " + err);
    } finally {
      setSimulating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-6 w-6 text-emerald-500 animate-spin" />
      </div>
    );
  }

  const progressPercent = ledger ? Math.min((ledger.onlineMinutes / 360) * 100, 100) : 0;
  const isFree = progressPercent >= 100;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {/* Balance Card */}
        <div className="col-span-2 sg-card p-5 rounded-[2rem] bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-xl relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col h-full justify-between gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Wallet className="h-5 w-5 text-white" />
                </div>
                <span className="text-xs font-bold text-emerald-50">Dompet Koperasi</span>
              </div>
              <Button size="sm" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 h-8 rounded-xl text-[10px]">
                <ArrowDownToLine className="h-3 w-3 mr-1" />
                Tarik
              </Button>
            </div>
            
            <div>
              <p className="text-3xl font-black">{formatRupiah(wallet?.balance || 0)}</p>
              <p className="text-[10px] text-emerald-100 mt-1">Saldo tunai. Karcis harian dipotong dari sini.</p>
            </div>
          </div>
        </div>

        {/* Karcis Harian Status */}
        <div className="col-span-2 sg-card p-4 rounded-3xl bg-white/95 dark:bg-zinc-900/95 border border-slate-200 dark:border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200">Karcis Harian</h4>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isFree ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
            }`}>
              {ledger?.karcisStatus.toUpperCase()}
            </span>
          </div>

          <div>
            <div className="flex justify-between text-[10px] font-semibold text-slate-500 mb-1">
              <span>{Math.floor((ledger?.onlineMinutes || 0) / 60)}j {(ledger?.onlineMinutes || 0) % 60}m Online</span>
              <span>Target 6 Jam (Gratis)</span>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${isFree ? 'bg-emerald-500' : 'bg-amber-500'}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">
              Tarif karcis hari ini: <strong className="text-slate-700 dark:text-zinc-300">{formatRupiah(ledger?.karcisAmount || 0)}</strong>
            </p>
          </div>

          {/* Dev Simulators */}
          <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleSimulateOnline} 
              disabled={simulating}
              className="flex-1 text-[10px] h-8 rounded-xl border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
            >
              {simulating ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Play className="h-3 w-3 mr-1" />}
              +1 Jam Online
            </Button>
            <Button 
              size="sm" 
              onClick={handleSimulateEndDay} 
              disabled={simulating}
              className="flex-1 text-[10px] h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-white"
            >
              Tutup Hari (Potong)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
