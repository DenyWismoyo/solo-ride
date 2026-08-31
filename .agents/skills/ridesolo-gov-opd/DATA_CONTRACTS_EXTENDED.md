# TypeScript Data Contracts — Layanan Pemerintahan Ride-Solo (Phase 2 Blueprint)

> **File ini mendefinisikan interface TypeScript lengkap** untuk setiap `citizenDetails`
> yang tersimpan di Firestore per jenis layanan dinas.
>
> **Target file**: `src/types/gov.types.ts` (buat jika belum ada, import dari order.types.ts)
> **Status**: Interface sudah lengkap dan komprehensif — ini adalah kontrak resmi yang
> harus dipatuhi oleh form, workspace, dan service layer.
>
> Format anotasi: ✅ Field sudah ada di form | ⚠️ Phase 2 — belum ada di form

---

## Enum & Shared Types

```typescript
// src/types/gov.types.ts

export type KecamatanSolo =
  | "Laweyan"
  | "Serengan"
  | "Pasar Kliwon"
  | "Jebres"
  | "Banjarsari";

// Dropdown options untuk UI:
export const KECAMATAN_SOLO_OPTIONS: KecamatanSolo[] = [
  "Laweyan", "Serengan", "Pasar Kliwon", "Jebres", "Banjarsari"
];

export type PuskesmasSolo =
  | "Puskesmas Penumping"
  | "Puskesmas Jayengan"
  | "Puskesmas Kratonan"
  | "Puskesmas Gajahan"
  | "Puskesmas Sangkrah"
  | "Puskesmas Purwosari"
  | "Puskesmas Sondakan"
  | "Puskesmas Laweyan"
  | "Puskesmas Pajang"
  | "Puskesmas Banyuanyar"
  | "Puskesmas Manahan"
  | "Puskesmas Nusukan"
  | "Puskesmas Sibela"
  | "Puskesmas Gilingan"
  | "Puskesmas Gambirsari"
  | "Puskesmas Pucangsawit"
  | "Puskesmas Jebres";

export const PUSKESMAS_SOLO_OPTIONS: PuskesmasSolo[] = [
  "Puskesmas Penumping", "Puskesmas Jayengan", "Puskesmas Kratonan",
  "Puskesmas Gajahan", "Puskesmas Sangkrah", "Puskesmas Purwosari",
  "Puskesmas Sondakan", "Puskesmas Laweyan", "Puskesmas Pajang",
  "Puskesmas Banyuanyar", "Puskesmas Manahan", "Puskesmas Nusukan",
  "Puskesmas Sibela", "Puskesmas Gilingan", "Puskesmas Gambirsari",
  "Puskesmas Pucangsawit", "Puskesmas Jebres"
];

export type JenisDisabilitas =
  | "netra"
  | "tuli"
  | "fisik_kursi_roda"
  | "lansia_75_plus"
  | "lainnya";

export type JenisBencana =
  | "banjir"
  | "kebakaran"
  | "angin_puting_beliung"
  | "lainnya";

export type StatusPermohonan =
  | "pending_verification"  // Masuk dari customer, belum diverifikasi OPD
  | "pending"               // Disetujui OPD, masuk radar driver
  | "accepted"              // Driver menerima
  | "in_progress"           // Driver sedang menuju/mengerjakan
  | "completed"             // Selesai, OTP sudah dikonfirmasi (jika berlaku)
  | "cancelled"             // Dibatalkan oleh customer
  | "rejected";             // Ditolak OPD dengan keterangan

// Utilitas validasi NIK Solo:
export const isValidNIKSolo = (nik: string): boolean =>
  nik.length === 16 && nik.startsWith("3372") && /^\d+$/.test(nik);

// Utilitas validasi koordinat Solo:
export const isValidGPSSolo = (lat: number, lng: number): boolean =>
  lat >= -7.7 && lat <= -7.4 && lng >= 110.7 && lng <= 110.9;
```

---

## Interface per Dinas

### 1. Dukcapil (`gov_dukcapil`)

