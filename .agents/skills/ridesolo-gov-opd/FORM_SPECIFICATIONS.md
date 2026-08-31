# Spesifikasi Form Customer per Dinas — Ride-Solo Gov Services (Phase 2 Blueprint)

> **Panduan ini adalah sumber kebenaran tunggal** untuk field-by-field form
> yang diimplementasikan di setiap `<Dinas><SubService>Form.tsx`.
>
> **ARSITEKTUR SAAT INI**: Page-based forms via `/services/gov/[id]/[serviceId]`
> Semua form di-dispatch oleh `CivicFormDispatcher.tsx`.
>
> Format anotasi: ✅ Sudah ada | ⚠️ Phase 2 gap | ❌ Belum ada

---

## KELOMPOK A — DELIVERY / ANTAR DOKUMEN

### Dukcapil (`gov_dukcapil`) — ✅ 3 Form Tersedia

Sub-service routing:
- `dukcapil_antar_ktp` → `DukcapilAntarKtpForm.tsx` ✅
- `dukcapil_kia_akte` → `DukcapilKiaAkteForm.tsx` ✅
- `dukcapil_mobile_perekaman` → `DukcapilMobilePerekamanForm.tsx` ✅

**Gap Phase 2:**
```typescript
// ⚠️ Validasi NIK belum enforce:
// Saat ini: hanya validasi panjang 16 digit
// Seharusnya: NIK harus diawali "3372" (kode wilayah Kota Surakarta)
const isNIKValid = (nik: string) =>
  nik.length === 16 && nik.startsWith("3372") && /^\d+$/.test(nik);

// ⚠️ Field kecamatanAsal belum ada di form:
// Tambahkan dropdown KecamatanSolo di semua form Dukcapil
const KECAMATAN_SOLO = ["Laweyan", "Serengan", "Pasar Kliwon", "Jebres", "Banjarsari"];
```

Form fields lengkap yang seharusnya ada:
```typescript
interface DukcapilFormFields {
  // Sub: antar_ktp, kia_akte
  nik: string;                  // 16 digit, wajib prefix 3372
  namaLengkap: string;
  jenisLayanan: "ktp_el" | "kk" | "kia" | "akta_lahir" | "akta_kematian";
  kecamatanAsal: KecamatanSolo; // ⚠️ Belum ada di form saat ini
  noHpWhatsapp: string;
  alamatAntar: string;

  // Sub: mobile_perekaman (jemput bola)
  alasanJemputBola: "lansia" | "difabel" | "sakit_keras";
  keteranganKondisi?: string;
  waktuPilihan: string;         // Jadwal kunjungan tim Dukcapil
}
// OTP serah terima: WAJIB ada (requiresOtp: true di submitOrder)
```

---

### Disdik (`gov_disdik`) — ✅ 1 Form + ⚠️ 1 Form Belum Ada

Sub-service routing:
- `disdik_antar_jemput_sekolah` → `DisdikAntarSekolahForm.tsx` ✅
- `disdik_antar_ijazah_buku` → `DisdikAntarIjazahForm.tsx` ❌ BELUM DIBUAT

**Gap Phase 2 — Form antar ijazah:**
```typescript
// File baru yang perlu dibuat:
// src/components/civic/forms/disdik/DisdikAntarIjazahForm.tsx
interface DisdikIjazahFormFields {
  namaAlumnus: string;
  nisn: string;                 // Nomor Induk Siswa Nasional (10 digit)
  asalSekolah: string;          // Dropdown sekolah negeri Solo
  jenisLegalisir: "ijazah" | "raport" | "buku_bos";
  jumlahDokumen: number;        // Min 1, Max 10
  alamatAntar: string;
  kontakWa: string;
}
```

**Gap Phase 2 — Form antar jemput sekolah:**
```typescript
// ⚠️ Field yang masih kurang di DisdikAntarSekolahForm:
catatanKhusus?: string; // Alergi, kebutuhan khusus
// Tambah validasi: jamBerangkat harus lebih awal dari jamPulang
```

