---
name: ridesolo-gov-opd-2
description: |
  Skill LANJUTAN untuk implementasi layanan pemerintahan (Government/OPD) Ride-Solo.
  Ini adalah UPGRADE dari ridesolo-gov-opd, fokus pada 5 pilar kritis:
  1. Customer experience: history terstruktur, OTP display, rejection notification
  2. Emergency services: GPS auto-detect, bypass pending_verification, SLA monitor
  3. Privacy compliance: DP3A anonim mode, data masking workspace, audit access
  4. OPD workspace: rejection flow + RejectionModal reusable, analytics bento (19 Dinas)
  5. Audit & compliance: sub-collection auditLog, SLA tracker, chain of custody

  Aktifkan skill ini ketika:
  - Membangun rejection flow / tombol tolak di workspace OPD mana pun
  - Emergency bypass: Damkar/BPBD skip pending_verification
  - DP3A anonim mode atau data masking workspace
  - Audit trail sub-collection untuk order gov
  - Customer history kategorisasi layanan
  - Komponen shared baru: RejectionModal, OTPDisplayCard, HistoryFilterBar

  File pendukung (WAJIB baca yang relevan):
  - CUSTOMER_HISTORY_UPGRADE.md   -> Blueprint history + UX kategorisasi
  - EMERGENCY_SERVICE_RULES.md    -> GPS bypass + audio alert + SLA rules
  - PRIVACY_COMPLIANCE.md         -> DP3A anonim + masking + audit access
  - WORKSPACE_REJECTION_FLOW.md   -> Rejection modal pattern + 19 dinas
  - AUDIT_TRAIL_SYSTEM.md         -> Sub-collection auditLog schema + SLA
  - PHASE2_MISSING_FORMS.md       -> Form yang belum dibuat + template
  - INTEGRATION_CHECKLIST.md      -> Master checklist end-to-end Q4 2026

  Skill terkait (baca bersamaan):
  - ridesolo-gov-opd  -> Aturan dasar, props, CivicFormDispatcher, naming
  - ridesolo-dev      -> Arsitektur umum, Firebase patterns
  - ridesolo-functions -> Backend triggers untuk notifikasi rejection
---

# Skill: Ridesolo Gov OPD 2 — Proses Bisnis Profesional & Terintegrasi (19 Dinas)

> **STATUS ARSITEKTUR**
> Skill ini mendokumentasikan upgrade proses bisnis profesional di atas fondasi `ridesolo-gov-opd` untuk seluruh **19 Dinas Pemkot Surakarta**.

---

## ATURAN WAJIB (Tambahan dari ridesolo-gov-opd)

### Aturan A: Audit Trail — Wajib Sub-Collection

Setiap aksi OPD yang mengubah status WAJIB ditulis ke sub-collection:

```
Path: orders/{orderId}/auditLog/{auto-id}
```

```typescript
// src/types/audit.types.ts
export interface AuditEntry {
  action:
    | "submitted"           // Customer submit form
    | "verified"            // OPD approve -> pending
    | "rejected"            // OPD tolak dengan alasan
    | "dispatched"          // Driver assigned
    | "in_progress"         // Driver mulai perjalanan
    | "completed"           // Selesai (OTP confirmed jika berlaku)
    | "cancelled"           // Customer batalkan
    | "identity_revealed";  // Akses identitas DP3A (audit khusus)
  actorId: string;          // userId pelaku (petugas/driver/customer)
  actorName: string;        // displayName pelaku
  actorRole: string;        // additionalRole (gov_dukcapil, driver, customer)
  timestamp: Timestamp;
  notes?: string;           // Alasan penolakan / catatan petugas
  metadata?: Record<string, unknown>;
}

// Cara menulis ke sub-collection:
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { COLLECTIONS } from "@/constants/collections";

const auditRef = collection(db, COLLECTIONS.ORDERS, orderId, "auditLog");
await addDoc(auditRef, {
  action: "rejected",
  actorId: currentUser.uid,
  actorName: userData.displayName || "Petugas Dinas",
  actorRole: userData.additionalRole || "government",
  timestamp: serverTimestamp(),
  notes: rejectionReason
});
```

---

### Aturan B: Rejection Flow — 3 Langkah Wajib

```
1. Petugas klik tombol "Tolak" -> buka RejectionModal
2. Petugas isi alasan penolakan (min 10 karakter, max 300)
3. Konfirmasi -> batch atomic:
   - updateDoc status "rejected" + rejectionReason + rejectedByDinasAt
   - addDoc ke sub-collection auditLog
```

```typescript
// Payload wajib saat reject:
await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
  status: "rejected",
  rejectionReason: reason,       // Wajib diisi petugas
  rejectedByDinasAt: serverTimestamp(),
  rejectedByDinasName: actorName, // Nama petugas yang menolak
  updatedAt: serverTimestamp()
});
```

