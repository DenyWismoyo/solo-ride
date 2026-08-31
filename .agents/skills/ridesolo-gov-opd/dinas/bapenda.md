# Bapenda Surakarta (gov_bapenda) — Blueprint Operasional

**additionalRole**: `gov_bapenda`
**Status Implementasi**: ? 1 Form ada | ? Workspace ada | ?? Phase 2 gaps
**Tipe Interaksi**: Kelompok F — Transaksional/Pajak

---

## Arsitektur Saat Ini

```
Form Customer:
  src/components/civic/forms/bapenda/BapendaPbbForm.tsx  ?

Workspace Admin:
  src/components/government/workspaces/bapenda/ param($m) $m.Groups[1].Value.ToUpper() + $m.Groups[2].Value Workspace.tsx  ?

Routing:
  CivicFormDispatcher.tsx ? routing per serviceId ke form yang sesuai
  GovWorkspaceDispatcher.tsx ? case "gov_bapenda"
  Customer page: /services/gov/gov_bapenda/[serviceId]
```

---

## Phase 2 Gaps

Buat BapendaRetribusiPasarForm.tsx (idKios, nama kios, tanggal, nominal); buat BapendaKonsultasiPajakForm.tsx (jenis konsultasi, nama usaha, pertanyaan, jadwal); validasi NOP format 33.71.xxx.xxx.xxx-xxxx.x

---

## citizenDetails Interface

Lihat `DATA_CONTRACTS_EXTENDED.md` untuk interface lengkap dinas ini.