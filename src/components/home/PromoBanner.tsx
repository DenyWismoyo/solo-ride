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
      gradient: "from-emerald-500/10 via-white to-white dark:from-emerald-950/40 dark:via-[#0c1220] dark:to-[#0c1220]",
      border: "border-emerald-500/30",
      accent: "text-emerald-600 dark:text-emerald-400",
      icon: ShieldCheck
    },
    {
      id: 2,
      tag: "Fitur Unggulan",
      title: "Titip Tetangga Searah Rute",
      subtitle: "Tumpangkan pesanan Anda pada driver yang sedang mengarah ke titik yang sama.",
      gradient: "from-amber-500/10 via-white to-white dark:from-amber-950/40 dark:via-[#0c1220] dark:to-[#0c1220]",
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
              className={`min-w-[280px] max-w-[320px] p-4.5 rounded-[1.8rem] bg-gradient-to-tr ${p.gradient} shrink-0 snap-start space-y-2.5 flex flex-col justify-between shadow-[0_8px_25px_-4px_rgba(15,23,42,0.05)] dark:shadow-[0_12px_32px_-6px_rgba(0,0,0,0.6)] cursor-pointer hover:scale-[1.01] transition-transform`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100/90 dark:bg-white/[0.08] px-2.5 py-0.5 rounded-full text-slate-800 dark:text-zinc-200 shadow-xs">
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

              <div className="pt-2 flex items-center justify-between border-t border-slate-100/80 dark:border-white/[0.06] text-xs font-black text-emerald-600 dark:text-emerald-400">
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
