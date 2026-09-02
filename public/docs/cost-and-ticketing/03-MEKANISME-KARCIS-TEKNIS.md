# 🎫 MEKANISME KARCIS HARIAN — DOKUMENTASI TEKNIS LENGKAP
## Formula, Lifecycle, Skenario, dan Audit Trail
### *Cost & Ticketing Series · Dokumen 3 dari 7*

---

> Dokumen ini adalah **spesifikasi teknis-bisnis** dari sistem karcis harian Ride-Solo yang menggantikan model komisi per-trip. Mencakup formula, lifecycle driver, edge cases, dan mekanisme audit yang transparan.

---

## FILOSOFI: BUKAN KOMISI, TAPI IURAN KOPERASI

```
MODEL KOMISI (Platform Asing):
  Setiap trip → Platform potong 25% → Driver dapat sisanya
  Semakin keras driver bekerja → Semakin banyak yang dipotong
  Model ini mengekstrak nilai dari kerja keras driver.

MODEL KARCIS (Ride-Solo):
  Driver bekerja bebas → Semua trip masuk kantong driver (100%)
  Malam hari → Sistem hitung berapa jam driver aktif hari ini
  Sistem tagih karcis flat sesuai durasi aktif
  Semakin rajin driver → Karcis semakin murah (bahkan gratis!)
  Model ini menghargai keaktifan driver.
```

---

## FORMULA KARCIS HARIAN — VERSI RESMI

### Algoritma Tengah Malam (00:00 WIB — Scheduled Cloud Function)

```typescript
// src/functions/midnight-karcis-calculator.ts
// Dijalankan otomatis pukul 00:00 WIB setiap hari

async function calculateDailyKarcis(driverId: string): Promise<void> {
  const today = getCurrentDateSolo(); // Timezone: Asia/Jakarta
  const minutesOnline = await getDriverOnlineMinutes(driverId, today);

  let karcisAmount: number;
  let karcisStatus: KarcisStatus;
  let notes: string;

  if (minutesOnline === 0) {
    // Tidak online sama sekali hari ini
    karcisAmount = 0;
    karcisStatus = "not_applicable";
    notes = "Driver tidak online hari ini — tidak ada karcis.";

  } else if (minutesOnline >= 360) {
    // Online ≥ 6 jam → GRATIS sebagai reward aktif
    karcisAmount = 0;
    karcisStatus = "free_active_driver";
    notes = `Driver aktif ${Math.floor(minutesOnline/60)} jam ${minutesOnline%60} mnt — karcis GRATIS.`;
    // Koperasi tetap mencatat subsidi Rp 15.000 sebagai "karcis virtual" untuk SHU
    await recordVirtualKarcisForSHU(driverId, 15000);

  } else if (minutesOnline >= 240) {
    // Online 4–6 jam → Tarif setengah hari
    karcisAmount = 7500;
    karcisStatus = "partial_day";
    notes = `Driver aktif ${Math.floor(minutesOnline/60)} jam — tarif setengah hari.`;

  } else {
    // Online < 4 jam → Tarif penuh
    karcisAmount = 15000;
    karcisStatus = "full_rate";
    notes = `Driver aktif ${minutesOnline} menit — tarif penuh.`;
  }

  // Potong dari Dompet Driver
  if (karcisAmount > 0) {
    await deductFromDriverWallet(driverId, karcisAmount);
  }

  // Catat di ledger driver
  await recordDailyLedger(driverId, {
    date: today,
    minutesOnline,
    karcisAmount,
    karcisStatus,
    notes,
    timestamp: serverTimestamp()
  });
}
```

### Tabel Tarif Karcis (Ringkasan)

| Durasi Online | Tarif Karcis | Status | Keterangan |
|--------------|-------------|--------|------------|
| 0 menit | **Rp 0** | `not_applicable` | Tidak kerja, tidak bayar |
| 1–239 menit (< 4 jam) | **Rp 15.000** | `full_rate` | Tarif penuh |
| 240–359 menit (4–6 jam) | **Rp 7.500** | `partial_day` | Diskon 50% |
| ≥ 360 menit (≥ 6 jam) | **Rp 0** | `free_active_driver` | GRATIS — reward aktif |

### Tarif Khusus (Override BizConfig)

| Kondisi | Override Tarif | Keterangan |
|---------|---------------|------------|
| Hari Raya Lebaran / Natal | Rp 0 untuk semua | Kebijakan koperasi |
| Driver mendapat rating 5.0 (7 hari berturut) | Rp 0 (bonus) | Achievement reward |
| Cuaca ekstrem terverifikasi (BMKG) | Rp 0 otomatis | Force majeure |
| Driver sakit (input manual admin) | Rp 0 + ditunda | Kebijakan sosial |
| Driver baru (30 hari pertama) | Rp 0 | Masa orientasi |

