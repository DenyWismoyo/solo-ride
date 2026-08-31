# Spesifikasi Form Customer per Dinas — Ride-Solo Gov Services

> **Panduan ini adalah sumber kebenaran tunggal** untuk field-by-field form
> yang harus diimplementasikan di setiap `<Dinas>CivicModal.tsx`.
> Jangan menggunakan `DynamicGovCivicModal` sebagai solusi permanen.

---

## KELOMPOK A — DELIVERY / ANTAR DOKUMEN

### Dukcapil (`gov_dukcapil`) — ✅ SUDAH ADA `DukcapilCivicModal.tsx`

Sub-service routing:
- `dukcapil_antar_ktp` → Form antar KTP-el/KK
- `dukcapil_kia_akte` → Form antar KIA/Akta
- `dukcapil_mobile_perekaman` → Form jemput bola lansia/difabel

Form fields per sub-service:
```typescript
interface DukcapilFormFields {
  // Sub: antar_ktp, kia_akte
  nik: string;                  // 16 digit NIK (required)
  namaLengkap: string;          // Nama sesuai data kependudukan
  jenisLayanan: "ktp_el" | "kk" | "kia" | "akta_lahir" | "akta_kematian";
  kecamatan: KecamatanSolo;     // Pilihan: Laweyan, Serengan, Pasar Kliwon, Jebres, Banjarsari
  noHpWhatsapp: string;         // Untuk konfirmasi jadwal antar
  alamatAntar: string;          // Alamat tujuan pengantaran

  // Sub: mobile_perekaman (jemput bola)
  alasanJemputBola: "lansia" | "difabel" | "sakit_keras";
  keteranganKondisi?: string;   // Deskripsi kondisi yang membatasi mobilitas
  waktuPilihan: string;         // Jadwal kunjungan tim Dukcapil
}
```

OTP serah terima: WAJIB ada kode OTP 6 digit saat driver serahkan dokumen.

---

### Disdik (`gov_disdik`) — ❌ BELUM ADA `DisdikCivicModal.tsx`

Sub-service routing:
- `disdik_antar_jemput_sekolah` → Antar jemput anak sekolah
- `disdik_antar_ijazah_buku` → Antar legalisir ijazah/buku BOS

Form fields:
```typescript
interface DisdikFormFields {
  // Sub: antar_jemput_sekolah
  namaSiswa: string;
  nisn: string;                     // Nomor Induk Siswa Nasional
  namaSekolah: string;              // Pilihan dari list sekolah zonasi Solo
  kelasSekolah: string;             // Misal: "Kelas 3 SDN Mangkubumen"
  alamatPenjemputan: string;
  jamBerangkat: string;             // Jam antar ke sekolah
  jamPulang: string;                // Jam jemput pulang
  kontakOrtuWali: string;           // WA orang tua/wali
  catatanKhusus?: string;           // Alergi, kebutuhan khusus

  // Sub: antar_ijazah_buku
  namaAlumnus: string;
  nisn: string;
  asalSekolah: string;
  jenisLegalisir: "ijazah" | "raport" | "buku_bos";
  jumlahDokumen: number;
  alamatAntar: string;
}
```

---

### Dispusip (`gov_dispusip`) — ❌ BELUM ADA `DispusipCivicModal.tsx`

Sub-service:
- `dispusip_kurir_buku` → Pinjam dan antar buku fisik dari Perpustakaan Kota

Form fields:
```typescript
interface DispusipFormFields {
  noAnggotaPerpus: string;          // Nomor kartu anggota Perpustakaan Kota Solo
  judulBukuDiminta: string;         // Judul atau ISBN buku yang ingin dipinjam
  kategoriPustaka?: string;         // Fiksi / Non-fiksi / Referensi / Anak-anak
  durasiPeminjaman: 7 | 14 | 21;   // Hari (pilihan)
  alamatAntar: string;
  kontakWa: string;
  catatanTambahan?: string;         // Alternatif judul jika tidak tersedia
}
```

OTP pengembalian: Kode OTP digenerate saat buku dikembalikan ke driver kurir.

---

### Disnaker (`gov_disnaker`) — ❌ BELUM ADA `DisnakerCivicModal.tsx`

Sub-service:
- `disnaker_kartu_kuning_ak1` → Antar kartu AK-1 + pendaftaran BLK

