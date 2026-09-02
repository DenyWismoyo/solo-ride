"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CustomerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Customer Route Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030712] flex items-center justify-center p-4">
      <div className="max-w-md w-full p-6 rounded-[2rem] bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/[0.08] shadow-2xl text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto text-2xl">
          <AlertCircle className="h-7 w-7" />
        </div>

        <div className="space-y-1">
          <h2 className="text-base font-black text-slate-900 dark:text-white">
            Terjadi Kendala Jaringan
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-xs mx-auto">
            Gagal menyinkronkan data layanan. Silakan coba hubungkan ulang atau kembali ke beranda.
          </p>
        </div>

        <div className="flex gap-2.5 pt-2">
          <Button
            onClick={() => reset()}
            className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Coba Lagi</span>
          </Button>

          <Link href="/" className="flex-1">
            <Button
              variant="outline"
              className="w-full h-11 rounded-xl text-xs font-bold border-slate-200 dark:border-white/10 text-slate-700 dark:text-zinc-300 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Home className="h-4 w-4" />
              <span>Beranda</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