---

### Dispusip (`gov_dispusip`) — ✅ 1 Form dengan Gap

Sub-service:
- `dispusip_kurir_buku` → `DispusipKurirBukuForm.tsx` ✅ (dengan gap)

**Gap Phase 2:**
```typescript
// ⚠️ Field yang belum ada di DispusipKurirBukuForm:
interface DispusipFormFieldsMissing {
  kategoriPustaka: "fiksi" | "non_fiksi" | "referensi" | "anak_anak" | "majalah";
  durasiPeminjaman: 7 | 14 | 21; // Radio button, bukan text input
  // Catatan: noAnggotaPerpus perlu validasi format (angka 8 digit)
}
// OTP pengembalian: saat buku dikembalikan ke driver kurir
```

---

### Disnaker (`gov_disnaker`) — ✅ 2 Form dengan Gap

Sub-service:
- `disnaker_kartu_kuning_ak1` → `DisnakerKartuKuningForm.tsx` ✅
- `disnaker_pelatihan_blk` → `DisnakerPelatihanBlkForm.tsx` ✅

**Gap Phase 2:**
```typescript
// ⚠️ Field yang belum ada di DisnakerKartuKuningForm:
interface DisnakerKKMissing {
  pendidikanTerakhir: "SD" | "SMP" | "SMA_SMK" | "D1_D3" | "S1_ke_atas"; // dropdown, bukan text
  bidangKeahlian?: string; // Keahlian yang dimiliki (text input opsional)
  // nik wajib ada — cek apakah sudah ada validasi 16 digit
}
```

---

## KELOMPOK B — ANTAR FARMASI / MEDIS

### Dinkes (`gov_dinkes`) — ✅ 3 Form dengan Gap

Sub-service routing:
- `dinkes_resep_puskesmas` → `DinkesResepObatForm.tsx` ✅
- `dinkes_prolanis` → `DinkesProlanisForm.tsx` ✅
- `dinkes_donor_darah` → `DinkesDonorDarahForm.tsx` ✅

**Gap Phase 2:**
```typescript
// ⚠️ Field yang belum ada di DinkesResepObatForm & DinkesProlanisForm:
interface DinkesMedicalMissing {
  noBpjs?: string;            // Nomor kartu BPJS Kesehatan (13 digit)
  catatanAlergi?: string;     // Alergi obat yang perlu diperhatikan driver
  // asalPuskesmas sudah ada tapi pastikan list lengkap 17 Puskesmas Solo
}

// ⚠️ DinkesDonorDarahForm perlu treatment khusus emergency:
// - Status awal "pending" (skip verifikasi) karena mendesak
// - Tampilkan nomor PMI: 0271-632202 yang bisa diklik
// - Form sangat ringkas: RS tujuan + gol. darah + rhesus + jumlah kantong
```

---

## KELOMPOK C — BANTUAN SOSIAL

### Dinsos (`gov_dinsos`) — ✅ 3 Form dengan Gap Minor

Sub-service routing:
- `dinsos_bansos_pasar` → `DinsosBansosSembakoForm.tsx` ✅
- `dinsos_ojek_difabel` → `DinsosOjekDifabelForm.tsx` ✅
- `dinsos_tanggap_bencana` → `DinsosTanggapBencanaForm.tsx` ✅

**Gap Phase 2:**
```typescript
// ⚠️ DinsosTanggapBencanaForm — field yang belum ada:
interface DinsosBencanaMissing {
  kebutuhanLogistik: string[]; // Multi-select checkbox!
  // Pilihan: ["Beras 5kg", "Air Mineral 1 dus", "Tenda Darurat", "Selimut", "Sembako Paket"]
  // Saat ini mungkin hanya text input biasa
}

// ⚠️ DinsosOjekDifabelForm — field yang belum ada:
interface DinsosOjekMissing {
  alatBantu?: string; // "Kursi Roda", "Tongkat", "Walker", dll
  // Tambahkan di form sebagai text input opsional
}
```

