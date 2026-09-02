---
name: ridesolo-dev
description: |
  Panduan pengembangan fitur untuk proyek Ride-Solo — Smart Civic Hub 5 Ekosistem
  yang menghubungkan Customer, Driver Mitra, UMKM, Industri B2B, dan Pemerintah/Koperasi
  dalam satu platform hyperlocal Surakarta (Solo).

  Aktifkan skill ini ketika:
  - Menambahkan fitur baru (service, hook, halaman, schema)
  - Melakukan refactoring kode yang ada
  - Mendiagnosis bug terkait Firebase/Maps
  - Merancang schema Firestore baru lintas ekosistem
  - Membangun fitur yang melibatkan integrasi lebih dari satu role

  File pendukung di folder ini:
  - ROADMAP_VISION.md  → Visi arsitektur + Phase 1-5 roadmap
  - ECOSYSTEM_ROLES.md → Feature matrix lengkap per 6 role
  - DATA_CONTRACTS.md  → Schema Firestore + cross-ecosystem integration points
  - CUSTOMER_SERVICES_BLUEPRINT.md → Pemetaan detail alur & skema ke-8 layanan warga (Customer Services)
  - GOVERNMENT_CIVIC_BLUEPRINT.md  → Panduan lengkap 7 dinas Pemkot Surakarta & modal pelayanan warga

  Skill terkait yang harus dibaca bersamaan:
  - ridesolo-functions  → Setup Firebase Cloud Functions, trigger, callable, scheduler
  - ridesolo-bizengine  → Formula engine: tarif, diskon, karcis, SHU koperasi
---

# Skill: Ride-Solo Smart Hub — Feature Development Guide

## 🌐 Visi Singkat: 5 Ekosistem dalam 1 Platform

Ride-Solo bukan sekadar aplikasi ojek — ia adalah **Smart Civic Hub** yang mengintegrasikan:

```
Customer (Warga) ←→ Driver (Mitra Koperasi) ←→ Merchant UMKM
       ↕                     ↕                      ↕
  Government/Koperasi   ←→   Industry B2B   ←→  Super Admin
```

Setiap fitur baru yang dikembangkan **harus mempertimbangkan dampaknya ke ekosistem lain**.
Baca `ECOSYSTEM_ROLES.md` untuk feature matrix lengkap dan `DATA_CONTRACTS.md` untuk
integration points antar ekosistem.

---

## Langkah Wajib Sebelum Menulis Kode

1. **Baca `AGENTS.md`** di root proyek — sumber kebenaran tunggal arsitektur
2. **Baca `ECOSYSTEM_ROLES.md`** — pastikan fitur tidak duplikasi dan sesuai role
3. **Baca `DATA_CONTRACTS.md`** — cek apakah ada cross-ecosystem data flow
4. **Identifikasi layer** yang akan diubah:
   - Data model baru? → `src/types/` dulu
   - Firebase operation? → `src/services/`
   - State reaktif / subscription? → `src/hooks/`
   - UI / tampilan? → `src/components/` atau `src/app/`
5. **Jangan skip layer** — jangan panggil Firebase dari komponen langsung

---

## Workflow Menambah Fitur Baru

### Step 1: Definisikan Types
Buat atau update file di `src/types/`. Gunakan `interface` untuk model data, `type` untuk unions:
```typescript
// src/types/order.types.ts — contoh penambahan serviceType
export type ServiceType = "ojek" | "mobil" | "kirim" | "kuliner" | "titip" | "pasar" | "mart";

export interface OrderDocument {
  // ... existing fields
  serviceType: ServiceType;        // WAJIB ada di setiap order
  merchantId?: string;             // Jika order ke merchant UMKM
  items?: OrderItem[];             // Jika order kuliner/mart
  contractId?: string;             // Jika order Industry B2B
}
```

### Step 2: Update COLLECTIONS Constant
```typescript
// src/constants/collections.ts — tambah collection baru di sini
export const COLLECTIONS = {
  USERS: "users",
  ORDERS: "orders",
  DRIVERS: "drivers",
  KARCIS: "karcis",
  MERCHANTS: "merchants",
  MENU_ITEMS: "menu_items",
  FORUM: "forum",
  WALLETS: "wallets",
  LEDGER: "ledger",
  NOTIFICATIONS: "notifications",  // Tambah jika fitur notif
  BROADCASTS: "broadcasts",         // Tambah jika fitur government broadcast
  CONTRACTS: "contracts",           // Tambah jika fitur industry B2B
  REVIEWS: "reviews",               // Tambah jika fitur rating
  STAMPS: "stamps",                 // Tambah jika fitur loyalty
  KYC_REQUESTS: "kyc_requests",     // Tambah jika fitur KYC driver
} as const;
```

