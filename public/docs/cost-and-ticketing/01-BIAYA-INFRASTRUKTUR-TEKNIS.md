# ☁️ BIAYA INFRASTRUKTUR TEKNIS — RINCIAN PER ITEM
## Ride-Solo: Komponen Cloud, API, dan Hosting
### *Cost & Ticketing Series · Dokumen 1 dari 7*

---

> **Konteks:** Platform Ride-Solo sudah selesai dibangun menggunakan stack Firebase + Next.js + Google Maps. Biaya infrastruktur di bawah ini adalah **biaya operasional berkelanjutan** (bukan biaya pembangunan platform, yang sudah di-cover oleh STP).

---

## STACK TEKNOLOGI & KOMPONEN BERBAYAR

```
KOMPONEN PLATFORM RIDE-SOLO:
  ─────────────────────────────────────────────────────
  Firebase Auth        → Autentikasi user (login/register)
  Cloud Firestore      → Database utama realtime
  Firebase Storage     → Penyimpanan foto (KYC, produk, foto profil)
  Firebase Functions   → Backend logic (kalkulasi harga, notif, karcis)
  Firebase Hosting     → Hosting fallback (primary: Vercel)
  Google Maps JS API   → Peta, rute, geocoding, Places API
  Vercel (Next.js)     → Hosting & CDN frontend
  ─────────────────────────────────────────────────────
```

---

## BAGIAN 1: GOOGLE MAPS PLATFORM

### Struktur Pricing Google Maps (2026)

| API yang Digunakan | Tarif (USD) | Konversi IDR (est.) | Penggunaan |
|-------------------|-------------|---------------------|------------|
| Maps JavaScript API | $7 per 1.000 load | Rp 112.000 | Peta di semua halaman |
| Directions API | $10 per 1.000 request | Rp 160.000 | Kalkulasi rute + ongkir |
| Geocoding API | $5 per 1.000 request | Rp 80.000 | Reverse geocoding alamat |
| Places API (New) | $17 per 1.000 session | Rp 272.000 | Autocomplete lokasi |
| Distance Matrix | $10 per 1.000 element | Rp 160.000 | Batch kalkulasi jarak |

> **Kurs Referensi:** USD 1 = IDR 16.000 (estimasi 2026)

### Estimasi Penggunaan per Bulan (per Fase)

**Tahun 1 — 50 Driver, 500 Customer, 2.000 Order/Bulan:**

```
Maps Load (halaman peta dibuka customer & driver):
  500 customer × 5 session/bln = 2.500 load
  50 driver × 25 hari × 3 load = 3.750 load
  Total: 6.250 load/bln
  Biaya: 6.250/1.000 × $7 = $43.75 → Rp 700.000/bln

Directions API (kalkulasi rute saat order dibuat):
  2.000 order × 1 request = 2.000 request/bln
  Biaya: 2.000/1.000 × $10 = $20 → Rp 320.000/bln

Geocoding API (reverse geocode GPS driver):
  50 driver × 25 hari × 10 update/hari = 12.500 request/bln
  Biaya: 12.500/1.000 × $5 = $62.50 → Rp 1.000.000/bln

Places API (customer pilih toko/tujuan):
  500 customer × 2 session/bln = 1.000 session
  Biaya: 1.000/1.000 × $17 = $17 → Rp 272.000/bln

Distance Matrix (kalkulasi ongkir batch pasar/food):
  200 order food × 3 restaurant = 600 element/bln
  Biaya: 600/1.000 × $10 = $6 → Rp 96.000/bln
──────────────────────────────────────────────────
TOTAL GOOGLE MAPS BULAN (Tahun 1): ≈ Rp 2.388.000
POTONGAN FREE TIER GOOGLE: -$200/bln → -Rp 3.200.000
──────────────────────────────────────────────────
TOTAL MAPS SETELAH FREE TIER (Tahun 1): ≈ Rp 0
(Free tier $200 cukup untuk menutup usage Tahun 1!)
```

**Tahun 2 — 200 Driver, 5.000 Customer, 15.000 Order/Bulan:**

```
Maps Load:       12.500 session → Rp 1.400.000
Directions:      15.000 request → Rp 2.400.000
Geocoding:       50.000 request → Rp 4.000.000
Places:          10.000 session → Rp 2.720.000
Distance Matrix: 5.000 element  → Rp 800.000
──────────────────────────────────────────────
Sub-total:                        Rp 11.320.000
Free tier offset:                -Rp 3.200.000
──────────────────────────────────────────────
TOTAL MAPS (Tahun 2):           ≈ Rp 8.120.000/bln
                                ≈ Rp 97.440.000/tahun
```

