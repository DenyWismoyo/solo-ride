# TypeScript Data Contracts — Layanan Pemerintahan Ride-Solo

> File ini mendefinisikan interface TypeScript lengkap untuk setiap `citizenDetails`
> yang tersimpan di Firestore per jenis layanan dinas.
> Tambahkan ke `src/types/order.types.ts` atau buat `src/types/gov.types.ts` terpisah.

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

export type JenisDisabilitas =
  | "netra"
  | "tuli"
  | "fisik_kursi_roda"
  | "lansia_75_plus"
  | "lainnya";

export type StatusPermohonan =
  | "pending_verification"  // Masuk dari customer, belum diverifikasi OPD
  | "pending"               // Disetujui OPD, masuk radar driver
  | "accepted"              // Driver menerima
  | "in_progress"           // Driver sedang menuju/mengerjakan
  | "completed"             // Selesai, OTP sudah dikonfirmasi
  | "cancelled"             // Dibatalkan
  | "rejected";             // Ditolak OPD dengan keterangan
```

---

## Interface per Dinas

### 1. Dukcapil (`gov_dukcapil`)

```typescript
export type JenisLayananDukcapil = 
  | "ktp_el"
  | "kk" 
  | "kia"
  | "akta_lahir"
  | "akta_kematian"
  | "legalisir";

export type AlasanJemputBola = "lansia" | "difabel" | "sakit_keras";

export interface DukcapilDetails {
  nik: string;                          // 16 digit NIK
  namaLengkap: string;
  jenisLayanan: JenisLayananDukcapil;
  kecamatanAsal: KecamatanSolo;
  noHpWhatsapp: string;
  // Jika jemput bola:
  isJemputBola?: boolean;
  alasanJemputBola?: AlasanJemputBola;
  keteranganKondisi?: string;
  waktuPilihan?: string;
  // OTP serah terima (generated oleh sistem):
  otpSerahTerima?: string;              // 6 digit OTP
  otpVerifiedAt?: string;              // ISO timestamp
  otpVerifiedByDriver?: string;        // UID driver
  submittedAt: string;
}
```

---

### 2. Dinkes (`gov_dinkes`)

```typescript
export type SubLayananDinkes = 
  | "resep_puskesmas"
  | "prolanis"
  | "donor_darah"
  | "lab_puskesmas";

export type GolonganDarah = "A" | "B" | "AB" | "O";

export interface DinkesDetails {
  subLayanan: SubLayananDinkes;
  noRekamMedis: string;
  noBpjs?: string;
  asalPuskesmas?: PuskesmasSolo;    // Tidak berlaku untuk donor_darah
  namaObat?: string;                // Privasi — opsional
  catatanAlergi?: string;
  namaWaliPenerima: string;
  
  // Khusus donor_darah:
  rsujuanDarah?: string;
  golDarah?: GolonganDarah;
  rhesus?: "+" | "-";
  jumlahKantong?: number;
  namaKontakPMI?: string;
  notesUrgency?: string;
  isEmergencyDonor?: boolean;

  submittedAt: string;
}
```

---

### 3. Dinsos (`gov_dinsos`)

```typescript
export type SubLayananDinsos = 
  | "bansos_pasar"
  | "ojek_difabel"
  | "tanggap_bencana"
  | "lapor_ppks";

export type PaketSembako = "paket_A" | "paket_B" | "paket_C";

export type JenisBencana = 
  | "banjir"
  | "kebakaran"
  | "angin_puting_beliung"
  | "lainnya";

export interface DinsosDetails {
  subLayanan: SubLayananDinsos;

  // Sub: bansos_pasar
  namaKepalaKeluarga?: string;
  nomorKartuPKH?: string;
  paketSembako?: PaketSembako;

  // Sub: ojek_difabel
  namaWargaDifabel?: string;
  jenisDisabilitas?: JenisDisabilitas;
  alatBantu?: string;
  tujuanPerjalanan?: string;
  waktuJemput?: string;
  kontakWaliPendamping?: string;

