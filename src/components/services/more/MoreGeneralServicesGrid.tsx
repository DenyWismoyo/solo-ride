"use client";

import React from "react";
import { motion } from "motion/react";
import { ArrowRight, Sparkles, Store, Bike, Building2 } from "lucide-react";
import { AppService } from "@/constants/services";
import { Badge } from "@/components/ui/badge";

interface MoreGeneralServicesGridProps {
  services: AppService[];
  onSelectService: (service: AppService) => void;
  title?: string;
  subtitle?: string;
}

export function MoreGeneralServicesGrid({
  services,
  onSelectService,
  title = "Layanan Ekosistem Ride-Solo",
  subtitle = "Solusi mobilitas, logistik, belanja pasar, dan industri lokal"
}: MoreGeneralServicesGridProps) {
  if (services.length === 0) return null;

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 dark:text-white">
              {title}
            </h2>
            <p className="text-[11px] text-slate-400">{subtitle}</p>
          </div>
        </div>
        <Badge variant="emerald" size="sm" className="font-bold">
          {services.length} Layanan
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {services.map((service) => (
          <motion.div
            key={service.id}
            whileTap={{ scale: 0.98 }}
            whileHover={{ y: -2 }}
            onClick={() => onSelectService(service)}
            className="sg-card p-5 flex flex-col justify-between space-y-3 group hover:border-emerald-500/40 transition-all cursor-pointer"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500/20 via-teal-500/15 to-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                  {typeof service.icon === "function" || (typeof service.icon === "object" && service.icon !== null && !React.isValidElement(service.icon)) ? (
                    <service.icon size={22} variant="duotone" className="h-5.5 w-5.5" />
                  ) : React.isValidElement(service.icon) ? (
                    service.icon
                  ) : (
                    <span className="text-2xl">{service.icon}</span>
                  )}
                </div>
                {service.feeLabel && (
                  <Badge 
                    variant={service.feeLabel.toLowerCase().includes("gratis") || service.feeLabel.toLowerCase().includes("subsidi") ? "emerald" : "amber"} 
                    size="sm" 
                    className="text-[9px] font-bold"
                  >
                    {service.feeLabel}
                  </Badge>
                )}
              </div>

              <div>
                <h3 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {service.name}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-2 mt-0.5">
                  {service.description}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-white/[0.04] flex items-center justify-between text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              <span>Buka Layanan</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
