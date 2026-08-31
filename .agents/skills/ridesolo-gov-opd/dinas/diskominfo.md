# Diskominfo & Statistik Surakarta — Blueprint Operasional

**additionalRole**: `gov_diskominfo`  
**Status Implementasi**: ❌ CivicModal BELUM ADA | ❌ Workspace BELUM ADA  
**PRIORITAS**: 🟡 Sedang  
**Tipe Interaksi**: Kelompok D — Pengaduan Digital (ULAS)

---

## Profil Dinas

| Atribut | Data |
|---------|------|
| Nama Lengkap | Dinas Komunikasi, Informatika dan Statistik Kota Surakarta |
| Alamat | Jl. Jenderal Sudirman No. 2, Surakarta |
| Telepon | (0271) 711222 |
| Platform ULAS | ulas.surakarta.go.id |
| SLA Respons | 1 × 24 jam hari kerja |
| Avatar/Emoji | 📡 |
| Warna Tema | Blue (`text-blue-500`, `bg-blue-500/10`) |

---

## Layanan yang Tersedia

### 1. `diskominfo_ulas_terpadu` — Kanal Aduan ULAS Surakarta
- **Sifat**: Laporan digital — tidak membutuhkan driver fisik
- **Integrasi**: Forward ke dinas terkait berdasarkan kategori aduan
- **SLA**: Respons 1×24 jam, aksi lapangan 2×48 jam

---

## Spesifikasi `DiskominfoC ivicModal.tsx`

```tsx
// Desain: Mirip form laporan publik — clean, informatif
// Tampilkan: nomor tiket ULAS setelah submit

<input namaWarga />
<input nik />
<select kategoriAduan>          {/* Dropdown kategori ULAS */}
<input judulAduan placeholder="Ringkasan singkat aduan" />
<textarea isiAduan maxLength={500} />
<input lokasiKejadian />
<select kelurahan />
<select kecamatan />
<FileUpload fotoEvidenceUrl optional />
<input kontakWa />

// Setelah submit:
// Tampilkan: "Nomor Tiket ULAS: ULAS-2026-XXXXX"
// "Laporan Anda akan ditindaklanjuti dalam 1 × 24 jam hari kerja"
```

---

## Spesifikasi `GovDiskominfoWorkspace.tsx`

### Tab 1: ULAS ADUAN TRIAGE
```
- Daftar aduan masuk dengan kategori dan kelurahan
- Filter: Belum ditindak / Sedang diproses / Selesai
- SLA Timer: Countdown 24 jam per aduan
- Tombol "Forward ke Dinas Terkait" dengan dropdown pilihan dinas
- Tombol "Tandai Selesai" + input respons resmi
```

### Tab 2: SLA MONITORING
```
- Alert: Aduan yang SLA-nya < 2 jam lagi
- Statistik respons: Rata-rata penyelesaian per kategori
- Heatmap: Kelurahan paling banyak laporan
```

### Tab 3: BROADCAST ANTI-HOAKS
```
- Form buat siaran klarifikasi hoaks yang beredar di Solo
- Target: Semua warga / Driver / UMKM
- Riwayat siaran anti-hoaks yang sudah dipublikasikan
```

---

## Integrasi dengan Platform ULAS Eksisting

```typescript
// Ride-Solo tidak menggantikan ULAS — ia menjadi KANAL TAMBAHAN
// Semua laporan yang masuk via Ride-Solo:
// 1. Tersimpan di Firestore (untuk dashboard real-time)
// 2. Secara opsional di-sync ke API ULAS via Cloud Function (future)
// 3. Nomor tiket bisa di-generate lokal sampai integrasi API tersedia

const generateUlasTicket = (): string => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 90000) + 10000;
  return `ULAS-${year}-${random}`;
};
```
