"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { UserRole } from "@/types/user.types";
import { SandboxPersona, SANDBOX_PERSONAS, PersonaCategory } from "@/types/sandbox.types";
import { Button } from "@/components/ui/button";
import { Eye, RotateCcw, ChevronDown, CheckCircle2 } from "lucide-react";

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

  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    setIsOpen(false);
    router.push(persona.targetPath);
  };

  const handleExitImpersonation = () => {
    setImpersonatedPersona(null);
    setImpersonatedRole(null);
    setIsOpen(false);
    router.push("/admin");
  };

  if (!isImpersonating) {
    return null;
  }

  const categories: PersonaCategory[] = ["Warga & Driver", "UMKM & Kargo", "Industri (B2B)", "Pemerintahan (Dinas)"];
  const groupedPersonas = categories.map(cat => ({
    category: cat,
    personas: SANDBOX_PERSONAS.filter(p => p.category === cat)
  }));

  return (
    <div className="fixed top-0 inset-x-0 z-50 bg-gradient-to-r from-amber-950 via-zinc-900 to-amber-950 border-b border-amber-500/40 px-3 sm:px-4 py-2 text-xs text-amber-200 shadow-2xl backdrop-blur-xl flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <div className="p-1 rounded-md bg-amber-500/20 text-amber-400">
          <Eye className="h-3.5 w-3.5 animate-pulse" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-amber-300">Sandbox:</span>
          <span className="font-black text-white px-2 py-0.5 bg-amber-500/20 border border-amber-500/30 rounded-lg text-[11px] truncate max-w-[120px] sm:max-w-[200px]">
            {impersonatedPersona 
              ? `${impersonatedPersona.avatar} ${impersonatedPersona.name}` 
              : roleLabels[impersonatedRole || "customer"]}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2" ref={menuRef}>
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 px-3 py-1.5 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700/60 rounded-lg transition-colors cursor-pointer font-bold text-[10px]"
          >
            Ganti Sandbox <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Categorized Dropdown */}
          {isOpen && (
            <div className="absolute right-0 top-full mt-2 w-[85vw] max-w-[320px] sm:max-w-md bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] sm:max-h-[70vh]">
              <div className="p-3 bg-zinc-800/50 border-b border-zinc-700/50">
                <h3 className="text-xs font-black text-white">Pilih Persona Sandbox</h3>
                <p className="text-[10px] text-zinc-400">Pilih role untuk mensimulasikan skenario di ekosistem.</p>
              </div>
              
              <div className="overflow-y-auto p-2 space-y-4 flex-1">
                {groupedPersonas.map((group, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <h4 className="text-[10px] font-bold text-amber-500 uppercase tracking-widest pl-2">
                      {group.category}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {group.personas.map((persona) => {
                        const isActive = impersonatedPersona?.id === persona.id;
                        return (
                          <button
                            key={persona.id}
                            onClick={() => handleSwitchPersona(persona)}
                            className={`flex flex-col items-start p-2 rounded-xl border text-left transition-all cursor-pointer ${
                              isActive 
                                ? "bg-amber-500/10 border-amber-500/50 text-amber-100" 
                                : "bg-zinc-800/40 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-300"
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="font-bold text-[11px] flex items-center gap-1.5">
                                {persona.avatar} {persona.badge}
                              </span>
                              {isActive && <CheckCircle2 className="h-3 w-3 text-amber-400" />}
                            </div>
                            <span className="text-[9px] text-zinc-500 mt-0.5 truncate w-full">
                              {persona.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <Button
          size="sm"
          onClick={handleExitImpersonation}
          className="h-7 px-2.5 text-[10px] font-extrabold bg-rose-600 hover:bg-rose-500 text-white rounded-lg flex items-center gap-1 shadow-md shadow-rose-600/20 cursor-pointer shrink-0"
        >
          <RotateCcw className="h-3 w-3 hidden sm:block" />
          <span className="hidden sm:inline">Keluar ke Admin</span>
          <span className="sm:hidden">Keluar</span>
        </Button>
      </div>
    </div>
  );
}
