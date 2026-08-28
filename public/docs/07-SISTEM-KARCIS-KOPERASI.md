# 🎫 Sistem Karcis Harian & SHU Koperasi
## Penjelasan Mendalam Model Zero Commission Ride-Solo

> Dokumen ini adalah penjelasan teknis dan konseptual dari fondasi ekonomi Ride-Solo yang membedakannya secara fundamental dari semua platform ojek online yang ada.

---

## 🧠 Mengapa Model Komisi Itu Bermasalah?

### Masalah Struktural Model Komisi

Bayangkan seorang driver bernama Pak Slamet. Ia bekerja 10 jam hari ini, mengambil 20 order, dan menghasilkan total Rp 300.000.

Di platform komisi 25%:
```
Pak Slamet kerja 10 jam:
  Pendapatan Kotor       = Rp 300.000
  Potongan Platform (25%) = -Rp 75.000
  Pendapatan Bersih       = Rp 225.000
  
  Biaya bensin           ≈ -Rp 30.000
  Biaya makan            ≈ -Rp 20.000
  ────────────────────────────────────
  Take-Home Nyata         = Rp 175.000 (untuk 10 jam kerja!)
  Per Jam                 = Rp 17.500/jam
  
  UMR Solo 2026: Rp 2.169.491/bulan ≈ Rp 13.060/jam
  (Pak Slamet masih di atas UMR, tapi tidak jauh!)
```

**Masalahnya:** Semakin keras Pak Slamet bekerja, semakin besar yang dipotong. Platform **diuntungkan** dari kerja keras driver — itu bukan kemitraan yang adil.

---

## 🎫 Model Karcis — Flat Fee yang Revolusioner

### Filosofi Karcis

Karcis Harian bukan komisi. Ini lebih mirip:
- **Sewa lapak** yang dibayar pedagang pasar setiap hari
- **Biaya keanggotaan** yang dibayar anggota gym per bulan
- **Tiket masuk** yang sama untuk semua, terlepas dari berapa banyak yang Anda beli

Bedanya dengan sewa lapak biasa: **Karcis di Ride-Solo dinamis berdasarkan keaktifan Anda.**

---

### Formula Karcis (Transparansi Penuh)

```
ALGORITMA KARCIS TENGAH MALAM (dijalankan otomatis setiap 00.00 WIB):

Baca total menit online driver hari ini dari sistem:

IF menit_online = 0:
    karcis = Rp 0          ← Tidak kerja, tidak bayar. Fair!

ELIF menit_online >= 360 (≥ 6 jam):
    karcis = Rp 0          ← GRATIS! Reward untuk driver rajin
    koperasi_subsidi += Rp 15.000 ke tabungan SHU koperasi

ELIF menit_online >= 240 (≥ 4 jam):
    karcis = Rp 7.500      ← Diskon 50% (kerja setengah hari)

ELSE (< 4 jam):
    karcis = Rp 15.000     ← Tarif penuh

→ Karcis dipotong otomatis dari Dompet Driver
```

---

### Mengapa Karcis Gratis untuk Driver >6 Jam?

Ini adalah **insentif strategis koperasi** yang menguntungkan semua pihak:

```
Driver rajin (>6 jam):
  ✅ Mendapat karcis gratis
  ✅ Mengambil lebih banyak order
  ✅ Customer mendapat lebih banyak pilihan driver
  ✅ Platform mendapat lebih banyak transaksi dan kepercayaan

Koperasi:
  ✅ Ekosistem lebih aktif → Reputasi lebih baik
  ✅ Driver puas → Retensi driver tinggi
  ✅ Tidak perlu bayar komisi → Cost rendah
  ✅ Subsidi karcis dihitung sebagai marketing cost
```

---

## 💼 Dompet Driver (Digital Wallet)

### Struktur Saldo

```typescript
interface DriverWallet {
  balance: number;           // Saldo saat ini (bisa negatif = hutang karcis)
  totalEarned: number;       // Total pendapatan sepanjang karir
  totalKarcis: number;       // Total karcis yang pernah dibayar
  totalKarcisGratis: number; // Total karcis yang didapat gratis (reward)
  pendingWithdrawal: number; // Penarikan yang sedang diproses
}
```

### Aturan Dompet

| Aturan | Nilai |
|--------|-------|
| **Saldo Minimum** | Boleh negatif hingga -Rp 45.000 (tunggak maks 3 hari) |
| **Saldo Negatif Lebih dari 3 hari** | Akun dinonaktifkan sementara |
| **Minimum Penarikan** | Rp 50.000 |
| **Biaya Penarikan** | Rp 0 (gratis, subsidi koperasi) |
| **Proses Penarikan** | H+1 hari kerja |
| **Metode Top-Up** | QRIS, Transfer Bank |

---

## 🏆 SHU — Sisa Hasil Usaha Koperasi

### Apa itu SHU?

SHU adalah konsep koperasi yang unik: **keuntungan koperasi dikembalikan ke anggota berdasarkan partisipasi mereka**, bukan berdasarkan modal yang ditanam.

