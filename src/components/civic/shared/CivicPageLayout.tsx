"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { useAuthContext } from "@/components/AuthProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, KeyRound, ExternalLink, ChevronRight } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { AdminImpersonationBar } from "@/components/admin/AdminImpersonationBar";
import { cn } from "@/lib/utils";

export interface CivicPageLayoutProps {
  agencyId: string;
  agencyName: string;
  agencyAvatar?: string;
  serviceTitle: string;
  serviceDescription?: string;
  feeLabel?: string;
  createdOrderId?: string | null;
  otpCode?: string | null;
  successDescription?: string;
  onReset?: () => void;
  children: React.ReactNode;
}

export function CivicPageLayout({
  agencyId,
  agencyName,
  agencyAvatar = "🏛️",
  serviceTitle,
  serviceDescription,
  feeLabel = "Resmi Pemkot Solo",
  createdOrderId,
  otpCode,
  successDescription,
  onReset,
  children
}: CivicPageLayoutProps) {
  const router = useRouter();
  const { isImpersonating } = useAuthContext();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-white pb-24">
      {/* Fixed Impersonation bar */}
      <AdminImpersonationBar />

      {/* Fixed App Header */}
      <AppHeader onOpenProfile={() => router.push("/")} />

      {/* Main Content Container with proper top offset */}
      <main className={cn(
        "max-w-2xl mx-auto px-4 space-y-4 transition-all duration-200",
        isImpersonating ? "pt-28 sm:pt-28" : "pt-20 sm:pt-20"
      )}>
        {/* Minimalist Top Breadcrumbs */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-zinc-400 overflow-x-auto no-scrollbar py-0.5">
            <Link href="/services/more?tab=government" className="hover:text-blue-600 transition-colors shrink-0 font-medium">
              Katalog
            </Link>
            <ChevronRight className="h-3 w-3 shrink-0 text-slate-400" />
            <Link href={`/services/gov/${agencyId}`} className="hover:text-blue-600 transition-colors shrink-0 font-medium truncate max-w-[140px]">
              {agencyName}
            </Link>
            <ChevronRight className="h-3 w-3 shrink-0 text-slate-400" />
            <span className="text-slate-900 dark:text-white font-bold truncate max-w-[150px]">
              {serviceTitle}
            </span>
          </div>

          <Badge variant="blue" size="sm" className="text-[10px] shrink-0 font-bold">
            {feeLabel}
          </Badge>
        </div>

        {/* Minimalist Service Title Card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 sm:p-5 rounded-[1.75rem] bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/[0.08] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.4)] flex items-start gap-3.5"
        >
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 rounded-xl bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/[0.12] transition-all active:scale-95 shrink-0 cursor-pointer mt-0.5"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="w-11 h-11 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/20 text-xl flex items-center justify-center shrink-0">
            {agencyAvatar}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                {agencyName}
              </span>
              <span className="text-[10px] text-slate-400">• Resmi Pemkot</span>
            </div>
            <h1 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
              {serviceTitle}
            </h1>
            {serviceDescription && (
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed line-clamp-2">
                {serviceDescription}
              </p>
            )}
          </div>
        </motion.div>

        {/* Content Box or Success Screen */}
        <AnimatePresence mode="wait">
          {createdOrderId ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="p-6 sm:p-7 rounded-[2rem] bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/[0.08] shadow-sm text-center space-y-4"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-7 w-7" />
              </div>

              <div className="space-y-1">
                <h2 className="text-base font-black text-slate-900 dark:text-white">
                  Permohonan Berhasil Diterbitkan
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Nomor Registrasi:{" "}
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                    {createdOrderId}
                  </span>
                </p>
              </div>

              {otpCode && (
                <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 space-y-1 max-w-sm mx-auto">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 flex items-center justify-center gap-1">
                    <KeyRound className="h-3.5 w-3.5 text-blue-600" />
                    <span>KODE OTP SERAH TERIMA:</span>
                  </span>
                  <div className="text-2xl font-mono font-black text-blue-600 dark:text-blue-400 tracking-widest">
                    {otpCode}
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Tunjukkan kepada petugas / kurir saat serah terima dokumen fisik.
                  </p>
                </div>
              )}

              <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed bg-slate-50 dark:bg-zinc-800/40 p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-700 max-w-md mx-auto">
                {successDescription ||
                  "Petugas dinas terkait sedang memproses berkas Anda. Status pembaruan dapat dipantau langsung secara real-time."}
              </p>

              <div className="pt-2 flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                <Button
                  onClick={() => router.push(`/order/${createdOrderId}`)}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/20"
                >
                  <span>Lacak Status Pesanan</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (onReset) onReset();
                    router.push(`/services/gov/${agencyId}`);
                  }}
                  className="py-2.5 px-4 rounded-xl text-xs font-bold border-slate-200 dark:border-zinc-700 cursor-pointer"
                >
                  Kembali ke Dinas
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 sm:p-6 rounded-[2rem] bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/[0.08] shadow-sm space-y-4"
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
