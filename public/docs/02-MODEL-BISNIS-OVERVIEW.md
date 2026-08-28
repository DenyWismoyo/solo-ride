# 🏗️ Model Bisnis Ride-Solo — Business Model Canvas

> Dokumen ini menjelaskan secara komprehensif bagaimana Ride-Solo menciptakan, menyampaikan, dan menangkap nilai ekonomi dalam ekosistem hyperlocal Surakarta.

---

## 📐 Business Model Canvas

### 1. Value Proposition (Proposisi Nilai)

| Segmen | Proposisi Nilai Utama |
|--------|----------------------|
| **Customer (Warga)** | Tarif transparan, tidak ada surge predatory, berbelanja dari UMKM lokal dalam satu super-app |
| **Driver** | Zero Commission — dapat 100% pendapatan per trip, karcis flat Rp 15.000/hari, SHU tahunan |
| **UMKM** | Tidak ada biaya listing, tidak ada komisi per transaksi, Flash Sale geofenced |
| **Industri** | Armada distribusi lokal yang terpercaya dan terverifikasi, lebih murah dari ekspedisi nasional |
| **Pemda/Koperasi** | Data ekonomi lokal, instrumen subsidi digital, laporan dampak program |

---

### 2. Revenue Streams (Sumber Pendapatan)

Berbeda dari aplikator konvensional yang mengandalkan komisi per-trip, Ride-Solo memiliki **model pendapatan berlapis** yang tidak bergantung pada satu sumber:

#### 🎫 Karcis Harian Driver (Revenue Utama)
```
Pendapatan = Jumlah Driver Aktif × Karcis Harian Efektif

Contoh: 100 driver aktif/hari × Rp 10.000 rata-rata karcis efektif
      = Rp 1.000.000/hari = Rp 30.000.000/bulan

*Karcis efektif lebih rendah dari nominal karena ada subsidi untuk driver rajin (>6 jam gratis).
```

#### 🏪 Keanggotaan UMKM (Revenue Sekunder)
```
UMKM 0-10 order/bulan    → Rp 0/bulan (trial gratis, 3 bulan pertama)
UMKM 11-100 order/bulan  → Rp 25.000/bulan
UMKM 101-500 order/bulan → Rp 75.000/bulan
UMKM 500+ order/bulan    → Rp 150.000/bulan

Catatan: TIDAK ADA komisi per transaksi — murni subscription.
```

#### 🏭 Kontrak Distribusi B2B (Revenue Tersier)
```
Industri membayar biaya admin kontrak:
- Kontrak Harian: Rp 25.000/kontrak (dispatch 1-5 driver)
- Kontrak Mingguan: Rp 100.000/kontrak
- Kontrak Bulanan: Rp 300.000/kontrak + diskon volume
```

#### 💰 Platform Fee Minimal (Revenue Tambahan)
```
Top-up Dompet Digital (payment processing): 0.5% dari jumlah top-up
Penarikan Dana Driver: Rp 0 (gratis, subsidi koperasi)
Layanan Premium Customer: Rp 15.000/bulan (opsional — fitur prioritas driver)
```

---

### 3. Cost Structure (Struktur Biaya)

| Komponen Biaya | Estimasi | Keterangan |
|----------------|----------|------------|
| **Firebase / Cloud** | Rp 500.000–2.000.000/bulan | Firestore, Functions, Auth, Storage |
| **Google Maps API** | Rp 1.500.000–5.000.000/bulan | Places, Directions, Geocoding |
| **Tim Teknis** | Rp 5.000.000–20.000.000/bulan | 1-3 developer (skala bertahap) |
| **Operasional** | Rp 2.000.000–5.000.000/bulan | Administrasi, marketing lokal |
| **KYC & Compliance** | Rp 500.000/bulan | Verifikasi identitas driver |
| **Cadangan SHU** | 30% dari sisa hasil usaha | Disiapkan untuk distribusi tahunan |

#### Break-Even Analysis:
```
Total Biaya Operasional Awal: ≈ Rp 10.000.000/bulan
Break-Even Driver: ≈ 67 driver aktif @ Rp 15.000 karcis penuh
                   atau ≈ 150 driver aktif @ Rp 10.000 karcis rata-rata
```

---

### 4. Customer Segments (Segmen Pengguna)

```
┌────────────────────────────────────────────────────────────┐
│                    EKOSISTEM 5 PILAR                        │
├───────────────┬────────────────────┬───────────────────────┤
│  🧑 WARGA     │   🏍️ DRIVER       │   🏪 UMKM             │
│  (Customer)   │   (Mitra Koperasi) │   (Merchant Lokal)    │
│               │                    │                       │
│ • Mahasiswa   │ • Driver ojol eks  │ • Warung makan        │
│ • Pekerja     │   aplikator besar  │ • Apotek lokal        │
│ • Ibu rumah   │ • Driver paruh     │ • Toko sembako        │
│   tangga      │   waktu            │ • Catering rumahan    │
│ • Wisatawan   │ • Pensiunan aktif  │ • Pedagang pasar      │
├───────────────┴────────────────────┴───────────────────────┤
│  🏭 INDUSTRI B2B      │   🏛️ PEMERINTAH / KOPERASI         │
│  (Distributor Lokal)  │   (Pemda & Koperasi Warga)        │
│                       │                                    │
│ • Industri tekstil    │ • Dinas Koperasi & UMKM            │
│ • Pabrik makanan      │ • Dinas Perhubungan                │
│ • Distributor FMCG    │ • Program Pasar Murah Pemkot       │
│ • Pengusaha logistik  │ • Koperasi Warga Solo              │
└───────────────────────┴────────────────────────────────────┘
```

