# Spesifikasi Workspace OPD (Sisi Petugas Dinas) — Ride-Solo

> Panduan ini mendefinisikan apa yang harus ditampilkan di setiap `Gov<Dinas>Workspace.tsx`
> kepada petugas/operator dinas saat mereka login ke platform Ride-Solo.

---

## Prinsip Desain Workspace OPD

### 3 Pilar Setiap Workspace

Setiap workspace OPD harus memiliki 3 pilar fungsional:

```
1. TRIAGE PANEL           → Daftar permohonan masuk, filter berdasarkan status
2. ACTION PANEL           → Tools untuk memverifikasi, setujui, tolak permohonan
3. ANALYTICS PANEL        → Statistik layanan dinas (opsional, per kebutuhan)
```

### Tab Standar Workspace

```typescript
type WorkspaceTab = 
  | "triage"       // WAJIB: Permohonan masuk yang butuh tindakan
  | "inprogress"   // WAJIB: Permohonan yang sedang diproses/driver sedang bertugas
  | "completed"    // WAJIB: Riwayat selesai
  | "features"     // Opsional: Fitur khusus dinas (e.g., broadcast area, EWS monitor)
  | "reports"      // Opsional: Laporan & statistik
```

### Status Handling Standard

```typescript
// Semua workspace menggunakan siklus status yang sama:
"pending_verification" → "pending" → "accepted" → "in_progress" → "completed"
//     ^                     ^
//  Masuk dari     Petugas OPD setujui → masuk radar driver
//  form customer
```

---

## Spesifikasi Per Dinas

---

### Dukcapil Workspace — ✅ SUDAH ADA `GovDukcapilWorkspace.tsx`

Tab yang ada:
- **Triage Dokumen**: Verifikasi NIK dan jenis dokumen sebelum dispatch driver
- **OTP Monitor**: Pantau kode OTP serah terima dokumen fisik
- **Riwayat Berkas**: Log dokumen yang sudah diantarkan

Aksi yang tersedia per permohonan:
- [x] Verifikasi NIK valid
- [x] Setujui dispatch ke driver
- [x] Tolak dengan keterangan
- [x] Generate OTP serah terima

---

### Dinkes Workspace — ✅ SUDAH ADA `GovDinkesWorkspace.tsx`

Tab yang ada:
- **Triage Resep**: Cek nomor rekam medis dan asal Puskesmas
- **Prolanis Monitor**: Daftar pasien lansia yang perlu obat rutin
- **PMI Kurir Darah**: Khusus dispatch darurat PMI

Aksi:
- [x] Verifikasi nomor rekam medis & BPJS
- [x] Tandai sebagai "Sudah Disiapkan Farmasi" sebelum dispatch driver
- [x] Dispatch darurat untuk kurir darah (prioritas tertinggi)

---

### Dinsos Workspace — ✅ SUDAH ADA `GovDinsosWorkspace.tsx`

Tab yang ada:
- **Bansos Queue**: Verifikasi penerima bansos
- **Difabel/Lansia**: Daftar armada khusus difabel aktif
- **Tagana Bencana**: Koordinasi logistik darurat

Aksi:
- [x] Verifikasi kelayakan penerima bansos (cek database PKH)
- [x] Alokasi driver khusus ramah difabel
- [x] Dispatch logistik bencana ke kelurahan

---

### Diskop Workspace — ✅ SUDAH ADA `GovDiskopWorkspace.tsx`

Tab yang ada:
- **NIB Pendampingan**: Jadwal kunjungan pendamping ke UMKM
- **Modal Bergulir**: Review aplikasi dana bergulir
- **SHU Dashboard**: Monitor alokasi dividen koperasi

---

### Dispar Workspace — ✅ SUDAH ADA `GovDisparWorkspace.tsx`

Tab yang ada:
- **Tour Booking**: Konfirmasi paket tour heritage
- **Event Calendar**: Kelola kalender event budaya
- **Guide Roster**: Daftar pemandu wisata aktif

