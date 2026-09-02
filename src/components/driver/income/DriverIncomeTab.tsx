"use client";

import React from "react";
import { DriverWalletBento } from "./DriverWalletBento";
import { DriverLedgerHistory } from "./DriverLedgerHistory";

interface DriverIncomeTabProps {
  driverId: string;
}

export function DriverIncomeTab({ driverId }: DriverIncomeTabProps) {
  return (
    <main className="pt-20 px-4 space-y-5 max-w-lg w-full mx-auto flex-1 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Dompet & Karcis Mitra
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">Transparansi 100% tunai tanpa potongan per-trip</p>
        </div>
      </div>
      
      {driverId ? (
        <>
          <DriverWalletBento driverId={driverId} />
          <DriverLedgerHistory driverId={driverId} />
        </>
      ) : (
        <div className="text-center p-8 text-slate-500 text-xs">
          Memuat data driver...
        </div>
      )}
    </main>
  );
}
