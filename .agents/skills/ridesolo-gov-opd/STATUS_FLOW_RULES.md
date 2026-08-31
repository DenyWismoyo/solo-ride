# Status Flow & Business Rules — Layanan Pemerintahan Ride-Solo

> Panduan alur status order dan aturan bisnis per kategori dinas.
> Diperbarui Phase 2: Emergency bypass, multi-select handling, dan OTP rules.

---

## Alur Status Universal

```
Customer Mengajukan Form via /services/gov/[id]/[serviceId]
        ↓
status: "pending_verification"   ← NORMAL FLOW (mayoritas dinas)
  [Masuk ke workspace dinas di /gov sebagai admin]
  [Petugas OPD melihat di tab "Triage"]
        ↓
  Petugas verifikasi (cek NIK, dokumen, eligibilitas)
        ↓ (jika ditolak → status: "rejected")
status: "pending"
  [Terdispatch ke Radar Driver Mitra]
  [Driver bisa melihat dan menerima order]
        ↓
status: "accepted"
  [Driver mengkonfirmasi penerimaan]
        ↓
status: "in_progress"
  [Driver menuju lokasi pickup atau langsung ke customer]
        ↓ (serah terima + OTP jika berlaku)
status: "completed"
  [Tercatat di Audit Log]
  [Trigger: award eco points ke customer jika DLH]
```

---

## Aturan Bisnis Per Kategori

---

### Kategori DARURAT (Damkar, BPBD) — Emergency Skip!

> ⚠️ **Phase 2 Priority P1** — Belum diimplementasikan di codebase saat ini!

```typescript
// PENTING: Emergency services HARUS skip "pending_verification"
// Implementasi di useCivicOrder.ts atau langsung di form submit

const EMERGENCY_SERVICE_KEYWORDS = ["damkar", "bpbd"] as const;

const isEmergencyService = (serviceType: string): boolean =>
  EMERGENCY_SERVICE_KEYWORDS.some(kw => serviceType.includes(kw));

// Di submitOrder (useCivicOrder atau di form):
const initialStatus = isEmergencyService(serviceId)
  ? "pending"              // Langsung masuk radar driver! (skip verifikasi OPD)
  : "pending_verification"; // Normal flow

// SLA emergency: max 5 menit dari submit ke driver accept
// Workspace Damkar: audio alert wajib saat status "pending" masuk
// Workspace BPBD: badge elapsed time, merah jika > 5 menit

const EMERGENCY_RULES = {
  skipVerification: true,
  maxResponseTimeMinutes: 5,
  priorityLevel: "URGENT",
  audioAlertRequired: true,    // Damkar workspace
  statusFlow: [
    "pending",                 // SKIP pending_verification!
    "accepted",
    "in_progress",
    "completed"
  ]
};
```

---

### Kategori PRIVASI-FIRST (DP3A) — Anonim Mode

> ⚠️ **Phase 2 Priority P1** — Belum diimplementasikan di codebase saat ini!

```typescript
// DP3A TIDAK perlu skip verifikasi, tapi WAJIB anonim mode
// Alur status: normal (pending_verification → pending → ...)

const DP3A_RULES = {
  requiresAnonymousOption: true,    // Toggle wajib ada di form (default: aktif)
  dataRetentionDays: 365,           // Data kasus simpan 1 tahun
  privacyLevel: "HIGH",
  statusFlow: [
    "pending_verification",         // Petugas verifikasi kategori kasus
    "pending",                      // Dispatch pendamping/psikolog
    "accepted",
    "in_progress",
    "completed"
  ],
  workspaceMask: true              // Semua identitas masked di workspace
};

// Implementasi mode anonim di Dp3aSapa129Form:
// isAnonymous default = true
// reporterName = isAnonymous ? `Pemohon-${randomCode}` : namaAsli
// Di workspace: tampilkan kode kasus, bukan nama asli
```

---

### Kategori DELIVERY/DOKUMEN (Dukcapil, Disdik, Dispusip, Disnaker)

