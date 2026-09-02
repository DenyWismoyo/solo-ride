"use client";

import React from "react";
import { useGovWorkspace } from "@/components/government/layout/GovWorkspaceContext";
import { useAuthContext } from "@/components/AuthProvider";
import { GovWorkspaceDispatcher } from "@/components/government/workspaces/GovWorkspaceDispatcher";
import { GovOrdersTab } from "@/components/government/orders/GovOrdersTab";
import { GovServiceCatalogManager } from "@/components/government/services/GovServiceCatalogManager";
import { GovBroadcastTab } from "@/components/government/broadcast/GovBroadcastTab";
import { GovAuditTab } from "@/components/government/audit/GovAuditTab";
import { GovSLAAnalyticsTab } from "@/components/government/analytics/GovSLAAnalyticsTab";

export default function GovernmentDashboardPage() {
  const { user } = useAuthContext();
  const {
    activeSector,
    selectedDinasId,
    activeTab,
    citizenRequests,
    loadingRequests
  } = useGovWorkspace();

  return (
    <div className="w-full space-y-6">
      {/* 1. WORKSPACE TAB (Instansi-Spesifik Dashboard) */}
      {activeTab === "workspace" && (
        <GovWorkspaceDispatcher 
          dinasId={selectedDinasId} 
          orders={citizenRequests}
          loading={loadingRequests}
        />
      )}

      {/* 2. ORDERS TAB (Kelola Permohonan Masuk Warga) */}
      {activeTab === "orders" && (
        <GovOrdersTab
          citizenRequests={citizenRequests}
          loadingRequests={loadingRequests}
          activeDinasId={selectedDinasId}
        />
      )}

      {/* 3. CATALOG TAB (Kelola Template Layanan & SLA) */}
      {activeTab === "catalog" && (
        <GovServiceCatalogManager sector={activeSector} />
      )}

      {/* 4. BROADCAST TAB (Siaran Resmi Darurat / Info Warga) */}
      {activeTab === "broadcast" && (
        <GovBroadcastTab user={user} activeSector={activeSector} />
      )}

      {/* 5. AUDIT TAB (Immutable Audit Trail) */}
      {activeTab === "audit" && (
        <GovAuditTab />
      )}

      {/* 6. ANALYTICS TAB (Civic SLA Response Time & Compliance) */}
      {activeTab === "analytics" && (
        <GovSLAAnalyticsTab />
      )}
    </div>
  );
}
