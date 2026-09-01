"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useAuthContext } from "@/components/AuthProvider";
import { GOVERNMENT_SECTORS, SectorDefinition } from "@/constants/ecosystemSectors";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";
import { OrderDocument } from "@/types/order.types";

export type GovTab = "workspace" | "orders" | "catalog" | "broadcast" | "audit";

interface GovWorkspaceContextType {
  selectedDinasId: string;
  setSelectedDinasId: (id: string) => void;
  activeSector: SectorDefinition;
  activeTab: GovTab;
  setActiveTab: (tab: GovTab) => void;
  isOPDDrawerOpen: boolean;
  setIsOPDDrawerOpen: (open: boolean) => void;
  isProfileOpen: boolean;
  setIsProfileOpen: (open: boolean) => void;
  isHistoryModalOpen: boolean;
  setIsHistoryModalOpen: (open: boolean) => void;
  citizenRequests: OrderDocument[];
  loadingRequests: boolean;
  pendingCount: number;
}

const GovWorkspaceContext = createContext<GovWorkspaceContextType | null>(null);

export function GovWorkspaceProvider({ 
  children,
  initialDinasId
}: { 
  children: React.ReactNode;
  initialDinasId?: string;
}) {
  const { user, userData, impersonatedPersona } = useAuthContext();

  const defaultSectorId = 
    initialDinasId ||
    impersonatedPersona?.additionalRole || 
    userData?.additionalRole || 
    "gov_dukcapil";

  const [selectedDinasId, setSelectedDinasId] = useState<string>(defaultSectorId);
  const [activeTab, setActiveTab] = useState<GovTab>("workspace");
  const [isOPDDrawerOpen, setIsOPDDrawerOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Sync if impersonated persona changes
  useEffect(() => {
    if (impersonatedPersona?.additionalRole) {
      setSelectedDinasId(impersonatedPersona.additionalRole);
    }
  }, [impersonatedPersona]);

  // If initialDinasId changes via URL
  useEffect(() => {
    if (initialDinasId && initialDinasId !== selectedDinasId) {
      setSelectedDinasId(initialDinasId);
    }
  }, [initialDinasId]);

  const activeSector = useMemo(() => {
    return GOVERNMENT_SECTORS.find((s) => s.id === selectedDinasId) || GOVERNMENT_SECTORS[0];
  }, [selectedDinasId]);

  // Live listener for citizen requests for this specific Dinas
  const [citizenRequests, setCitizenRequests] = useState<OrderDocument[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  useEffect(() => {
    setLoadingRequests(true);
    const q = query(
      collection(db, COLLECTIONS.ORDERS),
      where("additionalRole", "==", selectedDinasId)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const docs: OrderDocument[] = [];
      snapshot.forEach((d) => {
        docs.push({ id: d.id, ...d.data() } as OrderDocument);
      });
      setCitizenRequests(docs);
      setLoadingRequests(false);
    }, (err) => {
      console.error("Error fetching gov orders:", err);
      setLoadingRequests(false);
    });

    return () => unsub();
  }, [selectedDinasId]);

  const pendingCount = useMemo(() => {
    return citizenRequests.filter(r => r.status === "pending_verification").length;
  }, [citizenRequests]);

  const value = {
    selectedDinasId,
    setSelectedDinasId,
    activeSector,
    activeTab,
    setActiveTab,
    isOPDDrawerOpen,
    setIsOPDDrawerOpen,
    isProfileOpen,
    setIsProfileOpen,
    isHistoryModalOpen,
    setIsHistoryModalOpen,
    citizenRequests,
    loadingRequests,
    pendingCount
  };

  return (
    <GovWorkspaceContext.Provider value={value}>
      {children}
    </GovWorkspaceContext.Provider>
  );
}

export function useGovWorkspace() {
  const context = useContext(GovWorkspaceContext);
  if (!context) {
    throw new Error("useGovWorkspace must be used within a GovWorkspaceProvider");
  }
  return context;
}
