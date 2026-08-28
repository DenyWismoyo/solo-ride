# 🗺️ Roadmap Ekosistem Ride-Solo — Smart Civic Hub
## Dari MVP ke Platform Hyperlocal Terlengkap Indonesia

> Dokumen ini memaparkan perjalanan Ride-Solo dari aplikasi ojek sederhana menjadi infrastruktur digital komunitas yang menggerakkan seluruh ekosistem ekonomi lokal Surakarta.

---

## 🏁 Gambaran Besar

```
2025–2026: PHASE 1 — MVP Core (✅ SELESAI)
  "Bukti konsep — semua role bisa masuk dan bertransaksi"

2026: PHASE 2 — Ekosistem Terintegrasi
  "Realtime — semua pihak bicara satu sama lain via platform"

2026–2027: PHASE 3 — Monetisasi Lokal
  "Platform menghasilkan pendapatan dan SHU mulai dibagikan"

2027: PHASE 4 — Anti-Fraud & Smart Civic
  "Platform aman, dipercaya, dan dampak civicnya terasa nyata"

2027–2028: PHASE 5 — AI & Hyperlocal Intelligence
  "Platform jadi 'otak' ekosistem yang prediktif dan adaptif"
```

---

## ✅ PHASE 1 — MVP Core (SELESAI, Agustus 2026)

### Yang Telah Dibangun

**Infrastruktur Dasar:**
- [x] Firebase Auth dengan email + Google Sign-In
- [x] Role-based redirect otomatis (6 role: Customer, Driver, Merchant, Industry, Government, Admin)
- [x] SIGAP Design System — Dark/Light mode, Glassmorphism, animasi micro-interaction
- [x] Firebase Cloud Functions (2nd Gen) terintegrasi
- [x] BizEngine — formula tarif adaptif (server-side, tidak bisa dimanipulasi)
- [x] BizConfig Panel — Admin dapat ubah tarif tanpa deploy ulang
- [x] Karcis Scheduler — potong karcis otomatis tengah malam

**Customer (Warga):**
- [x] Super-App Home dengan 8 layanan (ojek, mobil, kirim, kuliner, apotek, pasar, titip, UMKM)
- [x] Ride Booking Drawer dengan Google Maps Places API (New)
- [x] Order realtime listener + riwayat pesanan
- [x] Merchant Spotlight (UMKM lokal Surakarta)
- [x] Poin Stamp dasar
- [x] Bottom Navigation

**Driver (Mitra Koperasi):**
- [x] Toggle Online/Offline
- [x] Radar Pesanan Realtime (onSnapshot)
- [x] Preferensi Layanan (ojek/kirim/kuliner toggle)
- [x] Dashboard Dompet Koperasi + Karcis Harian
- [x] Active Trip Page
- [x] KYC Upload (KTP + SIM)

**Merchant UMKM:**
- [x] Dashboard warung (nama, area, metrics)
- [x] Toggle buka/tutup + kelola menu
- [x] Flash Sale Pasar Warga launcher (UI)
- [x] Halaman Toko Publik (`/store/[storeSlug]`)
- [x] Keranjang belanja dengan kalkulasi ongkir

**Industry B2B:**
- [x] Dashboard perusahaan
- [x] Kontrak distribusi (UI)

**Government/Koperasi:**
- [x] Dashboard civic (statistik lokal)
- [x] Broadcast pengumuman (UI)

**Super Admin:**
- [x] Role Impersonation Engine (6 role, satu klik)
- [x] Firestore User Manager (ubah role, verifikasi)
- [x] KYC Approval Panel
- [x] BizConfig Panel

---

## 🔧 PHASE 2 — Ekosistem Terintegrasi (Q3–Q4 2026)

### Target: Semua pihak berbicara secara realtime

