# Satuan Polisi Pamong Praja (Satpol PP) Surakarta — Blueprint Operasional

**additionalRole**: `gov_satpolpp`  
**Status Implementasi**: ❌ CivicModal BELUM ADA | ❌ Workspace BELUM ADA  
**PRIORITAS**: 🟡 Sedang  
**Tipe Interaksi**: Kelompok D — Pengaduan/Laporan + Izin Keramaian

---

## Profil Dinas

| Atribut | Data |
|---------|------|
| Nama Lengkap | Satuan Polisi Pamong Praja Kota Surakarta |
| Alamat | Jl. Jenderal Sudirman No. 2, Surakarta |
| Telepon | (0271) 638311 |
| Piket 24 jam | Ada |
| Avatar/Emoji | 🛡️ |
| Warna Tema | Slate (`text-slate-500`, `bg-slate-500/10`) |

---

## Layanan yang Tersedia

### 1. `satpolpp_lapor_trantib` — Lapor Gangguan Ketertiban + Izin Acara
- **Sub A**: Laporan gangguan ketertiban (kebisingan, PKL liar, bangunan liar)
- **Sub B**: Permohonan izin acara keramaian (pengamanan event)

---

## Spesifikasi `SatpolppCivicModal.tsx`

```tsx
// Sub: Laporan Gangguan (default)
<select jenisGangguan>        {/* Kebisingan malam / Parkir liar / PKL liar / dll */}
<input lokasiKejadian />
<input rt />
<input rw />
<select kelurahan />
<select kecamatan />
<input waktuKejadian />        {/* Jam kejadian */}
<textarea deskripsiDetail />
<FileUpload fotoUrl optional />
<input kontakWa />

// Toggle: "Saya mengajukan izin acara keramaian" 
// Jika aktif → tampilkan form izin acara:
<input namaAcara />
<input tanggalAcara />
<input lokasiAcara />
<input estimasiPeserta type="number" />
<input namaOrganizer />
<input kontakOrganizer />
```

---

## Spesifikasi `GovSatpolppWorkspace.tsx`

### Tab 1: LAPORAN TRANTIB MAP
```
- Peta clustering laporan per kelurahan (heatmap)
- List laporan dengan kategori dan status
- Dispatch tim patroli ke lokasi laporan
- Filter: Belum ditangani / Sedang patroli / Selesai
```

### Tab 2: IZIN KERAMAIAN QUEUE
```
- Daftar permohonan izin acara
- Verifikasi kelengkapan dokumen
- Approve/Tolak dengan keterangan tertulis
- Jadwal pengawalan petugas Satpol PP
```

### Tab 3: PATROLI LOG
```
- Riwayat patroli hari ini per zona
- Jumlah pelanggaran yang ditindak
- Foto dokumentasi penertiban
```

---

## Filosofi "Patroli Humanis"

```
Satpol PP Surakarta dikenal dengan pendekatan humanis:
- Utamakan dialog dan teguran sebelum penertiban paksa
- PKL yang terdampak penertiban mendapat info relokasi ke kawasan binaan
- Koordinasi dengan Diskop untuk relokasi pedagang ke kios legal
→ Ini bisa diintegrasikan: PKL yang di-tertibkan bisa langsung daftar
  bantuan NIB dan kios binaan via Ride-Solo
```
