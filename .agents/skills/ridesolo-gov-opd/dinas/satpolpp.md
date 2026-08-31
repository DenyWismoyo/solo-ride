# Satuan Polisi Pamong Praja Surakarta (gov_satpolpp) — Blueprint Operasional

**additionalRole**: `gov_satpolpp`
**Status Implementasi**: ? 1 Form ada | ? Workspace ada | ?? Phase 2 gaps
**Tipe Interaksi**: Kelompok D — Pengaduan/Trantib

---

## Arsitektur Saat Ini

```
Form Customer:
  src/components/civic/forms/satpolpp/SatpolppTrantibForm.tsx  ?

Workspace Admin:
  src/components/government/workspaces/satpolpp/ param($m) $m.Groups[1].Value.ToUpper() + $m.Groups[2].Value Workspace.tsx  ?

Routing:
  CivicFormDispatcher.tsx ? routing per serviceId ke form yang sesuai
  GovWorkspaceDispatcher.tsx ? case "gov_satpolpp"
  Customer page: /services/gov/gov_satpolpp/[serviceId]
```

---

## Phase 2 Gaps

Tambah rt (2 digit), rw (2 digit), kelurahan, kecamatan dropdown; tambah field kondisional untuk jenisGangguan === 'izin_acara' (namaAcara, estimasiPeserta, tanggalAcara); workspace: tab Laporan Trantib vs Izin Keramaian terpisah

---

## citizenDetails Interface

Lihat `DATA_CONTRACTS_EXTENDED.md` untuk interface lengkap dinas ini.