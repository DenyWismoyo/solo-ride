# Dinas Pendidikan Surakarta — Blueprint Operasional

**additionalRole**: `gov_disdik`  
**Status Implementasi**: ❌ CivicModal BELUM ADA | ❌ Workspace BELUM ADA  
**PRIORITAS**: 🟡 Sedang  
**Tipe Interaksi**: Kelompok A — Delivery/Antar Dokumen

---

## Profil Dinas

| Atribut | Data |
|---------|------|
| Nama Lengkap | Dinas Pendidikan Kota Surakarta |
| Alamat | Jl. Gajahan No. 44, Surakarta |
| Telepon | (0271) 638957 |
| Sekolah Mitra | SD, SMP, SMA/SMK Negeri se-Solo |
| Avatar/Emoji | 🎓 |
| Warna Tema | Blue (`text-blue-500`, `bg-blue-500/10`) |

---

## Layanan yang Tersedia

### 1. `disdik_antar_jemput_sekolah` — Antar Jemput Sekolah Bersubsidi
- **Target**: Siswa SD-SMP dalam zonasi dengan kesulitan mobilitas
- **Biaya**: Disubsidi dari BOS/APBD — ongkir Rp 0 untuk penerima PIP
- **Driver requirement**: Driver tersertifikasi "Ramah Anak" — latar belakang bersih, tidak merokok
- **Jadwal**: Pagi (06.30–07.30) dan siang (11.30–14.00)

### 2. `disdik_antar_ijazah_buku` — Antar Legalisir Ijazah & Paket BOS
- **Target**: Keluarga siswa yang tidak bisa ke sekolah untuk ambil dokumen
- **Biaya**: Tarif koperasi Rp 6.000–10.000

---

## Spesifikasi `DisdikCivicModal.tsx`

```tsx
// Sub: antar_jemput_sekolah
<input namaSiswa />
<input nisn />
<select namaSekolah>     {/* Dropdown sekolah zonasi Solo */}
<input kelasSekolah />   {/* Contoh: Kelas 3 SDN Mangkubumen */}
<input alamatPenjemputan />
<select jamBerangkat>    {/* 06.00/06.30/07.00 */}
<select jamPulang>       {/* Sesuai jadwal sekolah */}
<input kontakOrtuWali />
<textarea catatanKhusus /> {/* Alergi, kondisi kesehatan, kebutuhan khusus */}

// Sub: antar_ijazah_buku
<input namaAlumnus />
<input nisn />
<input asalSekolah />
<select jenisLegalisir>  {/* Ijazah / Raport / Buku BOS */}
<input jumlahDokumen type="number" />
<input alamatAntar />
<input kontakWa />
```

---

## Spesifikasi `GovDisdikWorkspace.tsx`

### Tab 1: JEMPUT SEKOLAH QUEUE
```
- Daftar siswa berdasarkan sekolah dan shift (pagi/siang)
- Cluster berdasarkan rute yang sama
- Tombol "Batch Dispatch" untuk cluster satu rute
- Status per siswa: Menunggu / Driver dikirim / Sudah dijemput
```

### Tab 2: LEGALISIR DOKUMEN
```
- Perlu verifikasi: NISN valid dari database Disdik
- Toggle "Dokumen Sudah Disiapkan Sekolah" sebelum dispatch driver
- Status pengiriman per dokumen
```

### Tab 3: ROSTER SEKOLAH MITRA
```
- Daftar sekolah yang bergabung program
- Kapasitas per sekolah (jumlah siswa tersubsidi)
- Kontak koordinator sekolah
```
