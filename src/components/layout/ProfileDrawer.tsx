"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { useTheme } from "@/components/theme/ThemeProvider";
import { authService } from "@/services/auth.service";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
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
  Laptop,
  MapPin,
  Wallet,
  Gift,
  FileText,
  Clock,
  Award,
  AlertTriangle,
  QrCode,
  Sparkles,
  Phone,
  CheckCircle2,
  Lock,
  Layers,
  History
} from "lucide-react";
import { 
  SoloMotorIcon,
  SoloMarketIcon,
  SoloIndustryCargoIcon,
  SoloGovPillarIcon,
  SoloShieldTrustIcon,
  SoloAllServicesIcon,
  SoloCoinStampIcon
} from "@/components/icons";
import { GOVERNMENT_SECTORS, INDUSTRY_SECTORS } from "@/constants/ecosystemSectors";
import { SavedAddressesModal } from "@/components/profile/SavedAddressesModal";
import { UnifiedHistoryModal } from "@/components/history/UnifiedHistoryModal";

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileDrawer({ isOpen, onClose }: ProfileDrawerProps) {
  const router = useRouter();
  const { user, userData, activeRole, setImpersonatedRole, isImpersonating } = useAuthContext();
  const { theme, setTheme } = useTheme();

  // Saved Addresses Modal State
  const [isAddressesModalOpen, setIsAddressesModalOpen] = useState(false);
  // Unified History Modal State
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const handleLogout = async () => {
    await authService.logout();
    setImpersonatedRole(null);
    onClose();
    router.push("/login");
  };

  // Determine if user has admin privileges or is currently impersonating
  const isSuperAdminOrImpersonating = userData?.role === "admin" || isImpersonating;

  const currentSectorInfo = 
    activeRole === "government" 
      ? GOVERNMENT_SECTORS.find(s => s.id === (userData?.additionalRole || "gov_dukcapil"))
      : activeRole === "industry"
      ? INDUSTRY_SECTORS.find(s => s.id === (userData?.additionalRole || "ind_kargo"))
      : null;

  const roleNavigation = [
    { role: "customer", label: "Mode Pelanggan (Warga)", desc: "Pesan ojek, kuliner & belanja UMKM", icon: User, path: "/", color: "text-emerald-500 bg-emerald-500/10" },
    { role: "driver", label: "Mode Mitra Driver", desc: "Radar order & karcis harian bebas komisi", icon: SoloMotorIcon, path: "/driver", color: "text-amber-500 bg-amber-500/10" },
    { role: "merchant", label: "Mode Mitra UMKM", desc: "Kelola toko, menu & Flash Sale Pasar Warga", icon: SoloMarketIcon, path: "/merchant", color: "text-orange-500 bg-orange-500/10" },
    { role: "industry", label: "Mode Industri B2B", desc: "Logistik kargo & pasokan bahan baku lokal", icon: SoloIndustryCargoIcon, path: "/industry", color: "text-blue-500 bg-blue-500/10" },
    { role: "government", label: "Mode Pemerintah", desc: "Smart City & broadcast resmi dinas", icon: SoloGovPillarIcon, path: "/gov", color: "text-teal-500 bg-teal-500/10" },
  ];

  return (
    <>
      <BottomSheet isOpen={isOpen} onClose={onClose} className="max-w-md mx-auto max-h-[88vh] overflow-y-auto">
        <div className="space-y-4 pb-6">
          {/* ========================================================================= */}
          {/* 1. PROFILE HEADER CARD */}
          {/* ========================================================================= */}
          {user ? (
            <div className="p-4.5 rounded-[2rem] bg-slate-50/90 dark:bg-white/[0.04] shadow-xs space-y-3.5">
              <div className="flex items-center gap-3.5">
                <div className={`w-14 h-14 rounded-[1.3rem] flex items-center justify-center text-white text-xl font-black shadow-md shrink-0 ${
                  activeRole === "driver" 
                    ? "bg-gradient-to-tr from-amber-600 to-orange-500" 
                    : activeRole === "merchant"
                    ? "bg-gradient-to-tr from-orange-600 to-red-500"
                    : activeRole === "government"
                    ? "bg-gradient-to-tr from-teal-600 to-emerald-500"
                    : activeRole === "industry"
                    ? "bg-gradient-to-tr from-blue-600 to-indigo-500"
                    : "bg-gradient-to-tr from-emerald-600 to-teal-500"
                }`}>
                  {userData?.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                      {userData?.displayName || "Pengguna Ride-Solo"}
                    </h3>
                    <Badge 
                      variant={
                        activeRole === "driver" ? "amber" :
                        activeRole === "merchant" ? "orange" :
                        activeRole === "government" ? "teal" :
                        activeRole === "industry" ? "blue" : "emerald"
                      } 
                      size="sm"
                    >
                      {activeRole.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 truncate mt-0.5">{user.email}</p>
                  {currentSectorInfo && (
                    <p className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold mt-0.5">
                      {currentSectorInfo.avatar} {currentSectorInfo.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Quick Status / Identity Metric Pill */}
              {activeRole === "customer" && (
                <div className="p-3 bg-white dark:bg-[#0c1220] rounded-2xl shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins className="h-4 w-4 text-amber-500" />
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Stamp Belanja UMKM</span>
                      <span className="text-xs font-black text-slate-900 dark:text-white">{userData?.points || 0} Poin</span>
                    </div>
                  </div>
                  <Badge variant="emerald" size="sm">Warga Surakarta</Badge>
                </div>
              )}

              {activeRole === "driver" && (
                <div className="p-3 bg-white dark:bg-[#0c1220] rounded-2xl shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Karcis Harian 24 Jam</span>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">Aktif (Bebas Komisi)</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Rating Koperasi</span>
                    <span className="text-xs font-black text-amber-500">⭐ 4.9 (184 Trip)</span>
                  </div>
                </div>
              )}

              {activeRole === "merchant" && (
                <div className="p-3 bg-white dark:bg-[#0c1220] rounded-2xl shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Status Kios / Warung</span>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">🟢 Buka Menerima Pesanan</span>
                  </div>
                  <Badge variant="orange" size="sm">0% Komisi</Badge>
                </div>
              )}

              {activeRole === "government" && (
                <div className="p-3 bg-white dark:bg-[#0c1220] rounded-2xl border border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">SKPD / Instansi</span>
                    <span className="text-xs font-black text-teal-600 dark:text-teal-400">{currentSectorInfo?.name || "Pemkot Surakarta"}</span>
                  </div>
                  <Badge variant="teal" size="sm">Akses Resmi</Badge>
                </div>
              )}

              {activeRole === "industry" && (
                <div className="p-3 bg-white dark:bg-[#0c1220] rounded-2xl border border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Entitas B2B Mitra</span>
                    <span className="text-xs font-black text-blue-600 dark:text-blue-400">{currentSectorInfo?.agencyOrCompanyName || "Mitra Industri Solo"}</span>
                  </div>
                  <Badge variant="blue" size="sm">Kontrak Aktif</Badge>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-slate-100 dark:bg-zinc-800/60 rounded-2xl border border-slate-200 dark:border-zinc-700/60 text-center space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Belum Masuk ke Akun</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Masuk untuk mengakses ekosistem lokal tanpa perantara.</p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1 h-9 text-xs"
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

          {/* ========================================================================= */}
          {/* 2. ROLE-SPECIFIC MENU ITEMS */}
          {/* ========================================================================= */}
          {user && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider pl-1">
                Menu & Pengaturan {activeRole.toUpperCase()}:
              </h4>

              {/* A. MENU KHUSUS CUSTOMER (WARGA) */}
              {activeRole === "customer" && (
                <div className="space-y-1.5">
                  <button
                    onClick={() => { onClose(); setIsHistoryModalOpen(true); }}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/30 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                        <History className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Riwayat Pesanan & Transaksi</p>
                        <p className="text-[10px] text-slate-500">Ojek, kuliner, kirim kilat & layanan dinas</p>
                      </div>
                    </div>
                    <Badge variant="emerald" size="sm">Aktivitas</Badge>
                  </button>

                  <button
                    onClick={() => { onClose(); router.push("/services/more"); }}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.06] transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <SoloAllServicesIcon size={18} variant="duotone" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Semua Layanan Warga Solo</p>
                        <p className="text-[10px] text-slate-500">16 Layanan Mobilitas, UMKM & Dinas</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </button>

                  <button
                    onClick={() => setIsAddressesModalOpen(true)}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.06] transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Alamat Favorit Tersimpan</p>
                        <p className="text-[10px] text-slate-500">Kelola titik jemput rumah & kantor</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </button>

                  <button
                    onClick={() => alert("Formulir Pendaftaran Mitra Driver Koperasi Solo. Hubungi Koperasi di Balai Kota.")}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
                        <SoloMotorIcon size={18} variant="duotone" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-amber-700 dark:text-amber-300">Daftar Jadi Mitra Driver Solo</p>
                        <p className="text-[10px] text-slate-500">Pendapatan 100% tunai bersih tanpa komisi</p>
                      </div>
                    </div>
                    <Badge variant="amber" size="sm">Buka Pendaftaran</Badge>
                  </button>
                </div>
              )}

              {/* B. MENU KHUSUS DRIVER (MITRA PENGEMUDI) */}
              {activeRole === "driver" && (
                <div className="space-y-1.5">
                  <button
                    onClick={() => { onClose(); setIsHistoryModalOpen(true); }}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/30 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
                        <History className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Riwayat Trip & Pendapatan</p>
                        <p className="text-[10px] text-slate-500">Semua order selesai & penerimaan bersih 100%</p>
                      </div>
                    </div>
                    <Badge variant="amber" size="sm">Catatan</Badge>
                  </button>

                  <button
                    onClick={() => { onClose(); router.push("/driver"); }}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.06] text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
                        <SoloMotorIcon size={18} variant="duotone" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Pusat Radar & Order Driver</p>
                        <p className="text-[10px] text-slate-500">Peta hotspot keramaian & pesanan masuk</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </button>

                  <button
                    onClick={() => alert("KTA Digital Koperasi Angkutan Mitra Surakarta (Terverifikasi).")}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.06] transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        <SoloShieldTrustIcon size={18} variant="duotone" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">KTA Digital Koperasi Mitra</p>
                        <p className="text-[10px] text-slate-500">ID Anggota: KOP-SOLO-08892</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </button>

                  <button
                    onClick={() => alert("Nomor Darurat Satgas Koperasi Solo 24 Jam: 0811-2345-678")}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-rose-500/10 border border-rose-500/25 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400">
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-rose-600 dark:text-rose-400">Tombol Darurat & Satgas 24 Jam</p>
                        <p className="text-[10px] text-slate-500">Bantuan kecelakaan / mogok / keamanan</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-rose-500" />
                  </button>
                </div>
              )}

              {/* C. MENU KHUSUS MERCHANT (UMKM) */}
              {activeRole === "merchant" && (
                <div className="space-y-1.5">
                  <button
                    onClick={() => { onClose(); setIsHistoryModalOpen(true); }}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-orange-500/10 hover:bg-orange-500/15 border border-orange-500/30 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-orange-500/20 text-orange-600 dark:text-orange-400">
                        <History className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Riwayat Penjualan & Omset</p>
                        <p className="text-[10px] text-slate-500">Semua pesanan makanan selesai & rekap kasir</p>
                      </div>
                    </div>
                    <Badge variant="orange" size="sm">Omset</Badge>
                  </button>

                  <button
                    onClick={() => { onClose(); router.push("/merchant"); }}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.06] text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-orange-500/20 text-orange-600 dark:text-orange-400">
                        <SoloMarketIcon size={18} variant="duotone" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Dashboard Toko & Kelola Menu</p>
                        <p className="text-[10px] text-slate-500">Pesanan makanan, stok & Flash Sale</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </button>

                  <button
                    onClick={() => alert("Pendampingan Sertifikasi Halal Gratis & NIB Diskop Surakarta.")}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.06] transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Award className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Program NIB & Halal Diskop</p>
                        <p className="text-[10px] text-slate-500">Legalitas usaha mikro difasilitasi Pemkot</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </button>
                </div>
              )}

              {/* D. MENU KHUSUS GOVERNMENT (PEMERINTAH) */}
              {activeRole === "government" && (
                <div className="space-y-1.5">
                  <button
                    onClick={() => { onClose(); setIsHistoryModalOpen(true); }}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-teal-500/10 hover:bg-teal-500/15 border border-teal-500/30 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-teal-500/20 text-teal-600 dark:text-teal-400">
                        <History className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Riwayat Berkas & Bansos Dinas</p>
                        <p className="text-[10px] text-slate-500">Log audit layanan KTP, bansos & resep tuntas</p>
                      </div>
                    </div>
                    <Badge variant="teal" size="sm">Audit Log</Badge>
                  </button>

                  <button
                    onClick={() => { onClose(); router.push("/gov"); }}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.06] text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-teal-500/20 text-teal-600 dark:text-teal-400">
                        <SoloGovPillarIcon size={18} variant="duotone" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Pusat Komando Dinas Pemkot</p>
                        <p className="text-[10px] text-slate-500">Kelola berkas masuk & siaran darurat</p>
                      </div>
                    </div>
                    <Badge variant="teal" size="sm">Buka Portal</Badge>
                  </button>
                </div>
              )}

              {/* E. MENU KHUSUS INDUSTRY (B2B) */}
              {activeRole === "industry" && (
                <div className="space-y-1.5">
                  <button
                    onClick={() => { onClose(); setIsHistoryModalOpen(true); }}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-blue-500/10 hover:bg-blue-500/15 border border-blue-500/30 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400">
                        <History className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Riwayat Pengantaran Kargo B2B</p>
                        <p className="text-[10px] text-slate-500">Arsip surat jalan pengiriman & lab selesai</p>
                      </div>
                    </div>
                    <Badge variant="blue" size="sm">Arsip</Badge>
                  </button>

                  <button
                    onClick={() => { onClose(); router.push("/industry"); }}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.06] text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400">
                        <SoloIndustryCargoIcon size={18} variant="duotone" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Portal Logistik B2B Industri</p>
                        <p className="text-[10px] text-slate-500">Dispatch kargo, kurir lab & shuttle</p>
                      </div>
                    </div>
                    <Badge variant="blue" size="sm">Buka Portal</Badge>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. TAMPILAN & TEMA APLIKASI (SEMUA ROLE) */}
          {/* ========================================================================= */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider pl-1">
              Tampilan & Tema Aplikasi:
            </h4>
            <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-100/90 dark:bg-white/[0.04] rounded-2xl">
              <button
                onClick={() => setTheme("light")}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  theme === "light"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:text-zinc-400"
                }`}
              >
                <Sun className="h-3.5 w-3.5 text-amber-500" />
                <span>Terang</span>
              </button>

              <button
                onClick={() => setTheme("dark")}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  theme === "dark"
                    ? "bg-white dark:bg-white/[0.14] text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:text-zinc-400"
                }`}
              >
                <Moon className="h-3.5 w-3.5 text-amber-400" />
                <span>Gelap</span>
              </button>

              <button
                onClick={() => setTheme("system")}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  theme === "system"
                    ? "bg-white dark:bg-white/[0.14] text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:text-zinc-400"
                }`}
              >
                <Laptop className="h-3.5 w-3.5 text-blue-500" />
                <span>Sistem</span>
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 4. SUPER ADMIN & IMPERSONATE SWITCHER (HANYA MUNCUL UNTUK ADMIN/TESTER) */}
          {/* ========================================================================= */}
          {isSuperAdminOrImpersonating && (
            <div className="space-y-2 p-3.5 rounded-3xl bg-rose-500/5 dark:bg-rose-950/20 border border-rose-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4 text-rose-500" />
                  <h4 className="text-xs font-black text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                    Admin & Sandbox Switcher:
                  </h4>
                </div>
                <Badge variant="rose" size="sm">TEST DEV</Badge>
              </div>

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
                      className={`w-full flex items-center justify-between p-2.5 rounded-2xl border transition-all text-left cursor-pointer ${
                        isCurrent
                          ? "bg-white dark:bg-zinc-800 border-rose-500/40 shadow-sm"
                          : "bg-white/50 dark:bg-white/[0.02] hover:bg-white dark:hover:bg-white/[0.06] border-slate-200/60 dark:border-white/[0.05]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`p-1.5 rounded-xl ${item.color}`}>
                          <Icon size={16} variant="duotone" className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{item.label}</p>
                          <p className="text-[9px] text-slate-500 dark:text-zinc-400">{item.desc}</p>
                        </div>
                      </div>
                      {isCurrent ? (
                        <Badge variant="rose" size="sm">
                          Aktif
                        </Badge>
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                      )}
                    </button>
                  );
                })}

                <button
                  onClick={() => {
                    onClose();
                    router.push("/admin");
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-rose-600 text-white font-bold text-xs shadow-md cursor-pointer hover:bg-rose-500 transition-colors mt-2"
                >
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4" />
                    <span>Buka Super Admin Control Hub</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 5. WHATSAPP BANTUAN & LOGOUT */}
          {/* ========================================================================= */}
          <button
            onClick={() => window.open("https://wa.me/6281234567890?text=Halo%20Admin%20Ride-Solo%20Surakarta", "_blank")}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.06] transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                <HelpCircle className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Pusat Bantuan & Komunitas</p>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400">WhatsApp resmi pengurus koperasi Solo</p>
              </div>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-slate-400 dark:text-zinc-500" />
          </button>

          {user && (
            <Button
              variant="danger"
              className="w-full h-11 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Keluar dari Akun
            </Button>
          )}
        </div>
      </BottomSheet>

      {/* Dedicated Saved Addresses Modal */}
      <SavedAddressesModal 
        isOpen={isAddressesModalOpen} 
        onClose={() => setIsAddressesModalOpen(false)} 
      />

      {/* Dedicated Unified History Modal */}
      <UnifiedHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
      />
    </>
  );
}
