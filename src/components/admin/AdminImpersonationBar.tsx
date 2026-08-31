"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { UserRole } from "@/types/user.types";
import { SandboxPersona, SANDBOX_PERSONAS } from "@/types/sandbox.types";
import { Button } from "@/components/ui/button";
import { Eye, RotateCcw, Sparkles } from "lucide-react";

export function AdminImpersonationBar() {
  const router = useRouter();
  const { 
    isImpersonating, 
    impersonatedRole, 
    setImpersonatedRole, 
    impersonatedPersona, 
    setImpersonatedPersona,
    userData 
  } = useAuthContext();

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

  const handleSwitchPersona = (persona: SandboxPersona) => {
    setImpersonatedPersona(persona);
    router.push(persona.targetPath);
  };

  const handleExitImpersonation = () => {
    setImpersonatedPersona(null);
    setImpersonatedRole(null);
    router.push("/admin");
  };

  if (!isImpersonating) {
    return null;
  }

  return (
    <div className="fixed top-0 inset-x-0 z-50 bg-gradient-to-r from-amber-950 via-zinc-900 to-amber-950 border-b border-amber-500/40 px-3 sm:px-4 py-2 text-xs text-amber-200 shadow-2xl backdrop-blur-xl flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <div className="p-1 rounded-md bg-amber-500/20 text-amber-400">
          <Eye className="h-3.5 w-3.5 animate-pulse" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-amber-300">Sandbox:</span>
          <span className="font-black text-white px-2 py-0.5 bg-amber-500/20 border border-amber-500/30 rounded-lg text-[11px]">
            {impersonatedPersona 
              ? `${impersonatedPersona.avatar} ${impersonatedPersona.name}` 
              : roleLabels[impersonatedRole || "customer"]}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 overflow-x-auto">
        <span className="text-[10px] text-zinc-400 hidden md:inline-block">Ganti Sandbox:</span>
        {SANDBOX_PERSONAS.map((persona) => {
          const isActive = impersonatedPersona?.id === persona.id;
          return (
            <button
              key={persona.id}
              onClick={() => handleSwitchPersona(persona)}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                isActive
                  ? "bg-amber-500 text-zinc-950 font-black shadow-md shadow-amber-500/30"
                  : "bg-zinc-800/90 text-zinc-300 hover:bg-zinc-700 hover:text-white border border-zinc-700/60"
              }`}
              title={persona.description}
            >
              <span>{persona.avatar}</span>
              <span>{persona.badge}</span>
            </button>
          );
        })}

        <Button
          size="sm"
          onClick={handleExitImpersonation}
          className="h-7 px-2.5 text-[10px] font-extrabold bg-rose-600 hover:bg-rose-500 text-white rounded-lg ml-2 flex items-center gap-1 shadow-md shadow-rose-600/20 cursor-pointer shrink-0"
        >
          <RotateCcw className="h-3 w-3" />
          Keluar ke Admin
        </Button>
      </div>
    </div>
  );
}
