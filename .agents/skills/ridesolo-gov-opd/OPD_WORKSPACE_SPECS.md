# Spesifikasi Workspace OPD (Sisi Petugas Dinas) — Ride-Solo Phase 2

> **ARSITEKTUR SAAT INI**: Setiap dinas memiliki workspace di
> `src/components/government/workspaces/<dinas>/<Dinas>Workspace.tsx`
> Di-dispatch oleh `GovWorkspaceDispatcher.tsx` via switch-case `dinasId`.
>
> Format anotasi: ✅ Sudah ada | ⚠️ Phase 2 gap | ❌ Belum ada

---

## Prinsip Desain Workspace OPD

### 3 Pilar Setiap Workspace

```
1. TRIAGE PANEL     → Daftar permohonan masuk, filter berdasarkan status
2. ACTION PANEL     → Tools untuk memverifikasi, setujui, tolak permohonan
3. ANALYTICS PANEL  → Statistik layanan dinas (metrik bento grid di atas)
```

### Tab Standar Workspace

```typescript
type WorkspaceTab =
  | "triage"       // WAJIB: Permohonan masuk yang butuh tindakan
  | "inprogress"   // WAJIB: Permohonan yang sedang diproses/driver sedang bertugas
  | "completed"    // WAJIB: Riwayat selesai
  | "features"     // Opsional: Fitur khusus dinas
  | "reports"      // Opsional: Laporan & statistik
```

### Props Standard

```typescript
interface GovWorkspaceProps {
  orders: OrderDocument[];
  loading: boolean;
}
```

### Status Handling Standard

```typescript
// Semua workspace menggunakan siklus status yang sama:
"pending_verification" → "pending" → "accepted" → "in_progress" → "completed"
//     ↑                     ↑
//  Masuk dari     Petugas OPD approve → masuk radar driver
//  form customer

// Aksi tombol Approve di workspace:
const handleApprove = async (orderId: string) => {
  await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
    status: "pending", // Masuk radar driver!
    verifiedByDinasAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
};

// Aksi tombol Tolak di workspace:
const handleReject = async (orderId: string, reason: string) => {
  await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
    status: "rejected",
    rejectionReason: reason,
    updatedAt: serverTimestamp()
  });
};
```

---

## Spesifikasi Per Dinas

---

### Dukcapil Workspace ✅ Paling Lengkap (Jadikan Template)

File: `src/components/government/workspaces/dukcapil/DukcapilWorkspace.tsx`

Tab yang ada:
- ✅ **Pending Verification**: Verifikasi NIK dan jenis dokumen
- ✅ **Dispatched/Kurir Bergerak**: Monitor pengiriman aktif
- ✅ **Completed/Selesai OTP**: Log dokumen selesai diantarkan

Aksi yang tersedia per permohonan:
- ✅ Verifikasi NIK + jenis dokumen
- ✅ Setujui & dispatch ke driver (`status → "pending"`)
- ✅ OTP serah terima monitoring

**Phase 2 Gap:**
```typescript
// ⚠️ Belum ada tombol "Tolak" dengan field alasan penolakan
// ⚠️ Belum ada filter per kecamatan
```

---

### Dinkes Workspace ✅ Sudah Ada

File: `src/components/government/workspaces/dinkes/DinkesWorkspace.tsx`

Tab yang ada:
- ✅ Triage Resep (pending_verification)
- ✅ In Progress (driver bergerak)
- ✅ Completed

**Phase 2 Gap:**
```typescript
// ⚠️ Tambah tab "Prolanis Monitor" khusus pasien lansia rutin
// ⚠️ Tambah flag "Obat Sudah Disiapkan Farmasi" sebelum dispatch driver
//    - Petugas farmasi harus centang checkbox ini dulu
//    - Status intermediate: "ready_for_dispatch" (opsional)
// ⚠️ Priority badge merah untuk donor_darah (PMI emergency)
```

---

### Dinsos Workspace ✅ Sudah Ada (Tabs Difabel/Bansos/Bencana)

File: `src/components/government/workspaces/dinsos/DinsosWorkspace.tsx`

Tab yang ada:
- ✅ Tab Difabel & Lansia
- ✅ Tab Klaim Bansos Sembako
- ✅ Tab Logistik Bencana Tagana

**Phase 2 Gap:**
```typescript
// ⚠️ Tab Bansos: tambah verifikasi PKH/KKS
//    - Cek nomor kartu PKH valid (format dari Kemensos)
//    - Tandai "Terverifikasi DTKS" sebelum dispatch
// ⚠️ Tab Difabel: tambah filter driver ramah difabel
//    (saat ini driver dipilih random dari pool tersedia)
```

---

### Diskop Workspace ✅ Sudah Ada

File: `src/components/government/workspaces/diskop/DiskopWorkspace.tsx`