---

## KELOMPOK D — PENGADUAN / LAPORAN

### Dishub (`gov_dishub`) — ✅ 3 Form Lengkap

Sub-service routing:
- `dishub_cfd_shelter` / `dishub_peta_shelter_cfd` → `DishubCfdShelterView.tsx` ✅ (informasi saja)
- `dishub_booking_uji_kir` → `DishubBookingKirForm.tsx` ✅
- `dishub_lapor_jalan` / `dishub_lapor_lalin` → `DishubLaporLalinForm.tsx` ✅

Status: **Sudah cukup lengkap**, tidak ada gap kritikal di Phase 2.

---

### DLH (`gov_dlh`) — ✅ 2 Form dengan Gap

Sub-service:
- `dlh_jemput_sampah_daur_ulang` / yang include `sampah` → `DlhBankSampahForm.tsx` ✅
- `dlh_lapor_pohon_tumbang` / yang include `pohon` → `DlhLaporPohonForm.tsx` ✅

**Gap Phase 2:**
```typescript
// ⚠️ DlhBankSampahForm — field yang belum ada:
interface DlhBankSampahMissing {
  jenisSampah: string[]; // Multi-select CHECKBOX! Bukan single select
  // Pilihan: ["Kardus/Kertas", "Plastik", "Besi/Logam", "Kaca/Botol", "Jelantah/Minyak", "Kertas Koran"]
  estimasiBeratKg: number; // Number input, min 1, max 500
  // ⚠️ Penting: setelah verifikasi berat oleh DLH, trigger Eco Points ke customer
}
```

---

### Diskominfo (`gov_diskominfo`) — ✅ 1 Form dengan Gap

Sub-service:
- `diskominfo_ulas_terpadu` / yang include `ulas` → `DiskominfoUlasForm.tsx` ✅

**Gap Phase 2:**
```typescript
// ⚠️ DiskominfoUlasForm — field yang belum ada:
interface DiskominfoMissing {
  judulAduan: string;     // Judul singkat (max 60 karakter) — wajib terpisah dari deskripsi
  kelurahan: string;      // Dropdown kelurahan/desa Solo (54 kelurahan)
  kecamatan: KecamatanSolo; // 5 kecamatan Solo
  // Tambah karakter counter untuk isiAduan (max 500 karakter)
}
```

---

### Satpol PP (`gov_satpolpp`) — ✅ 1 Form dengan Gap

Sub-service:
- `satpolpp_lapor_trantib` / yang include `trantib` → `SatpolppTrantibForm.tsx` ✅

**Gap Phase 2:**
```typescript
// ⚠️ SatpolppTrantibForm — field yang belum ada:
interface SatpolppMissing {
  rt: string;   // Nomor RT (2 digit)
  rw: string;   // Nomor RW (2 digit)
  kelurahan: string;
  kecamatan: KecamatanSolo;

  // Kondisional: tampilkan hanya jika jenisGangguan === "izin_acara"
  namaAcara?: string;
  estimasiPeserta?: number;
  tanggalAcara?: string;
}

// Pattern untuk field kondisional:
{jenisGangguan === "izin_acara" && (
  <>
    <CivicTextField label="Nama Acara" ... />
    <CivicTextField label="Estimasi Peserta" type="number" ... />
    <CivicTextField label="Tanggal Acara" type="date" ... />
  </>
)}
```

---

## KELOMPOK E — DARURAT / EMERGENCY

### Damkar (`gov_damkar`) — ✅ 1 Form, ⚠️ GPS Belum Ada

Sub-service:
- Yang include `damkar` atau `panic` → `DamkarPanicDispatchForm.tsx` ✅
- `damkar_animal_rescue` → ❌ Belum ada form terpisah (saat ini sama-sama ke panic form)

