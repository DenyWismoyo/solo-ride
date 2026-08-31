"use client";

import React from "react";
import { useAuthContext } from "@/components/AuthProvider";
import { LocationPoint } from "@/types/order.types";
import { SavedAddress } from "@/types/user.types";
import { Home, Briefcase, GraduationCap, MapPin, Plus } from "lucide-react";
import Link from "next/link";

interface SavedAddressQuickPickProps {
  onSelect: (location: LocationPoint) => void;
  className?: string;
}

const getIcon = (label: string) => {
  switch (label.toLowerCase()) {
    case "rumah": return <Home className="h-3.5 w-3.5" />;
    case "kantor": return <Briefcase className="h-3.5 w-3.5" />;
    case "kampus": return <GraduationCap className="h-3.5 w-3.5" />;
    default: return <MapPin className="h-3.5 w-3.5" />;
  }
};

export function SavedAddressQuickPick({ onSelect, className = "" }: SavedAddressQuickPickProps) {
  const { userData } = useAuthContext();
  const savedAddresses = userData?.savedAddresses || [];

  if (savedAddresses.length === 0) {
    return (
      <div className={`flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide ${className}`}>
        <Link 
          href="/profile"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/[0.05] text-slate-500 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-white/[0.1] text-[10px] font-medium whitespace-nowrap transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Tambah Alamat Favorit</span>
        </Link>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide ${className}`}>
      {savedAddresses.map((addr: SavedAddress) => (
        <button
          key={addr.id}
          type="button"
          onClick={() => {
            if (addr.lat && addr.lng) {
              onSelect({
                lat: addr.lat,
                lng: addr.lng,
                address: addr.address
              });
            } else {
              // Fallback if coordinate is missing for some reason
              onSelect({
                lat: -7.5621,
                lng: 110.8547,
                address: addr.address
              });
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:border-emerald-300 dark:hover:border-emerald-500/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-[10px] font-bold whitespace-nowrap transition-all shadow-xs"
        >
          <span className="text-emerald-500">{getIcon(addr.label)}</span>
          <span>{addr.label}</span>
        </button>
      ))}
    </div>
  );
}
