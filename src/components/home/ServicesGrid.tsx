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
              whileTap={{ scale: 0.91 }}
              whileHover={{ y: -3 }}
              className="flex flex-col items-center justify-start p-2.5 rounded-[1.4rem] bg-white/95 dark:bg-[#0c1220]/90 hover:bg-slate-50 dark:hover:bg-[#11192e] border border-slate-200/80 dark:border-white/[0.07] shadow-[0_4px_16px_-2px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.5)] transition-all group text-center cursor-pointer relative overflow-visible"
            >
              {service.tag && (
                <motion.span 
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1.5 right-1 text-[8px] font-black bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-1.5 py-0.2 rounded-full uppercase tracking-tighter shadow-sm z-10"
                >
                  {service.tag}
                </motion.span>
              )}

              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-1.5 transition-transform duration-200 group-hover:scale-110 shadow-sm ${
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
                <Icon className="h-5 w-5 stroke-[2.2]" />
              </div>

              <span className="text-[11px] font-bold text-slate-800 dark:text-zinc-200 leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {service.name}
              </span>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
