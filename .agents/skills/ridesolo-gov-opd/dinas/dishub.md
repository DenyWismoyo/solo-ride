# Dinas Perhubungan Surakarta (gov_dishub) — Blueprint Operasional

**additionalRole**: `gov_dishub`
**Status Implementasi**: ? 3 Form ada | ? Workspace ada | ?? Phase 2 gaps
**Tipe Interaksi**: Kelompok D — Pengaduan/Laporan

---

## Arsitektur Saat Ini

```
Form Customer:
  src/components/civic/forms/dishub/DishubLaporLalinForm.tsx  ?
  src/components/civic/forms/dishub/DishubBookingKirForm.tsx  ?
  src/components/civic/forms/dishub/DishubCfdShelterView.tsx  ?

Workspace Admin:
  src/components/government/workspaces/dishub/ param($m) $m.Groups[1].Value.ToUpper() + $m.Groups[2].Value Workspace.tsx  ?

Routing:
  CivicFormDispatcher.tsx ? routing per serviceId ke form yang sesuai
  GovWorkspaceDispatcher.tsx ? case "gov_dishub"
  Customer page: /services/gov/gov_dishub/[serviceId]
```

---

## Phase 2 Gaps

Sudah cukup lengkap. Phase 2: tambah cluster peta laporan lalin di workspace per kelurahan; estimasi waktu antrian KIR per slot

---

## citizenDetails Interface

Lihat `DATA_CONTRACTS_EXTENDED.md` untuk interface lengkap dinas ini.