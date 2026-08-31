# Dinas Koperasi & UMKM Surakarta — Blueprint Operasional

**additionalRole**: `gov_diskop`  
**Status Implementasi**: ✅ CivicModal ada | ✅ Workspace ada  
**Tipe Interaksi**: Kelompok H — Usaha/Legalitas

---

## Profil Dinas

| Atribut | Data |
|---------|------|
| Nama Lengkap | Dinas Koperasi, Usaha Kecil, dan Menengah Kota Surakarta |
| Alamat | Jl. Slamet Riyadi No. 274, Surakarta |
| Telepon | (0271) 716464 |
| Avatar/Emoji | 🏦 |
| Warna Tema | Emerald (`text-emerald-500`, `bg-emerald-500/10`) |

---

## Layanan yang Tersedia

### 1. `diskop_shu_koperasi` — Dashboard Poin Stamp & SHU
- **Sifat**: Informasional — tidak butuh form panjang
- **Tampilan**: Dashboard poin user, estimasi SHU tahunan, status karcis driver

### 2. `diskop_nib_pendampingan` — Pendampingan NIB OSS di Tempat
- **Target**: Pedagang pasar, UMKM mikro yang belum punya NIB
- **Proses**: Petugas Diskop + driver datang ke lokasi usaha
- **Biaya**: Gratis (fasilitasi Pemkot)

### 3. `diskop_modal_bergulir` — Fasilitasi Dana Bergulir
- **Target**: UMKM mikro yang sudah punya NIB dan ikut pelatihan
- **Bunga**: 0% (dari pos anggaran koperasi)
- **Plafon**: Rp 1 juta – Rp 10 juta

---

## Form Fields (Lihat DiskopCivicModal.tsx)

```typescript
// Sub: nib_pendampingan
namaUsaha: string;
jenisUsaha: string;
skalaUsaha: "mikro" | "kecil";
sudahPunyaNIB: boolean;
nikPemilik: string;
alamatUsaha: string;
omzetBulananEstimasi?: number;  // Rp
kontakWa: string;

// Sub: modal_bergulir
namaUsaha: string;
nik: string;
jumlahPinjamanDiminta: number;  // Rp
rencanaPenggunaan: string;
agunanYangDimiliki?: string;
sudahIkutPelatihan: boolean;
```

---

## Integrasi SHU Koperasi

```typescript
// SHU dihitung dan didistribusikan tahunan dari AGENT (Cloud Function):
// - 40% dari margin platform dibagi ke driver anggota koperasi
// - 20% ke merchant UMKM yang aktif
// - 20% ke tabungan wajib koperasi
// - 20% ke dana sosial (subsidi ojek difabel, dll)
// Lihat ridesolo-bizengine/KARCIS_ROYALTY.md untuk rumus lengkap
```
