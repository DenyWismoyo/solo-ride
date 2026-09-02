"use client";

import React, { useState } from "react";
import { CreditCard, X, Loader2, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DynamicQrisModal } from "@/components/payment/DynamicQrisModal";

interface TopupWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTopup: (amount: number) => Promise<void>;
  isProcessing: boolean;
}

export function TopupWalletModal({
  isOpen,
  onClose,
  onTopup,
  isProcessing
}: TopupWalletModalProps) {
  const [topUpAmount, setTopUpAmount] = useState<number>(50000);
  const [isQrisOpen, setIsQrisOpen] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsQrisOpen(true);
  };

  const handleQrisSuccess = async () => {
    await onTopup(topUpAmount);
    setIsQrisOpen(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="sg-bento-card p-6 max-w-sm w-full space-y-4 shadow-2xl">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/[0.06] pb-3">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-emerald-500" />
              <span>Isi Saldo Dompet Koperasi</span>
            </h3>
            <button 
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-full cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-zinc-300">Pilih Nominal Top-Up:</label>
              <div className="grid grid-cols-3 gap-2">
                {[20000, 50000, 100000].map((nominal) => (
                  <button
                    key={nominal}
                    type="button"
                    onClick={() => setTopUpAmount(nominal)}
                    className={`p-3 rounded-xl border font-bold text-center transition-all cursor-pointer ${
                      topUpAmount === nominal
                        ? "bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-xs"
                        : "bg-slate-50 dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.06] text-slate-700 dark:text-zinc-300 hover:border-slate-300"
                    }`}
                  >
                    Rp {nominal.toLocaleString("id-ID")}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-[11px] text-slate-600 dark:text-zinc-300">
              Pembayaran instan via QRIS Dinamis Koperasi Surakarta (0% biaya admin). Saldo otomatis bertambah.
            </div>

            <Button
              type="submit"
              disabled={isProcessing}
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl cursor-pointer shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5"
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <QrCode className="h-4 w-4 mr-1" />}
              <span>Buka QRIS Rp {topUpAmount.toLocaleString("id-ID")}</span>
            </Button>
          </form>
        </div>
      </div>

      <DynamicQrisModal
        isOpen={isQrisOpen}
        onClose={() => setIsQrisOpen(false)}
        orderId={`topup-${Date.now()}`}
        amount={topUpAmount}
        merchantName="Dompet Koperasi Ride-Solo"
        serviceType="wallet"
        onPaymentSuccess={handleQrisSuccess}
      />
    </>
  );
}

