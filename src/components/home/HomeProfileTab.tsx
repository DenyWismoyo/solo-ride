"use client";

import React from "react";
import { motion } from "motion/react";
import { User, MapPin, Sun, Moon, Laptop, LogOut, ChevronRight, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme/ThemeProvider";

interface HomeProfileTabProps {
  user: any;
  userData: any;
  onOpenAddressesModal: () => void;
  onLogout: () => void;
}

export function HomeProfileTab({
  user,
  userData,
  onOpenAddressesModal,
  onLogout
}: HomeProfileTabProps) {
  const { theme, setTheme } = useTheme();

  return (
    <motion.main
      key="profile"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="pt-20 px-4 max-w-lg w-full mx-auto flex-1 space-y-4 relative z-10 pb-24"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight sg-editorial-title">
            Profil & Pengaturan
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 pl-4 mt-0.5">Kelola akun warga dan preferensi aplikasi</p>
        </div>
      </div>

      {/* Profile Info Card */}
      <div className="sg-bento-card p-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-emerald-500/20 shrink-0">
            {userData?.displayName?.charAt(0) || "W"}
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              {userData?.displayName || user?.displayName || "Warga Surakarta"}
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              {user?.email || "Akun Terverifikasi"}
            </p>
            <Badge variant="emerald" size="sm" className="text-[9px] font-bold">
              Warga Surakarta
            </Badge>
          </div>
        </div>
      </div>

      {/* Menu Options */}
      <div className="space-y-2.5">
        {/* Saved Addresses Quick Trigger */}
        <button
          onClick={onOpenAddressesModal}
          className="w-full sg-bento-card p-4 flex items-center justify-between text-left hover:border-emerald-500/40 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Alamat Tersimpan (Rumah & Kantor)
              </span>
              <span className="text-[10px] text-slate-400">
                Atur titik jemput & pengantaran cepat
              </span>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </button>

        {/* Theme Mode Selector */}
        <div className="sg-bento-card p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Sun className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Tema Tampilan
              </span>
              <span className="text-[10px] text-slate-400">
                Pilih mode terang, gelap, atau sistem
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/[0.04] p-1 rounded-xl">
            <button
              onClick={() => setTheme("light")}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                theme === "light" ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs" : "text-slate-400"
              }`}
            >
              <Sun className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                theme === "dark" ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs" : "text-slate-400"
              }`}
            >
              <Moon className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="w-full p-4 rounded-[1.75rem] bg-rose-500/10 border border-rose-500/20 shadow-xs flex items-center justify-between text-left hover:bg-rose-500/15 transition-all cursor-pointer text-rose-600 dark:text-rose-400"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-500/20">
              <LogOut className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold block">Keluar dari Akun</span>
              <span className="text-[10px] opacity-80">Akhiri sesi di perangkat ini</span>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 opacity-80" />
        </button>
      </div>
    </motion.main>
  );
}
