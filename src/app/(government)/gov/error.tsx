"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GovError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Gov OPD Route Error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full p-6 rounded-[2rem] bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/[0.08] shadow-2xl text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto text-2xl">
          <AlertCircle className="h-7 w-7" />
        </div>

        <div className="space-y-1">
          <h2 className="text-base font-black text-slate-900 dark:text-white">
            Koneksi Server Dinas Terputus
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-xs mx-auto">
            Gagal memuat berkas permohonan dinas. Silakan coba segarkan kembali.
          </p>
        </div>

        <Button
          onClick={() => reset()}
          className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Segarkan Workspace Dinas</span>
        </Button>
      </div>
    </div>
  );
}
