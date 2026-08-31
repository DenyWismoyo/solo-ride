# Dinas Perpustakaan & Kearsipan Surakarta — Blueprint Operasional

**additionalRole**: `gov_dispusip`  
**Status Implementasi**: ❌ CivicModal BELUM ADA | ❌ Workspace BELUM ADA  
**PRIORITAS**: 🟢 Rendah–Sedang  
**Tipe Interaksi**: Kelompok A — Delivery/Antar Dokumen

---

## Profil Dinas

| Atribut | Data |
|---------|------|
| Nama Lengkap | Dinas Perpustakaan dan Kearsipan Kota Surakarta |
| Alamat | Jl. Kolonel Sutarto No. 4, Surakarta |
| Telepon | (0271) 656890 |
| Jam Perpustakaan | Senin–Jumat 08.00–16.00, Sabtu 08.00–13.00 |
| Avatar/Emoji | 📚 |
| Warna Tema | Purple (`text-purple-500`, `bg-purple-500/10`) |

---

## Layanan yang Tersedia

### 1. `dispusip_kurir_buku` — Pinjam & Antar Buku Fisik ke Rumah
- **Target**: Anggota perpustakaan kota Solo
- **Biaya**: Ongkir flat Rp 6.000 (antar + jemput kembali)
- **OTP pengembalian**: Kode OTP saat buku dikembalikan ke driver

---

## Spesifikasi `DispusipCivicModal.tsx`

```tsx
<input noAnggotaPerpus placeholder="Nomor Kartu Anggota" />
// Note: Jika belum punya kartu → tampilkan link daftar online Perpustakaan Kota

<input judulBukuDiminta />
<select kategoriPustaka>      {/* Fiksi / Non-Fiksi / Referensi / Anak / Remaja */}
<select durasiPeminjaman>     {/* 7 hari / 14 hari / 21 hari */}
<input alamatAntar />
<input kontakWa />
<textarea catatanTambahan>    {/* Alternatif judul jika tidak tersedia */}

// Setelah submit → tampilkan:
// "Petugas perpustakaan akan mengecek ketersediaan buku Anda dalam 2 jam"
// Jika tersedia: driver akan dikirim dalam hari yang sama (sebelum pkl 14.00)
```

---

## Spesifikasi `GovDispusipWorkspace.tsx`

### Tab 1: PERMINTAAN BUKU
```
- List permintaan dengan judul buku
- Tombol "Tersedia" → dispatch driver ambil dari perpus
- Tombol "Tidak Tersedia" → kirim notif ke customer, suggest alternatif
- Filter: Menunggu verifikasi / Driver sudah dikirim
```

### Tab 2: BUKU AKAN KEMBALI
```
- Daftar buku yang masa pinjam H-3 dan H-1 (reminder)
- Tombol "Kirim Reminder WA" ke peminjam
- Tombol "Dispatch Driver Jemput" jika sudah H+0 (harus kembali hari ini)
```

### Tab 3: KOLEKSI POPULER
```
- 10 judul buku paling banyak diminta bulan ini
- Statistik genre favorit pembaca Solo
- Saran pengadaan buku baru berdasarkan demand
```
