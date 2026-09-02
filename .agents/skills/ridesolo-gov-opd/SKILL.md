---
name: ridesolo-gov-opd
description: |
  Panduan LENGKAP implementasi layanan pemerintahan (Government/OPD) untuk Ride-Solo.
  Berisi spesifikasi form customer, workspace OPD, dan aturan bisnis per DINAS spesifik (19 Dinas Pemkot Surakarta).

  Aktifkan skill ini ketika:
  - Membuat atau memodifikasi Form Sub-Layanan customer untuk dinas tertentu
  - Membuat atau memodifikasi GovWorkspace (sisi OPD/petugas dinas)
  - Menambahkan sub-layanan baru ke dinas yang sudah ada
  - Merancang form field yang sesuai dengan layanan riil suatu dinas
  - Menentukan validasi, status flow, atau data contract untuk layanan pemerintahan
  - Mendiagnosis ketidaksesuaian form dengan kebutuhan lapangan

  File pendukung di folder ini:
  - FORM_SPECIFICATIONS.md        → Field-by-field form specs + gap Phase 2 (WAJIB BACA)
  - OPD_WORKSPACE_SPECS.md        → Panel & fitur workspace sisi petugas OPD per dinas
  - STATUS_FLOW_RULES.md          → Business rules status order per kategori dinas
  - DATA_CONTRACTS_EXTENDED.md    → TypeScript interface CitizenDetails per dinas
  - dinas/                        → 1 file per dinas, blueprint operasional lengkap

  Skill terkait yang harus dibaca bersamaan:
  - ridesolo-gov-opd-2 → Upgrade: Rejection flow, privacy masking, emergency bypass, SLA tracker
  - ridesolo-dev → Arsitektur umum & integration patterns
  - ridesolo-functions → Firebase triggers untuk notifikasi dinas
---

# Skill: Ridesolo Government OPD — Panduan Layanan Dinas Spesifik (19 Dinas)

> **STATUS ARSITEKTUR**
> Seluruh **19 dinas Pemkot Surakarta** (termasuk Dinas Perdagangan/Disdag) sudah memiliki workspace dan form modular terintegrasi.

---

## ⚠️ ATURAN WAJIB — Baca Sebelum Menulis Kode

### Aturan 1: Satu Sub-Layanan = Satu Form Component Spesifik

Setiap sub-layanan dinas WAJIB memiliki form component tersendiri di folder dinas:

```
Lokasi  : src/components/civic/forms/<dinas>/<Dinas><SubService>Form.tsx
Routing : CivicFormDispatcher.tsx — tambahkan case baru di sini
Fallback: DynamicCivicServiceForm.tsx — untuk layanan dinamis yang dibuat admin OPD di Firestore
```

**Naming convention**: `<DinasName><SubServiceName>Form.tsx`
```
Contoh:
- DukcapilAntarKtpForm.tsx        ✅ (antar KTP-el/KK + OTP)
- DukcapilKiaAkteForm.tsx          ✅ (antar KIA/Akta)
- DukcapilMobilePerekamanForm.tsx  ✅ (jemput bola lansia/difabel)
- DinkesResepObatForm.tsx          ✅
- DinkesProlanisForm.tsx           ✅
- DinkesDonorDarahForm.tsx         ✅
- DinsosBansosSembakoForm.tsx      ✅
- DinsosOjekDifabelForm.tsx        ✅
- DinsosTanggapBencanaForm.tsx     ✅
- DiskopLegalitasNibForm.tsx       ✅
- DiskopDanaBergulirForm.tsx       ✅
- DishubCfdShelterView.tsx         ✅ (informasi, bukan form)
- DishubBookingKirForm.tsx         ✅
- DishubLaporLalinForm.tsx         ✅
- BapendaPbbForm.tsx               ✅
- DamkarPanicDispatchForm.tsx      ✅ (GPS auto-detect + bypass)
- DlhBankSampahForm.tsx            ✅
- DlhLaporPohonForm.tsx            ✅
- DisdikAntarSekolahForm.tsx       ✅
- DisdikAntarIjazahForm.tsx        ✅
- DispusipKurirBukuForm.tsx        ✅
- DisnakerKartuKuningForm.tsx      ✅
- DisnakerPelatihanBlkForm.tsx     ✅
- DiskominfoUlasForm.tsx           ✅
- SatpolppTrantibForm.tsx          ✅
- DpmptspMppIzinForm.tsx           ✅
- Dp3aSapa129Form.tsx              ✅ (Mode Anonim toggle + Privacy Masking)
- DispertanPuskeswanForm.tsx       ✅
- DisparHeritageTourForm.tsx       ✅
- BpbdLaporBanjirForm.tsx          ✅
```

---

### Aturan 2: Satu Dinas = Satu Workspace di Sub-Folder Dinas

```
Lokasi  : src/components/government/workspaces/<dinas>/<Dinas>Workspace.tsx
Routing : GovWorkspaceDispatcher.tsx — switch case per dinas
```

