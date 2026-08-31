# DP3APM (gov_dp3a) — Blueprint Operasional

**additionalRole**: `gov_dp3a`
**Status Implementasi**: ✅ Form ada | ✅ Workspace ada | ⚠️ Phase 2 gaps KRITIKAL
**PRIORITAS**: 🔴 HIGH — Layanan Privasi-First (SAPA 129)
**Tipe Interaksi**: Kelompok F — Privasi-First / Emergency Sosial

---

## Profil Dinas

| Atribut | Data |
|---------|------|
| Nama Lengkap | Dinas Pemberdayaan Perempuan, Perlindungan Anak, dan Pemberdayaan Masyarakat |
| Layanan Utama | SAPA 129 — Sahabat Perempuan dan Anak |
| Telepon Layanan | 129 (hotline nasional) / (0271) 712-567 |
| Lokasi | Gedung Pemkot Surakarta, Jl. Jendral Sudirman |
| Jam Operasional | 24 jam (hotline) / Hari Kerja (konseling) |
| Avatar/Emoji | 🛡️ |
| Warna Tema | Purple (`text-purple-500`, `bg-purple-500/10`) |

---

## Arsitektur Saat Ini

```
Form Customer:
  src/components/civic/forms/dp3a/Dp3aSapa129Form.tsx  ✅ (ada, ⚠️ anonim mode belum)

Workspace Admin:
  src/components/government/workspaces/dp3a/Dp3aWorkspace.tsx  ✅ (ada, ⚠️ data exposed)

Routing:
  CivicFormDispatcher.tsx → if (serviceId.includes("dp3a") || serviceId.includes("sapa"))
  GovWorkspaceDispatcher.tsx → case "gov_dp3a"
```

---

## Layanan yang Tersedia

### 1. `dp3a_hotline_sapa_129` — Laporan Kekerasan Darurat

- **Sifat**: Semi-darurat — perlu respons dalam 1x24 jam
- **WAJIB Mode Anonim**: Default aktif, semua identitas terlindungi
- **Status awal**: `"pending_verification"` (petugas perlu kategorisasi kasus)
- **Privasi**: Data kasus TIDAK boleh exposed tanpa aksi verifikasi identitas di workspace

### 2. `dp3a_konseling_puspaga` — Booking Sesi Konseling

- **Sifat**: Non-darurat, booking jadwal
- **Mode Anonim**: Opsional (default OFF untuk konseling reguler)
- **Status awal**: `"pending_verification"` (konfirmasi slot tersedia)

---

## Phase 2 — Dp3aSapa129Form.tsx (UPGRADE KRITIKAL)

Tambahkan Mode Anonim toggle — ini adalah fitur WAJIB per AGENTS.md:

```typescript
// ⚠️ Phase 2 KRITIKAL — Tambahkan ini di Dp3aSapa129Form.tsx

// State baru:
const [isAnonymous, setIsAnonymous] = useState(true); // Default ANONIM!
const [jenisKasus, setJenisKasus] = useState("kdrt");
const [butuhPendampingan, setButuhPendampingan] = useState(false);

// Import Switch dari shadcn:
import { Switch } from "@/components/ui/switch";

// Tambah toggle PALING ATAS form (sebelum semua input):
<div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-2xl border border-purple-200/60 dark:border-purple-800/40">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-xs font-bold text-purple-700 dark:text-purple-300">🛡️ Mode Anonim</p>
      <p className="text-[11px] text-purple-600 dark:text-purple-400">
        Identitas Anda terlindungi sepenuhnya. Hanya kode kasus yang tersimpan.
      </p>
    </div>
    <Switch
      checked={isAnonymous}
      onCheckedChange={setIsAnonymous}
    />
  </div>
  {isAnonymous && (
    <p className="text-[10px] text-purple-500 mt-1.5">
      Kode laporan Anda: Pemohon-{randomCode} (dibuat otomatis)
    </p>
  )}
</div>

// Field nama jadi kondisional:
{!isAnonymous && (
  <CivicTextField
    label="Nama Lengkap (Opsional jika tidak anonim)"
    value={reporterName}
    onChange={setReporterName}
    ...
  />
)}

// jenisKasus — ubah dari teks bebas ke dropdown dengan enum:
<CivicSelectField
  label="Jenis Kasus / Kekerasan"
  value={jenisKasus}
  onChange={setJenisKasus}
  options={[
    "Kekerasan Dalam Rumah Tangga (KDRT)",
    "Kekerasan Seksual",
    "Perdagangan Orang (Trafficking)",
    "Kekerasan terhadap Anak",
    "Penelantaran",
    "Butuh Perlindungan Fisik Segera"
  ]}
/>

// Di handleSubmit:
const randomCode = Math.floor(1000 + Math.random() * 9000);
const effectiveName = isAnonymous
  ? `Pemohon-${randomCode}`
  : (reporterName || `Pemohon-${randomCode}`);

// citizenDetails yang disimpan:
citizenDetails: {
  serviceId: service.id,
  serviceName: service.name,
  isAnonymous,           // ← WAJIB ada!
  namaAtauKode: effectiveName,  // "Pemohon-XXXX" atau nama asli
  jenisKasus,            // ← Ubah dari sapaCaseCategory
  lokasiAman: address,   // Lokasi SEKARANG (bukan alamat rumah)
  butuhPendampingan,     // ← Tambahkan
  // safeContact: safeContact, ← Simpan di field terpisah (hanya untuk petugas)
  submittedAt: new Date().toISOString()
}
```