---

### Aturan C: Emergency = Status "pending" Langsung (Skip Verifikasi)

```typescript
// src/constants/emergencyServices.ts
export const EMERGENCY_SERVICE_PREFIXES = ["damkar", "bpbd"] as const;
export type EmergencyPrefix = typeof EMERGENCY_SERVICE_PREFIXES[number];

export const isEmergencyService = (serviceId: string): boolean =>
  EMERGENCY_SERVICE_PREFIXES.some(prefix => serviceId.includes(prefix));

// Di form submit / order creation:
const initialStatus = isEmergencyService(service.id) ? "pending" : "pending_verification";
```

---

### Aturan D: DP3A — Masking Wajib di Semua Display

```typescript
// src/lib/privacy.ts
export const maskName = (name?: string, isAnon?: boolean): string => {
  if (!name) return "—";
  if (isAnon || name.startsWith("Pemohon-")) return name;
  if (name.length <= 2) return name.charAt(0) + "*";
  return `${name.charAt(0)}***${name.charAt(name.length - 1)}`;
};

export const maskPhone = (phone?: string): string =>
  phone ? `${phone.slice(0, 4)}****${phone.slice(-3)}` : "—";

export const generateAnonCode = (): string =>
  `Pemohon-${Math.floor(1000 + Math.random() * 9000)}`;
```

---

### Aturan E: OTP Display — Wajib Premium Card

Setelah customer submit form yang `requiresOtp: true`, WAJIB tampilkan `OTPDisplayCard`:

```tsx
// src/components/civic/shared/OTPDisplayCard.tsx
// Props: otp: string, serviceName: string, onDone: () => void
// UI: OTP besar bold + copy button + instruksi serah terima + countdown visual
```

---

## 📂 KOMPONEN SHARED UTAMA

```
src/components/government/shared/
├── RejectionModal.tsx       <- Reusable dialog reject untuk 19 workspace
└── WorkspaceAuditLog.tsx    <- Tampilkan sub-collection auditLog per order

src/components/civic/shared/
├── OTPDisplayCard.tsx       <- Premium OTP display setelah submit
└── CivicFormControls.tsx    <- Shared form input primitives

src/types/
└── audit.types.ts           <- AuditEntry, SLAConfig, AuditAction

src/constants/
├── emergencyServices.ts     <- isEmergencyService() + EMERGENCY_SERVICE_PREFIXES
├── slaConfig.ts             <- SLA per dinas + getSLAConfig()
└── serviceCategories.ts     <- Map serviceType -> kategori + icon display

src/lib/
└── privacy.ts               <- maskName(), maskPhone(), generateAnonCode()
```

---

## 📋 STATUS INTEGRASI & CHECKLIST

### P0 — CRITICAL ✅ (100% Selesai)
- [x] `Dp3aSapa129Form.tsx`: Mode Anonim toggle + `generateAnonCode()`
- [x] `Dp3aWorkspace.tsx`: Data masking via `maskName()` + `maskPhone()` + Reveal audit button
- [x] `DamkarPanicDispatchForm.tsx`: GPS auto-detect + bypass
- [x] Emergency bypass: `isEmergencyService` check di submission

### P1 — HIGH ✅ (100% Selesai)
- [x] `RejectionModal.tsx` reusable component
- [x] Rejection flow terintegrasi ke 19 workspace
- [x] `audit.types.ts` + setup `auditLog` write di rejection/verify handler
- [x] `DamkarWorkspace.tsx`: audio alert + live dispatch map

### P2 — NEXT STEPS & ADVANCED ENHANCEMENTS ✅ (100% Selesai)
- [x] Integrasi laporan warga Pojok Rembug (`/community`) ke `SatpolppWorkspace.tsx` & `DishubWorkspace.tsx`
- [x] Widget SLA Countdown timer visual di antrean order 19 dinas (`SLACountdownBadge.tsx`)
- [x] Validasi E-Tera Metrologi Disdag pada los pasar tradisional (`ETeraCertificateModal.tsx`)
- [x] Dinkes: "Obat Disiapkan Farmasi" flag sebelum dispatch driver (`DinkesWorkspace.tsx`)

### P3 — CIVIC DISPATCH & ECOSYSTEM EXTENSIONS ✅ (100% Selesai)
- [x] Diskominfo ULAS Multi-Agency Forwarding Modal (`DiskominfoWorkspace.tsx`)
- [x] DLH Eco-Points & Waste Weight Calculator (`DlhWorkspace.tsx`)
- [x] Industry B2B Digital Manifest & QR Serah Terima (`ManifestQrModal.tsx`)