**Gap Phase 2 — KRITIKAL:**
```typescript
// ⚠️ DamkarPanicDispatchForm — GPS auto-detect belum ada!
// Tambahkan GPS detection di useEffect:
const [gpsLat, setGpsLat] = useState<number | null>(null);
const [gpsLng, setGpsLng] = useState<number | null>(null);
const [gpsStatus, setGpsStatus] = useState<"detecting" | "found" | "error" | "idle">("idle");

const detectGPS = () => {
  setGpsStatus("detecting");
  navigator.geolocation.getCurrentPosition(
    (pos) => { setGpsLat(pos.coords.latitude); setGpsLng(pos.coords.longitude); setGpsStatus("found"); },
    () => setGpsStatus("error"),
    { timeout: 8000, enableHighAccuracy: true }
  );
};

// ⚠️ Field yang belum ada:
interface DamkarPanicMissing {
  gpsLat: number | null;
  gpsLng: number | null;
  jenisDarurat: "kebakaran" | "ledakan" | "orang_terjebak" | "gas_bocor"; // enum, bukan free text
  tingkatKeparahan: "besar" | "sedang" | "kecil";
}

// ⚠️ Status harus langsung "pending" (skip pending_verification)!
// ⚠️ Tampilkan nomor darurat yang bisa diklik: tel:027163 0133

// Untuk animal_rescue — buat form terpisah DamkarAnimalRescueForm.tsx:
// - Tidak emergency, boleh lebih detail
// - jenisRescue: enum sarang tawon/ular/hewan terjebak/cincin macet
// - waktuPilihan: bisa pilih jadwal (tidak harus segera)
```

**UI Rules Panic Button (wajib):**
- Latar merah/oranye menyala, tombol submit merah besar
- Teks tombol: `"🚨 DISPATCH SIAGA 1 DAMKAR SEKARANG"` (sudah ada ✅)
- Tampilkan nomor Damkar: `0271-7630133` (bisa diklik)
- Countdown auto-submit setelah GPS terkunci: **OPSIONAL** (Phase 3)

---

### BPBD (`gov_bpbd`) — ✅ 1 Form dengan Gap Signifikan

Sub-service:
- Yang include `bpbd` atau `banjir` → `BpbdLaporBanjirForm.tsx` ✅

**Gap Phase 2:**
```typescript
// ⚠️ BpbdLaporBanjirForm perlu refactor signifikan:
// Tambah mode toggle di atas form:
const [mode, setMode] = useState<"ews" | "bantuan">("ews");

// Mode EWS: tampilkan info status siaga sungai (no form, hanya info)
// Mode Bantuan: tampilkan form permohonan bantuan darurat

// Field yang belum ada di mode bantuan:
interface BpbdBantuanMissing {
  gpsLat?: number;    // GPS opsional (tidak semua user punya akses)
  gpsLng?: number;
  levelSiaga: "siaga_1" | "siaga_2" | "siaga_3" | "siaga_4"; // 1=sangat bahaya
  bantuanDiminta: string[]; // Multi-select: tenda_darurat/selimut/sembako/perahu_karet/evakuasi_medis
  jumlahKK: number;
}

// Status awal: "pending" (skip verifikasi) karena emergency!
```

---

### DP3APM (`gov_dp3a`) — ✅ 1 Form, ⚠️ Mode Anonim Belum Ada (KRITIS!)

Sub-service:
- Yang include `dp3a` atau `sapa` → `Dp3aSapa129Form.tsx` ✅

