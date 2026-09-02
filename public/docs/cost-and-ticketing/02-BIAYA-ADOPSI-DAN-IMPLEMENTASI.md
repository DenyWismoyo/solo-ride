# 🚀 BIAYA ADOPSI & IMPLEMENTASI
## Dari Platform Selesai ke Ekosistem Beroperasi Penuh
### *Cost & Ticketing Series · Dokumen 2 dari 7*

---

> **Keuntungan Kritis:** Platform Ride-Solo sudah selesai dibangun (29 rute live, build 100% sukses).
> Biaya yang dibahas di sini bukan biaya membangun — tapi biaya **mengadopsi, mendeploykan, dan mengoperasikan** platform yang sudah siap.

---

## FASE ADOPSI — GAMBARAN BESAR

```
FASE 0 (Bulan 0): PERSIAPAN LEGAL & GOVERNANCE        [Rp 5.000.000]
FASE 1 (Bulan 1–2): DEPLOYMENT & KONFIGURASI          [Rp 35.500.000]
FASE 2 (Bulan 3–6): ONBOARDING & SOFT LAUNCH           [Rp 134.500.000]
FASE 3 (Bulan 7–12): STABILISASI & SCALING             [Rp 88.000.000]
──────────────────────────────────────────────────────
TOTAL TAHUN PERTAMA (CAPEX + OPEX)                     [Rp 263.000.000]
```

---

## FASE 0: PERSIAPAN LEGAL & GOVERNANCE (Bulan 0)

### Item Biaya

| Item | Estimasi Biaya | Keterangan |
|------|---------------|------------|
| Konsultasi hukum pendirian Koperasi Mitra Ride-Solo | Rp 3.000.000 | Notaris + akta pendirian koperasi |
| Pengurusan NIB koperasi | Rp 500.000 | DPMPTSP Solo |
| Penyusunan AD/ART koperasi | Termasuk konsultasi | — |
| Pendaftaran merek "Ride-Solo" ke DJKI | Rp 1.500.000 | Kelas 38 (Telekomunikasi) |
| **TOTAL FASE 0** | **Rp 5.000.000** | |

---

## FASE 1: DEPLOYMENT & KONFIGURASI (Bulan 1–2)

### A. Setup Infrastruktur Cloud

| Item | Estimasi Biaya | Keterangan |
|------|---------------|------------|
| Setup Firebase project production | Rp 0 | Dilakukan oleh tim STP |
| Konfigurasi Firestore rules production | Rp 0 | Tim STP |
| Setup Google Maps API keys + billing | Rp 0 | Tim STP |
| Konfigurasi Vercel deployment | Rp 0 | Tim STP |
| Setup domain ridesolo.surakarta.go.id | Rp 500.000/tahun | Subdomain .go.id via Kominfo |
| Setup SSL certificate | Rp 0 | Let's Encrypt / Vercel auto |
| **Sub-total Infrastruktur** | **Rp 500.000** | |

### B. Konfigurasi Data Awal (Seed Data)

| Item | Estimasi Biaya | Keterangan |
|------|---------------|------------|
| Input data 44 pasar tradisional Solo | Rp 2.000.000 | Data entry + verifikasi koordinat GPS |
| Input data 19 OPD (struktur layanan) | Rp 4.750.000 | Rp 250.000 × 19 dinas |
| Konfigurasi BizConfig (tarif awal) | Rp 0 | Admin STP |
| Setup koordinat Hotspot Demand Solo | Rp 0 | Admin STP |
| Seed data landmark & POI Solo | Rp 0 | Sudah di `surakartaPlaces.ts` |
| **Sub-total Seed Data** | **Rp 6.750.000** | |

### C. Pengujian & Quality Assurance