---

## LIFECYCLE DOMPET DRIVER

### Struktur Dompet Digital

```
DRIVER WALLET (Firestore: wallets/{driverId}):
  ┌─────────────────────────────────────────────────┐
  │ saldo: number          → Saldo utama (Rp)        │
  │ totalKarcisMonth: number → Total karcis bulan ini │
  │ totalTripsMonth: number  → Jumlah trip bulan ini  │
  │ totalIncomeMonth: number → Total pendapatan trip  │
  │ karcisStatus: KarcisStatus → Status karcis hari ini│
  │ isOnline: boolean      → Status GPS live          │
  │ lastKarcisDate: Date   → Karcis terakhir dibayar  │
  └─────────────────────────────────────────────────┘
```

### Lifecycle Lengkap (Sehari Driver Bekerja)

```
07:00 WIB — Driver tekan "Mulai Shift" di app
  → Firestore: drivers/{id}.isOnline = true
  → GPS broadcast dimulai (setiap 30 detik)
  → Sistem mulai hitung menit online

09:30 WIB — Order masuk ke Radar Driver
  → Notifikasi push + suara alert
  → Driver terima → Status "accepted"
  → Trip dimulai

10:15 WIB — Trip selesai
  → Biaya Rp 22.000 langsung masuk Dompet Driver
  → Drivers/{id}.saldo += 22.000
  → wallets/{id}.totalIncomeMonth += 22.000
  → Trip ke-3 hari ini

[...driver lanjut kerja hingga 14:30 WIB...]

14:30 WIB — Driver tekan "Akhiri Shift"
  → isOnline = false
  → Total online hari ini: 450 menit (7.5 jam) ✓ melebihi 6 jam!

00:00 WIB (keesokan hari) — Midnight Calculator Berjalan
  → Baca: minutesOnline = 450 → ≥ 360 jam
  → Karcis = Rp 0 (GRATIS — reward driver rajin)
  → Catat ledger: {date, menit: 450, karcis: 0, status: "free_active_driver"}
  → Koperasi catat virtual karcis Rp 15.000 untuk pool SHU
  → Driver tidak kehilangan uang sepeser pun hari ini
```

### Skenario Masalah & Penanganan

**Skenario A: Dompet Driver Kurang Saldo**
```
Kondisi: Karcis Rp 15.000 tapi saldo driver hanya Rp 8.000

Penanganan:
  1. Potong semua saldo yang ada (Rp 8.000)
  2. Sisakan hutang karcis: Rp 7.000 → field karcisDebt
  3. Driver masih bisa online besok (tidak di-suspend otomatis)
  4. Hutang karcis akan dipotong dari pendapatan trip pertama besok
  5. Notifikasi: "Anda memiliki hutang karcis Rp 7.000 — akan dipotong dari trip berikutnya"
  6. Jika hutang > 3 hari berturut-turut → Admin dihubungi untuk mediasi

Perbedaan dengan Gojek: Driver TIDAK di-suspend. Mekanisme koperasi lebih manusiawi.
```

**Skenario B: GPS Error / Internet Terputus**
```
Kondisi: Driver online tapi GPS drop selama 2 jam

Penanganan:
  1. Sistem tandai gap GPS dengan flag "gps_gap"
  2. Menit dalam gap GPS: diabaikan dari hitungan online (konservatif)
  3. Driver bisa ajukan dispute via app dalam 24 jam
  4. Admin verifikasi log trip vs gap GPS
  5. Jika trip ada dalam gap → menit dihitung (trip = bukti online)
```

**Skenario C: Driver Tidak Isi Saldo (Dompet Kosong)**
```
Kondisi: Saldo = 0, karcis = Rp 15.000

Penanganan:
  1. Akumulasi hutang karcis maksimal 7 hari
  2. Hari ke-8 tanpa topup → muncul "Soft Warning" di app
  3. Hari ke-14 → "Account Review" — Admin koperasi menghubungi
  4. TIDAK ada suspend otomatis
  5. Mekanisme cicil hutang karcis via potongan trip tersedia
```

---

## MEKANISME TOPUP DOMPET DRIVER

### Metode Topup yang Tersedia

| Metode | Biaya Admin | Waktu Masuk | Batas |
|--------|------------|-------------|-------|
| Transfer Bank (BRI/BCA/Mandiri) | Rp 0 | 1–5 menit (via va) | Min Rp 20.000 |
| QRIS (Scan via app) | Rp 0 | Realtime | Min Rp 20.000 |
| Top-up via agen koperasi | Rp 0 | Realtime | Min Rp 20.000 |
| Potong dari pendapatan trip | Rp 0 | Per-trip otomatis | — |