---

### Dishub Workspace — ✅ SUDAH ADA `GovDishubWorkspace.tsx`

Tab yang ada:
- **Laporan Lalin**: Triage laporan dari warga dan driver
- **KIR Queue**: Antrian booking uji KIR

---

### Bapenda Workspace — ✅ SUDAH ADA `GovBapendaWorkspace.tsx`

Tab yang ada:
- **PBB Monitor**: Konfirmasi pembayaran PBB
- **Retribusi Pasar**: Monitor pembayaran retribusi kios
- **Konsultasi Queue**: Daftar sesi konsultasi pajak

---

### Damkar Workspace — ❌ HARUS DIBUAT `GovDamkarWorkspace.tsx`

**Prioritas: TINGGI** — ini layanan darurat!

Tab yang dibutuhkan:
1. **LIVE PANIC MAP** (Tab Utama — auto-selected)
   - Peta real-time koordinat panic button masuk
   - Marker animasi + sound alert saat ada laporan baru
   - Tampilkan waktu laporan (detik yang lalu)
   
2. **TRIAGE DARURAT**
   - Filter berdasarkan jenis: Kebakaran / Rescue Non-Api
   - Badge merah berkedip untuk laporan < 5 menit lalu
   - Tombol "Dispatch Pos Damkar Terdekat" + konfirmasi nama petugas

3. **RIWAYAT PENANGANAN**
   - Log semua penanganan: waktu masuk, waktu dispatch, waktu selesai
   - Kalkulasi response time rata-rata

Aksi khusus:
```typescript
// Damkar butuh notifikasi AUDIO di browser saat ada laporan baru
// Gunakan Web Audio API — jangan file audio eksternal (sesuai AGENTS.md)
import { playOrderAlertSound } from "@/lib/sound";

// Saat laporan panic masuk:
onNewPanicReport(() => {
  playOrderAlertSound(); // Alert suara
  showBrowserNotification("🔥 DARURAT: Laporan kebakaran/rescue masuk!");
});
```

---

### DLH Workspace — ❌ HARUS DIBUAT `GovDlhWorkspace.tsx`

Tab yang dibutuhkan:
1. **JEMPUT SAMPAH QUEUE**
   - List permohonan jemput sampah dengan estimasi berat
   - Clustering otomatis berdasarkan RW/kelurahan
   - Tombol "Batch Dispatch" — kirim satu driver untuk beberapa lokasi searah

2. **LAPORAN POHON**
   - Peta laporan pohon berbahaya
   - Tingkat urgensi (tumbang/miring)
   - Assign tim pemotongan

3. **BANK SAMPAH ANALYTICS**
   - Total berat sampah terkumpul bulan ini (kg)
   - Jenis sampah terbanyak
   - RW paling aktif

Fitur khusus DLH — **Eco Points Calculator**:
```typescript
// Setiap kg sampah = poin tertentu untuk warga
const ecoPointsPerKg = {
  kardus: 200,    // Rp/kg → konversi ke poin
  plastik: 150,
  besi: 500,
  kaca: 100,
  jelantah: 300,
  kertas: 150
};
// Workspace DLH bisa trigger award poin ke akun customer setelah verifikasi berat
```

---

### Disdik Workspace — ❌ HARUS DIBUAT `GovDisdikWorkspace.tsx`

Tab yang dibutuhkan:
1. **JEMPUT SEKOLAH QUEUE**
   - Daftar siswa berdasarkan sekolah dan jadwal
   - Filter: jam berangkat pagi / jam pulang siang
   - Batch dispatch berdasarkan rute yang sama

2. **LEGALISIR DOKUMEN**
   - Verifikasi NISN sebelum dispatch
   - Status dokumen: "Sudah disiapkan sekolah" sebelum driver datang

3. **ROSTER SEKOLAH**
   - Daftar sekolah mitra yang terdaftar di program

---

