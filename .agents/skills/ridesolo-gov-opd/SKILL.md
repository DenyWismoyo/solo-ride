---
name: ridesolo-gov-opd
description: |
  Panduan LENGKAP implementasi layanan pemerintahan (Government/OPD) untuk Ride-Solo.
  Berisi spesifikasi form customer, workspace OPD, dan aturan bisnis per DINAS spesifik.

  Aktifkan skill ini ketika:
  - Membuat atau memodifikasi Form Sub-Layanan customer untuk dinas tertentu
  - Membuat atau memodifikasi GovWorkspace (sisi OPD/petugas dinas)
  - Menambahkan sub-layanan baru ke dinas yang sudah ada
  - Menambahkan dinas baru ke ekosistem (sangat jarang — 18 dinas sudah lengkap)
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
  - ridesolo-dev → Arsitektur umum & integration patterns
  - ridesolo-functions → Firebase triggers untuk notifikasi dinas
---

# Skill: Ridesolo Government OPD — Panduan Layanan Dinas Spesifik

> **STATUS ARSITEKTUR (per 31 Agustus 2026)**
> Seluruh 18 dinas sudah memiliki form modular dan workspace. Fokus saat ini adalah
> Phase 2: melengkapi field yang masih kurang dan meningkatkan kualitas admin workspace.

---

## ⚠️ ATURAN WAJIB — Baca Sebelum Menulis Kode

### Aturan 1: Satu Sub-Layanan = Satu Form Component Spesifik

Setiap sub-layanan dinas WAJIB memiliki form component tersendiri di folder dinas:

```
Lokasi  : src/components/civic/forms/<dinas>/<Dinas><SubService>Form.tsx
Routing : CivicFormDispatcher.tsx — tambahkan case baru di sini
```

**Naming convention**: `<DinasName><SubServiceName>Form.tsx`
```
Contoh:
- DukcapilAntarKtpForm.tsx        ✅ (antar KTP-el/KK)
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
- DamkarPanicDispatchForm.tsx      ✅  ⚠️ Phase 2: butuh GPS auto-detect
- DlhBankSampahForm.tsx            ✅  ⚠️ Phase 2: butuh multi-select jenisSampah[]
- DlhLaporPohonForm.tsx            ✅
- DisdikAntarSekolahForm.tsx       ✅  ⚠️ Phase 2: tambah DisdikAntarIjazahForm
- DispusipKurirBukuForm.tsx        ✅  ⚠️ Phase 2: butuh durasiPeminjaman radio
- DisnakerKartuKuningForm.tsx      ✅  ⚠️ Phase 2: butuh pendidikanTerakhir dropdown
- DisnakerPelatihanBlkForm.tsx     ✅
- DiskominfoUlasForm.tsx           ✅  ⚠️ Phase 2: butuh kelurahan + kecamatan
- SatpolppTrantibForm.tsx          ✅  ⚠️ Phase 2: butuh RT/RW + kondisional izin acara
- DpmptspMppIzinForm.tsx           ✅  ⚠️ Phase 2: butuh nomorRegistrasiMPP
- Dp3aSapa129Form.tsx              ✅  ⚠️ Phase 2: KRITIS — tambah Mode Anonim toggle
- DispertanPuskeswanForm.tsx       ✅  ⚠️ Phase 2: butuh layananDiminta enum
- DisparHeritageTourForm.tsx       ✅  ⚠️ Phase 2: ubah destinasi jadi multi-select
- BpbdLaporBanjirForm.tsx          ✅  ⚠️ Phase 2: butuh toggle EWS vs Bantuan Darurat
```

**Cara registrasi form baru di CivicFormDispatcher.tsx:**
```typescript
// src/components/civic/forms/CivicFormDispatcher.tsx

// 1. Import
import { DisdikAntarIjazahForm } from "./disdik/DisdikAntarIjazahForm";

// 2. Tambah case di function CivicFormDispatcher:
if (serviceId === "disdik_antar_ijazah_buku") {
  return <DisdikAntarIjazahForm agency={agency} service={service} onSuccess={onSuccess} onCancel={onCancel} />;
}
```

---

### Aturan 2: Satu Dinas = Satu Workspace di Sub-Folder Dinas

```
Lokasi  : src/components/government/workspaces/<dinas>/<Dinas>Workspace.tsx
Routing : GovWorkspaceDispatcher.tsx — switch case per dinas
```

**Naming convention**: `<DinasName>Workspace.tsx` (TANPA prefix "Gov")
```
Sudah ada (18 workspace):
- DukcapilWorkspace.tsx    ✅ (paling lengkap — 3 tabs + OTP monitor)
- DinsosWorkspace.tsx      ✅ (tabs: difabel/bansos/bencana)
- DinkesWorkspace.tsx      ✅
- DiskopWorkspace.tsx      ✅
- DisparWorkspace.tsx      ✅
- DishubWorkspace.tsx      ✅
- BapendaWorkspace.tsx     ✅
- DamkarWorkspace.tsx      ✅  ⚠️ Phase 2: butuh audio alert + live panic map
- BpbdWorkspace.tsx        ✅  ⚠️ Phase 2: butuh EWS dashboard + logistik inventory
- Dp3aWorkspace.tsx        ✅  ⚠️ Phase 2: KRITIS — data masking default
- DlhWorkspace.tsx         ✅  ⚠️ Phase 2: butuh Eco Points calculator + batch dispatch
- DisdikWorkspace.tsx      ✅
- DispusipWorkspace.tsx    ✅  ⚠️ Phase 2: butuh H-3/H-1 reminder alert
- DispertanWorkspace.tsx   ✅
- DisnakerWorkspace.tsx    ✅
- DiskominfoWorkspace.tsx  ✅  ⚠️ Phase 2: butuh SLA tracker 1x24 jam
- SatpolppWorkspace.tsx    ✅  ⚠️ Phase 2: butuh tab izin acara
- DpmptspWorkspace.tsx     ✅
```

**Cara registrasi workspace baru di GovWorkspaceDispatcher.tsx:**
```typescript
// Tambah import
import { DisdikWorkspace } from "./disdik/DisdikWorkspace";

// Tambah case di switch:
case "gov_disdik":
  return <DisdikWorkspace orders={orders} loading={loading} />;
```

---

### Aturan 3: Props Standard Interface

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

## 📂 Pengelompokan 8 Tipe Interaksi OPD

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
