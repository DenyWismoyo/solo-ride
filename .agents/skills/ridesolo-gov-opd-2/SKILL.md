---
name: ridesolo-gov-opd-2
description: |
  Skill LANJUTAN untuk implementasi layanan pemerintahan (Government/OPD) Ride-Solo.
  Ini adalah UPGRADE dari ridesolo-gov-opd, fokus pada 5 celah kritis:
  1. Customer experience: history terstruktur, OTP display, rejection notification
  2. Emergency services: GPS auto-detect, bypass pending_verification, SLA monitor
  3. Privacy compliance: DP3A anonim mode, data masking workspace, audit access
  4. OPD workspace: rejection flow + RejectionModal reusable, analytics bento
  5. Audit & compliance: sub-collection auditLog, SLA tracker, chain of custody

  Aktifkan skill ini ketika:
  - Mengimplementasikan Phase 2 gaps yang belum ada di ridesolo-gov-opd
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
  - WORKSPACE_REJECTION_FLOW.md   -> Rejection modal pattern + 18 dinas
  - AUDIT_TRAIL_SYSTEM.md         -> Sub-collection auditLog schema + SLA
  - PHASE2_MISSING_FORMS.md       -> Form yang belum dibuat + template
  - INTEGRATION_CHECKLIST.md      -> Master checklist end-to-end Q4 2026

  Skill terkait (baca bersamaan):
  - ridesolo-gov-opd  -> Aturan dasar, props, CivicFormDispatcher, naming
  - ridesolo-dev      -> Arsitektur umum, Firebase patterns
  - ridesolo-functions -> Backend triggers untuk notifikasi rejection
---

# Skill: Ridesolo Gov OPD 2 — Proses Bisnis Profesional & Terintegrasi

> **STATUS (per 1 September 2026)**
> Skill ini mendokumentasikan CELAH dan UPGRADE di atas fondasi ridesolo-gov-opd.
> SELALU baca ridesolo-gov-opd terlebih dahulu untuk arsitektur dasar.

---

## ATURAN WAJIB (Tambahan dari ridesolo-gov-opd)

### Aturan A: Audit Trail — Wajib Sub-Collection

Setiap aksi OPD yang mengubah status WAJIB ditulis ke sub-collection:

`
// Path: orders/{orderId}/auditLog/{auto-id}
`

`	ypescript
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
const auditRef = collection(db, COLLECTIONS.ORDERS, orderId, "auditLog");
await addDoc(auditRef, {
  action: "rejected",
  actorId: currentUser.uid,
  actorName: userData.displayName || "Petugas Dinas",
  actorRole: userData.additionalRole || "government",
  timestamp: serverTimestamp(),
  notes: rejectionReason
} satisfies Omit<AuditEntry, "timestamp"> & { timestamp: any });
`

### Aturan B: Rejection Flow — 3 Langkah Wajib

`
1. Petugas klik tombol "Tolak" -> buka RejectionModal
2. Petugas isi alasan penolakan (min 10 karakter, max 300)
3. Konfirmasi -> batch:
   - updateDoc status "rejected" + rejectionReason + rejectedByDinasAt
   - addDoc ke sub-collection auditLog
`

`	ypescript
// Payload wajib saat reject:
await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
  status: "rejected",
  rejectionReason: reason,       // Wajib diisi petugas
  rejectedByDinasAt: serverTimestamp(),
  rejectedByDinasName: actorName, // Nama petugas yang menolak
  updatedAt: serverTimestamp()
});
`

### Aturan C: Emergency = Status "pending" Langsung (Skip Verifikasi)

`	ypescript
// src/constants/emergencyServices.ts — buat file ini

export const EMERGENCY_SERVICE_PREFIXES = ["damkar", "bpbd"] as const;
export type EmergencyPrefix = typeof EMERGENCY_SERVICE_PREFIXES[number];

export const isEmergencyService = (serviceId: string): boolean =>
  EMERGENCY_SERVICE_PREFIXES.some(prefix => serviceId.includes(prefix));

// Di useCivicOrder.ts atau form submit:
const initialStatus = isEmergencyService(service.id) ? "pending" : "pending_verification";
`

