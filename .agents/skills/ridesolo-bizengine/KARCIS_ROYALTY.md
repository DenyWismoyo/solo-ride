# KARCIS_ROYALTY.md — Sistem Karcis Harian Driver & SHU Koperasi

> Model ekonomi karcis harian adalah jantung dari Zero-Commission Ride-Solo.
> Ini adalah differentiator utama yang membuat driver lebih sejahtera.

---

## Filosofi Zero-Commission

```
Gojek/Grab:  Driver trip Rp 25.000 → Driver dapat Rp 18.750 (dipotong 25%)
Ride-Solo:   Driver trip Rp 25.000 → Driver dapat Rp 25.000 (100%)
             Driver hanya bayar karcis harian Rp 15.000 (flat, bukan per-trip)

Break-Even Driver Ride-Solo:
  Karcis = Rp 15.000/hari
  Jika 1 trip minimum Rp 10.000 → break-even di trip ke-2
  Setelah trip ke-2 → 100% keuntungan tanpa potongan
```

---

## 1. Sistem Karcis Harian

### Konstanta Karcis

```
KARCIS_HARIAN           = Rp 15.000  // Biaya keanggotaan harian driver
KARCIS_GRATIS_THRESHOLD = 360 menit  // Online ≥ 6 jam → karcis GRATIS hari itu
KARCIS_DISKON_4JAM      = 50%        // Online 4–5:59 jam → diskon 50% (Rp 7.500)
KARCIS_LIBUR            = false      // Tidak ada karcis jika tidak online sama sekali
KARCIS_MAX_TUNGGAK      = 3 hari     // Driver diblokir jika menunggak > 3 hari
```

### Formula Karcis Harian

```
if (jam_online_hari_ini >= 6 jam):
  karcis = Rp 0  ← GRATIS (insentif driver rajin)
elif (jam_online_hari_ini >= 4 jam):
  karcis = Rp 7.500  ← Diskon 50% (setengah hari)
elif (jam_online_hari_ini > 0 jam):
  karcis = Rp 15.000  ← Tarif penuh (kurang dari 4 jam)
else:
  karcis = Rp 0  ← Tidak online, tidak kena karcis (adil)
```

### Firestore Schema: `driverLedger/{driverId}/daily/{YYYY-MM-DD}`

