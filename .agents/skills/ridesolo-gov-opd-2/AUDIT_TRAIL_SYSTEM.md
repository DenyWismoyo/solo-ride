# AUDIT_TRAIL_SYSTEM.md — Sub-Collection AuditLog + SLA Tracker

> Panduan implementasi sistem audit trail profesional menggunakan Firestore sub-collection.
> Keputusan arsitektur: Opsi B — Sub-collection orders/{orderId}/auditLog/{logId}
> (scalable, query per log, tidak ada size limit per order document)

---

## Arsitektur Data

```
Firestore
└── orders/
    └── {orderId}/
        ├── [order fields]        <- Document utama order
        └── auditLog/             <- Sub-collection audit trail
            ├── {logId-1}         <- Entry pertama: submitted
            ├── {logId-2}         <- Entry: verified oleh petugas X
            ├── {logId-3}         <- Entry: rejected dengan alasan Y
            └── ...
```

---

## src/types/audit.types.ts — [BUAT FILE INI]

```typescript
// src/types/audit.types.ts
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

// Helper type untuk nulis ke Firestore (timestamp sebagai FieldValue):
export type AuditEntryInput = Omit<AuditEntry, "timestamp"> & {
  timestamp: ReturnType<typeof serverTimestamp>;
};

// SLA Status untuk setiap dinas:
export type SLAStatus = "on_track" | "warning" | "overdue";

export interface SLAConfig {
  pendingVerificationHours: number; // Max jam dari submit ke verifikasi OPD
  pendingHours: number;             // Max jam dari pending ke driver accept
  inProgressHours: number;          // Max jam dari accepted ke completed
}
```

---

## src/constants/slaConfig.ts — [BUAT FILE INI]

```typescript
// src/constants/slaConfig.ts

import { SLAConfig } from "@/types/audit.types";

// SLA per kategori dinas (dalam JAM):
export const DINAS_SLA_CONFIG: Record<string, SLAConfig> = {
  // Emergency — sangat ketat
  gov_damkar: { pendingVerificationHours: 0, pendingHours: 0.08, inProgressHours: 1 }, // 5 menit
  gov_bpbd:   { pendingVerificationHours: 0, pendingHours: 0.17, inProgressHours: 2 }, // 10 menit

  // Layanan rutin cepat
  gov_dinkes:     { pendingVerificationHours: 4,  pendingHours: 2,  inProgressHours: 3 },
  gov_dukcapil:   { pendingVerificationHours: 24, pendingHours: 4,  inProgressHours: 8 },
  gov_disdik:     { pendingVerificationHours: 24, pendingHours: 4,  inProgressHours: 8 },
  gov_dispusip:   { pendingVerificationHours: 24, pendingHours: 4,  inProgressHours: 8 },
  gov_disnaker:   { pendingVerificationHours: 24, pendingHours: 4,  inProgressHours: 8 },

  // Bantuan sosial
  gov_dinsos: { pendingVerificationHours: 48, pendingHours: 8, inProgressHours: 24 },

  // Pengaduan/Laporan
  gov_diskominfo: { pendingVerificationHours: 24, pendingHours: 0, inProgressHours: 24 }, // SLA 1x24 jam
  gov_dishub:     { pendingVerificationHours: 48, pendingHours: 4, inProgressHours: 8 },
  gov_dlh:        { pendingVerificationHours: 48, pendingHours: 4, inProgressHours: 8 },
  gov_satpolpp:   { pendingVerificationHours: 72, pendingHours: 0, inProgressHours: 48 },

  // Privasi-First
  gov_dp3a: { pendingVerificationHours: 24, pendingHours: 4, inProgressHours: 24 },

  // Pajak & Legalitas
  gov_bapenda:  { pendingVerificationHours: 72, pendingHours: 8, inProgressHours: 24 },
  gov_diskop:   { pendingVerificationHours: 72, pendingHours: 8, inProgressHours: 24 },
  gov_dpmptsp:  { pendingVerificationHours: 72, pendingHours: 8, inProgressHours: 24 },

  // Booking/Reservasi
  gov_dispar:    { pendingVerificationHours: 48, pendingHours: 4, inProgressHours: 4 },
  gov_dispertan: { pendingVerificationHours: 48, pendingHours: 8, inProgressHours: 4 },
};

// Default SLA jika dinas tidak terdaftar:
export const DEFAULT_SLA: SLAConfig = {
  pendingVerificationHours: 48,
  pendingHours: 8,
  inProgressHours: 24
};

export const getSLAConfig = (additionalRole?: string): SLAConfig =>
  (additionalRole ? DINAS_SLA_CONFIG[additionalRole] : null) || DEFAULT_SLA;

// Helper: hitung SLA status berdasarkan jam elapsed
export const getSLAStatus = (
  elapsedHours: number,
  slaHours: number
): SLAStatus => {
  if (elapsedHours >= slaHours) return "overdue";
  if (elapsedHours >= slaHours * 0.75) return "warning"; // 75% SLA terlewat
  return "on_track";
};
```

