"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { useNotifications } from "@/hooks/useNotifications";
import { notificationService } from "@/services/notification.service";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  Coins, 
  ShieldAlert, 
  Menu, 
  Check, 
  Clock, 
  Sparkles, 
  X,
  Radio
} from "lucide-react";
import { UserRole } from "@/types/user.types";
import { cn } from "@/lib/utils";

interface AppHeaderProps {
  onOpenProfile: () => void;
}

export function AppHeader({ onOpenProfile }: AppHeaderProps) {
  const router = useRouter();
  const { user, userData, activeRole, isImpersonating } = useAuthContext();
  const { notifications, unreadCount } = useNotifications(user?.uid);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const roleVariants: Record<UserRole, { label: string; variant: "emerald" | "amber" | "orange" | "blue" | "teal" | "rose" }> = {
    customer: { label: "Warga", variant: "emerald" },
    driver: { label: "Driver", variant: "amber" },
    merchant: { label: "UMKM", variant: "orange" as any },
    industry: { label: "Industri", variant: "blue" },
    government: { label: "Pemda", variant: "teal" as any },
    admin: { label: "Admin", variant: "rose" },
  };

  const handleBrandClick = () => {
    if (activeRole === "driver") router.push("/driver");
    else if (activeRole === "merchant") router.push("/merchant");
    else if (activeRole === "industry") router.push("/industry");
    else if (activeRole === "government") router.push("/gov");
    else if (activeRole === "admin") router.push("/admin");
    else router.push("/");
  };

  const handleNotificationClick = async (notifId?: string, relatedId?: string) => {
    if (notifId) {
      await notificationService.markAsRead(notifId).catch(() => {});
    }
    if (relatedId) {
      router.push(`/order/${relatedId}`);
      setIsNotifOpen(false);
    }
  };

  const handleMarkAllRead = async () => {
    if (user?.uid) {
      await notificationService.markAllAsRead(user.uid).catch(() => {});
    }
  };

  const meta = roleVariants[activeRole] || roleVariants.customer;

  return (
    <>
      <header className={cn(
        "fixed top-0 inset-x-0 z-30 px-4 py-2.5 bg-white/85 dark:bg-[#030712]/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between transition-all duration-200",
        isImpersonating && "top-10 sm:top-9"
      )}>
        {/* Brand & Role Tag */}
        <div className="flex items-center gap-2.5">
          <div 
            className="flex items-center gap-2 cursor-pointer select-none group"
            onClick={handleBrandClick}
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <span className="font-black text-sm text-white tracking-tighter">RS</span>
            </div>
            <div>
              <h1 className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight leading-none">
                Ride-Solo
              </h1>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                Smart Hub Surakarta
              </span>
            </div>
          </div>

          <Badge variant={meta.variant as any} size="sm" withDot>
            {meta.label}
          </Badge>
        </div>

        {/* Right Actions: ThemeToggle / Bell / Profile */}
        <div className="flex items-center gap-2">
          {/* Notification Bell */}
          {user && (
            <div className="relative">
              <Button
                variant="secondary"
                size="icon"
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="w-9 h-9 rounded-full bg-slate-100 dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.08] text-slate-700 dark:text-zinc-300 relative cursor-pointer hover:bg-slate-200 dark:hover:bg-white/[0.1]"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-black text-white flex items-center justify-center shadow-md animate-pulse">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>
            </div>
          )}

          {/* Theme Toggle Sun/Moon */}
          <ThemeToggle />

          {user ? (
            <>
              {(activeRole === "customer" || activeRole === "driver") && (
                <div 
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.08] rounded-full text-xs font-semibold text-amber-600 dark:text-amber-400 cursor-pointer hover:border-amber-500/40 transition-colors"
                  onClick={onOpenProfile}
                >
                  <Coins className="h-3.5 w-3.5" />
                  <span>{userData?.points || 0} Poin</span>
                </div>
              )}

              {userData?.role === "admin" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2.5 text-[10px] font-bold border-rose-500/40 text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl cursor-pointer"
                  onClick={() => router.push("/admin")}
                >
                  <ShieldAlert className="h-3.5 w-3.5 mr-1" />
                  Admin
                </Button>
              )}

              <Button
                variant="secondary"
                size="sm"
                className="rounded-full bg-slate-100 dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.08] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-800 dark:text-zinc-200 h-9 px-3 gap-2 cursor-pointer"
                onClick={onOpenProfile}
              >
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold">
                  {userData?.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
                </div>
                <span className="text-xs font-medium max-w-[80px] truncate hidden xs:inline-block">
                  {userData?.displayName?.split(" ")[0] || "Akun"}
                </span>
                <Menu className="h-3.5 w-3.5 text-slate-500" />
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
                onClick={() => router.push("/login")}
              >
                Masuk
              </Button>
              <Button
                size="sm"
                className="h-8 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-sm"
                onClick={() => router.push("/register")}
              >
                Daftar
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Notification Dropdown Panel */}
      {isNotifOpen && (
        <div className="fixed inset-x-4 top-16 z-40 max-w-sm ml-auto bg-white/95 dark:bg-[#0c1220]/95 border border-slate-200/80 dark:border-white/[0.08] rounded-3xl shadow-2xl p-4 backdrop-blur-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.08] pb-2.5">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-emerald-500" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Pemberitahuan ({notifications.length})
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  Tandai Dibaca
                </button>
              )}
              <button 
                onClick={() => setIsNotifOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer p-1"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-400 dark:text-zinc-500 space-y-1">
                <Bell className="h-6 w-6 mx-auto mb-1.5 opacity-40" />
                <p className="text-xs font-medium">Belum ada pemberitahuan</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif.id, notif.relatedId)}
                  className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                    notif.isRead
                      ? "bg-slate-50 dark:bg-zinc-800/40 border-slate-200/60 dark:border-zinc-800/60 opacity-75"
                      : "bg-emerald-500/10 dark:bg-emerald-950/30 border-emerald-500/30 font-medium shadow-sm"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                      {notif.title}
                    </p>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 ml-1 mt-1" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-zinc-300 mt-1 leading-snug">
                    {notif.body}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
}