```typescript
// ✅ Form sudah ada: DukcapilAntarKtpForm, DukcapilKiaAkteForm, DukcapilMobilePerekamanForm
// ⚠️ Phase 2: Tambah kecamatanAsal di form; enforce validasi NIK prefix 3372

export type JenisLayananDukcapil =
  | "ktp_el"
  | "kk"
  | "kia"
  | "akta_lahir"
  | "akta_kematian"
  | "legalisir";

export type AlasanJemputBola = "lansia" | "difabel" | "sakit_keras";

export interface DukcapilDetails {
  serviceId: string;
  serviceName: string;
  nik: string;                          // ✅ 16 digit, prefix 3372 (wajib enforce Phase 2)
  namaLengkap: string;                  // ✅
  jenisLayanan: JenisLayananDukcapil;   // ✅
  kecamatanAsal?: KecamatanSolo;        // ⚠️ Phase 2 — belum ada di form
  noHpWhatsapp: string;                 // ✅
  alamatAntar?: string;                 // ✅

  // Jika jemput bola (mobile_perekaman):
  isJemputBola?: boolean;               // ✅
  alasanJemputBola?: AlasanJemputBola;  // ✅
  keteranganKondisi?: string;           // ✅
  waktuPilihan?: string;                // ✅

  // OTP serah terima (generated otomatis oleh useCivicOrder):
  otpCode?: string;                     // 6 digit
  otpVerifiedAt?: string;               // ISO timestamp
  otpVerifiedByDriver?: string;         // UID driver

  // Aksi OPD:
  verifiedNIK?: boolean;                // Petugas centang NIK valid
  rejectionReason?: string;             // Jika ditolak

  submittedAt: string;
}
```

---

### 2. Dinkes (`gov_dinkes`)

```typescript
// ✅ Form sudah ada: DinkesResepObatForm, DinkesProlanisForm, DinkesDonorDarahForm
// ⚠️ Phase 2: Tambah noBpjs dan catatanAlergi di form resep & prolanis

export type SubLayananDinkes =
  | "resep_puskesmas"
  | "prolanis"
  | "donor_darah";

export type GolonganDarah = "A" | "B" | "AB" | "O";

export interface DinkesDetails {
  serviceId: string;
  serviceName: string;
  subLayanan: SubLayananDinkes;         // ✅
  noRekamMedis: string;                 // ✅
  noBpjs?: string;                      // ⚠️ Phase 2 — belum ada di form
  asalPuskesmas?: PuskesmasSolo;        // ✅
  namaObat?: string;                    // ✅ privasi — opsional
  catatanAlergi?: string;               // ⚠️ Phase 2 — belum ada di form
  namaWaliPenerima: string;             // ✅

  // Sub: donor_darah (emergency):
  rsujuanDarah?: string;                // ✅
  golDarah?: GolonganDarah;             // ✅
  rhesus?: "+" | "-";                   // ✅
  jumlahKantong?: number;               // ✅
  namaKontakPMI?: string;               // ✅
  notesUrgency?: string;                // ✅
  isEmergencyDonor?: boolean;           // ⚠️ Phase 2 — untuk mark as priority

  // Aksi farmasi (diisi petugas sebelum dispatch driver):
  obatSudahDisiapkan?: boolean;         // ⚠️ Phase 2 — toggle di workspace Dinkes
  namaFarmasiPenyiap?: string;

  kontakWa: string;
  submittedAt: string;
}
```

---

### 3. Dinsos (`gov_dinsos`)

```typescript
// ✅ Form sudah ada: DinsosBansosSembakoForm, DinsosOjekDifabelForm, DinsosTanggapBencanaForm
// ⚠️ Phase 2: Multi-select kebutuhanLogistik; field alatBantu di ojek difabel

export type SubLayananDinsos =
  | "bansos_pasar"
  | "ojek_difabel"
  | "tanggap_bencana";

export type PaketSembako = "paket_A" | "paket_B" | "paket_C";

export interface DinsosDetails {
  serviceId: string;
  serviceName: string;
  subLayanan: SubLayananDinsos;

  // Sub: bansos_pasar
  namaKepalaKeluarga?: string;          // ✅
  nikKepalaKeluarga?: string;           // ✅ (pastikan validasi NIK)
  nomorKartuPKH?: string;               // ✅
  paketSembako?: PaketSembako;          // ✅
  sourceMarket?: string;                // ✅ Pasar asal

  // Sub: ojek_difabel
  namaWargaDifabel?: string;            // ✅
  jenisDisabilitas?: JenisDisabilitas;  // ✅
  alatBantu?: string;                   // ⚠️ Phase 2 — belum ada di form
  tujuanPerjalanan?: string;            // ✅
  waktuJemput?: string;                 // ✅
  kontakWaliPendamping?: string;        // ✅

  // Sub: tanggap_bencana
  lokasiTerdampak?: string;             // ✅
  jenisBencana?: JenisBencana;          // ✅
  jumlahKK_terdampak?: number;          // ✅
  kebutuhanLogistik?: string[];         // ⚠️ Phase 2 — perlu multi-select di form

  // Verifikasi OPD:
  terverifikasiDTKS?: boolean;          // Petugas cek database DTKS
  nik: string;
  kontakWa: string;
  submittedAt: string;
}
```