**Gap Phase 2 — KRITIS (wajib diimplementasikan):**
```typescript
// ⚠️ Dp3aSapa129Form WAJIB memiliki Mode Anonim!
// Ini adalah aturan AGENTS.md yang belum dipenuhi:

const [isAnonymous, setIsAnonymous] = useState(true); // Default anonim!

// Header form wajib punya toggle:
<div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950/30 rounded-2xl border border-purple-200/60 dark:border-purple-800/40">
  <div>
    <p className="text-xs font-bold text-purple-700 dark:text-purple-300">Mode Anonim</p>
    <p className="text-[11px] text-purple-600 dark:text-purple-400">Identitas Anda terlindungi sepenuhnya</p>
  </div>
  <Switch checked={isAnonymous} onCheckedChange={setIsAnonymous} />
</div>

// Di handleSubmit, jika anonim:
const randomCode = Math.floor(1000 + Math.random() * 9000);
const effectiveName = isAnonymous ? `Pemohon-${randomCode}` : reporterName;

// citizenDetails:
{
  reporterName: effectiveName,    // Kode anonim atau nama asli
  isAnonymous,                    // Flag untuk workspace OPD
  // safeContact tetap disimpan tapi hanya visible ke petugas tertentu
}

// ⚠️ Field jenisKasus saat ini terlalu umum — perlu enum spesifik:
interface Dp3aJenisKasus {
  jenisKasus: "kdrt" | "kekerasan_seksual" | "perdagangan_orang" | "kekerasan_anak" | "penelantaran" | "darurat_perlindungan";
}
```

---

## KELOMPOK F — TRANSAKSIONAL / PAJAK

### Bapenda (`gov_bapenda`) — ✅ 1 Form + 2 Form Belum Ada

Sub-service:
- `bapenda_pbb` → `BapendaPbbForm.tsx` ✅
- `bapenda_retribusi_pasar` → ❌ `BapendaRetribusiPasarForm.tsx` BELUM DIBUAT
- `bapenda_konsultasi_pajak` → ❌ `BapendaKonsultasiPajakForm.tsx` BELUM DIBUAT

**Phase 2 — Form retribusi pasar:**
```typescript
// src/components/civic/forms/bapenda/BapendaRetribusiPasarForm.tsx
interface BapendaRetribusiFields {
  idKiosPasar: string;          // Kode kios dari kartu ID pedagang
  namaKios: string;
  tanggalRetribusi: string;     // date picker
  nominalRetribusi: number;     // Tampilkan sebagai currency (Rp)
  metodePembayaran: "qris" | "tunai"; // Bayar lewat platform
  namaKontakPedagang: string;
  kontakWa: string;
}
```

**Phase 2 — Form konsultasi pajak:**
```typescript
// src/components/civic/forms/bapenda/BapendaKonsultasiPajakForm.tsx
interface BapendaKonsultasiFields {
  jenisKonsultasi: "npwpd_baru" | "keberatan_pajak" | "insentif_umkm" | "pemutihan";
  namaUsaha: string;
  nik: string;
  pertanyaanKonsultasi: string; // Textarea, max 500 karakter
  jadwalKonsultasi: string;     // Date + time picker
  kontakWa: string;
}
```

**Gap BapendaPbbForm:**
```typescript
// ⚠️ Validasi format NOP:
const isValidNOP = (nop: string) =>
  /^\d{2}\.\d{2}\.\d{3}\.\d{3}\.\d{3}-\d{4}\.\d$/.test(nop);
// Format: 33.71.xxx.xxx.xxx-xxxx.x (kode Bapenda Surakarta)
```

---

## KELOMPOK G — BOOKING / RESERVASI

### Dispar (`gov_dispar`) — ✅ 1 Form dengan Gap

Sub-service:
- Yang include `dispar` atau `heritage` → `DisparHeritageTourForm.tsx` ✅

**Gap Phase 2:**
```typescript
// ⚠️ DisparHeritageTourForm — destinasi saat ini single select:
// Harus diubah jadi multi-select checkbox!
const DESTINASI_HERITAGE = [
  { id: "keraton", label: "Keraton Kasunanan Surakarta" },
  { id: "mangkunegaran", label: "Pura Mangkunegaran" },
  { id: "radya_pustaka", label: "Museum Radya Pustaka" },
  { id: "triwindu", label: "Pasar Triwindu (Antik)" },
  { id: "kampung_batik", label: "Kampung Batik Laweyan" },
];

const [destinasiDipilih, setDestinasiDipilih] = useState<string[]>([]);
// Pattern toggle checkbox: di dalam map destinasi, toggle item di array
```

