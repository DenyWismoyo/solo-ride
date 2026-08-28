# Ride-Solo: Smart Civic Hub — Roadmap Visi 5 Ekosistem

> Dokumen ini adalah **visi jangka panjang** platform Ride-Solo sebagai Smart Civic Hub
> yang melampaui aplikator besar dengan model ekonomi komunitas, hyperlocal intelligence,
> dan integrasi 5 ekosistem yang saling memperkuat.

---

## 🌐 Arsitektur Smart Hub

```
╔═══════════════════════════════════════════════════════════════════════╗
║                       RIDE-SOLO SMART HUB                            ║
║                   Platform Hyperlocal Surakarta                       ║
╠══════════════════╦═════════════════╦══════════════════════════════════╣
║  🧑 CUSTOMER     ║  🏍️ DRIVER      ║  🏪 MERCHANT UMKM               ║
║  (Warga)         ║  (Mitra)         ║  (Penjual Lokal)                ║
║                  ║                  ║                                 ║
║ • Pesan ojek     ║ • Karcis flat    ║ • Flash Sale geofence           ║
║ • Kuliner UMKM   ║ • Radar order    ║ • Kuliner Warga realtime        ║
║ • Kirim paket    ║ • Multi-layanan  ║ • Katalog digital               ║
║ • Titip Tetangga ║ • SHU koperasi   ║ • Titip Tetangga batching       ║
║ • Poin Stamp     ║ • Forum driver   ║ • Supply dari Industry          ║
╠══════════════════╩═════════════════╩══════════════════════════════════╣
║  🏭 INDUSTRY B2B                   ║  🏛️ GOVERNMENT / KOPERASI       ║
║  (Distributor & Industri)           ║  (Pemda & Koperasi Warga)       ║
║                                     ║                                 ║
║ • Armada batch dispatching          ║ • Broadcast civic alert         ║
║ • Supply chain lokal → UMKM         ║ • Subsidi karcis driver         ║
║ • B2B order management              ║ • SHU koperasi tahunan          ║
║ • Kontrak distribusi jangka panjang ║ • Pasar murah program           ║
║ • GPS tracking armada               ║ • KYC approval driver           ║
╠══════════════════════════════════════╩════════════════════════════════╣
║                    👑 SUPER ADMIN + TRUST ENGINE                      ║
║  • Role impersonation     • Anti-fraud GPS tuyul detection            ║
║  • KYC management         • Geofencing kecamatan config               ║
║  • System-wide analytics  • Driver whitelist / blacklist              ║
╚═══════════════════════════════════════════════════════════════════════╝
```

---

## 🔗 Filosofi Integrasi Ekosistem

### Mengapa Ini Berbeda dari Aplikator Besar?

| Aspek | Aplikator Besar (Gojek, Grab) | Ride-Solo Smart Hub |
|---|---|---|
| **Model Ekonomi** | Komisi 20-30% per trip | Karcis flat fee Rp X/hari, 0% komisi |
| **Skala** | Nasional, top-down | Hyperlocal kecamatan, bottom-up |
| **Kepemilikan** | Korporasi asing | Koperasi warga (SHU tahunan) |
| **UMKM** | Merchant berbayar (listing fee + komisi) | Bebas listing, ekosistem langsung |
| **Pemerintah** | Tidak terintegrasi | Portal civic: subsidi, pasar murah, laporan |
| **Industri** | Tidak ada B2B | Kontrak distribusi lokal langsung ke driver |
| **Data** | Eksploitasi data ke pusat | Data ekonomi lokal kembali ke warga |
| **Reward** | Poin yang sulit ditukar | Stamp langsung ke UMKM mitra koperasi |

---

## 📅 Phase Roadmap

### ✅ Phase 1 — MVP Core (SELESAI)
> Target: Proof of concept semua 6 role bisa login, melihat dashboard, dan melakukan aksi dasar.

- [x] Auth Firebase (Email + Google, role-based redirect)
- [x] Customer: Super-App Home + Ride Booking Drawer + Google Maps
- [x] Driver: Radar Order + Toggle Online + Karcis Harian Flat Fee
- [x] Merchant UMKM: Dashboard warung + kelola menu + Flash Sale launcher
- [x] Industry: Dashboard + kontrak distribusi statis
- [x] Government: Dashboard civic + broadcast form (UI)
- [x] Super Admin: Impersonation Engine + Firestore Role Manager
- [x] SIGAP Design System: Dark/Light mode + Framer Motion + Enterprise UI
- [x] Wallet Service: Karcis Harian (gratis trial)
- [x] Poin Stamp dasar (Customer loyalty)

---

### 🔧 Phase 2 — Ekosistem Terintegrasi (BERIKUTNYA)
> Target: Semua ekosistem saling berbicara melalui Firestore realtime dan notifikasi.

#### Prioritas Tertinggi 🔴
- [ ] **`serviceType` di OrderDocument** — sistem tahu ojek vs kuliner vs kirim
- [ ] **Notifikasi Realtime** (`notifications` collection) — driver terima order, customer order accepted
- [ ] **Pesanan Merchant Realtime** — `onSnapshot` pesanan masuk ke dashboard UMKM
- [ ] **Rating & Review** setelah order selesai (Customer → Driver dan Customer → Merchant)
- [ ] **Update lokasi driver realtime** ke `drivers` collection (GPS tracking)