---

### 4. Diskop (`gov_diskop`)

```typescript
// ✅ Form sudah ada: DiskopLegalitasNibForm, DiskopDanaBergulirForm
// ⚠️ Phase 2: Tambah omzetBulananEstimasi dan agunanYangDimiliki

export type SubLayananDiskop =
  | "legalitas_nib"
  | "dana_bergulir"
  | "pelatihan_umkm"
  | "shu_koperasi";

export interface DiskopDetails {
  serviceId: string;
  serviceName: string;
  subLayanan: SubLayananDiskop;
  namaUsaha?: string;                   // ✅
  jenisUsaha?: string;                  // ✅
  skalaUsaha?: "mikro" | "kecil";       // ✅
  sudahPunyaNIB?: boolean;              // ✅
  nikPemilik: string;                   // ✅
  omzetBulananEstimasi?: number;        // ⚠️ Phase 2 — belum ada di form
  alamatUsaha?: string;                 // ✅

  // Sub: dana_bergulir
  jumlahPinjamanDiminta?: number;       // ✅
  rencanaPenggunaan?: string;           // ✅
  agunanYangDimiliki?: string;          // ⚠️ Phase 2 — belum ada di form
  sudahIkutPelatihan?: boolean;         // ✅

  // Sub: pelatihan_umkm
  jenisPelatihan?: string;
  jadwalPelatihan?: string;

  kontakWa: string;
  submittedAt: string;
}
```

---

### 5. Dispar (`gov_dispar`)

```typescript
// ✅ Form sudah ada: DisparHeritageTourForm
// ⚠️ Phase 2: Ubah destinasiDipilih jadi multi-select checkbox di form

export type SubLayananDispar =
  | "heritage_tour"
  | "tiket_event"
  | "pemandu_wisata";

export type DestinasiHeritage =
  | "keraton"
  | "mangkunegaran"
  | "radya_pustaka"
  | "triwindu"
  | "kampung_batik";

export const DESTINASI_OPTIONS: { id: DestinasiHeritage; label: string }[] = [
  { id: "keraton", label: "Keraton Kasunanan Surakarta" },
  { id: "mangkunegaran", label: "Pura Mangkunegaran" },
  { id: "radya_pustaka", label: "Museum Radya Pustaka" },
  { id: "triwindu", label: "Pasar Triwindu (Antik)" },
  { id: "kampung_batik", label: "Kampung Batik Laweyan" },
];

export interface DisparDetails {
  serviceId: string;
  serviceName: string;
  subLayanan: SubLayananDispar;
  namaWisatawan: string;                // ✅
  jumlahRombongan: number;              // ✅
  tanggalKunjungan?: string;            // ✅
  destinasiDipilih?: DestinasiHeritage[]; // ⚠️ Phase 2 — single select saat ini
  preferensiBahasa?: "id" | "en" | "ja" | "cn"; // ✅
  namaEvent?: string;
  jumlahTiket?: number;
  sertifikasiHPI?: boolean;
  namaGuide?: string;
  durasiJam?: number;
  kontakWa: string;
  submittedAt: string;
}
```

---

### 6. Dishub (`gov_dishub`)

```typescript
// ✅ Form sudah ada: DishubLaporLalinForm, DishubBookingKirForm, DishubCfdShelterView
// Status: Sudah cukup lengkap, tidak ada gap kritikal Phase 2

export type SubLayananDishub =
  | "lapor_lalin"
  | "booking_uji_kir"
  | "cfd_shelter";

export type JenisLaporanLalin =
  | "kemacetan"
  | "lampu_lalu_lintas_rusak"
  | "rambu_rusak"
  | "jalan_berlubang"
  | "pohon_tumbang_lalin";

export interface DishubDetails {
  serviceId: string;
  serviceName: string;
  subLayanan: SubLayananDishub;

  // Sub: lapor_lalin
  jenisLaporan?: JenisLaporanLalin;
  lokasiKejadian?: string;
  kelurahan?: string;
  deskripsiDetail?: string;
  fotoEvidenceUrl?: string;

  // Sub: booking_uji_kir
  jenisKendaraan?: "motor" | "mobil" | "angkutan_barang" | "bus";
  nomorPolisi?: string;
  jadwalKIR?: string;

  kontakWa: string;
  submittedAt: string;
}
```

---

### 7. Bapenda (`gov_bapenda`)