Form fields:
```typescript
interface DisnakerFormFields {
  // Kartu Kuning AK-1
  namaLengkap: string;
  nik: string;
  pendidikanTerakhir: "SD" | "SMP" | "SMA_SMK" | "D1_D3" | "S1_ke_atas";
  bidangKeahlian?: string;          // Keahlian yang dimiliki
  alamatKtp: string;
  alamatAntar: string;              // Tempat kartu AK-1 diantar
  kontakWa: string;

  // Kursus BLK (jika memilih kursus juga)
  minatKursusBLK?: string;          // Contoh: Barista, Las, Digital Marketing, Menjahit
  ketersediaanWaktu?: string;       // Contoh: "Pagi hari, Senin-Jumat"
}
```

---

## KELOMPOK B — ANTAR FARMASI / MEDIS

### Dinkes (`gov_dinkes`) — ✅ SUDAH ADA `DinkesCivicModal.tsx`

Sub-service routing:
- `dinkes_resep_puskesmas` → Antar obat resep dari Puskesmas
- `dinkes_prolanis` → Obat rutin Prolanis BPJS
- `dinkes_donor_darah` → Kurir darah PMI darurat

Form fields:
```typescript
interface DinkesFormFields {
  // Sub: resep_puskesmas, prolanis
  noRekamMedis: string;             // Nomor rekam medis pasien
  noBpjs?: string;                  // Nomor kartu BPJS Kesehatan
  asalPuskesmas: string;            // Pilihan dari 17 Puskesmas Solo
  namaObat?: string;                // Nama obat / deskripsi resep (opsional, privasi)
  catatanAlergi?: string;           // Alergi obat yang perlu diperhatikan driver
  namaWaliPenerima: string;         // Nama yang menerima (jika bukan pasien)
  alamatPengantaran: string;
  kontakWa: string;

  // Sub: donor_darah (emergency — form ringkas)
  rsujuanDarah: string;             // Rumah Sakit tujuan
  golDarah: "A" | "B" | "AB" | "O";
  rhesus: "+" | "-";
  jumlahKantong: number;
  namaKontakPMI: string;
  notesUrgency: string;             // Untuk apa darah tersebut
}
```

---

## KELOMPOK C — BANTUAN SOSIAL

### Dinsos (`gov_dinsos`) — ✅ SUDAH ADA `DinsosCivicModal.tsx`

Sub-service routing:
- `dinsos_bansos_pasar` → Tebus sembako voucher
- `dinsos_ojek_difabel` → Antar jemput bersubsidi
- `dinsos_tanggap_bencana` → Logistik bencana

Form fields:
```typescript
interface DinsosFormFields {
  // Sub: bansos_pasar
  namaKepalaKeluarga: string;
  nikKepalaKeluarga: string;
  nomorKartuPKH?: string;           // Nomor Kartu PKH/KKS
  paketSembako: "paket_A" | "paket_B" | "paket_C";  // Sesuai ketetapan dinas
  alamatPenjemputan: string;        // Ke mana sembako diantar
  kontakWa: string;

  // Sub: ojek_difabel
  namaWargaDifabel: string;
  nik: string;
  jenisDisabilitas: "netra" | "tuli" | "fisik_kursi_roda" | "lansia_75_plus" | "lainnya";
  alat bantu?: string;              // Kursi roda, tongkat, dll
  tujuanPerjalanan: string;         // Puskesmas/RS/tujuan lain
  waktuJemput: string;
  kontakWaliPendamping?: string;

  // Sub: tanggap_bencana
  lokasiTerdampak: string;
  jenisBencana: "banjir" | "kebakaran" | "angin_puting_beliung" | "lainnya";
  jumlahKK_terdampak: number;
  kebutuhanLogistik: string[];      // Checkbox: Beras, Air, Tenda, Selimut, dll
  kontakRelawan: string;
}
```

---

## KELOMPOK D — PENGADUAN / LAPORAN

### Dishub (`gov_dishub`) — ✅ SUDAH ADA `DishubCivicModal.tsx`

Form fields:
```typescript
interface DishubFormFields {
  // Sub: lapor_lalin
  jenisLaporan: "kemacetan" | "lampu_lalu_lintas_rusak" | "rambu_rusak" | "jalan_berlubang" | "pohon_tumbang_lalin";
  lokasiKejadian: string;           // Nama jalan / pertigaan
  kelurahan: string;
  deskripsiDetail: string;
  fotoEvidenceUrl?: string;         // Upload foto (opsional)
  kontakWa: string;

  // Sub: kir_digital (booking)
  jenisKendaraan: "motor" | "mobil" | "angkutan_barang" | "bus";
  nomorPolisi: string;
  jadwalKIR: string;                // Tanggal booking

  // Sub: cfd_shelter (informasi)
  // Tidak perlu form — tampilkan peta shelter saja
}
```

---

