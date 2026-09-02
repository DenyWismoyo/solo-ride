# 🛡️ MITIGASI RISIKO V2 — ANALISIS KOMPETITIF
## Siap Menghadapi Tantangan & Ancaman Ekosistem
### *Ride-Solo Pitch Deck V2 · Dokumen Manajemen Risiko*

---

## MATRIKS RISIKO KOMPREHENSIF

| Risiko | Kemungkinan | Dampak | Skor | Prioritas |
|--------|------------|--------|------|-----------|
| Persaingan agresif Gojek/Grab | Sangat Tinggi | Tinggi | 🔴 Kritis | 1 |
| Adopsi lambat driver (inertia) | Tinggi | Tinggi | 🔴 Kritis | 2 |
| Ketergantungan infrastruktur Google | Tinggi | Sedang | 🟡 Tinggi | 3 |
| Perubahan regulasi mendadak | Sedang | Tinggi | 🟡 Tinggi | 4 |
| Kapasitas teknis STP | Sedang | Sedang | 🟡 Tinggi | 5 |
| Kualitas driver & UX customer | Sedang | Sedang | 🟡 Sedang | 6 |
| Fraud & penyalahgunaan sistem | Sedang | Tinggi | 🟡 Tinggi | 7 |
| Ketergantungan subsidi Pemkot | Rendah | Tinggi | 🟢 Terkontrol | 8 |
| Platform crash / downtime | Rendah | Sedang | 🟢 Terkontrol | 9 |

---

## RISIKO 1: PERSAINGAN AGRESIF GOJEK/GRAB (KRITIS)

### Skenario Ancaman yang Mungkin

```
SKENARIO A — "Predatory Pricing":
  Gojek/Grab turunkan tarif drastis di Solo untuk 3 bulan
  → Tujuan: Membuat driver tetap di platform mereka
  
SKENARIO B — "Driver Lock-in":
  Gojek/Grab naikkan bonus driver Solo selama masa adopsi Ride-Solo
  → Tujuan: Membuat driver tidak mau pindah ke koperasi
  
SKENARIO C — "UMKM Poaching":
  GoFood berikan 6 bulan komisi 0% untuk UMKM Solo
  → Tujuan: Menghentikan UMKM bergabung Ride-Solo
  
SKENARIO D — "Lobby Regulasi":
  Gojek/Grab lobby ke Pemkot agar tidak endorse platform kompetitor
  → Tujuan: Mencegah SK Walikota diterbitkan
```

### Strategi Mitigasi

| Skenario | Mitigasi | Keunggulan Ride-Solo |
|---------|----------|---------------------|
| Predatory Pricing | Fokus pada nilai SHU & perlindungan koperasi — bukan kompetisi harga | Driver Ride-Solo dapat SHU — Gojek tidak akan pernah bisa tawarkan ini |
| Driver Lock-in | Komunitas koperasi — identitas & representasi kolektif | Driver Ride-Solo punya suara di RAT — bukan sekadar "mitra" |
| UMKM Poaching | 0% komisi PERMANEN vs 0% komisi SEMENTARA Gojek | UMKM Ride-Solo juga dapat data pelanggan — Gojek tidak mau beri ini |
| Lobby Regulasi | STP = lembaga Pemkot — conflict of interest untuk Pemkot menolak | Gojek adalah swasta asing — STP adalah milik Pemkot sendiri |

**Keunggulan Asimetris Ride-Solo:**
> Gojek/Grab bisa duplikasi harga, tapi **tidak bisa duplikasi model koperasi, identitas lokal, dan integrasi civic government**.

---

## RISIKO 2: ADOPSI LAMBAT DRIVER (KRITIS)

### Mengapa Driver Sulit Pindah Platform

