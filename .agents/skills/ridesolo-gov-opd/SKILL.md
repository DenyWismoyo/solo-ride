---
name: ridesolo-gov-opd
description: |
  Panduan LENGKAP implementasi layanan pemerintahan (Government/OPD) untuk Ride-Solo.
  Berisi spesifikasi form customer, workspace OPD, dan aturan bisnis per DINAS spesifik.
  
  Aktifkan skill ini ketika:
  - Membuat atau memodifikasi CivicModal (sisi customer) untuk layanan dinas tertentu
  - Membuat atau memodifikasi GovWorkspace (sisi OPD/petugas dinas)
  - Menambahkan dinas baru ke ekosistem
  - Merancang form field yang sesuai dengan layanan riil suatu dinas
  - Menentukan validasi, status flow, atau data contract untuk layanan pemerintahan
  - Mendiagnosis ketidaksesuaian form dengan kebutuhan lapangan

  File pendukung di folder ini:
  - FORM_SPECIFICATIONS.md        → Field-by-field form specs per 18 dinas (WAJIB BACA)
  - OPD_WORKSPACE_SPECS.md        → Panel & fitur workspace sisi petugas OPD per dinas
  - STATUS_FLOW_RULES.md          → Business rules status order per kategori dinas
  - DATA_CONTRACTS_EXTENDED.md    → TypeScript interface CitizenDetails per dinas
  - dinas/                        → 1 file per dinas, blueprint operasional lengkap

  Skill terkait yang harus dibaca bersamaan:
  - ridesolo-dev → Arsitektur umum & integration patterns
  - ridesolo-functions → Firebase triggers untuk notifikasi dinas
---

# Skill: Ridesolo Government OPD — Panduan Layanan Dinas Spesifik

## ⚠️ ATURAN WAJIB — Baca Sebelum Menulis Kode

### Aturan 1: Satu Dinas = Satu CivicModal Spesifik

Setiap `additionalRole` pemerintahan (`gov_*`) WAJIB memiliki dedicated civic modal di
`src/components/civic/`. Dilarang menggunakan `DynamicGovCivicModal` sebagai solusi
permanen untuk dinas yang form-nya sudah terdefinisi di skill ini.

```
Naming convention: <DinasAbbrev>CivicModal.tsx
Contoh:
- DukcapilCivicModal.tsx    ✅ (sudah ada)
- DinkesCivicModal.tsx      ✅ (sudah ada)
- DinsosCivicModal.tsx      ✅ (sudah ada)
- DiskopCivicModal.tsx      ✅ (sudah ada)
- DisparCivicModal.tsx      ✅ (sudah ada)
- DishubCivicModal.tsx      ✅ (sudah ada)
- BapendaCivicModal.tsx     ✅ (sudah ada)
- DamkarCivicModal.tsx      ✅ (sudah ada)
- BpbdCivicModal.tsx        ✅ (sudah ada)
- Dp3aCivicModal.tsx        ✅ (sudah ada)
- DlhCivicModal.tsx         ❌ HARUS DIBUAT
- DisdikCivicModal.tsx      ❌ HARUS DIBUAT
- DispusipCivicModal.tsx    ❌ HARUS DIBUAT
- DispertanCivicModal.tsx   ❌ HARUS DIBUAT
- DisnakerCivicModal.tsx    ❌ HARUS DIBUAT
- DiskominfoCivicModal.tsx  ❌ HARUS DIBUAT
- SatpolppCivicModal.tsx    ❌ HARUS DIBUAT
- DpmptspCivicModal.tsx     ❌ HARUS DIBUAT
```

### Aturan 2: Satu Dinas = Satu GovWorkspace Spesifik

Sisi OPD juga WAJIB memiliki workspace-nya sendiri di `src/components/government/`.
`GovOpdModularWorkspace` HANYA boleh dipakai sementara untuk dinas yang belum punya
workspace spesifik.

```
Naming convention: Gov<DinasAbbrev>Workspace.tsx
Contoh:
- GovDukcapilWorkspace.tsx  ✅ (sudah ada)
- GovDinkesWorkspace.tsx    ✅ (sudah ada)
- GovDinsosWorkspace.tsx    ✅ (sudah ada)
- GovDiskopWorkspace.tsx    ✅ (sudah ada)
- GovDisparWorkspace.tsx    ✅ (sudah ada)
- GovDishubWorkspace.tsx    ✅ (sudah ada)
- GovBapendaWorkspace.tsx   ✅ (sudah ada)
- GovDamkarWorkspace.tsx    ✅ (sudah ada)
- GovBpbdWorkspace.tsx      ✅ (sudah ada)
- GovDp3aWorkspace.tsx      ✅ (sudah ada)
- GovDlhWorkspace.tsx       ❌ HARUS DIBUAT
- GovDisdikWorkspace.tsx    ❌ HARUS DIBUAT
- GovDispusipWorkspace.tsx  ❌ HARUS DIBUAT
- GovDispertanWorkspace.tsx ❌ HARUS DIBUAT
- GovDisnakerWorkspace.tsx  ❌ HARUS DIBUAT
- GovDiskominfoWorkspace.tsx ❌ HARUS DIBUAT
- GovSatpolppWorkspace.tsx  ❌ HARUS DIBUAT
- GovDpmptspWorkspace.tsx   ❌ HARUS DIBUAT
```