### Dispusip Workspace — ❌ HARUS DIBUAT `GovDispusipWorkspace.tsx`

Tab yang dibutuhkan:
1. **PERMINTAAN BUKU**
   - Verifikasi nomor kartu anggota dan ketersediaan buku
   - Toggle "Tersedia" / "Tidak Tersedia" (tawarkan alternatif)
   - Dispatch driver untuk ambil buku dari perpustakaan → antar ke pembaca

2. **BUKU AKAN KEMBALI**
   - Daftar buku yang masa pinjem hampir habis (alert H-3, H-1)
   - Kirim reminder WA otomatis ke peminjam
   - Dispatch driver jemput buku kembali

3. **KOLEKSI DIGITAL**
   - Link ke e-book yang tersedia (integrasi eksternal)

---

### Dispertan Workspace — ❌ HARUS DIBUAT `GovDispertanWorkspace.tsx`

Tab yang dibutuhkan:
1. **JADWAL KUNJUNGAN DOKTER HEWAN**
   - Kalender booking homecare per tanggal
   - Alokasi dokter hewan yang bertugas (roster Puskeswan)
   - Status kunjungan: booking / dikonfirmasi / selesai

2. **CATATAN MEDIS RINGKAS**
   - Rekam gejala + diagnosis + treatment per hewan
   - Notif vaksin ulang (H-30 sebelum jatuh tempo)

3. **GERAKAN PANGAN MURAH (GPM)**
   - Jadwal GPM keliling per kelurahan
   - Stok komoditas tersedia

---

### Disnaker Workspace — ❌ HARUS DIBUAT `GovDisnakerWorkspace.tsx`

Tab yang dibutuhkan:
1. **KARTU KUNING QUEUE**
   - Verifikasi NIK dan pendidikan terakhir
   - Dispatch driver antar kartu AK-1 ke rumah pencari kerja

2. **PENDAFTARAN BLK**
   - Daftar antrian kursus BLK per jurusan
   - Kapasitas: slot tersedia vs terisi
   - Konfirmasi pendaftaran dan kirim jadwal via WA

3. **PENGADUAN KETENAGAKERJAAN**
   - Triage laporan: UMK tidak dibayar, THR, PHK
   - Forward ke mediator ketenagakerjaan

---

### Diskominfo Workspace — ❌ HARUS DIBUAT `GovDiskominfoWorkspace.tsx`

Tab yang dibutuhkan:
1. **ULAS ADUAN TRIAGE**
   - Daftar aduan masuk dengan kategori
   - Filter: Belum ditindak / Sedang diproses / Selesai
   - Tombol "Forward ke Dinas Terkait" (bisa dispatch ke dinas lain)

2. **TRACKING SLA**
   - Monitor SLA 1x24 jam response time
   - Alert aduan yang hampir melewati SLA
   - Statistik rata-rata penyelesaian per kategori

3. **BROADCAST ANTI-HOAKS**
   - Buat siaran klarifikasi hoaks yang beredar di Solo

---

### Satpol PP Workspace — ❌ HARUS DIBUAT `GovSatpolppWorkspace.tsx`

Tab yang dibutuhkan:
1. **LAPORAN TRANTIB MAP**
   - Peta clustering laporan per kelurahan
   - Heatmap zona rawan pelanggaran
   - Dispatch tim patroli ke lokasi laporan

2. **IZIN KERAMAIAN**
   - Queue permohonan izin acara
   - Verifikasi persyaratan (KTP penyelenggara, lokasi, estimasi peserta)
   - Jadwal pengawalan petugas

3. **PATROLI LOG**
   - Riwayat patroli per hari
   - Jumlah penertiban

---

### BPBD Workspace — ❌ HARUS DIBUAT `GovBpbdWorkspace.tsx`

**Prioritas: TINGGI** — layanan bencana

