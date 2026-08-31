# Status Flow & Business Rules — Layanan Pemerintahan Ride-Solo

> Panduan alur status order dan aturan bisnis per kategori dinas.

---

## Alur Status Universal

```
Customer Mengajukan Form
        ↓
status: "pending_verification"
  [Masuk ke Workspace Dinas terkait]
  [Petugas OPD melihat di tab "Triage"]
        ↓
  Petugas memverifikasi (cek NIK, dokumen, eligibilitas)
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
  [Trigger: award poin/eco points ke customer jika applicable]
```

---

## Aturan Bisnis Per Kategori

### Kategori DARURAT (Damkar, BPBD, DP3A)

```typescript
const EMERGENCY_RULES = {
  skipVerification: true,           // Tidak perlu verifikasi OPD — langsung dispatch!
  maxResponseTimeMinutes: 5,        // SLA maksimal 5 menit dari submit ke dispatch driver
  priorityLevel: "URGENT",
  audioAlertRequired: true,         // Workspace OPD WAJIB ada audio alert
  autoDispatch: true,               // Pertimbangkan auto-dispatch tanpa klik manual
  statusFlow: [
    "pending",                      // SKIP pending_verification!
    "accepted",
    "in_progress",
    "completed"
  ]
};

// Implementasi di service layer:
// Jika serviceType === "damkar_panic_button" || jenisDarurat === emergency
// → set status langsung ke "pending" bukan "pending_verification"
// → trigger playOrderAlertSound() di semua workspace Damkar yang aktif
```

---

### Kategori DELIVERY/DOKUMEN (Dukcapil, Disdik, Dispusip, Disnaker)

```typescript
const DELIVERY_RULES = {
  requireOTPHandover: true,         // Wajib OTP saat serah terima fisik dokumen
  otpGeneratedAt: "dispatch",       // OTP dibuat saat status → "pending"
  otpLength: 6,
  otpExpiryMinutes: 60,
  documentChainOfCustody: true,     // Log siapa menerima dokumen
  statusFlow: [
    "pending_verification",
    "pending",
    "accepted",
    "in_progress",
    "completed"
  ]
};
```

---

### Kategori FARMASI/MEDIS (Dinkes)

```typescript
const MEDICAL_RULES = {
  requirePharmacyVerification: true, // Petugas farmasi harus konfirmasi "Obat Sudah Disiapkan"
  coldChainAlert: false,             // Saat ini belum perlu (kecuali nanti ada vaksin)
  sealedPackageConfirm: true,        // Driver harus konfirmasi paket tersegel
  patientPrivacy: "medium",          // Jenis obat bisa disembunyikan dari driver
  emergencyPriority: "damkar_panic_button" === false, // Bukan emergency, tapi perlu tepat waktu
  statusFlow: [
    "pending_verification",          // Petugas farmasi verifikasi resep
    "pending",                       // Obat siap, dispatch driver
    "accepted",
    "in_progress",
    "completed"
  ]
};
```

---

### Kategori BANTUAN SOSIAL (Dinsos)

```typescript
const BANTUAN_SOSIAL_RULES = {
  eligibilityCheck: true,            // Verifikasi database PKH/DTKS sebelum dispatch
  freeForEligible: true,             // Biaya Rp 0 untuk penerima yang eligible
  maxAttemptsIfNotHome: 2,           // Driver bisa coba 2x jika tidak ada yang di rumah
  subsidi100persen: true,            // Seluruh ongkir disubsidi APBD untuk ojek difabel
  requireSocialWorkerApproval: false,// Petugas dinas langsung approve, tidak perlu peksos
};
```

---

### Kategori PENGADUAN/LAPORAN (Dishub, DLH lapor pohon, Diskominfo, Satpol PP)

```typescript
const LAPORAN_RULES = {
  noDriverRequired: true,            // Beberapa layanan laporan tidak butuh driver fisik!
  // Jika laporan → dispatch driver hanya untuk yang butuh aksi fisik (jemput sampah, dll)
  // Jika hanya laporan digital → tidak butuh driver, langsung ke OPD
  
  slaResponseHours: 24,              // SLA respons 24 jam
  autoTicketGenerate: true,          // Generate nomor tiket otomatis
  statusFlow: [
    "pending_verification",          // OPD menerima laporan
    "in_progress",                   // Sedang ditindaklanjuti (skip "pending" & "accepted" jika no driver)
    "completed"
  ]
};
```