### Step 3: Buat Service
Pattern object singleton — satu file, satu domain, selalu try-catch:
```typescript
// src/services/notification.service.ts — contoh service baru
import { COLLECTIONS } from "@/constants/collections";

export const notificationService = {
  sendToUser: async (userId: string, payload: NotificationPayload): Promise<void> => {
    try {
      await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), {
        ...payload,
        userId,
        isRead: false,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      throw new Error(`Gagal mengirim notifikasi: ${err}`);
    }
  },
  
  // Broadcast ke semua user dengan role tertentu
  broadcastToRole: async (role: UserRole, payload: NotificationPayload): Promise<void> => {
    try {
      await addDoc(collection(db, COLLECTIONS.BROADCASTS), {
        ...payload,
        targetRole: role,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      throw new Error(`Gagal broadcast notifikasi: ${err}`);
    }
  }
};
```

### Step 4: Buat Hook
Selalu return `{ data, loading, error }` — cleanup subscription di return function:
```typescript
// src/hooks/useNotifications.ts
export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<NotificationDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    const q = query(
      collection(db, COLLECTIONS.NOTIFICATIONS),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(20)
    );
    const unsub = onSnapshot(q,
      (snap) => {
        setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() }) as NotificationDocument));
        setLoading(false);
      },
      (err) => { setError(err); setLoading(false); }
    );
    return () => unsub();  // WAJIB cleanup!
  }, [userId]);

  return { notifications, loading, error };
}
```

### Step 5: Buat Komponen UI (SIGAP Design System)
```tsx
// Ikuti pola adaptive light/dark — JANGAN hardcode warna gelap!

// ✅ BENAR — adaptive:
<div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white">

// ❌ SALAH — hardcoded:
<div className="bg-zinc-950 text-white border-zinc-800">

// Gunakan class design system:
// .sg-card              → Card adaptive light/dark
// .sg-editorial-title   → Heading section
// .sg-text-gradient     → Gradient text aksen
// .sg-hover-lift        → Hover lift animation
// .sg-glass-panel       → Glass morphism panel
```

### Step 6: Update Firestore Rules
```
// firestore.rules — tambah rule untuk collection baru
match /notifications/{notifId} {
  allow read: if request.auth != null && resource.data.userId == request.auth.uid;
  allow create: if request.auth != null;
}
```

---

## Cross-Ecosystem Integration Rules

Saat membangun fitur yang melibatkan lebih dari satu role, ikuti pola ini:

### Pola: Order Completion Cascade
```typescript
// Saat order complete, update MULTIPLE collections:
completeOrder: async (orderId: string, driverId: string, customerId: string) => {
  const batch = writeBatch(db);
  
  // 1. Update order status
  batch.update(doc(db, COLLECTIONS.ORDERS, orderId), { status: "completed" });
  
  // 2. Award driver points
  batch.update(doc(db, COLLECTIONS.USERS, driverId), { points: increment(10) });
  
  // 3. Award customer stamp
  batch.update(doc(db, COLLECTIONS.USERS, customerId), { points: increment(5) });
  
  // 4. Notify customer
  batch.set(doc(collection(db, COLLECTIONS.NOTIFICATIONS)), {
    userId: customerId, type: "order_completed", ...
  });
  
  await batch.commit(); // Atomic — semua atau tidak sama sekali
}
```

### Pola: Flash Sale Broadcast (Merchant → Customer)
```typescript
// Merchant aktivasi Flash Sale → notif ke customer radius 2km
activateFlashSale: async (merchantId: string, discount: number) => {
  // 1. Update merchant flash sale status
  // 2. Buat broadcast di COLLECTIONS.BROADCASTS dengan geolocation
  // 3. Notif service akan pick up dan distribute ke customer dalam radius
}
```

---

## Diagnosa Bug Firebase

### Error: "Missing or insufficient permissions"
1. Cek `firestore.rules` — apakah rule sudah allow operasi tersebut?
2. Cek apakah user sudah login (`request.auth != null`)
3. Deploy ulang rules: `npx firebase-tools deploy --only firestore`