```typescript
// ✅ Form BapendaPbbForm sudah ada
// ❌ Phase 2: BapendaRetribusiPasarForm dan BapendaKonsultasiPajakForm belum dibuat

export type SubLayananBapenda =
  | "pbb_online"
  | "retribusi_pasar"
  | "konsultasi_pajak";

export interface BapendaDetails {
  serviceId: string;
  serviceName: string;
  subLayanan: SubLayananBapenda;

  // Sub: pbb_online (✅ sudah ada)
  nomorNOP_SPPT?: string;               // Format: 33.71.xxx.xxx.xxx-xxxx.x
  tahunPajak?: number;
  nominalTagihan?: number;
  metodePembayaran?: "qris" | "wallet" | "virtual_account";

  // Sub: retribusi_pasar (❌ Phase 2 — form belum ada)
  idKiosPasar?: string;
  namaKios?: string;
  tanggalRetribusi?: string;
  nominalRetribusi?: number;

  // Sub: konsultasi_pajak (❌ Phase 2 — form belum ada)
  jenisKonsultasi?: "npwpd_baru" | "keberatan_pajak" | "insentif_umkm" | "pemutihan";
  namaUsaha?: string;
  pertanyaanKonsultasi?: string;
  jadwalKonsultasi?: string;

  nik: string;
  kontakWa: string;
  submittedAt: string;
}
```

---

### 8. Disdik (`gov_disdik`)

```typescript
// ✅ DisdikAntarSekolahForm sudah ada
// ❌ Phase 2: DisdikAntarIjazahForm belum ada

export type SubLayananDisdik =
  | "antar_jemput_sekolah"
  | "antar_ijazah_buku";

export interface DisdikDetails {
  serviceId: string;
  serviceName: string;
  subLayanan: SubLayananDisdik;

  // Sub: antar_jemput_sekolah (✅ sudah ada)
  namaSiswa: string;
  nisn: string;                         // 10 digit
  namaSekolah: string;
  kelasSekolah?: string;
  alamatPenjemputan?: string;
  jamBerangkat?: string;
  jamPulang?: string;
  kontakOrtuWali: string;
  catatanKhusus?: string;               // ⚠️ Phase 2 — mungkin belum ada

  // Sub: antar_ijazah_buku (❌ Phase 2 — form belum ada)
  namaAlumnus?: string;
  asalSekolah?: string;
  jenisLegalisir?: "ijazah" | "raport" | "buku_bos";
  jumlahDokumen?: number;               // Min 1, Max 10

  submittedAt: string;
}
```

---

### 9. DLH (`gov_dlh`)

```typescript
// ✅ DlhBankSampahForm, DlhLaporPohonForm sudah ada
// ⚠️ Phase 2: Pastikan jenisSampah[] multi-select dan estimasiBeratKg number input

export type JenisSampah = "kardus" | "plastik" | "besi" | "kaca" | "jelantah" | "kertas";
export const JENIS_SAMPAH_OPTIONS: { id: JenisSampah; label: string }[] = [
  { id: "kardus", label: "Kardus / Karton" },
  { id: "plastik", label: "Plastik (Botol, Ember, dll)" },
  { id: "besi", label: "Besi / Logam" },
  { id: "kaca", label: "Kaca / Botol Beling" },
  { id: "jelantah", label: "Minyak Jelantah" },
  { id: "kertas", label: "Kertas / Koran" },
];

export const ECO_POINTS_PER_KG: Record<JenisSampah, number> = {
  kardus: 200,
  plastik: 150,
  besi: 500,
  kaca: 100,
  jelantah: 300,
  kertas: 150,
};

export type SubLayananDLH =
  | "jemput_sampah_daur_ulang"
  | "lapor_pohon_tumbang";

export interface DlhDetails {
  serviceId: string;
  serviceName: string;
  subLayanan: SubLayananDLH;

  // Sub: jemput_sampah (✅ dengan gap Phase 2)
  namaPemohon?: string;
  rwBankSampah?: string;
  jenisSampah?: JenisSampah[];          // ⚠️ Phase 2 — perlu multi-select di form
  estimasiBeratKg?: number;             // ⚠️ Phase 2 — perlu number input
  jadwalJemput?: string;

  // Sub: lapor_pohon (✅ sudah ada)
  lokasiPohon?: string;
  kelurahan?: string;
  kecamatan?: KecamatanSolo;
  kondisiPohon?: "miring_berbahaya" | "sudah_tumbang" | "butuh_perantingan" | "menghalangi_kabel";
  tingkatUrgensi?: "segera" | "normal";
  fotoUrl?: string;

  // Hasil verifikasi OPD (diisi petugas DLH di workspace):
  beratAktualKg?: number;               // Berat aktual setelah ditimbang
  ecoPointsAwarded?: number;            // Poin eco yang diberikan ke customer

  kontakWa: string;
  submittedAt: string;
}
```