**Phase 2 Gap:**
```typescript
// ⚠️ Tambah tab "SHU Dashboard" yang tampilkan:
//    - Total poin koperasi yang terkumpul
//    - Estimasi dividen SHU per anggota
//    - Grafik pertumbuhan UMKM mitra per bulan
```

---

### Dispar Workspace ✅ Sudah Ada

File: `src/components/government/workspaces/dispar/DisparWorkspace.tsx`

**Phase 2 Gap:**
```typescript
// ⚠️ Tambah "Event Calendar" view — kalender bulanan event budaya Solo
// ⚠️ Tambah "Guide Roster" — daftar pemandu aktif yang available
```

---

### Dishub Workspace ✅ Sudah Ada

File: `src/components/government/workspaces/dishub/DishubWorkspace.tsx`

**Phase 2 Gap:**
```typescript
// ⚠️ Tambah view peta untuk laporan lalin (cluster per kelurahan)
// ⚠️ Tab KIR Queue: estimasi waktu antrian per slot
```

---

### Bapenda Workspace ✅ Sudah Ada

File: `src/components/government/workspaces/bapenda/BapendaWorkspace.tsx`

**Phase 2 Gap:**
```typescript
// ⚠️ Jika BapendaRetribusiPasarForm dan BapendaKonsultasiPajakForm dibuat (Phase 2),
//    tambahkan tab di workspace:
//    - Tab "Retribusi Pasar": antrian pembayaran kios
//    - Tab "Konsultasi Pajak": jadwal sesi konsultasi
```

---

### Damkar Workspace ⚠️ BUTUH UPGRADE SIGNIFIKAN (Prioritas P1)

File: `src/components/government/workspaces/damkar/DamkarWorkspace.tsx`

Status saat ini: ✅ Ada, tapi minimal (hanya list order + 1 tombol resolve)

**Phase 2 Gaps KRITIKAL:**

```typescript
// ⚠️ 1. AUDIO ALERT — WAJIB! (lihat Aturan 7 di SKILL.md)
import { playOrderAlertSound } from "@/lib/sound";
const previousOrderCount = useRef(0);

useEffect(() => {
  const newOrders = orders.filter(o =>
    o.status === "pending" &&
    o.serviceType?.includes("damkar") &&
    o.createdAt // Hanya order baru
  );
  if (newOrders.length > 0 && previousOrderCount.current < orders.length) {
    playOrderAlertSound(); // Bunyi alert saat laporan panic baru masuk
  }
  previousOrderCount.current = orders.length;
}, [orders]);

// ⚠️ 2. PETA KOORDINAT — tampilkan lokasi panic di peta mini
// Gunakan data gpsLat/gpsLng dari citizenDetails order
// Tampilkan sebagai embeddable Google Maps link atau StaticMap

// ⚠️ 3. TABS: Pisahkan Darurat vs Animal Rescue vs Riwayat
// Tab "DARURAT AKTIF" — badge merah berkedip, waktu elapsed
// Tab "Animal Rescue" — laporan non-api
// Tab "Riwayat" — log penanganan + response time

// ⚠️ 4. BADGE WAKTU ELAPSED — tampilkan sudah berapa menit sejak laporan
const elapsedMinutes = Math.floor(
  (Date.now() - order.createdAt.toDate().getTime()) / 60000
);
// Badge merah berkedip jika elapsed > 5 menit (melewati SLA)

// ⚠️ 5. RESPONSE TIME METRICS — tampilkan di bento grid:
// - Laporan aktif yang belum ditangani
// - Rata-rata response time hari ini
// - Armada siaga di Mako (hardcoded sementara)
```

---

### BPBD Workspace ⚠️ Butuh Upgrade

File: `src/components/government/workspaces/bpbd/BpbdWorkspace.tsx`

**Phase 2 Gaps:**

```typescript
// ⚠️ 1. EWS DASHBOARD — Tab utama berisi status siaga sungai
// Tampilkan panel info statis (Phase 2 — data real dari BBWS Phase 3):
const EWS_STATUS = {
  bengawanSolo: { level: "Normal", status: "Siaga 4" },
  kaliPepe: { level: "Waspada", status: "Siaga 3" },
  kaliJenes: { level: "Normal", status: "Siaga 4" },
};

// UI: card berwarna per level (hijau/kuning/oranye/merah)

// ⚠️ 2. LOGISTIK INVENTORY — bisa hardcoded Phase 2:
const LOGISTIK_STOK = {
  tendaDarurat: { stok: 45, threshold: 10 },
  selimut: { stok: 200, threshold: 50 },
  airMineralDus: { stok: 150, threshold: 30 },
  sembakoDarurat: { stok: 80, threshold: 20 },
};
// Alert visual jika stok < threshold

// ⚠️ 3. Tab "Permintaan Bantuan" — triage lokasi terdampak
// Tampilkan bantuanDiminta[] dari citizenDetails sebagai badge list
```

