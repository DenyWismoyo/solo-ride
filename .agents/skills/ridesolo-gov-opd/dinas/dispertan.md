# Dinas Ketahanan Pangan & Pertanian Surakarta — Blueprint Operasional

**additionalRole**: `gov_dispertan`  
**Status Implementasi**: ❌ CivicModal BELUM ADA | ❌ Workspace BELUM ADA  
**PRIORITAS**: 🟡 Sedang  
**Tipe Interaksi**: Kelompok G — Booking/Reservasi (Homecare)

---

## Profil Dinas

| Atribut | Data |
|---------|------|
| Nama Lengkap | Dinas Ketahanan Pangan dan Pertanian Kota Surakarta |
| Puskeswan | Puskeswan Surakarta — Jl. Yosodipuro No. 98 |
| Telepon | (0271) 637934 |
| Dokter Hewan | 4 dokter hewan ASN aktif |
| Avatar/Emoji | 🐾 |
| Warna Tema | Emerald (`text-emerald-500`, `bg-emerald-500/10`) |

---

## Layanan yang Tersedia

### 1. `dispertan_klinik_hewan_homecare` — Dokter Hewan Homecare & Vaksin Rabies
- **Target**: Pemilik hewan peliharaan di Surakarta
- **Biaya**: Fasilitasi Pemkot (sangat terjangkau / subsidi sebagian)
- **Kapasitas**: Terbatas — booking wajib, tidak bisa walk-in
- **Hewan yang dilayani**: Kucing, anjing, kelinci, burung, unggas (ternak kecil)

---

## Spesifikasi `DispertanCivicModal.tsx`

```tsx
// Form booking homecare dokter hewan:
<input namaHewan placeholder="Nama hewan peliharaan" />
<select jenisHewan>          {/* Kucing / Anjing / Kelinci / Burung / Unggas / dll */}
<input rasHewan optional />  {/* Persia / Kampung / Golden Retriever / dll */}
<input usiaPerkiraanHewan /> {/* Contoh: 2 tahun 3 bulan */}
<textarea keluhan>           {/* Gejala sakit / tujuan kunjungan */}
<input riwayatVaksin optional />
<input riwayatObat optional />
<select layananDiminta>      {/* Pemeriksaan Umum / Vaksin Rabies / Sterilisasi / Konsultasi */}

<input tanggalJadwal type="date" />
<select slotWaktu>           {/* 08.00–10.00 / 10.00–12.00 / 13.00–15.00 */}

<input alamatHomecare />
<input kontakWa />
<FileUpload fotoHewan optional />  {/* Foto kondisi hewan saat ini */}
```

---

## Spesifikasi `GovDispertanWorkspace.tsx`

### Tab 1: JADWAL KUNJUNGAN DOKTER HEWAN
```
- Kalender mingguan dengan booking per slot
- Alokasi: Dokter hewan + driver pengantar
- Konfirmasi booking dan kirim reminder H-1
- Status: Booking / Dikonfirmasi / Sedang kunjungan / Selesai
```

### Tab 2: CATATAN MEDIS HEWAN
```
- Per booking: rekam diagnosis + treatment + resep
- Notifikasi vaksin ulang (H-30 sebelum jatuh tempo)
- Riwayat kunjungan per pemilik hewan
```

### Tab 3: GERAKAN PANGAN MURAH (GPM)
```
- Jadwal GPM (pasar murah bahan pokok) per kelurahan
- Komoditas dan harga yang tersedia
- Driver yang bertugas distribusi
```

---

## Catatan Implementasi Dokter Hewan

```typescript
// Driver berperan sebagai pengantar dokter hewan ke lokasi:
// 1. Driver jemput dokter hewan dari Puskeswan
// 2. Driver antar dokter ke alamat homecare customer
// 3. Dokter periksa hewan (30–60 menit)
// 4. Driver tunggu dan antar dokter kembali ke Puskeswan

// ATAU: Driver hanya sebagai kurir obat/vaksin jika pemeriksaan tidak diperlukan
// Ini tergantung sub-layanan yang dipilih customer
```