#### 🔴 Prioritas Tertinggi (Sprint 1)
- [ ] **Notifikasi Realtime** — Driver terima order, Customer update status (`notifications` collection + FCM)
- [ ] **serviceType di Order** — Sistem tahu ojek vs kuliner vs kirim, driver filter sesuai preferensi
- [ ] **Pesanan Merchant Realtime** — Dashboard UMKM terima order masuk via `onSnapshot`
- [ ] **Update GPS Driver** — Posisi driver realtime ke `drivers` collection setiap 5 detik

#### 🟡 Prioritas Sedang (Sprint 2)
- [ ] **Rating & Review** — Customer beri bintang setelah order selesai (ke driver & merchant)
- [ ] **Government Broadcast ke Firestore** — Pengumuman tersimpan di `broadcasts`, muncul di notif user
- [ ] **Karcis Berbayar** — Deduct dari saldo dompet driver (bukan free trial)
- [ ] **Menu CRUD dari Firestore** — Merchant kelola menu di `menu_items` collection (bukan hardcoded)
- [ ] **Saved Address Customer** — Simpan rumah, kantor, favorit

#### 🟢 Prioritas Normal (Sprint 3)
- [ ] **Flash Sale Broadcast** — Notif ke customer dalam radius 2km saat merchant aktifkan flash sale
- [ ] **Earnings Summary Driver** — Breakdown pendapatan harian / mingguan
- [ ] **Subsidi Karcis Pemda** — Government bisa top-up dompet driver terpilih dari anggaran
- [ ] **Kontrak Distribusi Industri ke Firestore** — Simpan ke `contracts` collection

---

## 🌱 PHASE 3 — Monetisasi Lokal (Q1–Q2 2027)

### Target: Platform menghasilkan pendapatan komunitas yang berkelanjutan

- [ ] **Dompet Koperasi Penuh** — Top-up, payout, transfer antar member (semua role)
- [ ] **SHU Calculator** — Estimasi bagi hasil tahunan driver berdasarkan kontribusi karcis
- [ ] **KYC Liveness Check** — Verifikasi wajah saat tarik dana (selfie verification)
- [ ] **Demand Heatmap** — Peta panas permintaan per jam per kecamatan di Surakarta
- [ ] **Geofencing per Kecamatan** — Driver hanya terima order dalam radius kerja yang dipilih
- [ ] **Program Pasar Murah** — Government beri subsidi harga ke merchant tertentu
- [ ] **Statistik Ekonomi Lokal** — Dashboard chart perputaran uang, UMKM yang terbantu
- [ ] **Voucher Stamp Digital** — Customer redeem poin langsung ke produk UMKM mitra
- [ ] **UMKM Supply Order** — Industry bisa kirim bahan baku ke merchant binaan
- [ ] **Laporan Pajak UMKM** — Ekspor laporan penjualan untuk pelaporan ke Pemda

---

## 🛡️ PHASE 4 — Anti-Fraud & Smart Civic (Q3 2027)

### Target: Platform aman, dipercaya komunitas, dan dampak civicnya nyata

- [ ] **Deteksi GPS Tuyul** — Validasi sinyal GPS dengan pola pergerakan & akselerometer
- [ ] **Forum Driver** — Chat komunitas + laporan kondisi jalan real-time dari driver
- [ ] **Pasar Warga** — Flash deal lintas merchant dalam radius, batch notifikasi
- [ ] **Kontrak B2B Berjangka** — Industry buat kontrak distribusi multi-hari / multi-bulan
- [ ] **Laporan Dampak Sosial** — Pemda lihat berapa warga terbantu per program
- [ ] **Whitelist/Blacklist Driver** — Super Admin suspend atau aktifkan kembali akun driver
- [ ] **Titip Tetangga Algorithm** — Auto-batching order searah rute driver aktif
- [ ] **Chat Masking** — Nomor HP customer tersembunyi dari driver (relay chat)
- [ ] **Asuransi Perjalanan** — Kerjasama dengan asuransi untuk proteksi driver & customer

---

## 🤖 PHASE 5 — AI & Hyperlocal Intelligence (2028)

