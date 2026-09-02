import { Loader2, Store } from "lucide-react";

export default function MerchantLoading() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
      <div className="w-14 h-14 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400 animate-pulse">
        <Store className="h-7 w-7" />
      </div>
      <p className="text-xs font-bold text-slate-500 dark:text-zinc-400">
        Menghubungkan Dapur Merchant & Pasar Solo...
      </p>
    </div>
  );
}
