# Dinas Pemadam Kebakaran & Penyelamatan Surakarta — Blueprint Operasional

**additionalRole**: `gov_damkar`
**Status Implementasi**: ✅ Form ada | ✅ Workspace ada | ⚠️ Phase 2 gaps
**PRIORITAS**: 🔴 HIGH — Layanan Darurat
**Tipe Interaksi**: Kelompok E — Emergency / Darurat

---

## Profil Dinas

| Atribut | Data |
|---------|------|
| Nama Lengkap | Dinas Pemadam Kebakaran dan Penyelamatan Kota Surakarta |
| Telepon Darurat | (0271) 7630133 / 113 |
| Pos Utama | Jl. Brigjend Slamet Riyadi No. 445, Solo |
| Pos Cabang | Pos Jebres, Pos Banjarsari, Pos Pasar Kliwon |
| Jam Operasional | 24 jam / 7 hari |
| Avatar/Emoji | 🚒 |
| Warna Tema | Rose (`text-rose-500`, `bg-rose-500/10`) |

---

## Arsitektur Saat Ini (Setelah Refactor)

```
Form Customer:
  src/components/civic/forms/damkar/DamkarPanicDispatchForm.tsx  ✅ (ada, ⚠️ GPS belum)
  src/components/civic/forms/damkar/DamkarAnimalRescueForm.tsx   ❌ (belum dibuat - Phase 2)

Workspace Admin:
  src/components/government/workspaces/damkar/DamkarWorkspace.tsx ✅ (ada, ⚠️ audio alert belum)

Routing:
  CivicFormDispatcher.tsx → if (serviceId.includes("damkar") || serviceId.includes("panic"))
  GovWorkspaceDispatcher.tsx → case "gov_damkar"

Customer page:
  /services/gov/gov_damkar/[serviceId] → isolated per sub-layanan
```

---

## Layanan yang Tersedia

### 1. `damkar_panic_button` — Tombol Darurat Kebakaran (PANIC GPS)

- **Sifat**: EMERGENCY — **WAJIB skip `pending_verification`** → langsung `"pending"`
- **SLA**: Respons dalam 5 menit sejak submit
- **Status awal**: `"pending"` (BUKAN `"pending_verification"`)
- **Form**: Ultra ringkas — GPS auto-detect + jenis darurat + konfirmasi alamat

### 2. `damkar_animal_rescue` — Animal Rescue & Evakuasi Non-Api

- **Sifat**: Non-darurat, bisa dijadwalkan
- **SLA**: Respons dalam 2 jam (bukan emergency)
- **Status awal**: `"pending_verification"` (perlu koordinasi jadwal)
- **Form**: Jenis rescue + lokasi + deskripsi + pilih jadwal

---

## Phase 2 — DamkarPanicDispatchForm.tsx (UPGRADE)

Tambahkan GPS auto-detect dan field yang kurang:

```typescript
// ⚠️ Phase 2 — Tambahkan ini di DamkarPanicDispatchForm.tsx

const [gpsLat, setGpsLat] = useState<number | null>(null);
const [gpsLng, setGpsLng] = useState<number | null>(null);
const [gpsStatus, setGpsStatus] = useState<"idle" | "detecting" | "found" | "error">("idle");
const [jenisDarurat, setJenisDarurat] = useState("kebakaran");
const [tingkatKeparahan, setTingkatKeparahan] = useState("besar");

// Di useEffect saat komponen mount — auto-detect GPS:
useEffect(() => {
  setGpsStatus("detecting");
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLat(pos.coords.latitude);
        setGpsLng(pos.coords.longitude);
        setGpsStatus("found");
      },
      () => setGpsStatus("error"),
      { timeout: 8000, enableHighAccuracy: true }
    );
  } else {
    setGpsStatus("error");
  }
}, []);

// GPS Status Banner di UI:
{gpsStatus === "detecting" && <p>📡 Mendeteksi lokasi GPS Anda...</p>}
{gpsStatus === "found" && <p className="text-emerald-600">✅ Lokasi GPS berhasil dideteksi</p>}
{gpsStatus === "error" && <p className="text-amber-600">⚠️ GPS tidak tersedia, isi alamat manual</p>}

// Tombol klik untuk call darurat:
<a href="tel:02717630133" className="block text-center p-2 rounded-xl border border-red-300 text-red-600 text-sm font-bold">
  📞 Hubungi Damkar: 0271-7630133
</a>

// Di citizenDetails yang disimpan ke Firestore:
citizenDetails: {
  serviceId: service.id,
  serviceName: service.name,
  gpsLat,            // ← Tambahkan
  gpsLng,            // ← Tambahkan
  jenisDarurat,      // ← Tambahkan (ganti emergencyCategory dengan enum)
  tingkatKeparahan,  // ← Tambahkan
  alamatManual: emergencyAddress,
  reporterName,
  kontakWa: phone,
  submittedAt: new Date().toISOString()
}

// Status initial HARUS "pending" (skip verifikasi) — ubah di useCivicOrder atau form:
// requiresOtp: false (sudah benar)
// Pastikan useCivicOrder mendukung override status awal untuk emergency
```