```typescript
const DELIVERY_RULES = {
  requireOTPHandover: true,         // Wajib OTP saat serah terima fisik dokumen
  otpGeneratedAt: "submit",         // OTP dibuat saat customer submit form
  otpLength: 6,
  otpExpiryMinutes: 120,            // 2 jam (cukup untuk driver ambil + antar)
  documentChainOfCustody: true,     // Log siapa menerima dokumen
  statusFlow: [
    "pending_verification",
    "pending",
    "accepted",
    "in_progress",
    "completed"                     // Setelah OTP dikonfirmasi driver
  ]
};

// Cara menggunakan OTP di form submit:
// await submitOrder({ ... }, { requiresOtp: true });
// useCivicOrder akan generate OTP dan return otpCode via onSuccess(orderId, otpCode)

// Di /services/gov/[id]/[serviceId]/page.tsx:
// onSuccess={(orderId, otpCode) => {
//   if (otpCode) showOTPConfirmation(otpCode); // Tampilkan ke customer
// }}
```

---

### Kategori FARMASI/MEDIS (Dinkes)

```typescript
const MEDICAL_RULES = {
  requirePharmacyVerification: true, // Petugas farmasi konfirmasi "Obat Sudah Disiapkan"
  sealedPackageConfirm: true,        // Driver konfirmasi paket tersegel
  patientPrivacy: "medium",          // Jenis obat bisa disembunyikan dari driver
  statusFlow: [
    "pending_verification",          // Petugas farmasi verifikasi resep + siapkan obat
    "pending",                       // Obat siap → dispatch driver
    "accepted",
    "in_progress",
    "completed"
  ]
};

// Donor darah (dinkes_donor_darah): treat seperti semi-emergency
// Pertimbangkan status awal "pending" untuk donor darah PMI
```

---

### Kategori BANTUAN SOSIAL (Dinsos)

```typescript
const SOCIAL_RULES = {
  requireEligibilityVerification: true, // Petugas cek DTKS/PKH database
  subsidyType: "100_percent_apbd",
  statusFlow: [
    "pending_verification",  // Petugas verifikasi kelayakan (cek PKH, DTKS)
    "pending",               // Lolos verifikasi → dispatch driver
    "accepted",
    "in_progress",
    "completed"
  ]
};
```

---

### Kategori PENGADUAN/LAPORAN (Dishub, DLH, Diskominfo, Satpol PP)

```typescript
const REPORTING_RULES = {
  slaHours: 24,                     // Diskominfo ULAS: max 1x24 jam response
  requiresPhysicalDispatch: false,  // Laporan tidak perlu kurir (kecuali DLH jemput sampah)
  evidencePhotoOptional: true,
  statusFlow: {
    laporan_only: [
      "pending_verification",        // Petugas terima dan kategorikan laporan
      "in_progress",                 // Sedang ditindaklanjuti
      "completed"                    // Sudah selesai/ditangani
    ],
    jemput_fisik: [                  // DLH jemput sampah, Dispertan homecare
      "pending_verification",
      "pending",                     // Dispatch driver/petugas lapangan
      "accepted",
      "in_progress",
      "completed"
    ]
  }
};
```

---

### Kategori TRANSAKSIONAL/PAJAK (Bapenda)

```typescript
const PAYMENT_RULES = {
  requireReceiptGeneration: true,   // Generate bukti bayar setelah completed
  paymentVerification: true,        // Konfirmasi pembayaran sebelum completed
  statusFlow: [
    "pending_verification",          // Petugas validasi NOP/data pajak
    "pending",                       // Data valid → driver antar bukti/SPPT
    "accepted",
    "in_progress",
    "completed"
  ]
};
```

---

### Kategori BOOKING/RESERVASI (Dispar, Dispertan)

```typescript
const BOOKING_RULES = {
  requireCalendarConfirmation: true, // Petugas konfirmasi ketersediaan slot
  reminderNotification: true,        // Kirim reminder H-1 via WA (Phase 3)
  statusFlow: [
    "pending_verification",           // Petugas cek ketersediaan slot
    "pending",                        // Slot tersedia → konfirmasi ke customer
    "accepted",
    "in_progress",
    "completed"
  ]
};
```

---

### Kategori USAHA/LEGALITAS (Diskop, DPMPTSP)

