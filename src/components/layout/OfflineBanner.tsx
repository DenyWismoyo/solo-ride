"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { WifiOff, RefreshCw, CheckCircle2 } from "lucide-react";
import { toast } from "@/components/ui/toast";

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        toast.success("Koneksi internet terhubung kembali.", "Online");
        setWasOffline(false);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      toast.warning("Koneksi internet terputus. Mode offline aktif.", "Offline");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [wasOffline]);

  if (isOnline) return null;

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        className="fixed top-0 left-0 right-0 z-[9990] bg-gradient-to-r from-amber-600 via-rose-600 to-amber-600 text-white px-4 py-2 text-center text-xs font-bold shadow-lg flex items-center justify-center gap-2"
        role="status"
        aria-live="polite"
      >
        <WifiOff className="w-4 h-4 animate-pulse" />
        <span>Koneksi internet terputus — Menampilkan data offline cache lokal</span>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="ml-2 inline-flex items-center gap-1 bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" />
          Coba Lagi
        </button>
      </motion.aside>
    </AnimatePresence>
  );
}
