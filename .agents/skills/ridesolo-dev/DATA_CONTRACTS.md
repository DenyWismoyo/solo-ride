# Ride-Solo: Data Contracts — Schema Firestore & Cross-Ecosystem Integration

> Dokumen ini adalah **kontrak data tunggal** antara semua ekosistem di platform Ride-Solo.
> Setiap kali ada perubahan schema Firestore, penambahan field, atau integration point baru,
> dokumen ini HARUS diperbarui terlebih dahulu sebelum kode ditulis.

---

## 📦 Collections Registry (Semua Collection Firestore)

```typescript
// src/constants/collections.ts — CANONICAL, selalu gunakan ini
export const COLLECTIONS = {
  // ── Phase 1 (Sudah Ada) ──────────────────────────
  USERS: "users",           // Semua role: customer, driver, merchant, industry, government, admin
  ORDERS: "orders",         // Transaksi ojek, kirim, kuliner, titip
  DRIVERS: "drivers",       // Status online + GPS driver realtime
  KARCIS: "karcis",         // Karcis harian flat fee driver
  MERCHANTS: "merchants",   // Profil warung UMKM
  FORUM: "forum",           // Forum komunitas driver (belum aktif)
  WALLETS: "wallets",       // Saldo dompet koperasi per user
  LEDGER: "ledger",         // Buku besar transaksi semua user

  // ── Phase 2 (Perlu Ditambahkan) ─────────────────
  MENU_ITEMS: "menu_items",        // Katalog menu per merchant
  NOTIFICATIONS: "notifications",  // Notifikasi personal per user
  BROADCASTS: "broadcasts",        // Pengumuman massal (government → semua role)
  CONTRACTS: "contracts",          // Kontrak distribusi B2B industry
  REVIEWS: "reviews",              // Rating & ulasan (customer → driver & merchant)
  STAMPS: "stamps",                // Log transaksi poin stamp loyalty

  // ── Phase 3 (Masa Depan) ────────────────────────
  KYC_REQUESTS: "kyc_requests",    // Permohonan verifikasi KTP/SIM driver
  FRAUD_REPORTS: "fraud_reports",  // Laporan aktivitas mencurigakan
  SUPPLY_ORDERS: "supply_orders",  // Order bahan baku Industry → Merchant
  GEOFENCES: "geofences",          // Konfigurasi batas wilayah kerja driver
} as const;

export type CollectionKey = keyof typeof COLLECTIONS;
```

---

## 🗂️ Schema Lengkap per Collection

### `users` (Semua Role)
```typescript
// src/types/user.types.ts
export type UserRole = "customer" | "driver" | "merchant" | "industry" | "government" | "admin";

export interface SavedAddress {
  label: string;          // "Rumah", "Kantor", "Favorit"
  address: string;
  lat: number;
  lng: number;
}

export interface UserDocument {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  phone?: string;
  address?: string;
  photoURL?: string;
  createdAt: Timestamp;

  // === Customer ===
  points?: number;               // Poin stamp loyalitas
  savedAddresses?: SavedAddress[]; // Alamat favorit tersimpan

  // === Driver ===
  isVerified?: boolean;          // KYC terverifikasi (KTP + SIM)
  karcisExpiry?: Timestamp;      // Masa berlaku karcis aktif
  preferredServices?: string[];  // ["ojek", "kirim", "kuliner"]

  // === Merchant UMKM ===
  businessName?: string;         // Nama warung
  businessCategory?: MerchantCategory;
  isOpen?: boolean;              // Status buka/tutup

  // === Industry B2B ===
  // businessName juga dipakai Industry

  // === Government ===
  institutionName?: string;      // Nama dinas/koperasi
  jurisdiction?: string;         // Kecamatan/wilayah wewenang
}
```

---