### Error: "LegacyApiNotActivatedMapError" (Google Maps)
1. Buka Google Cloud Console → API Library
2. Enable **Places API (New)** dan **Directions API**
3. Pastikan tidak menggunakan `google.maps.places.Autocomplete` (legacy)
4. Gunakan `<PlaceAutocomplete>` wrapper di `src/components/map/`

### Error: LoadScript reloaded unintentionally
- Penyebab: array `libraries` dideklarasikan di dalam komponen
- Solusi: `const MAP_LIBRARIES: ("places")[] = ["places"];` di luar komponen

### Duplikasi elemen Web Component (StrictMode)
- Penyebab: React StrictMode mount 2x di development
- Solusi: `container.innerHTML = ''` sebelum `appendChild` di `useEffect`

---

## Pola Redirect Role-Based

```typescript
const { user, userData, loading } = useAuthContext();

useEffect(() => {
  if (!loading && (!user || userData?.role !== "driver")) {
    router.push("/");
  }
}, [user, userData, loading, router]);

if (loading || !userData) return <LoadingSpinner />;
```

---

## Google Maps Constants

```typescript
// src/constants/maps.ts
export const DEFAULT_CENTER = { lat: -7.5755, lng: 110.8243 }; // Solo, Jawa Tengah
export const DEFAULT_ZOOM = 14;
export const MAP_LIBRARIES: ("places")[] = ["places"]; // Di LUAR komponen!
```

---

## Checklist Code Review

Sebelum commit, pastikan:
- [ ] Tidak ada `any` baru tanpa komentar `// @gmaps-interop`
- [ ] Semua Firestore listener di-unsubscribe di `useEffect` cleanup
- [ ] Komponen baru menggunakan `bg-white dark:bg-zinc-900` (adaptive), bukan hardcoded
- [ ] Service function punya try-catch dan throw error yang informatif
- [ ] Hook baru return `{ data, loading, error }`
- [ ] Tidak ada hardcoded string path Firestore (gunakan `COLLECTIONS.*`)
- [ ] `firestore.rules` di-update jika ada collection baru
- [ ] Fitur yang menyentuh lebih dari 1 ekosistem menggunakan `writeBatch` (atomic)
- [ ] `serviceType` selalu ada di setiap order baru yang dibuat
- [ ] Cek `ECOSYSTEM_ROLES.md` untuk memastikan fitur sesuai scope role yang tepat
- [ ] **DILARANG** menggunakan `alert()`, `confirm()`, atau `prompt()` — gunakan toast/modal dari `src/components/ui/`
- [ ] Untuk fitur laporan jalan/incident: gunakan `traffic.service.ts` + `useRoadIncidents` (jangan buat service baru)
- [ ] Firestore Security Rules tidak boleh menggunakan fallback `/{document=**}` yang terlalu permisif

---

## 🌾 Domain Separation: Pasar Murah (Civic SPHP) vs. Pasar Warga (Traditional Market)

### 1. Program Pasar Murah Pemkot (`/services/pasar-murah`)
- **Pengelola**: Dinas Perdagangan (Disdag) Surakarta & Perum BULOG KC Surakarta / Dispangtan.
- **Tujuan**: Stabilisasi Pasokan dan Harga Pangan (SPHP), pengendalian inflasi, sembako subsidi APBD.
- **Komoditas**: Beras SPHP 5kg (HET Rp 62.500), Minyakita (Rp 15.700/L), Gula Maniskita (Rp 17.000), Telur Subsidi (Rp 24.000).
- **Aturan Akses**: Wajib NIK KTP Solo, kuota maksimal 2 pack/KK/bulan (anti-tengkulak).
- **Mekanisme Luaran**: Voucher Digital Barcode QR / PIN Tebus untuk diambil di titik tebus kelurahan atau diantar Mitra Ojek (Civic Delivery).

### 2. Pasar Warga Hyperlocal (`/services/pasar`)
- **Pengelola**: 44 Pasar Tradisional Kota Surakarta (Pasar Gede, Pasar Legi, Pasar Klewer, Pasar Nusukan, Pasar Jongke, Pasar Harjodaksino, Pasar Nongko, dll.) & UMKM Pedagang Los/Kios.
- **Tujuan**: Digitalisasi pasar basah/kering dengan 0% potongan komisi untuk pedagang.
- **Komoditas**: Sayur mayur segar, bumbu dapur racikan giling, daging sapi/ayam segar harian, ikan segar, buah lokal, jajanan legendaris pasar (Dawet Telasih, Lenjongan, Brambang Asem).
- **Aturan Akses**: Terbuka untuk umum (Warga, Wisatawan, Warung Makan).
- **Mekanisme**: Keranjang multi-item per pasar + catatan belanja titipan los + pengiriman kilat driver lokal.

