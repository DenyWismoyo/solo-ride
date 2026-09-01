"use client";

import React from "react";
import { MerchantProvider } from "@/components/merchant/layout/MerchantContext";
import { MerchantSidebar } from "@/components/merchant/layout/MerchantSidebar";
import { MerchantHeader } from "@/components/merchant/layout/MerchantHeader";
import { MerchantBottomNav } from "@/components/merchant/layout/MerchantBottomNav";
import { AdminImpersonationBar } from "@/components/admin/AdminImpersonationBar";

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
  return (
    <MerchantProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-white flex flex-col selection:bg-orange-500/20">
        {/* Impersonation bar */}
        <AdminImpersonationBar />

        {/* Top Navbar */}
        <MerchantHeader />

        {/* Main Content Area with Desktop Sidebar */}
        <div className="flex-1 flex w-full">
          <MerchantSidebar />

          <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-12 max-w-6xl">
            {children}
          </main>
        </div>

        {/* Mobile Floating Pill Navigation */}
        <MerchantBottomNav />
      </div>
    </MerchantProvider>
  );
}