### Aturan D: DP3A — Masking Wajib di Semua Display

`	ypescript
// src/lib/privacy.ts — buat file ini

export const maskName = (name?: string, isAnon?: boolean): string => {
  if (!name) return "—";
  if (isAnon || name.startsWith("Pemohon-")) return name;
  if (name.length <= 2) return name.charAt(0) + "*";
  return ${name.charAt(0)};
};

export const maskPhone = (phone?: string): string =>
  phone ? ${phone.slice(0, 4)}**** : "—";

export const generateAnonCode = (): string =>
  Pemohon-;
`

### Aturan E: OTP Display — Wajib Premium Card

Setelah customer submit form yang equiresOtp: true, WAJIB tampilkan OTPDisplayCard:

`	sx
// src/components/civic/shared/OTPDisplayCard.tsx
// Props: otp: string, serviceName: string, onDone: () => void
// UI: OTP besar bold + copy button + instruksi serah terima + countdown visual
`

---

## KOMPONEN SHARED BARU

`
src/components/government/shared/
├── RejectionModal.tsx       <- Reusable dialog reject untuk 18 workspace
└── WorkspaceAuditLog.tsx    <- Tampilkan sub-collection auditLog per order

src/components/civic/shared/
└── OTPDisplayCard.tsx       <- Premium OTP display setelah submit

src/components/history/
└── HistoryFilterBar.tsx     <- 6-kategori filter di tab history customer

src/types/
└── audit.types.ts           <- AuditEntry, RejectionRecord, SLAStatus

src/constants/
├── emergencyServices.ts     <- isEmergencyService() + EMERGENCY_SERVICE_PREFIXES
└── serviceCategories.ts     <- Map serviceType -> kategori + icon display

src/lib/
└── privacy.ts               <- maskName(), maskPhone(), generateAnonCode()
`

---

## PRIORITY CHECKLIST PHASE 2

### P0 — CRITICAL (Implementasikan Pertama)
- [ ] Dp3aSapa129Form.tsx: Mode Anonim toggle (default: true) + generateAnonCode()
- [ ] Dp3aWorkspace.tsx: Data masking via maskName() + maskPhone() + Reveal button
- [ ] DamkarPanicDispatchForm.tsx: GPS auto-detect + enum jenisDarurat
- [ ] useCivicOrder.ts: Emergency bypass (isEmergencyService check)

### P1 — HIGH (Sprint Berikutnya)
- [ ] Buat RejectionModal.tsx reusable component
- [ ] Tambah rejection flow ke semua 18 workspace (mulai dari: Dukcapil, Dinkes, Dinsos)
- [ ] Buat udit.types.ts + setup auditLog write di rejection/verify handler
- [ ] Customer history: tambah kategori filter + status label OPD-friendly
- [ ] DamkarWorkspace.tsx: audio alert + elapsed time badge SLA

### P2 — MEDIUM
- [ ] OTPDisplayCard.tsx premium component
- [ ] WorkspaceAuditLog.tsx untuk tampilkan audit trail
- [ ] Missing forms: DamkarAnimalRescueForm, BapendaRetribusiPasarForm, BapendaKonsultasiPajakForm, DisdikAntarIjazahForm
- [ ] BpbdLaporBanjirForm.tsx: toggle EWS vs Bantuan + GPS + multi-select
- [ ] Form gap Phase 2: DukcapilAntarKtp (kecamatanAsal), Satpol PP (kondisional izin acara)

### P3 — LOW (Backlog)
- [ ] Diskominfo: Forward ke dinas lain + SLA countdown
- [ ] DLH: Eco Points calculator + batch dispatch
- [ ] Dispusip: H-3/H-1 reminder alert
- [ ] Satpol PP: Tab izin keramaian
- [ ] Dinkes: "Obat Disiapkan Farmasi" flag sebelum dispatch driver
