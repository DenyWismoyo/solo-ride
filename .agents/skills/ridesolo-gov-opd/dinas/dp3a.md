# DP3APM (Perlindungan Perempuan & Anak) Surakarta — Blueprint Operasional

**additionalRole**: `gov_dp3a`  
**Status Implementasi**: ✅ CivicModal ada | ✅ Workspace ada  
**PRIORITAS**: 🔴 Selesai — Privacy & Safety Critical  
**Tipe Interaksi**: Kelompok E — Emergency + Privacy-First

---

## Profil Dinas

| Atribut | Data |
|---------|------|
| Nama Lengkap | Dinas Pemberdayaan Perempuan, Perlindungan Anak & Pengendalian Penduduk (DP3APM) |
| Hotline Darurat | 119 ext 8 / (0271) 711123 |
| Puspaga (Konseling) | Jl. Veteran No. 18, Surakarta |
| Jam Hotline | 24 jam / 7 hari |
| Avatar/Emoji | 💜 |
| Warna Tema | Pink (`text-pink-500`, `bg-pink-500/10`) |

---

## ⚠️ ATURAN PRIVASI WAJIB

```
1. Mode anonim harus menjadi DEFAULT untuk layanan hotline kekerasan
2. Nama pemohon TIDAK disimpan plaintext di Firestore jika isAnonymous = true
3. Nomor WA pemohon TIDAK ditampilkan di workspace OPD yang bisa diakses umum
4. Nomor WA hanya digunakan server-side untuk SMS/WA relay
5. Detail kasus hanya bisa dilihat petugas dengan re-authentication
6. Workspace DP3A memiliki audit log akses otomatis
```

---

## Layanan yang Tersedia

### 1. `dp3a_hotline_sahabat_perempuan` — Hotline Darurat Kekerasan
- **Sifat**: DARURAT — bisa juga terjadwal untuk pendampingan
- **Biaya**: Gratis penuh (100% disubsidi)
- **Anonimitas**: DEFAULT anonim
- **Flow darurat**: Submit → OPD notify petugas → Tim respons dikirim ke lokasi aman

### 2. `dp3a_konseling_puspaga` — Booking Konseling Psikolog Puspaga
- **Sifat**: Terjadwal, tidak darurat
- **Biaya**: Gratis (sesi 60 menit per booking)
- **Anonimitas**: Opsional
- **Kapasitas**: Terbatas sesuai jadwal psikolog Puspaga

---

## Spesifikasi `Dp3aCivicModal.tsx` yang Harus Dibuat

### Mode A: Hotline Darurat (serviceId = "dp3a_hotline_sahabat_perempuan")

```tsx
// DESAIN: Tenang, tidak menakutkan, warna ungu/lavender bukan merah
// HEADER: Tampilkan pesan reassuring: "Kamu aman di sini. Identitasmu terlindungi."

// Toggle Anonimitas (DEFAULT = true untuk hotline):
<AnonymousToggle defaultOn={true} />
// Jika anonim: nama = auto-generate kode "Sahabat-XXXX"

// Form fields MINIMAL:
<select jenisKasus>           {/* KDRT / Kekerasan Seksual / dll */}
<input lokasiAman />          {/* "Di mana kamu SEKARANG?" — bukan alamat rumah! */}
// Tombol "Bagikan Lokasi Saya" → GPS auto-detect
<input kontakRahasia />       {/* WA aman yang bisa dihubungi */}
<select butuhPendampingan>    {/* Ya, butuh petugas datang / Tidak, cukup konsultasi */}
// Textarea deskripsi: OPSIONAL, dengan label "Tidak perlu tulis detail, aman untuk dikosongkan"

<button>💜 Hubungi Tim Sahabat Sekarang</button>

// Di bawah form: 
// "Atau hubungi langsung: 119 ext 8" (bisa diklik)
// "WhatsApp Sahabat: 081xxx" (bisa diklik)
```

### Mode B: Konseling Puspaga (serviceId = "dp3a_konseling_puspaga")

```tsx
// Lebih standar — tidak perlu anonim wajib
<input namaLengkap />
<select jenisKonseling>      {/* Pernikahan / Pola Asuh / Trauma / Remaja / Lansia */}
<input jadwalKonseling />    {/* Date picker + slot waktu yang tersedia */}
<input kontakWa />
<textarea keluhanSingkat />
```

---

## Spesifikasi `GovDp3aWorkspace.tsx` yang Harus Dibuat

### ⚠️ SECURITY: Workspace DP3A harus lebih restricted

```typescript
// Akses workspace DP3A harus re-authenticate dengan PIN khusus
// Semua aksi di workspace ini dicatat di audit log:
// { userId, action, timestamp, deviceInfo }
```

### Tab 1: KASUS AKTIF (tampilkan anonim)
```
- Tampilkan: Kode kasus, Kategori, Waktu masuk, Status
- SEMBUNYIKAN: Nama asli, Nomor WA (tampilkan "Kanal Aman Tersedia")
- Badge "Darurat" merah untuk kasus butuh pendampingan fisik
- Tombol "Tampilkan Detail Lengkap" → trigger re-auth PIN
- Tombol "Kirim Tim Respons"
- Tombol "Hubungkan ke Psikolog"
```

### Tab 2: JADWAL KONSELING PUSPAGA
```
- Kalender mingguan dengan slot tersedia
- Daftar psikolog aktif dan jadwalnya
- Konfirmasi booking dan kirim reminder ke pemohon
```

### Tab 3: PANTAU KEAMANAN
```
- Status korban yang sedang dalam pendampingan
- Lokasi safe house jika ada
- Timeline penanganan kasus
```

---

## Registrasi di more/page.tsx & gov/page.tsx

```typescript
// more/page.tsx:
const [isDp3aOpen, setIsDp3aOpen] = useState(false);
const [dp3aServiceId, setDp3aServiceId] = useState<string>("dp3a_hotline_sahabat_perempuan");

if (service.additionalRole === "gov_dp3a" || service.id.startsWith("dp3a_")) {
  setDp3aServiceId(service.id);
  setIsDp3aOpen(true);
  return;
}

<Dp3aCivicModal
  isOpen={isDp3aOpen}
  onClose={() => setIsDp3aOpen(false)}
  serviceId={dp3aServiceId}
/>

// gov/page.tsx:
{selectedDinasId === "gov_dp3a" && (
  <GovDp3aWorkspace orders={citizenRequests} loading={loadingRequests} />
)}
```
