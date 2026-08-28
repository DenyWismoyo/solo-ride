"use client";

import React from "react";
import { Sparkles, ArrowRight, ShieldCheck, Zap } from "lucide-react";

export function PromoBanner() {
  const promos = [
    {
      id: 1,
      tag: "Gerakan Lokal",
      title: "100% Bebas Potongan Komisi",
      subtitle: "Setiap rupiah ongkir diterima utuh oleh mitra driver & UMKM warga Solo.",
      gradient: "from-emerald-500/10 via-white to-white dark:from-emerald-900/60 dark:via-zinc-900 dark:to-zinc-900",
      border: "border-emerald-500/30",
      accent: "text-emerald-600 dark:text-emerald-400",
      icon: ShieldCheck
    },
    {
      id: 2,
      tag: "Fitur Unggulan",
      title: "Titip Tetangga Searah Rute",
      subtitle: "Tumpangkan pesanan Anda pada driver yang sedang mengarah ke titik yang sama.",
      gradient: "from-amber-500/10 via-white to-white dark:from-amber-900/60 dark:via-zinc-900 dark:to-zinc-900",
      border: "border-amber-500/30",
      accent: "text-amber-600 dark:text-amber-400",
      icon: Zap
    }
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white sg-editorial-title">
          Promo & Berita Komunitas
        </h3>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
        {promos.map((p) => {
          const Icon = p.icon;

          return (
            <div
              key={p.id}
              className={`sg-card sg-hover-lift min-w-[280px] max-w-[320px] p-4 rounded-3xl border ${p.border} bg-gradient-to-tr ${p.gradient} shrink-0 snap-start space-y-2 flex flex-col justify-between`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded-full text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700/50">
                    {p.tag}
                  </span>
                </div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white leading-snug">
                  {p.title}
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                  {p.subtitle}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-200 dark:border-zinc-800/80 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <span>Pelajari Selengkapnya</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