### `orders` (KRITIS — Backbone Semua Ekosistem)
```typescript
// src/types/order.types.ts
export type OrderStatus =
  | "pending"      // Menunggu driver
  | "accepted"     // Driver sudah accept
  | "in_progress"  // Driver dalam perjalanan
  | "completed"    // Selesai
  | "cancelled";   // Dibatalkan

export type PaymentMethod = "cash" | "qris" | "wallet";

// PENTING: serviceType menentukan alur order di semua ekosistem
export type ServiceType =
  | "ojek"    // Customer → Driver (antar penumpang)
  | "mobil"   // Customer → Driver (roda 4)
  | "kirim"   // Customer → Driver (paket & dokumen)
  | "kuliner" // Customer → Merchant → Driver (makanan)
  | "titip"   // Customer → Driver (titip batching)
  | "pasar"   // Customer → Merchant (flash deal)
  | "mart";   // Customer → Merchant → Driver (apotek/mart)

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  qty: number;
}

export interface LocationPoint {
  lat: number;
  lng: number;
  address: string;
}

export interface OrderDocument {
  id?: string;
  customerId: string;
  driverId: string | null;
  merchantId?: string;           // Wajib jika serviceType = kuliner/mart/pasar
  contractId?: string;           // Wajib jika serviceType = B2B (industry)

  serviceType: ServiceType;      // ← FIELD KRITIS — WAJIB di setiap order baru
  items?: OrderItem[];           // Untuk order kuliner/mart

  pickupLocation: LocationPoint;
  dropoffLocation: LocationPoint;
  price: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;       // Timestamp saat status = completed

  // Feedback
  customerRatingForDriver?: number;   // 1-5 bintang
  driverRatingForCustomer?: number;   // 1-5 bintang
  customerNote?: string;             // Catatan ke driver/merchant
}
```

---

### `drivers` (GPS Realtime Driver)
```typescript
export interface DriverDocument {
  uid: string;
  isOnline: boolean;
  location: {
    lat: number;
    lng: number;
  };
  currentOrderId?: string | null;  // Order yang sedang dikerjakan
  lastUpdated: Timestamp;
}
```

---

### `karcis` (Karcis Harian Driver)
```typescript
// src/types/payment.types.ts — sudah ada
export interface KarcisDocument {
  id?: string;
  driverId: string;
  amount: number;          // 0 = free trial, >0 = berbayar
  status: "active" | "expired" | "used";
  isFreeTrial: boolean;
  expiresAt: Timestamp;    // 24 jam setelah aktivasi
  purchasedAt: Timestamp;
}
```

---

### `menu_items` (Katalog Menu Merchant) — Phase 2
```typescript
// src/types/merchant.types.ts — perlu ditambahkan
export interface MenuItemDocument {
  id?: string;
  merchantId: string;
  name: string;
  description?: string;
  price: number;
  discountPrice?: number;   // Harga promo saat flash sale
  imageUrl?: string;
  category?: string;        // "makanan_berat", "minuman", "snack", dll
  isAvailable: boolean;
  isFlashSale: boolean;
  soldToday: number;        // Reset tiap tengah malam
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

### `notifications` (Notifikasi Personal) — Phase 2
```typescript
export type NotificationType =
  | "order_accepted"    // Driver terima order customer
  | "order_arrived"     // Driver tiba di pickup
  | "order_completed"   // Order selesai
  | "order_cancelled"   // Order dibatalkan
  | "flash_sale"        // Merchant buka flash sale di sekitar customer
  | "broadcast"         // Pengumuman dari Government
  | "karcis_expiring"   // Karcis driver hampir habis
  | "kyc_approved"      // KYC driver disetujui admin
  | "reward_earned"     // Poin stamp baru diterima;

export interface NotificationDocument {
  id?: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  relatedId?: string;    // orderId, merchantId, dll
  createdAt: Timestamp;
}
```

---

### `broadcasts` (Pengumuman Government) — Phase 2
```typescript
export type BroadcastTarget =
  | "all"          // Semua user
  | "driver"       // Semua driver
  | "customer"     // Semua customer
  | "merchant"     // Semua merchant
  | string;        // kecamatan ID (geofenced)