### DLH (`gov_dlh`) — ❌ BELUM ADA `DlhCivicModal.tsx`

Sub-service:
- `dlh_jemput_sampah_daur_ulang` → Jemput sampah ke rumah
- `dlh_lapor_pohon_tumbang` → Lapor pohon berbahaya

Form fields:
```typescript
interface DlhFormFields {
  // Sub: jemput_sampah_daur_ulang
  namaPemohon: string;
  alamatRumah: string;
  rwBankSampah: string;             // RW tempat bank sampah aktif
  jenisSampah: ("kardus" | "plastik" | "besi" | "kaca" | "jelantah" | "kertas")[];
  estimasiBeratKg: number;          // Estimasi berat total (kg)
  jadwalJemput: string;             // Tanggal dan slot waktu penjemputan
  kontakWa: string;
  catatanTambahan?: string;         // Contoh: "Di depan pintu pagar besi coklat"

  // Sub: lapor_pohon_tumbang
  lokasiPohon: string;              // Nama jalan + nomor rumah terdekat
  kelurahan: string;
  kecamatan: KecamatanSolo;
  kondisiPohon: "miring_berbahaya" | "sudah_tumbang" | "butuh_perantingan" | "menghalangi_kabel";
  tingkatUrgensi: "segera" | "normal";
  fotoUrl?: string;                 // Upload foto pohon
  kontakWa: string;
}
```

---

### Diskominfo (`gov_diskominfo`) — ❌ BELUM ADA `DiskominfoC ivicModal.tsx`

Sub-service:
- `diskominfo_ulas_terpadu` → Kirim aduan ke ULAS

Form fields:
```typescript
interface DiskominfoFormFields {
  namaWarga: string;
  nik: string;
  kategoriAduan: 
    | "jalan_rusak"
    | "sampah_tidak_terangkut"
    | "penerangan_jalan_mati"
    | "pelayanan_publik_buruk"
    | "pungli"
    | "banjir_gorong"
    | "pohon_bahaya"
    | "lainnya";
  judulAduan: string;               // Judul singkat aduan
  isiAduan: string;                 // Deskripsi lengkap (max 500 karakter)
  lokasiKejadian: string;
  kelurahan: string;
  kecamatan: KecamatanSolo;
  fotoEvidenceUrl?: string;
  kontakWa: string;                 // Untuk update status aduan
}
```

---

### Satpol PP (`gov_satpolpp`) — ❌ BELUM ADA `SatpolppCivicModal.tsx`

Sub-service:
- `satpolpp_lapor_trantib` → Lapor gangguan ketertiban

Form fields:
```typescript
interface SatpolppFormFields {
  namaWarga: string;
  jenisGangguan:
    | "kebisingan_malam"          // Suara bising >22.00 WIB
    | "parkir_liar"
    | "pkl_liar"                  // PKL di trotoar/badan jalan
    | "bangunan_liar"
    | "minuman_keras"
    | "perjudian"
    | "izin_acara";               // Permohonan pengamanan keramaian
  lokasiKejadian: string;
  rt: string;
  rw: string;
  kelurahan: string;
  kecamatan: KecamatanSolo;
  waktuKejadian: string;          // Jam kejadian / waktu acara
  deskripsiDetail: string;
  fotoUrl?: string;
  kontakWa: string;
  // Jika izin acara:
  namaAcara?: string;
  estimasiPeserta?: number;
  tanggalAcara?: string;
}
```

---

## KELOMPOK E — DARURAT / EMERGENCY

### Damkar (`gov_damkar`) — ❌ BELUM ADA `DamkarCivicModal.tsx`

> ⚠️ EMERGENCY: Minimal field, GPS auto-detect, submit cepat!

Sub-service:
- `damkar_panic_button` → Lapor kebakaran/darurat (EMERGENCY)
- `damkar_animal_rescue` → Rescue hewan/evakuasi non-api

Form fields:
```typescript
interface DamkarFormFields {
  // Sub: panic_button (DARURAT — form ultra ringkas)
  gpsLat: number;                   // Auto-detect dari geolocation browser
  gpsLng: number;
  alamatManual: string;             // Konfirmasi manual alamat
  jenisDarurat: "kebakaran" | "ledakan" | "orang_terjebak" | "gas_bocor";
  tingkatKeparahan: "besar" | "sedang" | "kecil";
  kontakWa: string;                 // Auto-filled dari profil user
  // NO NIK, NO NOTES — cukup ini saja, kirim cepat!

  // Sub: animal_rescue (tidak darurat, bisa lebih detail)
  jenisRescue: "sarang_tawon_vespa" | "ular" | "hewan_terjebak" | "cincin_macet" | "lainnya";
  lokasiRescue: string;
  deskripsiDetail: string;
  kontakWa: string;
  waktuPilihan?: string;            // Jika tidak mendesak, pilih jadwal
}
```

