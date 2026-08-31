# Dinas Pertanian Surakarta (gov_dispertan) — Blueprint Operasional

**additionalRole**: `gov_dispertan`
**Status Implementasi**: ? 1 Form ada | ? Workspace ada | ?? Phase 2 gaps
**Tipe Interaksi**: Kelompok H — Booking/Reservasi (Homecare Hewan)

---

## Arsitektur Saat Ini

```
Form Customer:
  src/components/civic/forms/dispertan/DispertanPuskeswanForm.tsx  ?

Workspace Admin:
  src/components/government/workspaces/dispertan/ param($m) $m.Groups[1].Value.ToUpper() + $m.Groups[2].Value Workspace.tsx  ?

Routing:
  CivicFormDispatcher.tsx ? routing per serviceId ke form yang sesuai
  GovWorkspaceDispatcher.tsx ? case "gov_dispertan"
  Customer page: /services/gov/gov_dispertan/[serviceId]
```

---

## Phase 2 Gaps

Tambah layananDiminta dropdown enum (pemeriksaan_umum/vaksin_rabies/sterilisasi/konsultasi/grooming_medis); tambah riwayatVaksin text input opsional; tambah riwayatObat text input opsional; workspace: kalender jadwal kunjungan dokter hewan

---

## citizenDetails Interface

Lihat `DATA_CONTRACTS_EXTENDED.md` untuk interface lengkap dinas ini.