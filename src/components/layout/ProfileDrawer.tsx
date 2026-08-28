"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { useTheme } from "@/components/theme/ThemeProvider";
import { authService } from "@/services/auth.service";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Coins, 
  ShieldCheck, 
  LogOut, 
  HelpCircle, 
  Bike, 
  Store, 
  Building2, 
  Landmark, 
  ShieldAlert, 
  ChevronRight,
  ExternalLink,
  Sun,
  Moon,
  Laptop
} from "lucide-react";
import { UserRole } from "@/types/user.types";

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileDrawer({ isOpen, onClose }: ProfileDrawerProps) {
  const router = useRouter();
  const { user, userData, activeRole, setImpersonatedRole } = useAuthContext();
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    await authService.logout();
    setImpersonatedRole(null);
    onClose();
    router.push("/login");
  };

  const roleNavigation = [
    { role: "customer", label: "Mode Pelanggan (Warga)", desc: "Pesan ojek, kuliner & belanja UMKM", icon: User, path: "/", color: "text-emerald-500 bg-emerald-500/10" },
    { role: "driver", label: "Mode Mitra Driver", desc: "Radar order & karcis harian bebas komisi", icon: Bike, path: "/driver", color: "text-amber-500 bg-amber-500/10" },
    { role: "merchant", label: "Mode Mitra UMKM", desc: "Kelola toko, menu & Flash Sale Pasar Warga", icon: Store, path: "/merchant", color: "text-orange-500 bg-orange-500/10" },
    { role: "industry", label: "Mode Industri B2B", desc: "Logistik kargo & pasokan bahan baku lokal", icon: Building2, path: "/industry", color: "text-blue-500 bg-blue-500/10" },
    { role: "government", label: "Mode Pemerintah", desc: "Smart City & broadcast resmi kecamatan", icon: Landmark, path: "/gov", color: "text-teal-500 bg-teal-500/10" },
  ];

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} className="max-w-md mx-auto max-h-[85vh] overflow-y-auto">
      <div className="space-y-5 pb-6">
        {/* Profile Header */}
        {user ? (
          <div className="flex items-center gap-3.5 pb-4 border-b border-zinc-200 dark:border-zinc-800">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-emerald-500/20 shrink-0">
              {userData?.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-zinc-900 dark:text-white truncate">
                  {userData?.displayName || "Pengguna Ride-Solo"}
                </h3>
                <Badge variant="emerald" size="sm">
                  {activeRole}
                </Badge>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">{user.email}</p>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-zinc-100 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200 dark:border-zinc-700/60 text-center space-y-3">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Belum Masuk ke Akun</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Masuk untuk mengakses ekosistem lokal tanpa perantara.</p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1 h-9 text-xs border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200"
                onClick={() => { onClose(); router.push("/login"); }}
              >
                Masuk
              </Button>
              <Button 
                className="flex-1 h-9 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                onClick={() => { onClose(); router.push("/register"); }}
              >
                Daftar
              </Button>
            </div>
          </div>
        )}

        {/* Poin Stamp Summary */}
        {user && (
          <div className="bg-gradient-to-r from-amber-500/10 via-zinc-100 dark:via-zinc-900 to-zinc-100 dark:to-zinc-900 border border-amber-500/25 p-4 rounded-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/20 rounded-xl text-amber-600 dark:text-amber-400">
                  <Coins className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">Poin Stamp Komunitas</p>
                  <p className="text-base font-extrabold text-zinc-900 dark:text-white">{userData?.points || 0} Poin</p>
                </div>
              </div>
              <Badge variant="amber" size="sm">
                Surakarta
              </Badge>
            </div>
          </div>
        )}

        {/* Theme Mode Selector */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider pl-1">
            Tampilan & Tema Aplikasi:
          </h4>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
            <button
              onClick={() => setTheme("light")}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
                theme === "light"
                  ? "bg-white text-zinc-900 shadow-sm border border-zinc-200"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400"
              }`}
            >
              <Sun className="h-3.5 w-3.5 text-amber-500" />
              <span>Terang</span>
            </button>

            <button
              onClick={() => setTheme("dark")}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
                theme === "dark"
                  ? "bg-zinc-800 text-white shadow-sm border border-zinc-700"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400"
              }`}
            >
              <Moon className="h-3.5 w-3.5 text-amber-400" />
              <span>Gelap</span>
            </button>

            <button
              onClick={() => setTheme("system")}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
                theme === "system"
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-zinc-200 dark:border-zinc-700"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400"
              }`}
            >
              <Laptop className="h-3.5 w-3.5 text-blue-500" />
              <span>Sistem</span>
            </button>
          </div>
        </div>

        {/* Multi-Role Quick Jumps */}
        {user && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider pl-1">
              Jelajahi Portal Ekosistem:
            </h4>
            <div className="space-y-1.5">
              {roleNavigation.map((item) => {
                const Icon = item.icon;
                const isCurrent = activeRole === item.role;

                return (
                  <button
                    key={item.role}
                    onClick={() => {
                      onClose();
                      router.push(item.path);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all text-left ${
                      isCurrent
                        ? "bg-zinc-100 dark:bg-zinc-800/80 border-emerald-500/40"
                        : "bg-zinc-50 dark:bg-zinc-900/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-800/80"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${item.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-zinc-900 dark:text-white">{item.label}</p>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400">{item.desc}</p>
                      </div>
                    </div>
                    {isCurrent ? (
                      <Badge variant="emerald" size="sm">
                        Aktif
                      </Badge>
                    ) : (
                      <ChevronRight className="h-4 w-4 text-zinc-400 dark:text-zinc-600" />
                    )}
                  </button>
                );
              })}

              {userData?.role === "admin" && (
                <button
                  onClick={() => {
                    onClose();
                    router.push("/admin");
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-rose-500/20 text-rose-500">
                      <ShieldAlert className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-rose-600 dark:text-rose-300">Super Admin Control Hub</p>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Ubah role user & impersonate tester</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-rose-500" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* WhatsApp Help */}
        <button
          onClick={() => window.open("https://wa.me/6281234567890?text=Halo%20Admin%20Ride-Solo%20Surakarta", "_blank")}
          className="w-full flex items-center justify-between p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <HelpCircle className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-900 dark:text-white">Pusat Bantuan Komunitas</p>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400">WhatsApp resmi pengurus koperasi</p>
            </div>
          </div>
          <ExternalLink className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
        </button>

        {/* Logout */}
        {user && (
          <Button
            variant="danger"
            className="w-full h-11 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-bold text-xs flex items-center justify-center gap-2"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Keluar dari Akun
          </Button>
        )}
      </div>
    </BottomSheet>
  );
}
