import { Loader2 } from "lucide-react";

export default function CustomerLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030712] flex flex-col items-center justify-center space-y-3">
      <div className="relative">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 animate-pulse flex items-center justify-center">
          <Loader2 className="h-6 w-6 text-emerald-500 animate-spin" />
        </div>
      </div>
      <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
        Menghubungkan ke Layanan Warga Solo...
      </p>
    </div>
  );
}