export interface BroadcastDocument {
  id?: string;
  authorId: string;        // uid Government/Admin yang mengirim
  institutionName: string; // Nama dinas/koperasi
  title: string;
  body: string;
  target: BroadcastTarget;
  geofence?: {             // Opsional: hanya kirim ke area tertentu
    center: { lat: number; lng: number };
    radiusKm: number;
  };
  createdAt: Timestamp;
}
```

---

### `contracts` (Kontrak Distribusi Industry) — Phase 2
```typescript
export type ContractStatus = "draft" | "active" | "completed" | "cancelled";

export interface DeliveryPoint {
  address: string;
  lat: number;
  lng: number;
  recipientName: string;
  status: "pending" | "delivered";
  deliveredAt?: Timestamp;
}

export interface ContractDocument {
  id?: string;
  industryId: string;          // uid Industry yang buat kontrak
  title: string;
  description?: string;
  assignedDriverIds: string[]; // Pool driver yang ditugaskan
  deliveryPoints: DeliveryPoint[];
  vehicleCount: number;
  status: ContractStatus;
  startDate: Timestamp;
  endDate?: Timestamp;
  totalValue: number;          // Total nilai kontrak (Rp)
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

### `reviews` (Rating & Ulasan) — Phase 2
```typescript
export type ReviewTarget = "driver" | "merchant";

export interface ReviewDocument {
  id?: string;
  orderId: string;
  reviewerId: string;    // customerId yang memberi ulasan
  targetId: string;      // driverId atau merchantId
  targetType: ReviewTarget;
  rating: number;        // 1-5 bintang
  comment?: string;
  createdAt: Timestamp;
}
```

---

### `wallets` & `ledger` (Dompet Koperasi) — Sudah Ada
```typescript
// src/types/payment.types.ts — sudah ada, perlu extend
export type LedgerTransactionType =
  | "karcis_fee"    // Debit: beli karcis
  | "top_up"        // Kredit: isi saldo
  | "payout"        // Debit: tarik dana
  | "promo_credit"  // Kredit: bonus promo
  | "shu_credit"    // Kredit: bagi hasil SHU koperasi
  | "subsidy"       // Kredit: subsidi dari pemerintah
  | "order_earning";// Kredit: pendapatan order (jika cashless)
```

---

## 🔗 Cross-Ecosystem Integration Points

### Tabel Event → Dampak Multi-Ekosistem

| Event | Siapa Trigger | Dampak ke Ekosistem Lain |
|---|---|---|
| Order `completed` | System (saat driver selesai) | Driver +10 poin; Customer +5 poin; Merchant +omset; Ledger entry |
| Flash Sale diaktifkan | Merchant | Broadcast ke customer radius 2km; `broadcasts` collection |
| KYC Approved | Super Admin | Driver `isVerified = true`; Notif ke driver |
| Karcis dibeli | Driver | Ledger debit; Koperasi catat pemasukan |
| Civic Broadcast dikirim | Government | Notif masuk ke semua user sesuai `target` role |
| Kontrak B2B dibuat | Industry | Driver pool mendapat notif assignment |
| Review diberikan | Customer | Rating merchant/driver diperbarui (aggregate) |
| Driver Go-Online | Driver | `drivers` collection diupdate; radar customer aktif |

---

### Pola Atomic Write (Gunakan `writeBatch`)

Setiap event yang menyentuh lebih dari 1 collection HARUS menggunakan `writeBatch`
agar tidak ada data yang setengah-tersimpan jika terjadi error:

```typescript
// Contoh: completeOrder — menyentuh 4 collection sekaligus
import { writeBatch, doc, collection } from "firebase/firestore";

export const orderService = {
  completeOrder: async (orderId: string, driverId: string, customerId: string): Promise<void> => {
    try {
      const batch = writeBatch(db);

      // 1. Update order status
      batch.update(doc(db, COLLECTIONS.ORDERS, orderId), {
        status: "completed",
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // 2. Driver: +10 poin
      batch.update(doc(db, COLLECTIONS.USERS, driverId), {
        points: increment(10)
      });

      // 3. Customer: +5 poin stamp
      batch.update(doc(db, COLLECTIONS.USERS, customerId), {
        points: increment(5)
      });

      // 4. Notifikasi ke customer
      batch.set(doc(collection(db, COLLECTIONS.NOTIFICATIONS)), {
        userId: customerId,
        type: "order_completed",
        title: "Pesanan Selesai!",
        body: "Anda mendapat +5 Poin Stamp. Terima kasih sudah menggunakan Ride-Solo!",
        isRead: false,
        relatedId: orderId,
        createdAt: serverTimestamp()
      });

      await batch.commit(); // Atomic!
    } catch (err) {
      throw new Error(`Gagal menyelesaikan order: ${err}`);
    }
  }
};
```

---

### Aturan Firestore Security Rules (Template)

```
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuth() { return request.auth != null; }
    function isAdmin() { return isAuth() && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin"; }
    function isOwner(uid) { return isAuth() && request.auth.uid == uid; }
    function hasRole(role) { return isAuth() && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == role; }

    // Users: baca sendiri, admin baca semua
    match /users/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow create: if isAuth();
      allow update: if isOwner(userId) || isAdmin();
    }

    // Orders: customer buat, driver/merchant/admin baca
    match /orders/{orderId} {
      allow read: if isAuth();
      allow create: if isAuth() && hasRole("customer");
      allow update: if isAuth(); // Driver accept, admin moderate
    }

    // Drivers: driver update posisinya sendiri, semua baca (untuk tracking)
    match /drivers/{driverId} {
      allow read: if isAuth();
      allow write: if isOwner(driverId) || isAdmin();
    }

    // Notifications: baca notif sendiri, system create
    match /notifications/{notifId} {
      allow read: if isAuth() && resource.data.userId == request.auth.uid;
      allow create: if isAuth();
      allow update: if isAuth() && resource.data.userId == request.auth.uid; // Tandai sudah dibaca
    }

    // Broadcasts: government/admin create, semua baca
    match /broadcasts/{broadcastId} {
      allow read: if isAuth();
      allow create: if hasRole("government") || isAdmin();
    }

    // Contracts: industry create, driver/admin baca
    match /contracts/{contractId} {
      allow read: if isAuth();
      allow create, update: if hasRole("industry") || isAdmin();
    }

    // Menu Items: merchant kelola menunya sendiri
    match /menu_items/{itemId} {
      allow read: if isAuth();
      allow write: if hasRole("merchant") && resource.data.merchantId == request.auth.uid || isAdmin();
    }

    // Wallets & Ledger: baca sendiri, hanya system yang write (via Admin SDK)
    match /wallets/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow write: if isAdmin();
    }

    match /ledger/{entryId} {
      allow read: if isAuth() && resource.data.userId == request.auth.uid;
      allow create: if isAuth();
    }
  }
}
```

---

## 📋 Checklist Integration

Sebelum menambahkan fitur lintas ekosistem:

- [ ] Schema baru sudah didefinisikan di `src/types/`
- [ ] `COLLECTIONS` constant diperbarui jika ada collection baru
- [ ] Cross-ecosystem event menggunakan `writeBatch` (atomic)
- [ ] `firestore.rules` diperbarui untuk collection baru
- [ ] Integration point ditambahkan ke tabel event di dokumen ini
- [ ] Sudah ada `onSnapshot` listener + cleanup untuk collection baru
- [ ] Notifikasi ke role lain sudah di-trigger jika event mempengaruhi mereka