  // Sub: tanggap_bencana
  lokasiTerdampak?: string;
  jenisBencana?: JenisBencana;
  jumlahKK_terdampak?: number;
  kebutuhanLogistik?: string[];     // Array: ["beras", "air", "tenda", ...]

  nik: string;
  submittedAt: string;
}
```

---

### 4. Diskop (`gov_diskop`)

```typescript
export type SubLayananDiskop =
  | "shu_koperasi"
  | "nib_pendampingan"
  | "modal_bergulir"
  | "pelatihan_umkm";

export interface DiskopDetails {
  subLayanan: SubLayananDiskop;
  namaUsaha?: string;
  jenisUsaha?: string;
  skalaUsaha?: "mikro" | "kecil";
  sudahPunyaNIB?: boolean;
  nikPemilik: string;
  omzetBulananEstimasi?: number;

  // Sub: modal_bergulir
  jumlahPinjamanDiminta?: number;
  rencanaPenggunaan?: string;
  agunanYangDimiliki?: string;
  sudahIkutPelatihan?: boolean;

  // Sub: pelatihan_umkm
  jenisPelatihan?: string;          // Kemasan / Higienitas / Pembukuan Digital
  jadwalPelatihan?: string;

  submittedAt: string;
}
```

---

### 5. Dispar (`gov_dispar`)

```typescript
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

export interface DisparDetails {
  subLayanan: SubLayananDispar;
  namaWisatawan: string;
  jumlahRombongan: number;
  tanggalKunjungan?: string;
  destinasiDipilih?: DestinasiHeritage[];
  preferensiBahasa?: "id" | "en" | "ja" | "cn";
  namaEvent?: string;
  jumlahTiket?: number;
  sertifikasiHPI?: boolean;
  namaGuide?: string;
  durasiJam?: number;
  submittedAt: string;
}
```

---

### 6. Dishub (`gov_dishub`)

```typescript
export type SubLayananDishub =
  | "lapor_lalin"
  | "kir_digital"
  | "cfd_shelter"
  | "parkir_qris";

export type JenisLaporanLalin =
  | "kemacetan"
  | "lampu_lalu_lintas_rusak"
  | "rambu_rusak"
  | "jalan_berlubang"
  | "pohon_tumbang_lalin";

export interface DishubDetails {
  subLayanan: SubLayananDishub;
  
  // Sub: lapor_lalin
  jenisLaporan?: JenisLaporanLalin;
  lokasiKejadian?: string;
  kelurahan?: string;
  deskripsiDetail?: string;
  fotoEvidenceUrl?: string;

  // Sub: kir_digital
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
export type SubLayananBapenda =
  | "pbb_online"
  | "retribusi_pasar"
  | "konsultasi_pajak"
  | "insentif_kepatuhan";

export interface BapendaDetails {
  subLayanan: SubLayananBapenda;
  
  // Sub: pbb_online
  nomorNOP_SPPT?: string;
  tahunPajak?: number;
  nominalTagihan?: number;
  metodePembayaran?: "qris" | "wallet" | "virtual_account";

  // Sub: retribusi_pasar
  idKiosPasar?: string;
  namaKios?: string;
  tanggalRetribusi?: string;
  nominalRetribusi?: number;

  // Sub: konsultasi_pajak
  jenisKonsultasi?: "npwpd_baru" | "keberatan_pajak" | "insentif_umkm";
  namaUsaha?: string;
  pertanyaanKonsultasi?: string;

  nik: string;
  submittedAt: string;
}
```

---

### 8. Disdik (`gov_disdik`)

```typescript
export type SubLayananDisdik =
  | "antar_jemput_sekolah"
  | "antar_ijazah_buku";

export interface DisdikDetails {
  subLayanan: SubLayananDisdik;
  namaSiswa: string;
  nisn: string;
  namaSekolah: string;
  kelasSekolah?: string;
  