## Phase 2 — DamkarAnimalRescueForm.tsx (BUAT BARU)

```typescript
// src/components/civic/forms/damkar/DamkarAnimalRescueForm.tsx
// Buat form terpisah untuk animal rescue (bukan emergency)

const jenisRescueOptions = [
  "Sarang Tawon / Vespa Agresif",
  "Ular Berbisa Masuk Rumah",
  "Hewan Terjebak / Terperangkap",
  "Cincin / Benda Terjepit (non-medis)",
  "Lainnya (Jelaskan di keterangan)"
];

// citizenDetails:
{
  serviceId: "damkar_animal_rescue",
  jenisRescue: selectedJenisRescue,
  lokasiRescue: address,
  deskripsiDetail: description,
  waktuPilihan: preferredTime, // Opsional — bisa segera atau pilih jadwal
  kontakWa: phone
}

// Daftarkan di CivicFormDispatcher.tsx:
if (serviceId === "damkar_animal_rescue") {
  return <DamkarAnimalRescueForm ... />;
}
// PENTING: Taruh SEBELUM catch-all damkar condition:
// if (serviceId.includes("damkar") || serviceId.includes("panic"))
```

---

## Phase 2 — DamkarWorkspace.tsx (UPGRADE)

Tambahkan audio alert dan badge elapsed time:

```typescript
// ⚠️ Phase 2 — Tambahkan ke DamkarWorkspace.tsx
import { playOrderAlertSound } from "@/lib/sound";

const previousOrderCountRef = useRef(0);

useEffect(() => {
  const currentPending = orders.filter(o =>
    o.status === "pending" &&
    (o.serviceType?.includes("damkar") || o.serviceType?.includes("panic"))
  );
  if (currentPending.length > previousOrderCountRef.current && previousOrderCountRef.current !== 0) {
    playOrderAlertSound(); // 🔊 Bunyi alert saat laporan baru!
  }
  previousOrderCountRef.current = currentPending.length;
}, [orders]);

// Badge elapsed time per order:
const getElapsedMinutes = (createdAt: any) => {
  const created = createdAt?.toDate ? createdAt.toDate() : new Date(createdAt);
  return Math.floor((Date.now() - created.getTime()) / 60000);
};

// Di render order:
const elapsed = getElapsedMinutes(order.createdAt);
<span className={`text-xs font-black ${elapsed > 5 ? "text-red-600 animate-pulse" : "text-emerald-600"}`}>
  {elapsed} menit lalu {elapsed > 5 && "⚠️ LEWAT SLA!"}
</span>

// Tab triage:
// - Tab "Aktif Darurat" (panic_button dengan badge merah)
// - Tab "Animal Rescue" (animal_rescue)
// - Tab "Riwayat" (completed)
```

---

## citizenDetails Interface

```typescript
// Lihat DATA_CONTRACTS_EXTENDED.md → DamkarDetails
interface DamkarDetails {
  serviceId: string;
  serviceName: string;
  gpsLat?: number;               // ← Phase 2: wajib auto-detect
  gpsLng?: number;
  alamatManual: string;
  jenisDarurat?: "kebakaran" | "ledakan" | "orang_terjebak" | "gas_bocor"; // ← Phase 2
  tingkatKeparahan?: "besar" | "sedang" | "kecil"; // ← Phase 2
  jenisRescue?: string;          // Hanya untuk animal_rescue
  reporterName?: string;
  kontakWa: string;
  submittedAt: string;
  // Response data (diisi petugas di workspace):
  responseTimeMinutes?: number;
  petugasDispatch?: string;
}
```