---

### DP3A Workspace ⚠️ BUTUH UPGRADE KRITIKAL (Privacy!)

File: `src/components/government/workspaces/dp3a/Dp3aWorkspace.tsx`

Status saat ini: ✅ Ada, tapi **identitas terbuka penuh — ini risiko privasi!**

**Phase 2 Gaps KRITIKAL:**

```typescript
// ⚠️ 1. DATA MASKING — Semua identitas harus masked by default
// Nama pelapor: tampilkan kode kasus, bukan nama asli
const displayName = (order: OrderDocument) => {
  const details = order.citizenDetails || {};
  if (details.isAnonymous) return details.reporterName; // "Pemohon-XXXX"
  return "**Klik untuk lihat**"; // Butuh aksi verifikasi identitas
};

// Nomor WA: selalu masked
const maskedPhone = (phone: string) =>
  phone ? `${phone.slice(0, 4)}****${phone.slice(-4)}` : "—";

// ⚠️ 2. Tab "Kasus Aktif" — tampilkan dengan kode kasus
// ⚠️ 3. Tab "Jadwal Konseling Puspaga" — kalender sesi psikolog
// ⚠️ 4. Aksi "Verifikasi Identitas" — reveal data asli hanya setelah konfirmasi
```

---

### DLH Workspace ⚠️ Butuh Upgrade

File: `src/components/government/workspaces/dlh/DlhWorkspace.tsx`

**Phase 2 Gaps:**

```typescript
// ⚠️ 1. ECO POINTS CALCULATOR
// Setelah verifikasi berat sampah oleh petugas DLH:
const ECO_POINTS_PER_KG: Record<string, number> = {
  kardus: 200,
  plastik: 150,
  besi: 500,
  kaca: 100,
  jelantah: 300,
  kertas: 150,
};

// Petugas input berat aktual → sistem kalkulasi poin
// Tombol "Award Eco Points" → update UserDocument.points

// ⚠️ 2. BANK SAMPAH ANALYTICS (bento metrics)
// - Total berat terkumpul bulan ini (kg)
// - Jenis sampah terbanyak
// - RW paling aktif dalam bulan ini

// ⚠️ 3. LAPORAN POHON MAP — cluster pohon berbahaya per kelurahan
// Tampilkan dengan badge urgensi (segera/normal)
```

---

### Disdik Workspace ✅ Sudah Ada

File: `src/components/government/workspaces/disdik/DisdikWorkspace.tsx`

**Phase 2 Gap:**
```typescript
// ⚠️ Jika DisdikAntarIjazahForm dibuat (Phase 2):
//    Tambah tab "Legalisir Dokumen" dengan verifikasi NISN
// ⚠️ Tab "Jemput Sekolah": filter per jam berangkat pagi vs siang
```

---

### Dispusip Workspace ⚠️ Butuh Upgrade

File: `src/components/government/workspaces/dispusip/DispusipWorkspace.tsx`

**Phase 2 Gaps:**
```typescript
// ⚠️ 1. REMINDER H-3/H-1 — Alert buku yang hampir habis masa pinjam
const getBooksNearDue = (orders: OrderDocument[]) => {
  return orders.filter(o => {
    const details = o.citizenDetails || {};
    const borrowDate = new Date(details.submittedAt);
    const durationDays = details.durasiPeminjaman || 14;
    const dueDate = new Date(borrowDate);
    dueDate.setDate(dueDate.getDate() + durationDays);
    const daysUntilDue = Math.floor((dueDate.getTime() - Date.now()) / 86400000);
    return daysUntilDue <= 3; // H-3 atau kurang
  });
};

// ⚠️ 2. Toggle "Buku Tersedia" / "Tidak Tersedia" — saat verifikasi
//    Jika tidak tersedia, bisa input nama alternatif buku
```

---

### Dispertan Workspace ✅ Sudah Ada

File: `src/components/government/workspaces/dispertan/DispertanWorkspace.tsx`

**Phase 2 Gap:**
```typescript
// ⚠️ Tambah kalender view jadwal kunjungan dokter hewan per tanggal
// ⚠️ Roster dokter hewan yang bertugas (Puskeswan aktif)
```

---

### Disnaker Workspace ✅ Sudah Ada

File: `src/components/government/workspaces/disnaker/DisnakerWorkspace.tsx`

**Phase 2 Gap:**
```typescript
// ⚠️ Tab "Pendaftaran BLK": tampilkan slot tersedia vs terisi per jurusan
// ⚠️ Tab "Pengaduan Ketenagakerjaan": triage laporan UMK/THR/PHK
```

---

### Diskominfo Workspace ⚠️ Butuh Upgrade

