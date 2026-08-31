# Dinas Lingkungan Hidup (DLH) Surakarta — Blueprint Operasional

**additionalRole**: `gov_dlh`  
**Status Implementasi**: ❌ CivicModal BELUM ADA | ❌ Workspace BELUM ADA  
**PRIORITAS**: 🟡 Sedang  
**Tipe Interaksi**: Kelompok D — Pengaduan/Laporan + Jemput Sampah (Kelompok khusus dengan Eco Points)

---

## Profil Dinas

| Atribut | Data |
|---------|------|
| Nama Lengkap | Dinas Lingkungan Hidup Kota Surakarta |
| Alamat | Jl. Jend. Sudirman No. 2, Surakarta |
| Telepon | (0271) 645839 |
| Avatar/Emoji | 🌿 |
| Warna Tema | Emerald (`text-emerald-500`, `bg-emerald-500/10`) |

---

## Layanan yang Tersedia

### 1. `dlh_jemput_sampah_daur_ulang` — Jemput Sampah Bank Sampah RW
- **Sifat**: Scheduled (bukan darurat)
- **Biaya untuk customer**: Gratis — customer justru mendapat **Eco Points**
- **Biaya ongkir**: Dibayar dari program lingkungan DLH / koperasi
- **Driver requirement**: Driver motor reguler (bawa kantong penampung)
- **Flow unik**: Setelah jemput, driver menimbang → lapor ke workspace DLH → DLH award poin ke customer

### 2. `dlh_lapor_pohon_tumbang` — Lapor Pohon Rawan Tumbang
- **Sifat**: Laporan digital — tidak selalu butuh driver fisik
- **Biaya**: Gratis
- **Flow**: Laporan masuk → petugas DLH verifikasi → tim pemotongan pohon dikirim (bukan driver ojek!)

---

## Eco Points System

```typescript
// Konversi eco points per kg jenis sampah
const ECO_POINTS_PER_KG: Record<JenisSampah, number> = {
  kardus:   200,   // 1 kg kardus = 200 poin ≈ Rp 200
  plastik:  150,   // 1 kg plastik = 150 poin ≈ Rp 150
  besi:     500,   // 1 kg besi = 500 poin ≈ Rp 500
  kaca:     100,   // 1 kg kaca = 100 poin ≈ Rp 100
  jelantah: 300,   // 1 liter jelantah = 300 poin ≈ Rp 300
  kertas:   150,   // 1 kg kertas = 150 poin ≈ Rp 150
};

// Trigger award poin setelah petugas DLH konfirmasi berat aktual:
// updateDoc order { beratAktualKg, ecoPointsAwarded }
// increment(users/{customerId}.points, ecoPointsAwarded)
```

---

## Spesifikasi `DlhCivicModal.tsx` yang Harus Dibuat

### Sub-service: Jemput Sampah

```tsx
// Form fields:
<select jenisSampah multiple>  {/* checkbox: kardus, plastik, besi, dll */}
<input estimasiBeratKg type="number" min={1} max={500} />
<input rwBankSampah />          {/* RW bank sampah aktif */}
<input jadwalJemput type="date" min={tomorrow} />
<select slotWaktu>              {/* Pagi 07-10 / Siang 10-14 / Sore 14-17 */}
<input alamatRumah />
<input kontakWa />
<textarea catatanTambahan />

// Tampilkan estimasi poin yang akan didapat:
// "Estimasi Eco Points: ~450 poin (Rp 450)"
// Berdasarkan input estimasi berat dan jenis
```

### Sub-service: Lapor Pohon

```tsx
<select kondisiPohon>           {/* Miring berbahaya / Sudah tumbang / dll */}
<input lokasiPohon />           {/* Nama jalan + nomor rumah terdekat */}
<select kelurahan />
<select tingkatUrgensi>         {/* Segera / Normal */}
<input kontakWa />
<FileUpload fotoUrl optional />  {/* Upload foto pohon */}
```

---

## Spesifikasi `GovDlhWorkspace.tsx` yang Harus Dibuat

### Tab 1: JEMPUT SAMPAH QUEUE
```
- List permohonan dengan: Alamat, Jenis sampah, Estimasi berat, Jadwal
- Clustering: Grouping berdasarkan RW/kelurahan yang sama hari itu
- Tombol "Batch Dispatch": Kirim 1 driver untuk beberapa lokasi searah
- Status: Menunggu / Driver dikirim / Selesai ditimbang
```

### Tab 2: VERIFIKASI TIMBANGAN & AWARD POIN
```
- Daftar order "in_progress" yang menunggu konfirmasi berat aktual
- Input: Berat aktual per jenis sampah
- Kalkulasi otomatis: eco points yang akan diberikan
- Tombol "Konfirmasi & Award Poin" → trigger increment ke user.points
```

### Tab 3: LAPORAN POHON MAP
```
- Peta clustering lokasi pohon berbahaya
- Filter: Urgensi tinggi / Sudah tumbang / Normal
- Tombol "Assign Tim Pemotongan" (tim DLH sendiri, bukan driver ojek)
- Status: Dilaporkan / Dalam pengecekan / Sudah ditangani
```

### Tab 4: ANALYTICS LINGKUNGAN
```
- Total kg sampah terkumpul bulan ini per jenis
- RW paling aktif daur ulang (leaderboard)
- Total eco points yang sudah dibagikan
- Grafik tren bulanan
```

---

## Registrasi di more/page.tsx & gov/page.tsx

```typescript
// more/page.tsx — tambahkan state:
const [isDlhOpen, setIsDlhOpen] = useState(false);
const [dlhServiceId, setDlhServiceId] = useState<string>("dlh_jemput_sampah_daur_ulang");

// handleCardClick:
if (service.additionalRole === "gov_dlh" || service.id.startsWith("dlh_")) {
  setDlhServiceId(service.id);
  setIsDlhOpen(true);
  return;
}

// gov/page.tsx — tambahkan:
{selectedDinasId === "gov_dlh" && (
  <GovDlhWorkspace orders={citizenRequests} loading={loadingRequests} />
)}
```
