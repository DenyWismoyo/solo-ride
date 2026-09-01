# PHASE2_MISSING_FORMS.md — Form yang Belum Ada + Template

> Daftar lengkap form yang masih belum dibuat beserta spesifikasi field dan
> cara mendaftarkannya ke CivicFormDispatcher.tsx.

---

## Summary Missing Forms

| Dinas | Form | serviceId | Status |
|-------|------|-----------|--------|
| Damkar | DamkarAnimalRescueForm.tsx | damkar_animal_rescue | Belum dibuat |
| Bapenda | BapendaRetribusiPasarForm.tsx | bapenda_retribusi_pasar | Belum dibuat |
| Bapenda | BapendaKonsultasiPajakForm.tsx | bapenda_konsultasi_pajak | Belum dibuat |
| Disdik | DisdikAntarIjazahForm.tsx | disdik_antar_ijazah_buku | Belum dibuat |
| DP3A | Dp3aKonselingPuspagaForm.tsx | dp3a_konseling_puspaga | Belum dibuat |
| BPBD | BpbdBantuanDaruratForm.tsx | bpbd_bantuan_darurat | Refactor dari form lama |

---

## 1. DamkarAnimalRescueForm.tsx

```typescript
// src/components/civic/forms/damkar/DamkarAnimalRescueForm.tsx
// Status awal: "pending_verification" (bukan emergency — bisa dijadwalkan)
// requiresOtp: false

const JENIS_RESCUE_OPTIONS = [
  { value: "sarang_tawon", label: "Sarang Tawon / Vespa Agresif" },
  { value: "ular", label: "Ular Berbisa Masuk Rumah / Area" },
  { value: "hewan_terjebak", label: "Hewan Terjebak / Terperangkap" },
  { value: "benda_terjepit", label: "Cincin / Benda Terjepit (non-medis)" },
  { value: "lainnya", label: "Lainnya (Jelaskan di keterangan)" },
];

// citizenDetails:
interface DamkarAnimalRescueDetails {
  serviceId: string;
  serviceName: string;
  jenisRescue: string;       // Dari JENIS_RESCUE_OPTIONS
  lokasiRescue: string;      // Alamat lengkap lokasi kejadian
  deskripsiDetail: string;   // Deskripsi situasi (textarea)
  waktuPilihan?: string;     // Opsional: segera atau pilih jadwal
  kontakWa: string;
  submittedAt: string;
}

// Register di CivicFormDispatcher.tsx:
// PENTING: Letakkan SEBELUM baris: if (serviceId.includes("damkar"))
// if (serviceId === "damkar_animal_rescue") {
//   return <DamkarAnimalRescueForm agency={agency} service={service} onSuccess={onSuccess} onCancel={onCancel} />;
// }
```

---

## 2. BapendaRetribusiPasarForm.tsx

```typescript
// src/components/civic/forms/bapenda/BapendaRetribusiPasarForm.tsx
// Status awal: "pending_verification"
// requiresOtp: false

interface BapendaRetribusiDetails {
  serviceId: string;
  serviceName: string;
  idKiosPasar: string;          // Kode kios dari kartu ID pedagang
  namaKios: string;
  tanggalRetribusi: string;     // Date picker: format YYYY-MM-DD
  nominalRetribusi: number;     // Currency input (Rp)
  metodePembayaran: "qris" | "tunai";
  namaKontakPedagang: string;
  kontakWa: string;
  submittedAt: string;
}

// Notes: Tampilkan nominalRetribusi sebagai currency Rp format
// Validasi: tanggalRetribusi tidak boleh di masa depan >30 hari
```

---

## 3. BapendaKonsultasiPajakForm.tsx

```typescript
// src/components/civic/forms/bapenda/BapendaKonsultasiPajakForm.tsx
// Status awal: "pending_verification"

const JENIS_KONSULTASI_OPTIONS = [
  { value: "npwpd_baru", label: "Pendaftaran NPWPD Baru" },
  { value: "keberatan_pajak", label: "Keberatan atas Ketetapan Pajak" },
  { value: "insentif_umkm", label: "Insentif Pajak UMKM" },
  { value: "pemutihan", label: "Program Pemutihan / Penghapusan Denda" },
];

interface BapendaKonsultasiDetails {
  serviceId: string;
  serviceName: string;
  jenisKonsultasi: string;     // Dari JENIS_KONSULTASI_OPTIONS
  namaUsaha?: string;          // Nama usaha jika ada
  nik: string;                 // NIK pemohon (16 digit, prefix 3372)
  pertanyaanKonsultasi: string; // Textarea max 500 karakter
  jadwalKonsultasi: string;    // Date + time (min: besok, max: 30 hari ke depan)
  kontakWa: string;
  submittedAt: string;
}
```

---

## 4. DisdikAntarIjazahForm.tsx

