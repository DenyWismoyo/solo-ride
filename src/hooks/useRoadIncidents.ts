"use client";

import { useState, useEffect, useCallback } from "react";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { RoadIncident, CreateIncidentDTO } from "@/types/traffic.types";
import { INITIAL_ROAD_INCIDENTS } from "@/constants/mockIncidents";
import { trafficService } from "@/services/traffic.service";

export function useRoadIncidents(districtId: string = "all", category: string = "all") {
  const [incidents, setIncidents] = useState<RoadIncident[]>(INITIAL_ROAD_INCIDENTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      const q = query(
        collection(db, "road_incidents"),
        orderBy("createdAt", "desc"),
        limit(50)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: RoadIncident[] = snapshot.docs.map((docSnap) => ({
              id: docSnap.id,
              ...docSnap.data()
            } as RoadIncident));

            // Combine with initial mock if needed
            const ids = new Set(list.map(i => i.id));
            const extra = INITIAL_ROAD_INCIDENTS.filter(i => !ids.has(i.id));
            setIncidents([...list, ...extra]);
          } else {
            setIncidents(INITIAL_ROAD_INCIDENTS);
          }
          setLoading(false);
        },
        (err) => {
          console.warn("Firestore road_incidents snapshot error, using mock data:", err);
          setIncidents(INITIAL_ROAD_INCIDENTS);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err: any) {
      console.warn("Road incidents hook error:", err);
      setIncidents(INITIAL_ROAD_INCIDENTS);
      setLoading(false);
    }
  }, []);

  // Filter by district & category
  const filteredIncidents = incidents.filter((item) => {
    if (districtId !== "all" && item.districtId !== districtId) return false;
    if (category !== "all" && item.category !== category) return false;
    return true;
  });

  const vote = useCallback(async (incidentId: string, type: "still_active" | "resolved", userId: string, userName?: string) => {
    // Optimistic local update
    setIncidents(prev => prev.map(inc => {
      if (inc.id === incidentId) {
        return {
          ...inc,
          stillActiveCount: type === "still_active" ? inc.stillActiveCount + 1 : inc.stillActiveCount,
          resolvedCount: type === "resolved" ? inc.resolvedCount + 1 : inc.resolvedCount
        };
      }
      return inc;
    }));

    await trafficService.voteIncident(incidentId, type, userId, userName);
  }, []);

  const create = useCallback(async (data: CreateIncidentDTO): Promise<string> => {
    const newId = await trafficService.createIncident(data);
    const newIncident: RoadIncident = {
      id: newId,
      ...data,
      status: "active",
      isVerifiedByDishub: data.reporterRole === "officer" || data.reporterRole === "admin",
      verifiedByOfficerName: (data.reporterRole === "officer" || data.reporterRole === "admin") ? data.reporterName : undefined,
      stillActiveCount: 1,
      resolvedCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setIncidents(prev => [newIncident, ...prev]);
    return newId;
  }, []);

  return {
    incidents: filteredIncidents,
    allIncidents: incidents,
    loading,
    error,
    voteIncident: vote,
    createIncident: create
  };
}
