"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, Settings2, Database, RefreshCw, Loader2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserDocument } from "@/types/user.types";

interface AdminOverviewBentoProps {
  usersList: UserDocument[];
  pendingKYCCount: number;
  onSeedSandbox: () => Promise<void>;
  isSeeding: boolean;
  seedSuccessMessage: string | null;
}

export function AdminOverviewBento({
  usersList,
  pendingKYCCount,
  onSeedSandbox,
  isSeeding,
  seedSuccessMessage
}: AdminOverviewBentoProps) {
  const router = useRouter();

  const totalDriversMerchants = usersList.filter(u => u.role === "driver" || u.role === "merchant").length;
  const totalGovIndustry = usersList.filter(u => u.role === "government" || u.role === "industry").length;

  return (
    <div className="space-y-4">
      {/* Executive Header Banner */}
      <div className="p-6 rounded-[2rem] bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/[0.08] space-y-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/30 shadow-md shrink-0">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Super Admin Enterprise Hub
                </h2>
                <Badge variant="rose" size="sm" className="font-bold">
                  ROOT ACCESS
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Pusat Kendali Ekosistem 5-Pilar, Role Engine & Studio Impersonasi Surakarta
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => router.push('/admin/bizconfig')}
              className="px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-500/30 hover:border-indigo-500 text-indigo-600 dark:text-indigo-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Settings2 className="h-4 w-4 text-indigo-500" />
              <span>BizConfig Engine</span>
            </button>

            <Badge variant="emerald" size="sm" withDot className="font-bold">
              Live System Active
            </Badge>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-white/[0.04] text-center">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04]">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block font-medium">Total Akun Terdaftar</span>
            <span className="text-lg font-black text-slate-900 dark:text-white">{usersList.length} Pengguna</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04]">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block font-medium">Mitra Driver & UMKM</span>
            <span className="text-lg font-black text-amber-600 dark:text-amber-400">{totalDriversMerchants} Mitra</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04]">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block font-medium">Instansi Pemda & Industri</span>
            <span className="text-lg font-black text-teal-600 dark:text-teal-400">{totalGovIndustry} Lembaga</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04]">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block font-medium">Antrean Verifikasi KYC</span>
            <span className="text-lg font-black text-rose-600 dark:text-rose-400">{pendingKYCCount} Dokumen</span>
          </div>
        </div>
      </div>

      {/* 1-Click Sandbox Seeder Quick Bar */}
      <div className="p-4 rounded-[1.8rem] border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-white dark:via-[#0c1220] to-emerald-500/10 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 dark:text-white">
              Data Sandbox Ekosistem Surakarta
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Seed 18 Dinas Pemkot, Industri Logistik, UMKM Pasar, Driver, & Customer dalam 1-Klik
            </p>
          </div>
        </div>

        <Button
          onClick={onSeedSandbox}
          disabled={isSeeding}
          className="h-10 px-4 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-2 cursor-pointer shadow-sm"
        >
          {isSeeding ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span>{isSeeding ? "Sedang Menginisialisasi..." : "1-Click Seed Sandbox"}</span>
        </Button>
      </div>

      {seedSuccessMessage && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
          {seedSuccessMessage}
        </div>
      )}
    </div>
  );
}