### Target: Platform jadi "otak" ekosistem yang prediktif dan adaptif

- [ ] **Prediksi Demand per Jam** — ML model untuk prediksi keramaian per kecamatan
- [ ] **Auto-Batching Titip Tetangga** — AI matching order searah rute driver secara optimal
- [ ] **Rekomendasi UMKM Personalized** — Berdasarkan histori order customer
- [ ] **Smart Subsidi Karcis** — Pemerintah alokasi subsidi ke driver berdasarkan demand prediktif
- [ ] **Forum AI Knowledge Base** — Driver tanya, AI jawab berdasarkan pengalaman komunitas
- [ ] **Dynamic Pricing (Fair)** — Tarif menyesuaikan demand tanpa surge predatory
- [ ] **Prediksi SHU** — Estimasi bagi hasil tahunan berdasarkan tren perputaran ekosistem
- [ ] **UMKM Growth Advisor** — AI sarankan kapan Flash Sale terbaik, stok berapa
- [ ] **Multi-Kota Expansion** — Replikasi model ke Klaten, Boyolali, Wonogiri, Karanganyar

---

## 📍 Milestone Kunci

| Milestone | Target | Indikator Sukses |
|-----------|--------|-----------------|
| **MVP Live** | Q3 2026 | 50 driver terdaftar, 20 UMKM aktif |
| **1.000 Order/Bulan** | Q4 2026 | Transaksi nyata dari real user |
| **Break-Even Operasional** | Q1 2027 | Karcis cukup tutup biaya server + tim |
| **SHU Pertama** | Desember 2027 | Bagi hasil ke driver untuk pertama kali |
| **Solo Raya Coverage** | Q2 2027 | 5 kota/kabupaten di Solo Raya |
| **Jawa Tengah Expansion** | 2028 | 3 kota baru (Semarang, Purwokerto, Magelang) |
| **National Impact** | 2029+ | Model ini jadi referensi kebijakan digital nasional |

---

## 🎯 Indikator Keberhasilan Platform

### KPI Ekosistem

| Indikator | Target Phase 1 | Target Phase 3 | Target Phase 5 |
|-----------|---------------|---------------|---------------|
| Driver Aktif/Hari | 20+ | 200+ | 1.000+ |
| UMKM Terdaftar | 20+ | 100+ | 500+ |
| Order/Bulan | 1.000+ | 50.000+ | 500.000+ |
| Perputaran Uang Lokal | Rp 50 juta/bln | Rp 2,5 milyar/bln | Rp 25 milyar/bln |
| Driver yang Terbantu | 20+ orang | 200+ orang | 1.000+ orang |
| UMKM yang Naik Omset | — | 30% avg. | 60% avg. |

### KPI Dampak Sosial

- Berapa persen driver yang penghasilannya naik vs sebelum Ride-Solo
- Berapa UMKM yang sebelumnya tidak punya toko online, kini aktif digital
- Berapa rupiah SHU yang dikembalikan ke anggota koperasi
- Berapa program Pemda yang terfasilitasi melalui platform

---

## 🌍 Visi 2030: Jaringan Koperasi Digital Indonesia

```
2026: Surakarta (Solo) — Pilot & Proof of Concept
2027: Solo Raya (5 Kab/Kota)
2027: Jawa Tengah (Semarang, Purwokerto, Magelang)
2028: Pulau Jawa (Yogyakarta, Malang, Cirebon)
2029: Indonesia Timur (Makassar, Manado, Pontianak)
2030: Jaringan 50+ Koperasi Hyperlocal seluruh Indonesia
      → Model ini jadi referensi ekonomi digital inklusif nasional
```

---

> _"Setiap fitur yang kami bangun adalah batu bata yang diletakkan untuk fondasi ekonomi lokal yang lebih adil. Tidak semuanya sempurna sejak awal — tetapi arahnya selalu jelas: ekosistem yang semua pihaknya saling menguatkan."_
>
> — Tim Ride-Solo, Surakarta 2026
