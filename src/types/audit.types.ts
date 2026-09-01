import { Timestamp } from "firebase/firestore";

export type AuditAction =
  | "submitted"           // Customer submit form
  | "verified"            // OPD approve -> status pending
  | "rejected"            // OPD tolak + rejectionReason
  | "dispatched"          // Driver accept -> status accepted
  | "in_progress"         // Driver mulai -> status in_progress
  | "completed"           // Selesai (OTP confirmed jika berlaku)
  | "cancelled"           // Customer batalkan
  | "otp_verified"        // Driver konfirmasi OTP serah terima
  | "identity_revealed"   // Akses identitas DP3A
  | "forwarded";          // Diskominfo forward ke dinas lain

export interface AuditEntry {
  action: AuditAction;
  actorId: string;        // userId pelaku
  actorName: string;      // displayName pelaku
  actorRole: string;      // additionalRole (gov_dukcapil, driver, customer, dll)
  timestamp: Timestamp;
  notes?: string;         // Alasan penolakan, catatan, dll
  metadata?: {
    previousStatus?: string;
    newStatus?: string;
    targetDinasId?: string;  // Untuk aksi "forwarded"
    otpConfirmed?: boolean;  // Untuk aksi "otp_verified"
    [key: string]: unknown;
  };
}

// SLA Status untuk setiap dinas:
export type SLAStatus = "on_track" | "warning" | "overdue";

export interface SLAConfig {
  pendingVerificationHours: number; // Max jam dari submit ke verifikasi OPD
  pendingHours: number;             // Max jam dari pending ke driver accept
  inProgressHours: number;          // Max jam dari accepted ke completed
}