> **Fitur "Auto Topup":** Driver bisa set ambang batas minimum saldo (mis. Rp 50.000). Jika saldo turun di bawah batas, topup otomatis dari rekening bank yang didaftarkan.

---

## MEKANISME SHU KOPERASI — DISTRIBUSI AKHIR TAHUN

### Formula Distribusi SHU

```
POOL SHU KOPERASI (per tahun):
  = Total karcis terkumpul dari semua driver
  + Virtual karcis (untuk driver >6 jam yang gratis)
  - Biaya operasional platform (server, tim, dll.)
  - Cadangan darurat koperasi (10% dari pool)

POOL SHU BERSIH → dibagi:
  70% → BAGIAN DRIVER
  30% → CADANGAN + REINVESTASI STP

BAGIAN DRIVER → dibagi proporsional per driver:
  Bobot_i = (TripCount_i / TotalTripAll) × 0.5
           + (ActiveDays_i / TotalDays) × 0.3
           + (AvgRating_i / 5.0) × 0.2
           
  SHU_driver_i = (Bobot_i / Σ semua Bobot) × Total Bagian Driver
```

### Contoh Kalkulasi SHU Nyata (50 Driver, Tahun 1)

```
Pool Karcis Terkumpul Tahun 1:
  50 driver × Rp 7.500 avg × 250 hari aktif = Rp 93.750.000

Biaya Operasional Tahun 1:
  Infrastruktur                     : Rp 150.000
  Tim STP (proporsional)            : Rp 60.000.000
  Marketing & Operational           : Rp 12.000.000
  Cadangan darurat (10%)            : Rp 9.375.000
  ─────────────────────────────────────────────────
  Total biaya: Rp 81.525.000

SHU Kotor: Rp 93.750.000 - Rp 81.525.000 = Rp 12.225.000

Bagian Driver (70%): Rp 8.557.500 → dibagi 50 driver
Rata-rata SHU per driver: Rp 171.150 (bonus tahunan)

(Catatan: Tahun 1 memang kecil karena skala kecil. Tahun 3 dengan 500 driver:
  Pool: Rp 937.500.000 → SHU Driver: ≈ Rp 200.000.000 → per driver ≈ Rp 400.000/tahun)
```

---

## AUDIT TRAIL & TRANSPARANSI

### Firestore Sub-Collection Ledger

```
wallets/{driverId}/ledger/{entryId}:
  date: "2026-09-02"
  type: "karcis_deducted" | "karcis_free" | "trip_income" | "topup" | "shu_bonus"
  amount: number (negatif untuk debit)
  balance_before: number
  balance_after: number
  minutesOnline: number (untuk karcis)
  karcisStatus: KarcisStatus
  notes: string
  createdAt: Timestamp
  createdBy: "system_midnight" | "admin" | "driver"
```

### Akses Transparansi

```
DRIVER:
  → Lihat ledger harian di tab "Income & Dompet"
  → Detail setiap karcis, topup, dan pendapatan trip
  → Export PDF ledger bulanan untuk pajak

KOPERASI / ADMIN STP:
  → Dashboard agregat: total karcis terkumpul per hari
  → Distribusi karcis per tier (gratis / setengah / penuh)
  → Pool SHU realtime

PEMKOT (via Civic Dashboard):
  → Statistik agregat karcis (anonim) per kelurahan
  → Jumlah driver aktif per hari (untuk perencanaan transportasi)
  → Tidak ada akses ke data keuangan individual driver
```

---

## PERBANDINGAN: KARCIS vs MODEL KOMISI

| Aspek | Komisi (Gojek/Grab) | Karcis (Ride-Solo) |
|-------|--------------------|--------------------|
| **Biaya per trip** | 20–30% dari nilai trip | Rp 0 |
| **Driver dapat** | 70–80% dari nilai trip | 100% dari nilai trip |
| **Semakin rajin** | Semakin banyak dipotong | Karcis semakin murah (gratis >6 jam) |
| **Hari libur** | Tetap dipotong | Karcis reduksi / gratis kebijakan koperasi |
| **Tidak kerja** | Tidak dipotong | Tidak dipotong (Rp 0) |
| **Suspend akun** | Kapanpun tanpa alasan | Hanya via mekanisme koperasi |
| **Transparansi** | Black box algoritma | Ledger terbuka untuk driver |
| **Bonus tahunan** | Tidak ada | SHU Koperasi |
| **Ketika sakit** | Tetap dipotong bonus/insentif | Admin koperasi bisa beri keringanan |

---

*Ride-Solo Cost & Ticketing Series · Dokumen 3/7 · Solo Technopark · September 2026*