| Item | Estimasi Biaya | Keterangan |
|------|---------------|------------|
| Penetration testing (keamanan) | Rp 5.000.000 | Jasa PT konsultan keamanan |
| Load testing (simulasi 100 driver + 1.000 user) | Rp 3.000.000 | Jasa QA + tools |
| UAT (User Acceptance Testing) bersama 10 driver beta | Rp 2.500.000 | Uang transport + kompensasi driver |
| UAT bersama 5 staf OPD | Rp 1.250.000 | Uang transport |
| Bug fixing pasca-UAT | Rp 5.000.000 | Tim STP (estimasi 40 jam) |
| **Sub-total QA** | **Rp 16.750.000** | |

### D. Setup Monitoring & Alerting

| Item | Estimasi Biaya | Keterangan |
|------|---------------|------------|
| Firebase Crashlytics setup | Rp 0 | Gratis |
| Sentry.io monitoring (error tracking) | Rp 1.500.000/tahun | Plan team |
| Uptime monitoring (UptimeRobot) | Rp 0 | Free tier cukup |
| **Sub-total Monitoring** | **Rp 1.500.000** | |

### E. Aset Desain & Materi

| Item | Estimasi Biaya | Keterangan |
|------|---------------|------------|
| Desain ulang ikon app (branding resmi STP) | Rp 3.000.000 | Desainer grafis |
| Pembuatan materi sosialisasi digital (poster, video) | Rp 5.000.000 | Tim kreatif |
| Cetak brosur fisik driver & UMKM (2.000 lembar) | Rp 2.000.000 | Percetakan |
| **Sub-total Aset** | **Rp 10.000.000** | |

**TOTAL FASE 1: Rp 35.500.000**

---

## FASE 2: ONBOARDING & SOFT LAUNCH (Bulan 3–6)

### A. Pelatihan Staf OPD (19 Dinas)

| Item | Detail | Biaya |
|------|--------|-------|
| Workshop OPD Klaster A (Kesehatan & Sosial — 4 dinas) | 1 hari, 5 staf/dinas | Rp 2.000.000 |
| Workshop OPD Klaster B (Ekonomi & Perizinan — 4 dinas) | 1 hari, 5 staf/dinas | Rp 2.000.000 |
| Workshop OPD Klaster C (Infrastruktur — 4 dinas) | 1 hari, 5 staf/dinas | Rp 2.000.000 |
| Workshop OPD Klaster D (Pendidikan, OR, Pariwisata — 3 dinas) | 1 hari | Rp 1.500.000 |
| Workshop OPD Klaster E (Komunikasi & Perencanaan — 2 dinas) | 1 hari | Rp 1.000.000 |
| Workshop Emergency (BPBD + Damkar — 2 dinas) | 1 hari khusus | Rp 2.000.000 |
| Modul pelatihan digital (PDF + video) | Per-dinas | Rp 5.000.000 |
| Pendampingan on-site 1 bulan pertama | 1 staf STP keliling | Rp 3.000.000 |
| Hotline support staf OPD (3 bulan) | WhatsApp + call center | Rp 5.000.000 |
| **Sub-total Pelatihan OPD** | | **Rp 23.500.000** |

### B. Rekrutmen & Onboarding Driver Perdana (50 Driver)

| Item | Detail | Biaya |
|------|--------|-------|
| Rekrutmen via komunitas ojek pangkalan | Koordinator komunitas per kelurahan | Rp 5.000.000 |
| Workshop onboarding driver (2 sesi × 25 driver) | Venue + konsumsi + materi | Rp 4.000.000 |
| Subsidi karcis 3 bulan perdana (50 driver) | 50 × Rp 15.000 × 90 hari | **Rp 67.500.000** |
| Asuransi mikro driver (3 bulan awal) | Rp 50.000/driver/bln × 50 × 3 | Rp 7.500.000 |
| App tester fee (10 driver beta, 2 minggu) | Rp 100.000/hari × 10 × 14 | Rp 14.000.000 |
| **Sub-total Driver Onboarding** | | **Rp 98.000.000** |

### C. Onboarding UMKM Mitra (20 Merchant)

