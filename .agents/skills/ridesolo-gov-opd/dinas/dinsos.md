# Dinas Sosial Kota Surakarta — Blueprint Operasional

**additionalRole**: `gov_dinsos`  
**Status Implementasi**: ✅ CivicModal ada | ✅ Workspace ada  
**Tipe Interaksi**: Kelompok C — Bantuan Sosial

---

## Profil Dinas

| Atribut | Data |
|---------|------|
| Nama Lengkap | Dinas Sosial Kota Surakarta |
| Alamat | Jl. Arifin No. 2, Surakarta |
| Telepon | (0271) 637978 |
| Tagana (Relawan) | 24 jam siaga |
| Avatar/Emoji | 🤝 |
| Warna Tema | Rose (`text-rose-500`, `bg-rose-500/10`) |

---

## Layanan yang Tersedia

### 1. `dinsos_bansos_pasar` — Voucher Bansos & Tebus Sembako
- **Target**: Penerima PKH, KKS, BPNT terdaftar di DTKS
- **Proses**: Driver mengantar voucher ke kios sembako yang ditunjuk, lalu mengambil paket ke rumah penerima
- **Biaya**: Gratis 100% (disubsidi APBD)

### 2. `dinsos_ojek_difabel` — Armada Siaga Difabel & Lansia
- **Target**: Warga dengan disabilitas fisik, netra, tuli, lansia ≥75 tahun
- **Biaya**: Gratis 100% (subsidi APBD + koperasi)
- **Driver requirement**: Driver yang sudah mendapat pelatihan sensitivitas disabilitas

### 3. `dinsos_tanggap_bencana` — Logistik Dapur Umum
- **Sifat**: Darurat — koordinasi Tagana Dinsos
- **Pengguna**: Petugas Tagana/Dinsos yang input ke sistem, bukan customer biasa
- **Driver**: Bisa dispatch banyak driver sekaligus untuk logistik berat

---

## Aturan Eligibilitas Bansos

```typescript
// Petugas Dinsos WAJIB verifikasi di tab "Triage" workspace:
// 1. NIK penerima ada di database DTKS (Data Terpadu Kesejahteraan Sosial)
// 2. Nomor kartu PKH/KKS aktif
// 3. Belum menerima bansos bulan yang sama
// Jika tidak memenuhi: TOLAK dengan keterangan

// Untuk ojek difabel:
// 1. Verifikasi kondisi disabilitas dari surat keterangan RT/RS
// 2. Assign driver dengan kendaraan yang sesuai
```

---

## Form Fields (Lihat DinsosCivicModal.tsx)

```typescript
// Sub: bansos_pasar
namaKepalaKeluarga: string;
nikKepalaKeluarga: string;     // WAJIB — untuk verifikasi DTKS
nomorKartuPKH?: string;        // Nomor KKS/kartu bansos
paketSembako: PaketSembako;
alamatPenjemputan: string;

// Sub: ojek_difabel
namaWargaDifabel: string;
nik: string;
jenisDisabilitas: JenisDisabilitas;
alatBantu?: string;
tujuanPerjalanan: string;      // Puskesmas / RS / tujuan lain
waktuJemput: string;
kontakWaliPendamping?: string; // Kontak wali/pendamping jika ada

// Sub: tanggap_bencana
lokasiTerdampak: string;
jenisBencana: JenisBencana;
jumlahKK_terdampak: number;
kebutuhanLogistik: string[];   // Checkbox multi-pilih
```