UI Rules untuk Panic Button:
- Latar merah/oranye menyala
- Tombol submit BESAR diameter minimal 60px
- Teks "KIRIM DARURAT SEKARANG" — bukan "Submit"
- Tampilkan nomor telepon Damkar (0271-7630133) yang bisa diklik
- Auto-submit langsung setelah GPS terkunci (countdown 3 detik)

---

### BPBD (`gov_bpbd`) — ❌ BELUM ADA `BpbdCivicModal.tsx`

Sub-service:
- `bpbd_peringatan_dini_banjir` → Cek status siaga + minta bantuan darurat

Form fields:
```typescript
interface BpbdFormFields {
  // Mode A: Cek Status EWS (tidak butuh form — tampilkan data saja)
  // Mode B: Permohonan Bantuan Darurat
  namaKontakDarurat: string;
  lokasiTerdampak: string;
  gpsLat?: number;
  gpsLng?: number;
  jenisBencana: "banjir" | "tanah_longsor" | "puting_beliung" | "gempa" | "kebakaran_hutan";
  levelSiaga: "siaga_1" | "siaga_2" | "siaga_3" | "siaga_4";  // 1=sangat bahaya
  jumlahKK: number;
  bantuanDiminta: ("tenda_darurat" | "selimut" | "sembako" | "perahu_karet" | "evakuasi_medis")[];
  kontakWa: string;
}
```

---

### DP3APM (`gov_dp3a`) — ❌ BELUM ADA `Dp3aCivicModal.tsx`

> ⚠️ PRIVACY FIRST: Mode anonim wajib tersedia. Tidak boleh expose identitas.

Sub-service:
- `dp3a_hotline_sahabat_perempuan` → Lapor kekerasan / minta bantuan darurat
- `dp3a_konseling_puspaga` → Booking sesi konseling psikolog

Form fields:
```typescript
interface Dp3aFormFields {
  // TOGGLE: isAnonymous: boolean (default: true untuk laporan kekerasan)
  
  // Sub: hotline (jika isAnonymous = true, nama = kode anonim)
  namaAtauKode: string;             // "Pemohon-XXXX" jika anonim
  jenisKasus:
    | "kdrt"                        // Kekerasan Dalam Rumah Tangga
    | "kekerasan_seksual"
    | "perdagangan_orang"
    | "kekerasan_anak"
    | "penelantaran"
    | "darurat_perlindungan";       // Butuh perlindungan segera
  lokasiAman: string;               // Lokasi pemohon SEKARANG (bukan alamat rumah)
  kontakRahasia: string;            // WA / sinyal aman
  deskripsiSingkat?: string;        // OPSIONAL — jangan paksa detail
  butuhPendampingan: boolean;       // Butuh psikolog / petugas datang?

  // Sub: konseling_puspaga (tidak harus anonim)
  namaLengkap?: string;
  jenisKonseling: "pernikahan" | "pola_asuh" | "trauma" | "remaja" | "lansia";
  jadwalKonseling: string;
  kontakWa: string;
}
```

---

## KELOMPOK F — TRANSAKSIONAL / PAJAK

### Bapenda (`gov_bapenda`) — ✅ SUDAH ADA `BapendaCivicModal.tsx`

Form fields:
```typescript
interface BapendaFormFields {
  // Sub: pbb_online
  nomorNOP_SPPT: string;            // Nomor Objek Pajak
  tahunPajak: number;
  nominaTagihan?: number;           // Auto-fetch dari sistem Bapenda
  metodePembayaran: "qris" | "wallet" | "virtual_account";

  // Sub: retribusi_pasar
  idKiosPasar: string;              // Kode kios pedagang (dari kartu ID pedagang)
  namaKios: string;
  tanggalRetribusi: string;
  nominalRetribusi: number;

  // Sub: konsultasi_pajak
  jenisKonsultasi: "npwpd_baru" | "keberatan_pajak" | "insentif_umkm";
  namaUsaha: string;
  nik: string;
  pertanyaanKonsultasi: string;
  kontakWa: string;
}
```

---

## KELOMPOK G — BOOKING / RESERVASI

### Dispar (`gov_dispar`) — ✅ SUDAH ADA `DisparCivicModal.tsx`