**Naming convention**: `<DinasName>Workspace.tsx` (TANPA prefix "Gov")
```
Sudah aktif (19 workspace):
- DukcapilWorkspace.tsx    ✅ (3 tabs + OTP verification)
- DinsosWorkspace.tsx      ✅ (tabs: difabel/bansos/bencana)
- DinkesWorkspace.tsx      ✅ (tabs: resep/prolanis/donor)
- DiskopWorkspace.tsx      ✅ (tabs: nib/dana bergulir)
- DisdagWorkspace.tsx      ✅ (tabs: pasar murah SPHP / tera metrologi los)
- DisparWorkspace.tsx      ✅
- DishubWorkspace.tsx      ✅
- BapendaWorkspace.tsx     ✅
- DamkarWorkspace.tsx      ✅ (audio alert + live panic dispatch)
- BpbdWorkspace.tsx        ✅ (EWS dashboard + logistik)
- Dp3aWorkspace.tsx        ✅ (data masking default + audit trail)
- DlhWorkspace.tsx         ✅ (Eco Points calculator + batch dispatch)
- DisdikWorkspace.tsx      ✅
- DispusipWorkspace.tsx    ✅
- DispertanWorkspace.tsx   ✅
- DisnakerWorkspace.tsx    ✅
- DiskominfoWorkspace.tsx  ✅ (SLA tracker 1x24 jam)
- SatpolppWorkspace.tsx    ✅ (tab trantibum & izin acara)
- DpmptspWorkspace.tsx     ✅
```

**Cara registrasi workspace baru di GovWorkspaceDispatcher.tsx:**
```typescript
// Tambah import
import { DisdagWorkspace } from "./disdag/DisdagWorkspace";

// Tambah case di switch:
case "gov_disdag":
  return <DisdagWorkspace orders={orders} loading={loading} />;
```

---

### Aturan 3: Props Standard Interface & Feedback UI
- Form component WAJIB menggunakan `CivicSubServiceFormProps` dari `src/components/civic/forms/types.ts`.
- **DILARANG** menggunakan `alert()`, `confirm()`, atau `prompt()` — gunakan `toast.success()` / `toast.error()` dari `@/components/ui/toast`.


Semua form component WAJIB menggunakan props dari `src/components/civic/forms/types.ts`:

```typescript
// src/components/civic/forms/types.ts
export interface CivicSubServiceFormProps {
  agency: SectorDefinition;     // Data lengkap dinas (dari GOVERNMENT_SECTORS)
  service: AppService;          // Data layanan yang dipilih (dari ALL_ECOSYSTEM_SERVICES)
  onSuccess: (orderId: string, otpCode?: string) => void;
  onCancel: () => void;
}
```

Semua workspace component WAJIB menggunakan:
```typescript
interface GovWorkspaceProps {
  orders: OrderDocument[];
  loading: boolean;
}
```

---

### Aturan 4: Emergency Services → Skip Verifikasi OPD

**Ini adalah aturan BARU yang belum diimplementasikan (Phase 2 P1):**

Untuk Damkar, BPBD, dan DP3A (kategori darurat), status order harus langsung ke `"pending"` (masuk radar driver), BUKAN ke `"pending_verification"`.

```typescript
// Implementasi di src/hooks/useCivicOrder.ts atau di form submit:

const EMERGENCY_SERVICE_KEYWORDS = ["damkar", "bpbd"] as const;

const isEmergencyService = (serviceType: string): boolean =>
  EMERGENCY_SERVICE_KEYWORDS.some(kw => serviceType.includes(kw));

// Di submitOrder:
const initialStatus = isEmergencyService(serviceId)
  ? "pending"              // Langsung masuk radar driver!
  : "pending_verification"; // Normal flow — perlu verifikasi OPD dulu
```

---

### Aturan 5: Emergency Services → GPS First, Form Ringkas

Untuk kategori darurat (Damkar, BPBD), form WAJIB:
1. **Auto-detect koordinat GPS user** via `navigator.geolocation.getCurrentPosition()`
2. **Tombol submit BESAR** dengan warna merah/oranye menyala
3. **Maksimal 3-4 input field** — sisanya auto-filled dari GPS/profil
4. **Tampilkan nomor darurat** yang bisa diklik langsung (tel: link)

```typescript
// Pattern GPS auto-detect di form emergency:
const [gpsLat, setGpsLat] = useState<number | null>(null);
const [gpsLng, setGpsLng] = useState<number | null>(null);
const [gpsStatus, setGpsStatus] = useState<"detecting" | "found" | "error">("detecting");

useEffect(() => {
  if (!navigator.geolocation) {
    setGpsStatus("error");
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      setGpsLat(pos.coords.latitude);
      setGpsLng(pos.coords.longitude);
      setGpsStatus("found");
    },
    () => setGpsStatus("error"),
    { timeout: 8000, enableHighAccuracy: true }
  );
}, []);
```

---

### Aturan 6: Kerahasiaan DP3APM (Wajib Privacy-First)

