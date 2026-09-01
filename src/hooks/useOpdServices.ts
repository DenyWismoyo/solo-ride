"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { OpdServiceConfig, opdService } from "@/services/opdService.service";
import { CIVIC_SERVICES_CATALOG, getCivicServiceDefinition } from "@/constants/civicCatalog";
import { ALL_ECOSYSTEM_SERVICES } from "@/constants/services";

export function useOpdServices(agencyId?: string) {
  const [firestoreConfigs, setFirestoreConfigs] = useState<OpdServiceConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const normalizedAgencyId = agencyId?.startsWith("gov_") ? agencyId : agencyId ? `gov_${agencyId}` : undefined;

  // Realtime Firestore Listener
  useEffect(() => {
    if (!normalizedAgencyId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, "opd_services"),
      where("agencyId", "==", normalizedAgencyId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as OpdServiceConfig[];
        setFirestoreConfigs(list);
        setLoading(false);
      },
      (err) => {
        console.error("Error listening to OPD services:", err);
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [normalizedAgencyId]);

  // Merge Predefined Default Services with Firestore Overrides & Custom Services
  const services = useMemo(() => {
    if (!normalizedAgencyId) return [];

    const cleanSectorName = normalizedAgencyId.replace("gov_", "");
    
    // 1. Get predefined default services from ALL_ECOSYSTEM_SERVICES
    const defaultServices = ALL_ECOSYSTEM_SERVICES.filter(srv => {
      const matchRole = srv.additionalRole === normalizedAgencyId;
      const matchId = srv.id.startsWith(`${cleanSectorName}_`) || srv.id === cleanSectorName;
      return matchRole || matchId;
    });

    const firestoreMap = new Map<string, OpdServiceConfig>();
    firestoreConfigs.forEach(cfg => firestoreMap.set(cfg.id, cfg));

    // 2. Build combined list
    const result: OpdServiceConfig[] = [];
    const processedIds = new Set<string>();

    defaultServices.forEach(def => {
      processedIds.add(def.id);
      const customOverride = firestoreMap.get(def.id);
      const civicDef = getCivicServiceDefinition(def.id);

      if (customOverride) {
        result.push({
          ...customOverride,
          id: def.id,
          agencyId: normalizedAgencyId,
          name: customOverride.name || def.name,
          shortName: customOverride.shortName || def.name,
          description: customOverride.description || def.description,
          outputMode: customOverride.outputMode || civicDef.outputMode || "delivery",
          isActive: customOverride.isActive !== undefined ? customOverride.isActive : true,
          price: customOverride.price !== undefined ? customOverride.price : ((def as any).price || 0),
          feeLabel: customOverride.feeLabel || civicDef.feeLabel || "Gratis / Subsidi",
          slaMinutes: customOverride.slaMinutes || civicDef.slaMinutes || 120,
          requiresDeliveryAddress: customOverride.requiresDeliveryAddress !== undefined ? customOverride.requiresDeliveryAddress : civicDef.requiresDeliveryAddress,
          requiresAttachments: customOverride.requiresAttachments !== undefined ? customOverride.requiresAttachments : civicDef.requiresAttachments,
          isEmergency: customOverride.isEmergency !== undefined ? customOverride.isEmergency : civicDef.isEmergency,
          icon: customOverride.icon || def.icon,
          isCustom: false
        });
      } else {
        result.push({
          id: def.id,
          agencyId: normalizedAgencyId,
          name: def.name,
          shortName: def.name,
          description: def.description,
          outputMode: civicDef.outputMode || "delivery",
          isActive: true,
          price: (def as any).price || 0,
          feeLabel: civicDef.feeLabel || "Gratis Subsidi Pemkot",
          slaMinutes: civicDef.slaMinutes || 120,
          requiresDeliveryAddress: civicDef.requiresDeliveryAddress || false,
          requiresAttachments: civicDef.requiresAttachments || false,
          isEmergency: civicDef.isEmergency || false,
          icon: def.icon,
          isCustom: false
        });
      }
    });

    // 3. Add brand new custom services added by OPD admin
    firestoreConfigs.forEach(cfg => {
      if (!processedIds.has(cfg.id)) {
        result.push({
          ...cfg,
          isCustom: true
        });
      }
    });

    return result;
  }, [normalizedAgencyId, firestoreConfigs]);

  const toggleService = useCallback(async (serviceId: string, currentStatus: boolean, fallback?: OpdServiceConfig) => {
    await opdService.toggleServiceStatus(serviceId, !currentStatus, fallback);
  }, []);

  const saveConfig = useCallback(async (config: OpdServiceConfig) => {
    await opdService.saveServiceConfig(config);
  }, []);

  const deleteCustom = useCallback(async (serviceId: string) => {
    await opdService.deleteCustomService(serviceId);
  }, []);

  return {
    services,
    loading,
    error,
    toggleService,
    saveConfig,
    deleteCustom
  };
}
