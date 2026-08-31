# DPMPTSP (Mal Pelayanan Publik) Surakarta — Blueprint Operasional

**additionalRole**: `gov_dpmptsp`  
**Status Implementasi**: ❌ CivicModal BELUM ADA | ❌ Workspace BELUM ADA  
**PRIORITAS**: 🟡 Sedang  
**Tipe Interaksi**: Kelompok H — Usaha/Legalitas

---

## Profil Dinas

| Atribut | Data |
|---------|------|
| Nama Lengkap | Dinas Penanaman Modal dan Pelayanan Terpadu Satu Pintu (DPMPTSP) |
| Lokasi MPP | Mal Pelayanan Publik — Jl. Jenderal Sudirman No. 2 (Balai Kota) |
| Telepon | (0271) 717300 |
| Jam MPP | Senin–Jumat 08.00–15.30 WIB |
| Layanan Online | oss.go.id / mpp.surakarta.go.id |
| Avatar/Emoji | 🏢 |
| Warna Tema | Indigo (`text-indigo-500`, `bg-indigo-500/10`) |

---

## Layanan yang Tersedia

### 1. `dpmptsp_antar_sk_izin` — Antar Fisik SK Izin Usaha dari MPP
- **Target**: Pemohon izin usaha yang tidak bisa ambil sendiri ke MPP
- **Biaya**: Ongkir kurir resmi (flat)
- **Syarat**: SK harus sudah terbit dan siap diambil

---

## Spesifikasi `DpmptspCivicModal.tsx`

```tsx
<input namaUsaha />
<input nomorRegistrasiMPP />    {/* Nomor antrean/registrasi dari sistem MPP */}
<select jenisIzin>              {/* NIB / IMB-PBG / SITU / SIUP / dll */}
<input namaKontakPenerima />    {/* Nama yang menerima SK fisik */}
<input alamatKantor />          {/* Tujuan pengantaran */}
<input kontakWa />
<input nomorSK optional />      {/* Jika sudah tahu nomor SK */}
<textarea catatanPengambilan optional />

// Note: Tampilkan persyaratan pengambilan SK:
// "SK hanya diserahkan kepada pemohon atau yang dikuasakan dengan surat kuasa bermaterai"
```

---

## Spesifikasi `GovDpmptspWorkspace.tsx`

### Tab 1: SK SIAP ANTAR
```
- List SK yang sudah terbit dan siap dikirim
- Verifikasi nomor registrasi MPP
- Toggle "SK Sudah Disiapkan Petugas MPP" sebelum dispatch driver
- Catatan serah terima: nama penerima + tanda tangan digital
```

### Tab 2: ANTREAN MPP DIGITAL
```
- Status antrean walk-in hari ini per loket
- Estimasi waktu tunggu
- Tombol "Booking Antrean Online" untuk H+1
```

### Tab 3: STATISTIK PENERBITAN
```
- Jumlah izin terbit per bulan
- Breakdown per jenis izin
- Waktu rata-rata proses per jenis izin
```

---

## Integrasi OSS (Online Single Submission)

```typescript
// DPMPTSP Surakarta sudah terintegrasi dengan OSS (oss.go.id)
// Ride-Solo berperan sebagai "last-mile delivery" untuk SK fisik
// yang sudah terbit di sistem OSS

// Future: 
// - Booking antrean MPP via Ride-Solo dengan notifikasi
// - Status penerbitan izin bisa di-track di aplikasi
// - Notif push saat SK sudah bisa diambil/diantar
```
