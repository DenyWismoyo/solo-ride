"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { useKYCRequests } from "@/hooks/useKYCRequests";
import { kycService } from "@/services/kyc.service";
import { AppHeader } from "@/components/layout/AppHeader";
import { AdminImpersonationBar } from "@/components/admin/AdminImpersonationBar";
import { ProfileDrawer } from "@/components/layout/ProfileDrawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ShieldAlert, 
  Eye, 
  Users, 
  UserCheck, 
  Bike, 
  Store, 
  Building2, 
  Landmark, 
  Check, 
  Search, 
  Loader2, 
  ArrowRight, 
  Sparkles, 
  Zap, 
  Activity,
  FileCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Settings2
} from "lucide-react";
import { UserDocument, UserRole } from "@/types/user.types";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";

export default function SuperAdminPage() {
  const router = useRouter();
  const { user, userData, setImpersonatedRole } = useAuthContext();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState<"users" | "kyc">("users");

  const [usersList, setUsersList] = useState<UserDocument[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingUid, setUpdatingUid] = useState<string | null>(null);

  // KYC Requests
  const { requests: kycRequests, loading: loadingKYC } = useKYCRequests();
  const [processingKYCId, setProcessingKYCId] = useState<string | null>(null);

  // Fetch all registered users
  useEffect(() => {
    const unsub = onSnapshot(collection(db, COLLECTIONS.USERS), (snapshot) => {
      const users: UserDocument[] = [];
      snapshot.forEach((d) => {
        users.push({ uid: d.id, ...d.data() } as UserDocument);
      });
      setUsersList(users);
      setLoadingUsers(false);
    });
    return () => unsub();
  }, []);

  const handleImpersonate = (role: UserRole, targetPath: string) => {
    setImpersonatedRole(role);
    router.push(targetPath);
  };

  const handleUpdateRole = async (targetUid: string, newRole: UserRole) => {
    setUpdatingUid(targetUid);
    try {
      await updateDoc(doc(db, COLLECTIONS.USERS, targetUid), {
        role: newRole
      });
      alert(`Role user berhasil diubah menjadi: ${newRole.toUpperCase()}`);
    } catch (err) {
      alert("Gagal mengubah role. Pastikan izin Firestore mengizinkan.");
    } finally {
      setUpdatingUid(null);
    }
  };

  const handleToggleVerify = async (targetUid: string, currentStatus: boolean = false) => {
    setUpdatingUid(targetUid);
    try {
      await updateDoc(doc(db, COLLECTIONS.USERS, targetUid), {
        isVerified: !currentStatus
      });
    } catch (err) {
      alert("Gagal memperbarui status verifikasi.");
    } finally {
      setUpdatingUid(null);
    }
  };

  const handleReviewKYC = async (reqId: string, driverUid: string, status: "approved" | "rejected") => {
    if (!user) return;
    setProcessingKYCId(reqId);
    try {
      await kycService.reviewKYCRequest(reqId, driverUid, status, user.uid);
      alert(status === "approved" ? "✅ KYC Driver berhasil disetujui! Status akun terverifikasi." : "KYC Driver ditolak.");
    } catch (err) {
      alert("Gagal memproses permohonan KYC.");
    } finally {
      setProcessingKYCId(null);
    }
  };

  const filteredUsers = usersList.filter(u => 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingKYCCount = kycRequests.filter(r => r.status === "pending").length;

  return (
    <div className="relative min-h-[100dvh] bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 flex flex-col justify-between pb-16 overflow-hidden bg-grid-pattern transition-colors duration-200">
      {/* Ambient Lighting */}
      <div className="ambient-glow bg-emerald-500 -top-20 -right-20" />
      <div className="ambient-glow bg-rose-500 top-1/3 -left-32" />
      <div className="ambient-glow bg-blue-500 bottom-10 right-10" />

      <AdminImpersonationBar />
      <AppHeader onOpenProfile={() => setIsProfileOpen(true)} />

      <main className="pt-20 px-4 max-w-lg w-full mx-auto space-y-6 flex-1 relative z-10">
        {/* Executive Header Banner */}
        <div className="sg-bento-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.15)] shrink-0">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                    Super Admin Control
                  </h2>
                  <Badge variant="rose" size="sm">
                    ROOT ACCESS
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Pusat Kendali Ekosistem 6-Pilar & Role Engine
                </p>
              </div>
            </div>

            <Badge variant="emerald" size="sm" withDot>
              Live System
            </Badge>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-200 dark:border-white/[0.06] text-center">
            <div className="p-2.5 rounded-2xl bg-slate-100/80 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.04]">
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-medium">Total Akun</span>
              <span className="text-base font-black text-slate-900 dark:text-white">{usersList.length} User</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-100/80 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.04]">
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-medium">Mitra Aktif</span>
              <span className="text-base font-black text-amber-600 dark:text-amber-400">
                {usersList.filter(u => u.role === "driver" || u.role === "merchant").length} Mitra
              </span>
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-100/80 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.04]">
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-medium">KYC Pending</span>
              <span className="text-base font-black text-rose-600 dark:text-rose-400">{pendingKYCCount} Dokumen</span>
            </div>
            <button 
              onClick={() => router.push('/admin/bizconfig')}
              className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-500/20 hover:border-indigo-500/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors flex flex-col items-center justify-center cursor-pointer"
            >
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 block font-bold mb-1">BizConfig</span>
              <Settings2 className="h-4 w-4 text-indigo-500" />
            </button>
          </div>
        </div>

        {/* Section 1: Role Impersonator Bento Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-amber-500 dark:text-amber-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white sg-editorial-title">
                Role Impersonator (Uji Perspektif)
              </h3>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">Sekali Klik</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Customer Card */}
            <button
              onClick={() => handleImpersonate("customer", "/")}
              className="sg-bento-card p-4 text-left space-y-2 hover:border-emerald-500/40 group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                  <Users className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                  Uji <ArrowRight className="h-3 w-3" />
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Mode Pelanggan
                </p>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400">Super-App & Peta Booking</p>
              </div>
            </button>

            {/* Driver Card */}
            <button
              onClick={() => handleImpersonate("driver", "/driver")}
              className="sg-bento-card p-4 text-left space-y-2 hover:border-amber-500/40 group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
                  <Bike className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                  Uji <ArrowRight className="h-3 w-3" />
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  Mode Mitra Driver
                </p>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400">Radar Order & Karcis Pass</p>
              </div>
            </button>

            {/* Merchant Card */}
            <button
              onClick={() => handleImpersonate("merchant", "/merchant")}
              className="sg-bento-card p-4 text-left space-y-2 hover:border-orange-500/40 group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 group-hover:scale-110 transition-transform">
                  <Store className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-extrabold text-orange-600 dark:text-orange-300 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                  Uji <ArrowRight className="h-3 w-3" />
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                  Mode Mitra UMKM
                </p>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400">Toko & Flash Sale Pasar</p>
              </div>
            </button>

            {/* Industry Card */}
            <button
              onClick={() => handleImpersonate("industry", "/industry")}
              className="sg-bento-card p-4 text-left space-y-2 hover:border-blue-500/40 group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform">
                  <Building2 className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-300 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                  Uji <ArrowRight className="h-3 w-3" />
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Mode Industri B2B
                </p>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400">Kargo & Rantai Pasok</p>
              </div>
            </button>

            {/* Government Card (Full Width) */}
            <button
              onClick={() => handleImpersonate("government", "/gov")}
              className="col-span-2 sg-bento-card p-4 text-left space-y-2 hover:border-teal-500/40 group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 group-hover:scale-110 transition-transform">
                  <Landmark className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-extrabold text-teal-600 dark:text-teal-300 bg-teal-500/10 border border-teal-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  Uji Portal Pemda <ArrowRight className="h-3 w-3" />
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  Mode Pemerintah (Pemda Surakarta & Koperasi)
                </p>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400">Broadcast Pengumuman Warga & Analisis Ekonomi Mikro</p>
              </div>
            </button>
          </div>
        </div>

        {/* Section 2: Toggle Tab between Users and KYC Requests */}
        <div className="flex items-center gap-2 p-1 bg-slate-200/80 dark:bg-zinc-850 rounded-2xl">
          <button
            onClick={() => setActiveAdminTab("users")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeAdminTab === "users"
                ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-zinc-400"
            }`}
          >
            Kelola Role ({filteredUsers.length})
          </button>
          <button
            onClick={() => setActiveAdminTab("kyc")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeAdminTab === "kyc"
                ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-zinc-400"
            }`}
          >
            Verifikasi KYC Mitra
            {pendingKYCCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
                {pendingKYCCount}
              </span>
            )}
          </button>
        </div>

        {/* Tab 1: User Role Manager Table */}
        {activeAdminTab === "users" && (
          <div className="space-y-3">
            {/* Search Box */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 dark:text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari user berdasarkan email/nama/role..."
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#0b0f19]/90 border border-slate-200 dark:border-white/[0.08] focus:border-emerald-500/60 rounded-2xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none backdrop-blur-xl shadow-sm dark:shadow-inner transition-colors"
              />
            </div>

            {loadingUsers ? (
              <div className="p-10 text-center bg-white dark:bg-[#0b0f19]/80 border border-slate-200 dark:border-white/[0.06] rounded-3xl backdrop-blur-xl">
                <Loader2 className="h-6 w-6 text-rose-500 animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-500 dark:text-zinc-400">Menyinkronkan data pengguna...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-[#0b0f19]/80 border border-slate-200 dark:border-white/[0.06] rounded-3xl text-xs text-slate-500 dark:text-zinc-400">
                Tidak ada pengguna yang cocok dengan pencarian.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map((u) => (
                  <div
                    key={u.uid}
                    className="sg-bento-card p-4 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center font-bold text-white text-sm shadow-sm shrink-0">
                          {u.displayName?.charAt(0).toUpperCase() || u.email?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                              {u.displayName || "Tanpa Nama"}
                            </span>
                            {u.isVerified && (
                              <span className="text-[9px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded-md font-extrabold flex items-center gap-0.5">
                                <Check className="h-2.5 w-2.5" /> Terverifikasi
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 truncate">{u.email}</p>
                        </div>
                      </div>

                      <Badge variant={u.role === "admin" ? "rose" : u.role === "driver" ? "amber" : u.role === "merchant" ? "orange" : u.role === "industry" ? "blue" : u.role === "government" ? "teal" : "emerald"} size="sm">
                        {u.role}
                      </Badge>
                    </div>

                    {/* Role Modifier Dropdown & Action */}
                    <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-200 dark:border-white/[0.06]">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 shrink-0">Ubah Role:</span>
                        <select
                          value={u.role}
                          onChange={(e) => handleUpdateRole(u.uid, e.target.value as UserRole)}
                          disabled={updatingUid === u.uid}
                          className="bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-800 border border-slate-300 dark:border-white/[0.12] rounded-xl px-2.5 py-1 text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:border-rose-500 transition-colors cursor-pointer"
                        >
                          <option value="customer">Customer (Pelanggan)</option>
                          <option value="driver">Driver (Mitra Ojek)</option>
                          <option value="merchant">Merchant (Mitra UMKM)</option>
                          <option value="industry">Industry (B2B)</option>
                          <option value="government">Government (Pemda)</option>
                          <option value="admin">Super Admin</option>
                        </select>
                      </div>

                      <button
                        onClick={() => handleToggleVerify(u.uid, u.isVerified)}
                        disabled={updatingUid === u.uid}
                        className={`text-[10px] font-extrabold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                          u.isVerified 
                            ? "bg-slate-200 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-400 border border-slate-300 dark:border-zinc-700/60 hover:text-rose-600 hover:border-rose-500/30"
                            : "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm hover:opacity-90"
                        }`}
                      >
                        {u.isVerified ? "Batal Verif" : "Verifikasi"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: KYC Requests Approval Panel */}
        {activeAdminTab === "kyc" && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider pl-1">
              Daftar Permohonan KYC Mitra Driver ({kycRequests.length})
            </h3>

            {loadingKYC ? (
              <div className="p-8 text-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl">
                <Loader2 className="h-6 w-6 text-amber-500 animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-500">Memuat pengajuan KYC...</p>
              </div>
            ) : kycRequests.length === 0 ? (
              <div className="sg-card p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 text-center space-y-1 shadow-sm">
                <FileCheck className="h-8 w-8 text-slate-400 dark:text-zinc-500 mx-auto" />
                <p className="text-xs font-bold text-slate-800 dark:text-zinc-200">Belum Ada Pengajuan KYC Masuk</p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Ketika mitra driver mengirimkan data KTP & SIM di aplikasinya, permohonan akan tampil di sini untuk ditinjau.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {kycRequests.map((req) => (
                  <div
                    key={req.id}
                    className="sg-card p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 space-y-3 shadow-sm"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">{req.driverName}</h4>
                          <Badge 
                            variant={req.status === "approved" ? "emerald" : req.status === "rejected" ? "rose" : "amber"} 
                            size="sm"
                          >
                            {req.status}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">{req.driverEmail} • {req.phone}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-slate-200 dark:border-zinc-700/50">
                      <div>
                        <span className="text-slate-400 dark:text-zinc-500 block text-[10px]">NIK KTP:</span>
                        <span className="font-bold text-slate-800 dark:text-zinc-200">{req.nik}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 dark:text-zinc-500 block text-[10px]">No. SIM C:</span>
                        <span className="font-bold text-slate-800 dark:text-zinc-200">{req.simNumber}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 dark:text-zinc-500 block text-[10px]">Plat Nomor:</span>
                        <span className="font-bold text-slate-800 dark:text-zinc-200">{req.vehiclePlate}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 dark:text-zinc-500 block text-[10px]">Kendaraan:</span>
                        <span className="font-bold text-slate-800 dark:text-zinc-200">{req.vehicleModel}</span>
                      </div>
                    </div>

                    {req.status === "pending" && (
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200 dark:border-zinc-800">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => req.id && handleReviewKYC(req.id, req.userId, "rejected")}
                          disabled={processingKYCId === req.id}
                          className="h-8 text-xs border-rose-500/30 text-rose-600 hover:bg-rose-500/10 cursor-pointer"
                        >
                          Tolak
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => req.id && handleReviewKYC(req.id, req.userId, "approved")}
                          disabled={processingKYCId === req.id}
                          className="h-8 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                        >
                          {processingKYCId === req.id ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                          Setujui (Approve)
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <ProfileDrawer isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
}
