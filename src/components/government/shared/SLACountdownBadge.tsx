"use client";

import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, Flame } from "lucide-react";
import { getSLAConfig, getSLAStatus, SLAStatus } from "@/constants/slaConfig";

interface SLACountdownBadgeProps {
  createdAt: any;
  serviceType: string;
  additionalRole?: string;
  status?: string;
  className?: string;
}

export function SLACountdownBadge({
  createdAt,
  serviceType,
  additionalRole,
  status = "pending_verification",
  className = ""
}: SLACountdownBadgeProps) {
  const [timeRemainingStr, setTimeRemainingStr] = useState<string>("");
  const [slaStatus, setSlaStatus] = useState<SLAStatus>("on_track");

  useEffect(() => {
    const updateCountdown = () => {
      if (!createdAt) {
        setTimeRemainingStr("SLA Standar");
        return;
      }

      const createdMs = createdAt.toDate ? createdAt.toDate().getTime() : new Date(createdAt).getTime();
      const nowMs = Date.now();
      const elapsedHours = (nowMs - createdMs) / (1000 * 60 * 60);

      // Get target SLA hours based on role and stage
      const config = getSLAConfig(additionalRole);
      let targetHours = config.pendingVerificationHours;
      if (status === "pending") targetHours = config.pendingHours || 4;
      if (status === "in_progress") targetHours = config.inProgressHours || 8;

      if (targetHours <= 0) {
        setTimeRemainingStr("Respon Instan");
        setSlaStatus("on_track");
        return;
      }

      const currentStatus = getSLAStatus(elapsedHours, targetHours);
      setSlaStatus(currentStatus);

      const totalTargetMs = targetHours * 60 * 60 * 1000;
      const remainingMs = totalTargetMs - (nowMs - createdMs);

      if (remainingMs <= 0) {
        const overdueHours = Math.floor(Math.abs(remainingMs) / (1000 * 60 * 60));
        const overdueMins = Math.floor((Math.abs(remainingMs) % (1000 * 60 * 60)) / (1000 * 60));
        setTimeRemainingStr(`Terlambat +${overdueHours}j ${overdueMins}m`);
      } else {
        const hours = Math.floor(remainingMs / (1000 * 60 * 60));
        const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
        setTimeRemainingStr(`SLA Sisa ${hours}j ${minutes}m`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 30000); // update every 30 seconds
    return () => clearInterval(interval);
  }, [createdAt, serviceType, additionalRole, status]);

  if (slaStatus === "overdue") {
    return (
      <Badge
        variant="rose"
        size="sm"
        className={`bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-bold animate-pulse flex items-center gap-1 ${className}`}
      >
        <Flame className="w-3 h-3 text-rose-500 animate-bounce" />
        <span>{timeRemainingStr}</span>
      </Badge>
    );
  }

  if (slaStatus === "warning") {
    return (
      <Badge
        variant="amber"
        size="sm"
        className={`bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-bold flex items-center gap-1 ${className}`}
      >
        <AlertTriangle className="w-3 h-3 text-amber-500" />
        <span>{timeRemainingStr}</span>
      </Badge>
    );
  }

  return (
    <Badge
      variant="teal"
      size="sm"
      className={`bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 font-medium flex items-center gap-1 ${className}`}
    >
      <Clock className="w-3 h-3 text-teal-500" />
      <span>{timeRemainingStr}</span>
    </Badge>
  );
}