Di Ride-Solo:
- Anggota = Driver dan Merchant UMKM
- Partisipasi Driver = Seberapa banyak karcis yang dibayar
- Partisipasi UMKM = Seberapa banyak fee keanggotaan yang dibayar

### Formula Pendapatan Koperasi

```
PENDAPATAN BULANAN KOPERASI:
  = Σ karcis_efektif semua driver aktif
  + Σ fee_keanggotaan semua UMKM
  + biaya_admin_kontrak_B2B
  + pendapatan_lainnya (payment processing fee, dll.)

PENGELUARAN OPERASIONAL:
  - Biaya Firebase & Google Maps API
  - Gaji Tim Teknis & Admin
  - Marketing Komunitas
  - Biaya KYC & Compliance
  - Cadangan Dana Darurat

SISA HASIL USAHA (SHU) = PENDAPATAN - PENGELUARAN
```

### Distribusi SHU Tahunan

```
SHU Bersih dibagi setiap Desember:

70% → Dibagikan ke Anggota:
  ├── 60% untuk Driver (proporsional kontribusi karcis)
  └── 10% untuk Merchant UMKM (proporsional fee keanggotaan)

30% → Cadangan Koperasi:
  ├── 20% Cadangan Operasional (untuk cover biaya bulan sepi)
  └── 10% Dana Pengembangan Platform (reinvestasi teknologi)
```

### Contoh Kalkulasi SHU Driver

```
Misalkan:
  SHU Koperasi 2026 = Rp 100.000.000
  60% untuk Driver   = Rp 60.000.000
  
  Total karcis semua driver 2026 = Rp 200.000.000

Pak Slamet bayar karcis Rp 4.000.000 sepanjang 2026:
  Kontribusi = Rp 4.000.000 / Rp 200.000.000 = 2%
  
  SHU Pak Slamet = 2% × Rp 60.000.000 = Rp 1.200.000

Ini adalah BONUS TAHUNAN yang tidak ada di Gojek/Grab!
```

---

## 📊 Simulasi Ekonomi Koperasi

### Skenario: 100 Driver Aktif, 30 UMKM, 5 Industri (1 Tahun)

```
PENDAPATAN:
  Karcis Driver (efektif Rp 8.000 rata-rata × 100 driver × 300 hari)
                                               = Rp 240.000.000
  Fee UMKM (rata-rata Rp 50.000/bulan × 30)  =  Rp 18.000.000
  Fee Admin B2B (5 industri × Rp 300.000/bln) =  Rp 18.000.000
  ─────────────────────────────────────────────────────────────
  TOTAL PENDAPATAN                             = Rp 276.000.000

PENGELUARAN:
  Cloud & Maps API                             ≈ Rp 36.000.000
  Tim Teknis (2 developer)                     ≈ Rp 120.000.000
  Operasional & Admin                          ≈ Rp 30.000.000
  Subsidi Karcis Gratis (reward driver rajin)  ≈ Rp 30.000.000
  ─────────────────────────────────────────────────────────────
  TOTAL PENGELUARAN                            = Rp 216.000.000

SHU BERSIH                                    = Rp 60.000.000/tahun

Dibagi ke Driver (60%):     Rp 36.000.000
Rata-rata SHU per Driver:   Rp 360.000/driver/tahun (bonus tambahan!)
```

---

## 🔄 Siklus Ekonomi Koperasi

```
                    ┌─────────────────────┐
                    │   WARGA (Customer)   │
                    └──────────┬──────────┘
                               │ Bayar tarif 100%
                               ▼
                    ┌─────────────────────┐
                    │   DRIVER (Mitra)     │
                    │   Dapat 100% tarif  │
                    └──────────┬──────────┘
                               │ Bayar karcis harian
                               ▼
                    ┌─────────────────────┐
                    │     KOPERASI        │
                    │  (Pool Dana)        │
                    └──────────┬──────────┘
                               │ Setelah potong
                               │ biaya operasional
                               ▼
              ┌────────────────┴────────────────┐
              │                                  │
              ▼                                  ▼
    ┌─────────────────┐              ┌──────────────────┐
    │  SHU → Driver   │              │  Reinvestasi     │
    │  (Bonus Akhir   │              │  Platform &      │
    │   Tahun)        │              │  Cadangan Dana   │
    └─────────────────┘              └──────────────────┘
```

---

## 🔒 Transparansi & Audit

Sebagai koperasi, Ride-Solo wajib:

1. **Rapat Anggota Tahunan (RAT)** — Presentasikan laporan keuangan ke seluruh anggota
2. **Laporan Keuangan Terbuka** — Anggota bisa akses laporan melalui dashboard
3. **Audit Independen** — Setiap 2 tahun diaudit oleh akuntan publik
4. **Notifikasi SHU** — Setiap anggota dinotifikasi jumlah SHU mereka sebelum RAT

---

> _"Model karcis bukan hanya soal keuntungan finansial — ini tentang martabat. Driver bukan karyawan yang dipotong gaji. Mereka adalah wirausahawan mandiri yang memiliki ekosistemnya sendiri."_
