import { Loader2, Bike } from "lucide-react";

export default function DriverLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] flex flex-col items-center justify-center space-y-3">
      <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-500 animate-pulse">
        <Bike className="h-7 w-7" />
      </div>
      <p className="text-xs font-bold text-slate-500 dark:text-zinc-400">
        Menghubungkan Radar Driver Solo...
      </p>
    </div>
  );
}
