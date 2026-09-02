"use client";

import React, { useState, useMemo } from "react";
import { Search, X, Users, UserCheck, ShieldCheck, Check, Loader2, ArrowRight, ChevronRight, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserDocument, UserRole } from "@/types/user.types";
import { getAllSectorsForRole } from "@/constants/ecosystemSectors";

interface AdminUsersTableProps {
  usersList: UserDocument[];
  loadingUsers: boolean;
  onUpdateRole: (targetUid: string, newRole: UserRole, newAdditionalRole?: string) => Promise<void>;
  onToggleVerify: (targetUid: string, currentStatus?: boolean) => Promise<void>;
  onImpersonate: (role: UserRole, targetPath: string) => void;
  updatingUid: string | null;
}

export function AdminUsersTable({
  usersList,
  loadingUsers,
  onUpdateRole,
  onToggleVerify,
  onImpersonate,
  updatingUid
}: AdminUsersTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");

  const filteredUsers = useMemo(() => {
    return usersList.filter(u => {
      const matchesSearch = 
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u as any).additionalRole?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRole = roleFilter === "all" || u.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [usersList, searchQuery, roleFilter]);

  return (
    <div className="sg-bento-card p-6 space-y-4">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-white/[0.04] pb-4">
        <div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white">
            Direktori Pengguna & Role Engine
          </h3>
          <p className="text-xs text-slate-400">
            Kelola izin hak akses dan alokasi peran mitra di Kota Surakarta
          </p>
        </div>

        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, email, role..."
            className="pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Role Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: "all", label: "Semua Role", count: usersList.length },
          { id: "customer", label: "Customer Warga", count: usersList.filter(u => u.role === "customer").length },
          { id: "driver", label: "Mitra Driver", count: usersList.filter(u => u.role === "driver").length },
          { id: "merchant", label: "Mitra UMKM", count: usersList.filter(u => u.role === "merchant").length },
          { id: "government", label: "Pemkot OPD", count: usersList.filter(u => u.role === "government").length },
          { id: "industry", label: "Industri B2B", count: usersList.filter(u => u.role === "industry").length },
          { id: "admin", label: "Administrator", count: usersList.filter(u => u.role === "admin").length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setRoleFilter(tab.id as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer border ${
              roleFilter === tab.id
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs"
                : "bg-slate-50 dark:bg-white/[0.02] text-slate-600 dark:text-zinc-400 border-slate-200/80 dark:border-white/[0.06] hover:border-slate-300"
            }`}
          >
            <span>{tab.label}</span>
            <span className="text-[10px] opacity-70">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Users Stream Table */}
      {loadingUsers ? (
        <div className="py-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
          <p className="text-xs text-slate-400">Memuat direktori akun...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="py-16 text-center text-xs text-slate-400">
          Tidak ditemukan pengguna yang sesuai dengan kriteria pencarian.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map((u) => {
            const isSelf = false;
            const isUpdating = updatingUid === u.uid;
            const availableSectors = (u.role === "government" || u.role === "industry") 
              ? getAllSectorsForRole(u.role) 
              : [];

            return (
              <div
                key={u.uid}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] space-y-3 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-700 to-slate-900 text-white flex items-center justify-center font-black text-sm shrink-0">
                      {u.displayName?.charAt(0) || u.email?.charAt(0) || "U"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {u.displayName || "User Tanpa Nama"}
                        </span>
                        <Badge
                          variant={
                            u.role === "admin" ? "rose" :
                            u.role === "government" ? "blue" :
                            u.role === "driver" ? "emerald" :
                            u.role === "merchant" ? "amber" : "neutral"
                          }
                          size="sm"
                          className="font-bold text-[9px]"
                        >
                          {u.role.toUpperCase()}
                        </Badge>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {u.email}
                      </span>
                    </div>
                  </div>

                  {/* Impersonate Button */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onImpersonate(
                        u.role, 
                        u.role === "driver" ? "/driver" :
                        u.role === "merchant" ? "/merchant" :
                        u.role === "government" ? "/gov" :
                        u.role === "industry" ? "/industry" : "/"
                      )}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <span>Impersonate</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Role Mutation & Verification Controls */}
                <div className="pt-2.5 border-t border-slate-200/60 dark:border-white/[0.04] flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-medium">Ubah Role:</span>
                    <select
                      value={u.role}
                      onChange={(e) => onUpdateRole(u.uid, e.target.value as UserRole)}
                      disabled={isUpdating}
                      className="sg-select text-xs font-semibold py-1 px-2.5"
                    >
                      <option value="customer">Customer Warga</option>
                      <option value="driver">Mitra Driver (Solo)</option>
                      <option value="merchant">Mitra UMKM / Pasar</option>
                      <option value="government">Pemerintah Pemkot OPD</option>
                      <option value="industry">Mitra Industri B2B</option>
                      <option value="admin">Administrator</option>
                    </select>

                    {availableSectors.length > 0 && (
                      <select
                        value={(u as any).additionalRole || ""}
                        onChange={(e) => onUpdateRole(u.uid, u.role, e.target.value)}
                        disabled={isUpdating}
                        className="sg-select text-xs font-semibold py-1 px-2.5"
                      >
                        <option value="">-- Pilih Instansi / Sektor --</option>
                        {availableSectors.map((s) => (
                          <option key={s.id} value={s.id}>{s.agencyOrCompanyName}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onToggleVerify(u.uid, (u as any).isVerified)}
                      disabled={isUpdating}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition-all cursor-pointer border ${
                        (u as any).isVerified
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                          : "bg-slate-100 dark:bg-white/[0.04] text-slate-400 border-slate-200 dark:border-white/10"
                      }`}
                    >
                      {(u as any).isVerified ? "✓ Terverifikasi Koperasi" : "Belum Verifikasi"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
