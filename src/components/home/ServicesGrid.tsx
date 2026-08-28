"use client";

import React from "react";
import { SUPER_APP_SERVICES, AppService } from "@/constants/services";

interface ServicesGridProps {
  onSelectService: (service: AppService) => void;
}

export function ServicesGrid({ onSelectService }: ServicesGridProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white sg-editorial-title">
          Layanan Ekosistem Warga
        </h3>
      </div>

      <div className="grid grid-cols-4 gap-2.5">
        {SUPER_APP_SERVICES.map((service) => {
          const Icon = service.icon;

          return (
            <button
              key={service.id}
              onClick={() => onSelectService(service)}
              className="flex flex-col items-center justify-start p-2.5 rounded-2xl bg-white/90 dark:bg-zinc-900/90 hover:bg-slate-100 dark:hover:bg-zinc-800/80 border border-slate-200 dark:border-zinc-800/90 shadow-sm transition-all group text-center cursor-pointer relative"
            >
              {service.tag && (
                <span className="absolute -top-1.5 right-1 text-[8px] font-extrabold bg-emerald-500 text-white px-1.5 py-0.2 rounded-full uppercase tracking-tighter shadow-sm">
                  {service.tag}
                </span>
              )}

              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-1.5 transition-transform group-hover:scale-110 shadow-sm ${
                  service.id === "ride" 
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                    : service.id === "car"
                    ? "bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30"
                    : service.id === "send"
                    ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30"
                    : service.id === "food"
                    ? "bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30"
                    : service.id === "titip"
                    ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                    : service.id === "pasar"
                    ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                    : service.id === "mart"
                    ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30"
                    : "bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/30"
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>

              <span className="text-[11px] font-bold text-slate-800 dark:text-zinc-200 leading-tight">
                {service.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