---

### 10. Damkar (`gov_damkar`)

```typescript
// ✅ DamkarPanicDispatchForm sudah ada
// ⚠️ Phase 2 KRITIKAL: Tambah GPS auto-detect, jenisDarurat enum, tingkatKeparahan
// ❌ Phase 2: DamkarAnimalRescueForm belum ada (terpisah dari panic)

export type SubLayananDamkar =
  | "panic_button"        // Emergency kebakaran/ledakan/gas bocor
  | "animal_rescue";      // Non-emergency rescue hewan/sarang tawon

export type JenisDarurat = "kebakaran" | "ledakan" | "orang_terjebak" | "gas_bocor";
export type JenisRescue = "sarang_tawon_vespa" | "ular" | "hewan_terjebak" | "cincin_macet" | "lainnya";

export interface DamkarDetails {
  serviceId: string;
  serviceName: string;
  subLayanan: SubLayananDamkar;

  // GPS (⚠️ Phase 2 — wajib ada auto-detect):
  gpsLat?: number;                      // Auto-detect via navigator.geolocation
  gpsLng?: number;
  alamatManual: string;                 // ✅ Konfirmasi manual (selalu ada sebagai fallback)

  // Sub: panic_button (⚠️ Phase 2 — enum masih kurang):
  emergencyCategory?: string;           // ✅ Saat ini text, Phase 2 ubah ke enum:
  jenisDarurat?: JenisDarurat;          // ⚠️ Phase 2 — belum ada, ganti emergencyCategory
  tingkatKeparahan?: "besar" | "sedang" | "kecil"; // ⚠️ Phase 2 — belum ada

  // Sub: animal_rescue (❌ Phase 2 — belum ada form terpisah):
  jenisRescue?: JenisRescue;
  deskripsiDetail?: string;
  waktuPilihan?: string;

  // Response data (diisi petugas Damkar di workspace):
  posTermdekat?: string;                // Pos Damkar terdekat yang direspons
  petugasDispatch?: string;
  waktuDispatch?: string;
  responseTimeMinutes?: number;         // Untuk analytics response time

  reporterName?: string;                // ✅
  kontakWa: string;                     // ✅
  submittedAt: string;
}
```

---

### 11. Dispusip (`gov_dispusip`)

```typescript
// ✅ DispusipKurirBukuForm sudah ada
// ⚠️ Phase 2: Tambah durasiPeminjaman radio dan kategoriPustaka dropdown

export interface DispusipDetails {
  serviceId: string;
  serviceName: string;
  noAnggotaPerpus: string;              // ✅ 8 digit angka
  judulBukuDiminta: string;             // ✅
  kategoriPustaka?: "fiksi" | "non_fiksi" | "referensi" | "anak_anak" | "majalah"; // ⚠️ Phase 2
  durasiPeminjaman?: 7 | 14 | 21;       // ⚠️ Phase 2 — radio button, bukan text

  // Status buku (diisi petugas saat verifikasi di workspace):
  statusBuku?: "tersedia" | "dipinjam" | "tidak_ada";
  alternatifJudul?: string;             // Jika buku tidak tersedia

  // OTP pengembalian (generated saat buku akan dikembalikan):
  otpPengembalian?: string;
  returnedAt?: string;

  catatanTambahan?: string;             // ✅
  kontakWa: string;                     // ✅
  alamatAntar: string;                  // ✅
  submittedAt: string;
}
```

---

### 12. Dispertan (`gov_dispertan`)

```typescript
// ✅ DispertanPuskeswanForm sudah ada
// ⚠️ Phase 2: Tambah layananDiminta enum, riwayatVaksin, riwayatObat

export type JenisHewan =
  | "kucing" | "anjing" | "kelinci" | "burung"
  | "ikan" | "unggas" | "sapi" | "kambing";

export type LayananDokHewan =
  | "pemeriksaan_umum"
  | "vaksin_rabies"
  | "sterilisasi"
  | "konsultasi"
  | "grooming_medis";

export const LAYANAN_DOK_HEWAN_OPTIONS: { id: LayananDokHewan; label: string }[] = [
  { id: "pemeriksaan_umum", label: "Pemeriksaan Umum / Diagnosa" },
  { id: "vaksin_rabies", label: "Vaksin Rabies" },
  { id: "sterilisasi", label: "Sterilisasi / Kastrasi" },
  { id: "konsultasi", label: "Konsultasi Dokter Hewan" },
  { id: "grooming_medis", label: "Grooming Medis (Perawatan Khusus)" },
];

export interface DispertanDetails {
  serviceId: string;
  serviceName: string;
  namaHewan: string;                    // ✅
  jenisHewan: JenisHewan;               // ✅
  rasHewan?: string;                    // ✅
  usiaPerkiraanHewan: string;           // ✅
  keluhan: string;                      // ✅ Deskripsi gejala
  riwayatVaksin?: string;               // ⚠️ Phase 2 — belum ada di form
  riwayatObat?: string;                 // ⚠️ Phase 2 — belum ada di form
  layananDiminta: LayananDokHewan;      // ⚠️ Phase 2 — saat ini mungkin text bebas
  tanggalJadwal: string;                // ✅
  fotoHewan?: string;                   // Phase 3 (butuh Firebase Storage)

  // Hasil kunjungan (diisi dokter hewan di workspace):
  diagnosisVet?: string;
  treatmentDiberikan?: string;
  obatDiresepkan?: string;
  jadwalKontrol?: string;

  alamatHomecare: string;               // ✅
  kontakWa: string;                     // ✅
  submittedAt: string;
}
```

