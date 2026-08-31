# Dinas Tenaga Kerja & Perindustrian Surakarta — Blueprint Operasional

**additionalRole**: `gov_disnaker`  
**Status Implementasi**: ❌ CivicModal BELUM ADA | ❌ Workspace BELUM ADA  
**PRIORITAS**: 🟢 Rendah–Sedang  
**Tipe Interaksi**: Kelompok A — Delivery/Antar Dokumen

---

## Profil Dinas

| Atribut | Data |
|---------|------|
| Nama Lengkap | Dinas Tenaga Kerja dan Perindustrian Kota Surakarta |
| Alamat | Jl. Arifin No. 2, Surakarta |
| Telepon | (0271) 649100 |
| BLK | Balai Latihan Kerja — Jl. Bhayangkara No. 34 |
| Avatar/Emoji | 👷 |
| Warna Tema | Orange (`text-orange-500`, `bg-orange-500/10`) |

---

## Layanan yang Tersedia

### 1. `disnaker_kartu_kuning_ak1` — Antar Kartu AK-1 + Daftar BLK
- **Target**: Pencari kerja berdomisili Surakarta
- **Proses**: Driver ambil kartu AK-1 yang sudah jadi dari kantor Disnaker → antar ke rumah

### 2. `disnaker_pelatihan_blk` (Sub dari kartu_kuning_ak1)
- **Kursus tersedia**: Barista, Las, Digital Marketing, Menjahit, Tata Boga, Pemrograman
- **Biaya kursus**: Gratis (dibiayai APBN/APBD)
- **Durasi**: 1–3 bulan tergantung kursus

---

## Spesifikasi `DisnakerCivicModal.tsx`

```tsx
// Sub: Kartu Kuning AK-1
<input namaLengkap />
<input nik />
<select pendidikanTerakhir>    {/* SD / SMP / SMA/SMK / D1-D3 / S1+ */}
<textarea bidangKeahlian optional />
<input alamatKtp />
<input alamatAntar />          {/* Ke mana kartu diantar — bisa beda dengan alamat KTP */}
<input kontakWa />

// Toggle: "Saya juga ingin daftar kursus BLK"
// Jika toggle aktif:
<select minatKursusBLK>        {/* Dropdown kursus yang tersedia */}
<input ketersediaanWaktu />    {/* Contoh: Pagi hari, Senin-Jumat */}
```

---

## Spesifikasi `GovDisnakerWorkspace.tsx`

### Tab 1: KARTU KUNING QUEUE
```
- Verifikasi NIK dan pendidikan terakhir
- Status kartu: "Sedang diproses" / "Siap diambil" / "Sudah diantar"
- Tombol "Dispatch Driver" setelah kartu siap
```

### Tab 2: PENDAFTARAN BLK
```
- List pendaftar per kursus
- Kapasitas: slot tersedia / total
- Konfirmasi keikutsertaan dan kirim jadwal via WA
- Filter: Menunggu konfirmasi / Terkonfirmasi / Lulus / Tidak lulus
```

### Tab 3: PENGADUAN KETENAGAKERJAAN
```
- List pengaduan UMK/THR/PHK
- Kategori dan batas waktu penanganan (SLA)
- Forward ke mediator ketenagakerjaan
- Status: Diterima / Mediasi / Selesai / Dilimpahkan ke Pengadilan
```
