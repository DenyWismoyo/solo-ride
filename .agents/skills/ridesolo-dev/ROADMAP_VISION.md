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

### ✅ Phase 2 — Ekosistem Terintegrasi & Smart Civic (SELESAI)
> Target: Semua ekosistem saling berbicara melalui Firestore realtime, notifikasi, dan standarisasi layanan 19 dinas.

- [x] **`serviceType` di OrderDocument** — ojek, mobil, kirim, kuliner, mart, pasar tradisional, pasar murah, titip, warta
- [x] **Notifikasi Realtime** (`notifications` collection) — order notification drawer & warta pemkot tab
- [x] **Pesanan Merchant Realtime** — Kitchen POS Kanban `onSnapshot` pesanan masuk
- [x] **Saved Address Modal** — Alamat tersimpan Rumah & Kantor dengan Google Maps picker
- [x] **Pusat Warta & Siaran Resmi Pemkot** — Civic Broadcast Publisher multi-target, Banner, Modal Hub Arsip, rute `/services/warta`
- [x] **Dinas Perdagangan Surakarta (`gov_disdag`)** — E-Voucher GPM, SIPAHAP Inflasi 44 Pasar, Beras SPHP Bulog, Tera Metrologi
- [x] **Rejection Flow & Immutable Audit Log** — Sub-collection `orders/{id}/auditLog`, modal tolak berstandar
- [x] **Emergency Bypass & SLA Rules** — Damkar, BPBD, PSC 119 bypass verification
- [x] **Zen Ultra-Minimalist Chrome** — Header Icon-Only 38px + Modal Pengaturan Akun Berbasis Kewenangan Role

---

### 🔧 Phase 3 — Live Tracking, Rating & Smart Economy ✅ (100% Selesai)
> Target: Pengalaman pelacakan real-time berkelas dunia, ulasan multi-dimensi, dan optimasi ekonomi pasar lokal.

- [x] **Live Order Tracking Polyline (`/order/[id]`)** — Visualisasi rute Google Maps dengan animasi pergerakan driver jemput & antar
- [x] **Modal Rating & Review Multi-Dimensi** — Bintang 1-5, keramahan pengemudi, kelezatan kuliner UMKM (`MultiRatingReviewModal.tsx`)
- [x] **Dynamic Flash Sale Subuh & Sore (`/merchant`)** — Form penjadwalan flash sale jam 05.30-08.00 & 16.30-19.30 (`FlashSaleLauncherModal.tsx`)
- [x] **Multi-Merchant Mixed Cart (Pasar Tradisional)** — Keranjang gabungan multi-kios Pasar Gede/Legi (`PasarMultiLapakCheckoutModal.tsx`)
- [x] **Simulasi Kalkulator SHU Koperasi** — Kalkulator proyeksi bagi hasil tahunan mitra driver (`SHUCalculator.tsx`)

---

### 🛡️ Phase 4 — Anti-Fraud, B2B Dedicated & Smart Civic ✅ (100% Selesai)
> Target: Platform aman, dipercaya komunitas, dan memiliki dampak civic nyata.

- [x] **Dedicated Industry B2B Workspace (`/industry`)** — Dashboard kargo, surat jalan digital, jadwal kirim pabrik
- [x] **Civic SLA Analytics Dashboard** — Gauge visual kecepatan respon aparat per OPD (`SLACountdownBadge.tsx` + `GovWorkspaceDispatcher.tsx`)
- [x] **Deteksi GPS Tuyul & Anti-Fraud** — Validasi pola kecepatan perpindahan koordinat (`fraud.ts` + `DriverCashoutModal.tsx`)
- [x] **Peta Agregasi Aduan Warga Kota Solo** — Heatmap sebaran insiden jalan & Pojok Rembug (`/community`)
- [x] **Kontrak B2B Berjangka** — Industry bisa buat kontrak distribusi multi-hari (`useContracts.ts` + `contract.service.ts`)
- [x] **Titip Tetangga Algorithm & Shared Pooling** — auto-batching order searah rute hemat 40% ongkir (`/services/titip`)


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