---

### Kategori TRANSAKSIONAL (Bapenda)

```typescript
const TRANSAKSIONAL_RULES = {
  paymentGatewayRequired: true,      // Butuh integrasi payment (QRIS/wallet)
  receiptRequired: true,             // Generate bukti bayar PDF/digital
  realTimeLedger: true,              // Catat langsung ke ledger kas daerah (integrasi eksternal)
  // Untuk PBB: setelah payment confirmed → status langsung "completed"
  // Tidak perlu driver untuk layanan pure digital payment
  noDriverForDigitalPayment: true,
};
```

---

### Kategori BOOKING/RESERVASI (Dispar, Dispertan)

```typescript
const BOOKING_RULES = {
  calendarSlot: true,                // Harus cek ketersediaan slot terlebih dahulu
  confirmationRequired: true,        // OPD konfirmasi booking sebelum dispatch driver
  reminderH1: true,                  // Kirim reminder WA H-1 sebelum jadwal
  statusFlow: [
    "pending_verification",          // OPD cek ketersediaan & konfirmasi
    "pending",                       // Booking dikonfirmasi, tunggu hari H
    "accepted",                      // Driver/petugas accept (jika butuh driver)
    "in_progress",                   // Layanan sedang berlangsung
    "completed"
  ]
};
```

---

### Khusus: DLH Bank Sampah — Eco Points Flow

```typescript
// Setelah driver menimbang dan mengkonfirmasi:
const ecoPointsPerKg: Record<JenisSampah, number> = {
  kardus: 200,      // 1 kg kardus = 200 poin
  plastik: 150,
  besi: 500,
  kaca: 100,
  jelantah: 300,
  kertas: 150
};

// Di GovDlhWorkspace, petugas input berat aktual:
// → Trigger: updateDoc order (beratAktualKg, ecoPointsAwarded)
// → Trigger: increment user.points di Firestore (gunakan increment())
// → Trigger: update status → "completed"
```

---

### Khusus: DP3A — Anonymization Rules

```typescript
// Saat customer submit dengan isAnonymous = true:
const handleAnonymousSubmit = (data: Dp3aFormFields) => {
  const anonymousCode = `Pemohon-${Math.floor(Math.random() * 9000) + 1000}`;
  
  return {
    ...data,
    customerName: anonymousCode,     // Override nama asli
    customerPhone: "RAHASIA",        // Override nomor WA
    // PENTING: Nomor WA asli disimpan di server-side Cloud Function saja
    // tidak di Firestore client-readable document
  };
};

// Di GovDp3aWorkspace — petugas OPD TIDAK bisa melihat:
// - Nama asli korban (tampilkan kode)
// - Nomor WA (tampilkan: "Hubungi via kanal aman internal")
// - Detail kasus (hanya kategori)
// Kecuali: petugas verify diri dengan PIN khusus dan ada audit log
```

---

## Aturan Insentif & Reward

| Layanan | Customer dapat apa? | Driver dapat apa? |
|---------|--------------------|--------------------|
| DLH Bank Sampah | Eco Points (konversi ke saldo koperasi) | Poin stamp biasa |
| Bapenda PBB Tepat Waktu | Stamp poin loyalitas wajib pajak | - |
| Dinkes Prolanis | Ongkir disubsidi Dinkes | Karcis harian terhitung |
| Dinsos Ojek Difabel | Gratis 100% | Bayar dari subsidi APBD |
| Dispar Heritage Tour | Cashback poin jika via Ride-Solo | Tarif premium |
| Dukcapil Antar Dokumen | Subsidi Rp 10.000 | Karcis harian terhitung |

---

## Firestore Rules untuk Layanan OPD

Tambahkan ke `firestore.rules`:

```
// Government orders — OPD staff bisa update status
match /orders/{orderId} {
  allow read: if request.auth != null && (
    resource.data.customerId == request.auth.uid ||
    resource.data.driverId == request.auth.uid ||
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "government" ||
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin"
  );
  
  allow update: if request.auth != null && (
    // Driver bisa update status order-nya sendiri
    (resource.data.driverId == request.auth.uid && 
     request.resource.data.diff(resource.data).affectedKeys().hasOnly(['status', 'updatedAt', 'completedAt'])) ||
    // OPD staff bisa update order sesuai additionalRole-nya
    (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.additionalRole == resource.data.additionalRole &&
     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "government") ||
    // Admin bisa update semua
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin"
  );
}
```
