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
        className="grid grid-cols-4 gap-2.5"
      >
        {SUPER_APP_SERVICES.map((service) => {
          const Icon = service.icon;

          return (
            <motion.button
              key={service.id}
              variants={itemVariants}
              onClick={() => onSelectService(service)}
              whileTap={{ scale: 0.89 }}
              whileHover={{ y: -3 }}
              className="flex flex-col items-center justify-start p-3 rounded-[1.6rem] bg-white dark:bg-[#0c1220] hover:bg-slate-50 dark:hover:bg-[#11192e] shadow-[0_6px_20px_-4px_rgba(15,23,42,0.04)] dark:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.65)] transition-all group text-center cursor-pointer relative overflow-visible"
            >
              {service.tag && (
                <motion.span 
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1.5 right-1 text-[8px] font-black bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-2 py-0.2 rounded-full uppercase tracking-tighter shadow-sm z-10"
                >
                  {service.tag}
                </motion.span>
              )}

              <div
                className={`w-12 h-12 rounded-[1.2rem] flex items-center justify-center mb-1.5 transition-transform duration-200 group-hover:scale-110 shadow-xs ${
                  service.id === "ride" 
                    ? "bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 text-emerald-600 dark:text-emerald-400"
                    : service.id === "car"
                    ? "bg-gradient-to-tr from-teal-500/20 to-cyan-500/10 text-teal-600 dark:text-teal-400"
                    : service.id === "send"
                    ? "bg-gradient-to-tr from-blue-500/20 to-indigo-500/10 text-blue-600 dark:text-blue-400"
                    : service.id === "food"
                    ? "bg-gradient-to-tr from-orange-500/20 to-amber-500/10 text-orange-600 dark:text-orange-400"
                    : service.id === "titip"
                    ? "bg-gradient-to-tr from-amber-500/20 to-yellow-500/10 text-amber-600 dark:text-amber-400"
                    : service.id === "pasar"
                    ? "bg-gradient-to-tr from-rose-500/20 to-pink-500/10 text-rose-600 dark:text-rose-400"
                    : service.id === "mart"
                    ? "bg-gradient-to-tr from-purple-500/20 to-fuchsia-500/10 text-purple-600 dark:text-purple-400"
                    : "bg-gradient-to-tr from-slate-500/20 to-zinc-500/10 text-slate-600 dark:text-slate-400"
                }`}
              >
                <Icon size={24} variant="duotone" className="h-6 w-6 transition-transform duration-200 group-hover:scale-105" />
              </div>

              <span className="text-[11px] font-extrabold text-slate-800 dark:text-zinc-200 leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {service.name}
              </span>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
