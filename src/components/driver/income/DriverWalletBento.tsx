"use client";

import React, { useEffect, useState } from "react";
import { driverWalletService } from "@/services/driverWallet.service";
import { driverLedgerService } from "@/services/driverLedger.service";
import { DriverWalletDocument, DriverDailyLedger } from "@/types/wallet.types";
import { Wallet, ArrowDownToLine, Loader2, Play, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DriverSHUCalculatorModal } from "./DriverSHUCalculatorModal";

import { toast } from "@/components/ui/toast";
import { DriverCashoutModal } from "./DriverCashoutModal";

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
  const [isSHUModalOpen, setIsSHUModalOpen] = useState(false);
  const [isCashoutModalOpen, setIsCashoutModalOpen] = useState(false);

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
      const updated = await driverLedgerService.addOnlineMinutes(driverId, dateStr, 60);
      setLedger(updated);
      toast.success("Menit online berhasil ditambahkan +60m", "Simulasi Online");
    } catch (err: any) {
      toast.error("Gagal update menit: " + err.message, "Error");
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
      toast.success(`Berhasil memotong karcis flat harian ${formatRupiah(ledger.karcisAmount)}`, "Tutup Hari");
    } catch (err: any) {
      toast.error("Gagal memotong karcis: " + err.message, "Error");
    } finally {
      setSimulating(false);
    }
  };

  const handleExecuteCashout = async (amount: number, bankInfo: { bank: string; accountNumber: string }) => {
    // Deduct balance from wallet
    if (!wallet || wallet.balance < amount) {
      throw new Error("Saldo tidak mencukupi untuk penarikan.");
    }

    await driverWalletService.topUp(driverId, -amount);
    await fetchWalletAndLedger();
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
        <div className="col-span-2 sg-bento-card p-5 bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-xl relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col h-full justify-between gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
                  <Wallet className="h-5 w-5 text-white" />
                </div>
                <span className="text-xs font-bold text-emerald-50">Dompet Koperasi</span>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setIsCashoutModalOpen(true)}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 h-8 rounded-xl text-[10px] cursor-pointer"
              >
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
        <div className="col-span-2 sg-bento-card p-4 space-y-3">
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
          <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-white/[0.04]">
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

        {/* SHU Koperasi Calculator Banner */}
        <div className="col-span-2 p-4 rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <Calculator className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900 dark:text-white">Simulasi Dividen SHU Koperasi</p>
              <p className="text-[10px] text-slate-500">Hitung bagi hasil & hemat 25% tanpa komisi</p>
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => setIsSHUModalOpen(true)}
            className="h-8.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-[10px] cursor-pointer shadow-xs"
          >
            Hitung SHU
          </Button>
        </div>
      </div>

      {/* Driver SHU Calculator Modal */}
      <DriverSHUCalculatorModal
        isOpen={isSHUModalOpen}
        onClose={() => setIsSHUModalOpen(false)}
      />

      {/* Driver Cashout Anti-Fraud Liveness Modal */}
      <DriverCashoutModal
        isOpen={isCashoutModalOpen}
        onClose={() => setIsCashoutModalOpen(false)}
        walletBalance={wallet?.balance || 0}
        onConfirmWithdrawal={handleExecuteCashout}
      />
    </div>
  );
}

