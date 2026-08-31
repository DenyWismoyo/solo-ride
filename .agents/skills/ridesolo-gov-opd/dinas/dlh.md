# DLH (gov_dlh) — Blueprint Operasional

**additionalRole**: `gov_dlh`
**Status Implementasi**: ✅ 2 Form ada | ✅ Workspace ada | ⚠️ Phase 2 gaps
**PRIORITAS**: 🟡 MEDIUM — Eco Points System
**Tipe Interaksi**: Kelompok D — Pengaduan/Laporan + Jemput Fisik

---

## Profil Dinas

| Atribut | Data |
|---------|------|
| Nama Lengkap | Dinas Lingkungan Hidup Kota Surakarta |
| Telepon | (0271) 714-488 |
| Alamat | Jl. Jendral Urip Sumoharjo No. 5, Solo |
| Jam Operasional | Senin–Jumat 08.00–16.00 |
| Avatar/Emoji | 🌿 |
| Warna Tema | Teal (`text-teal-500`, `bg-teal-500/10`) |

---

## Arsitektur Saat Ini

```
Form Customer:
  src/components/civic/forms/dlh/DlhBankSampahForm.tsx    ✅ (ada, ⚠️ multi-select belum)
  src/components/civic/forms/dlh/DlhLaporPohonForm.tsx    ✅ (ada, sudah cukup)

Workspace Admin:
  src/components/government/workspaces/dlh/DlhWorkspace.tsx  ✅ (ada, ⚠️ eco points belum)

Routing:
  CivicFormDispatcher.tsx:
    if (serviceId === "dlh_jemput_sampah_daur_ulang" || serviceId.includes("sampah")) → DlhBankSampahForm
    if (serviceId === "dlh_lapor_pohon_tumbang" || serviceId.includes("pohon")) → DlhLaporPohonForm
  GovWorkspaceDispatcher.tsx → case "gov_dlh"
```

---

## Layanan yang Tersedia

### 1. `dlh_jemput_sampah_daur_ulang` — Jemput Sampah Bank Sampah

- **Status awal**: `"pending_verification"` (petugas DLH assign jadwal driver)
- **Flow khusus**: Setelah selesai, petugas input **berat aktual** → trigger **Eco Points** ke customer

### 2. `dlh_lapor_pohon_tumbang` — Lapor Pohon Berbahaya

- **Status awal**: `"pending_verification"` → `"in_progress"` (tanpa driver, tim lapangan langsung)
- **SLA**: Urgensi tinggi dalam 1x24 jam, normal dalam 3 hari kerja

---

## Phase 2 — DlhBankSampahForm.tsx (UPGRADE)

Tambahkan multi-select jenis sampah dan estimasi berat:

```typescript
// ⚠️ Phase 2 — Tambahkan ini di DlhBankSampahForm.tsx

// State baru:
const [jenisSampahDipilih, setJenisSampahDipilih] = useState<string[]>([]);
const [estimasiBeratKg, setEstimasiBeratKg] = useState<number>(5);

// Data pilihan jenis sampah:
const JENIS_SAMPAH_OPTIONS = [
  { id: "kardus", label: "Kardus / Karton", emoji: "📦" },
  { id: "plastik", label: "Plastik (Botol, Ember)", emoji: "♻️" },
  { id: "besi", label: "Besi / Logam", emoji: "⚙️" },
  { id: "kaca", label: "Kaca / Botol Beling", emoji: "🍶" },
  { id: "jelantah", label: "Minyak Jelantah", emoji: "🛢️" },
  { id: "kertas", label: "Kertas / Koran", emoji: "📰" },
];

// Komponen multi-select checkbox (inline — belum ada di CivicFormControls):
<div className="space-y-1.5">
  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
    Jenis Sampah yang Disetor (pilih semua yang relevan)
  </label>
  <div className="grid grid-cols-2 gap-1.5">
    {JENIS_SAMPAH_OPTIONS.map(jenis => (
      <button
        key={jenis.id}
        type="button"
        onClick={() => setJenisSampahDipilih(prev =>
          prev.includes(jenis.id)
            ? prev.filter(j => j !== jenis.id)
            : [...prev, jenis.id]
        )}
        className={`p-2 rounded-xl text-xs font-medium border transition-all ${
          jenisSampahDipilih.includes(jenis.id)
            ? "bg-teal-500/15 border-teal-500/50 text-teal-700 dark:text-teal-300"
            : "bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400"
        }`}
      >
        {jenis.emoji} {jenis.label}
      </button>
    ))}
  </div>
</div>

// Estimasi berat — number input:
<div className="space-y-1">
  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
    Estimasi Total Berat (kg)
  </label>
  <div className="flex items-center gap-2">
    <input
      type="number"
      min={1} max={500}
      value={estimasiBeratKg}
      onChange={e => setEstimasiBeratKg(Number(e.target.value))}
      className="w-24 h-8 px-3 rounded-xl border text-sm ..."
    />
    <span className="text-xs text-slate-500">kg (estimasi, min 1kg)</span>
  </div>
</div>

// Eco Points preview (motivasi customer):
const estimatedPoints = jenisSampahDipilih.length > 0
  ? Math.floor(estimasiBeratKg * 200) // Estimasi kasar
  : 0;
{estimatedPoints > 0 && (
  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
    <p className="text-xs text-amber-700 dark:text-amber-300">
      🌱 Estimasi Eco Points: ~{estimatedPoints.toLocaleString()} poin
      (dikonfirmasi setelah ditimbang)
    </p>
  </div>
)}

// citizenDetails yang disimpan:
citizenDetails: {
  serviceId: service.id,
  jenisSampah: jenisSampahDipilih,    // ← array of string
  estimasiBeratKg,                    // ← number
  jadwalJemput: preferredDate,
  rwBankSampah: selectedRW,
  // ...
}
```

---

## Phase 2 — DlhWorkspace.tsx (UPGRADE)

Tambahkan Eco Points calculator setelah verifikasi berat:

```typescript
// ⚠️ Phase 2 — Tambahkan Eco Points feature di DlhWorkspace.tsx
import { doc, updateDoc, increment, serverTimestamp } from "firebase/firestore";

const ECO_POINTS_PER_KG: Record<string, number> = {
  kardus: 200, plastik: 150, besi: 500, kaca: 100, jelantah: 300, kertas: 150
};

const calculateEcoPoints = (jenisSampah: string[], beratKg: number): number => {
  if (!jenisSampah.length) return Math.floor(beratKg * 150); // Default rate
  const primaryRate = ECO_POINTS_PER_KG[jenisSampah[0]] || 150;
  return Math.floor(beratKg * primaryRate);
};

// Di workspace — after approve, tampilkan input berat aktual:
const [beratAktual, setBeratAktual] = useState<number>(0);

const handleCompleteWithEcoPoints = async (order: OrderDocument) => {
  const points = calculateEcoPoints(
    (order.citizenDetails as any)?.jenisSampah || [],
    beratAktual
  );
  // 1. Update order
  await updateDoc(doc(db, COLLECTIONS.ORDERS, order.id!), {
    status: "completed",
    "citizenDetails.beratAktualKg": beratAktual,
    "citizenDetails.ecoPointsAwarded": points,
    completedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  // 2. Award eco points ke customer
  await updateDoc(doc(db, "users", order.customerId), {
    points: increment(points)
  });
  alert(`✅ Selesai! ${points.toLocaleString()} Eco Points diberikan ke customer.`);
};
```

---

## citizenDetails Interface

```typescript
// Lihat DATA_CONTRACTS_EXTENDED.md → DlhDetails
interface DlhDetails {
  serviceId: string;
  jenisSampah?: string[];        // ⚠️ Phase 2 — multi-select
  estimasiBeratKg?: number;      // ⚠️ Phase 2 — number input
  jadwalJemput?: string;
  rwBankSampah?: string;
  // Lapor pohon:
  lokasiPohon?: string;
  kondisiPohon?: "miring_berbahaya" | "sudah_tumbang" | "butuh_perantingan" | "menghalangi_kabel";
  tingkatUrgensi?: "segera" | "normal";
  // Hasil (diisi petugas):
  beratAktualKg?: number;
  ecoPointsAwarded?: number;
  namaPemohon: string;
  kontakWa: string;
  submittedAt: string;
}
```