Form fields:
```typescript
interface DisparFormFields {
  // Sub: heritage_tour
  namaWisatawan: string;
  jumlahRombongan: number;
  tanggalKunjungan: string;
  destinasiDipilih: ("keraton" | "mangkunegaran" | "radya_pustaka" | "triwindu" | "kampung_batik")[];
  preferensiBahasa: "id" | "en" | "ja" | "cn";
  kontakWa: string;

  // Sub: tiket_event
  namaEvent: string;               // Dari kalender resmi dinas
  jumlahTiket: number;
  kategoriTiket?: string;

  // Sub: pemandu_wisata
  sertifikasiHPI: boolean;         // Filter pemandu bersertifikat HPI
  namaGuide?: string;              // Jika request guide tertentu
  tanggalTour: string;
  durasiJam: number;
}
```

---

### Dispertan (`gov_dispertan`) — ❌ BELUM ADA `DispertanCivicModal.tsx`

Sub-service:
- `dispertan_klinik_hewan_homecare` → Dokter hewan homecare

Form fields:
```typescript
interface DispertanFormFields {
  namaHewan: string;
  jenisHewan: "kucing" | "anjing" | "kelinci" | "burung" | "ikan" | "unggas" | "sapi" | "kambing";
  rasHewan?: string;
  usiaPerkiraanHewan: string;       // Contoh: "2 tahun 3 bulan"
  keluhan: string;                  // Deskripsi gejala sakit / tujuan kunjungan
  riwayatVaksin?: string;           // Vaksin terakhir apa, kapan
  riwayatObat?: string;             // Obat yang sedang dikonsumsi hewan
  layananDiminta: "pemeriksaan_umum" | "vaksin_rabies" | "sterilisasi" | "konsultasi" | "grooming_medis";
  alamatHomecare: string;
  tanggalJadwal: string;
  kontakWa: string;
  fotoHewan?: string;               // Foto kondisi hewan (opsional)
}
```

---

## KELOMPOK H — USAHA / LEGALITAS

### Diskop (`gov_diskop`) — ✅ SUDAH ADA `DiskopCivicModal.tsx`

Form fields:
```typescript
interface DiskopFormFields {
  // Sub: nib_pendampingan
  namaUsaha: string;
  jenisUsaha: string;               // Deskripsi bidang usaha
  skalaUsaha: "mikro" | "kecil";
  sudahPunyaNIB: boolean;
  nikPemilik: string;
  alamatUsaha: string;
  omzetBulananEstimasi?: number;
  kontakWa: string;

  // Sub: modal_bergulir
  namaUsaha: string;
  nik: string;
  jumlahPinjamanDiminta: number;    // Dalam Rupiah
  rencanaPenggunaan: string;
  agunanYangDimiliki?: string;
  sudahIkutPelatihan: boolean;

  // Sub: shu_koperasi (informasi poin saja)
  // Tidak butuh form — tampilkan dashboard poin user
}
```

---

### DPMPTSP (`gov_dpmptsp`) — ❌ BELUM ADA `DpmptspCivicModal.tsx`

Sub-service:
- `dpmptsp_antar_sk_izin` → Antar SK izin usaha dari MPP ke kantor

Form fields:
```typescript
interface DpmptspFormFields {
  namaUsaha: string;
  nomorRegistrasiMPP: string;       // Nomor antrean/registrasi di MPP
  jenisIzin:
    | "nib"                         // Nomor Induk Berusaha
    | "imb_pbg"                     // IMB / PBG
    | "situ"                        // Surat Izin Tempat Usaha
    | "siup"                        // SIUP
    | "hak_bangunan"
    | "lainnya";
  namaKontakPenerima: string;       // Nama yang akan menerima SK fisik
  alamatKantor: string;             // Alamat tujuan pengantaran SK
  kontakWa: string;
  nomorSKJika diketahui?: string;   // Jika sudah tahu nomor SK
  catatanPengambilan?: string;
}
```

---

## Catatan Penting: Field Validasi

| Field | Aturan |
|-------|--------|
| NIK | Tepat 16 digit, hanya angka, prefix 3372 (Solo) |
| No. HP/WA | Minimal 10 digit, format Indonesia (+62/08xx) |
| GPS koordinat | Validasi range: lat (-7.4 s/d -7.7), lng (110.7 s/d 110.9) |
| Tanggal jadwal | Min: besok, Max: 30 hari ke depan |
| Estimasi berat (DLH) | Min: 1 kg, Max: 500 kg per pickup |
| Nomor NOP/SPPT | Format Bapenda: 33.71.xxx.xxx.xxx-xxxx.x |
| Nomor RM | Kombinasi huruf-angka, sesuai format Puskesmas |