```typescript
const BUSINESS_RULES = {
  requireDocumentVerification: true, // Verifikasi dokumen pendukung
  ocrOptional: true,                 // OCR NIB/izin (Phase 3)
  statusFlow: [
    "pending_verification",           // Petugas verifikasi data usaha + dokumen
    "pending",                        // Lolos → dispatch (antar SK/dokumen)
    "accepted",
    "in_progress",
    "completed"
  ]
};
```

---

## Eco Points System (DLH — Phase 2)

```typescript
// Setelah DLH memverifikasi berat sampah aktual:
const ECO_POINTS_PER_KG: Record<string, number> = {
  kardus: 200,    // Rp/kg dikonversi ke poin (1 poin ≈ Rp 1)
  plastik: 150,
  besi: 500,
  kaca: 100,
  jelantah: 300,
  kertas: 150
};

// Di DlhWorkspace — setelah petugas input berat aktual:
const awardEcoPoints = async (orderId: string, customerId: string, jenisSampah: string[], beratKg: number) => {
  const ratePerKg = ECO_POINTS_PER_KG[jenisSampah[0]] || 100; // Ambil rate dari jenis utama
  const pointsEarned = Math.floor(beratKg * ratePerKg);

  // Update order → completed
  await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
    status: "completed",
    ecoPointsAwarded: pointsEarned,
    updatedAt: serverTimestamp()
  });

  // Increment points customer
  await updateDoc(doc(db, "users", customerId), {
    points: increment(pointsEarned)
  });
};
// PENTING: import { increment } from "firebase/firestore"
```

---

## OTP Serah Terima — Cara Kerja

```typescript
// Di form submit (requiresOtp: true):
// useCivicOrder akan:
// 1. Generate OTP 6 digit: Math.floor(100000 + Math.random() * 900000).toString()
// 2. Simpan otpCode di citizenDetails.otpCode
// 3. Return otpCode via onSuccess(orderId, otpCode)

// Di page.tsx setelah onSuccess:
const [otpToShow, setOtpToShow] = useState<string | null>(null);
// onSuccess={(orderId, otpCode) => {
//   if (otpCode) setOtpToShow(otpCode);
// }}

// Tampilkan OTP ke customer di UI (besar, bold, copy-to-clipboard)
// Customer tunjukkan OTP ke driver saat serah terima dokumen

// Driver konfirmasi di app driver (Phase 3 — belum ada UI driver konfirmasi OTP)
// Sementara: driver input OTP di workspace admin
```

---

## Rejection Flow

```typescript
// Jika petugas menolak permohonan:
// 1. Tampilkan modal/dialog input alasan penolakan
// 2. Update Firestore:
await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
  status: "rejected",
  rejectionReason: "Alasan yang jelas untuk customer", // Wajib ada!
  rejectedByDinasAt: serverTimestamp(),
  updatedAt: serverTimestamp()
});
// 3. Customer akan melihat status "rejected" di order tracking

// ⚠️ Phase 2 Gap: Workspace saat ini kebanyakan belum punya tombol "Tolak"
// Semua workspace perlu ditambahkan aksi reject dengan input alasan
```

---

## Status Label untuk UI Customer

```typescript
const STATUS_LABELS: Record<string, { label: string; color: string; desc: string }> = {
  pending_verification: {
    label: "Diverifikasi Dinas",
    color: "amber",
    desc: "Petugas dinas sedang memverifikasi permohonan Anda"
  },
  pending: {
    label: "Mencari Kurir",
    color: "blue",
    desc: "Permohonan disetujui, sedang mencari kurir mitra terdekat"
  },
  accepted: {
    label: "Kurir Ditugaskan",
    color: "teal",
    desc: "Kurir mitra telah menerima dan dalam perjalanan"
  },
  in_progress: {
    label: "Sedang Berjalan",
    color: "emerald",
    desc: "Kurir sedang melaksanakan layanan Anda"
  },
  completed: {
    label: "Selesai",
    color: "emerald",
    desc: "Layanan berhasil diselesaikan"
  },
  rejected: {
    label: "Ditolak",
    color: "rose",
    desc: "Permohonan ditolak oleh dinas terkait"
  },
  cancelled: {
    label: "Dibatalkan",
    color: "neutral",
    desc: "Permohonan dibatalkan"
  }
};
```
