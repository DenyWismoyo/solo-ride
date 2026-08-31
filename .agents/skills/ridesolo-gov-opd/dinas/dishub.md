# Dinas Perhubungan Surakarta — Blueprint Operasional

**additionalRole**: `gov_dishub`  
**Status Implementasi**: ✅ CivicModal ada | ✅ Workspace ada  
**Tipe Interaksi**: Kelompok D — Pengaduan/Laporan

---

## Profil Dinas

| Atribut | Data |
|---------|------|
| Nama Lengkap | Dinas Perhubungan Kota Surakarta |
| Alamat | Jl. Menteri Supeno No. 7, Surakarta |
| Telepon | (0271) 635842 |
| Avatar/Emoji | 🚦 |
| Warna Tema | Yellow (`text-yellow-500`, `bg-yellow-500/10`) |

---

## Layanan yang Tersedia

### 1. `dishub_cfd_shelter` — Info CFD & Shelter BST
- **Sifat**: Informasional — tampilkan peta shelter ojek resmi dan jalur CFD
- **Tidak butuh form** — hanya tampilan peta dan informasi
- **Driver relevance**: Driver harus tahu titik shelter resmi untuk ambil/antar penumpang

### 2. `dishub_lapor_jalan` — Lapor Kemacetan & Lampu Lalu Lintas Rusak
- **Sifat**: Laporan digital — driver dan warga bisa lapor dari aplikasi
- **Tidak selalu butuh driver fisik** — laporan langsung ke database Dishub
- **SLA**: Respons 24 jam, aksi lapangan 48 jam

### 3. `dishub_kir_digital` — Booking Antrean Uji KIR
- **Target**: Driver angkutan umum, truk, angkutan barang yang wajib uji KIR berkala
- **Biaya**: Sesuai Perda Kota Surakarta
- **Proses**: Booking slot → konfirmasi → driver datang ke UPT KIR

---

## Form Fields (Lihat DishubCivicModal.tsx)

```typescript
// Sub: lapor_lalin
jenisLaporan: JenisLaporanLalin;
lokasiKejadian: string;           // Nama jalan / perempatan
kelurahan: string;
deskripsiDetail: string;
fotoEvidenceUrl?: string;
kontakWa: string;

// Sub: kir_digital
jenisKendaraan: "motor" | "mobil" | "angkutan_barang" | "bus";
nomorPolisi: string;              // Contoh: AD 1234 XY
jadwalKIR: string;                // Date picker dengan ketersediaan slot

// Sub: cfd_shelter
// Tidak butuh form — render peta shelter saja
```

---

## Integrasi Driver Ride-Solo dengan Dishub

Fitur unik: Driver Ride-Solo secara otomatis menjadi **relawan pelapor** kondisi jalan:
- Setiap driver yang sedang online bisa lapor kondisi jalan dari dashboard driver
- Laporan otomatis tercatat dengan GPS koordinat presisi
- Driver yang lapor mendapat **bonus poin stamp** sebagai insentif

```typescript
// Di dashboard driver, tambahkan shortcut "Lapor Jalan":
// → Buka form ringkas Dishub dengan GPS auto-fill
// → Submit → tambah poin driver
```