---

### Dispertan (`gov_dispertan`) — ✅ 1 Form dengan Gap

Sub-service:
- Yang include `dispertan` atau `puskeswan` → `DispertanPuskeswanForm.tsx` ✅

**Gap Phase 2:**
```typescript
// ⚠️ DispertanPuskeswanForm — field yang belum ada:
interface DispertanMissing {
  layananDiminta: "pemeriksaan_umum" | "vaksin_rabies" | "sterilisasi" | "konsultasi" | "grooming_medis"; // dropdown!
  riwayatVaksin?: string;   // Vaksin terakhir apa, kapan
  riwayatObat?: string;     // Obat yang sedang dikonsumsi hewan
  // fotoHewan: Phase 3 (butuh Firebase Storage upload)
}
```

---

## KELOMPOK H — USAHA / LEGALITAS

### Diskop (`gov_diskop`) — ✅ 2 Form dengan Gap Minor

Sub-service:
- `diskop_legalitas_nib` → `DiskopLegalitasNibForm.tsx` ✅
- `diskop_dana_bergulir` → `DiskopDanaBergulirForm.tsx` ✅

**Gap Phase 2:**
```typescript
// ⚠️ DiskopLegalitasNibForm — field yang belum ada:
interface DiskopNibMissing {
  omzetBulananEstimasi?: number; // Currency input (Rp), opsional
}

// ⚠️ DiskopDanaBergulirForm — field yang belum ada:
interface DiskopBergulirMissing {
  agunanYangDimiliki?: string; // Aset yang dijaminkan (opsional)
}
```

---

### DPMPTSP (`gov_dpmptsp`) — ✅ 1 Form dengan Gap

Sub-service:
- Yang include `dpmptsp` atau `mpp` → `DpmptspMppIzinForm.tsx` ✅

**Gap Phase 2:**
```typescript
// ⚠️ DpmptspMppIzinForm — field yang belum ada:
interface DpmptspMissing {
  nomorRegistrasiMPP: string;  // Nomor antrean/registrasi di MPP (wajib!)
  jenisIzin: "nib" | "imb_pbg" | "situ" | "siup" | "hak_bangunan" | "lainnya"; // dropdown!
  nomorSKJikaDisetujui?: string; // Jika sudah tahu nomor SK (opsional)
}
```

---

## Catatan Penting: Field Validasi (Diperbarui Phase 2)

| Field | Aturan |
|-------|--------|
| NIK | Tepat 16 digit, hanya angka, WAJIB prefix `3372` (Solo) |
| No. HP/WA | Minimal 10 digit, format Indonesia (+62/08xx) |
| GPS koordinat | Validasi range: lat (-7.4 s/d -7.7), lng (110.7 s/d 110.9) |
| Tanggal jadwal | Min: besok, Max: 30 hari ke depan |
| Estimasi berat (DLH) | Min: 1 kg, Max: 500 kg per pickup |
| Nomor NOP/SPPT | Format: `33.71.xxx.xxx.xxx-xxxx.x` |
| Nomor RM | Kombinasi huruf-angka, sesuai format Puskesmas |
| NISN Disdik | Tepat 10 digit angka |
| No. Anggota Perpusip | 8 digit angka |
| Nomor Registrasi MPP | Prefix "MPP-" + 6 digit |

## Komponen Shared yang Tersedia

```typescript
// Dari @/components/civic/shared/CivicFormControls:
import {
  CivicTextField,      // Text input dengan label + icon
  CivicSelectField,    // Single select dropdown
  CivicTextareaField,  // Textarea dengan label
  CivicPriceFooter,    // Footer harga + keterangan
  CivicSubmitButton,   // Submit + Cancel button
} from "@/components/civic/shared/CivicFormControls";

// Untuk multi-select (belum ada di shared controls — buat inline):
// Pattern: array state + checkbox toggle per item
```