Layanan `gov_dp3a` WAJIB:
1. **Toggle "Mode Anonim"** di atas form — default `true` untuk laporan kekerasan
2. **Jika Mode Anonim aktif**: nama tersimpan sebagai `"Pemohon-${Math.floor(Math.random() * 9999)}"` di citizenDetails
3. **Nomor WA** disimpan sebagai plain text di Firestore hanya karena tidak ada enkripsi sisi server saat ini — tapi UI workspace OPD HARUS menyembunyikannya dengan tanda bintang: `08****7890`
4. **Di workspace DP3A**: semua `reporterName` ditampilkan sebagai kode kasus kecuali ada aksi verifikasi identitas khusus

---

### Aturan 7: Damkar Workspace — Audio Alert Wajib

Workspace Damkar WAJIB memancarkan suara alert saat ada laporan panic baru:

```typescript
// Di DamkarWorkspace.tsx
import { playOrderAlertSound } from "@/lib/sound";

// useEffect dengan onSnapshot Firestore untuk deteksi order baru:
useEffect(() => {
  const lastCount = previousOrderCount.current;
  if (orders.length > lastCount && lastCount !== 0) {
    const newOrders = orders.slice(0, orders.length - lastCount);
    const hasPanic = newOrders.some(o =>
      o.status === "pending" && o.serviceType?.includes("damkar")
    );
    if (hasPanic) {
      playOrderAlertSound(); // Dari src/lib/sound.ts — sudah ada
    }
  }
  previousOrderCount.current = orders.length;
}, [orders]);
```

---

## 📂 Pengelompokan 10 Tipe Interaksi OPD

Gunakan ini untuk menentukan template form yang tepat:

| Tipe | Dinas | Karakteristik Form |
|------|-------|-------------------|
| **A. Delivery/Antar Dokumen** | Dukcapil, Disdik, Dispusip, Disnaker | NIK + jenis dokumen + kecamatan + OTP serah terima + **Wajib Selector Saved Address (Rumah/Kantor)** |
| **B. Antar Farmasi/Medis** | Dinkes | No. RM + asal Puskesmas + No. BPJS + catatan alergi + **Wajib Selector Saved Address** |
| **C. Bantuan Sosial** | Dinsos | Kategori difabel/lansia + jenis bansos + token PKH + **Wajib Selector Saved Address** |
| **D. Pengaduan/Laporan** | Dishub, DLH, Diskominfo, Satpol PP | Kategori + Kelurahan/RT/RW + foto opsional |
| **E. Darurat/Emergency** | Damkar, BPBD | GPS auto + tombol besar + skip pending_verification |
| **F. Privasi-First** | DP3A | Mode anonim toggle + data masking di workspace |
| **G. Transaksional/Pajak** | Bapenda | No. SPPT/NOP + jenis pajak + tahun + nominal |
| **H. Booking/Reservasi** | Dispar, Dispertan | Tanggal + jumlah + preferensi/catatan |
| **I. Usaha/Legalitas** | Diskop, DPMPTSP | Nama usaha + NIB/no. izin + jenis layanan |
| **J. Distribusi Pangan & Tera** | Disdag | NIK KTP Solo + kuota SPHP BULOG / Tera timbangan los pasar |


---

## 📋 Checklist Implementasi Form Baru (Phase 2)

Saat menambah sub-layanan baru atau memperbaiki form yang ada:

- [ ] Baca `FORM_SPECIFICATIONS.md` → cari gap Phase 2 untuk dinas tersebut
- [ ] Buat `<Dinas><SubService>Form.tsx` di folder dinas yang sesuai
- [ ] Gunakan `CivicSubServiceFormProps` dari `types.ts`
- [ ] Gunakan shared controls: `CivicTextField`, `CivicSelectField`, `CivicTextareaField`, `CivicSubmitButton` dari `@/components/civic/shared/CivicFormControls`
- [ ] Tambahkan case di `CivicFormDispatcher.tsx`
- [ ] Definisikan/update interface di `src/types/order.types.ts` atau `gov.types.ts`
- [ ] Jika emergency service: pastikan status initial = `"pending"` bukan `"pending_verification"`
- [ ] Jika delivery/dokumen: pastikan `requiresOtp: true` di `submitOrder()`
- [ ] Test dengan persona sandbox Super Admin yang sesuai

## 📋 Checklist Upgrade Workspace (Phase 2)

- [ ] Baca `OPD_WORKSPACE_SPECS.md` → cari gap fitur untuk dinas tersebut
- [ ] Pastikan 3 tab standar: Triage / In Progress / Selesai
- [ ] Pastikan aksi verify + dispatch berfungsi (`updateDoc` → status `"pending"`)
- [ ] Untuk Damkar: tambah audio alert via `playOrderAlertSound()`
- [ ] Untuk DP3A: semua identitas masked by default
- [ ] Untuk Diskominfo: tambah SLA countdown per order
- [ ] Untuk DLH: tambah Eco Points calculator setelah verifikasi berat sampah
