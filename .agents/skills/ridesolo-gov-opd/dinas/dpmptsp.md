# DPMPTSP Surakarta (MPP) (gov_dpmptsp) — Blueprint Operasional

**additionalRole**: `gov_dpmptsp`
**Status Implementasi**: ? 1 Form ada | ? Workspace ada | ?? Phase 2 gaps
**Tipe Interaksi**: Kelompok I — Usaha/Legalitas

---

## Arsitektur Saat Ini

```
Form Customer:
  src/components/civic/forms/dpmptsp/DpmptspMppIzinForm.tsx  ?

Workspace Admin:
  src/components/government/workspaces/dpmptsp/ param($m) $m.Groups[1].Value.ToUpper() + $m.Groups[2].Value Workspace.tsx  ?

Routing:
  CivicFormDispatcher.tsx ? routing per serviceId ke form yang sesuai
  GovWorkspaceDispatcher.tsx ? case "gov_dpmptsp"
  Customer page: /services/gov/gov_dpmptsp/[serviceId]
```

---

## Phase 2 Gaps

Tambah nomorRegistrasiMPP text input (wajib, format MPP-XXXXXX); ubah jenisIzin jadi dropdown enum (nib/imb_pbg/situ/siup/hak_bangunan/lainnya); workspace: toggle skSudahDisiapkan sebelum dispatch driver

---

## citizenDetails Interface

Lihat `DATA_CONTRACTS_EXTENDED.md` untuk interface lengkap dinas ini.