```
"Sunk Cost Fallacy":
  Driver sudah 3–5 tahun bangun rating di Gojek/Grab
  Pindah ke Ride-Solo = mulai dari rating 0
  → Mereka merasa "rugi" meski secara finansial lebih untung

"Risk Aversion":
  "Platform baru = tidak pasti. Gojek sudah pasti ada ordernya."
  → Driver takut pendapatan turun di awal

"Switching Cost Sosial":
  Komunitas driver masih mayoritas di Gojek/Grab
  → Minoritas di Ride-Solo terasa sepi
```

### Strategi Mitigasi Bertahap

**Phase 1 (Bulan 1–3): Komunitas Pangkalan**
```
Target: 50 driver dari komunitas ojek pangkalan yang sudah kenal satu sama lain
Pendekatan:
  · Rekrut ketua komunitas ojek pangkalan dulu → dia jadi "brand ambassador"
  · 1 ketua bisa bawa 10–20 anggotanya
  · Free karcis 3 bulan pertama (disubsidi Pemkot)
  · Pendampingan onboarding intensif
```

**Phase 2 (Bulan 4–6): Demonstrasi Nyata**
```
Target: Media melihat, driver Gojek tertarik
Pendekatan:
  · Undang wartawan Solo untuk lihat driver yang take-home-nya naik
  · Testimonial video "Pak Budi dari Laweyan: saya tambah Rp 1,3 juta/bln"
  · Pamer aplikasi di car free day Slamet Riyadi
```

**Phase 3 (Bulan 7–12): FOMO (Fear of Missing Out)**
```
Target: Snowball organik
Pendekatan:
  · Pengumuman SHU perdana (meski kecil) → viral di komunitas driver
  · "Teman saya sudah dapat bonus dari Ride-Solo — saya belum"
  · Ekspansi ke WhatsApp group driver Solo
```

---

## RISIKO 3: KETERGANTUNGAN INFRASTRUKTUR GOOGLE

### Vulnerabilities Saat Ini

```
Google Maps Platform:
  · Digunakan untuk: RouteMap, Places API, Geocoding, Directions
  · Estimasi biaya: Rp 3.000.000–5.000.000/bln
  · Risiko: Google naikkan tarif API (sudah terjadi 2018, 2022)
  
Firebase:
  · Digunakan untuk: Auth, Firestore, Storage, Functions
  · Estimasi biaya: Rp 2.000.000–4.000.000/bln
  · Risiko: Perubahan free tier, harga scaling tidak linear
```

### Mitigasi Bertahap

| Fase | Strategi | Timeline |
|------|---------|----------|
| **Fase 1** (Saat ini) | Pakai Google Maps + Firebase — optimal untuk startup | 2026–2027 |
| **Fase 2** | Implementasi caching agresif untuk kurangi API call Maps | 2027–2028 |
| **Fase 3** | Evaluasi OpenStreetMap (Leaflet.js) untuk rute non-kritis | 2028–2029 |
| **Fase 4** | Hybrid: Google Maps untuk UX premium, OSM untuk fallback | 2029+ |

---

## RISIKO 4: PERUBAHAN REGULASI MENDADAK

### Regulasi yang Perlu Dipantau

| Regulasi | Status 2026 | Skenario Risiko | Mitigasi |
|---------|------------|----------------|----------|
| Keppres No. 7/2026 (Koperasi Digital) | ✅ Mendukung | Dicabut pemerintah baru | Legalitas PP Koperasi lebih kuat |
| Kemenhub Ojol 2026 | ✅ Mendukung lokal | Penyesuaian persyaratan | STP fleksibel — lembaga pemerintah |
| UU PDP (Perlindungan Data) | ✅ Sudah compliance | Audit mendadak | Audit log + privacy masking sudah ada |
| Perpajakan Platform Digital | 🟡 Dalam evaluasi | Kena PPN platform | Struktur koperasi tidak profit-oriented |

---

## RISIKO 5: FRAUD & PENYALAHGUNAAN SISTEM

### Potensi Kecurangan yang Teridentifikasi

