"use client";

import React, { useState } from "react";
import Link from "next/link";
import { RoadIncidentFeed } from "@/components/community/RoadIncidentFeed";
import { AppHeader } from "@/components/layout/AppHeader";
import { AdminImpersonationBar } from "@/components/admin/AdminImpersonationBar";
import { ProfileDrawer } from "@/components/layout/ProfileDrawer";
import { ArrowLeft, Megaphone, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CommunityRoadIntelPage() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-white flex flex-col selection:bg-orange-500/20">
      <AdminImpersonationBar />
      <AppHeader onOpenProfile={() => setIsProfileOpen(true)} />
      <ProfileDrawer isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-zinc-400">
          <Link href="/" className="hover:text-orange-600 flex items-center gap-1 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Kembali ke Beranda</span>
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-bold">Pojok Rembug Solo</span>
        </div>

        {/* Road Incident Feed */}
        <RoadIncidentFeed />
      </main>
    </div>
  );
}
