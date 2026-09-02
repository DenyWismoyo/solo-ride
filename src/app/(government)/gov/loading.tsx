import { Loader2, Landmark } from "lucide-react";

export default function GovLoading() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
      <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 animate-pulse">
        <Landmark className="h-7 w-7" />
      </div>
      <p className="text-xs font-bold text-slate-500 dark:text-zinc-400">
        Menghubungkan ke Portal Pemkot Surakarta...
      </p>
    </div>
  );
}
