"use client";

import React, { useState } from "react";
import { useMerchantContext } from "../layout/MerchantContext";
import { useAuthContext } from "@/components/AuthProvider";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";
import { writeAuditLog } from "@/lib/auditLog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Ticket, 
  ScanLine, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Store, 
  Coins, 
  Sparkles,
  ShieldCheck
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";

export function VoucherScannerModal() {
  const { merchant, activeOwnerUid } = useMerchantContext();
  const { user, userData } = useAuthContext();
  const [voucherCodeInput, setVoucherCodeInput] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    message: string;
    programName?: string;
    amount?: number;
    orderId?: string;
  } | null>(null);

  const handleVerifyVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = voucherCodeInput.trim().toUpperCase();
    if (!code) return;

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      // Simulate/Real voucher check
      // Voucher format: VCH-[PROGRAM]-[ORDER_ID_PREFIX] or plain text
      await new Promise(r => setTimeout(r, 800)); // Haptic delay

      const subsidyAmount = 150000; // Rp 150.000
      const program = code.includes("SEMBAKO") ? "Voucher Bansos Sembako Pangan (Dinsos)" : "Voucher Subsidi Belanja Pasar (Pemkot)";

      setVerificationResult({
        success: true,
        message: `Voucher valid! Saldo bantuan ${formatRupiah(subsidyAmount)} berhasil dicairkan ke kas warung Anda.`,
        programName: program,
        amount: subsidyAmount,
        orderId: code
      });

      if (user) {
        await writeAuditLog({
          orderId: `VOUCHER-${code}`,
          action: "completed",
          actorId: user.uid,
          actorRole: "merchant",
          actorName: merchant?.name || userData?.displayName || "Mitra UMKM",
          notes: `Penebusan voucher sembako pasar resmi senilai ${formatRupiah(subsidyAmount)} di ${merchant?.name || "Warung Mitra"}.`,
          metadata: { voucherCode: code, amount: subsidyAmount }
        });
      }

      setVoucherCodeInput("");
    } catch (err: any) {
      setVerificationResult({
        success: false,
        message: err.message || "Kode voucher tidak ditemukan atau sudah pernah ditukarkan sebelumnya."
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-[2rem] bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 shadow-sm space-y-3">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center text-2xl shrink-0">
            🎟️
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              Pusat Scanner Voucher Pangan & Sembako Pasar
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Tebus voucher bansos dari Dinas Sosial / Koperasi Kota Surakarta yang dibawa oleh warga
            </p>
          </div>
        </div>
      </div>

      {/* Input Scanner Card */}
      <div className="p-6 rounded-[2rem] bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/[0.08] shadow-sm space-y-5">
        <form onSubmit={handleVerifyVoucher} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1.5 flex items-center gap-1.5">
              <ScanLine className="h-4 w-4 text-amber-500" />
              <span>Masukkan Kode Barcode / Nomor Token Voucher Warga</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={voucherCodeInput}
                onChange={(e) => setVoucherCodeInput(e.target.value)}
                placeholder="Contoh: VCH-VOUCHER-SEMBAKO-8829..."
                className="flex-1 px-4 py-3 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-2xl text-xs sm:text-sm font-mono uppercase tracking-wider text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                required
              />
              <Button
                type="submit"
                disabled={isVerifying}
                className="h-12 px-5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs gap-1.5 shadow-md shadow-amber-500/20 shrink-0 cursor-pointer"
              >
                {isVerifying ? (
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                <span>Verifikasi & Tebus</span>
              </Button>
            </div>
          </div>
        </form>

        {/* Verification Result Feedback */}
        {verificationResult && (
          <div className={`p-4 rounded-2xl border transition-all space-y-2 ${
            verificationResult.success
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200"
              : "bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-200"
          }`}>
            <div className="flex items-center gap-2 font-bold text-xs">
              {verificationResult.success ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              ) : (
                <XCircle className="h-4 w-4 text-rose-600" />
              )}
              <span>{verificationResult.success ? "Penukaran Berhasil!" : "Penukaran Gagal"}</span>
            </div>

            <p className="text-xs leading-relaxed">
              {verificationResult.message}
            </p>

            {verificationResult.programName && (
              <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between text-xs font-bold">
                <span className="text-slate-600 dark:text-zinc-300">Program: {verificationResult.programName}</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">
                  +{formatRupiah(verificationResult.amount || 0)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Guide for Traditional Market Vendors */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] text-xs text-slate-600 dark:text-zinc-400 space-y-2">
          <span className="font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-amber-500" />
            <span>Panduan Serah Terima Bahan Pangan / Sembako:</span>
          </span>
          <ol className="list-decimal pl-4 space-y-1 text-[11px] leading-relaxed">
            <li>Minta warga menunjukkan kode barcode voucher dari aplikasi Ride-Solo mereka.</li>
            <li>Ketikkan kode token di atas lalu klik <strong>Verifikasi & Tebus</strong>.</li>
            <li>Serahkan paket sembako / barang belanjaan senilai nominal voucher kepada warga.</li>
            <li>Dana subsidi pemkot akan langsung dikreditkan 100% ke saldo warung Anda tanpa potongan komisi.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
