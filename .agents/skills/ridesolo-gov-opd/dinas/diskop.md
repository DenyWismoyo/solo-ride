# Dinas Koperasi dan UKM Surakarta (gov_diskop) — Blueprint Operasional

**additionalRole**: `gov_diskop`
**Status Implementasi**: ? 2 Form ada | ? Workspace ada | ?? Phase 2 gaps
**Tipe Interaksi**: Kelompok I — Usaha/Legalitas UMKM

---

## Arsitektur Saat Ini

```
Form Customer:
  src/components/civic/forms/diskop/DiskopLegalitasNibForm.tsx  ?
  src/components/civic/forms/diskop/DiskopDanaBergulirForm.tsx  ?

Workspace Admin:
  src/components/government/workspaces/diskop/ param($m) $m.Groups[1].Value.ToUpper() + $m.Groups[2].Value Workspace.tsx  ?

Routing:
  CivicFormDispatcher.tsx ? routing per serviceId ke form yang sesuai
  GovWorkspaceDispatcher.tsx ? case "gov_diskop"
  Customer page: /services/gov/gov_diskop/[serviceId]
```

---

## Phase 2 Gaps

Tambah omzetBulananEstimasi (number input opsional) di NIB form; tambah agunanYangDimiliki di Dana Bergulir form; workspace: tambah SHU Dashboard panel

---

## citizenDetails Interface

Lihat `DATA_CONTRACTS_EXTENDED.md` untuk interface lengkap dinas ini.