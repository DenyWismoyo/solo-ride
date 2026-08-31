# Dinas Kesehatan Surakarta (gov_dinkes) — Blueprint Operasional

**additionalRole**: `gov_dinkes`
**Status Implementasi**: ? 3 Form ada | ? Workspace ada | ?? Phase 2 gaps
**Tipe Interaksi**: Kelompok B — Antar Farmasi/Medis

---

## Arsitektur Saat Ini

```
Form Customer:
  src/components/civic/forms/dinkes/DinkesResepObatForm.tsx  ?
  src/components/civic/forms/dinkes/DinkesProlanisForm.tsx  ?
  src/components/civic/forms/dinkes/DinkesDonorDarahForm.tsx  ?

Workspace Admin:
  src/components/government/workspaces/dinkes/ param($m) $m.Groups[1].Value.ToUpper() + $m.Groups[2].Value Workspace.tsx  ?

Routing:
  CivicFormDispatcher.tsx ? routing per serviceId ke form yang sesuai
  GovWorkspaceDispatcher.tsx ? case "gov_dinkes"
  Customer page: /services/gov/gov_dinkes/[serviceId]
```

---

## Phase 2 Gaps

Tambah noBpjs dan catatanAlergi di form resep & prolanis; flag obatSudahDisiapkan di workspace; donor darah treat semi-emergency (status pending langsung)

---

## citizenDetails Interface

Lihat `DATA_CONTRACTS_EXTENDED.md` untuk interface lengkap dinas ini.