# Disdukcapil Kota Surakarta — Blueprint Operasional Lengkap

**additionalRole**: `gov_dukcapil`  
**Status Implementasi**: ✅ CivicModal ada | ✅ Workspace ada  
**Tipe Interaksi**: Kelompok A — Delivery/Antar Dokumen  

---

## Profil Dinas

| Atribut | Data |
|---------|------|
| Nama Lengkap | Dinas Kependudukan dan Pencatatan Sipil Kota Surakarta |
| Alamat Kantor | Jl. Jenderal Sudirman No. 2, Surakarta |
| Telepon | (0271) 648585 |
| Jam Layanan | Senin–Jumat 08.00–15.30 WIB |
| Avatar/Emoji | 🪪 |
| Warna Tema | Blue (`text-blue-500`, `bg-blue-500/10`) |

---

## Layanan yang Tersedia

### 1. `dukcapil_antar_ktp` — Antar KTP-el & KK ke Rumah
- **Siapa yang bisa gunakan**: Semua warga Surakarta yang sudah punya NIK terdaftar
- **Biaya**: Subsidi Rp 10.000 (ongkir ditanggung bersama Koperasi & APBD)
- **SLA**: Pengantaran dalam 1–2 hari kerja setelah verifikasi
- **Driver requirement**: Driver reguler (tidak perlu sertifikasi khusus)
- **OTP serah terima**: WAJIB — kode 6 digit dikirim ke WA penerima

### 2. `dukcapil_kia_akte` — Antar KIA & Akta Kelahiran/Kematian
- **Biaya**: Subsidi Rp 10.000
- **Khusus**: Akta kematian wajib ada salinan dokumen pendukung (surat keterangan RT)
- **OTP serah terima**: WAJIB

### 3. `dukcapil_mobile_perekaman` — Jemput Bola Perekaman KTP Lansia/Difabel
- **Siapa yang bisa gunakan**: Lansia ≥75 tahun, penyandang disabilitas, sakit keras
- **Biaya**: Gratis (disubsidi APBD)
- **Driver requirement**: Driver dengan kendaraan yang bisa accommodate kursi roda (jika perlu)
- **Proses**: Driver mengantar Tim Dukcapil (petugas + perangkat rekam) ke lokasi, bukan sekadar kurir

---

## Form Customer — Field yang Wajib Ada

```typescript
// SUDAH DIIMPLEMENTASIKAN di DukcapilCivicModal.tsx
// Cek FORM_SPECIFICATIONS.md untuk field detail
interface DukcapilFormFields {
  nik: string;                     // WAJIB validasi 16 digit + prefix 3372
  namaLengkap: string;
  jenisLayanan: JenisLayananDukcapil;
  kecamatanAsal: KecamatanSolo;
  noHpWhatsapp: string;
  alamatAntar: string;
  // Jemput bola:
  isJemputBola?: boolean;
  alasanJemputBola?: AlasanJemputBola;
  waktuPilihan?: string;
}
```

---

## Workspace OPD — Fitur yang Diperlukan

**Tab 1: Triage Dokumen**
- Verifikasi NIK di database kependudukan (cek NIK + nama sesuai)
- Tombol "Setujui & Dispatch Driver"
- Tombol "Tolak dengan Keterangan"

**Tab 2: OTP Monitor**
- Daftar pengiriman aktif dengan status OTP
- Alert jika OTP belum dikonfirmasi > 30 menit setelah driver tiba

**Tab 3: Riwayat Berkas**
- Log semua dokumen yang sudah diantarkan
- Filter per jenis dokumen dan per kecamatan

---

## Integrasi Eksternal (Future)
- Database SIAK (Sistem Informasi Administrasi Kependudukan) untuk validasi NIK real-time
- Saat ini: verifikasi manual oleh petugas Dukcapil
