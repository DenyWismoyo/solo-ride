# BPBD (gov_bpbd) — Blueprint Operasional

**additionalRole**: `gov_bpbd`
**Status Implementasi**: ✅ Form ada | ✅ Workspace ada | ⚠️ Phase 2 gaps signifikan
**PRIORITAS**: 🔴 HIGH — Layanan Kebencanaan
**Tipe Interaksi**: Kelompok E — Darurat/Emergency (semi)

---

## Profil Dinas

| Atribut | Data |
|---------|------|
| Nama Lengkap | Badan Penanggulangan Bencana Daerah Kota Surakarta |
| Telepon | (0271) 716-450 |
| Pos Komando | Jl. Honggowongso No. 38, Solo |
| Sungai Utama | Bengawan Solo (level: -7.5695, 110.8285) |
| Jam Operasional | 24 jam siaga |
| Avatar/Emoji | 🌊 |
| Warna Tema | Blue (`text-blue-500`, `bg-blue-500/10`) |

---

## Arsitektur Saat Ini

```
Form Customer:
  src/components/civic/forms/bpbd/BpbdLaporBanjirForm.tsx  ✅ (ada, ⚠️ perlu upgrade)

Workspace Admin:
  src/components/government/workspaces/bpbd/BpbdWorkspace.tsx  ✅ (ada, ⚠️ EWS belum)

Routing:
  CivicFormDispatcher.tsx → if (serviceId.includes("bpbd") || serviceId.includes("banjir"))
  GovWorkspaceDispatcher.tsx → case "gov_bpbd"
```

---

## Layanan yang Tersedia

### 1. `bpbd_cek_ews` — Cek Status EWS Bengawan Solo

- **Sifat**: Informasi saja — tampilkan status siaga sungai (tanpa form)
- **Tidak perlu submit order** — halaman info statis dengan level siaga real-time

### 2. `bpbd_bantuan_darurat` — Permohonan Bantuan Darurat Bencana

- **Status awal**: `"pending"` (skip verifikasi — darurat!)
- **Multi-select**: Jenis bantuan yang diminta (tenda/selimut/sembako/dll)
- **GPS**: Opsional tapi sangat membantu untuk koordinasi tim

---

## Phase 2 — BpbdLaporBanjirForm.tsx (UPGRADE SIGNIFIKAN)

Tambahkan mode toggle EWS vs Bantuan + multi-select bantuanDiminta:

