"use client";

import React, { useEffect, useState } from "react";
import { driverWalletService } from "@/services/driverWallet.service";
import { WalletTransaction } from "@/types/wallet.types";
import { History, ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react";

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function DriverLedgerHistory({ driverId }: { driverId: string }) {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const txs = await driverWalletService.getTransactions(driverId);
        setTransactions(txs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [driverId]);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-6 w-6 text-slate-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <History className="h-4 w-4 text-slate-500" />
        <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-200">Riwayat Mutasi</h3>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center p-6 border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl">
          <p className="text-xs text-slate-500">Belum ada mutasi dompet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {transactions.map(tx => (
            <div key={tx.id} className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${
                  tx.amount > 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                }`}>
                  {tx.amount > 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-zinc-200">{tx.description}</p>
                  <p className="text-[10px] text-slate-500">{tx.date}</p>
                </div>
              </div>
              <div className={`text-xs font-black ${
                tx.amount > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
              }`}>
                {tx.amount > 0 ? "+" : ""}{formatRupiah(tx.amount)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