---

### 13. Disnaker (`gov_disnaker`)

```typescript
// ✅ DisnakerKartuKuningForm, DisnakerPelatihanBlkForm sudah ada
// ⚠️ Phase 2: Tambah pendidikanTerakhir dropdown dan bidangKeahlian

export type SubLayananDisnaker =
  | "kartu_kuning_ak1"
  | "pelatihan_blk";

export type PendidikanTerakhir = "SD" | "SMP" | "SMA_SMK" | "D1_D3" | "S1_ke_atas";

export interface DisnakerDetails {
  serviceId: string;
  serviceName: string;
  subLayanan: SubLayananDisnaker;
  namaLengkap: string;                  // ✅
  nik: string;                          // ✅
  pendidikanTerakhir: PendidikanTerakhir; // ⚠️ Phase 2 — perlu dropdown
  bidangKeahlian?: string;              // ⚠️ Phase 2 — belum ada di form
  alamatKtp?: string;                   // ✅
  alamatAntar?: string;                 // ✅

  // Sub: pelatihan_blk
  minatKursusBLK?: string;              // ✅ Barista/Las/Digital Marketing/Menjahit
  ketersediaanWaktu?: string;           // ✅

  kontakWa: string;
  submittedAt: string;
}
```

---

### 14. Diskominfo (`gov_diskominfo`)

```typescript
// ✅ DiskominfoUlasForm sudah ada
// ⚠️ Phase 2: Tambah judulAduan terpisah, kelurahan, kecamatan dropdown

export type KategoriAduanULAS =
  | "jalan_rusak"
  | "sampah_tidak_terangkut"
  | "penerangan_jalan_mati"
  | "pelayanan_publik_buruk"
  | "pungli"
  | "banjir_gorong"
  | "pohon_bahaya"
  | "lainnya";

export interface DiskominfoDetails {
  serviceId: string;
  serviceName: string;
  namaWarga: string;                    // ✅
  nik: string;                          // ✅
  kategoriAduan: KategoriAduanULAS;     // ✅
  judulAduan: string;                   // ⚠️ Phase 2 — mungkin belum terpisah dari deskripsi
  isiAduan: string;                     // ✅ Max 500 karakter
  lokasiKejadian: string;               // ✅
  kelurahan?: string;                   // ⚠️ Phase 2 — belum ada dropdown
  kecamatan?: KecamatanSolo;            // ⚠️ Phase 2 — belum ada dropdown
  fotoEvidenceUrl?: string;             // Optional upload

  // Status ULAS (diisi petugas Diskominfo):
  nomorTiketULAS?: string;
  statusULAS?: "belum_ditindak" | "sedang_diproses" | "selesai";
  petugasULAS?: string;
  responResmi?: string;
  forwardedToDinas?: string;            // ⚠️ Phase 2 — jika di-forward ke dinas lain

  kontakWa: string;
  submittedAt: string;
}
```

---

### 15. Satpol PP (`gov_satpolpp`)