  // Sub: antar_jemput
  jamBerangkat?: string;
  jamPulang?: string;
  kontakOrtuWali: string;
  catatanKhusus?: string;

  // Sub: antar_ijazah_buku
  jenisLegalisir?: "ijazah" | "raport" | "buku_bos";
  jumlahDokumen?: number;
  asalSekolah?: string;

  submittedAt: string;
}
```

---

### 9. DLH (`gov_dlh`)

```typescript
export type JenisSampah = "kardus" | "plastik" | "besi" | "kaca" | "jelantah" | "kertas";

export type SubLayananDLH =
  | "jemput_sampah_daur_ulang"
  | "lapor_pohon_tumbang";

export interface DlhDetails {
  subLayanan: SubLayananDLH;
  
  // Sub: jemput_sampah
  rwBankSampah?: string;
  jenisSampah?: JenisSampah[];
  estimasiBeratKg?: number;
  jadwalJemput?: string;

  // Sub: lapor_pohon
  lokasiPohon?: string;
  kelurahan?: string;
  kecamatan?: KecamatanSolo;
  kondisiPohon?: "miring_berbahaya" | "sudah_tumbang" | "butuh_perantingan" | "menghalangi_kabel";
  tingkatUrgensi?: "segera" | "normal";
  fotoUrl?: string;

  // Hasil verifikasi OPD (diisi oleh petugas DLH):
  beratAktualKg?: number;           // Berat sampah actual setelah ditimbang
  ecoPointsAwarded?: number;        // Poin yang diberikan ke customer

  namaPemohon: string;
  kontakWa: string;
  submittedAt: string;
}
```

---

### 10. Damkar (`gov_damkar`)

```typescript
export type SubLayananDamkar =
  | "panic_button"
  | "animal_rescue";

export type JenisDarurat = "kebakaran" | "ledakan" | "orang_terjebak" | "gas_bocor";
export type JenisRescue = "sarang_tawon_vespa" | "ular" | "hewan_terjebak" | "cincin_macet" | "lainnya";

export interface DamkarDetails {
  subLayanan: SubLayananDamkar;
  gpsLat?: number;                  // Auto-detect dari browser
  gpsLng?: number;
  alamatManual: string;

  // Sub: panic_button
  jenisDarurat?: JenisDarurat;
  tingkatKeparahan?: "besar" | "sedang" | "kecil";
  isEmergency: true;                // Always true untuk panic_button

  // Sub: animal_rescue
  jenisRescue?: JenisRescue;
  deskripsiDetail?: string;
  waktuPilihan?: string;            // Jika tidak darurat

  // Response data (diisi oleh petugas):
  posTermdekat?: string;            // Nama pos damkar terdekat yang direspons
  petugasYangDispatch?: string;     // Nama petugas
  waktuDispatch?: string;
  responseTimeMinutes?: number;

  kontakWa: string;
  submittedAt: string;
}
```

---

### 11. Dispusip (`gov_dispusip`)

```typescript
export interface DispusipDetails {
  noAnggotaPerpus: string;
  judulBukuDiminta: string;
  kategoriPustaka?: string;
  durasiPeminjaman: 7 | 14 | 21;

  // Status buku (diisi sistem saat verifikasi):
  statusBuku?: "tersedia" | "dipinjam" | "tidak_ada";
  alternatifJudul?: string;         // Jika buku tidak tersedia

  // OTP pengembalian:
  otpPengembalian?: string;
  returnedAt?: string;

  kontakWa: string;
  submittedAt: string;
}
```

---

### 12. Dispertan (`gov_dispertan`)

```typescript
export type JenisHewan = 
  | "kucing" | "anjing" | "kelinci" | "burung"
  | "ikan" | "unggas" | "sapi" | "kambing";

export type LayananDokHewan =
  | "pemeriksaan_umum"
  | "vaksin_rabies"
  | "sterilisasi"
  | "konsultasi"
  | "grooming_medis";

export interface DispertanDetails {
  namaHewan: string;
  jenisHewan: JenisHewan;
  rasHewan?: string;
  usiaPerkiraanHewan: string;
  keluhan: string;
  riwayatVaksin?: string;
  riwayatObat?: string;
  layananDiminta: LayananDokHewan;
  tanggalJadwal: string;
  fotoHewan?: string;
  