```typescript
interface DriverDailyLedger {
  date: string;            // "2026-08-28"
  driverId: string;
  onlineMinutes: number;   // Total menit online hari ini
  karcisAmount: number;    // Karcis yang dibebankan (0 jika gratis)
  karcisStatus: "gratis" | "diskon50" | "penuh" | "tidak_online";
  tripCount: number;       // Jumlah trip selesai
  grossRevenue: number;    // Total pendapatan kotor hari ini
  netRevenue: number;      // Gross - karcis
  points: number;          // Poin yang didapat hari ini
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Scheduled Function: Reset Karcis Tengah Malam

```typescript
// functions/src/scheduled/karcis.schedule.ts
export const resetDailyKarcis = onSchedule(
  { schedule: "0 17 * * *", timeZone: "UTC", region: "asia-southeast1" },
  // ↑ 17:00 UTC = 00:00 WIB
  async () => {
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    // Ambil semua driver yang online kemarin
    const snap = await db.collection("driverLedger")
      .where("date", "==", yesterday)
      .get();

    const batch = db.batch();
    snap.forEach((doc) => {
      const data = doc.data() as DriverDailyLedger;
      let karcisAmount = 15000;
      let karcisStatus: string = "penuh";

      if (data.onlineMinutes === 0) {
        karcisAmount = 0;
        karcisStatus = "tidak_online";
      } else if (data.onlineMinutes >= 360) {
        karcisAmount = 0;
        karcisStatus = "gratis";
      } else if (data.onlineMinutes >= 240) {
        karcisAmount = 7500;
        karcisStatus = "diskon50";
      }

      // Update ledger kemarin dengan karcis final
      batch.update(doc.ref, { karcisAmount, karcisStatus });

      // Potong dari dompet driver
      const walletRef = db.collection("driverWallet").doc(data.driverId);
      batch.update(walletRef, {
        balance: FieldValue.increment(-karcisAmount),
        lastKarcisDeduction: karcisAmount,
        lastKarcisDate: yesterday,
      });
    });

    await batch.commit();
  }
);
```

---

## 2. Dompet Driver (Digital Wallet)

```typescript
// Firestore: driverWallet/{driverId}
interface DriverWalletDocument {
  driverId: string;
  balance: number;           // Saldo saat ini (bisa negatif = hutang karcis)
  totalEarned: number;       // Total pendapatan sepanjang karir
  totalKarcis: number;       // Total karcis yang pernah dibayar
  totalKarcisGratis: number; // Total karcis yang didapat gratis (reward rajin)
  pendingWithdrawal: number; // Penarikan yang sedang diproses
  lastWithdrawalAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Aturan Dompet Driver:**
```
SALDO_MIN_NEGATIF   = -Rp 45.000   // Maks tunggak 3 hari karcis
WITHDRAWAL_MIN      = Rp 50.000    // Minimum penarikan ke rekening
WITHDRAWAL_FEE      = Rp 0         // Gratis (koperasi tanggung biaya transfer)
WITHDRAWAL_SCHEDULE = "H+1"        // Proses hari kerja berikutnya
```

---

## 3. Distribusi SHU Koperasi

SHU (Sisa Hasil Usaha) adalah pembagian keuntungan koperasi kepada anggota (driver).

### Formula Pendapatan Koperasi

```
PENDAPATAN_KOPERASI = Σ (karcis_harian × jumlah_driver_aktif) per bulan
PENGELUARAN_OPERASIONAL = biaya_server + biaya_maps_api + gaji_admin + marketing_lokal
SISA_HASIL_USAHA = PENDAPATAN_KOPERASI - PENGELUARAN_OPERASIONAL
```

### Formula Distribusi SHU ke Driver

```
// SHU dibagikan setiap akhir tahun (Desember)
// Porsi setiap driver proporsional terhadap kontribusi karcis

kontribusi_driver = (karcis_driver_1_tahun / total_karcis_koperasi_1_tahun) × 100%
SHU_driver = kontribusi_driver × (SISA_HASIL_USAHA × 70%)
             // 70% untuk anggota, 30% untuk cadangan operasional koperasi

// Contoh:
// SHU koperasi = Rp 50.000.000
// Driver A kontribusi 2% dari total karcis
// SHU Driver A = 2% × (Rp 50.000.000 × 70%) = Rp 700.000
```

### Firestore Schema: `koperasiLedger/{year}/{month}`

```typescript
interface KoperasiMonthlyLedger {
  year: number;
  month: number;
  totalDriverAktif: number;
  totalKarcisCollected: number;  // Rp
  totalKarcisGratis: number;     // Rp (subsidi koperasi untuk driver rajin)
  netKarcisRevenue: number;      // Collected - Gratis
  serverCost: number;            // Firebase, Maps API
  operationalCost: number;       // Gaji admin, marketing, dll
  netSHU: number;                // SHU bulan ini
  cumulativeAnnualSHU: number;   // SHU akumulatif tahun ini
  snapshot: Timestamp;
}
```

---

## 4. Simulasi Ekonomi Driver (Per Bulan)

### Skenario Driver Aktif (22 hari kerja, 6+ jam/hari)

```
Karcis harian       = Rp 0 (gratis karena > 6 jam)
Rata-rata trip/hari = 15 trip
Rata-rata tarif     = Rp 15.000/trip
Pendapatan kotor    = 15 trip × Rp 15.000 × 22 hari = Rp 4.950.000
Karcis dibayar      = Rp 0 (semua gratis)
Take-home bersih    = Rp 4.950.000

Vs Gojek (potongan 25%):
  Take-home         = Rp 4.950.000 × 75% = Rp 3.712.500
  Selisih           = +Rp 1.237.500/bulan untuk driver Ride-Solo
```

### Skenario Driver Part-Time (15 hari, 3 jam/hari)

```
Karcis harian       = Rp 15.000 (kurang dari 4 jam)
Rata-rata trip/hari = 6 trip
Rata-rata tarif     = Rp 12.000/trip
Pendapatan kotor    = 6 × Rp 12.000 × 15 = Rp 1.080.000
Karcis dibayar      = Rp 15.000 × 15 = Rp 225.000
Take-home bersih    = Rp 855.000

Vs Gojek (potongan 25%):
  Take-home         = Rp 1.080.000 × 75% = Rp 810.000
  Selisih           = +Rp 45.000/bulan untuk driver Ride-Solo part-time
```

---

## 5. Keanggotaan Mitra UMKM (Merchant Fee)

```
MERCHANT_FEE_TIER_1 = Rp 0/bulan      // 0–10 order pertama (trial gratis)
MERCHANT_FEE_TIER_2 = Rp 25.000/bulan // 11–100 order/bulan
MERCHANT_FEE_TIER_3 = Rp 75.000/bulan // 101–500 order/bulan
MERCHANT_FEE_TIER_4 = Rp 150.000/bulan // 500+ order/bulan

// Catatan penting:
// - TIDAK ADA potongan per transaksi (Zero Commission)
// - Fee adalah keanggotaan koperasi, bukan biaya platform
// - Merchant dapat 30% SHU dari porsi fee yang masuk koperasi UMKM
```
