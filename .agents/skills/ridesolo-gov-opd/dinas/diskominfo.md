# Dinas Komunikasi dan Informatika Surakarta (gov_diskominfo) — Blueprint Operasional

**additionalRole**: `gov_diskominfo`
**Status Implementasi**: ? 1 Form ada | ? Workspace ada | ?? Phase 2 gaps
**Tipe Interaksi**: Kelompok D — Pengaduan/ULAS

---

## Arsitektur Saat Ini

```
Form Customer:
  src/components/civic/forms/diskominfo/DiskominfoUlasForm.tsx  ?

Workspace Admin:
  src/components/government/workspaces/diskominfo/ param($m) $m.Groups[1].Value.ToUpper() + $m.Groups[2].Value Workspace.tsx  ?

Routing:
  CivicFormDispatcher.tsx ? routing per serviceId ke form yang sesuai
  GovWorkspaceDispatcher.tsx ? case "gov_diskominfo"
  Customer page: /services/gov/gov_diskominfo/[serviceId]
```

---

## Phase 2 Gaps

Tambah judulAduan text input terpisah dari isiAduan (max 60 karakter); tambah kelurahan text dan kecamatan dropdown (5 kecamatan); karakter counter isiAduan (max 500); workspace: SLA tracker 1x24 jam per order + Forward ke Dinas fitur

---

## citizenDetails Interface

Lihat `DATA_CONTRACTS_EXTENDED.md` untuk interface lengkap dinas ini.