```typescript
// ✅ SatpolppTrantibForm sudah ada
// ⚠️ Phase 2: Tambah rt, rw, kelurahan, kecamatan dan field kondisional izin acara

export type JenisGangguanTrantib =
  | "kebisingan_malam"
  | "parkir_liar"
  | "pkl_liar"
  | "bangunan_liar"
  | "minuman_keras"
  | "perjudian"
  | "izin_acara";

export interface SatpolppDetails {
  serviceId: string;
  serviceName: string;
  jenisGangguan: JenisGangguanTrantib;  // ✅
  lokasiKejadian: string;               // ✅
  rt?: string;                          // ⚠️ Phase 2 — belum ada di form
  rw?: string;                          // ⚠️ Phase 2 — belum ada di form
  kelurahan?: string;                   // ⚠️ Phase 2 — belum ada di form
  kecamatan?: KecamatanSolo;            // ⚠️ Phase 2 — belum ada di form
  waktuKejadian: string;                // ✅
  deskripsiDetail: string;              // ✅
  fotoUrl?: string;

  // Kondisional — hanya untuk jenisGangguan === "izin_acara":
  namaAcara?: string;                   // ⚠️ Phase 2 — field kondisional belum ada
  estimasiPeserta?: number;             // ⚠️ Phase 2 — field kondisional belum ada
  tanggalAcara?: string;                // ⚠️ Phase 2 — field kondisional belum ada

  // Tindak lanjut (diisi petugas Satpol PP):
  timPatroli?: string;
  hasilTindakan?: string;

  namaWarga: string;                    // ✅
  kontakWa: string;                     // ✅
  submittedAt: string;
}
```

---

### 16. BPBD (`gov_bpbd`)

```typescript
// ✅ BpbdLaporBanjirForm sudah ada
// ⚠️ Phase 2 Signifikan: Tambah mode toggle EWS vs Bantuan, multi-select bantuanDiminta, levelSiaga

export type SubLayananBPBD =
  | "cek_ews"          // Mode informasi saja — tampilkan status siaga sungai
  | "bantuan_darurat"; // Mode permohonan bantuan — butuh form

export type ItemLogistikDarurat =
  | "tenda_darurat"
  | "selimut"
  | "sembako"
  | "perahu_karet"
  | "evakuasi_medis"
  | "air_bersih";

export const ITEM_LOGISTIK_OPTIONS: { id: ItemLogistikDarurat; label: string }[] = [
  { id: "tenda_darurat", label: "Tenda Darurat" },
  { id: "selimut", label: "Selimut" },
  { id: "sembako", label: "Paket Sembako Darurat" },
  { id: "perahu_karet", label: "Perahu Karet" },
  { id: "evakuasi_medis", label: "Evakuasi Medis" },
  { id: "air_bersih", label: "Air Bersih / Galon" },
];

export interface BpbdDetails {
  serviceId: string;
  serviceName: string;
  subLayanan: SubLayananBPBD;           // ⚠️ Phase 2 — toggle mode di form

  // Mode: bantuan_darurat
  namaKontakDarurat: string;            // ✅
  lokasiTerdampak: string;              // ✅
  gpsLat?: number;                      // ⚠️ Phase 2 — GPS opsional
  gpsLng?: number;
  jenisBencana?: JenisBencana;          // ✅ (cek apakah sudah dropdown enum)
  levelSiaga?: "siaga_1" | "siaga_2" | "siaga_3" | "siaga_4"; // ⚠️ Phase 2 — belum ada
  jumlahKK?: number;                    // ✅
  bantuanDiminta?: ItemLogistikDarurat[]; // ⚠️ Phase 2 — perlu multi-select checkbox

  // Response (diisi petugas BPBD):
  timResponse?: string;
  logistikDikirim?: ItemLogistikDarurat[];
  waktuETA?: string;

  kontakWa: string;
  submittedAt: string;
}
```

---

### 17. DP3APM (`gov_dp3a`)

```typescript
// ✅ Dp3aSapa129Form sudah ada
// ⚠️ Phase 2 KRITIKAL: Toggle Mode Anonim WAJIB ada! jenisKasus perlu enum lengkap

export type SubLayananDp3a =
  | "hotline_kekerasan"   // SAPA 129 — laporan kekerasan darurat
  | "konseling_puspaga";  // Booking sesi konseling psikolog

export type JenisKasusDp3a =
  | "kdrt"
  | "kekerasan_seksual"
  | "perdagangan_orang"
  | "kekerasan_anak"
  | "penelantaran"
  | "darurat_perlindungan"; // Butuh perlindungan fisik segera

export interface Dp3aDetails {
  serviceId: string;
  serviceName: string;
  subLayanan: SubLayananDp3a;

  // ⚠️ Phase 2 WAJIB — Mode Anonim:
  isAnonymous: boolean;                 // Default true — HARUS ADA di form!
  namaAtauKode: string;                 // "Pemohon-XXXX" jika anonim, nama asli jika tidak

  // Sub: hotline_kekerasan
  jenisKasus?: JenisKasusDp3a;          // ⚠️ Phase 2 — saat ini sapaCaseCategory terlalu umum
  lokasiAman?: string;                  // ✅ Lokasi pemohon SEKARANG (bukan alamat rumah)
  butuhPendampingan?: boolean;          // ⚠️ Phase 2 — belum ada di form

  // Sub: konseling_puspaga
  jenisKonseling?: "pernikahan" | "pola_asuh" | "trauma" | "remaja" | "lansia";
  jadwalKonseling?: string;

  // CATATAN PRIVASI: safeContact/kontakRahasia TIDAK boleh langsung exposed di workspace
  // Petugas hanya bisa lihat setelah aksi "Verifikasi Identitas"

  // Penanganan (diisi petugas DP3A — akses terbatas!):
  psikologPenanganan?: string;
  statusPenanganan?: "aman" | "dalam_pendampingan" | "butuh_perlindungan_fisik";

  submittedAt: string;
}
```