```
FRAUD ORDER PALSU (Order Fiktif):
  Pelaku: Driver buat akun customer fiktif → order ke diri sendiri
  Dampak: Ambil karcis gratis (threshold trip terpenuhi)
  
  MITIGASI:
  → GPS verification: koordinat pickup/dropoff harus masuk akal
  → Deteksi: customer baru tanpa history → order ke driver sama → flag
  → Admin: suspicious activity dashboard di Super Admin panel
  
PENIPUAN KARCIS (Fake Payment):
  Pelaku: Driver lapor karcis sudah dibayar tapi tidak bayar
  Dampak: Kehilangan pendapatan koperasi
  
  MITIGASI:
  → Karcis digital — pembayaran melalui dompet digital Ride-Solo
  → Tidak ada karcis cash — semua tercatat di Firestore
  → Ledger harian transparan yang bisa driver cek sendiri
  
MERCHANT FRAUD:
  Pelaku: UMKM terima order tapi klaim tidak diterima
  Dampak: Customer complain, driver rugi ongkos jemput
  
  MITIGASI:
  → Timestamp order masuk di Kitchen Stream — tidak bisa disangkal
  → Sistem escalation: auto-refund jika merchant tidak konfirmasi 15 mnt
  → Rating & review customer → akun merchant bermasalah bisa di-suspend
  
GOV ORDER FRAUD:
  Pelaku: Warga submit permohonan palsu untuk layanan dinas
  Dampak: Menguras waktu petugas OPD
  
  MITIGASI:
  → KTP verification untuk layanan tertentu (NIK check via Dukcapil API)
  → Audit log seluruh permohonan — bisa di-trace dan di-block
  → "Rejection with reason" — warga yang sering fraud masuk blacklist
```

---

## RISIKO 6: KAPASITAS TEKNIS STP

### Kondisi Saat Ini

```
KELEBIHAN RIDE-SOLO (Bukan Risiko Lagi):
  ✅ Platform sudah selesai dibangun (29 rute live)
  ✅ Teknologi Next.js 16 + Firebase = maintenance minimal
  ✅ Codebase TypeScript strict — lebih mudah maintain
  ✅ Komponen modular — developer baru bisa langsung kontribusi

YANG MASIH PERLU DISIAPKAN:
  · Minimal 1 full-time developer di STP untuk maintenance
  · DevOps: monitoring uptime + alerting
  · Backup & disaster recovery plan
  · Penetration testing sebelum go-live
```

### Rencana Tim Teknis

| Posisi | Status | Kebutuhan |
|--------|--------|-----------|
| Lead Developer | STP internal | Full-time maintenance |
| QA Engineer | Kontrak/freelance | Testing sebelum launch |
| DevOps | Kontrak/part-time | Firebase + Vercel hosting |
| Customer Support | STP staff | Training 1 minggu |

---

## KESIMPULAN: RIDE-SOLO SUDAH LEBIH SIAP DARI V1

```
RISIKO YANG SUDAH TERATASI SEJAK PITCH DECK V1:

✅ Platform belum dibangun → TERATASI: Platform 100% live
✅ Tidak ada proof of concept → TERATASI: 29 rute terkompilasi
✅ Model bisnis belum terbukti → TERATASI: Formula karcis + SHU sudah matang
✅ Civic layer belum ada → TERATASI: 19 OPD terintegrasi penuh
✅ UMKM tools belum ada → TERATASI: Flash Sale, Kitchen Stream, POS live

RISIKO YANG MASIH ADA DAN DIKELOLA:
⚠️ Persaingan Gojek/Grab → Mitigasi: Keunggulan asimetris koperasi
⚠️ Adopsi lambat → Mitigasi: Strategi komunitas + subsidi awal Pemkot
⚠️ Infrastruktur Google → Mitigasi: Roadmap hybrid 2028+
```

---

*Ride-Solo Pitch Deck V2 · Solo Technopark · September 2026*
