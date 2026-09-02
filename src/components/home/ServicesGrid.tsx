"use client";

import React from "react";
import { motion } from "motion/react";
import { SUPER_APP_SERVICES, AppService } from "@/constants/services";

interface ServicesGridProps {
  onSelectService: (service: AppService) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14, scale: 0.94 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 24
    }
  },
};

export function ServicesGrid({ onSelectService }: ServicesGridProps) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-black text-slate-900 dark:text-white sg-editorial-title">
          Layanan Ekosistem Warga
        </h3>
        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
          Surakarta Super-Hub
        </span>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-4 gap-2 pt-1"
      >
        {SUPER_APP_SERVICES.map((service) => {
          const Icon = service.icon;

          return (
            <motion.button
              key={service.id}
              variants={itemVariants}
              onClick={() => onSelectService(service)}
              whileTap={{ scale: 0.88 }}
              whileHover={{ y: -3 }}
              className="p-2 flex flex-col items-center justify-start text-center cursor-pointer relative overflow-visible transition-all group rounded-xl bg-transparent hover:bg-slate-100/70 dark:hover:bg-white/[0.04]"
            >
              {service.tag && (
                <motion.span 
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1.5 right-0.5 text-[8px] font-black bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-1.5 py-0.2 rounded-full uppercase tracking-tighter shadow-sm z-10"
                >
                  {service.tag}
                </motion.span>
              )}

              <div
                className={`w-13 h-13 rounded-2xl flex items-center justify-center mb-1.5 transition-all duration-300 group-hover:scale-110 shadow-xs ${
                  service.id === "ride" 
                    ? "bg-gradient-to-tr from-emerald-500/20 via-teal-500/15 to-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:shadow-emerald-500/30 group-hover:bg-emerald-500/30"
                    : service.id === "car"
                    ? "bg-gradient-to-tr from-teal-500/20 via-cyan-500/15 to-teal-500/10 text-teal-600 dark:text-teal-400 group-hover:shadow-teal-500/30 group-hover:bg-teal-500/30"
                    : service.id === "send"
                    ? "bg-gradient-to-tr from-blue-500/20 via-indigo-500/15 to-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:shadow-blue-500/30 group-hover:bg-blue-500/30"
                    : service.id === "food"
                    ? "bg-gradient-to-tr from-orange-500/20 via-amber-500/15 to-orange-500/10 text-orange-600 dark:text-orange-400 group-hover:shadow-orange-500/30 group-hover:bg-orange-500/30"
                    : service.id === "titip"
                    ? "bg-gradient-to-tr from-amber-500/20 via-yellow-500/15 to-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:shadow-amber-500/30 group-hover:bg-amber-500/30"
                    : service.id === "pasar"
                    ? "bg-gradient-to-tr from-rose-500/20 via-pink-500/15 to-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:shadow-rose-500/30 group-hover:bg-rose-500/30"
                    : service.id === "mart"
                    ? "bg-gradient-to-tr from-purple-500/20 via-fuchsia-500/15 to-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:shadow-purple-500/30 group-hover:bg-purple-500/30"
                    : "bg-gradient-to-tr from-slate-500/20 via-zinc-500/15 to-slate-500/10 text-slate-600 dark:text-slate-400 group-hover:shadow-slate-500/30 group-hover:bg-slate-500/30"
                }`}
              >
                <Icon size={26} variant="duotone" className="h-6.5 w-6.5 transition-transform duration-200 group-hover:scale-105" />
              </div>

              <span className="text-[11px] font-extrabold text-slate-800 dark:text-zinc-200 leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors tracking-tight">
                {service.name}
              </span>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