| Item | Detail | Biaya |
|------|--------|-------|
| Rekrutmen UMKM via Disdag & komunitas | — | Rp 0 (via kanal Pemkot) |
| Workshop merchant (2 sesi × 10 merchant) | Venue + konsumsi | Rp 2.000.000 |
| Foto produk profesional per merchant | 10 menu × Rp 50.000 × 20 merchant | Rp 10.000.000 |
| 3 bulan fee keanggotaan gratis | 20 × Rp 75.000 × 3 | Rp 4.500.000 |
| **Sub-total UMKM Onboarding** | | **Rp 16.500.000** |

**TOTAL FASE 2: Rp 138.000.000**

---

## FASE 3: STABILISASI & SCALING (Bulan 7–12)

### A. Operasional Tim Inti (6 Bulan)

| Posisi | Gaji/Bln | 6 Bulan |
|--------|---------|---------|
| Platform Manager (koordinasi ekosistem) | Rp 8.000.000 | Rp 48.000.000 |
| Customer Support & Driver Relations | Rp 4.000.000 | Rp 24.000.000 |
| **Sub-total Tim** | | **Rp 72.000.000** |

### B. Marketing & Growth

| Item | Biaya |
|------|-------|
| Iklan media sosial (Instagram, Facebook Solo) | Rp 6.000.000 |
| Kolaborasi influencer lokal Solo | Rp 3.000.000 |
| Event car free day sosialisasi (2 kali) | Rp 2.000.000 |
| Laporan evaluasi 6 bulan ke Pemkot | Rp 1.000.000 |
| **Sub-total Marketing** | **Rp 12.000.000** |

### C. Contingency & Buffer

| Item | Biaya |
|------|-------|
| Buffer teknis (bug fixing, improvement) | Rp 4.000.000 |
| **Sub-total Contingency** | **Rp 4.000.000** |

**TOTAL FASE 3: Rp 88.000.000**

---

## RINGKASAN TOTAL BIAYA ADOPSI TAHUN 1

| Fase | Periode | Biaya |
|------|---------|-------|
| Fase 0: Legal & Governance | Bulan 0 | Rp 5.000.000 |
| Fase 1: Deployment & Konfigurasi | Bulan 1–2 | Rp 35.500.000 |
| Fase 2: Onboarding & Soft Launch | Bulan 3–6 | Rp 138.000.000 |
| Fase 3: Stabilisasi & Scaling | Bulan 7–12 | Rp 88.000.000 |
| Infrastruktur Teknis Tahun 1 | Sepanjang tahun | Rp 150.000 |
| **TOTAL TAHUN 1** | | **Rp 266.650.000** |

### Breakdown Sumber Dana

```
APBD / Program STP:
  Infrastruktur & Deployment         : Rp 35.500.000
  Pelatihan OPD                      : Rp 28.500.000
  Asuransi & Kompensasi Driver Beta  : Rp 21.500.000
  Tim Operasional (6 bln)            : Rp 72.000.000
  Marketing                          : Rp 12.000.000
  ─────────────────────────────────────────────────
  Sub-total APBD                     : Rp 169.500.000

Subsidi Koperasi (dari kas STP):
  Subsidi Karcis 3 Bulan (50 driver) : Rp 67.500.000
  Fee UMKM Gratis 3 bulan            : Rp 4.500.000
  UMKM Photo Session                 : Rp 10.000.000
  ─────────────────────────────────────────────────
  Sub-total Koperasi                 : Rp 82.000.000

Legal & Misc:
  Pendirian koperasi + merek         : Rp 5.000.000
  Monitoring tools                   : Rp 1.500.000
  ─────────────────────────────────────────────────
  Sub-total Misc                     : Rp 6.500.000

TOTAL                                : Rp 258.000.000
(Selisih Rp 8.650.000 adalah buffer contingency)
```

---

*Ride-Solo Cost & Ticketing Series · Dokumen 2/7 · Solo Technopark · September 2026*
