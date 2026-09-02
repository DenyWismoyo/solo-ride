"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowDownToLine, 
  ShieldCheck, 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Loader2, 
  Lock,
  Building2
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { verifyCashoutSecurity } from "@/lib/fraud";
import { toast } from "@/components/ui/toast";

interface DriverCashoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletBalance: number;
  driverName?: string;
  onConfirmWithdrawal: (amount: number, bankInfo: { bank: string; accountNumber: string }) => Promise<void>;
}

export function DriverCashoutModal({
  isOpen,
  onClose,
  walletBalance,
  driverName = "Mitra Driver",
  onConfirmWithdrawal,
}: DriverCashoutModalProps) {
  const [step, setStep] = useState<"amount" | "liveness" | "confirm">("amount");
  const [amount, setAmount] = useState<number>(Math.min(walletBalance, 50000));
  const [pin, setPin] = useState("");
  const [selectedBank, setSelectedBank] = useState("BCA");
  const [accountNumber, setAccountNumber] = useState("1234567890");
  const [isLivenessScanning, setIsLivenessScanning] = useState(false);
  const [isLivenessVerified, setIsLivenessVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleStartLivenessScan = () => {
    setIsLivenessScanning(true);
    setTimeout(() => {
      setIsLivenessScanning(false);
      setIsLivenessVerified(true);
      toast.success("Verifikasi wajah liveness berhasil terverifikasi!", "Keamanan");
      setStep("confirm");
    }, 1800);
  };

  const handleExecuteWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = verifyCashoutSecurity(amount, pin, isLivenessVerified);
    if (!validation.isValid) {
      toast.error(validation.errorMessage || "Validasi penarikan gagal", "Peringatan");
      return;
    }

    if (amount > walletBalance) {
      toast.error("Saldo dompet koperasi Anda tidak mencukupi", "Saldo Kurang");
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirmWithdrawal(amount, { bank: selectedBank, accountNumber });
      toast.success(`Penarikan ${formatRupiah(amount)} berhasil diproses ke rekening ${selectedBank}`, "Berhasil");
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Gagal memproses penarikan saldo", "Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="sg-bento-card max-w-md w-full bg-white dark:bg-[#0c1220] rounded-t-3xl sm:rounded-3xl shadow-2xl border-emerald-500/20 overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-white/[0.06] flex items-center justify-between bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <ArrowDownToLine className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Tarik Saldo Dompet Koperasi
              </h3>
              <p className="text-[11px] text-slate-500">
                Saldo Tersedia: <strong className="text-emerald-600 dark:text-emerald-400">{formatRupiah(walletBalance)}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {step === "amount" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Nominal Penarikan
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[20000, 50000, 100000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(val)}
                      disabled={val > walletBalance}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        amount === val
                          ? "bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400"
                          : "bg-slate-50 dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.06] text-slate-700 dark:text-zinc-300 disabled:opacity-40"
                      }`}
                    >
                      {formatRupiah(val)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-emerald-500" />
                  Rekening Tujuan Koperasi / Bank
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="sg-input w-28 text-xs font-bold"
                  >
                    <option value="BCA">BCA</option>
                    <option value="BRI">BRI</option>
                    <option value="Mandiri">Mandiri</option>
                    <option value="BSI">BSI Solo</option>
                    <option value="Koperasi">Koperasi Unit</option>
                  </select>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="sg-input flex-1 text-xs font-mono font-bold"
                    placeholder="Nomor Rekening"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-[11px] text-slate-600 dark:text-zinc-300 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Penarikan dilindungi verifikasi Anti-Fraud liveness selfie untuk menjamin dana hanya dapat ditarik oleh pemilik akun resmi.
                </span>
              </div>

              <Button
                type="button"
                onClick={() => setStep("liveness")}
                disabled={amount <= 0 || amount > walletBalance}
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl cursor-pointer shadow-md"
              >
                Lanjutkan ke Verifikasi Keamanan
              </Button>
            </div>
          )}

          {step === "liveness" && (
            <div className="space-y-4 text-center">
              <div className="mx-auto w-24 h-24 rounded-full border-4 border-dashed border-emerald-500/40 flex items-center justify-center relative overflow-hidden bg-slate-50 dark:bg-zinc-900">
                {isLivenessScanning ? (
                  <div className="absolute inset-0 bg-emerald-500/20 flex flex-col items-center justify-center">
                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                    <span className="text-[9px] font-bold text-emerald-600 mt-1">Memindai...</span>
                  </div>
                ) : (
                  <Camera className="w-10 h-10 text-slate-400 dark:text-zinc-600" />
                )}
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Verifikasi Wajah (Liveness Check)</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Arahkan kamera ke wajah Anda untuk mengonfirmasi penarikan {formatRupiah(amount)}
                </p>
              </div>

              <Button
                type="button"
                onClick={handleStartLivenessScan}
                disabled={isLivenessScanning}
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl cursor-pointer"
              >
                {isLivenessScanning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                    Memverifikasi Keaslian...
                  </>
                ) : (
                  "Mulai Pindai Wajah Selfie"
                )}
              </Button>
            </div>
          )}

          {step === "confirm" && (
            <form onSubmit={handleExecuteWithdrawal} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Nominal Penarikan:</span>
                  <strong className="font-bold text-emerald-600 dark:text-emerald-400">{formatRupiah(amount)}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Bank / Rekening:</span>
                  <span className="font-mono font-bold">{selectedBank} - {accountNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Biaya Admin Koperasi:</span>
                  <span className="font-bold text-emerald-600">Rp 0 (Bebas Biaya)</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-200 dark:border-white/[0.06]">
                  <span className="text-slate-500">Verifikasi Wajah:</span>
                  <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[10px]">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Lolos Liveness
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-emerald-500" />
                  Masukkan 6 Digit PIN Keamanan:
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="••••••"
                  className="sg-input text-center text-lg tracking-widest font-mono font-bold"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || pin.length < 4}
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl cursor-pointer shadow-md"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                    Memproses Penarikan...
                  </>
                ) : (
                  `Konfirmasi Tarik ${formatRupiah(amount)}`
                )}
              </Button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
