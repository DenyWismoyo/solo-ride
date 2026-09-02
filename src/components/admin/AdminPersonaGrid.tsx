"use client";

import React, { useState, useMemo } from "react";
import { Sparkles, ArrowRight, Layers, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SANDBOX_PERSONAS, SandboxPersona } from "@/types/sandbox.types";

interface AdminPersonaGridProps {
  onImpersonatePersona: (persona: SandboxPersona) => void;
}

export function AdminPersonaGrid({ onImpersonatePersona }: AdminPersonaGridProps) {
  const [personaFilter, setPersonaFilter] = useState<"all" | "gov" | "ind" | "mitra" | "citizen">("all");

  const filteredPersonas = useMemo(() => {
    if (personaFilter === "all") return SANDBOX_PERSONAS;
    if (personaFilter === "gov") return SANDBOX_PERSONAS.filter(p => p.role === "government");
    if (personaFilter === "ind") return SANDBOX_PERSONAS.filter(p => p.role === "industry");
    if (personaFilter === "mitra") return SANDBOX_PERSONAS.filter(p => p.role === "merchant" || p.role === "driver");
    if (personaFilter === "citizen") return SANDBOX_PERSONAS.filter(p => p.role === "customer");
    return SANDBOX_PERSONAS;
  }, [personaFilter]);

  return (
    <div className="sg-bento-card p-5 space-y-4">
      <div>
        <h3 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <span>Sandbox Personas (Testing)</span>
        </h3>
        <p className="text-[10px] text-slate-400">
          Uji coba instan simulasi login seluruh aktor 5-ekosistem
        </p>
      </div>

      {/* Persona Category Pills */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 text-[10px]">
        {[
          { id: "all", label: "Semua" },
          { id: "gov", label: "Dinas" },
          { id: "mitra", label: "Mitra" },
          { id: "ind", label: "Industri" },
          { id: "citizen", label: "Warga" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setPersonaFilter(tab.id as any)}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer border ${
              personaFilter === tab.id
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs"
                : "bg-slate-50 dark:bg-white/[0.02] text-slate-600 dark:text-zinc-400 border-slate-200/60 dark:border-white/[0.04]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Personas Stream List */}
      <div className="space-y-2 max-h-[600px] overflow-y-auto no-scrollbar pr-1">
        {filteredPersonas.map((p) => (
          <div
            key={p.id}
            onClick={() => onImpersonatePersona(p)}
            className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] hover:border-blue-500/40 transition-all cursor-pointer space-y-1.5 group"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white text-xs group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {p.name}
              </span>
              <Badge variant="blue" size="sm" className="text-[8.5px]">
                {p.role}
              </Badge>
            </div>
            <p className="text-[10px] text-slate-400 line-clamp-1">
              {p.description}
            </p>
            <div className="pt-1 border-t border-slate-200/40 dark:border-white/[0.02] flex items-center justify-between text-[9.5px] font-bold text-blue-600 dark:text-blue-400">
              <span>Masuk Mode Ini</span>
              <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
