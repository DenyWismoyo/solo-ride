# Dinas Perpustakaan dan Kearsipan Surakarta (gov_dispusip) — Blueprint Operasional

**additionalRole**: `gov_dispusip`
**Status Implementasi**: ? 1 Form ada | ? Workspace ada | ?? Phase 2 gaps
**Tipe Interaksi**: Kelompok A — Delivery/Antar Dokumen

---

## Arsitektur Saat Ini

```
Form Customer:
  src/components/civic/forms/dispusip/DispusipKurirBukuForm.tsx  ?

Workspace Admin:
  src/components/government/workspaces/dispusip/ param($m) $m.Groups[1].Value.ToUpper() + $m.Groups[2].Value Workspace.tsx  ?

Routing:
  CivicFormDispatcher.tsx ? routing per serviceId ke form yang sesuai
  GovWorkspaceDispatcher.tsx ? case "gov_dispusip"
  Customer page: /services/gov/gov_dispusip/[serviceId]
```

---

## Phase 2 Gaps

Tambah durasiPeminjaman radio button (7/14/21 hari) — saat ini mungkin text; tambah kategoriPustaka dropdown (fiksi/non-fiksi/referensi/anak-anak); workspace: H-3/H-1 due date alert + toggle buku tersedia/tidak tersedia

---

## citizenDetails Interface

Lihat `DATA_CONTRACTS_EXTENDED.md` untuk interface lengkap dinas ini.