File: `src/components/government/workspaces/diskominfo/DiskominfoWorkspace.tsx`

**Phase 2 Gaps:**

```typescript
// ⚠️ 1. SLA TRACKER — Monitor 1x24 jam response time
const getSLAStatus = (order: OrderDocument) => {
  const createdAt = order.createdAt?.toDate();
  if (!createdAt) return "unknown";
  const elapsed = (Date.now() - createdAt.getTime()) / 3600000; // jam
  if (elapsed > 24) return "overdue";    // Melewati SLA
  if (elapsed > 18) return "warning";   // Hampir melewati SLA
  return "ontrack";
};

// Badge per order: hijau (on track) / kuning (< 6 jam lagi) / merah (overdue)
// Metrik: "Rata-rata penyelesaian: X jam" di bento grid

// ⚠️ 2. "FORWARD KE DINAS TERKAIT" — untuk aduan yang bukan kewenangan Diskominfo
// Dropdown pilih dinas tujuan → update additionalRole order
// Contoh: laporan jalan rusak → forward ke Dishub

// ⚠️ 3. Filter aduan by kategori (jalan_rusak, sampah, lampu, dll)
```

---

### Satpol PP Workspace ⚠️ Butuh Upgrade

File: `src/components/government/workspaces/satpolpp/SatpolppWorkspace.tsx`

**Phase 2 Gaps:**

```typescript
// ⚠️ 1. Tab terpisah: "Laporan Trantib" vs "Izin Keramaian"
//    Saat ini mungkin hanya 1 list campur semua jenis

// ⚠️ 2. Heatmap zona rawan (Phase 3 — butuh peta)
//    Phase 2: tampilkan tabel per kelurahan + jumlah laporan

// ⚠️ 3. Tab "Izin Keramaian" — verifikasi persyaratan:
//    Nama penyelenggara, KTP, lokasi, estimasi peserta, tanggal
//    Aksi: Setujui / Tolak / Minta Dokumen Tambahan
```

---

### DPMPTSP Workspace ✅ Sudah Ada

File: `src/components/government/workspaces/dpmptsp/DpmptspWorkspace.tsx`

**Phase 2 Gap:**
```typescript
// ⚠️ Tambah verifikasi nomorRegistrasiMPP dari citizenDetails
// ⚠️ Tab "SK Siap Antar" vs "Antrean Sedang Diproses"
// ⚠️ Statistik izin diterbitkan per bulan + jenis terbanyak
```

---

## Template Komponen Workspace Baru

```tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { OrderDocument } from "@/types/order.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";

interface GovWorkspaceProps {
  orders: OrderDocument[];
  loading: boolean;
}

export function <DinasName>Workspace({ orders, loading }: GovWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<"triage" | "inprogress" | "completed">("triage");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const pendingOrders = orders.filter(o => o.status === "pending_verification");
  const inProgressOrders = orders.filter(o => ["in_progress", "accepted", "pending"].includes(o.status));
  const completedOrders = orders.filter(o => o.status === "completed");

  const handleApprove = async (orderId: string) => {
    if (!orderId) return;
    setProcessingId(orderId);
    try {
      await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
        status: "pending",
        verifiedByDinasAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (err: any) {
      alert(`Gagal: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const currentList =
    activeTab === "triage" ? pendingOrders :
    activeTab === "inprogress" ? inProgressOrders :
    completedOrders;

  return (
    <div className="space-y-5">
      {/* Metrik Bento 4 kolom */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Isi dengan metrik relevan dinas */}
      </div>

      {/* Tab Selector */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-zinc-800/80 rounded-2xl">
        {(["triage", "inprogress", "completed"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === tab
                ? "bg-white dark:bg-zinc-700 shadow-sm text-slate-900 dark:text-white"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab === "triage" ? `Perlu Tindakan (${pendingOrders.length})` :
             tab === "inprogress" ? `Diproses (${inProgressOrders.length})` :
             `Selesai (${completedOrders.length})`}
          </button>
        ))}
      </div>

      {/* Order List */}
      {loading ? (
        <div className="p-8 text-center flex items-center justify-center gap-2 text-xs text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Memuat data...
        </div>
      ) : currentList.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800">
          Tidak ada permohonan di kategori ini.
        </div>
      ) : (
        <div className="space-y-3">
          {currentList.map(order => {
            const details = order.citizenDetails || {};
            return (
              <div key={order.id} className="p-4 rounded-2xl bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/[0.08] space-y-3">
                {/* Render detail order yang relevan dari details */}
                {activeTab === "triage" && (
                  <Button
                    size="sm"
                    onClick={() => order.id && handleApprove(order.id)}
                    disabled={processingId === order.id}
                    className="w-full h-8 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {processingId === order.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "✓ Verifikasi & Dispatch ke Driver"}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
```