#### Prioritas Sedang 🟡
- [ ] **Government Broadcast** ke Firestore `broadcasts` collection (bukan `alert()`)
- [ ] **Karcis Berbayar** — deduct dari dompet koperasi driver (bukan hanya free trial)
- [ ] **Kontrak Distribusi Industry** ke Firestore `contracts` collection
- [ ] **Menu Merchant dari Firestore** — CRUD ke `menu_items` collection (bukan hardcoded)
- [ ] **Saved Address** customer (Rumah, Kantor, Favorit)
- [ ] **Driver earnings summary harian** (bukan hanya total trip)

#### Prioritas Rendah 🟢
- [ ] **Chat masking** Customer ↔ Driver (nomor tersembunyi)
- [ ] **Navigasi GPS** saat order in_progress
- [ ] **Flash Sale Broadcast** ke customer radius 2km (geofence)
- [ ] **Supply Order** Industry → Merchant UMKM (bahan baku)

---

### 🌱 Phase 3 — Monetisasi Lokal
> Target: Platform menghasilkan pendapatan komunitas dan sistem ekonomi berputar sendiri.

- [ ] **Dompet Koperasi** — top-up, payout, transfer antar member (semua role)
- [ ] **SHU Koperasi Calculator** — kalkulasi otomatis bagi hasil tahunan driver
- [ ] **UMKM Supply Order** — Industry bisa kirim bahan baku ke merchant binaan
- [ ] **Demand Heatmap Realtime** — peta panas permintaan per jam per kecamatan
- [ ] **KYC Driver** — upload foto KTP + SIM, approval oleh Super Admin
- [ ] **Geofencing per Kecamatan** — driver hanya terima order di radius kerja
- [ ] **Program Pasar Murah** — Government beri subsidi harga ke merchant tertentu
- [ ] **Statistik Ekonomi Lokal** — dashboard chart perputaran uang, UMKM yang terbantu
- [ ] **Voucher Stamp Digital** — customer redeem poin ke UMKM mitra langsung

---

### 🛡️ Phase 4 — Anti-Fraud & Smart Civic
> Target: Platform aman, dipercaya komunitas, dan memiliki dampak civic nyata.

- [ ] **Deteksi GPS Tuyul** — validasi sinyal GPS dengan pola pergerakan driver
- [ ] **Liveness Detection** saat tarik dana (selfie verification)
- [ ] **Forum Driver** — chat komunitas + laporan kondisi jalan real-time
- [ ] **Pasar Warga** — flash deal lintas merchant dalam radius, batch notifikasi
- [ ] **Kontrak B2B Berjangka** — Industry bisa buat kontrak distribusi multi-hari
- [ ] **Laporan Dampak Sosial** — Government lihat berapa warga terbantu per program
- [ ] **Whitelist/Blacklist Driver** — Super Admin bisa suspend driver fraud
- [ ] **Titip Tetangga Algorithm** — auto-batching order searah rute driver aktif

---

### 🤖 Phase 5 — AI & Hyperlocal Intelligence
> Target: Platform menjadi "otak" ekosistem lokal yang prediktif dan adaptif.

- [ ] **Prediksi Demand** per jam per kecamatan (ML-based heatmap)
- [ ] **Auto-Batching Titip Tetangga** — AI matching order searah rute optimal
- [ ] **Rekomendasi UMKM Personalized** — berdasarkan histori order customer
- [ ] **Smart Subsidi Karcis** — Government alokasi subsidi ke driver berdasarkan demand
- [ ] **Forum AI Knowledge Base** — driver tanya, AI jawab berdasarkan pengalaman komunitas
- [ ] **Dynamic Pricing** — tarif menyesuaikan demand tanpa surge price predatory
- [ ] **Prediksi SHU** — estimasi bagi hasil tahunan berdasarkan tren perputaran ekosistem
- [ ] **UMKM Growth Advisor** — AI sarankan kapan sebaiknya Flash Sale, stok berapa

---

## 🏆 Keunggulan Kompetitif vs Aplikator Besar

### Yang Tidak Bisa Ditiru Gojek/Grab:
1. **Zero Commission** → Driver tidak kehilangan 30% setiap trip
2. **SHU Koperasi** → Keuntungan platform kembali ke driver & warga sebagai pemilik
3. **Civic Integration** → Pemda bisa broadcast, subsidi, dan pantau ekonomi lokal langsung
4. **Industry ↔ UMKM Supply Chain** → Distribusi bahan baku langsung dari industri ke warung
5. **Hyperlocal Trust** → KYC berbasis komunitas, bukan korporasi asing
6. **Data Sovereignty** → Data ekonomi lokal dimiliki koperasi, bukan perusahaan luar

---

## 📍 Konteks Hyperlocal: Surakarta (Solo)

| Data | Nilai |
|---|---|
| Koordinat Default | `lat: -7.5755, lng: 110.8243` |
| Radius Operasional Awal | 5 kecamatan inti Surakarta |
| Target Driver MVP | 50 Mitra Koperasi |
| Target Merchant MVP | 20 UMKM Kuliner + 5 Apotek/Mart |
| Target Customer MVP | Mahasiswa UNS + Warga Jebres & Laweyan |
| Demand Hotspots | Stasiun Solo Balapan, UNS, Pasar Gede, Manahan, Solo Square |
