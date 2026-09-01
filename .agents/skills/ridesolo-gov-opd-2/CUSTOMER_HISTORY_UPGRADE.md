# CUSTOMER_HISTORY_UPGRADE.md — Blueprint History Terstruktur

> Panduan ini mendefinisikan arsitektur baru tab "Pesanan & Aktivitas"
> agar terstruktur, informatif, dan profesional — khususnya untuk order layanan publik.

---

## Masalah Saat Ini

- Filter hanya by status (all/active/completed/cancelled)
- Order card gov hanya tampil pickup/dropoff address — tidak relevan
- Status OPD tidak human-friendly ("pending_verification" tampil mentah)
- Status "rejected" tidak tampil dengan alasan penolakan
- Tidak ada kategorisasi jenis layanan

---

## 6 Kategori History

```typescript
// src/constants/serviceCategories.ts
export type ServiceCategory =
  | "mobilitas"       // ride, car
  | "kuliner"         // food, mart
  | "pengiriman"      // send, titip
  | "layanan_publik"  // semua gov_*
  | "umkm_pasar"      // pasar
  | "industri";       // semua ind_*

export const getOrderCategory = (order: OrderDocument): ServiceCategory => {
  const type = order.serviceType || "";
  const role = (order as any).additionalRole || "";
  const targetRole = (order as any).targetRole || "";

  if (type.startsWith("gov_") || role.startsWith("gov_") || targetRole === "government")
    return "layanan_publik";
  if (role.startsWith("ind_") || targetRole === "industry")
    return "industri";
  if (["ride", "car"].includes(type)) return "mobilitas";
  if (["food", "mart"].includes(type)) return "kuliner";
  if (["send", "titip"].includes(type)) return "pengiriman";
  if (type === "pasar") return "umkm_pasar";
  return "mobilitas";
};
```

---

## Status Label OPD-Friendly

```typescript
// Gunakan untuk order kategori layanan_publik
export const GOV_STATUS_LABELS: Record<string, { label: string; color: string; desc: string }> = {
  pending_verification: {
    label: "Diverifikasi Dinas",
    color: "amber",
    desc: "Petugas dinas sedang memeriksa permohonan Anda"
  },
  pending: {
    label: "Mencari Kurir",
    color: "blue",
    desc: "Permohonan disetujui, mencari kurir mitra terdekat"
  },
  accepted: {
    label: "Kurir Bergerak",
    color: "teal",
    desc: "Kurir mitra menuju lokasi pengambilan dokumen"
  },
  in_progress: {
    label: "Sedang Diantar",
    color: "emerald",
    desc: "Kurir sedang melaksanakan layanan"
  },
  completed: {
    label: "Selesai",
    color: "emerald",
    desc: "Layanan berhasil diselesaikan"
  },
  rejected: {
    label: "Ditolak Dinas",
    color: "rose",
    desc: "Permohonan ditolak. Lihat detail untuk alasannya."
  },
  cancelled: {
    label: "Dibatalkan",
    color: "neutral",
    desc: "Permohonan dibatalkan"
  }
};
```

---

## Order Card Gov — Tampilan Baru

Untuk order kategori "layanan_publik", card WAJIB tampilkan:
- Nama dinas (dari order.agencyName)
- Nama sub-layanan (dari order.serviceTitle)
- Status dinas-friendly (dari GOV_STATUS_LABELS)
- Alasan penolakan jika status === "rejected"

```tsx
const isGovOrder = getOrderCategory(order) === "layanan_publik";

{isGovOrder ? (
  <div className="p-3 bg-indigo-500/5 dark:bg-indigo-950/20 rounded-2xl space-y-1.5">
    <div className="flex items-start gap-2">
      <span className="text-[10px] font-bold text-indigo-500 uppercase shrink-0 mt-0.5">Dinas:</span>
      <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
        {(order as any).agencyName || "Dinas Pemkot Surakarta"}
      </span>
    </div>
    <div className="flex items-start gap-2">
      <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0 mt-0.5">Layanan:</span>
      <span className="text-xs text-slate-700 dark:text-zinc-300">
        {(order as any).serviceTitle || order.serviceType}
      </span>
    </div>
    {order.status === "rejected" && (order as any).rejectionReason && (
      <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-xl mt-1">
        <p className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold leading-snug">
          Ditolak: {(order as any).rejectionReason}
        </p>
      </div>
    )}
  </div>
) : (
  // Normal card — tampilkan pickup/dropoff address
  null
)}
```

---

## OTPDisplayCard Component

Setelah customer submit form yang requiresOtp: true, tampilkan OTPDisplayCard:

```typescript
// src/components/civic/shared/OTPDisplayCard.tsx
// Props: otp: string, serviceName: string, dinasName: string, onDone: () => void
// UI Features:
// - Gradient header dengan CheckCircle icon
// - OTP besar bold font-mono tracking-[0.3em]
// - Copy button dengan feedback "Disalin!"
// - Warning card: berlaku 2 jam, hanya diserahkan setelah konfirmasi OTP
// - CTA button "Lihat Status Permohonan"
```

---

## HistoryFilterBar Component

```typescript
// src/components/history/HistoryFilterBar.tsx
// Props:
//   activeCategory: ServiceCategory | "semua"
//   onCategoryChange: (cat: ServiceCategory | "semua") => void
//   orders: OrderDocument[]  // untuk hitung count per kategori

// UI: horizontal scroll pill bar
// - "Semua (N)" pill pertama selalu ada
// - Hanya tampilkan kategori yang ada order-nya
// - Emoji + label + count badge per pill
// - Active pill: bg solid, text white
// - Inactive pill: glassmorphism + border
```

---

## Update Filter di Customer Home (page.tsx)

Di tab "orders" customer page.tsx, ganti filter pills lama dengan:

```
1. HistoryFilterBar di atas (kategori layanan)
2. Status filter pills di bawahnya (Semua / Aktif / Selesai / Batal)
3. Gabungan: filter kategori + filter status
```

Urutan filter logika:
```typescript
const filtered = customerOrders.filter(order => {
  const catMatch = activeHistoryCategory === "semua"
    || getOrderCategory(order) === activeHistoryCategory;
  const statusMatch = orderStatusFilter === "all"
    || (orderStatusFilter === "active" && !["completed","cancelled"].includes(order.status))
    || order.status === orderStatusFilter;
  return catMatch && statusMatch;
});
```
