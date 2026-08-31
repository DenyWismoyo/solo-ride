# Dinas Tenaga Kerja Surakarta (gov_disnaker) — Blueprint Operasional

**additionalRole**: `gov_disnaker`
**Status Implementasi**: ? 2 Form ada | ? Workspace ada | ?? Phase 2 gaps
**Tipe Interaksi**: Kelompok A — Delivery/Antar Dokumen + Pendaftaran

---

## Arsitektur Saat Ini

```
Form Customer:
  src/components/civic/forms/disnaker/DisnakerKartuKuningForm.tsx  ?
  src/components/civic/forms/disnaker/DisnakerPelatihanBlkForm.tsx  ?

Workspace Admin:
  src/components/government/workspaces/disnaker/ param($m) $m.Groups[1].Value.ToUpper() + $m.Groups[2].Value Workspace.tsx  ?

Routing:
  CivicFormDispatcher.tsx ? routing per serviceId ke form yang sesuai
  GovWorkspaceDispatcher.tsx ? case "gov_disnaker"
  Customer page: /services/gov/gov_disnaker/[serviceId]
```

---

## Phase 2 Gaps

Tambah pendidikanTerakhir dropdown enum (SD/SMP/SMA_SMK/D1_D3/S1_ke_atas) di Kartu Kuning form; tambah bidangKeahlian text input opsional; workspace: slot kapasitas BLK per jurusan

---

## citizenDetails Interface

Lihat `DATA_CONTRACTS_EXTENDED.md` untuk interface lengkap dinas ini.