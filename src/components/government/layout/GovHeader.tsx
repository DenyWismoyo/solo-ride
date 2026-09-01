"use client";

import React from "react";
import Link from "next/link";
import { SectorDefinition } from "@/constants/ecosystemSectors";
import { useAuthContext } from "@/components/AuthProvider";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  ChevronDown, 
  Bell, 
  Sparkles, 
  ExternalLink,
  ShieldCheck,
  UserCheck
} from "lucide-react";
import { SoloAppLogoIcon } from "@/components/icons";

interface GovHeaderProps {
  activeSector: SectorDefinition;
  onOpenOPDDrawer: () => void;
  onOpenProfile: () => void;
}

export function GovHeader({
  activeSector,
  onOpenOPDDrawer,
  onOpenProfile
}: GovHeaderProps) {
  const { user, userData, activeRole, isImpersonating } = useAuthContext();

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-white/85 dark:bg-[#080d1a]/85 backdrop-blur-2xl border-b border-slate-200/80 dark:border-white/[0.08] px-4 flex items-center justify-between transition-colors">
      {/* Left: Brand Logo & Title */}
      <div className="flex items-center gap-3">
        <Link href="/gov" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-600 dark:text-teal-400 group-hover:scale-105 transition-transform shadow-xs">
            <SoloAppLogoIcon size={22} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                Ride-Solo <span className="text-teal-600 dark:text-teal-400">Gov</span>
              </span>
              <Badge variant="teal" size="sm" className="text-[9px] px-1.5 py-0 font-bold hidden sm:inline-flex">
                PEMKOT
              </Badge>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              Panel Pengelolaan 18 Dinas Terpadu
            </p>
          </div>
        </Link>
      </div>

      {/* Center / Mobile OPD Switcher Capsule */}
      <button
        type="button"
        onClick={onOpenOPDDrawer}
        className="flex items-center gap-2 py-1.5 px-3 rounded-full bg-slate-100/90 dark:bg-white/[0.06] hover:bg-teal-500/10 dark:hover:bg-teal-500/20 border border-slate-200/80 dark:border-white/10 text-slate-800 dark:text-zinc-200 text-xs font-bold transition-all cursor-pointer shadow-2xs group"
      >
        <span className="text-base">{activeSector.avatar}</span>
        <span className="max-w-[120px] sm:max-w-[180px] truncate text-[11px]">
          {activeSector.name}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-teal-500 transition-transform group-hover:translate-y-0.5" />
      </button>

      {/* Right: Actions (Theme Toggle & Profile Trigger) */}
      <div className="flex items-center gap-2">
        <ThemeToggle />

        <button
          type="button"
          onClick={onOpenProfile}
          className="flex items-center gap-2 p-1.5 pr-2.5 rounded-full bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-zinc-200 transition-colors cursor-pointer"
        >
          <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-black">
            {userData?.displayName?.charAt(0) || "A"}
          </div>
          <span className="hidden md:inline max-w-[90px] truncate text-[11px]">
            {userData?.displayName || "Admin OPD"}
          </span>
        </button>
      </div>
    </header>
  );
}