---

## Phase 2 — Dp3aWorkspace.tsx (UPGRADE KRITIKAL)

Data masking — semua identitas HARUS tersembunyi by default:

```typescript
// ⚠️ Phase 2 KRITIKAL — Tambahkan ini di Dp3aWorkspace.tsx

// Helper masking:
const maskName = (name: string | undefined) => {
  if (!name) return "—";
  if (name.startsWith("Pemohon-")) return name; // Sudah anonim
  // Untuk nama asli yang tidak anonim:
  return `${name.charAt(0)}${"*".repeat(name.length - 2)}${name.charAt(name.length - 1)}`;
};

const maskPhone = (phone: string | undefined) => {
  if (!phone) return "—";
  return `${phone.slice(0, 4)}****${phone.slice(-3)}`;
};

// Di render order card — SELALU gunakan masking:
const details = (order.citizenDetails || {}) as any;
const displayName = maskName(details.namaAtauKode);  // JANGAN tampilkan langsung!
const isAnon = details.isAnonymous;

// Tombol "Lihat Identitas" — hanya muncul jika !isAnonymous:
const [revealedOrderIds, setRevealedOrderIds] = useState<string[]>([]);
const isRevealed = revealedOrderIds.includes(order.id || "");

{!isAnon && (
  <button
    onClick={() => setRevealedOrderIds(prev => [...prev, order.id!])}
    className="text-xs text-purple-600 underline"
  >
    {isRevealed ? details.namaAtauKode : "Klik untuk lihat identitas"}
  </button>
)}

// Tab workspace yang direkomendasikan:
// Tab 1: "Kasus Aktif" — semua yang perlu penanganan
// Tab 2: "Jadwal Konseling" — booking Puspaga
// Tab 3: "Selesai Ditangani"
```

---

## citizenDetails Interface

```typescript
// Lihat DATA_CONTRACTS_EXTENDED.md → Dp3aDetails
interface Dp3aDetails {
  serviceId: string;
  serviceName: string;
  isAnonymous: boolean;       // WAJIB ada — Phase 2
  namaAtauKode: string;       // "Pemohon-XXXX" atau nama asli
  jenisKasus?: "kdrt" | "kekerasan_seksual" | "perdagangan_orang" | "kekerasan_anak" | "penelantaran" | "darurat_perlindungan";
  lokasiAman?: string;
  butuhPendampingan?: boolean;
  jenisKonseling?: "pernikahan" | "pola_asuh" | "trauma" | "remaja" | "lansia";
  jadwalKonseling?: string;
  // Penanganan (diisi petugas):
  psikologPenanganan?: string;
  statusPenanganan?: "aman" | "dalam_pendampingan" | "butuh_perlindungan_fisik";
  submittedAt: string;
}
```

---

## Catatan Keamanan Khusus

> ⚠️ **WAJIB DIBACA** sebelum mengubah kode DP3A:
>
> 1. **Jangan pernah expose** `lokasiAman` di workspace tanpa konfirmasi
> 2. **Audit log akses**: Idealnya setiap akses ke detail kasus dicatat (Phase 3)
> 3. **Export/Print data kasus**: DILARANG tanpa autentikasi ulang (Phase 3)
> 4. **Data rentention**: Kasus DP3A disimpan minimum 1 tahun di Firestore
