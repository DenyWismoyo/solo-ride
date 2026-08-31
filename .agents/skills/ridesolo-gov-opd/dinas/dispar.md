# Dinas Pariwisata Surakarta (gov_dispar) — Blueprint Operasional

**additionalRole**: `gov_dispar`
**Status Implementasi**: ? 1 Form ada | ? Workspace ada | ?? Phase 2 gaps
**Tipe Interaksi**: Kelompok H — Booking/Reservasi

---

## Arsitektur Saat Ini

```
Form Customer:
  src/components/civic/forms/dispar/DisparHeritageTourForm.tsx  ?

Workspace Admin:
  src/components/government/workspaces/dispar/ param($m) $m.Groups[1].Value.ToUpper() + $m.Groups[2].Value Workspace.tsx  ?

Routing:
  CivicFormDispatcher.tsx ? routing per serviceId ke form yang sesuai
  GovWorkspaceDispatcher.tsx ? case "gov_dispar"
  Customer page: /services/gov/gov_dispar/[serviceId]
```

---

## Phase 2 Gaps

Ubah destinasiDipilih dari single select menjadi multi-select checkbox (destinasi heritage bisa dipilih >1); tambah Event Calendar di workspace

---

## citizenDetails Interface

Lihat `DATA_CONTRACTS_EXTENDED.md` untuk interface lengkap dinas ini.