### Aturan 3: Sub-service Routing Wajib per Layanan

Jika dalam satu dinas ada layanan dengan interaksi berbeda (contoh: Damkar punya
Panic Button dan Animal Rescue), routing HARUS membedakannya via `serviceId` prop.

```typescript
// Di more/page.tsx — routing sub-service yang benar
const handleCardClick = (service: AppService) => {
  if (service.additionalRole === "gov_damkar") {
    setDamkarServiceId(service.id); // "damkar_panic_button" | "damkar_animal_rescue"
    setIsDamkarOpen(true);
    return;
  }
};

// Di DamkarCivicModal — render beda berdasarkan serviceId
interface DamkarCivicModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string; // wajib ada!
}
```

### Aturan 4: Emergency Services → GPS First, Form Ringkas

Untuk kategori darurat (Damkar, BPBD, DP3A), form wajib:
1. Auto-detect koordinat GPS user via `navigator.geolocation`
2. Tombol submit BESAR, mudah ditekan dengan satu tangan (panic-friendly)
3. Maksimal 3 input field — sisanya auto-filled dari GPS/profil
4. Tampilkan nomor darurat yang bisa diklik langsung

### Aturan 5: Kerahasiaan DP3APM (Wajib Privacy-First)

Layanan `gov_dp3a` WAJIB:
1. Tampilkan toggle "Mode Anonim" di header modal
2. Jika Mode Anonim aktif: nama tersimpan sebagai kode (contoh: "Pemohon-3421")
3. Nomor WA pemohon TIDAK ditampilkan di workspace OPD yang bisa diakses umum
4. Notifikasi SMS/WA dikirim lewat relay, bukan langsung ke nomor pemohon

### Aturan 6: Registrasi Modal di more/page.tsx dan gov/page.tsx

Setiap modal baru WAJIB didaftarkan di dua tempat:

```typescript
// 1. src/app/(customer)/services/more/page.tsx
// - Tambah state: const [isDamkarOpen, setIsDamkarOpen] = useState(false);
// - Tambah routing di handleCardClick()
// - Tambah render modal: <DamkarCivicModal isOpen={isDamkarOpen} ... />

// 2. src/app/(government)/gov/page.tsx  
// - Tambah conditional render workspace di section 3
// - Hapus dari exclude list di GovOpdModularWorkspace fallback
```

---

## 📂 Pengelompokan 8 Tipe Interaksi OPD

Gunakan ini untuk menentukan template form yang tepat:

| Tipe | Dinas | Karakteristik Form |
|------|-------|-------------------|
| **A. Delivery/Antar Dokumen** | Dukcapil, Disdik, Dispusip, Disnaker | NIK + jenis dokumen + kecamatan asal |
| **B. Antar Farmasi/Medis** | Dinkes | No. RM + asal Puskesmas + No. BPJS + catatan alergi |
| **C. Bantuan Sosial** | Dinsos | Kategori difabel/lansia + jenis bansos + token PKH |
| **D. Pengaduan/Laporan** | Dishub, DLH, Diskominfo, Satpol PP | Kategori + Kelurahan/RT/RW + foto opsional |
| **E. Darurat/Emergency** | Damkar, BPBD, DP3A | GPS auto + tombol besar + minimal field |
| **F. Transaksional/Pajak** | Bapenda | No. SPPT/NOP + jenis pajak + tahun + nominal |
| **G. Booking/Reservasi** | Dispar, Dispertan | Tanggal + jumlah + preferensi/catatan |
| **H. Usaha/Legalitas** | Diskop, DPMPTSP | Nama usaha + NIB/no. izin + jenis layanan |

---

## 📋 Checklist Implementasi Dinas Baru

Saat menambah dinas baru atau melengkapi dinas yang masih pakai fallback:

- [ ] Baca file `dinas/<nama>.md` di folder ini untuk spec lengkap
- [ ] Buat `<Dinas>CivicModal.tsx` dengan form field sesuai tipe interaksi
- [ ] Definisikan `<Dinas>Details` interface di `src/types/order.types.ts`
- [ ] Buat `Gov<Dinas>Workspace.tsx` dengan tab yang relevan untuk petugas
- [ ] Daftarkan modal di `src/app/(customer)/services/more/page.tsx`
- [ ] Daftarkan workspace di `src/app/(government)/gov/page.tsx`
- [ ] Hapus dinas dari fallback `GovOpdModularWorkspace` exclude list
- [ ] Update `firestore.rules` jika ada sub-collection spesifik dinas
- [ ] Test dengan persona sandbox yang sesuai di Super Admin