**Tahun 3 — 500 Driver, 20.000 Customer, 50.000 Order/Bulan:**

```
Estimasi total (tanpa free tier): Rp 35.000.000/bln
Free tier offset:                -Rp 3.200.000
──────────────────────────────────────────────
TOTAL MAPS (Tahun 3):           ≈ Rp 31.800.000/bln
                                ≈ Rp 381.600.000/tahun
```

---

## BAGIAN 2: FIREBASE (GOOGLE CLOUD)

### Komponen Firebase yang Digunakan

**A. Cloud Firestore (Database Utama)**

```
Pricing Firestore:
  Reads:  $0.06 per 100.000 document reads
  Writes: $0.18 per 100.000 document writes
  Deletes: $0.02 per 100.000 document deletes
  Storage: $0.18 per GB per bulan

Free Tier (Spark → Blaze):
  50.000 reads/hari, 20.000 writes/hari, 20.000 deletes/hari, 1 GB storage
```

**Estimasi Usage Firestore (Tahun 1 — 2.000 Order/Bulan):**

```
Order documents:
  2.000 order × 10 reads/order lifecycle = 20.000 reads/bln
  2.000 order × 5 writes/order lifecycle = 10.000 writes/bln

Driver GPS updates (realtime):
  50 driver × 25 hari × 6 jam × 1 update/mnt = 450.000 writes/bln
  (= 15.000 writes/hari — masih dalam free tier!)

User profile reads (login, load halaman):
  500 customer × 20 session/bln × 3 reads = 30.000 reads/bln
  50 driver × 25 hari × 5 session × 3 reads = 18.750 reads/bln

OPD workspace reads:
  19 dinas × 5 staff × 20 session/bln × 5 reads = 95.000 reads/bln

Total reads/hari:  ≈ 163.750/30 = 5.458 reads/hari (FREE TIER!)
Total writes/hari: ≈ 460.000/30 = 15.333 writes/hari (FREE TIER!)

BIAYA FIRESTORE TAHUN 1: ≈ Rp 0 (masih di free tier)
```

**Estimasi Usage Firestore (Tahun 2 — 15.000 Order/Bulan):**

```
Reads/hari: ≈ 120.000 reads/hari (melebihi free tier ~70.000 read/hari)
Writes/hari: ≈ 100.000 writes/hari (melebihi free tier ~80.000 write/hari)

Biaya tambahan:
  Reads:  50.000 × 30 × $0.06/100.000 = $0.90/bln → Rp 14.400
  Writes: 80.000 × 30 × $0.18/100.000 = $4.32/bln → Rp 69.120
  Storage (dokumen akumulasi): 5 GB × $0.18 → $0.90/bln → Rp 14.400

BIAYA FIRESTORE TAHUN 2: ≈ Rp 98.000/bln ≈ Rp 1.176.000/tahun
```

**B. Firebase Authentication**

```
Pricing: GRATIS untuk semua auth method (email, Google) sampai skala jutaan user
Biaya Ride-Solo Tahun 1–3: Rp 0
```

**C. Firebase Storage (Foto KYC, Produk, Profil)**

```
Pricing:
  Storage:  $0.026 per GB
  Download: $0.12 per GB
  Upload:   $0 (gratis)
  Free tier: 5 GB storage, 1 GB download/hari

Estimasi usage Tahun 1:
  50 driver × 3 foto KYC × avg 500KB = 75 MB
  20 merchant × 20 foto produk × avg 300KB = 120 MB
  500 customer × 1 foto profil × avg 100KB = 50 MB
  Total: ≈ 245 MB storage (di bawah 5GB free tier)

BIAYA STORAGE TAHUN 1: Rp 0 (free tier)
BIAYA STORAGE TAHUN 2: ≈ Rp 30.000/bln (≈ 2 GB total)
BIAYA STORAGE TAHUN 3: ≈ Rp 130.000/bln (≈ 10 GB total)
```

**D. Firebase Cloud Functions**

