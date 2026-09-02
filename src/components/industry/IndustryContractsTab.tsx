"use client";

import React from "react";
import { FileText, Users, MapPin, Clock, Loader2, Inbox } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ContractDocument } from "@/types/contract.types";

interface IndustryContractsTabProps {
  contracts: ContractDocument[];
  loading: boolean;
}

export function IndustryContractsTab({
  contracts,
  loading
}: IndustryContractsTabProps) {
  return (
    <div className="p-5 rounded-[2rem] bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/[0.08] shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.04] pb-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-teal-600 dark:text-teal-400" />
          <h3 className="text-xs font-black text-slate-900 dark:text-white">
            Daftar Kontrak Retainer B2B Aktif
          </h3>
        </div>
        <Badge variant="teal" size="sm" className="font-bold">
          {contracts.length} Kontrak
        </Badge>
      </div>

      {loading ? (
        <div className="py-12 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-teal-500 mx-auto mb-2" />
          <p className="text-xs text-slate-400">Memuat data kontrak armada...</p>
        </div>
      ) : contracts.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-400 space-y-2">
          <Inbox className="h-8 w-8 text-slate-300 dark:text-zinc-600 mx-auto" />
          <p>Belum ada kontrak pengadaan armada aktif.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {contracts.map((contract) => (
            <div
              key={contract.id}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] space-y-2.5 text-xs"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    {contract.title}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Instansi: {contract.industryName}
                  </p>
                </div>
                <Badge
                  variant={contract.status === "active" ? "emerald" : contract.status === "completed" ? "blue" : "amber"}
                  size="sm"
                  className="text-[9px] font-bold"
                >
                  {contract.status === "active" ? "Aktif Berjalan" : contract.status}
                </Badge>
              </div>

              <p className="text-[11px] text-slate-600 dark:text-zinc-400">
                {contract.description}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-white/[0.04] text-[11px]">
                <span className="text-slate-500">
                  Armada: <strong>{contract.vehicleCount} Kendaraan</strong>
                </span>
                <span className="font-bold text-teal-600 dark:text-teal-400">
                  Rp {contract.totalValue.toLocaleString("id-ID")} / Periode
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