---

## 🛣️ Pojok Rembug Solo (Community Road Intelligence)

Fitur crowdsourced laporan kejadian jalan real-time dari warga & driver Solo.

### Stack Teknis
- **Service**: `traffic.service.ts` — submit, fetch, upvote road incidents
- **Hook**: `useRoadIncidents(filter?)` — realtime listener dengan filter (type, kecamatan, radius)
- **Types**: `src/types/traffic.types.ts` — `RoadIncidentDocument`, `IncidentType`, `IncidentStatus`
- **Komponen**: `src/components/community/` — `RoadIncidentFeed`, `RoadIncidentCard`, `CreateIncidentModal`
- **Route**: `/community` (dalam route group `(customer)`)

### Aturan Domain
```typescript
// Tipe laporan yang valid
type IncidentType = "accident" | "flood" | "traffic" | "construction" | "pothole" | "other";

// Status life-cycle laporan
type IncidentStatus = "active" | "resolved" | "duplicate";
```
- Laporan harus login untuk submit (cegah spam), tapi viewing publik
- Jangan buat koleksi Firestore baru untuk road incidents — gunakan `traffic_incidents` via `traffic.service.ts`
- Integrasi dengan DriverRadarTab untuk tampilkan incident di hotspot area driver

---

## 🏪 BizConfig Admin — Dynamic Pricing Management

Admin Super dapat mengkonfigurasi formula harga secara real-time dari `/admin/bizconfig`
tanpa perlu deploy ulang aplikasi.

### Stack Teknis
- **Firestore**: Collection `bizConfig/{configId}` dengan versioning + `updatedAt`
- **Route Admin**: `/admin/bizconfig` — `MidnightReconciliationSimulator` untuk test cron
- **Cloud Function**: `pricing.callable.ts` mengonsumsi config ini saat kalkulasi harga final
- **Komponen Admin**: `src/components/admin/` — BizConfig tab dalam admin panel

### Pola Konsumsi BizConfig
```typescript
// BENAR — Kalkulasi harga HARUS melalui Cloud Function (bukan di client)
// karena harga final adalah server-side truth untuk mencegah manipulasi
const result = await functionsService.calculatePrice({
  serviceType: "ojek",
  distanceKm: 5.2,
  surgeMultiplier: 1.0
});

// SALAH — jangan hitung harga di client langsung dari bizConfig document
const config = await getDoc(doc(db, "bizConfig", "ojek"));
const price = config.data().baseFare + distanceKm * config.data().perKmRate; // ❌
```

---

## 📢 Civic Broadcast Engine (Kanal Siaran Resmi Pemkot Terpadu)

### 1. Arsitektur Multi-Target & Kategori
- **Publisher**: `GovBroadcastTab.tsx` di Command Center `/gov` (19 Dinas OPD).
- **Target Penerima**: `all` (Semua Warga), `customer` (Pelanggan), `driver` (Mitra Ojek/Mobil), `merchant` (Mitra UMKM & Pasar Tradisional).
- **Kategori Siaran**:
  - 📢 `info` (Warta / Pengumuman Kota - Blue/Teal)
  - ⚠️ `warning` (Peringatan Rekayasa Lalin / Cuaca - Amber)
  - 🚨 `emergency` (Siaga Darurat / Bencana - Rose/Red Alert)
  - 🌾 `program` (Program Pangan Murah SPHP / Pajak / Subsidi - Emerald)

### 2. Komponen Display Standard
- **Komponen Reusable**: `CivicBroadcastBanner.tsx` (`src/components/civic/broadcast/CivicBroadcastBanner.tsx`).
- **Dashboard Integrasi**:
  - `HomeExploreTab.tsx` (Customer)
  - `DriverRadarTab.tsx` (Driver)
  - `MerchantDashboardPage` (Merchant UMKM)
- **Fitur Interaktif**: Dialog "Baca Detail Siaran", badge instansi terverifikasi, tautan langsung ke layanan terkait (`actionUrl`), dan dismissal per session.
