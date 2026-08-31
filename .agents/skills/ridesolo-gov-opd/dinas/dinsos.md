# Dinas Sosial Surakarta (gov_dinsos) — Blueprint Operasional

**additionalRole**: `gov_dinsos`
**Status Implementasi**: ? 3 Form ada | ? Workspace ada | ?? Phase 2 gaps
**Tipe Interaksi**: Kelompok C — Bantuan Sosial

---

## Arsitektur Saat Ini

```
Form Customer:
  src/components/civic/forms/dinsos/DinsosBansosSembakoForm.tsx  ?
  src/components/civic/forms/dinsos/DinsosOjekDifabelForm.tsx  ?
  src/components/civic/forms/dinsos/DinsosTanggapBencanaForm.tsx  ?

Workspace Admin:
  src/components/government/workspaces/dinsos/ param($m) $m.Groups[1].Value.ToUpper() + $m.Groups[2].Value Workspace.tsx  ?

Routing:
  CivicFormDispatcher.tsx ? routing per serviceId ke form yang sesuai
  GovWorkspaceDispatcher.tsx ? case "gov_dinsos"
  Customer page: /services/gov/gov_dinsos/[serviceId]
```

---

## Phase 2 Gaps

TanggapBencana: tambah multi-select kebutuhanLogistik[]; OjekDifabel: tambah field alatBantu; Bansos: tambah verifikasi terverifikasiDTKS di workspace

---

## citizenDetails Interface

Lihat `DATA_CONTRACTS_EXTENDED.md` untuk interface lengkap dinas ini.