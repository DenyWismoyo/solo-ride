import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp, 
  increment 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { RoadIncident, CreateIncidentDTO } from "@/types/traffic.types";
import { INITIAL_ROAD_INCIDENTS } from "@/constants/mockIncidents";
import { writeAuditLog } from "@/lib/auditLog";

const COLLECTION_NAME = "road_incidents";

export const trafficService = {
  createIncident: async (data: CreateIncidentDTO): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...data,
        status: "active",
        isVerifiedByDishub: data.reporterRole === "officer" || data.reporterRole === "admin",
        verifiedByOfficerName: (data.reporterRole === "officer" || data.reporterRole === "admin") ? data.reporterName : null,
        stillActiveCount: 1,
        resolvedCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      await writeAuditLog({
        orderId: `INCIDENT-${docRef.id}`,
        action: "submitted",
        actorId: data.reporterId,
        actorRole: data.reporterRole,
        actorName: data.reporterName,
        notes: `Laporan kondisi jalan baru dibuat: "${data.title}" di ${data.streetName}`,
        metadata: { category: data.category, streetName: data.streetName }
      });

      return docRef.id;
    } catch (err: any) {
      throw new Error(`Gagal mengirim laporan jalan: ${err.message || err}`);
    }
  },

  voteIncident: async (
    incidentId: string, 
    voteType: "still_active" | "resolved", 
    userId: string,
    userName: string = "Warga"
  ): Promise<void> => {
    try {
      const ref = doc(db, COLLECTION_NAME, incidentId);
      if (voteType === "still_active") {
        await updateDoc(ref, {
          stillActiveCount: increment(1),
          updatedAt: serverTimestamp()
        });
      } else {
        await updateDoc(ref, {
          resolvedCount: increment(1),
          updatedAt: serverTimestamp()
        });
      }
    } catch (err: any) {
      // In local testing without Firestore connectivity, ignore gracefully
      console.warn("Vote error:", err);
    }
  },

  verifyIncidentByDishub: async (
    incidentId: string, 
    officerId: string, 
    officerName: string
  ): Promise<void> => {
    try {
      const ref = doc(db, COLLECTION_NAME, incidentId);
      await updateDoc(ref, {
        isVerifiedByDishub: true,
        verifiedByOfficerName: officerName,
        updatedAt: serverTimestamp()
      });

      await writeAuditLog({
        orderId: `INCIDENT-${incidentId}`,
        action: "verified",
        actorId: officerId,
        actorRole: "officer",
        actorName: officerName,
        notes: `Laporan jalan telah diverifikasi keabsahannya oleh Dishub Surakarta`
      });
    } catch (err: any) {
      throw new Error(`Gagal memverifikasi laporan: ${err.message || err}`);
    }
  },

  resolveIncident: async (
    incidentId: string, 
    actorId: string, 
    actorName: string
  ): Promise<void> => {
    try {
      const ref = doc(db, COLLECTION_NAME, incidentId);
      await updateDoc(ref, {
        status: "resolved",
        updatedAt: serverTimestamp()
      });

      await writeAuditLog({
        orderId: `INCIDENT-${incidentId}`,
        action: "completed",
        actorId,
        actorRole: "officer",
        actorName,
        notes: `Kondisi jalanan dilaporkan telah lancar / normal kembali`
      });
    } catch (err: any) {
      throw new Error(`Gagal menyelesaikan laporan: ${err.message || err}`);
    }
  }
};
