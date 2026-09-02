"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { useKYCRequests } from "@/hooks/useKYCRequests";
import { kycService } from "@/services/kyc.service";
import { seedEcosystemSandbox } from "@/lib/seedSandbox";
import { SandboxPersona } from "@/types/sandbox.types";
import { AppHeader } from "@/components/layout/AppHeader";
import { AdminImpersonationBar } from "@/components/admin/AdminImpersonationBar";
import { ProfileDrawer } from "@/components/layout/ProfileDrawer";
import { AdminOverviewBento } from "@/components/admin/AdminOverviewBento";
import { AdminUsersTable } from "@/components/admin/AdminUsersTable";
import { AdminKycTab } from "@/components/admin/AdminKycTab";
import { AdminPersonaGrid } from "@/components/admin/AdminPersonaGrid";
import { MidnightReconciliationSimulator } from "@/components/admin/MidnightReconciliationSimulator";
import { UserDocument, UserRole } from "@/types/user.types";
import { collection, onSnapshot, doc, updateDoc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";

export default function SuperAdminPage() {
  const router = useRouter();
  const { user, setImpersonatedRole, setImpersonatedPersona } = useAuthContext();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState<"users" | "kyc" | "cron">("users");

  const [usersList, setUsersList] = useState<UserDocument[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [updatingUid, setUpdatingUid] = useState<string | null>(null);

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
      alert(`Gagal mengubah role: ${err.message || err}`);
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

  const pendingKYCCount = kycRequests.filter(r => r.status === "pending").length;

  return (
    <div className="relative min-h-[100dvh] bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 flex flex-col justify-between pb-16 transition-colors duration-200">
      <AdminImpersonationBar />
      <AppHeader onOpenProfile={() => setIsProfileOpen(true)} />

      <main className="pt-20 px-4 sm:px-6 lg:px-8 max-w-[1440px] w-full mx-auto space-y-6 flex-1 relative z-10">
        {/* 1. Overview Bento & Sandbox Seeder */}
        <AdminOverviewBento
          usersList={usersList}
          pendingKYCCount={pendingKYCCount}
          onSeedSandbox={handleSeedSandbox}
          isSeeding={isSeeding}
          seedSuccessMessage={seedSuccessMessage}
        />

        {/* 2. Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/[0.06] pb-2">
          <button
            onClick={() => setActiveAdminTab("users")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeAdminTab === "users"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Direktori Pengguna & Role Engine ({usersList.length})
          </button>
          <button
            onClick={() => setActiveAdminTab("kyc")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeAdminTab === "kyc"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span>Verifikasi Legalitas KYC Mitra</span>
            {pendingKYCCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-md bg-rose-500 text-white text-[10px] font-black">
                {pendingKYCCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveAdminTab("cron")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeAdminTab === "cron"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span>⚡ Cron Tengah Malam (00:00 WIB)</span>
          </button>
        </div>

        {/* 3. Dual Column Workspace (3:1) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Main 3 Columns */}
          <div className="lg:col-span-3 space-y-6">
            {activeAdminTab === "users" ? (
              <AdminUsersTable
                usersList={usersList}
                loadingUsers={loadingUsers}
                onUpdateRole={handleUpdateRole}
                onToggleVerify={handleToggleVerify}
                onImpersonate={(role, path) => {
                  setImpersonatedRole(role);
                  router.push(path);
                }}
                updatingUid={updatingUid}
              />
            ) : activeAdminTab === "kyc" ? (
              <AdminKycTab
                kycRequests={kycRequests}
                loadingKYC={loadingKYC}
                onReviewKYC={handleReviewKYC}
                processingKYCId={processingKYCId}
              />
            ) : (
              <MidnightReconciliationSimulator />
            )}
          </div>

          {/* Right Column: Persona Sandbox Suite */}
          <div className="lg:col-span-1">
            <AdminPersonaGrid
              onImpersonatePersona={(persona) => {
                setImpersonatedPersona(persona);
                router.push(persona.targetPath);
              }}
            />
          </div>
        </div>
      </main>

      <ProfileDrawer isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
}