---

### 5. Channels (Saluran)

| Saluran | Cara Penggunaan |
|---------|-----------------|
| **Mobile App (PWA)** | Kanal utama — Super App untuk customer & driver |
| **Web App** | Dashboard admin, merchant, industry, government |
| **WhatsApp Community** | Komunitas driver — info karcis, update sistem |
| **Komunitas Lokal** | Rekrutmen driver dari komunitas ojek pangkalan |
| **Kerjasama Kelurahan** | Sosialisasi langsung ke warga melalui RT/RW |
| **Media Sosial Lokal** | Instagram, Facebook, TikTok — konten hyperlocal Solo |
| **Pemkot Solo** | Program resmi melalui dinas terkait |

---

### 6. Key Activities (Aktivitas Kunci)

1. **Pengembangan Platform** — Membangun dan memelihara aplikasi mobile/web
2. **Rekrutmen & Onboarding Driver** — Proses KYC, edukasi karcis, pelatihan
3. **Pengembangan Ekosistem UMKM** — Onboarding merchant, pelatihan digital
4. **Pengelolaan Koperasi** — Administrasi SHU, audit, rapat anggota tahunan
5. **Community Management** — Mempertahankan kepercayaan dan keaktifan komunitas
6. **BizEngine Maintenance** — Menjaga formula tarif tetap kompetitif dan fair

---

### 7. Key Resources (Sumber Daya Kunci)

| Sumber Daya | Deskripsi |
|-------------|-----------|
| **Platform Teknologi** | Firebase + Next.js, Cloud Functions, Google Maps |
| **Komunitas Driver** | Jaringan driver mitra koperasi yang terverifikasi |
| **Jaringan UMKM** | Katalog merchant lokal yang aktif dan terkurasi |
| **BizEngine** | Formula bisnis adaptif yang menjaga fairness semua pihak |
| **Kepercayaan Komunitas** | Modal sosial yang tidak bisa dibeli atau ditiru cepat |
| **Lisensi Koperasi** | Badan hukum koperasi yang menjamin SHU tahunan |

---

### 8. Key Partners (Mitra Kunci)

| Mitra | Peran |
|-------|-------|
| **Pemkot Surakarta** | Legitimasi, program subsidi, akses warga |
| **Dinas Koperasi & UMKM** | Fasilitasi pembentukan koperasi resmi |
| **Universitas Negeri Surakarta (UNS)** | Riset dampak, mahasiswa sebagai early adopter |
| **Komunitas Ojek Pangkalan** | Rekrutmen driver berbasis komunitas |
| **Industri Lokal (Batik Laweyan, dll.)** | Mitra distribusi B2B |
| **Payment Gateway (Mayar/QRIS)** | Infrastruktur pembayaran digital |

---

### 9. Alur Nilai Uang dalam Ekosistem

```
CUSTOMER membayar tarif trip (misal Rp 25.000)
    ↓
100% masuk ke DRIVER (Zero Commission)
    ↓
DRIVER bayar karcis Rp 0-15.000/hari ke KOPERASI
    ↓
KOPERASI gunakan karcis untuk:
├── 70% → Biaya operasional (server, maps, admin)
└── 30% → Ditabung untuk SHU tahunan
    ↓
SHU dibagikan ke DRIVER ANGGOTA setiap akhir tahun
berdasarkan proporsi kontribusi karcis masing-masing driver
```

---

## 📊 Unit Economics per Driver per Bulan

### Skenario Driver Aktif (22 hari, 6+ jam/hari = karcis gratis)

| Item | Gojek/Grab | Ride-Solo |
|------|------------|-----------|
| Pendapatan Kotor | Rp 4.950.000 | Rp 4.950.000 |
| Potongan Komisi | -Rp 1.237.500 (25%) | **Rp 0 (0%)** |
| Biaya Karcis | Rp 0 | **Rp 0 (gratis karena >6 jam!)** |
| **Take-Home Bersih** | **Rp 3.712.500** | **Rp 4.950.000** |
| Selisih | — | **+Rp 1.237.500/bulan** |

### Skenario Driver Part-Time (15 hari, 3 jam/hari)

| Item | Gojek/Grab | Ride-Solo |
|------|------------|-----------|
| Pendapatan Kotor | Rp 1.080.000 | Rp 1.080.000 |
| Potongan Komisi | -Rp 270.000 (25%) | **Rp 0** |
| Biaya Karcis | Rp 0 | -Rp 225.000 (Rp 15.000 × 15 hari) |
| **Take-Home Bersih** | **Rp 810.000** | **Rp 855.000** |
| Selisih | — | **+Rp 45.000/bulan** |

*Driver Ride-Solo **selalu** lebih untung dalam kondisi apapun.*

---

> _Dokumen ini adalah gambaran model bisnis Ride-Solo versi Agustus 2026. Formula dan angka akan diperbarui secara berkala sesuai kondisi pasar lokal._
