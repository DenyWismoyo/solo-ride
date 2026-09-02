"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SectorDefinition } from "@/constants/ecosystemSectors";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, 
  Inbox, 
  Settings2,
  Megaphone, 
  History, 
  ExternalLink, 
  Building2, 
  ChevronRight, 
  ShieldCheck,
  Sparkles,
  Radio,
  FileCheck2,
  Activity
} from "lucide-react";
import { SoloAppLogoIcon } from "@/components/icons";
import { GovTab } from "./GovWorkspaceContext";

interface GovSidebarProps {
  activeSector: SectorDefinition;
  activeTab: GovTab;
  onTabChange: (tab: GovTab) => void;
  onOpenOPDDrawer: () => void;
  pendingCount?: number;
  className?: string;
}

export function GovSidebar({
  activeSector,
  activeTab,
  onTabChange,
  onOpenOPDDrawer,
  pendingCount = 0,
  className = ""
}: GovSidebarProps) {
  const pathname = usePathname();

  const navItems: {
    id: GovTab;
    label: string;
    icon: any;
    badge?: number;
    badgeVariant?: "teal" | "emerald" | "rose" | "blue";
  }[] = [
    {
      id: "workspace",
      label: "Workspace Operasional",
      icon: LayoutDashboard,
    },
    {
      id: "orders",
      label: "Antrean Permohonan",
      icon: Inbox,
      badge: pendingCount > 0 ? pendingCount : undefined,
      badgeVariant: "rose"
    },
    {
      id: "catalog",
      label: "Katalog & Layanan",
      icon: Settings2,
    },
    {
      id: "broadcast",
      label: "Pusat Siaran Resmi",
      icon: Megaphone,
    },
    {
      id: "audit",
      label: "Buku Ekspedisi & Audit",
      icon: History,
    },
    {
      id: "analytics",
      label: "Analitik SLA Kota",
      icon: Activity,
    }
  ];

  return (
    <aside className={`hidden lg:flex flex-col w-64 h-[calc(100vh-4rem)] sticky top-16 bg-white/80 dark:bg-[#0c1220]/80 backdrop-blur-2xl border-r border-slate-200/80 dark:border-white/[0.06] p-4 justify-between select-none ${className}`}>
      <div className="space-y-4">
        {/* Active OPD Card & Fast Switcher */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-teal-500/10 via-teal-500/5 to-transparent border border-teal-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Instansi Aktif:
            </span>
            <Badge variant="teal" size="sm" className="text-[9px] px-1.5 py-0">
              OPD SOLO
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white dark:bg-[#131d33] border border-teal-500/30 text-teal-600 dark:text-teal-400 flex items-center justify-center text-2xl shrink-0 shadow-sm">
              {activeSector.avatar}
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-black text-slate-900 dark:text-white truncate">
                {activeSector.name}
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400 truncate">
                {activeSector.agencyOrCompanyName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenOPDDrawer}
            className="w-full py-2 px-3 rounded-xl bg-white dark:bg-[#11192e] hover:bg-teal-500/10 dark:hover:bg-teal-500/20 border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-zinc-200 text-xs font-bold transition-all flex items-center justify-between cursor-pointer group shadow-2xs"
          >
            <span className="text-[11px] text-teal-600 dark:text-teal-400 font-bold">Ganti Dinas (18 OPD)</span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500 px-2 block mb-1">
            Menu Pengelolaan
          </span>

          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-teal-600 text-white shadow-md shadow-teal-500/25"
                    : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-400 group-hover:text-teal-500"}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                    isActive ? "bg-white text-teal-700" : "bg-rose-500 text-white animate-pulse"
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Actions / Quick Links */}
      <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-white/[0.06]">
        <Link
          href={`/services/gov/${activeSector.id}`}
          target="_blank"
          className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.05] text-slate-600 dark:text-zinc-400 text-[11px] font-semibold transition-colors"
        >
          <div className="flex items-center gap-2">
            <ExternalLink className="h-3.5 w-3.5 text-blue-500" />
            <span>Lihat Portal Publik Warga</span>
          </div>
          <ChevronRight className="h-3 w-3 text-slate-400" />
        </Link>

        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
            Sistem Siaga Satgas Terhubung
          </span>
        </div>
      </div>
    </aside>
  );
}