```typescript
// ⚠️ Phase 2 — Refactor BpbdLaporBanjirForm.tsx

// State baru:
const [mode, setMode] = useState<"ews" | "bantuan">("ews");
const [levelSiaga, setLevelSiaga] = useState("siaga_3");
const [bantuanDipilih, setBantuanDipilih] = useState<string[]>([]);

// Panel EWS Info (jika mode === "ews"):
const EWS_STATUS_DATA = [
  { sungai: "Bengawan Solo", level: "Normal", siaga: "Siaga 4", color: "emerald" },
  { sungai: "Kali Pepe", level: "Waspada", siaga: "Siaga 3", color: "amber" },
  { sungai: "Kali Jenes", level: "Normal", siaga: "Siaga 4", color: "emerald" },
];

// Mode toggle di atas form:
<div className="flex p-1 gap-1 bg-slate-100 dark:bg-zinc-800 rounded-2xl">
  <button onClick={() => setMode("ews")}
    className={mode === "ews" ? "flex-1 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold" : "..."}
  >
    📊 Cek Status Siaga Sungai
  </button>
  <button onClick={() => setMode("bantuan")}
    className={mode === "bantuan" ? "flex-1 py-2 rounded-xl bg-orange-600 text-white text-xs font-bold" : "..."}
  >
    🆘 Minta Bantuan Darurat
  </button>
</div>

// Mode EWS — tampilkan info tanpa form:
{mode === "ews" && (
  <div className="space-y-2">
    {EWS_STATUS_DATA.map(({ sungai, level, siaga, color }) => (
      <div key={sungai} className={`p-3 rounded-xl bg-${color}-500/10 border border-${color}-500/30`}>
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold">{sungai}</span>
          <span className={`text-xs font-black text-${color}-600`}>{siaga} ({level})</span>
        </div>
      </div>
    ))}
    <p className="text-xs text-slate-500 text-center">
      Data diperbarui dari BBWS Bengawan Solo
    </p>
  </div>
)}

// Mode Bantuan — tampilkan form lengkap:
{mode === "bantuan" && (
  <>
    {/* Field levelSiaga */}
    <CivicSelectField
      label="Level Siaga Lokasi Anda"
      value={levelSiaga}
      onChange={setLevelSiaga}
      options={["Siaga 1 (Sangat Berbahaya)", "Siaga 2 (Bahaya)", "Siaga 3 (Waspada)", "Siaga 4 (Normal/Aman)"]}
    />

    {/* Multi-select bantuan yang diminta */}
    <div className="space-y-1.5">
      <label className="text-xs font-semibold">Bantuan yang Diminta (pilih semua)</label>
      <div className="grid grid-cols-2 gap-1.5">
        {BANTUAN_OPTIONS.map(b => (
          <button key={b.id} type="button"
            onClick={() => setBantuanDipilih(prev =>
              prev.includes(b.id) ? prev.filter(x => x !== b.id) : [...prev, b.id]
            )}
            className={`p-2 rounded-xl text-xs font-medium border transition-all ${
              bantuanDipilih.includes(b.id)
                ? "bg-blue-500/15 border-blue-500/50 text-blue-700"
                : "bg-slate-50 dark:bg-zinc-800 border-slate-200"
            }`}
          >
            {b.emoji} {b.label}
          </button>
        ))}
      </div>
    </div>

    {/* Submit */}
  </>
)}

const BANTUAN_OPTIONS = [
  { id: "tenda_darurat", label: "Tenda Darurat", emoji: "⛺" },
  { id: "selimut", label: "Selimut", emoji: "🛏️" },
  { id: "sembako", label: "Sembako Darurat", emoji: "🛒" },
  { id: "perahu_karet", label: "Perahu Karet", emoji: "🚤" },
  { id: "evakuasi_medis", label: "Evakuasi Medis", emoji: "🏥" },
  { id: "air_bersih", label: "Air Bersih", emoji: "💧" },
];
```

---

## Phase 2 — BpbdWorkspace.tsx (UPGRADE)

Tambahkan EWS Dashboard + Logistik Inventory:

```typescript
// ⚠️ Phase 2 — BpbdWorkspace.tsx

// Tab baru: EWS Dashboard (default active)
const EWS_PANEL = (
  <div className="space-y-3">
    <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30">
      <h3 className="text-sm font-bold text-blue-700 mb-2">Status Siaga Sungai Surakarta</h3>
      {EWS_STATUS_DATA.map(({ sungai, level, siaga, color }) => (
        <div key={sungai} className={`flex justify-between p-2 rounded-xl mb-1.5 bg-${color}-500/10`}>
          <span className="text-xs font-medium">{sungai}</span>
          <span className={`text-xs font-black text-${color}-600`}>{siaga}</span>
        </div>
      ))}
    </div>

    {/* Logistik Inventory */}
    <div className="grid grid-cols-2 gap-2">
      {LOGISTIK_STOK.map(item => (
        <div key={item.id} className={`p-3 rounded-xl text-center ${
          item.stok <= item.threshold ? "bg-red-500/10 border border-red-500/30" : "bg-slate-100 dark:bg-zinc-800"
        }`}>
          <p className="text-[10px] font-bold uppercase text-slate-500">{item.label}</p>
          <p className={`text-lg font-black ${item.stok <= item.threshold ? "text-red-600" : "text-slate-900"}`}>
            {item.stok}
          </p>
          {item.stok <= item.threshold && (
            <p className="text-[9px] text-red-500 font-bold">STOK MENIPIS!</p>
          )}
        </div>
      ))}
    </div>
  </div>
);

const LOGISTIK_STOK = [
  { id: "tenda", label: "Tenda Darurat", stok: 45, threshold: 10 },
  { id: "selimut", label: "Selimut", stok: 200, threshold: 50 },
  { id: "air", label: "Air (dus)", stok: 150, threshold: 30 },
  { id: "sembako", label: "Sembako Paket", stok: 80, threshold: 20 },
];
```
