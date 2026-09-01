"use client";

import React from "react";
import { GovWorkspaceProvider, useGovWorkspace } from "@/components/government/layout/GovWorkspaceContext";
import { GovHeader } from "@/components/government/layout/GovHeader";
import { GovSidebar } from "@/components/government/layout/GovSidebar";
import { GovBottomNav } from "@/components/government/layout/GovBottomNav";
import { GovOPDDrawer } from "@/components/government/layout/GovOPDDrawer";
import { AdminImpersonationBar } from "@/components/admin/AdminImpersonationBar";
import { ProfileDrawer } from "@/components/layout/ProfileDrawer";
import { UnifiedHistoryModal } from "@/components/history/UnifiedHistoryModal";

function GovLayoutInner({ children }: { children: React.ReactNode }) {
  const {
    activeSector,
    activeTab,
    setActiveTab,
    selectedDinasId,
    setSelectedDinasId,
    isOPDDrawerOpen,
    setIsOPDDrawerOpen,
    isProfileOpen,
    setIsProfileOpen,
    isHistoryModalOpen,
    setIsHistoryModalOpen,
    pendingCount
  } = useGovWorkspace();

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* 1. Impersonation bar */}
      <AdminImpersonationBar />

      {/* 2. Top Header Bar */}
      <GovHeader
        activeSector={activeSector}
        onOpenOPDDrawer={() => setIsOPDDrawerOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* 3. Main Body Container with Desktop Sidebar + Main Content */}
      <div className="flex-1 flex w-full max-w-7xl mx-auto">
        {/* Desktop Sidebar (Left Command Center) */}
        <GovSidebar
          activeSector={activeSector}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenOPDDrawer={() => setIsOPDDrawerOpen(true)}
          pendingCount={pendingCount}
        />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 pb-24 lg:pb-12">
          {children}
        </main>
      </div>

      {/* 4. Mobile Floating Pill Bottom Navigation */}
      <GovBottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingCount={pendingCount}
      />

      {/* 5. 18 OPD Selection Drawer Modal */}
      <GovOPDDrawer
        isOpen={isOPDDrawerOpen}
        onClose={() => setIsOPDDrawerOpen(false)}
        selectedDinasId={selectedDinasId}
        onSelectDinas={setSelectedDinasId}
      />

      {/* 6. Profile Drawer */}
      <ProfileDrawer
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      {/* 7. History & Audit Log Modal */}
      {isHistoryModalOpen && (
        <UnifiedHistoryModal
          isOpen={isHistoryModalOpen}
          onClose={() => setIsHistoryModalOpen(false)}
        />
      )}
    </div>
  );
}

export default function GovRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <GovWorkspaceProvider>
      <GovLayoutInner>
        {children}
      </GovLayoutInner>
    </GovWorkspaceProvider>
  );
}
