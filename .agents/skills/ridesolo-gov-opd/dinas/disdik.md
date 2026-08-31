# Dinas Pendidikan Surakarta (gov_disdik) — Blueprint Operasional

**additionalRole**: `gov_disdik`
**Status Implementasi**: ? 1 Form ada | ? Workspace ada | ?? Phase 2 gaps
**Tipe Interaksi**: Kelompok A — Delivery/Antar Dokumen

---

## Arsitektur Saat Ini

```
Form Customer:
  src/components/civic/forms/disdik/DisdikAntarSekolahForm.tsx  ?

Workspace Admin:
  src/components/government/workspaces/disdik/ param($m) $m.Groups[1].Value.ToUpper() + $m.Groups[2].Value Workspace.tsx  ?

Routing:
  CivicFormDispatcher.tsx ? routing per serviceId ke form yang sesuai
  GovWorkspaceDispatcher.tsx ? case "gov_disdik"
  Customer page: /services/gov/gov_disdik/[serviceId]
```

---

## Phase 2 Gaps

Buat DisdikAntarIjazahForm.tsx (namaAlumnus, NISN 10 digit, asalSekolah, jenisLegalisir dropdown, jumlahDokumen); tambah catatanKhusus field di form antar sekolah; workspace: filter per jam berangkat pagi vs siang

---

## citizenDetails Interface

Lihat `DATA_CONTRACTS_EXTENDED.md` untuk interface lengkap dinas ini.