  // Hasil kunjungan (diisi dokter hewan):
  diagnosisVet?: string;
  treatmentDiberikan?: string;
  obatDiresepkan?: string;
  jadwalKontrol?: string;

  kontakWa: string;
  submittedAt: string;
}
```

---

### 13. Disnaker (`gov_disnaker`)

```typescript
export type SubLayananDisnaker =
  | "kartu_kuning_ak1"
  | "pelatihan_blk"
  | "lapor_ketenagakerjaan";

export interface DisnakerDetails {
  subLayanan: SubLayananDisnaker;
  namaLengkap: string;
  nik: string;
  pendidikanTerakhir: "SD" | "SMP" | "SMA_SMK" | "D1_D3" | "S1_ke_atas";
  bidangKeahlian?: string;
  
  // Sub: pelatihan_blk
  minatKursusBLK?: string;
  ketersediaanWaktu?: string;

  // Sub: lapor_ketenagakerjaan
  jenisLaporan?: "umk_tidak_dibayar" | "thr" | "phk_sepihak" | "lainnya";
  namaPerusahaan?: string;
  deskripsiMasalah?: string;

  kontakWa: string;
  submittedAt: string;
}
```

---

### 14. Diskominfo (`gov_diskominfo`)

```typescript
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
  kategoriAduan: KategoriAduanULAS;
  judulAduan: string;
  isiAduan: string;
  lokasiKejadian: string;
  kelurahan: string;
  kecamatan: KecamatanSolo;
  fotoEvidenceUrl?: string;
  
  // Status ULAS (diisi petugas):
  nomorTiketULAS?: string;          // Nomor tiket dari sistem ULAS Surakarta
  statusULAS?: "belum_ditindak" | "sedang_diproses" | "selesai";
  petugasULAS?: string;
  responResmi?: string;

  namaWarga: string;
  nik: string;
  kontakWa: string;
  submittedAt: string;
}
```

---

### 15. Satpol PP (`gov_satpolpp`)

```typescript
export type JenisGangguanTrantib =
  | "kebisingan_malam"
  | "parkir_liar"
  | "pkl_liar"
  | "bangunan_liar"
  | "minuman_keras"
  | "perjudian"
  | "izin_acara";

export interface SatpolppDetails {
  jenisGangguan: JenisGangguanTrantib;
  lokasiKejadian: string;
  rt: string;
  rw: string;
  kelurahan: string;
  kecamatan: KecamatanSolo;
  waktuKejadian: string;
  deskripsiDetail: string;
  fotoUrl?: string;

  // Jika izin_acara:
  namaAcara?: string;
  estimasiPeserta?: number;
  tanggalAcara?: string;
  namaOrganizer?: string;

  // Tindak lanjut (diisi petugas):
  timPatroli?: string;
  hasilTindakanPatroli?: string;

  namaWarga: string;
  kontakWa: string;
  submittedAt: string;
}
```

---

### 16. BPBD (`gov_bpbd`)

```typescript
export type SubLayananBPBD =
  | "cek_ews"
  | "bantuan_darurat"
  | "lapor_bencana";

export type ItemLogistikDarurat = 
  | "tenda_darurat"
  | "selimut"
  | "sembako"
  | "perahu_karet"
  | "evakuasi_medis"
  | "air_bersih";