---

### 18. DPMPTSP (`gov_dpmptsp`)

```typescript
// ✅ DpmptspMppIzinForm sudah ada
// ⚠️ Phase 2: Tambah nomorRegistrasiMPP wajib, jenisIzin dropdown enum

export type JenisIzinMPP =
  | "nib"          // Nomor Induk Berusaha
  | "imb_pbg"      // IMB / PBG
  | "situ"         // Surat Izin Tempat Usaha
  | "siup"         // SIUP
  | "hak_bangunan"
  | "lainnya";

export interface DpmptspDetails {
  serviceId: string;
  serviceName: string;
  namaUsaha: string;                    // ✅
  nomorRegistrasiMPP: string;           // ⚠️ Phase 2 — wajib ada, mungkin belum di form
  jenisIzin: JenisIzinMPP;             // ⚠️ Phase 2 — perlu dropdown, bukan text
  namaKontakPenerima: string;           // ✅
  alamatKantor: string;                 // ✅
  nomorSK?: string;                     // ✅ Opsional

  // Verifikasi (diisi petugas DPMPTSP):
  skSudahDisiapkan?: boolean;           // Toggle: SK fisik sudah di tangan
  petugasMPP?: string;
  tanggalAntar?: string;

  kontakWa: string;
  submittedAt: string;
}
```

---

## Extended OrderDocument Interface

```typescript
// src/types/order.types.ts — update untuk menambahkan rejected status & gov fields

export type CitizenDetails =
  | DukcapilDetails
  | DinkesDetails
  | DinsosDetails
  | DiskopDetails
  | DisparDetails
  | DishubDetails
  | BapendaDetails
  | DisdikDetails
  | DlhDetails
  | DamkarDetails
  | DispusipDetails
  | DispertanDetails
  | DisnakerDetails
  | DiskominfoDetails
  | SatpolppDetails
  | BpbdDetails
  | Dp3aDetails
  | DpmptspDetails
  | Record<string, unknown>; // Fallback untuk order non-government

export interface OrderDocument {
  id?: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  driverId?: string | null;
  serviceType: string;
  serviceTitle: string;
  targetRole: "customer" | "driver" | "merchant" | "government" | "industry";
  additionalRole?: string;      // "gov_dukcapil", "gov_damkar", dll
  agencyName?: string;

  price: number;
  status: StatusPermohonan;

  pickupLocation: { lat: number; lng: number; address: string };
  dropoffLocation: { lat: number; lng: number; address: string };

  // Typed citizen details — sesuai additionalRole
  citizenDetails?: CitizenDetails;

  // Audit fields (Firestore Timestamps — gunakan any untuk kompatibilitas)
  createdAt: any;
  updatedAt: any;
  verifiedByDinasAt?: any;      // Saat petugas approve
  verifiedByDinas?: string;     // UID petugas yang approve
  dispatchedAt?: any;
  completedAt?: any;
  rejectedAt?: any;
  rejectionReason?: string;     // ⚠️ Phase 2 — wajib ada di reject flow

  // Eco system (DLH)
  ecoPointsAwarded?: number;    // Poin eco yang diberikan ke customer
}
```

---

## Cara Menggunakan citizenDetails di Workspace

```typescript
// Di workspace component, access citizenDetails dengan type guard atau optional chaining:
const details = order.citizenDetails as DukcapilDetails | null;
const nik = details?.nik ?? "—";
const jenisLayanan = details?.jenisLayanan ?? "—";

// Atau lebih aman dengan Record<string, unknown>:
const details = (order.citizenDetails || {}) as Record<string, unknown>;
const nik = details.nik as string ?? "—";

// Pattern yang digunakan di workspace saat ini (lebih practical):
const details = order.citizenDetails || {};
const nik = (details as any).nik || "—";
// Jika perlu strict typing, cast ke interface yang sesuai berdasarkan order.additionalRole
```