Tab yang dibutuhkan:
1. **EWS DASHBOARD** (Tab Utama)
   - Status level siaga Bengawan Solo real-time (embed data BBWS)
   - Status level siaga Kali Pepe dan Kali Jenes
   - Peta titik rawan banjir Surakarta
   - Alert otomatis via broadcast saat naik ke Siaga 2

2. **PERMINTAAN BANTUAN DARURAT**
   - Triage lokasi terdampak bencana
   - Alokasi logistik dari gudang BPBD
   - Koordinasi driver untuk distribusi logistik

3. **LOGISTIK INVENTORY**
   - Stok tenda darurat, selimut, sembako
   - Alert saat stok < threshold

---

### DP3APM Workspace — ❌ HARUS DIBUAT `GovDp3aWorkspace.tsx`

> ⚠️ PRIVACY CRITICAL: Workspace ini harus lebih terbatas aksesnya

Tab yang dibutuhkan:
1. **KASUS AKTIF** (data harus terenkripsi / anonim di display)
   - Tampilkan kode kasus (bukan nama asli) kecuali petugas sudah verify identitasnya
   - Status penanganan
   - Level urgensi

2. **PENDAMPINGAN AKTIF**
   - Psikolog yang sedang menangani kasus
   - Jadwal sesi konseling Puspaga
   - Status safe house jika butuh perlindungan fisik

3. **BOOKING KONSELING PUSPAGA**
   - Kalender sesi psikolog tersedia
   - Konfirmasi booking

Aturan tambahan untuk DP3A workspace:
```typescript
// Workspace ini WAJIB memiliki audit log akses:
// Siapa yang mengakses, kapan, dari device apa
// Data kasus tidak boleh di-export/screenshot tanpa autentikasi ulang
```

---

### DPMPTSP Workspace — ❌ HARUS DIBUAT `GovDpmptspWorkspace.tsx`

Tab yang dibutuhkan:
1. **SK SIAP ANTAR**
   - Daftar SK izin usaha yang sudah terbit dan siap diantar
   - Verifikasi nomor registrasi MPP
   - Dispatch driver untuk antar SK ke kantor pemohon

2. **ANTREAN MPP DIGITAL**
   - Monitor antrean walk-in MPP hari ini
   - Estimasi waktu tunggu per loket

3. **STATISTIK PENERBITAN**
   - Jumlah izin diterbitkan per bulan
   - Jenis izin terbanyak

---

## Template Komponen Workspace Baru

Gunakan template ini sebagai starting point untuk membuat workspace baru:

```tsx
"use client";

import React, { useState } from "react";
import { OrderDocument } from "@/types/order.types";
import { SectorDefinition } from "@/constants/ecosystemSectors";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// ... import icons sesuai kebutuhan

interface Gov<DinasName>WorkspaceProps {
  orders: OrderDocument[];
  loading: boolean;
}

export function Gov<DinasName>Workspace({ orders, loading }: Gov<DinasName>WorkspaceProps) {
  const [activeTab, setActiveTab] = useState<"triage" | "inprogress" | "completed" | "features">("triage");

  const pendingOrders = orders.filter(o => o.status === "pending_verification");
  const inProgressOrders = orders.filter(o => ["in_progress", "accepted", "pending"].includes(o.status));
  const completedOrders = orders.filter(o => o.status === "completed");

  return (
    <div className="space-y-4">
      {/* Executive Metrics */}
      <div className="grid grid-cols-3 gap-3">
        <MetricCard label="Perlu Tindakan" value={pendingOrders.length} color="rose" />
        <MetricCard label="Sedang Diproses" value={inProgressOrders.length} color="amber" />
        <MetricCard label="Selesai Hari Ini" value={completedOrders.length} color="emerald" />
      </div>

      {/* Tab Selector */}
      {/* Sesuaikan tab dengan kebutuhan spesifik dinas */}

      {/* Tab Content */}
      {activeTab === "triage" && (
        <TriagePanel orders={pendingOrders} loading={loading} />
      )}
    </div>
  );
}
```
