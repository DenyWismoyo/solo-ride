"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { UserRole } from "@/types/user.types";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ArrowLeft, Eye, RotateCcw } from "lucide-react";

export function AdminImpersonationBar() {
  const router = useRouter();
  const { isImpersonating, impersonatedRole, setImpersonatedRole, userData } = useAuthContext();

  // Show only if user is impersonating or user is admin
  if (!isImpersonating && userData?.role !== "admin") {
    return null;
  }

  const roleLabels: Record<UserRole, string> = {
    customer: "Pelanggan (Warga)",
    driver: "Mitra Driver",
    merchant: "Mitra UMKM / Warung",
    industry: "B2B / Kargo Industri",
    government: "Pemerintah / Koperasi",
    admin: "Super Admin",
  };

  const handleSwitchRole = (role: UserRole) => {
    setImpersonatedRole(role);
    if (role === "customer") router.push("/");
    else if (role === "driver") router.push("/driver");
    else if (role === "merchant") router.push("/merchant");
    else if (role === "industry") router.push("/industry");
    else if (role === "government") router.push("/gov");
    else if (role === "admin") router.push("/admin");
  };

  const handleExitImpersonation = () => {
    setImpersonatedRole(null);
    router.push("/admin");
  };

  if (!isImpersonating) {
    // If not impersonating but user is admin, show a subtle quick link to admin
    return null;
  }

  return (
    <div className="fixed top-0 inset-x-0 z-50 bg-gradient-to-r from-amber-950 via-zinc-900 to-amber-950 border-b border-amber-500/40 px-4 py-2 text-xs text-amber-200 shadow-2xl backdrop-blur-xl flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <div className="p-1 rounded-md bg-amber-500/20 text-amber-400">
          <Eye className="h-3.5 w-3.5 animate-pulse" />
        </div>
        <span className="font-bold">
          Impersonating: <span className="text-white underline">{roleLabels[impersonatedRole || "customer"]}</span>
        </span>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto">
        <span className="text-[10px] text-zinc-400 hidden sm:inline-block">Ganti Perspektif:</span>
        {(["customer", "driver", "merchant", "industry", "government"] as UserRole[]).map((r) => (
          <button
            key={r}
            onClick={() => handleSwitchRole(r)}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
              impersonatedRole === r
                ? "bg-amber-500 text-zinc-950 shadow-sm"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            {r.toUpperCase()}
          </button>
        ))}

        <Button
          size="sm"
          onClick={handleExitImpersonation}
          className="h-7 px-2.5 text-[10px] font-extrabold bg-rose-600 hover:bg-rose-500 text-white rounded-lg ml-2 flex items-center gap-1 shadow-md shadow-rose-600/20"
        >
          <RotateCcw className="h-3 w-3" />
          Keluar ke Admin
        </Button>
      </div>
    </div>
  );
}
