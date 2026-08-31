# Dinas Kebudayaan & Pariwisata Surakarta — Blueprint Operasional

**additionalRole**: `gov_dispar`  
**Status Implementasi**: ✅ CivicModal ada | ✅ Workspace ada  
**Tipe Interaksi**: Kelompok G — Booking/Reservasi

---

## Profil Dinas

| Atribut | Data |
|---------|------|
| Nama Lengkap | Dinas Kebudayaan dan Pariwisata Kota Surakarta |
| Alamat | Jl. Brigjen Slamet Riyadi No. 275, Surakarta |
| Telepon | (0271) 711232 |
| Avatar/Emoji | 🏛️ |
| Warna Tema | Amber (`text-amber-500`, `bg-amber-500/10`) |

---

## Layanan yang Tersedia

### 1. `dispar_heritage_tour` — Rute Wisata Heritage Solo
- **Destinasi**: Keraton Surakarta, Pura Mangkunegaran, Museum Radya Pustaka, Pasar Triwindu, Kampung Batik Laweyan
- **Driver**: Driver mitra dengan pengetahuan rute wisata (bisa double sebagai guide ringan)
- **Biaya**: Mulai Rp 35.000 (tarif wisata, bukan tarif ojek biasa)

### 2. `dispar_tiket_event` — Kalender Event & Tiket Budaya
- **Event utama**: Kirab 1 Suro, Solo Batik Carnival, International Mask Festival, Sekaten
- **Sifat**: Informasional + reservasi tiket (belum ada payment gateway tiket event)

### 3. `dispar_pemandu_wisata` — Booking Guide HPI
- **Target**: Wisatawan yang butuh pemandu resmi bersertifikat HPI (Himpunan Pramuwisata Indonesia)
- **Biaya**: Tarif terstandar Dinas (Rp 200rb–500rb/hari tergantung bahasa & rombongan)

---

## Form Fields (Lihat DisparCivicModal.tsx)

```typescript
// Sub: heritage_tour
namaWisatawan: string;
jumlahRombongan: number;          // 1–50 orang
tanggalKunjungan: string;         // Date picker
destinasiDipilih: DestinasiHeritage[];  // Multi-select
preferensiBahasa: "id" | "en" | "ja" | "cn";
kontakWa: string;

// Sub: pemandu_wisata
sertifikasiHPI: boolean;          // Wajib bersertifikat?
namaGuide?: string;               // Request guide tertentu (opsional)
tanggalTour: string;
durasiJam: number;                // Pilihan: 3/6/8 jam

// Sub: tiket_event
namaEvent: string;
jumlahTiket: number;
```

---

## Kalender Event Tetap Surakarta

```typescript
// Event yang sudah pasti setiap tahun (untuk konten di-app):
const SOLO_CALENDAR_EVENTS = [
  { bulan: 1, nama: "Tahun Baru Imlek — Pasar Gede" },
  { bulan: 2, nama: "Sekaten (Perayaan Maulid Nabi)" },
  { bulan: 4, nama: "Solo Batik Carnival" },
  { bulan: 7, nama: "Kirab 1 Suro (Malam 1 Muharram)" },
  { bulan: 8, nama: "International Mask Festival Surakarta" },
  { bulan: 10, nama: "Solo International Performing Arts (SIPA)" },
  { bulan: 11, nama: "Solo Great Sale" },
];
```