```typescript
// src/components/civic/forms/disdik/DisdikAntarIjazahForm.tsx
// Status awal: "pending_verification"
// requiresOtp: true  <- WAJIB OTP untuk serah terima dokumen resmi

const JENIS_LEGALISIR_OPTIONS = [
  { value: "ijazah", label: "Ijazah Asli" },
  { value: "raport", label: "Raport / Nilai Akhir" },
  { value: "buku_bos", label: "Buku BOS / Bantuan Siswa" },
];

// Daftar sekolah negeri Solo untuk dropdown:
const SEKOLAH_NEGERI_SOLO = [
  "SDN Mangkubumen Kidul No. 16",
  "SDN Cemara 2",
  "SMPN 1 Surakarta",
  "SMPN 2 Surakarta",
  "SMPN 7 Surakarta",
  "SMAN 1 Surakarta",
  "SMAN 2 Surakarta",
  "SMAN 3 Surakarta",
  "SMKN 2 Surakarta",
  "SMKN 5 Surakarta",
  // Tambahkan sesuai data DAPODIK Solo
];

interface DisdikIjazahDetails {
  serviceId: string;
  serviceName: string;
  namaAlumnus: string;
  nisn: string;                // 10 digit angka
  asalSekolah: string;         // Dropdown dari SEKOLAH_NEGERI_SOLO
  jenisLegalisir: string;      // Dari JENIS_LEGALISIR_OPTIONS
  jumlahDokumen: number;       // Min 1, Max 10
  alamatAntar: string;         // Alamat tujuan pengiriman dokumen
  kontakWa: string;
  catatanKhusus?: string;      // Kebutuhan khusus penerima
  submittedAt: string;
}
```

---

## 5. Dp3aKonselingPuspagaForm.tsx

```typescript
// src/components/civic/forms/dp3a/Dp3aKonselingPuspagaForm.tsx
// Status awal: "pending_verification"
// Mode anonim: OPSIONAL (default OFF untuk konseling reguler)

const JENIS_KONSELING_OPTIONS = [
  { value: "pernikahan", label: "Konseling Pernikahan & Keluarga" },
  { value: "pola_asuh", label: "Pola Asuh Anak" },
  { value: "trauma", label: "Pemulihan Trauma Psikologis" },
  { value: "remaja", label: "Permasalahan Remaja & Pergaulan" },
  { value: "lansia", label: "Pendampingan Psikologis Lansia" },
];

interface Dp3aKonselingDetails {
  serviceId: string;
  serviceName: string;
  isAnonymous: boolean;
  namaAtauKode: string;        // Bisa nama asli atau kode anonim
  jenisKonseling: string;      // Dari JENIS_KONSELING_OPTIONS
  jadwalKonsultasi: string;    // Date + time
  catatanSingkat?: string;     // Deskripsi singkat kebutuhan konseling
  kontakWa: string;
  submittedAt: string;
}
```

---

## Cara Mendaftarkan Form Baru di CivicFormDispatcher.tsx

```typescript
// src/components/civic/forms/CivicFormDispatcher.tsx

// 1. Tambah import di atas:
import { DamkarAnimalRescueForm } from "./damkar/DamkarAnimalRescueForm";
import { BapendaRetribusiPasarForm } from "./bapenda/BapendaRetribusiPasarForm";
import { BapendaKonsultasiPajakForm } from "./bapenda/BapendaKonsultasiPajakForm";
import { DisdikAntarIjazahForm } from "./disdik/DisdikAntarIjazahForm";
import { Dp3aKonselingPuspagaForm } from "./dp3a/Dp3aKonselingPuspagaForm";

// 2. Tambah case SEBELUM catch-all conditions:
// URUTAN PENTING: spesifik dulu, baru catch-all

// Damkar animal rescue — WAJIB sebelum: if (serviceId.includes("damkar"))
if (serviceId === "damkar_animal_rescue") {
  return <DamkarAnimalRescueForm agency={agency} service={service} onSuccess={onSuccess} onCancel={onCancel} />;
}

// Bapenda forms — sebelum catch-all bapenda
if (serviceId === "bapenda_retribusi_pasar") {
  return <BapendaRetribusiPasarForm agency={agency} service={service} onSuccess={onSuccess} onCancel={onCancel} />;
}
if (serviceId === "bapenda_konsultasi_pajak") {
  return <BapendaKonsultasiPajakForm agency={agency} service={service} onSuccess={onSuccess} onCancel={onCancel} />;
}

// Disdik ijazah — sebelum catch-all disdik
if (serviceId === "disdik_antar_ijazah_buku") {
  return <DisdikAntarIjazahForm agency={agency} service={service} onSuccess={onSuccess} onCancel={onCancel} />;
}

// DP3A konseling — sebelum catch-all dp3a
if (serviceId === "dp3a_konseling_puspaga") {
  return <Dp3aKonselingPuspagaForm agency={agency} service={service} onSuccess={onSuccess} onCancel={onCancel} />;
}
```