---

## Utility: Menulis AuditLog (Reusable Helper)

```typescript
// src/lib/auditLog.ts — [BUAT FILE INI]

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

// Contoh penggunaan di workspace:
// await writeAuditLog({
//   orderId: order.id!,
//   action: "rejected",
//   actorId: user.uid,
//   actorName: userData.displayName || "Petugas",
//   actorRole: userData.additionalRole || "government",
//   notes: rejectionReason
// });
```

---

## WorkspaceAuditLog Component — [BUAT BARU]

```typescript
// src/components/government/shared/WorkspaceAuditLog.tsx
"use client";

// Props:
// - orderId: string
// - isOpen: boolean (collapsible)

// Data source: onSnapshot ke sub-collection orders/{orderId}/auditLog
// Order: timestamp DESC (terbaru di atas)

// UI per entry:
// - Icon berdasarkan action (CheckCircle2/XCircle/Truck/User/Shield)
// - actorName + actorRole
// - Waktu (format: "2 jam lalu" atau "14:30, 1 Sep 2026")
// - notes (alasan penolakan, catatan)

// ACTION_ICON_MAP:
const ACTION_CONFIG: Record<AuditAction, { icon: LucideIcon; label: string; color: string }> = {
  submitted:         { icon: FileText,     label: "Permohonan Dikirim",      color: "blue" },
  verified:          { icon: CheckCircle2, label: "Diverifikasi & Dispatch", color: "emerald" },
  rejected:          { icon: XCircle,      label: "Ditolak Dinas",           color: "rose" },
  dispatched:        { icon: Truck,        label: "Driver Ditugaskan",       color: "teal" },
  in_progress:       { icon: Navigation,   label: "Dalam Perjalanan",        color: "blue" },
  completed:         { icon: CheckCircle2, label: "Selesai",                 color: "emerald" },
  cancelled:         { icon: XCircle,      label: "Dibatalkan",              color: "neutral" },
  otp_verified:      { icon: Key,          label: "OTP Dikonfirmasi",        color: "emerald" },
  identity_revealed: { icon: Eye,          label: "Identitas Diakses",       color: "amber" },
  forwarded:         { icon: ArrowRight,   label: "Diteruskan ke Dinas Lain",color: "purple" },
};
```

---

## Cara Membaca AuditLog di Workspace

```typescript
// Hook untuk baca sub-collection auditLog:
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { AuditEntry } from "@/types/audit.types";

const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);

useEffect(() => {
  if (!orderId) return;
  const q = query(
    collection(db, COLLECTIONS.ORDERS, orderId, "auditLog"),
    orderBy("timestamp", "desc")
  );
  const unsub = onSnapshot(q, snap => {
    const logs: AuditEntry[] = [];
    snap.forEach(d => logs.push({ ...d.data() } as AuditEntry));
    setAuditLogs(logs);
  });
  return () => unsub();
}, [orderId]);
```

---

## Firestore Security Rules Update

```
// firestore.rules — tambahkan rule untuk sub-collection auditLog

match /orders/{orderId}/auditLog/{logId} {
  // Hanya petugas dinas, driver, dan admin yang bisa baca
  allow read: if request.auth != null &&
    (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in
      ["admin", "driver", "government"]);
  
  // Hanya petugas dinas dan driver yang bisa menulis
  allow create: if request.auth != null &&
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in
      ["admin", "driver", "government"];
  
  // Tidak ada yang boleh edit atau hapus audit log
  allow update, delete: if false;
}
```
