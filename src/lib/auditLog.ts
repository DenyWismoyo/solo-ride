import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";
import { AuditAction } from "@/types/audit.types";

interface WriteAuditParams {
  orderId: string;
  action: AuditAction;
  actorId: string;
  actorName: string;
  actorRole: string;
  notes?: string;
  metadata?: Record<string, unknown>;
}

export const writeAuditLog = async (params: WriteAuditParams): Promise<void> => {
  const {
    orderId, action, actorId, actorName, actorRole, notes, metadata
  } = params;

  const auditRef = collection(db, COLLECTIONS.ORDERS, orderId, "auditLog");
  const entry: Record<string, unknown> = {
    action,
    actorId,
    actorName,
    actorRole,
    timestamp: serverTimestamp()
  };
  if (notes) entry.notes = notes;
  if (metadata) entry.metadata = metadata;

  await addDoc(auditRef, entry);
};
