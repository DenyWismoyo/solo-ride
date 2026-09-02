"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { useNotifications } from "@/hooks/useNotifications";
import { useBroadcasts } from "@/hooks/useBroadcasts";
import { notificationService } from "@/services/notification.service";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CivicBroadcastHubModal } from "@/components/civic/broadcast/CivicBroadcastHubModal";
import { 
  Bell, 
  Coins, 
  ShieldAlert, 
  Menu, 
  Check, 
  Clock, 
  Sparkles, 
  X,
  Radio,
  Megaphone
} from "lucide-react";
import { UserRole } from "@/types/user.types";
import { cn } from "@/lib/utils";
import { SoloAppLogoIcon } from "@/components/icons";

interface AppHeaderProps {
  onOpenProfile: () => void;
}

export function AppHeader({ onOpenProfile }: AppHeaderProps) {
  const router = useRouter();
  const { user, userData, activeRole, isImpersonating } = useAuthContext();
  const { notifications, unreadCount } = useNotifications(user?.uid);
  const { broadcasts } = useBroadcasts(activeRole as any);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifTab, setNotifTab] = useState<"account" | "gov">("account");
  const [isBroadcastHubOpen, setIsBroadcastHubOpen] = useState(false);

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
        "fixed top-0 inset-x-0 z-30 px-4 py-2.5 bg-white/70 dark:bg-[#030712]/70 backdrop-blur-2xl shadow-[0_4px_30px_-4px_rgba(15,23,42,0.05),inset_0_-1px_0_rgba(255,255,255,0.5)] dark:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.6),inset_0_-1px_0_rgba(255,255,255,0.05)] border-b border-slate-200/50 dark:border-white/5 flex items-center justify-between transition-all duration-200",
        isImpersonating && "top-10 sm:top-9"
      )}>
        {/* Brand Icon Only (Super Minimalist) */}
        <div 
          className="flex items-center cursor-pointer select-none group"
          onClick={handleBrandClick}
          title="Beranda Ride-Solo"
        >
          <SoloAppLogoIcon 
            size={38} 
            className="rounded-[1.2rem] shadow-md shadow-emerald-500/20 group-hover:scale-105 group-active:scale-95 transition-all shrink-0" 
          />
        </div>

        {/* Right Actions: ThemeToggle / Bell / Profile */}
        <div className="flex items-center gap-2">
          {/* Notification Bell */}
          {user && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="sg-icon-btn w-9 h-9 relative cursor-pointer"
                title="Pemberitahuan & Warta"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-emerald-500 text-white rounded-full text-[9px] font-black flex items-center justify-center animate-pulse shadow-sm">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
            </div>
          )}

          {/* Theme Toggle Sun/Moon */}
          <ThemeToggle />

          {user ? (
            <>
              {(activeRole === "customer" || activeRole === "driver") && (
                <div 
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-slate-100/90 dark:bg-white/[0.06] rounded-full text-xs font-semibold text-amber-600 dark:text-amber-400 cursor-pointer transition-colors"
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

              <button
                type="button"
                className="sg-icon-btn h-9 px-3 gap-2 rounded-full cursor-pointer"
                onClick={onOpenProfile}
              >
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold">
                  {userData?.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
                </div>
                <span className="text-xs font-medium max-w-[80px] truncate hidden xs:inline-block">
                  {userData?.displayName?.split(" ")[0] || "Akun"}
                </span>
                <Menu className="h-3.5 w-3.5 opacity-70" />
              </button>
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

      {/* Notification & Civic Broadcast Dropdown Panel */}
      {isNotifOpen && (
        <div className="fixed inset-x-4 top-16 z-40 max-w-sm ml-auto bg-white/95 dark:bg-[#0c1220]/95 border border-slate-200/80 dark:border-white/[0.08] rounded-3xl shadow-2xl p-4 backdrop-blur-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.08] pb-2.5">
            {/* Dual Tabs */}
            <div className="flex gap-1 bg-slate-100 dark:bg-white/[0.04] p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setNotifTab("account")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  notifTab === "account"
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-zinc-300"
                }`}
              >
                Notifikasi ({notifications.length})
              </button>
              <button
                type="button"
                onClick={() => setNotifTab("gov")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  notifTab === "gov"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-zinc-300"
                }`}
              >
                <span>Warta Solo</span>
                {broadcasts.length > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                )}
              </button>
            </div>

            <div className="flex items-center gap-2">
              {notifTab === "account" && unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  Dibaca
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

          {/* Tab 1: Account Notifications */}
          {notifTab === "account" && (
            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-slate-400 dark:text-zinc-500 space-y-1">
                  <Bell className="h-6 w-6 mx-auto mb-1.5 opacity-40" />
                  <p className="text-xs font-medium">Belum ada pemberitahuan akun</p>
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
          )}

          {/* Tab 2: Government Broadcasts */}
          {notifTab === "gov" && (
            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {broadcasts.length === 0 ? (
                <div className="p-6 text-center text-slate-400 dark:text-zinc-500 space-y-1">
                  <Megaphone className="h-6 w-6 mx-auto mb-1.5 opacity-40" />
                  <p className="text-xs font-medium">Belum ada siaran dinas aktif</p>
                </div>
              ) : (
                <>
                  {broadcasts.map((b) => (
                    <div
                      key={b.id || Math.random().toString()}
                      onClick={() => {
                        setIsNotifOpen(false);
                        setIsBroadcastHubOpen(true);
                      }}
                      className="p-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/20 hover:bg-emerald-500/10 transition-all cursor-pointer space-y-1"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase">
                          {b.institutionName || "Pemkot Solo"}
                        </span>
                        <span className="text-[9px] text-slate-400">
                          {b.createdAt?.toDate ? b.createdAt.toDate().toLocaleDateString("id-ID", { day: "numeric", month: "short" }) : "Baru"}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                        {b.title}
                      </p>
                      <p className="text-[10px] text-slate-600 dark:text-zinc-300 line-clamp-2 leading-relaxed">
                        {b.body}
                      </p>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-[11px] font-bold h-9 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                    onClick={() => {
                      setIsNotifOpen(false);
                      setIsBroadcastHubOpen(true);
                    }}
                  >
                    Buka Arsip Lengkap Warta Pemkot
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Global Civic Broadcast Hub Modal */}
      <CivicBroadcastHubModal
        isOpen={isBroadcastHubOpen}
        onClose={() => setIsBroadcastHubOpen(false)}
        broadcasts={broadcasts}
      />
    </>
  );
}
