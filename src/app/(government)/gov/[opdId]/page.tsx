"use client";

import React, { use, useEffect } from "react";
import { useGovWorkspace } from "@/components/government/layout/GovWorkspaceContext";
import GovernmentDashboardPage from "../page";

interface GovOPDPageProps {
  params: Promise<{ opdId: string }>;
}

export default function DedicatedOPDPage({ params }: GovOPDPageProps) {
  const { opdId } = use(params);
  const { setSelectedDinasId, selectedDinasId } = useGovWorkspace();

  const normalizedId = opdId.startsWith("gov_") ? opdId : `gov_${opdId}`;

  useEffect(() => {
    if (normalizedId && normalizedId !== selectedDinasId) {
      setSelectedDinasId(normalizedId);
    }
  }, [normalizedId, selectedDinasId, setSelectedDinasId]);

  return <GovernmentDashboardPage />;
}
