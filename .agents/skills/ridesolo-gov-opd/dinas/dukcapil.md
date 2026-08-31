# Disdukcapil Surakarta (gov_dukcapil) — Blueprint Operasional

**additionalRole**: `gov_dukcapil`
**Status Implementasi**: ✅ 3 Form ada | ✅ Workspace ada (paling lengkap) | ⚠️ Phase 2 gap minor
**Tipe Interaksi**: Kelompok A — Delivery/Antar Dokumen

---

## Profil Dinas

| Atribut | Data |
|---------|------|
| Nama Lengkap | Dinas Kependudukan dan Pencatatan Sipil Kota Surakarta |
| Alamat | Jl. Jenderal Sudirman No. 2, Surakarta |
| Telepon | (0271) 648585 |
| Jam Layanan | Senin–Jumat 08.00–15.30 WIB |
| Emoji | 🪪 |
| Warna Tema | Blue (`text-blue-500`, `bg-blue-500/10`) |

---

## Arsitektur Saat Ini

```
Form Customer:
  src/components/civic/forms/dukcapil/DukcapilAntarKtpForm.tsx       ✅
  src/components/civic/forms/dukcapil/DukcapilKiaAkteForm.tsx         ✅
  src/components/civic/forms/dukcapil/DukcapilMobilePerekamanForm.tsx ✅

Workspace Admin:
  src/components/government/workspaces/dukcapil/DukcapilWorkspace.tsx ✅ (3 tabs + OTP)

Routing:
  CivicFormDispatcher.tsx:
    "dukcapil_antar_ktp"         → DukcapilAntarKtpForm
    "dukcapil_kia_akte"          → DukcapilKiaAkteForm
    "dukcapil_mobile_perekaman"  → DukcapilMobilePerekamanForm
  GovWorkspaceDispatcher.tsx → case "gov_dukcapil"
  Customer page: /services/gov/gov_dukcapil/[serviceId]
```

---

## Layanan yang Tersedia

1. `dukcapil_antar_ktp` — Antar KTP-el/KK ke rumah warga
2. `dukcapil_kia_akte` — Antar KIA/Akta Kelahiran/Kematian
3. `dukcapil_mobile_perekaman` — Jemput bola perekaman lansia/difabel

Status awal semua: `"pending_verification"` → petugas verifikasi NIK → `"pending"` → driver dispatch
OTP serah terima: WAJIB (`requiresOtp: true`)

---

## Phase 2 Gaps

```typescript
// ⚠️ 1. Validasi NIK Solo — tambahkan di semua form Dukcapil:
const isValidNIKSolo = (nik: string) =>
  nik.length === 16 && nik.startsWith("3372") && /^\d+$/.test(nik);

// Tampilkan error jika NIK tidak valid:
{nik.length === 16 && !isValidNIKSolo(nik) && (
  <p className="text-xs text-rose-500">NIK tidak sesuai wilayah Kota Surakarta (3372xxxxxxxxxx)</p>
)}

// ⚠️ 2. Field kecamatanAsal — tambahkan di semua form:
const KECAMATAN_SOLO = ["Laweyan", "Serengan", "Pasar Kliwon", "Jebres", "Banjarsari"];
<CivicSelectField
  label="Kecamatan Domisili"
  value={kecamatan}
  onChange={setKecamatan}
  options={KECAMATAN_SOLO}
/>

// ⚠️ 3. Workspace — tambahkan tombol "Tolak" dengan input alasan:
const handleReject = async (orderId: string, reason: string) => {
  await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
    status: "rejected",
    rejectionReason: reason,
    updatedAt: serverTimestamp()
  });
};
```

---

## citizenDetails Interface

Lihat `DATA_CONTRACTS_EXTENDED.md` → `DukcapilDetails`