export interface BpbdDetails {
  subLayanan: SubLayananBPBD;
  namaKontakDarurat: string;
  lokasiTerdampak: string;
  gpsLat?: number;
  gpsLng?: number;
  jenisBencana?: JenisBencana;
  levelSiaga?: "siaga_1" | "siaga_2" | "siaga_3" | "siaga_4";
  jumlahKK?: number;
  bantuanDiminta?: ItemLogistikDarurat[];
  
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
export type SubLayananDp3a =
  | "hotline_kekerasan"
  | "konseling_puspaga";

export type JenisKasusKedp3a =
  | "kdrt"
  | "kekerasan_seksual"
  | "perdagangan_orang"
  | "kekerasan_anak"
  | "penelantaran"
  | "darurat_perlindungan";

export interface Dp3aDetails {
  subLayanan: SubLayananDp3a;
  isAnonymous: boolean;             // WAJIB ada
  namaAtauKode: string;             // "Pemohon-XXXX" jika anonim

  // Sub: hotline
  jenisKasus?: JenisKasusKedp3a;
  lokasiAman?: string;              // Lokasi pemohon sekarang (bukan alamat rumah)
  // CATATAN: kontakRahasia TIDAK disimpan plaintext jika isAnonymous = true
  butuhPendampingan?: boolean;

  // Sub: konseling_puspaga
  jenisKonseling?: "pernikahan" | "pola_asuh" | "trauma" | "remaja" | "lansia";
  jadwalKonseling?: string;

  // Field sensitif — handle dengan enkripsi atau tidak simpan sama sekali
  // deskripsiKasus: TIDAK BOLEH disimpan di Firestore tanpa enkripsi

  // Penanganan (diisi petugas DP3A — akses terbatas):
  psikologPenanganan?: string;
  statusPenanganan?: "aman" | "dalam_pendampingan" | "butuh_perlindungan_fisik";
  
  submittedAt: string;
}
```

---

### 18. DPMPTSP (`gov_dpmptsp`)

```typescript
export type JenisIzinMPP =
  | "nib"
  | "imb_pbg"
  | "situ"
  | "siup"
  | "hak_bangunan"
  | "lainnya";

export interface DpmptspDetails {
  namaUsaha: string;
  nomorRegistrasiMPP: string;
  jenisIzin: JenisIzinMPP;
  namaKontakPenerima: string;
  nomorSK?: string;                 // Nomor SK jika sudah diketahui
  catatanPengambilan?: string;

  // Verifikasi (diisi petugas DPMPTSP):
  skSudahDisiapkan?: boolean;
  petugasMPP?: string;
  tanggalAntar?: string;

  kontakWa: string;
  submittedAt: string;
}
```

---

## Extended OrderDocument Interface

Update `src/types/order.types.ts` untuk mengakomodasi semua detail OPD:

```typescript
// src/types/order.types.ts

import type {
  DukcapilDetails,
  DinkesDetails,
  DinsosDetails,
  DiskopDetails,
  DisparDetails,
  DishubDetails,
  BapendaDetails,
  DisdikDetails,
  DlhDetails,
  DamkarDetails,
  DispusipDetails,
  DispertanDetails,
  DisnakerDetails,
  DiskominfoDetails,
  SatpolppDetails,
  BpbdDetails,
  Dp3aDetails,
  DpmptspDetails
} from "./gov.types";

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
  | DpmptspDetails;

export interface OrderDocument {
  id?: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  driverId?: string | null;
  serviceType: string;
  serviceTitle: string;
  targetRole: "customer" | "driver" | "merchant" | "government" | "industry";
  additionalRole?: string;
  agencyName?: string;
  price: number;
  status: StatusPermohonan;
  pickupLocation: { lat: number; lng: number; address: string };
  dropoffLocation: { lat: number; lng: number; address: string };
  
  // Typed citizen details — sesuai additionalRole
  citizenDetails?: CitizenDetails;
  
  // Audit fields
  verifiedByDinasAt?: any;          // Firestore Timestamp
  verifiedByDinas?: string;         // UID petugas yang verify
  dispatchedAt?: any;
  completedAt?: any;
  createdAt: any;
  updatedAt: any;
}
```
