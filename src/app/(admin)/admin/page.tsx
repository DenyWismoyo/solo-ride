"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { useKYCRequests } from "@/hooks/useKYCRequests";
import { kycService } from "@/services/kyc.service";
import { seedEcosystemSandbox } from "@/lib/seedSandbox";
import { SANDBOX_PERSONAS, SandboxPersona } from "@/types/sandbox.types";
import { getAllSectorsForRole, getSectorDetails } from "@/constants/ecosystemSectors";
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
  Settings2,
  Database,
  RefreshCw,
  Layers,
  ChevronRight,
  Filter,
  Play,
  RotateCcw,
  SlidersHorizontal,
  ExternalLink,
  Laptop
} from "lucide-react";
import { UserDocument, UserRole } from "@/types/user.types";
import { collection, onSnapshot, doc, updateDoc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";

export default function SuperAdminPage() {
  const router = useRouter();
  const { user, userData, setImpersonatedRole, setImpersonatedPersona, impersonatedPersona, impersonatedRole, isImpersonating } = useAuthContext();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState<"users" | "kyc">("users");

  const [usersList, setUsersList] = useState<UserDocument[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
  const [updatingUid, setUpdatingUid] = useState<string | null>(null);

  // Persona Sandbox Filter in Right Column
  const [personaFilter, setPersonaFilter] = useState<"all" | "gov" | "ind" | "mitra" | "citizen">("all");

  // Seeding State
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedSuccessMessage, setSeedSuccessMessage] = useState<string | null>(null);

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

  const handleImpersonatePersona = (persona: SandboxPersona) => {
    setImpersonatedPersona(persona);
    router.push(persona.targetPath);
  };

  const handleExitImpersonate = () => {
    setImpersonatedPersona(null);
    setImpersonatedRole(null);
  };

  const handleSeedSandbox = async () => {
    setIsSeeding(true);
    setSeedSuccessMessage(null);
    try {
      const res = await seedEcosystemSandbox();
      setSeedSuccessMessage(res.message);
      alert(res.message);
    } catch (err: any) {
      alert(err.message || "Gagal menginisialisasi Sandbox");
    } finally {
      setIsSeeding(false);
    }
  };

  const handleUpdateRole = async (targetUid: string, newRole: UserRole, newAdditionalRole?: string) => {
    setUpdatingUid(targetUid);
    try {
      const updatePayload: Record<string, any> = {
        role: newRole,
        updatedAt: serverTimestamp()
      };

      if (newAdditionalRole !== undefined) {
        updatePayload.additionalRole = newAdditionalRole;
      }

      await updateDoc(doc(db, COLLECTIONS.USERS, targetUid), updatePayload);

      // Auto-initialize driver wallet if user role changed to driver
      if (newRole === "driver") {
        const walletRef = doc(db, COLLECTIONS.WALLETS, targetUid);
        const walletSnap = await getDoc(walletRef);
        if (!walletSnap.exists()) {
          await setDoc(walletRef, {
            userId: targetUid,
            balance: 0,
            updatedAt: serverTimestamp()
          });
        }
      }

      alert(`✅ Role user berhasil diubah menjadi: ${newRole.toUpperCase()}${newAdditionalRole ? ` (${newAdditionalRole})` : ''}`);
    } catch (err: any) {
      console.error("Firestore Role Update Error:", err);
      alert(`Gagal mengubah role: ${err.message || "Pastikan izin Firestore mengizinkan."}`);
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

  // Filtered Users based on Search and Role Filter
  const filteredUsers = useMemo(() => {
    return usersList.filter(u => {
      const matchesSearch = 
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.additionalRole?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRole = roleFilter === "all" || u.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [usersList, searchQuery, roleFilter]);

  // Filtered Personas for Right Column
  const filteredPersonas = useMemo(() => {
    if (personaFilter === "all") return SANDBOX_PERSONAS;
    if (personaFilter === "gov") return SANDBOX_PERSONAS.filter(p => p.role === "government");
    if (personaFilter === "ind") return SANDBOX_PERSONAS.filter(p => p.role === "industry");
    if (personaFilter === "mitra") return SANDBOX_PERSONAS.filter(p => p.role === "merchant" || p.role === "driver");
    if (personaFilter === "citizen") return SANDBOX_PERSONAS.filter(p => p.role === "customer");
    return SANDBOX_PERSONAS;
  }, [personaFilter]);

  const pendingKYCCount = kycRequests.filter(r => r.status === "pending").length;

  return (
    <div className="relative min-h-[100dvh] bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 flex flex-col justify-between pb-16 transition-colors duration-200">

      <AdminImpersonationBar />
      <AppHeader onOpenProfile={() => setIsProfileOpen(true)} />

      {/* ========================================================================= */}
      {/* ENTERPRISE 3:1 RESPONSIVE GRID CONTAINER */}
      {/* ========================================================================= */}
      <main className="pt-20 px-4 sm:px-6 lg:px-8 max-w-[1440px] w-full mx-auto space-y-6 flex-1 relative z-10">
        
        {/* FULL WIDTH: Executive Header Banner */}
        <div className="sg-bento-card p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.15)] shrink-0">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                    Super Admin Enterprise Hub
                  </h2>
                  <Badge variant="rose" size="sm">
                    ROOT ACCESS
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Pusat Kendali Ekosistem 6-Pilar, Role Engine & Studio Impersonasi Surakarta
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => router.push('/admin/bizconfig')}
                className="px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-500/30 hover:border-indigo-500 text-indigo-600 dark:text-indigo-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Settings2 className="h-4 w-4 text-indigo-500" />
                BizConfig Engine
              </button>

              <Badge variant="emerald" size="sm" withDot>
                Live System Active
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-200 dark:border-white/[0.06] text-center">
            <div className="p-3 rounded-2xl bg-slate-100/80 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.04]">
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block font-medium">Total Akun Terdaftar</span>
              <span className="text-lg font-black text-slate-900 dark:text-white">{usersList.length} Pengguna</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-100/80 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.04]">
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block font-medium">Mitra Driver & UMKM</span>
              <span className="text-lg font-black text-amber-600 dark:text-amber-400">
                {usersList.filter(u => u.role === "driver" || u.role === "merchant").length} Mitra
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-100/80 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.04]">
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block font-medium">Instansi Pemda & Industri</span>
              <span className="text-lg font-black text-teal-600 dark:text-teal-400">
                {usersList.filter(u => u.role === "government" || u.role === "industry").length} Lembaga
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-100/80 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.04]">
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block font-medium">Antrean Verifikasi KYC</span>
              <span className="text-lg font-black text-rose-600 dark:text-rose-400">{pendingKYCCount} Dokumen</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3:1 DUAL COLUMN WORKSPACE */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">

          {/* ======================================================================= */}
          {/* LEFT 3 COLUMNS (75% WIDTH): USER DIRECTORY & ROLE MANAGEMENT ENGINE */}
          {/* ======================================================================= */}
          <div className="lg:col-span-3 space-y-6">

            {/* SEEDER QUICK BAR */}
            <div className="sg-card p-4 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-white dark:via-zinc-900 to-emerald-500/10 flex flex-wrap items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
                  <Database className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Data Sandbox Ekosistem Surakarta
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Seed 12 persona (7 Dinas, 6 Industri B2B, UMKM, Driver, & Customer)
                  </p>
                </div>
              </div>

              <Button
                size="sm"
                onClick={handleSeedSandbox}
                disabled={isSeeding}
                className="h-9 px-3.5 bg-gradient-to-r from-amber-600 to-emerald-600 hover:from-amber-500 hover:to-emerald-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
              >
                {isSeeding ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Inisialisasi...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3.5 w-3.5" /> ⚡ 1-Click Seed Sandbox
                  </>
                )}
              </Button>
            </div>

            {seedSuccessMessage && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{seedSuccessMessage}</span>
              </div>
            )}

            {/* TAB SELECTOR: KELOLA PENGGUNA VS VERIFIKASI KYC */}
            <div className="flex items-center gap-2 p-1.5 bg-slate-200/80 dark:bg-zinc-850 rounded-2xl">
              <button
                onClick={() => setActiveAdminTab("users")}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeAdminTab === "users"
                    ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Users className="h-4 w-4 text-emerald-500" />
                <span>Direktori Pengguna & Kelola Role ({usersList.length})</span>
              </button>

              <button
                onClick={() => setActiveAdminTab("kyc")}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeAdminTab === "kyc"
                    ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <FileCheck className="h-4 w-4 text-amber-500" />
                <span>Verifikasi KYC Mitra Driver</span>
                {pendingKYCCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center ml-1">
                    {pendingKYCCount}
                  </span>
                )}
              </button>
            </div>

            {/* TAB CONTENT 1: USER DIRECTORY & ROLE MANAGEMENT TABLE */}
            {activeAdminTab === "users" && (
              <div className="space-y-4">
                
                {/* SEARCH & ADVANCED ROLE FILTER BAR */}
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400 dark:text-zinc-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari user berdasarkan nama, email, UID, role, atau dinas..."
                      className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#0b0f19]/90 border border-slate-200 dark:border-white/[0.08] focus:border-emerald-500 rounded-2xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none shadow-sm"
                    />
                  </div>

                  {/* QUICK ROLE FILTER CHIPS */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-bold mr-1 flex items-center gap-1">
                      <Filter className="h-3 w-3" /> Filter:
                    </span>
                    {(
                      [
                        { id: "all", label: "Semua", count: usersList.length },
                        { id: "customer", label: "Customer", count: usersList.filter(u => u.role === "customer").length },
                        { id: "driver", label: "Driver", count: usersList.filter(u => u.role === "driver").length },
                        { id: "merchant", label: "UMKM", count: usersList.filter(u => u.role === "merchant").length },
                        { id: "industry", label: "Industri", count: usersList.filter(u => u.role === "industry").length },
                        { id: "government", label: "Pemda", count: usersList.filter(u => u.role === "government").length },
                        { id: "admin", label: "Admin", count: usersList.filter(u => u.role === "admin").length },
                      ] as const
                    ).map((rf) => (
                      <button
                        key={rf.id}
                        onClick={() => setRoleFilter(rf.id)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          roleFilter === rf.id
                            ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
                            : "bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700"
                        }`}
                      >
                        <span>{rf.label}</span>
                        <span className="text-[9px] opacity-70 px-1 py-0.2 bg-black/10 dark:bg-white/20 rounded">
                          {rf.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* USER LIST CONTAINER */}
                {loadingUsers ? (
                  <div className="p-12 text-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl">
                    <Loader2 className="h-7 w-7 text-rose-500 animate-spin mx-auto mb-2" />
                    <p className="text-xs text-slate-500">Memuat direktori pengguna...</p>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-10 text-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl text-xs text-slate-500">
                    Tidak ada pengguna yang cocok dengan pencarian atau filter role.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredUsers.map((u) => {
                      const availableSectors = getAllSectorsForRole(u.role);
                      return (
                        <div
                          key={u.uid}
                          className="sg-card p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 space-y-3 shadow-sm hover:border-slate-400 dark:hover:border-zinc-700 transition-colors"
                        >
                          <div className="flex flex-wrap justify-between items-start gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center font-bold text-white text-base shadow-sm shrink-0">
                                {u.displayName?.charAt(0).toUpperCase() || u.email?.charAt(0).toUpperCase() || "U"}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                                    {u.displayName || "Tanpa Nama"}
                                  </span>
                                  {u.isVerified && (
                                    <span className="text-[9px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded-md font-extrabold flex items-center gap-0.5">
                                      <Check className="h-2.5 w-2.5" /> Terverifikasi
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                                  <span>{u.email}</span>
                                  <span>•</span>
                                  <span className="font-mono text-[10px] opacity-70">UID: {u.uid.slice(0, 10)}...</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Badge variant={u.role === "admin" ? "rose" : u.role === "driver" ? "amber" : u.role === "merchant" ? "orange" : u.role === "industry" ? "blue" : u.role === "government" ? "teal" : "emerald"} size="sm">
                                {u.role.toUpperCase()}
                              </Badge>
                              {u.additionalRole && (
                                <span className="text-[10px] font-bold text-teal-700 dark:text-teal-300 bg-teal-500/15 px-2 py-0.5 rounded-lg border border-teal-500/30">
                                  {u.additionalRole}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* INLINE ROLE MODIFIER & ACTIONS */}
                          <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-2.5">
                              {/* Primary Role Selector */}
                              <div className="flex items-center gap-1.5">
                                <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">Role:</span>
                                <select
                                  value={u.role}
                                  onChange={(e) => handleUpdateRole(u.uid, e.target.value as UserRole)}
                                  disabled={updatingUid === u.uid}
                                  className="bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-300 dark:border-zinc-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:border-rose-500 transition-colors cursor-pointer"
                                >
                                  <option value="customer">Customer (Pelanggan)</option>
                                  <option value="driver">Driver (Mitra Ojek)</option>
                                  <option value="merchant">Merchant (Mitra UMKM)</option>
                                  <option value="industry">Industry (B2B)</option>
                                  <option value="government">Government (Pemda)</option>
                                  <option value="admin">Super Admin</option>
                                </select>
                              </div>

                              {/* Sector / Dinas Selector (if role supports it) */}
                              {availableSectors.length > 0 && (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                                    {u.role === "government" ? "Dinas:" : u.role === "industry" ? "Sektor:" : "Toko:"}
                                  </span>
                                  <select
                                    value={u.additionalRole || ""}
                                    onChange={(e) => handleUpdateRole(u.uid, u.role, e.target.value)}
                                    disabled={updatingUid === u.uid}
                                    className="bg-slate-100 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:border-teal-500 transition-colors cursor-pointer max-w-[220px] truncate"
                                  >
                                    <option value="">-- Tanpa Spesialisasi --</option>
                                    {availableSectors.map((sec) => (
                                      <option key={sec.id} value={sec.id}>
                                        {sec.avatar} {sec.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleImpersonate(u.role, u.role === "driver" ? "/driver" : u.role === "merchant" ? "/merchant" : u.role === "industry" ? "/industry" : u.role === "government" ? "/gov" : "/")}
                                className="text-[11px] font-black px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 transition-all cursor-pointer flex items-center gap-1"
                                title="Uji langsung perspektif role user ini"
                              >
                                <Eye className="h-3.5 w-3.5" /> Uji
                              </button>

                              <button
                                onClick={() => handleToggleVerify(u.uid, u.isVerified)}
                                disabled={updatingUid === u.uid}
                                className={`text-[11px] font-black px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                                  u.isVerified 
                                    ? "bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-300 dark:border-zinc-700 hover:text-rose-600 hover:border-rose-500/30"
                                    : "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm hover:opacity-90"
                                }`}
                              >
                                {u.isVerified ? "Batal Verif" : "Verifikasi"}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT 2: KYC APPROVAL PANEL */}
            {activeAdminTab === "kyc" && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider pl-1">
                  Permohonan Verifikasi Legalitas Mitra Driver ({kycRequests.length})
                </h3>

                {loadingKYC ? (
                  <div className="p-10 text-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl">
                    <Loader2 className="h-6 w-6 text-amber-500 animate-spin mx-auto mb-2" />
                    <p className="text-xs text-slate-500">Memuat pengajuan KYC...</p>
                  </div>
                ) : kycRequests.length === 0 ? (
                  <div className="sg-card p-8 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 text-center space-y-2 shadow-sm">
                    <FileCheck className="h-10 w-10 text-slate-400 dark:text-zinc-500 mx-auto" />
                    <p className="text-sm font-bold text-slate-800 dark:text-zinc-200">Belum Ada Pengajuan KYC Masuk</p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
                      Saat mitra driver mengisi berkas KTP & SIM di dashboard driver, permohonan akan tampil di sini untuk divalidasi.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {kycRequests.map((req) => (
                      <div
                        key={req.id}
                        className="sg-card p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 space-y-3 shadow-sm"
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900 dark:text-white">{req.driverName}</span>
                              <Badge variant={req.status === "approved" ? "emerald" : req.status === "rejected" ? "rose" : "amber"} size="sm">
                                {req.status}
                              </Badge>
                            </div>
                            <p className="text-[10px] text-slate-500 dark:text-zinc-400">{req.driverEmail} • {req.phone}</p>
                          </div>
                          <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                            {req.vehiclePlate}
                          </span>
                        </div>

                        <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl space-y-1 text-xs text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700/60">
                          <div className="flex justify-between">
                            <span className="text-[10px] text-slate-400">NIK KTP:</span>
                            <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">{req.nik}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[10px] text-slate-400">No. SIM C:</span>
                            <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">{req.simNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[10px] text-slate-400">Tipe Motor:</span>
                            <span className="font-bold text-slate-800 dark:text-zinc-200">{req.vehicleModel}</span>
                          </div>
                        </div>

                        {req.status === "pending" && (
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => req.id && handleReviewKYC(req.id, req.userId, "rejected")}
                              disabled={processingKYCId === req.id}
                              className="h-9 text-xs border-rose-500/40 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 font-bold rounded-xl cursor-pointer"
                            >
                              Tolak
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => req.id && handleReviewKYC(req.id, req.userId, "approved")}
                              disabled={processingKYCId === req.id}
                              className="h-9 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl cursor-pointer shadow-md"
                            >
                              {processingKYCId === req.id ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CheckCircle2 className="h-3.5 w-3.5 mr-1" />}
                              Setujui KYC
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* ======================================================================= */}
          {/* RIGHT 1 COLUMN (25% WIDTH): LIVE PERSONA & IMPERSONATE STUDIO (STICKY) */}
          {/* ======================================================================= */}
          <div className="lg:col-span-1 space-y-4 lg:sticky lg:top-24">
            
            {/* STUDIO HEADER & ACTIVE STATUS */}
            <div className="sg-card p-4 rounded-3xl border border-amber-500/40 bg-gradient-to-b from-amber-500/10 via-zinc-900/80 to-zinc-900/95 space-y-3.5 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400">
                    <Laptop className="h-4 w-4" />
                  </div>
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Studio Impersonasi
                  </h3>
                </div>
                <Badge variant="amber" size="sm">LIVE REVIEW</Badge>
              </div>

              {/* ACTIVE PERSONA STATUS DISPLAY */}
              <div className="p-3 bg-zinc-950/60 rounded-2xl border border-amber-500/30 space-y-2">
                <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Status Saat Ini:</span>
                  {isImpersonating && (
                    <button
                      onClick={handleExitImpersonate}
                      className="text-[10px] text-rose-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <RotateCcw className="h-3 w-3" /> Reset
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-lg shrink-0">
                    {impersonatedPersona ? impersonatedPersona.avatar : "🛡️"}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-black text-white truncate">
                      {impersonatedPersona ? impersonatedPersona.name : "Super Admin Mode"}
                    </p>
                    <p className="text-[10px] text-zinc-400 truncate">
                      {impersonatedPersona ? impersonatedPersona.subtitle : "Akses Penuh Seluruh Sistem"}
                    </p>
                  </div>
                </div>
              </div>

              {/* PERSONA CATEGORY FILTER */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                {(
                  [
                    { id: "all", label: "Semua" },
                    { id: "gov", label: "🏛️ Pemda" },
                    { id: "ind", label: "🏢 B2B" },
                    { id: "mitra", label: "🛵 Mitra" },
                    { id: "citizen", label: "🛒 Warga" }
                  ] as const
                ).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setPersonaFilter(cat.id)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all shrink-0 cursor-pointer ${
                      personaFilter === cat.id
                        ? "bg-amber-500 text-zinc-950 font-black"
                        : "bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* PERSONAS SCROLLABLE LIST */}
              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin">
                {filteredPersonas.map((persona) => (
                  <div
                    key={persona.id}
                    className="p-3 rounded-2xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/60 hover:border-amber-500/50 space-y-2 transition-all group"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{persona.avatar}</span>
                        <div>
                          <p className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors leading-tight">
                            {persona.name}
                          </p>
                          <p className="text-[10px] text-zinc-400">{persona.subtitle}</p>
                        </div>
                      </div>

                      <Badge variant={persona.badgeVariant} size="sm">
                        {persona.badge}
                      </Badge>
                    </div>

                    <p className="text-[10px] text-zinc-300 leading-snug line-clamp-2">
                      {persona.description}
                    </p>

                    <Button
                      size="sm"
                      onClick={() => handleImpersonatePersona(persona)}
                      className="w-full h-7 text-[10px] font-black bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-lg shadow cursor-pointer flex items-center justify-center gap-1"
                    >
                      <span>Masuk Layanan</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Account Drawer */}
      <ProfileDrawer 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
      />
    </div>
  );
}