```
Pricing:
  Invocations: $0.40 per 1.000.000 invocations
  Compute:     $0.0000025 per GB-second
  Free tier:   2.000.000 invocations/bln, 400.000 GB-seconds/bln

Fungsi yang berjalan:
  - Midnight karcis calculator (1× per hari = 30/bln)
  - Order price calculator (per order = 2.000/bln Tahun 1)
  - Push notification dispatcher (2× per order = 4.000/bln)
  - Flash sale expiry checker (per shift = 60/bln)

Total invocations Tahun 1: ≈ 6.090/bln (jauh di bawah 2 juta free tier)
BIAYA FUNCTIONS TAHUN 1: Rp 0
BIAYA FUNCTIONS TAHUN 3: ≈ Rp 50.000/bln
```

---

## BAGIAN 3: VERCEL (HOSTING FRONTEND)

```
PAKET VERCEL:
  Hobby (Free): Bandwidth 100 GB/bln, 100 deployment/bln
  Pro ($20/bln): Bandwidth 1 TB/bln, unlimited deployment

Estimasi Traffic Ride-Solo:
  Tahun 1: 500 customer × avg 500KB/session × 20 session = 5 GB/bln
  → Paket Hobby ($0) cukup untuk Tahun 1

  Tahun 2: 5.000 customer × 500KB × 20 session = 50 GB/bln
  → Masih dalam Hobby tier, tapi mendekati batas

  Tahun 3: 20.000 customer × 500KB × 20 session = 200 GB/bln
  → Perlu upgrade ke Pro ($20/bln = Rp 320.000/bln)

BIAYA VERCEL:
  Tahun 1: Rp 0
  Tahun 2: Rp 0 (masih free)
  Tahun 3: Rp 320.000/bln = Rp 3.840.000/tahun
```

---

## RINGKASAN BIAYA INFRASTRUKTUR PER TAHUN

| Komponen | Tahun 1 | Tahun 2 | Tahun 3 |
|----------|---------|---------|---------|
| Google Maps API | **Rp 0** (free tier cukup) | Rp 97.440.000 | Rp 381.600.000 |
| Firebase Firestore | **Rp 0** | Rp 1.176.000 | Rp 5.880.000 |
| Firebase Storage | **Rp 0** | Rp 360.000 | Rp 1.560.000 |
| Firebase Functions | **Rp 0** | Rp 0 | Rp 600.000 |
| Firebase Auth | **Rp 0** | Rp 0 | Rp 0 |
| Vercel Hosting | **Rp 0** | Rp 0 | Rp 3.840.000 |
| Domain (.id) | Rp 150.000 | Rp 150.000 | Rp 150.000 |
| **TOTAL INFRASTRUKTUR** | **Rp 150.000/tahun** | **Rp 99.126.000/tahun** | **Rp 393.630.000/tahun** |

> ⚠️ **Catatan Penting Tahun 3+:** Biaya Maps API menjadi komponen terbesar. Mulai Tahun 3, perlu evaluasi strategi: (1) caching agresif untuk kurangi API call, (2) negoisasi Google Maps enterprise deal, atau (3) evaluasi hybrid OSM/Leaflet.js untuk use case non-kritis.

---

## STRATEGI EFISIENSI BIAYA INFRASTRUKTUR

### Cara Menekan Biaya Google Maps (Jangka Menengah)

```
1. CACHING AGRESIF (implementasi Tahun 2):
   → Cache hasil geocoding per koordinat selama 24 jam di Firestore
   → Hemat estimasi 40% API call geocoding
   → Penghematan: ≈ Rp 15.000.000/tahun (Tahun 3)

2. TILE CACHING PETA:
   → Preload tile peta area Solo (tidak berubah)
   → Kurangi Maps JavaScript API load signifikan
   → Penghematan: ≈ Rp 30.000.000/tahun (Tahun 3)

3. GOOGLE MAPS ENTERPRISE DEAL:
   → Pada skala Tahun 3, bisa nego langsung dengan Google
   → Enterprise pricing biasanya 30–50% lebih murah dari list price
   → Penghematan: ≈ Rp 100.000.000/tahun (Tahun 3)

4. HYBRID OSM (OpenStreetMap) untuk use case non-kritis:
   → Peta statis halaman profil & history → OpenStreetMap (gratis)
   → Hanya gunakan Google Maps untuk routing aktif (order baru)
   → Penghematan: ≈ Rp 80.000.000/tahun (Tahun 3)
```

---

*Ride-Solo Cost & Ticketing Series · Dokumen 1/7 · Solo Technopark · September 2026*
