import { Loader2, Building2 } from "lucide-react";

export default function IndustryLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030712] flex flex-col items-center justify-center space-y-3">
      <div className="w-14 h-14 rounded-2xl bg-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-400 animate-pulse">
        <Building2 className="h-7 w-7" />
      </div>
      <p className="text-xs font-bold text-slate-500 dark:text-zinc-400">
        Menghubungkan ke Portal Industri B2B Solo...
      </p>
    </div>
  );
}
